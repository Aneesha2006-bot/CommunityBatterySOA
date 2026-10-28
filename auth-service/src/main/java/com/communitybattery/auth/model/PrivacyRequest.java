package com.communitybattery.auth.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "privacy_requests")
public class PrivacyRequest {

    public enum RequestType { ACCESS, CORRECTION, ERASURE, GRIEVANCE }
    public enum RequestStatus { RECEIVED, IN_PROGRESS, COMPLETED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "subject_ref", nullable = false, length = 50)
    private String subjectRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestType requestType;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.RECEIVED;

    @Column(name = "received_at", nullable = false, updatable = false)
    private Instant receivedAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    // ── Getters / Setters ─────────────────────────────────────────────────────
    public String getId() { return id; }
    public String getSubjectRef() { return subjectRef; }
    public void setSubjectRef(String subjectRef) { this.subjectRef = subjectRef; }
    public RequestType getRequestType() { return requestType; }
    public void setRequestType(RequestType requestType) { this.requestType = requestType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public Instant getReceivedAt() { return receivedAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
