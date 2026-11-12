-- Sample data (passwords are 'password')
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$QK6pG6mGPxVvFZz8V6dGxu4wV3u8N9cJYyF8l4aH6m2Q1G9H1s8G2', 'admin@example.com', 'ADMIN'),
('alice', '$2a$10$QK6pG6mGPxVvFZz8V6dGxu4wV3u8N9cJYyF8l4aH6m2Q1G9H1s8G2', 'alice@example.com', 'CUSTOMER'),
('bob', '$2a$10$QK6pG6mGPxVvFZz8V6dGxu4wV3u8N9cJYyF8l4aH6m2Q1G9H1s8G2', 'bob@example.com', 'CUSTOMER'),
('charlie', '$2a$10$QK6pG6mGPxVvFZz8V6dGxu4wV3u8N9cJYyF8l4aH6m2Q1G9H1s8G2', 'charlie@example.com', 'CUSTOMER');

INSERT INTO medicines (name, price, quantity, expiry_date, category) VALUES
('Paracetamol 500mg', 3.50, 100, DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'Painkiller'),
('Amoxicillin 250mg', 12.99, 50, DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'Antibiotic'),
('Cough Syrup', 5.75, 0, DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'Cold & Flu'),
('Ibuprofen 200mg', 4.25, 75, DATE_ADD(CURDATE(), INTERVAL 270 DAY), 'Painkiller'),
('Vitamin C Tablets', 8.50, 120, DATE_ADD(CURDATE(), INTERVAL 400 DAY), 'Supplements'),
('Blood Pressure Medicine', 15.99, 30, DATE_ADD(CURDATE(), INTERVAL 150 DAY), 'Cardiovascular');

-- Sample sales data for the past 30 days
INSERT INTO sales (user_id, total_amount, sale_date, status) VALUES
(2, 16.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'COMPLETED'), -- Alice
(3, 12.99, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'COMPLETED'), -- Bob
(4, 8.50, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'COMPLETED'), -- Charlie
(2, 7.75, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'COMPLETED'), -- Alice
(3, 4.25, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'COMPLETED'), -- Bob
(2, 29.48, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'COMPLETED'), -- Alice
(4, 15.99, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'COMPLETED'), -- Charlie
(3, 3.50, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'COMPLETED'), -- Bob
(2, 21.49, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 'COMPLETED'), -- Alice
(4, 12.99, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'COMPLETED'), -- Charlie
(3, 17.75, DATE_SUB(CURDATE(), INTERVAL 22 DAY), 'COMPLETED'), -- Bob
(2, 8.50, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'COMPLETED'), -- Alice
(4, 4.25, DATE_SUB(CURDATE(), INTERVAL 28 DAY), 'COMPLETED'); -- Charlie

-- Sale items for the sales
INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price) VALUES
(1, 1, 2, 3.50), (1, 4, 2, 4.25), -- Sale 1: Paracetamol + Ibuprofen
(2, 2, 1, 12.99), -- Sale 2: Amoxicillin
(3, 5, 1, 8.50), -- Sale 3: Vitamin C
(4, 1, 1, 3.50), (4, 4, 1, 4.25), -- Sale 4: Paracetamol + Ibuprofen
(5, 4, 1, 4.25), -- Sale 5: Ibuprofen
(6, 2, 1, 12.99), (6, 4, 1, 4.25), (6, 5, 1, 8.50), -- Sale 6: Amoxicillin + Ibuprofen + Vitamin C
(7, 6, 1, 15.99), -- Sale 7: Blood Pressure Medicine
(8, 1, 1, 3.50), -- Sale 8: Paracetamol
(9, 2, 1, 12.99), (9, 4, 1, 4.25), -- Sale 9: Amoxicillin + Ibuprofen
(10, 2, 1, 12.99), -- Sale 10: Amoxicillin
(11, 4, 2, 4.25), (11, 5, 1, 8.50), -- Sale 11: Ibuprofen + Vitamin C
(12, 5, 1, 8.50), -- Sale 12: Vitamin C
(13, 4, 1, 4.25); -- Sale 13: Ibuprofen

-- Sample deliveries
INSERT INTO deliveries (sale_id, address, status) VALUES
(1, '123 Main Street, City, State 12345', 'DELIVERED'),
(2, '456 Oak Avenue, City, State 12345', 'DELIVERED'),
(3, '789 Pine Road, City, State 12345', 'SHIPPED'),
(4, '321 Elm Street, City, State 12345', 'DELIVERED'),
(5, '654 Maple Drive, City, State 12345', 'DELIVERED'),
(6, '987 Cedar Lane, City, State 12345', 'PENDING');
