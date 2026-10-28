package com.communitybattery.discharge.dto;

import com.communitybattery.discharge.model.DischargeRequest;
import java.time.Instant;

public record DischargeRequestResponse(
        String id,
        String memberRef,
        double requestedKwh,
        double grantedKwh,
        double deniedKwh,
        String status,
        String reasonCode,
        boolean emergency,
        String correlationId,
        Instant createdAt,
        String instanceId
) {
    public static DischargeRequestResponse from(DischargeRequest r, String instanceId) {
        return new DischargeRequestResponse(
                r.getId(),
                r.getMemberRef(),
                r.getRequestedKwh(),
                r.getGrantedKwh(),
                r.getDeniedKwh(),
                r.getStatus().name(),
                r.getReasonCode(),
                Boolean.TRUE.equals(r.getEmergency()),
                r.getCorrelationId(),
                r.getCreatedAt(),
                instanceId
        );
    }
}
