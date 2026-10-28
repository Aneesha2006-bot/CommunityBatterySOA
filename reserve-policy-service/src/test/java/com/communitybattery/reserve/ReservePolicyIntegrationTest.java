package com.communitybattery.reserve;

import com.communitybattery.reserve.dto.UpdatePolicyRequest;
import com.communitybattery.reserve.model.ReservePolicy;
import com.communitybattery.reserve.repository.ReservePolicyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "eureka.client.enabled=false")
@AutoConfigureMockMvc
class ReservePolicyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReservePolicyRepository repository;

    @BeforeEach
    void resetPolicy() {
        ReservePolicy policy = repository.findTopByOrderByIdDesc().orElse(new ReservePolicy());
        policy.setReserveFloorKwh(30.0);
        policy.setPerMemberDailyCapKwh(50.0);
        policy.setUpdatedBy("system-seed");
        policy.setUpdatedAt(Instant.now());
        repository.save(policy);
    }

    @Test
    @WithMockUser(roles = "member")
    @DisplayName("GET /api/reserve/policy accessible by member")
    void getPolicy_accessibleByMember() throws Exception {
        mockMvc.perform(get("/api/reserve/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reserveFloorKwh").value(30.0))
                .andExpect(jsonPath("$.perMemberDailyCapKwh").value(50.0));
    }

    @Test
    @WithMockUser(roles = "member")
    @DisplayName("PUT /api/reserve/policy by member returns 403 Forbidden")
    void updatePolicy_byMember_forbidden() throws Exception {
        var request = new UpdatePolicyRequest(25.0, 45.0);

        mockMvc.perform(put("/api/reserve/policy")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "energyCoordinator")
    @DisplayName("PUT /api/reserve/policy by coordinator updates floor and cap")
    void updatePolicy_byCoordinator_success() throws Exception {
        var request = new UpdatePolicyRequest(35.0, 60.0);

        mockMvc.perform(put("/api/reserve/policy")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reserveFloorKwh").value(35.0))
                .andExpect(jsonPath("$.perMemberDailyCapKwh").value(60.0));
    }
}
