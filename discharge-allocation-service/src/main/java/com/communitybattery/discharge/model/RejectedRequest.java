package com.communitybattery.discharge.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "rejected_requests")
public class RejectedRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "request_id", nullable = false, length = 36)
    private String requestId;

    @Column(name = "member_ref", nullable = false, length = 50)
    private String memberRef;

    @Column(name = "denied_kwh", nullable = false)
    private Double deniedKwh;

    @Column(name = "reason_code", nullable = false, length = 30)
    private String reasonCode;

    @Column(name = "correlation_id", length = 36)
    private String correlationId;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp = Instant.now();

    public String getId() { return id; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getMemberRef() { return memberRef; }
    public void setMemberRef(String memberRef) { this.memberRef = memberRef; }
    public Double getDeniedKwh() { return deniedKwh; }
    public void setDeniedKwh(Double deniedKwh) { this.deniedKwh = deniedKwh; }
    public String getReasonCode() { return reasonCode; }
    public void setReasonCode(String reasonCode) { this.reasonCode = reasonCode; }
    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
