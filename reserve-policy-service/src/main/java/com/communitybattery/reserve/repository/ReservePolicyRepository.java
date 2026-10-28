package com.communitybattery.reserve.repository;

import com.communitybattery.reserve.model.ReservePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReservePolicyRepository extends JpaRepository<ReservePolicy, Long> {
    Optional<ReservePolicy> findTopByOrderByIdDesc();
}
