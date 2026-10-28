package com.communitybattery.discharge.client;

import com.communitybattery.discharge.dto.ReservePolicyDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ReservePolicyClient {

    private static final Logger log = LoggerFactory.getLogger(ReservePolicyClient.class);

    private final RestTemplate restTemplate;

    @Value("${app.services.reserve-policy-url:http://reserve-policy-service}")
    private String reservePolicyUrl;

    public ReservePolicyClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ReservePolicyDto getCurrentPolicy() {
        try {
            ReservePolicyDto policy = restTemplate.getForObject(
                    reservePolicyUrl + "/api/reserve/policy", ReservePolicyDto.class);
            if (policy != null) {
                return policy;
            }
        } catch (Exception e) {
            log.warn("Unable to fetch reserve policy from {}: {}. Using fallback defaults.", reservePolicyUrl, e.getMessage());
        }
        // Fallback default: floor 30.0 kWh, member cap 50.0 kWh (matches seed)
        return new ReservePolicyDto(1L, 0L, 30.0, 50.0);
    }
}
