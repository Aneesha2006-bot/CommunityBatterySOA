package com.communitybattery.discharge.controller;

import com.communitybattery.discharge.dto.DischargeRequestBody;
import com.communitybattery.discharge.dto.DischargeRequestResponse;
import com.communitybattery.discharge.model.RejectedRequest;
import com.communitybattery.discharge.service.DischargeAllocationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discharges")
public class DischargeAllocationController {

    private final DischargeAllocationService service;

    public DischargeAllocationController(DischargeAllocationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DischargeRequestResponse> requestDischarge(
            @Valid @RequestBody DischargeRequestBody body,
            @AuthenticationPrincipal Jwt jwt) {
        DischargeRequestResponse response = service.allocate(body, jwt);
        HttpStatus status = switch (response.status()) {
            case "GRANTED", "PARTIALLY_GRANTED" -> HttpStatus.CREATED;
            case "DENIED" -> HttpStatus.OK;
            default -> HttpStatus.ACCEPTED;
        };
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DischargeRequestResponse> getById(
            @PathVariable String id,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.getById(id, jwt));
    }

    @GetMapping
    public ResponseEntity<List<DischargeRequestResponse>> getAll(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.getAll(jwt));
    }

    @GetMapping("/rejected")
    public ResponseEntity<List<RejectedRequest>> getRejected(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.getRejected(jwt));
    }
}
