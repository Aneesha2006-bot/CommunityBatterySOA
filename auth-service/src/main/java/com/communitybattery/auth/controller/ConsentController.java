package com.communitybattery.auth.controller;

import com.communitybattery.auth.model.ConsentRecord;
import com.communitybattery.auth.repository.ConsentRecordRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/consent")
public class ConsentController {

    private static final Logger log = LoggerFactory.getLogger(ConsentController.class);

    private final ConsentRecordRepository consentRepo;

    public ConsentController(ConsentRecordRepository consentRepo) {
        this.consentRepo = consentRepo;
    }

    public record ConsentRequest(@NotBlank String purpose, @NotBlank String noticeVersion) {}

    @PostMapping
    public ResponseEntity<Void> giveConsent(
            @Valid @RequestBody ConsentRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String subjectRef = jwt.getSubject();
        ConsentRecord record = new ConsentRecord();
        record.setSubjectRef(subjectRef);
        record.setPurpose(request.purpose());
        record.setNoticeVersion(request.noticeVersion());
        consentRepo.save(record);
        log.info("event=consent_given subject={} purpose={} noticeVersion={}", subjectRef, request.purpose(), request.noticeVersion());
        return ResponseEntity.created(URI.create("/api/consent/" + request.purpose())).build();
    }

    @DeleteMapping("/{purpose}")
    public ResponseEntity<Void> withdrawConsent(
            @PathVariable String purpose,
            @AuthenticationPrincipal Jwt jwt) {
        String subjectRef = jwt.getSubject();
        consentRepo.findBySubjectRefAndPurposeAndActiveTrue(subjectRef, purpose)
                .ifPresent(record -> {
                    record.setActive(false);
                    record.setWithdrawnAt(Instant.now());
                    consentRepo.save(record);
                    log.info("event=consent_withdrawn subject={} purpose={}", subjectRef, purpose);
                });
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<ConsentRecord> getConsents(@AuthenticationPrincipal Jwt jwt) {
        return consentRepo.findBySubjectRefAndActiveTrue(jwt.getSubject());
    }
}
