package com.communitybattery.auth.service;

import com.communitybattery.auth.model.AppUser;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtTokenService {

    private final RSAKey rsaKey;

    @Value("${app.jwt.issuer}")
    private String issuer;

    @Value("${app.jwt.audience}")
    private String audience;

    @Value("${app.jwt.access-token-expiry-seconds:900}")
    private long accessTokenExpirySeconds;

    public JwtTokenService(RSAKey rsaKey) {
        this.rsaKey = rsaKey;
    }

    public String generateAccessToken(AppUser user) throws Exception {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(accessTokenExpirySeconds);

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(issuer)
                .subject(user.getSubjectRef())
                .audience(audience)
                .issueTime(Date.from(now))
                .expirationTime(Date.from(expiry))
                .jwtID(UUID.randomUUID().toString())
                .claim("roles", List.copyOf(user.getRoles()))
                .build();

        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID(rsaKey.getKeyID())
                .build();

        SignedJWT jwt = new SignedJWT(header, claims);
        jwt.sign(new RSASSASigner(rsaKey));
        return jwt.serialize();
    }

    /** Returns the configured access-token TTL in seconds (used by the token response). */
    public long getAccessTokenExpirySeconds() {
        return accessTokenExpirySeconds;
    }
}
