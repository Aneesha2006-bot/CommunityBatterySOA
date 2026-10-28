CREATE TABLE IF NOT EXISTS discharge_requests (
    id VARCHAR(36) PRIMARY KEY,
    member_ref VARCHAR(50) NOT NULL,
    requested_kwh DOUBLE PRECISION NOT NULL,
    granted_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
    denied_kwh DOUBLE PRECISION NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL,
    reason_code VARCHAR(30),
    emergency BOOLEAN NOT NULL DEFAULT FALSE,
    correlation_id VARCHAR(36),
    reserve_floor_kwh DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rejected_requests (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    member_ref VARCHAR(50) NOT NULL,
    denied_kwh DOUBLE PRECISION NOT NULL,
    reason_code VARCHAR(30) NOT NULL,
    correlation_id VARCHAR(36),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id VARCHAR(36) PRIMARY KEY,
    aggregate_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    published BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_requests_member ON discharge_requests(member_ref);
CREATE INDEX IF NOT EXISTS idx_rejected_member ON rejected_requests(member_ref);
CREATE INDEX IF NOT EXISTS idx_outbox_published ON outbox_events(published, created_at);
