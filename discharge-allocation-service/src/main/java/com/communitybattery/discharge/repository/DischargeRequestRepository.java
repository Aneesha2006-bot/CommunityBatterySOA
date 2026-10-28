package com.communitybattery.discharge.repository;

import com.communitybattery.discharge.model.DischargeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DischargeRequestRepository extends JpaRepository<DischargeRequest, String> {
    List<DischargeRequest> findByMemberRefOrderByCreatedAtDesc(String memberRef);
    Optional<DischargeRequest> findByIdAndMemberRef(String id, String memberRef);
}
