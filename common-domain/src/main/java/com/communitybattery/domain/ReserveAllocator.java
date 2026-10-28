package com.communitybattery.domain;

/**
 * Pure, framework-free domain service implementing the Community Battery Reserve Priority allocation rule.
 */
public class ReserveAllocator {

    public static final double DEFAULT_MIN_SAFETY_MARGIN_KWH = 5.0;
    public static final double MAX_REASONABLE_REQUEST_KWH = 500.0;

    private final double minSafetyMarginKwh;
    private final double maxReasonableRequestKwh;

    public ReserveAllocator() {
        this(DEFAULT_MIN_SAFETY_MARGIN_KWH, MAX_REASONABLE_REQUEST_KWH);
    }

    public ReserveAllocator(double minSafetyMarginKwh, double maxReasonableRequestKwh) {
        this.minSafetyMarginKwh = minSafetyMarginKwh;
        this.maxReasonableRequestKwh = maxReasonableRequestKwh;
    }

    /**
     * Allocates discharge energy according to reserve priority policy.
     *
     * @param request the immutable allocation request inputs
     * @return the allocation decision result
     */
    public AllocationResult allocate(AllocationRequest request) {
        double requested = request.requestedKwh();
        double currentCharge = request.currentChargeKwh();
        double reserveFloor = request.reserveFloorKwh();
        double dailyCap = request.remainingMemberDailyCapKwh();

        // 1. Validation: reject <= 0, NaN, Infinite or unreasonably large values
        if (Double.isNaN(requested) || Double.isInfinite(requested) || requested <= 0.0 || requested > maxReasonableRequestKwh) {
            double reportedDenied = (Double.isNaN(requested) || Double.isInfinite(requested) || requested < 0.0) ? 0.0 : requested;
            return new AllocationResult(
                    AllocationStatus.DENIED,
                    requested,
                    0.0,
                    reportedDenied,
                    ReasonCode.INVALID_REQUEST,
                    currentCharge
            );
        }

        // 2. Member-flagged emergency without coordinator authorization
        if (request.emergency() && !request.isCoordinatorAuthorized()) {
            return new AllocationResult(
                    AllocationStatus.PENDING_COORDINATOR_REVIEW,
                    requested,
                    0.0,
                    0.0,
                    ReasonCode.PENDING_COORDINATOR_REVIEW,
                    currentCharge
            );
        }

        // 3. Coordinator-authorized emergency draw (can tap into protected reserve, down to min safety margin)
        if (request.emergency() && request.isCoordinatorAuthorized()) {
            double emergencyPool = Math.max(0.0, currentCharge - minSafetyMarginKwh);
            double granted = round(Math.min(requested, emergencyPool));
            double denied = round(requested - granted);
            double resultingCharge = round(currentCharge - granted);

            if (granted >= requested) {
                return new AllocationResult(
                        AllocationStatus.GRANTED,
                        requested,
                        granted,
                        0.0,
                        ReasonCode.NONE,
                        resultingCharge
                );
            } else if (granted > 0.0) {
                return new AllocationResult(
                        AllocationStatus.PARTIALLY_GRANTED,
                        requested,
                        granted,
                        denied,
                        ReasonCode.RESERVE_PROTECTED,
                        resultingCharge
                );
            } else {
                return new AllocationResult(
                        AllocationStatus.DENIED,
                        requested,
                        0.0,
                        requested,
                        ReasonCode.RESERVE_PROTECTED,
                        currentCharge
                );
            }
        }

        // 4. Standard non-emergency request
        double shareablePool = Math.max(0.0, currentCharge - reserveFloor);
        double effectiveDailyCap = Math.max(0.0, dailyCap);

        double granted = round(Math.min(requested, Math.min(shareablePool, effectiveDailyCap)));
        double denied = round(requested - granted);
        double resultingCharge = round(currentCharge - granted);

        if (granted >= requested) {
            return new AllocationResult(
                    AllocationStatus.GRANTED,
                    requested,
                    granted,
                    0.0,
                    ReasonCode.NONE,
                    resultingCharge
            );
        }

        // Determine reason for partial or full denial
        ReasonCode reason;
        if (shareablePool <= 0.0 || shareablePool < requested && shareablePool <= effectiveDailyCap) {
            reason = ReasonCode.RESERVE_PROTECTED;
        } else if (effectiveDailyCap < requested && effectiveDailyCap < shareablePool) {
            reason = ReasonCode.MEMBER_CAP;
        } else {
            reason = ReasonCode.RESERVE_PROTECTED;
        }

        if (granted > 0.0) {
            return new AllocationResult(
                    AllocationStatus.PARTIALLY_GRANTED,
                    requested,
                    granted,
                    denied,
                    reason,
                    resultingCharge
            );
        } else {
            // Full denial
            if (effectiveDailyCap <= 0.0) {
                reason = ReasonCode.MEMBER_CAP;
            } else {
                reason = ReasonCode.RESERVE_PROTECTED;
            }
            return new AllocationResult(
                    AllocationStatus.DENIED,
                    requested,
                    0.0,
                    requested,
                    reason,
                    currentCharge
            );
        }
    }

    private static double round(double val) {
        return Math.round(val * 10000.0) / 10000.0;
    }
}
