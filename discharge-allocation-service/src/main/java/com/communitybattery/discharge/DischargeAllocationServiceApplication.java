package com.communitybattery.discharge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DischargeAllocationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DischargeAllocationServiceApplication.class, args);
    }
}
