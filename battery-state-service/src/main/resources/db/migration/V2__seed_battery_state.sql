-- Synthetic seed data: 100 kWh capacity, 80 kWh current charge
INSERT INTO battery_state (capacity_kwh, current_charge_kwh, updated_at)
VALUES (100.0, 80.0, NOW());
