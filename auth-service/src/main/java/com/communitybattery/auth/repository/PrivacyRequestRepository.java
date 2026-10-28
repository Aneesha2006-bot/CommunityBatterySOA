package com.communitybattery.auth.repository;

import com.communitybattery.auth.model.PrivacyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrivacyRequestRepository extends JpaRepository<PrivacyRequest, String> {
    List<PrivacyRequest> findBySubjectRefOrderByReceivedAtDesc(String subjectRef);
}
