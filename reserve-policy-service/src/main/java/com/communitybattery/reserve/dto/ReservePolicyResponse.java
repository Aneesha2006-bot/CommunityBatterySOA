package com.communitybattery.reserve.dto;

import java.time.Instant;

public record ReservePolicyResponse(
        Long id,
        Long version,
        double reserveFloorKwh,
        double perMemberDailyCapKwh,
        String updatedBy,
        Instant updatedAt
) {}
