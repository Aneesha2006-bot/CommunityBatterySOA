package com.communitybattery.reserve.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record UpdatePolicyRequest(
        @NotNull @DecimalMin("0.0") Double reserveFloorKwh,
        @NotNull @DecimalMin("0.1") Double perMemberDailyCapKwh
) {}
