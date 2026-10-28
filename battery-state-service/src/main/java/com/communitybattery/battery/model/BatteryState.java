package com.communitybattery.battery.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

@Entity
@Table(name = "battery_state")
public class BatteryState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "capacity_kwh", nullable = false)
    private Double capacityKwh;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "current_charge_kwh", nullable = false)
    private Double currentChargeKwh;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Long getId() { return id; }
    public Long getVersion() { return version; }
    public Double getCapacityKwh() { return capacityKwh; }
    public void setCapacityKwh(Double capacityKwh) { this.capacityKwh = capacityKwh; }
    public Double getCurrentChargeKwh() { return currentChargeKwh; }
    public void setCurrentChargeKwh(Double currentChargeKwh) { this.currentChargeKwh = currentChargeKwh; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
