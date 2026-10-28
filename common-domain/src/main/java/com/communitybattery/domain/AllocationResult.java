package com.communitybattery.domain;

/**
 * Immutable value object representing the outcome of a battery discharge allocation decision.
 */
public record AllocationResult(
        AllocationStatus status,
        double requestedKwh,
        double grantedKwh,
        double deniedKwh,
        ReasonCode reasonCode,
        double resultingChargeKwh
) {
    public boolean isApproved() {
        return status == AllocationStatus.GRANTED || status == AllocationStatus.PARTIALLY_GRANTED;
    }

    public boolean hasDenial() {
        return deniedKwh > 0.0 || status == AllocationStatus.DENIED;
    }
}
