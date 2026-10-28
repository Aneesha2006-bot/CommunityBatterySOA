package com.communitybattery.battery.event;

import java.time.Instant;

public record DischargeRequestedEvent(
        String eventId,
        String aggregateId,
        int schemaVersion,
        Instant occurredAt,
        String correlationId,
        String eventType,
        String memberRef,
        double requestedKwh,
        double grantedKwh,
        double deniedKwh,
        String reasonCode,
        String status,
        double reserveFloorKwh,
        boolean emergency
) {}
