-- Synthetic seed data: capacity 100 kWh, reserve floor 30 kWh, per-member cap 50 kWh
INSERT INTO reserve_policy (reserve_floor_kwh, per_member_daily_cap_kwh, updated_by, updated_at)
VALUES (30.0, 50.0, 'system-seed', NOW());
