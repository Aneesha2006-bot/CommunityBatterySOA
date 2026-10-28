package com.communitybattery.battery.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "processed_events")
public class ProcessedEvent {

    @Id
    @Column(name = "event_id", length = 36)
    private String eventId;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt = Instant.now();

    public ProcessedEvent() {}
    public ProcessedEvent(String eventId) { this.eventId = eventId; }

    public String getEventId() { return eventId; }
    public Instant getProcessedAt() { return processedAt; }
}
