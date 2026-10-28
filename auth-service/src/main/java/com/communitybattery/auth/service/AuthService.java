package com.communitybattery.auth.service;

import com.communitybattery.auth.model.AppUser;
import com.communitybattery.auth.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(AppUserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    /**
     * Validates credentials and returns a signed access token.
     * Username is never included in the token; only the pseudonymous subjectRef is.
     */
    public String login(String username, String password) {
        AppUser user = userRepository.findByUsernameAndActiveTrue(username)
                .orElseThrow(() -> {
                    log.warn("event=login_failed reason=user_not_found");
                    return new BadCredentialsException("Invalid credentials");
                });

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            log.warn("event=login_failed reason=bad_password subject={}", user.getSubjectRef());
            throw new BadCredentialsException("Invalid credentials");
        }

        try {
            String token = jwtTokenService.generateAccessToken(user);
            log.info("event=login_success subject={}", user.getSubjectRef());
            return token;
        } catch (Exception e) {
            log.error("event=token_generation_failed subject={}", user.getSubjectRef(), e);
            throw new RuntimeException("Token generation failed", e);
        }
    }
}
