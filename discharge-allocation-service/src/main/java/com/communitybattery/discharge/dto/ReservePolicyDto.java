package com.communitybattery.discharge.dto;

public record ReservePolicyDto(
        Long id,
        Long version,
        double reserveFloorKwh,
        double perMemberDailyCapKwh
) {}
