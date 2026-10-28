package com.communitybattery.auth.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "consent_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"subject_ref", "purpose"}))
public class ConsentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject_ref", nullable = false, length = 50)
    private String subjectRef;

    @Column(nullable = false, length = 100)
    private String purpose;

    @Column(name = "notice_version", nullable = false, length = 20)
    private String noticeVersion;

    @Column(name = "consented_at", nullable = false)
    private Instant consentedAt = Instant.now();

    @Column(name = "withdrawn_at")
    private Instant withdrawnAt;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    // ── Getters / Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public String getSubjectRef() { return subjectRef; }
    public void setSubjectRef(String subjectRef) { this.subjectRef = subjectRef; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public String getNoticeVersion() { return noticeVersion; }
    public void setNoticeVersion(String noticeVersion) { this.noticeVersion = noticeVersion; }
    public Instant getConsentedAt() { return consentedAt; }
    public Instant getWithdrawnAt() { return withdrawnAt; }
    public void setWithdrawnAt(Instant withdrawnAt) { this.withdrawnAt = withdrawnAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
