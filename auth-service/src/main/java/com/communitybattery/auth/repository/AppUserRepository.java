package com.communitybattery.auth.repository;

import com.communitybattery.auth.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsernameAndActiveTrue(String username);
    Optional<AppUser> findBySubjectRef(String subjectRef);
}
