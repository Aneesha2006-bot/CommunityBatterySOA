package com.communitybattery.discharge.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class BatteryStateClient {

    private static final Logger log = LoggerFactory.getLogger(BatteryStateClient.class);

    private final RestTemplate restTemplate;

    @Value("${app.services.battery-state-url:http://battery-state-service}")
    private String batteryStateUrl;

    public BatteryStateClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public double getCurrentChargeKwh() {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(
                    batteryStateUrl + "/api/battery/state", Map.class);
            if (response != null && response.containsKey("currentChargeKwh")) {
                Object val = response.get("currentChargeKwh");
                if (val instanceof Number n) {
                    return n.doubleValue();
                }
            }
        } catch (Exception e) {
            log.warn("Unable to fetch live battery state from {}: {}. Using fallback default.", batteryStateUrl, e.getMessage());
        }
        // Fallback default: 80.0 kWh (matches seed)
        return 80.0;
    }
}
