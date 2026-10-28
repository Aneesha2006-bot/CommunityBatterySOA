package com.communitybattery.battery.repository;

import com.communitybattery.battery.model.BatteryState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface BatteryStateRepository extends JpaRepository<BatteryState, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM BatteryState b ORDER BY b.id DESC LIMIT 1")
    Optional<BatteryState> findCurrentStateForUpdate();

    @Query("SELECT b FROM BatteryState b ORDER BY b.id DESC LIMIT 1")
    Optional<BatteryState> findCurrentState();
}
