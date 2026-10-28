package com.communitybattery.reserve.controller;

import com.communitybattery.reserve.dto.ReservePolicyResponse;
import com.communitybattery.reserve.dto.UpdatePolicyRequest;
import com.communitybattery.reserve.service.ReservePolicyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reserve")
public class ReservePolicyController {

    private final ReservePolicyService service;

    public ReservePolicyController(ReservePolicyService service) {
        this.service = service;
    }

    @GetMapping("/policy")
    public ResponseEntity<ReservePolicyResponse> getPolicy() {
        return ResponseEntity.ok(service.getCurrentPolicy());
    }

    @PutMapping("/policy")
    @PreAuthorize("hasRole('energyCoordinator')")
    public ResponseEntity<ReservePolicyResponse> updatePolicy(
            @Valid @RequestBody UpdatePolicyRequest request,
            @AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt,
            java.security.Principal principal) {
        String actor = (jwt != null && jwt.getSubject() != null) 
                ? jwt.getSubject() 
                : (principal != null ? principal.getName() : "energyCoordinator");
        return ResponseEntity.ok(service.updatePolicy(request, actor));
    }
}
