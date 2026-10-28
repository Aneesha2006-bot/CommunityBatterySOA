package com.communitybattery.auth.controller;

import com.communitybattery.auth.model.PrivacyRequest;
import com.communitybattery.auth.repository.PrivacyRequestRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/privacy")
public class PrivacyRequestController {

    private static final Logger log = LoggerFactory.getLogger(PrivacyRequestController.class);

    private final PrivacyRequestRepository privacyRepo;

    public PrivacyRequestController(PrivacyRequestRepository privacyRepo) {
        this.privacyRepo = privacyRepo;
    }

    public record PrivacyRequestBody(
            @NotNull PrivacyRequest.RequestType requestType,
            String description) {}

    @PostMapping("/requests")
    public ResponseEntity<PrivacyRequest> submitRequest(
            @Valid @RequestBody PrivacyRequestBody body,
            @AuthenticationPrincipal Jwt jwt) {
        PrivacyRequest req = new PrivacyRequest();
        req.setSubjectRef(jwt.getSubject());
        req.setRequestType(body.requestType());
        req.setDescription(body.description());
        PrivacyRequest saved = privacyRepo.save(req);
        log.info("event=privacy_request_received id={} subject={} type={}", saved.getId(), jwt.getSubject(), body.requestType());
        return ResponseEntity.created(URI.create("/api/privacy/requests/" + saved.getId())).body(saved);
    }

    @GetMapping("/requests")
    public List<PrivacyRequest> getRequests(@AuthenticationPrincipal Jwt jwt) {
        return privacyRepo.findBySubjectRefOrderByReceivedAtDesc(jwt.getSubject());
    }
}
