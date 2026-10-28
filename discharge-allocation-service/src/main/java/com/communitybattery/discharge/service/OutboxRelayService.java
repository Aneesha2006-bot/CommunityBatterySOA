package com.communitybattery.discharge.service;

import com.communitybattery.discharge.model.OutboxEvent;
import com.communitybattery.discharge.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class OutboxRelayService {

    private static final Logger log = LoggerFactory.getLogger(OutboxRelayService.class);

    private final OutboxEventRepository outboxRepo;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${app.kafka.topic:soa.s10.t03.events}")
    private String topic;

    public OutboxRelayService(OutboxEventRepository outboxRepo,
                               KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxRepo = outboxRepo;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelay = 500)
    @Transactional
    public void relay() {
        List<OutboxEvent> unpublished = outboxRepo.findUnpublishedForUpdate(PageRequest.of(0, 10));
        for (OutboxEvent event : unpublished) {
            try {
                // Key = aggregateId (requestId) for partition ordering per aggregate
                kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload()).get();
                event.setPublished(true);
                event.setPublishedAt(Instant.now());
                outboxRepo.save(event);
                log.info("Outbox relay published eventId={} aggregateId={} to topic={}",
                        event.getId(), event.getAggregateId(), topic);
            } catch (Exception e) {
                log.debug("Outbox relay sending eventId={}: {}", event.getId(), e.getMessage());
            }
        }
    }
}
