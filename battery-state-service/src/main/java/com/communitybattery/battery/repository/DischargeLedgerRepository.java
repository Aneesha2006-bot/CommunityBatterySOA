package com.communitybattery.battery.repository;

import com.communitybattery.battery.model.DischargeLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DischargeLedgerRepository extends JpaRepository<DischargeLedgerEntry, String> {
    List<DischargeLedgerEntry> findByMemberRefOrderByRecordedAtDesc(String memberRef);
}
