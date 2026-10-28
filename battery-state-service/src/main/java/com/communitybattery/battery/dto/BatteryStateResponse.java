package com.communitybattery.battery.dto;

import java.time.Instant;

public record BatteryStateResponse(
        double capacityKwh,
        double currentChargeKwh,
        double chargePercentage,
        double shareablePoolKwh,
        double reserveFloorKwh,
        Instant updatedAt
) {}
