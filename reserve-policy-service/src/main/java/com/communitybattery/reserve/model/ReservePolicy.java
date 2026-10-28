package com.communitybattery.reserve.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

@Entity
@Table(name = "reserve_policy")
public class ReservePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "reserve_floor_kwh", nullable = false)
    private Double reserveFloorKwh;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "per_member_daily_cap_kwh", nullable = false)
    private Double perMemberDailyCapKwh;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Long getId() { return id; }
    public Long getVersion() { return version; }
    public Double getReserveFloorKwh() { return reserveFloorKwh; }
    public void setReserveFloorKwh(Double reserveFloorKwh) { this.reserveFloorKwh = reserveFloorKwh; }
    public Double getPerMemberDailyCapKwh() { return perMemberDailyCapKwh; }
    public void setPerMemberDailyCapKwh(Double perMemberDailyCapKwh) { this.perMemberDailyCapKwh = perMemberDailyCapKwh; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
