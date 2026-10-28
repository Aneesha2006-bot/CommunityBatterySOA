-- Multi-database initialization script for PostgreSQL container
CREATE DATABASE auth_db;
CREATE DATABASE battery_db;
CREATE DATABASE policy_db;
CREATE DATABASE discharge_db;

GRANT ALL PRIVILEGES ON DATABASE auth_db TO cb_user;
GRANT ALL PRIVILEGES ON DATABASE battery_db TO cb_user;
GRANT ALL PRIVILEGES ON DATABASE policy_db TO cb_user;
GRANT ALL PRIVILEGES ON DATABASE discharge_db TO cb_user;
