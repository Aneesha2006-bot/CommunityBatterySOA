package com.communitybattery.discharge.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record DischargeRequestBody(
        @NotNull @DecimalMin(value = "0.001", message = "requestedKwh must be greater than 0") Double requestedKwh,
        boolean emergency
) {}
