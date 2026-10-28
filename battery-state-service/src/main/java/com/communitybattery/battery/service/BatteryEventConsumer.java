package com.communitybattery.battery.service;

import com.communitybattery.battery.event.DischargeRequestedEvent;
import com.communitybattery.battery.model.BatteryState;
import com.communitybattery.battery.model.DischargeLedgerEntry;
import com.communitybattery.battery.model.ProcessedEvent;
import com.communitybattery.battery.repository.BatteryStateRepository;
import com.communitybattery.battery.repository.DischargeLedgerRepository;
import com.communitybattery.battery.repository.ProcessedEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class BatteryEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(BatteryEventConsumer.class);

    private final BatteryStateRepository batteryStateRepository;
    private final DischargeLedgerRepository ledgerRepository;
    private final ProcessedEventRepository processedEventRepository;

    public BatteryEventConsumer(
            BatteryStateRepository batteryStateRepository,
            DischargeLedgerRepository ledgerRepository,
            ProcessedEventRepository processedEventRepository) {
        this.batteryStateRepository = batteryStateRepository;
        this.ledgerRepository = ledgerRepository;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(
            topics = "${app.kafka.topic:soa.s10.t03.events}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void consume(DischargeRequestedEvent event) {
        if (processedEventRepository.existsByEventId(event.eventId())) {
            log.warn("Duplicate event detected eventId={} - skipping", event.eventId());
            return;
        }

        if (event.grantedKwh() <= 0.0) {
            log.info("Event eventId={} has grantedKwh=0, recording ledger entry without charge deduction",
                    event.eventId());
        }

        BatteryState state = batteryStateRepository.findCurrentStateForUpdate()
                .orElseThrow(() -> new IllegalStateException("No battery state found"));

        double chargeBefore = state.getCurrentChargeKwh();
        double chargeAfter = Math.max(0.0, chargeBefore - event.grantedKwh());
        state.setCurrentChargeKwh(chargeAfter);
        state.setUpdatedAt(Instant.now());
        batteryStateRepository.save(state);

        DischargeLedgerEntry entry = new DischargeLedgerEntry();
        entry.setEventId(event.eventId());
        entry.setRequestId(event.aggregateId());
        entry.setMemberRef(event.memberRef());
        entry.setGrantedKwh(event.grantedKwh());
        entry.setDeniedKwh(event.deniedKwh());
        entry.setChargeBeforeKwh(chargeBefore);
        entry.setChargeAfterKwh(chargeAfter);
        entry.setCorrelationId(event.correlationId());
        ledgerRepository.save(entry);

        processedEventRepository.save(new ProcessedEvent(event.eventId()));

        log.info("Battery charge updated eventId={} memberRef=[REDACTED] before={} after={}",
                event.eventId(), chargeBefore, chargeAfter);
    }
}
