package com.communitybattery.battery.service;

import com.communitybattery.battery.dto.BatteryStateResponse;
import com.communitybattery.battery.model.BatteryState;
import com.communitybattery.battery.repository.BatteryStateRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BatteryStateService {

    private final BatteryStateRepository repository;

    @Value("${app.battery.reserve-floor-kwh:30.0}")
    private double reserveFloorKwh;

    public BatteryStateService(BatteryStateRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public BatteryStateResponse getCurrentState() {
        BatteryState state = repository.findCurrentState()
                .orElseThrow(() -> new IllegalStateException("No battery state found"));
        double shareable = Math.max(0.0, state.getCurrentChargeKwh() - reserveFloorKwh);
        double pct = state.getCapacityKwh() > 0
                ? (state.getCurrentChargeKwh() / state.getCapacityKwh()) * 100.0
                : 0.0;
        return new BatteryStateResponse(
                state.getCapacityKwh(),
                state.getCurrentChargeKwh(),
                Math.round(pct * 100.0) / 100.0,
                shareable,
                reserveFloorKwh,
                state.getUpdatedAt()
        );
    }
}
