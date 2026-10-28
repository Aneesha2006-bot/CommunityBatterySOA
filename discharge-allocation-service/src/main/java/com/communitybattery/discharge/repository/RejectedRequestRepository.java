package com.communitybattery.discharge.repository;

import com.communitybattery.discharge.model.RejectedRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RejectedRequestRepository extends JpaRepository<RejectedRequest, String> {
    List<RejectedRequest> findByMemberRefOrderByTimestampDesc(String memberRef);
}
