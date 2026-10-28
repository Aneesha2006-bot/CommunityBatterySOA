package com.communitybattery.domain;

/**
 * Immutable value object representing a request for battery discharge allocation.
 */
public record AllocationRequest(
        double requestedKwh,
        double currentChargeKwh,
        double reserveFloorKwh,
        double remainingMemberDailyCapKwh,
        boolean emergency,
        boolean isCoordinatorAuthorized
) {
    public AllocationRequest(
            double requestedKwh,
            double currentChargeKwh,
            double reserveFloorKwh,
            double remainingMemberDailyCapKwh,
            boolean emergency
    ) {
        this(requestedKwh, currentChargeKwh, reserveFloorKwh, remainingMemberDailyCapKwh, emergency, false);
    }
}
