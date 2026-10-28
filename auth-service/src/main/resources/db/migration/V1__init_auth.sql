-- V1: Auth Service schema initialisation
-- Compatible with H2 (MODE=PostgreSQL) and PostgreSQL

CREATE TABLE IF NOT EXISTS app_users (
    id         BIGSERIAL PRIMARY KEY,
    username   VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    subject_ref   VARCHAR(50)  NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT      NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS consent_records (
    id             BIGSERIAL PRIMARY KEY,
    subject_ref    VARCHAR(50)  NOT NULL,
    purpose        VARCHAR(100) NOT NULL,
    notice_version VARCHAR(20)  NOT NULL,
    consented_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    withdrawn_at   TIMESTAMP WITH TIME ZONE,
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (subject_ref, purpose)
);

CREATE TABLE IF NOT EXISTS privacy_requests (
    id           VARCHAR(36)   PRIMARY KEY,
    subject_ref  VARCHAR(50)   NOT NULL,
    request_type VARCHAR(20)   NOT NULL,
    description  VARCHAR(1000),
    status       VARCHAR(20)   NOT NULL DEFAULT 'RECEIVED',
    received_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at  TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_consent_subject  ON consent_records(subject_ref);
CREATE INDEX IF NOT EXISTS idx_privacy_subject  ON privacy_requests(subject_ref);
