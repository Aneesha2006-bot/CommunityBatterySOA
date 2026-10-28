package com.communitybattery.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class ReserveAllocatorTest {

    private ReserveAllocator allocator;

    @BeforeEach
    void setUp() {
        allocator = new ReserveAllocator(5.0, 500.0);
    }

    @Test
    @DisplayName("THE CASE RULE: Request below emergency floor is partially granted, non-emergency portion denied, charge lands exactly at floor (45 requested, 38 granted, 7 denied)")
    void theCaseRule_requestBelowEmergencyFloor_partiallyGranted_nonEmergencyPortionDenied_chargeLandsAtFloor() {
        // Seed parameters from problem statement:
        // current charge 68 kWh, reserve floor 30 kWh, member cap 50 kWh, request 45 kWh non-emergency
        // Shareable pool = 68 - 30 = 38 kWh
        // Granted = min(45, 38, 50) = 38 kWh
        // Denied = 7 kWh with reason RESERVE_PROTECTED
        // Resulting charge = 68 - 38 = 30 kWh (exactly on reserve floor)
        AllocationRequest request = new AllocationRequest(45.0, 68.0, 30.0, 50.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.PARTIALLY_GRANTED);
        assertThat(result.requestedKwh()).isEqualTo(45.0);
        assertThat(result.grantedKwh()).isEqualTo(38.0);
        assertThat(result.deniedKwh()).isEqualTo(7.0);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.RESERVE_PROTECTED);
        assertThat(result.resultingChargeKwh()).isEqualTo(30.0);
        assertThat(result.hasDenial()).isTrue();
        assertThat(result.isApproved()).isTrue();
    }

    @Test
    @DisplayName("Normal workflow: Member requests 12 kWh with 80 kWh charge and 30 kWh floor -> fully GRANTED, charge becomes 68 kWh")
    void normalWorkflow_memberRequests12Kwh_fullyGranted() {
        AllocationRequest request = new AllocationRequest(12.0, 80.0, 30.0, 50.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.GRANTED);
        assertThat(result.requestedKwh()).isEqualTo(12.0);
        assertThat(result.grantedKwh()).isEqualTo(12.0);
        assertThat(result.deniedKwh()).isEqualTo(0.0);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.NONE);
        assertThat(result.resultingChargeKwh()).isEqualTo(68.0);
        assertThat(result.hasDenial()).isFalse();
    }

    @Test
    @DisplayName("Boundary: Request exactly equals shareable pool")
    void boundary_requestExactlyEqualsShareablePool() {
        // Current 80, Floor 30 -> shareable = 50. Request = 50. Cap = 60.
        AllocationRequest request = new AllocationRequest(50.0, 80.0, 30.0, 60.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.GRANTED);
        assertThat(result.grantedKwh()).isEqualTo(50.0);
        assertThat(result.deniedKwh()).isEqualTo(0.0);
        assertThat(result.resultingChargeKwh()).isEqualTo(30.0);
    }

    @Test
    @DisplayName("Boundary: Request is one kWh above shareable pool")
    void boundary_requestOneKwhAboveShareablePool() {
        // Current 80, Floor 30 -> shareable = 50. Request = 51. Cap = 60.
        AllocationRequest request = new AllocationRequest(51.0, 80.0, 30.0, 60.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.PARTIALLY_GRANTED);
        assertThat(result.grantedKwh()).isEqualTo(50.0);
        assertThat(result.deniedKwh()).isEqualTo(1.0);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.RESERVE_PROTECTED);
        assertThat(result.resultingChargeKwh()).isEqualTo(30.0);
    }

    @Test
    @DisplayName("Boundary: Charge exactly at floor -> shareable pool is zero -> full DENIED")
    void boundary_chargeExactlyAtFloor_fullyDenied() {
        AllocationRequest request = new AllocationRequest(10.0, 30.0, 30.0, 50.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.DENIED);
        assertThat(result.grantedKwh()).isEqualTo(0.0);
        assertThat(result.deniedKwh()).isEqualTo(10.0);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.RESERVE_PROTECTED);
        assertThat(result.resultingChargeKwh()).isEqualTo(30.0);
    }

    @Test
    @DisplayName("Boundary: Charge below floor -> shareable pool is zero -> full DENIED")
    void boundary_chargeBelowFloor_fullyDenied() {
        AllocationRequest request = new AllocationRequest(10.0, 25.0, 30.0, 50.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.DENIED);
        assertThat(result.grantedKwh()).isEqualTo(0.0);
        assertThat(result.deniedKwh()).isEqualTo(10.0);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.RESERVE_PROTECTED);
        assertThat(result.resultingChargeKwh()).isEqualTo(25.0);
    }

    @Test
    @DisplayName("Boundary: Member daily cap reached -> fully DENIED with MEMBER_CAP")
    void boundary_memberCapReached_fullyDenied() {
        AllocationRequest request = new AllocationRequest(15.0, 80.0, 30.0, 0.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.DENIED);
        assertThat(result.grantedKwh()).isEqualTo(0.0);
        assertThat(result.deniedKwh()).isEqualTo(15.0);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.MEMBER_CAP);
        assertThat(result.resultingChargeKwh()).isEqualTo(80.0);
    }

    @Test
    @DisplayName("Boundary: Member daily cap limits allocation before reserve floor")
    void boundary_memberCapLimitsAllocation() {
        // Current 80, Floor 30 -> shareable 50. Request 25. Cap remaining 10.
        AllocationRequest request = new AllocationRequest(25.0, 80.0, 30.0, 10.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.PARTIALLY_GRANTED);
        assertThat(result.grantedKwh()).isEqualTo(10.0);
        assertThat(result.deniedKwh()).isEqualTo(15.0);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.MEMBER_CAP);
        assertThat(result.resultingChargeKwh()).isEqualTo(70.0);
    }

    @ParameterizedTest
    @ValueSource(doubles = {0.0, -5.0, -0.01})
    @DisplayName("Invalid: Zero or negative requested kWh rejected")
    void invalid_zeroOrNegative_rejected(double invalidKwh) {
        AllocationRequest request = new AllocationRequest(invalidKwh, 80.0, 30.0, 50.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.DENIED);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.INVALID_REQUEST);
        assertThat(result.grantedKwh()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Invalid: NaN requested kWh rejected")
    void invalid_nan_rejected() {
        AllocationRequest request = new AllocationRequest(Double.NaN, 80.0, 30.0, 50.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.DENIED);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.INVALID_REQUEST);
        assertThat(result.grantedKwh()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Invalid: Unreasonably large request (>500 kWh) rejected")
    void invalid_unreasonablyLarge_rejected() {
        AllocationRequest request = new AllocationRequest(501.0, 80.0, 30.0, 600.0, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.DENIED);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.INVALID_REQUEST);
        assertThat(result.grantedKwh()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Emergency: Member-flagged emergency queues as PENDING_COORDINATOR_REVIEW without touching reserve")
    void emergency_memberFlagged_queuedForReview() {
        AllocationRequest request = new AllocationRequest(40.0, 50.0, 30.0, 50.0, true, false);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.PENDING_COORDINATOR_REVIEW);
        assertThat(result.reasonCode()).isEqualTo(ReasonCode.PENDING_COORDINATOR_REVIEW);
        assertThat(result.grantedKwh()).isEqualTo(0.0);
        assertThat(result.resultingChargeKwh()).isEqualTo(50.0);
    }

    @Test
    @DisplayName("Emergency: Coordinator-authorized emergency draws into reserve above safety margin")
    void emergency_coordinatorAuthorized_drawsIntoReserveAboveSafetyMargin() {
        // Charge 25 kWh, Floor 30 kWh, Min safety margin 5 kWh. Coordinator authorizes 15 kWh.
        // Emergency pool = 25 - 5 = 20 kWh.
        AllocationRequest request = new AllocationRequest(15.0, 25.0, 30.0, 50.0, true, true);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.GRANTED);
        assertThat(result.grantedKwh()).isEqualTo(15.0);
        assertThat(result.deniedKwh()).isEqualTo(0.0);
        assertThat(result.resultingChargeKwh()).isEqualTo(10.0);
    }

    @Test
    @DisplayName("Emergency: Coordinator-authorized emergency capped by safety margin (cannot drop below 5 kWh)")
    void emergency_coordinatorAuthorized_cappedBySafetyMargin() {
        // Charge 20 kWh, Floor 30 kWh, Min safety margin 5 kWh. Coordinator authorizes 20 kWh.
        // Emergency pool = 20 - 5 = 15 kWh.
        AllocationRequest request = new AllocationRequest(20.0, 20.0, 30.0, 50.0, true, true);

        AllocationResult result = allocator.allocate(request);

        assertThat(result.status()).isEqualTo(AllocationStatus.PARTIALLY_GRANTED);
        assertThat(result.grantedKwh()).isEqualTo(15.0);
        assertThat(result.deniedKwh()).isEqualTo(5.0);
        assertThat(result.resultingChargeKwh()).isEqualTo(5.0);
    }
}
