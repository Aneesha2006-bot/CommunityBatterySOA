CREATE TABLE IF NOT EXISTS reserve_policy (
    id BIGSERIAL PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    reserve_floor_kwh DOUBLE PRECISION NOT NULL CHECK (reserve_floor_kwh >= 0),
    per_member_daily_cap_kwh DOUBLE PRECISION NOT NULL CHECK (per_member_daily_cap_kwh > 0),
    updated_by VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
