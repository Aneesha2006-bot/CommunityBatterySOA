package com.communitybattery.battery;

import com.communitybattery.battery.event.DischargeRequestedEvent;
import com.communitybattery.battery.model.BatteryState;
import com.communitybattery.battery.repository.BatteryStateRepository;
import com.communitybattery.battery.repository.DischargeLedgerRepository;
import com.communitybattery.battery.repository.ProcessedEventRepository;
import com.communitybattery.battery.service.BatteryEventConsumer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "spring.kafka.listener.auto-startup=false"
})
@AutoConfigureMockMvc
class BatteryStateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BatteryStateRepository batteryStateRepository;

    @Autowired
    private DischargeLedgerRepository ledgerRepository;

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @Autowired
    private BatteryEventConsumer eventConsumer;

    @Test
    @WithMockUser(roles = "member")
    @DisplayName("GET /api/battery/state returns current battery status")
    void getState_returnsCurrentBatteryStatus() throws Exception {
        mockMvc.perform(get("/api/battery/state"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.capacityKwh").value(100.0))
                .andExpect(jsonPath("$.currentChargeKwh").value(80.0))
                .andExpect(jsonPath("$.shareablePoolKwh").value(50.0))
                .andExpect(jsonPath("$.reserveFloorKwh").value(30.0));
    }

    @Test
    @DisplayName("Idempotent Consumer: Duplicate event produces zero additional effect")
    void idempotentConsumer_duplicateEvent_producesZeroAdditionalEffect() {
        String eventId = UUID.randomUUID().toString();
        String aggregateId = UUID.randomUUID().toString();

        DischargeRequestedEvent event = new DischargeRequestedEvent(
                eventId,
                aggregateId,
                1,
                Instant.now(),
                UUID.randomUUID().toString(),
                "DischargeRequested",
                "subj-member-a",
                12.0,
                12.0,
                0.0,
                "NONE",
                "GRANTED",
                30.0,
                false
        );

        double initialCharge = batteryStateRepository.findCurrentState().orElseThrow().getCurrentChargeKwh();
        long initialProcessedCount = processedEventRepository.count();

        // 1st delivery
        eventConsumer.consume(event);

        double chargeAfterFirst = batteryStateRepository.findCurrentState().orElseThrow().getCurrentChargeKwh();
        assertThat(chargeAfterFirst).isEqualTo(initialCharge - 12.0);
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
        long processedCountAfterFirst = processedEventRepository.count();
        assertThat(processedCountAfterFirst).isEqualTo(initialProcessedCount + 1);

        // 2nd delivery (duplicate!)
        eventConsumer.consume(event);

        double chargeAfterSecond = batteryStateRepository.findCurrentState().orElseThrow().getCurrentChargeKwh();
        assertThat(chargeAfterSecond).isEqualTo(chargeAfterFirst); // No extra deduction!
        assertThat(processedEventRepository.count()).isEqualTo(processedCountAfterFirst); // No duplicate entry!
    }
}
