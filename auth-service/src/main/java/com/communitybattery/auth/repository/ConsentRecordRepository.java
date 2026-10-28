package com.communitybattery.auth.repository;

import com.communitybattery.auth.model.ConsentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConsentRecordRepository extends JpaRepository<ConsentRecord, Long> {
    List<ConsentRecord> findBySubjectRefAndActiveTrue(String subjectRef);
    Optional<ConsentRecord> findBySubjectRefAndPurposeAndActiveTrue(String subjectRef, String purpose);
}
