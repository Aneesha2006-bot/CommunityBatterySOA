package com.communitybattery.battery.controller;

import com.communitybattery.battery.dto.BatteryStateResponse;
import com.communitybattery.battery.service.BatteryStateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/battery")
public class BatteryStateController {

    private final BatteryStateService service;

    public BatteryStateController(BatteryStateService service) {
        this.service = service;
    }

    @GetMapping("/state")
    @PreAuthorize("hasAnyRole('member', 'energyCoordinator')")
    public ResponseEntity<BatteryStateResponse> getState() {
        return ResponseEntity.ok(service.getCurrentState());
    }
}
