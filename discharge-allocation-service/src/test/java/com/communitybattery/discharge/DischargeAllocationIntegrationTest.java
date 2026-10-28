package com.communitybattery.discharge;

import com.communitybattery.discharge.client.BatteryStateClient;
import com.communitybattery.discharge.client.ReservePolicyClient;
import com.communitybattery.discharge.dto.DischargeRequestBody;
import com.communitybattery.discharge.dto.ReservePolicyDto;
import com.communitybattery.discharge.model.OutboxEvent;
import com.communitybattery.discharge.model.RejectedRequest;
import com.communitybattery.discharge.repository.DischargeRequestRepository;
import com.communitybattery.discharge.repository.OutboxEventRepository;
import com.communitybattery.discharge.repository.RejectedRequestRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "spring.kafka.producer.bootstrap-servers=localhost:9092"
})
@AutoConfigureMockMvc
class DischargeAllocationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BatteryStateClient batteryClient;

    @MockitoBean
    private ReservePolicyClient policyClient;

    @MockitoBean
    private com.communitybattery.discharge.service.OutboxRelayService outboxRelay;

    @Autowired
    private DischargeRequestRepository requestRepo;

    @Autowired
    private RejectedRequestRepository rejectedRepo;

    @Autowired
    private OutboxEventRepository outboxRepo;

    @BeforeEach
    void setUp() {
        requestRepo.deleteAll();
        rejectedRepo.deleteAll();
        outboxRepo.deleteAll();
    }

    @Test
    @DisplayName("Normal workflow: Member-A requests 12 kWh with 80 kWh charge -> GRANTED, Outbox written")
    void normalWorkflow_memberRequests12Kwh_granted() throws Exception {
        Mockito.when(batteryClient.getCurrentChargeKwh()).thenReturn(80.0);
        Mockito.when(policyClient.getCurrentPolicy()).thenReturn(new ReservePolicyDto(1L, 0L, 30.0, 50.0));

        var body = new DischargeRequestBody(12.0, false);

        mockMvc.perform(post("/api/discharges")
                        .with(SecurityMockMvcRequestPostProcessors.jwt().jwt(jwt -> jwt
                                .subject("subj-member-a")
                                .claim("roles", List.of("member"))))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("GRANTED"))
                .andExpect(jsonPath("$.requestedKwh").value(12.0))
                .andExpect(jsonPath("$.grantedKwh").value(12.0))
                .andExpect(jsonPath("$.deniedKwh").value(0.0));

        assertThat(outboxRepo.count()).isEqualTo(1);
        OutboxEvent event = outboxRepo.findAll().get(0);
        assertThat(event.getEventType()).isEqualTo("DischargeRequested");
        assertThat(event.getPayload()).contains("\"grantedKwh\":12.0");
        assertThat(rejectedRepo.count()).isEqualTo(0);
    }

    @Test
    @DisplayName("THE CASE RULE (Row-Specific Edge Case): Member-B requests 45 kWh while charge is 68 and floor is 30 -> Granted 38, Denied 7 (RESERVE_PROTECTED), RejectedRequest and Outbox persisted")
    void theCaseRule_memberRequests45Kwh_partiallyGranted() throws Exception {
        // System state from specification:
        // Current charge = 68.0, floor = 30.0 -> shareable pool = 38.0
        // Requested = 45.0, member cap = 50.0
        // Result: granted = 38.0, denied = 7.0, reason = RESERVE_PROTECTED
        Mockito.when(batteryClient.getCurrentChargeKwh()).thenReturn(68.0);
        Mockito.when(policyClient.getCurrentPolicy()).thenReturn(new ReservePolicyDto(1L, 0L, 30.0, 50.0));

        var body = new DischargeRequestBody(45.0, false);

        mockMvc.perform(post("/api/discharges")
                        .with(SecurityMockMvcRequestPostProcessors.jwt().jwt(jwt -> jwt
                                .subject("subj-member-b")
                                .claim("roles", List.of("member"))))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PARTIALLY_GRANTED"))
                .andExpect(jsonPath("$.requestedKwh").value(45.0))
                .andExpect(jsonPath("$.grantedKwh").value(38.0))
                .andExpect(jsonPath("$.deniedKwh").value(7.0))
                .andExpect(jsonPath("$.reasonCode").value("RESERVE_PROTECTED"));

        // Verify RejectedRequest row persisted in DB
        List<RejectedRequest> rejections = rejectedRepo.findAll();
        assertThat(rejections).hasSize(1);
        RejectedRequest rejected = rejections.get(0);
        assertThat(rejected.getMemberRef()).isEqualTo("subj-member-b");
        assertThat(rejected.getDeniedKwh()).isEqualTo(7.0);
        assertThat(rejected.getReasonCode()).isEqualTo("RESERVE_PROTECTED");

        // Verify Outbox event persisted in DB with transactional ordering
        List<OutboxEvent> outboxEvents = outboxRepo.findAll();
        assertThat(outboxEvents).hasSize(1);
        assertThat(outboxEvents.get(0).getPayload()).contains("\"grantedKwh\":38.0");
        assertThat(outboxEvents.get(0).getPayload()).contains("\"deniedKwh\":7.0");
    }

    @Test
    @DisplayName("Record-level access control: Member-B attempting to view Member-A's request receives 404")
    void recordLevelSecurity_crossMemberAccess_notFound() throws Exception {
        Mockito.when(batteryClient.getCurrentChargeKwh()).thenReturn(80.0);
        Mockito.when(policyClient.getCurrentPolicy()).thenReturn(new ReservePolicyDto(1L, 0L, 30.0, 50.0));

        // Member-A creates a request
        var body = new DischargeRequestBody(10.0, false);
        String responseStr = mockMvc.perform(post("/api/discharges")
                        .with(SecurityMockMvcRequestPostProcessors.jwt().jwt(jwt -> jwt
                                .subject("subj-member-a")
                                .claim("roles", List.of("member"))))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String requestId = objectMapper.readTree(responseStr).get("id").asText();

        // Member-B tries to read Member-A's request -> must return 404 (zero leakage of existence)
        mockMvc.perform(get("/api/discharges/" + requestId)
                        .with(SecurityMockMvcRequestPostProcessors.jwt().jwt(jwt -> jwt
                                .subject("subj-member-b")
                                .claim("roles", List.of("member")))))
                .andExpect(status().isNotFound());

        // Coordinator CAN view Member-A's request
        mockMvc.perform(get("/api/discharges/" + requestId)
                        .with(SecurityMockMvcRequestPostProcessors.jwt().jwt(jwt -> jwt
                                .subject("subj-coord-1")
                                .claim("roles", List.of("energyCoordinator")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(requestId))
                .andExpect(jsonPath("$.memberRef").value("subj-member-a"));
    }
}
