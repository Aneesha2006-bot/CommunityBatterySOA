CREATE TABLE IF NOT EXISTS battery_state (
    id BIGSERIAL PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    capacity_kwh DOUBLE PRECISION NOT NULL CHECK (capacity_kwh >= 0),
    current_charge_kwh DOUBLE PRECISION NOT NULL CHECK (current_charge_kwh >= 0),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discharge_ledger (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL UNIQUE,
    request_id VARCHAR(36) NOT NULL,
    member_ref VARCHAR(50) NOT NULL,
    granted_kwh DOUBLE PRECISION NOT NULL,
    denied_kwh DOUBLE PRECISION NOT NULL,
    charge_before_kwh DOUBLE PRECISION NOT NULL,
    charge_after_kwh DOUBLE PRECISION NOT NULL,
    correlation_id VARCHAR(36),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS processed_events (
    event_id VARCHAR(36) PRIMARY KEY,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_member ON discharge_ledger(member_ref);
CREATE INDEX IF NOT EXISTS idx_ledger_recorded ON discharge_ledger(recorded_at);
