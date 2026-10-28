package com.communitybattery.reserve.service;

import com.communitybattery.reserve.dto.ReservePolicyResponse;
import com.communitybattery.reserve.dto.UpdatePolicyRequest;
import com.communitybattery.reserve.model.ReservePolicy;
import com.communitybattery.reserve.repository.ReservePolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ReservePolicyService {

    private final ReservePolicyRepository repository;

    public ReservePolicyService(ReservePolicyRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ReservePolicyResponse getCurrentPolicy() {
        ReservePolicy policy = repository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new IllegalStateException("No reserve policy configured"));
        return toResponse(policy);
    }

    @Transactional
    public ReservePolicyResponse updatePolicy(UpdatePolicyRequest request, String updatedBy) {
        ReservePolicy policy = repository.findTopByOrderByIdDesc()
                .orElse(new ReservePolicy());
        policy.setReserveFloorKwh(request.reserveFloorKwh());
        policy.setPerMemberDailyCapKwh(request.perMemberDailyCapKwh());
        policy.setUpdatedBy(updatedBy);
        policy.setUpdatedAt(Instant.now());
        return toResponse(repository.save(policy));
    }

    private ReservePolicyResponse toResponse(ReservePolicy policy) {
        return new ReservePolicyResponse(
                policy.getId(),
                policy.getVersion(),
                policy.getReserveFloorKwh(),
                policy.getPerMemberDailyCapKwh(),
                policy.getUpdatedBy(),
                policy.getUpdatedAt()
        );
    }
}
