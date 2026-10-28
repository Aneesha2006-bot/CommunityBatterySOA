package com.communitybattery.battery.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "discharge_ledger")
public class DischargeLedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "event_id", nullable = false, unique = true, length = 36)
    private String eventId;

    @Column(name = "request_id", nullable = false, length = 36)
    private String requestId;

    @Column(name = "member_ref", nullable = false, length = 50)
    private String memberRef;

    @Column(name = "granted_kwh", nullable = false)
    private Double grantedKwh;

    @Column(name = "denied_kwh", nullable = false)
    private Double deniedKwh;

    @Column(name = "charge_before_kwh", nullable = false)
    private Double chargeBeforeKwh;

    @Column(name = "charge_after_kwh", nullable = false)
    private Double chargeAfterKwh;

    @Column(name = "correlation_id", length = 36)
    private String correlationId;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt = Instant.now();

    public String getId() { return id; }
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getMemberRef() { return memberRef; }
    public void setMemberRef(String memberRef) { this.memberRef = memberRef; }
    public Double getGrantedKwh() { return grantedKwh; }
    public void setGrantedKwh(Double grantedKwh) { this.grantedKwh = grantedKwh; }
    public Double getDeniedKwh() { return deniedKwh; }
    public void setDeniedKwh(Double deniedKwh) { this.deniedKwh = deniedKwh; }
    public Double getChargeBeforeKwh() { return chargeBeforeKwh; }
    public void setChargeBeforeKwh(Double chargeBeforeKwh) { this.chargeBeforeKwh = chargeBeforeKwh; }
    public Double getChargeAfterKwh() { return chargeAfterKwh; }
    public void setChargeAfterKwh(Double chargeAfterKwh) { this.chargeAfterKwh = chargeAfterKwh; }
    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    public Instant getRecordedAt() { return recordedAt; }
}
