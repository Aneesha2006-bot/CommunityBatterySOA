package com.communitybattery.discharge.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "discharge_requests")
public class DischargeRequest {

    public enum Status { GRANTED, PARTIALLY_GRANTED, DENIED, PENDING_COORDINATOR_REVIEW }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "member_ref", nullable = false, length = 50)
    private String memberRef;

    @Column(name = "requested_kwh", nullable = false)
    private Double requestedKwh;

    @Column(name = "granted_kwh", nullable = false)
    private Double grantedKwh;

    @Column(name = "denied_kwh", nullable = false)
    private Double deniedKwh;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status;

    @Column(name = "reason_code", length = 30)
    private String reasonCode;

    @Column(name = "emergency", nullable = false)
    private Boolean emergency = false;

    @Column(name = "correlation_id", length = 36)
    private String correlationId;

    @Column(name = "reserve_floor_kwh")
    private Double reserveFloorKwh;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public String getId() { return id; }
    public String getMemberRef() { return memberRef; }
    public void setMemberRef(String memberRef) { this.memberRef = memberRef; }
    public Double getRequestedKwh() { return requestedKwh; }
    public void setRequestedKwh(Double requestedKwh) { this.requestedKwh = requestedKwh; }
    public Double getGrantedKwh() { return grantedKwh; }
    public void setGrantedKwh(Double grantedKwh) { this.grantedKwh = grantedKwh; }
    public Double getDeniedKwh() { return deniedKwh; }
    public void setDeniedKwh(Double deniedKwh) { this.deniedKwh = deniedKwh; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getReasonCode() { return reasonCode; }
    public void setReasonCode(String reasonCode) { this.reasonCode = reasonCode; }
    public Boolean getEmergency() { return emergency; }
    public void setEmergency(Boolean emergency) { this.emergency = emergency; }
    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    public Double getReserveFloorKwh() { return reserveFloorKwh; }
    public void setReserveFloorKwh(Double reserveFloorKwh) { this.reserveFloorKwh = reserveFloorKwh; }
    public Instant getCreatedAt() { return createdAt; }
}
