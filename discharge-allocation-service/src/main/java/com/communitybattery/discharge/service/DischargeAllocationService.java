package com.communitybattery.discharge.service;

import com.communitybattery.discharge.client.BatteryStateClient;
import com.communitybattery.discharge.client.ReservePolicyClient;
import com.communitybattery.discharge.dto.DischargeRequestBody;
import com.communitybattery.discharge.dto.DischargeRequestResponse;
import com.communitybattery.discharge.dto.ReservePolicyDto;
import com.communitybattery.discharge.model.DischargeRequest;
import com.communitybattery.discharge.model.OutboxEvent;
import com.communitybattery.discharge.model.RejectedRequest;
import com.communitybattery.discharge.repository.DischargeRequestRepository;
import com.communitybattery.discharge.repository.OutboxEventRepository;
import com.communitybattery.discharge.repository.RejectedRequestRepository;
import com.communitybattery.domain.AllocationRequest;
import com.communitybattery.domain.AllocationResult;
import com.communitybattery.domain.ReserveAllocator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DischargeAllocationService {

    private static final Logger log = LoggerFactory.getLogger(DischargeAllocationService.class);

    private final DischargeRequestRepository requestRepo;
    private final RejectedRequestRepository rejectedRepo;
    private final OutboxEventRepository outboxRepo;
    private final BatteryStateClient batteryClient;
    private final ReservePolicyClient policyClient;
    private final ReserveAllocator allocator;
    private final ObjectMapper objectMapper;

    @Value("${app.instance-id:${spring.application.name:discharge-allocation-service}:${server.port:8084}}")
    private String instanceId;

    public DischargeAllocationService(
            DischargeRequestRepository requestRepo,
            RejectedRequestRepository rejectedRepo,
            OutboxEventRepository outboxRepo,
            BatteryStateClient batteryClient,
            ReservePolicyClient policyClient) {
        this.requestRepo = requestRepo;
        this.rejectedRepo = rejectedRepo;
        this.outboxRepo = outboxRepo;
        this.batteryClient = batteryClient;
        this.policyClient = policyClient;
        this.allocator = new ReserveAllocator();
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @Transactional
    public DischargeRequestResponse allocate(DischargeRequestBody body, Jwt jwt) {
        String memberRef = jwt.getSubject();
        Collection<String> roles = jwt.getClaimAsStringList("roles");
        boolean isCoordinator = roles != null && roles.contains("energyCoordinator");

        String correlationId = UUID.randomUUID().toString();

        // 1. Read current state synchronously via REST clients
        double currentCharge = batteryClient.getCurrentChargeKwh();
        ReservePolicyDto policy = policyClient.getCurrentPolicy();

        // 2. Compute remaining daily cap for this member (last 24 hours)
        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        double alreadyGrantedToday = requestRepo.findByMemberRefOrderByCreatedAtDesc(memberRef).stream()
                .filter(r -> r.getCreatedAt().isAfter(since))
                .mapToDouble(DischargeRequest::getGrantedKwh)
                .sum();
        double remainingCap = Math.max(0.0, policy.perMemberDailyCapKwh() - alreadyGrantedToday);

        // 3. Invoke pure ReserveAllocator domain rule
        AllocationRequest allocRequest = new AllocationRequest(
                body.requestedKwh(),
                currentCharge,
                policy.reserveFloorKwh(),
                remainingCap,
                body.emergency(),
                isCoordinator && body.emergency()
        );

        AllocationResult result = allocator.allocate(allocRequest);

        // 4. Persist decision
        DischargeRequest request = new DischargeRequest();
        request.setMemberRef(memberRef);
        request.setRequestedKwh(body.requestedKwh());
        request.setGrantedKwh(result.grantedKwh());
        request.setDeniedKwh(result.deniedKwh());
        request.setStatus(DischargeRequest.Status.valueOf(result.status().name()));
        request.setReasonCode(result.reasonCode().name());
        request.setEmergency(body.emergency());
        request.setCorrelationId(correlationId);
        request.setReserveFloorKwh(policy.reserveFloorKwh());
        DischargeRequest saved = requestRepo.save(request);

        // 5. Persist rejected request record if any denial or partial denial
        if (result.hasDenial()) {
            RejectedRequest rejected = new RejectedRequest();
            rejected.setRequestId(saved.getId());
            rejected.setMemberRef(memberRef);
            rejected.setDeniedKwh(result.deniedKwh() > 0.0 ? result.deniedKwh() : body.requestedKwh());
            rejected.setReasonCode(result.reasonCode().name());
            rejected.setCorrelationId(correlationId);
            rejectedRepo.save(rejected);
        }

        // 6. Write outbox event in same DB transaction (choreography)
        if (!result.status().name().equals("PENDING_COORDINATOR_REVIEW")) {
            writeOutboxEvent(saved, result, policy, correlationId);
        }

        log.info("Discharge decision: id={}, member=[REDACTED], req={}, granted={}, denied={}, status={}, instanceId={}",
                saved.getId(), body.requestedKwh(), result.grantedKwh(), result.deniedKwh(), result.status(), instanceId);

        return DischargeRequestResponse.from(saved, instanceId);
    }

    private void writeOutboxEvent(DischargeRequest request, AllocationResult result,
                                   ReservePolicyDto policy, String correlationId) {
        java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("eventId", UUID.randomUUID().toString());
        payload.put("aggregateId", request.getId());
        payload.put("schemaVersion", 1);
        payload.put("occurredAt", Instant.now().toString());
        payload.put("correlationId", correlationId);
        payload.put("eventType", "DischargeRequested");
        payload.put("memberRef", request.getMemberRef());
        payload.put("requestedKwh", request.getRequestedKwh());
        payload.put("grantedKwh", result.grantedKwh());
        payload.put("deniedKwh", result.deniedKwh());
        payload.put("reasonCode", result.reasonCode().name());
        payload.put("status", result.status().name());
        payload.put("reserveFloorKwh", policy.reserveFloorKwh());
        payload.put("emergency", Boolean.TRUE.equals(request.getEmergency()));
        try {
            OutboxEvent outbox = new OutboxEvent();
            outbox.setAggregateId(request.getId());
            outbox.setEventType("DischargeRequested");
            outbox.setPayload(objectMapper.writeValueAsString(payload));
            outboxRepo.save(outbox);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize outbox event", e);
        }
    }

    @Transactional(readOnly = true)
    public DischargeRequestResponse getById(String id, Jwt jwt) {
        String memberRef = jwt.getSubject();
        Collection<String> roles = jwt.getClaimAsStringList("roles");
        boolean isCoordinator = roles != null && roles.contains("energyCoordinator");

        DischargeRequest request;
        if (isCoordinator) {
            request = requestRepo.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        } else {
            request = requestRepo.findByIdAndMemberRef(id, memberRef)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        }
        return DischargeRequestResponse.from(request, instanceId);
    }

    @Transactional(readOnly = true)
    public List<DischargeRequestResponse> getAll(Jwt jwt) {
        String memberRef = jwt.getSubject();
        Collection<String> roles = jwt.getClaimAsStringList("roles");
        boolean isCoordinator = roles != null && roles.contains("energyCoordinator");

        List<DischargeRequest> requests = isCoordinator
                ? requestRepo.findAll()
                : requestRepo.findByMemberRefOrderByCreatedAtDesc(memberRef);

        return requests.stream().map(r -> DischargeRequestResponse.from(r, instanceId)).toList();
    }

    @Transactional(readOnly = true)
    public List<RejectedRequest> getRejected(Jwt jwt) {
        String memberRef = jwt.getSubject();
        Collection<String> roles = jwt.getClaimAsStringList("roles");
        boolean isCoordinator = roles != null && roles.contains("energyCoordinator");

        return isCoordinator
                ? rejectedRepo.findAll()
                : rejectedRepo.findByMemberRefOrderByTimestampDesc(memberRef);
    }
}
