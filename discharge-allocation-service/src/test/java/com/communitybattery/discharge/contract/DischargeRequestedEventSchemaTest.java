package com.communitybattery.discharge.contract;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DischargeRequestedEventSchemaTest {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static JsonSchema schema;
    private static Path schemaPath;

    @BeforeAll
    static void setUp() throws Exception {
        // Look for schema in docs/events/DischargeRequested.v1.schema.json
        schemaPath = Path.of("../docs/events/DischargeRequested.v1.schema.json").toAbsolutePath().normalize();
        if (!Files.exists(schemaPath)) {
            schemaPath = Path.of("docs/events/DischargeRequested.v1.schema.json").toAbsolutePath().normalize();
        }
        assertThat(Files.exists(schemaPath))
                .withFailMessage("Schema file not found at " + schemaPath)
                .isTrue();

        JsonSchemaFactory factory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V202012);
        try (InputStream is = new FileInputStream(schemaPath.toFile())) {
            schema = factory.getSchema(is);
        }
    }

    @Test
    @DisplayName("Valid DischargeRequested event passes schema validation")
    void validDischargeRequestedEvent_PassesSchema() throws Exception {
        Map<String, Object> event = createSampleEvent();

        String json = objectMapper.writeValueAsString(event);
        JsonNode node = objectMapper.readTree(json);

        Set<ValidationMessage> errors = schema.validate(node);
        assertThat(errors)
                .withFailMessage("Expected 0 schema validation errors but found: " + errors)
                .isEmpty();
    }

    @Test
    @DisplayName("Missing grantedKwh field causes contract validation failure")
    void missingGrantedKwh_FailsSchema() throws Exception {
        Map<String, Object> event = createSampleEvent();
        event.remove("grantedKwh");

        String json = objectMapper.writeValueAsString(event);
        JsonNode node = objectMapper.readTree(json);

        Set<ValidationMessage> errors = schema.validate(node);
        assertThat(errors).isNotEmpty();
        assertThat(errors.toString()).contains("grantedKwh");
    }

    @Test
    @DisplayName("Renamed grantedKwh to grantedEnergyKwh causes contract validation failure")
    void renamedField_FailsSchema() throws Exception {
        Map<String, Object> event = createSampleEvent();
        Double value = (Double) event.remove("grantedKwh");
        event.put("grantedEnergyKwh", value);

        String json = objectMapper.writeValueAsString(event);
        JsonNode node = objectMapper.readTree(json);

        Set<ValidationMessage> errors = schema.validate(node);
        assertThat(errors).isNotEmpty();
    }

    @Test
    @DisplayName("Invalid reason code enum causes contract validation failure")
    void invalidReasonCode_FailsSchema() throws Exception {
        Map<String, Object> event = createSampleEvent();
        event.put("reasonCode", "UNKNOWN_REASON_CODE");

        String json = objectMapper.writeValueAsString(event);
        JsonNode node = objectMapper.readTree(json);

        Set<ValidationMessage> errors = schema.validate(node);
        assertThat(errors).isNotEmpty();
        assertThat(errors.toString()).contains("reasonCode");
    }

    private Map<String, Object> createSampleEvent() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("eventId", UUID.randomUUID().toString());
        payload.put("aggregateId", "req-test-12345");
        payload.put("schemaVersion", 1);
        payload.put("occurredAt", Instant.now().toString());
        payload.put("correlationId", "corr-test-abcde");
        payload.put("eventType", "DischargeRequested");
        payload.put("memberRef", "subj-member-b");
        payload.put("requestedKwh", 45.0);
        payload.put("grantedKwh", 38.0);
        payload.put("deniedKwh", 7.0);
        payload.put("reasonCode", "RESERVE_PROTECTED");
        payload.put("status", "PARTIALLY_GRANTED");
        payload.put("reserveFloorKwh", 30.0);
        payload.put("emergency", false);
        return payload;
    }
}
