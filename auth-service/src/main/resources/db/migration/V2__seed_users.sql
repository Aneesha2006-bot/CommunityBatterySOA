-- V2: Seed synthetic demo users with verified BCrypt hashes
-- member-a       password: member-a-pass
-- member-b       password: member-b-pass
-- coordinator-1  password: coord-pass

INSERT INTO app_users (username, password_hash, subject_ref, active) VALUES
('member-a',
 '$2a$10$VnqYazOyRFbo65VjZF4CtezNrhxddyf1..wOCtmOCxd10z/ZXL9Xq',
 'subj-member-a', TRUE),
('member-b',
 '$2a$10$HCtn3ZrVY.knOY28NCVrI.0167rjZm0/rPIFpUDSXQF/ayapAawfS',
 'subj-member-b', TRUE),
('coordinator-1',
 '$2a$10$p1tJBNaTzzSKWfhN3iWswuD1/HQuZMxf4i2LAmlv12dfdDvzZkD2i',
 'subj-coord-1', TRUE);

INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM app_users WHERE username = 'member-a'),      'member'),
((SELECT id FROM app_users WHERE username = 'member-b'),      'member'),
((SELECT id FROM app_users WHERE username = 'coordinator-1'), 'energyCoordinator');
