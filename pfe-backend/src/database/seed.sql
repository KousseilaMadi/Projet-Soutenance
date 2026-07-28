-- ============================================================
--  Seed Data — Cevital Packaging Manager
--  Rich dataset for late June 2026 demo
--  Product references: SKU-XXXX-PET format
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
--  Users — replace HASH with your real bcrypt hash
-- ------------------------------------------------------------
INSERT OR IGNORE INTO users (id, username, password_hash, role, created_at) VALUES
(1, 'admin',    '$2b$12$B21HeKTOoPJlyUrlHoSMXe5QmbQUl4OfUHzJl80zJQy6Na.7VGWmy', 'admin',    '2025-10-01 08:00:00'),
(2, 'manager',  '$2b$12$B21HeKTOoPJlyUrlHoSMXe5QmbQUl4OfUHzJl80zJQy6Na.7VGWmy', 'manager',  '2025-10-01 08:00:00'),
(3, 'operator', '$2b$12$B21HeKTOoPJlyUrlHoSMXe5QmbQUl4OfUHzJl80zJQy6Na.7VGWmy', 'operator', '2025-10-01 08:00:00');

-- ------------------------------------------------------------
--  Products (SKU-XXXX-PET format)
-- ------------------------------------------------------------
INSERT OR IGNORE INTO products (id, reference, name, category, unit, alert_threshold, created_at) VALUES
(1,  'SKU-3821-PET', 'Bouteille huile 1L',      'Bouteilles',  'unités',  500.0,  '2025-10-01 08:00:00'),
(2,  'SKU-4756-PET', 'Bouteille huile 5L',      'Bouteilles',  'unités',  300.0,  '2025-10-01 08:00:00'),
(3,  'SKU-9134-PET', 'Bouchon plastique 28mm',  'Bouchons',    'unités',  1000.0, '2025-10-01 08:00:00'),
(4,  'SKU-2047-PET', 'Carton 6 bouteilles',     'Cartons',     'unités',  200.0,  '2025-10-01 08:00:00'),
(5,  'SKU-6382-PET', 'Carton 12 bouteilles',    'Cartons',     'unités',  200.0,  '2025-10-01 08:00:00'),
(6,  'SKU-1593-PET', 'Etiquette huile 1L',      'Etiquettes',  'unités',  1000.0, '2025-10-01 08:00:00'),
(7,  'SKU-8274-PET', 'Etiquette huile 5L',      'Etiquettes',  'unités',  800.0,  '2025-10-01 08:00:00'),
(8,  'SKU-5019-PET', 'Sachet sucre 1kg',        'Sachets',     'unités',  400.0,  '2025-10-01 08:00:00'),
(9,  'SKU-7463-PET', 'Film plastique étirable', 'Films',       'mètres',  200.0,  '2025-10-01 08:00:00'),
(10, 'SKU-3908-PET', 'Palette bois 120x80',     'Palettes',    'unités',  50.0,   '2025-10-01 08:00:00'),
(11, 'SKU-6521-PET', 'Bidon huile 20L',         'Bidons',      'unités',  100.0,  '2025-10-01 08:00:00'),
(12, 'SKU-2847-PET', 'Sachet sucre 5kg',        'Sachets',     'unités',  300.0,  '2025-10-01 08:00:00'),
(13, 'SKU-4193-PET', 'Bouteille eau 1.5L',      'Bouteilles',  'unités',  600.0,  '2025-10-01 08:00:00'),
(14, 'SKU-7836-PET', 'Capsule aluminium 28mm',  'Capsules',    'unités',  2000.0, '2025-10-01 08:00:00'),
(15, 'SKU-1074-PET', 'Etiquette eau 1.5L',      'Etiquettes',  'unités',  1500.0, '2025-10-01 08:00:00');

-- ------------------------------------------------------------
--  Suppliers
-- ------------------------------------------------------------
INSERT OR IGNORE INTO suppliers (id, name, contact, phone, address, is_active) VALUES
(1, 'AlgéPack SARL',      'Karim Benali',    '0555 12 34 56', 'Zone industrielle Rouiba, Alger',          1),
(2, 'MediPlast SPA',      'Samira Ouali',    '0661 98 76 54', 'Rue des frères Bouadou, Bir Mourad Raïs',  1),
(3, 'EmballSud EURL',     'Youcef Hamdi',    '0770 45 67 89', 'Lotissement El Wiam, Oran',                1),
(4, 'NordEmbal SPA',      'Fatima Cherif',   '0550 23 45 67', 'Zone activité Oued Smar, Alger',           1),
(5, 'PackExpress SARL',   'Amine Meziane',   '0663 34 56 78', 'BP 142, Annaba',                           1),
(6, 'CapAlgérie EURL',    'Rachid Touati',   '0771 88 99 00', 'Rue Hassiba Ben Bouali, Alger',            1),
(7, 'ImprimPack SPA',     'Nadia Khelifi',   '0556 44 22 11', 'Zone franche Bellara, Jijel',              1);

-- ------------------------------------------------------------
--  Product Suppliers
-- ------------------------------------------------------------
INSERT OR IGNORE INTO product_suppliers (product_id, supplier_id, unit_price, delivery_days, reliability_score) VALUES
-- Bouteille huile 1L
(1, 1, 12.50,  7,  0.92),
(1, 2, 11.80,  10, 0.85),
(1, 3, 13.20,  5,  0.95),
-- Bouteille huile 5L
(2, 1, 45.00,  7,  0.92),
(2, 4, 43.50,  12, 0.88),
(2, 3, 46.00,  5,  0.90),
-- Bouchon plastique 28mm
(3, 2, 1.20,   10, 0.85),
(3, 3, 1.05,   5,  0.95),
(3, 5, 1.35,   3,  0.78),
(3, 6, 1.10,   7,  0.91),
-- Carton 6 bouteilles
(4, 1, 8.50,   7,  0.92),
(4, 4, 7.80,   12, 0.88),
(4, 7, 8.20,   6,  0.89),
-- Carton 12 bouteilles
(5, 1, 9.20,   7,  0.92),
(5, 3, 8.90,   5,  0.95),
(5, 7, 9.00,   6,  0.87),
-- Etiquette huile 1L
(6, 2, 0.85,   10, 0.85),
(6, 5, 0.75,   3,  0.78),
(6, 7, 0.80,   6,  0.90),
-- Etiquette huile 5L
(7, 2, 0.95,   10, 0.85),
(7, 4, 0.88,   12, 0.88),
(7, 7, 0.91,   6,  0.90),
-- Sachet sucre 1kg
(8, 3, 3.20,   5,  0.95),
(8, 5, 2.95,   3,  0.78),
(8, 2, 3.10,   8,  0.87),
-- Film plastique
(9, 4, 15.00,  12, 0.88),
(9, 5, 14.50,  3,  0.78),
(9, 1, 15.50,  7,  0.93),
-- Palette bois
(10, 1, 180.00, 7,  0.92),
(10, 3, 165.00, 5,  0.95),
(10, 4, 170.00, 10, 0.86),
-- Bidon huile 20L
(11, 2, 120.00, 10, 0.85),
(11, 4, 115.00, 12, 0.88),
(11, 6, 118.00, 7,  0.91),
-- Sachet sucre 5kg
(12, 3, 4.50,   5,  0.95),
(12, 5, 4.20,   3,  0.78),
(12, 2, 4.35,   8,  0.87),
-- Bouteille eau 1.5L
(13, 1, 8.90,   7,  0.92),
(13, 3, 8.50,   5,  0.95),
(13, 6, 9.10,   6,  0.89),
-- Capsule aluminium 28mm
(14, 6, 0.45,   7,  0.91),
(14, 2, 0.50,   10, 0.85),
(14, 5, 0.42,   3,  0.78),
-- Etiquette eau 1.5L
(15, 7, 0.65,   6,  0.90),
(15, 2, 0.70,   10, 0.85),
(15, 5, 0.60,   3,  0.78);

-- ------------------------------------------------------------
--  Storage (current stock — June 22 2026)
--  Products 8, 11, 13 below threshold
--  Product 14 near threshold
-- ------------------------------------------------------------
INSERT OR IGNORE INTO storage (product_id, quantity, max_capacity, updated_at) VALUES
(1,  780.0,  5000.0,  '2026-06-22 08:00:00'),
(2,  420.0,  3000.0,  '2026-06-22 08:00:00'),
(3,  1650.0, 10000.0, '2026-06-22 08:00:00'),
(4,  340.0,  2000.0,  '2026-06-22 08:00:00'),
(5,  260.0,  2000.0,  '2026-06-22 08:00:00'),
(6,  480.0,  8000.0,  '2026-06-22 08:00:00'),
(7,  390.0,  6000.0,  '2026-06-22 08:00:00'),
(8,  165.0,  4000.0,  '2026-06-22 08:00:00'),
(9,  280.0,  2000.0,  '2026-06-22 08:00:00'),
(10, 58.0,   500.0,   '2026-06-22 08:00:00'),
(11, 72.0,   1000.0,  '2026-06-22 08:00:00'),
(12, 255.0,  3000.0,  '2026-06-22 08:00:00'),
(13, 310.0,  5000.0,  '2026-06-22 08:00:00'),
(14, 1820.0, 15000.0, '2026-06-22 08:00:00'),
(15, 920.0,  10000.0, '2026-06-22 08:00:00');

-- ------------------------------------------------------------
--  Storage History
--  Old context: late 2025
--  Recent: May 23 to June 22 2026 (last 30 days)
-- ------------------------------------------------------------

-- ── Product 1: Bouteille huile 1L (avg ~201 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(1, 3, 'entry', 2000.0, 'Livraison AlgéPack',   '2025-11-10 08:00:00'),
(1, 3, 'exit',  198.0,  'Ligne production A',   '2025-11-24 09:00:00'),
(1, 3, 'exit',  204.0,  'Ligne production B',   '2025-12-08 09:00:00'),
(1, 3, 'entry', 2000.0, 'Livraison EmballSud',  '2025-12-22 08:00:00'),
(1, 3, 'exit',  200.0,  'Ligne production A',   '2026-01-05 09:00:00'),
(1, 3, 'exit',  203.0,  'Ligne production B',   '2026-01-19 09:00:00'),
(1, 3, 'entry', 2000.0, 'Livraison AlgéPack',   '2026-02-02 08:00:00'),
(1, 3, 'exit',  197.0,  'Ligne production A',   '2026-02-16 09:00:00'),
(1, 3, 'exit',  205.0,  'Ligne production B',   '2026-03-02 09:00:00'),
(1, 3, 'entry', 2000.0, 'Livraison MediPlast',  '2026-03-16 08:00:00'),
(1, 3, 'exit',  201.0,  'Ligne production A',   '2026-03-30 09:00:00'),
(1, 3, 'exit',  199.0,  'Ligne production B',   '2026-04-13 09:00:00'),
(1, 3, 'entry', 2000.0, 'Livraison AlgéPack',   '2026-04-27 08:00:00'),
(1, 3, 'exit',  202.0,  'Ligne production A',   '2026-05-11 09:00:00'),
(1, 3, 'exit',  198.0,  'Ligne production B',   '2026-05-18 09:00:00'),
-- recent (last 30 days)
(1, 3, 'exit',  203.0,  'Ligne production A',   '2026-05-23 09:00:00'),
(1, 3, 'exit',  199.0,  'Ligne production B',   '2026-05-26 09:00:00'),
(1, 3, 'exit',  201.0,  'Ligne production A',   '2026-05-29 09:00:00'),
(1, 3, 'exit',  204.0,  'Ligne production B',   '2026-06-01 09:00:00'),
(1, 3, 'exit',  198.0,  'Ligne production A',   '2026-06-04 09:00:00'),
(1, 3, 'exit',  202.0,  'Ligne production B',   '2026-06-07 09:00:00'),
(1, 3, 'exit',  200.0,  'Ligne production A',   '2026-06-10 09:00:00'),
(1, 3, 'exit',  203.0,  'Ligne production B',   '2026-06-13 09:00:00'),
(1, 3, 'exit',  197.0,  'Ligne production A',   '2026-06-16 09:00:00'),
(1, 3, 'exit',  201.0,  'Ligne production B',   '2026-06-19 09:00:00'),
(1, 3, 'exit',  199.0,  'Ligne production A',   '2026-06-22 09:00:00');

-- ── Product 2: Bouteille huile 5L (avg ~89 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(2, 3, 'entry', 1500.0, 'Livraison AlgéPack',   '2025-11-10 08:00:00'),
(2, 3, 'exit',  86.0,   'Ligne production C',   '2025-11-24 09:00:00'),
(2, 3, 'exit',  91.0,   'Ligne production C',   '2025-12-08 09:00:00'),
(2, 3, 'entry', 1500.0, 'Livraison NordEmbal',  '2025-12-22 08:00:00'),
(2, 3, 'exit',  88.0,   'Ligne production C',   '2026-01-05 09:00:00'),
(2, 3, 'exit',  90.0,   'Ligne production C',   '2026-01-19 09:00:00'),
(2, 3, 'entry', 1500.0, 'Livraison AlgéPack',   '2026-02-02 08:00:00'),
(2, 3, 'exit',  87.0,   'Ligne production C',   '2026-02-16 09:00:00'),
(2, 3, 'exit',  92.0,   'Ligne production C',   '2026-03-02 09:00:00'),
(2, 3, 'entry', 1500.0, 'Livraison NordEmbal',  '2026-04-13 08:00:00'),
(2, 3, 'exit',  89.0,   'Ligne production C',   '2026-04-27 09:00:00'),
(2, 3, 'exit',  88.0,   'Ligne production C',   '2026-05-11 09:00:00'),
-- recent
(2, 3, 'exit',  90.0,   'Ligne production C',   '2026-05-23 09:00:00'),
(2, 3, 'exit',  87.0,   'Ligne production C',   '2026-05-28 09:00:00'),
(2, 3, 'exit',  91.0,   'Ligne production C',   '2026-06-02 09:00:00'),
(2, 3, 'exit',  89.0,   'Ligne production C',   '2026-06-07 09:00:00'),
(2, 3, 'exit',  88.0,   'Ligne production C',   '2026-06-12 09:00:00'),
(2, 3, 'exit',  90.0,   'Ligne production C',   '2026-06-17 09:00:00'),
(2, 3, 'exit',  89.0,   'Ligne production C',   '2026-06-22 09:00:00');

-- ── Product 3: Bouchon plastique 28mm (avg ~403 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(3, 3, 'entry', 5000.0, 'Livraison MediPlast',  '2025-11-10 08:00:00'),
(3, 3, 'exit',  400.0,  'Ligne A+B',            '2025-11-24 09:00:00'),
(3, 3, 'exit',  408.0,  'Ligne A+B',            '2025-12-08 09:00:00'),
(3, 3, 'entry', 5000.0, 'Livraison EmballSud',  '2025-12-22 08:00:00'),
(3, 3, 'exit',  402.0,  'Ligne A+B',            '2026-01-05 09:00:00'),
(3, 3, 'exit',  406.0,  'Ligne A+B',            '2026-01-19 09:00:00'),
(3, 3, 'entry', 5000.0, 'Livraison MediPlast',  '2026-02-02 08:00:00'),
(3, 3, 'exit',  398.0,  'Ligne A+B',            '2026-02-16 09:00:00'),
(3, 3, 'exit',  410.0,  'Ligne A+B',            '2026-03-02 09:00:00'),
(3, 3, 'entry', 5000.0, 'Livraison EmballSud',  '2026-04-13 08:00:00'),
(3, 3, 'exit',  404.0,  'Ligne A+B',            '2026-04-27 09:00:00'),
(3, 3, 'exit',  400.0,  'Ligne A+B',            '2026-05-11 09:00:00'),
-- recent
(3, 3, 'exit',  405.0,  'Ligne A+B',            '2026-05-23 09:00:00'),
(3, 3, 'exit',  401.0,  'Ligne A+B',            '2026-05-27 09:00:00'),
(3, 3, 'exit',  407.0,  'Ligne A+B',            '2026-05-31 09:00:00'),
(3, 3, 'exit',  403.0,  'Ligne A+B',            '2026-06-04 09:00:00'),
(3, 3, 'exit',  399.0,  'Ligne A+B',            '2026-06-08 09:00:00'),
(3, 3, 'exit',  406.0,  'Ligne A+B',            '2026-06-12 09:00:00'),
(3, 3, 'exit',  402.0,  'Ligne A+B',            '2026-06-16 09:00:00'),
(3, 3, 'exit',  404.0,  'Ligne A+B',            '2026-06-20 09:00:00');

-- ── Product 4: Carton 6 bouteilles (avg ~69 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(4, 3, 'entry', 1000.0, 'Livraison AlgéPack',   '2025-11-10 08:00:00'),
(4, 3, 'exit',  66.0,   'Conditionnement',      '2025-11-24 09:00:00'),
(4, 3, 'exit',  71.0,   'Conditionnement',      '2025-12-08 09:00:00'),
(4, 3, 'entry', 1000.0, 'Livraison NordEmbal',  '2026-01-05 08:00:00'),
(4, 3, 'exit',  68.0,   'Conditionnement',      '2026-01-19 09:00:00'),
(4, 3, 'exit',  70.0,   'Conditionnement',      '2026-02-02 09:00:00'),
(4, 3, 'entry', 1000.0, 'Livraison AlgéPack',   '2026-03-16 08:00:00'),
(4, 3, 'exit',  69.0,   'Conditionnement',      '2026-03-30 09:00:00'),
(4, 3, 'exit',  67.0,   'Conditionnement',      '2026-04-13 09:00:00'),
(4, 3, 'entry', 1000.0, 'Livraison NordEmbal',  '2026-05-11 08:00:00'),
-- recent
(4, 3, 'exit',  70.0,   'Conditionnement',      '2026-05-23 09:00:00'),
(4, 3, 'exit',  68.0,   'Conditionnement',      '2026-05-28 09:00:00'),
(4, 3, 'exit',  71.0,   'Conditionnement',      '2026-06-02 09:00:00'),
(4, 3, 'exit',  69.0,   'Conditionnement',      '2026-06-07 09:00:00'),
(4, 3, 'exit',  67.0,   'Conditionnement',      '2026-06-12 09:00:00'),
(4, 3, 'exit',  70.0,   'Conditionnement',      '2026-06-17 09:00:00'),
(4, 3, 'exit',  68.0,   'Conditionnement',      '2026-06-22 09:00:00');

-- ── Product 5: Carton 12 bouteilles (avg ~59 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(5, 3, 'entry', 1000.0, 'Livraison AlgéPack',   '2025-11-10 08:00:00'),
(5, 3, 'exit',  56.0,   'Conditionnement',      '2025-11-24 09:00:00'),
(5, 3, 'exit',  61.0,   'Conditionnement',      '2025-12-08 09:00:00'),
(5, 3, 'entry', 1000.0, 'Livraison EmballSud',  '2026-01-05 08:00:00'),
(5, 3, 'exit',  58.0,   'Conditionnement',      '2026-01-19 09:00:00'),
(5, 3, 'exit',  60.0,   'Conditionnement',      '2026-02-02 09:00:00'),
(5, 3, 'entry', 1000.0, 'Livraison AlgéPack',   '2026-03-16 08:00:00'),
(5, 3, 'exit',  59.0,   'Conditionnement',      '2026-03-30 09:00:00'),
(5, 3, 'exit',  57.0,   'Conditionnement',      '2026-04-13 09:00:00'),
(5, 3, 'entry', 1000.0, 'Livraison EmballSud',  '2026-05-11 08:00:00'),
-- recent
(5, 3, 'exit',  60.0,   'Conditionnement',      '2026-05-23 09:00:00'),
(5, 3, 'exit',  58.0,   'Conditionnement',      '2026-05-28 09:00:00'),
(5, 3, 'exit',  61.0,   'Conditionnement',      '2026-06-02 09:00:00'),
(5, 3, 'exit',  59.0,   'Conditionnement',      '2026-06-07 09:00:00'),
(5, 3, 'exit',  57.0,   'Conditionnement',      '2026-06-12 09:00:00'),
(5, 3, 'exit',  60.0,   'Conditionnement',      '2026-06-17 09:00:00'),
(5, 3, 'exit',  59.0,   'Conditionnement',      '2026-06-22 09:00:00');

-- ── Product 6: Etiquette huile 1L (avg ~200 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(6, 3, 'entry', 4000.0, 'Livraison MediPlast',   '2025-11-10 08:00:00'),
(6, 3, 'exit',  196.0,  'Ligne production A',    '2025-11-24 09:00:00'),
(6, 3, 'exit',  204.0,  'Ligne production A',    '2025-12-08 09:00:00'),
(6, 3, 'entry', 4000.0, 'Livraison PackExpress', '2026-01-05 08:00:00'),
(6, 3, 'exit',  199.0,  'Ligne production A',    '2026-01-19 09:00:00'),
(6, 3, 'exit',  201.0,  'Ligne production A',    '2026-02-02 09:00:00'),
(6, 3, 'entry', 4000.0, 'Livraison ImprimPack',  '2026-03-16 08:00:00'),
(6, 3, 'exit',  200.0,  'Ligne production A',    '2026-03-30 09:00:00'),
(6, 3, 'exit',  198.0,  'Ligne production A',    '2026-04-13 09:00:00'),
(6, 3, 'entry', 4000.0, 'Livraison MediPlast',   '2026-05-11 08:00:00'),
-- recent
(6, 3, 'exit',  202.0,  'Ligne production A',    '2026-05-23 09:00:00'),
(6, 3, 'exit',  199.0,  'Ligne production A',    '2026-05-27 09:00:00'),
(6, 3, 'exit',  201.0,  'Ligne production A',    '2026-05-31 09:00:00'),
(6, 3, 'exit',  200.0,  'Ligne production A',    '2026-06-04 09:00:00'),
(6, 3, 'exit',  198.0,  'Ligne production A',    '2026-06-08 09:00:00'),
(6, 3, 'exit',  203.0,  'Ligne production A',    '2026-06-12 09:00:00'),
(6, 3, 'exit',  199.0,  'Ligne production A',    '2026-06-16 09:00:00'),
(6, 3, 'exit',  201.0,  'Ligne production A',    '2026-06-20 09:00:00');

-- ── Product 7: Etiquette huile 5L (avg ~90 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(7, 3, 'entry', 3000.0, 'Livraison MediPlast',  '2025-11-10 08:00:00'),
(7, 3, 'exit',  87.0,   'Ligne production C',   '2025-11-24 09:00:00'),
(7, 3, 'exit',  93.0,   'Ligne production C',   '2025-12-08 09:00:00'),
(7, 3, 'entry', 3000.0, 'Livraison NordEmbal',  '2026-01-05 08:00:00'),
(7, 3, 'exit',  90.0,   'Ligne production C',   '2026-01-19 09:00:00'),
(7, 3, 'exit',  88.0,   'Ligne production C',   '2026-02-02 09:00:00'),
(7, 3, 'entry', 3000.0, 'Livraison ImprimPack', '2026-03-16 08:00:00'),
(7, 3, 'exit',  91.0,   'Ligne production C',   '2026-03-30 09:00:00'),
(7, 3, 'exit',  89.0,   'Ligne production C',   '2026-04-13 09:00:00'),
(7, 3, 'entry', 3000.0, 'Livraison MediPlast',  '2026-05-11 08:00:00'),
-- recent
(7, 3, 'exit',  90.0,   'Ligne production C',   '2026-05-23 09:00:00'),
(7, 3, 'exit',  88.0,   'Ligne production C',   '2026-05-28 09:00:00'),
(7, 3, 'exit',  92.0,   'Ligne production C',   '2026-06-02 09:00:00'),
(7, 3, 'exit',  89.0,   'Ligne production C',   '2026-06-07 09:00:00'),
(7, 3, 'exit',  91.0,   'Ligne production C',   '2026-06-12 09:00:00'),
(7, 3, 'exit',  90.0,   'Ligne production C',   '2026-06-17 09:00:00'),
(7, 3, 'exit',  88.0,   'Ligne production C',   '2026-06-22 09:00:00');

-- ── Product 8: Sachet sucre 1kg (BELOW THRESHOLD — avg ~163 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(8, 3, 'entry', 2000.0, 'Livraison EmballSud',   '2025-11-10 08:00:00'),
(8, 3, 'exit',  159.0,  'Ligne production D',    '2025-11-24 09:00:00'),
(8, 3, 'exit',  166.0,  'Ligne production D',    '2025-12-08 09:00:00'),
(8, 3, 'entry', 2000.0, 'Livraison PackExpress', '2025-12-22 08:00:00'),
(8, 3, 'exit',  162.0,  'Ligne production D',    '2026-01-05 09:00:00'),
(8, 3, 'exit',  164.0,  'Ligne production D',    '2026-01-19 09:00:00'),
(8, 3, 'entry', 2000.0, 'Livraison EmballSud',   '2026-02-02 08:00:00'),
(8, 3, 'exit',  160.0,  'Ligne production D',    '2026-02-16 09:00:00'),
(8, 3, 'exit',  167.0,  'Ligne production D',    '2026-03-02 09:00:00'),
(8, 3, 'entry', 2000.0, 'Livraison PackExpress', '2026-04-13 08:00:00'),
(8, 3, 'exit',  163.0,  'Ligne production D',    '2026-04-27 09:00:00'),
(8, 3, 'exit',  161.0,  'Ligne production D',    '2026-05-11 09:00:00'),
-- recent
(8, 3, 'exit',  164.0,  'Ligne production D',    '2026-05-23 09:00:00'),
(8, 3, 'exit',  160.0,  'Ligne production D',    '2026-05-26 09:00:00'),
(8, 3, 'exit',  166.0,  'Ligne production D',    '2026-05-29 09:00:00'),
(8, 3, 'exit',  162.0,  'Ligne production D',    '2026-06-01 09:00:00'),
(8, 3, 'exit',  165.0,  'Ligne production D',    '2026-06-04 09:00:00'),
(8, 3, 'exit',  161.0,  'Ligne production D',    '2026-06-07 09:00:00'),
(8, 3, 'exit',  163.0,  'Ligne production D',    '2026-06-10 09:00:00'),
(8, 3, 'exit',  164.0,  'Ligne production D',    '2026-06-13 09:00:00'),
(8, 3, 'exit',  160.0,  'Ligne production D',    '2026-06-16 09:00:00'),
(8, 3, 'exit',  163.0,  'Ligne production D',    '2026-06-19 09:00:00'),
(8, 3, 'exit',  162.0,  'Ligne production D',    '2026-06-22 09:00:00');

-- ── Product 9: Film plastique (avg ~49 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(9, 3, 'entry', 1000.0, 'Livraison NordEmbal',   '2025-11-10 08:00:00'),
(9, 3, 'exit',  46.0,   'Emballage',             '2025-11-24 09:00:00'),
(9, 3, 'exit',  51.0,   'Emballage',             '2025-12-08 09:00:00'),
(9, 3, 'entry', 1000.0, 'Livraison PackExpress',  '2026-01-05 08:00:00'),
(9, 3, 'exit',  48.0,   'Emballage',             '2026-01-19 09:00:00'),
(9, 3, 'exit',  50.0,   'Emballage',             '2026-02-02 09:00:00'),
(9, 3, 'entry', 1000.0, 'Livraison NordEmbal',   '2026-03-16 08:00:00'),
(9, 3, 'exit',  49.0,   'Emballage',             '2026-03-30 09:00:00'),
(9, 3, 'exit',  47.0,   'Emballage',             '2026-04-13 09:00:00'),
(9, 3, 'entry', 1000.0, 'Livraison PackExpress',  '2026-05-11 08:00:00'),
-- recent
(9, 3, 'exit',  50.0,   'Emballage',             '2026-05-23 09:00:00'),
(9, 3, 'exit',  48.0,   'Emballage',             '2026-05-30 09:00:00'),
(9, 3, 'exit',  51.0,   'Emballage',             '2026-06-06 09:00:00'),
(9, 3, 'exit',  49.0,   'Emballage',             '2026-06-13 09:00:00'),
(9, 3, 'exit',  48.0,   'Emballage',             '2026-06-20 09:00:00');

-- ── Product 10: Palette bois (avg ~20 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(10, 3, 'entry', 200.0, 'Livraison AlgéPack',    '2025-11-10 08:00:00'),
(10, 3, 'exit',  19.0,  'Expédition',            '2025-11-24 09:00:00'),
(10, 3, 'exit',  21.0,  'Expédition',            '2025-12-08 09:00:00'),
(10, 3, 'entry', 200.0, 'Livraison EmballSud',   '2026-01-05 08:00:00'),
(10, 3, 'exit',  20.0,  'Expédition',            '2026-01-19 09:00:00'),
(10, 3, 'exit',  21.0,  'Expédition',            '2026-02-02 09:00:00'),
(10, 3, 'entry', 200.0, 'Livraison AlgéPack',    '2026-03-16 08:00:00'),
(10, 3, 'exit',  19.0,  'Expédition',            '2026-03-30 09:00:00'),
(10, 3, 'exit',  20.0,  'Expédition',            '2026-04-13 09:00:00'),
(10, 3, 'entry', 200.0, 'Livraison EmballSud',   '2026-05-11 08:00:00'),
-- recent
(10, 3, 'exit',  21.0,  'Expédition',            '2026-05-23 09:00:00'),
(10, 3, 'exit',  20.0,  'Expédition',            '2026-05-30 09:00:00'),
(10, 3, 'exit',  19.0,  'Expédition',            '2026-06-06 09:00:00'),
(10, 3, 'exit',  21.0,  'Expédition',            '2026-06-13 09:00:00'),
(10, 3, 'exit',  20.0,  'Expédition',            '2026-06-20 09:00:00');

-- ── Product 11: Bidon huile 20L (CRITICAL — avg ~31 units/exit, ~2.3 days to stockout) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(11, 3, 'entry', 500.0, 'Livraison MediPlast',   '2025-11-10 08:00:00'),
(11, 3, 'exit',  29.0,  'Ligne production E',    '2025-11-24 09:00:00'),
(11, 3, 'exit',  33.0,  'Ligne production E',    '2025-12-08 09:00:00'),
(11, 3, 'entry', 500.0, 'Livraison NordEmbal',   '2025-12-22 08:00:00'),
(11, 3, 'exit',  30.0,  'Ligne production E',    '2026-01-05 09:00:00'),
(11, 3, 'exit',  32.0,  'Ligne production E',    '2026-01-19 09:00:00'),
(11, 3, 'entry', 500.0, 'Livraison CapAlgérie',  '2026-02-02 08:00:00'),
(11, 3, 'exit',  31.0,  'Ligne production E',    '2026-02-16 09:00:00'),
(11, 3, 'exit',  30.0,  'Ligne production E',    '2026-03-02 09:00:00'),
(11, 3, 'entry', 500.0, 'Livraison MediPlast',   '2026-04-13 08:00:00'),
(11, 3, 'exit',  32.0,  'Ligne production E',    '2026-04-27 09:00:00'),
(11, 3, 'exit',  31.0,  'Ligne production E',    '2026-05-11 09:00:00'),
-- recent
(11, 3, 'exit',  30.0,  'Ligne production E',    '2026-05-23 09:00:00'),
(11, 3, 'exit',  32.0,  'Ligne production E',    '2026-05-26 09:00:00'),
(11, 3, 'exit',  31.0,  'Ligne production E',    '2026-05-29 09:00:00'),
(11, 3, 'exit',  29.0,  'Ligne production E',    '2026-06-01 09:00:00'),
(11, 3, 'exit',  33.0,  'Ligne production E',    '2026-06-04 09:00:00'),
(11, 3, 'exit',  31.0,  'Ligne production E',    '2026-06-07 09:00:00'),
(11, 3, 'exit',  30.0,  'Ligne production E',    '2026-06-10 09:00:00'),
(11, 3, 'exit',  32.0,  'Ligne production E',    '2026-06-13 09:00:00'),
(11, 3, 'exit',  31.0,  'Ligne production E',    '2026-06-16 09:00:00'),
(11, 3, 'exit',  29.0,  'Ligne production E',    '2026-06-19 09:00:00'),
(11, 3, 'exit',  32.0,  'Ligne production E',    '2026-06-22 09:00:00');

-- ── Product 12: Sachet sucre 5kg (avg ~60 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(12, 3, 'entry', 1500.0, 'Livraison EmballSud',  '2025-11-10 08:00:00'),
(12, 3, 'exit',  58.0,   'Ligne production D',   '2025-11-24 09:00:00'),
(12, 3, 'exit',  62.0,   'Ligne production D',   '2025-12-08 09:00:00'),
(12, 3, 'entry', 1500.0, 'Livraison PackExpress','2026-01-05 08:00:00'),
(12, 3, 'exit',  60.0,   'Ligne production D',   '2026-01-19 09:00:00'),
(12, 3, 'exit',  59.0,   'Ligne production D',   '2026-02-02 09:00:00'),
(12, 3, 'entry', 1500.0, 'Livraison EmballSud',  '2026-03-16 08:00:00'),
(12, 3, 'exit',  61.0,   'Ligne production D',   '2026-03-30 09:00:00'),
(12, 3, 'exit',  58.0,   'Ligne production D',   '2026-04-13 09:00:00'),
(12, 3, 'entry', 1500.0, 'Livraison PackExpress','2026-05-11 08:00:00'),
-- recent
(12, 3, 'exit',  60.0,   'Ligne production D',   '2026-05-23 09:00:00'),
(12, 3, 'exit',  59.0,   'Ligne production D',   '2026-05-30 09:00:00'),
(12, 3, 'exit',  61.0,   'Ligne production D',   '2026-06-06 09:00:00'),
(12, 3, 'exit',  60.0,   'Ligne production D',   '2026-06-13 09:00:00'),
(12, 3, 'exit',  58.0,   'Ligne production D',   '2026-06-20 09:00:00');

-- ── Product 13: Bouteille eau 1.5L (BELOW THRESHOLD — avg ~122 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(13, 3, 'entry', 3000.0, 'Livraison AlgéPack',   '2025-11-10 08:00:00'),
(13, 3, 'exit',  120.0,  'Ligne production F',   '2025-11-24 09:00:00'),
(13, 3, 'exit',  124.0,  'Ligne production F',   '2025-12-08 09:00:00'),
(13, 3, 'entry', 3000.0, 'Livraison EmballSud',  '2025-12-22 08:00:00'),
(13, 3, 'exit',  121.0,  'Ligne production F',   '2026-01-05 09:00:00'),
(13, 3, 'exit',  123.0,  'Ligne production F',   '2026-01-19 09:00:00'),
(13, 3, 'entry', 3000.0, 'Livraison AlgéPack',   '2026-02-02 08:00:00'),
(13, 3, 'exit',  122.0,  'Ligne production F',   '2026-02-16 09:00:00'),
(13, 3, 'exit',  120.0,  'Ligne production F',   '2026-03-02 09:00:00'),
(13, 3, 'entry', 3000.0, 'Livraison CapAlgérie', '2026-04-13 08:00:00'),
(13, 3, 'exit',  124.0,  'Ligne production F',   '2026-04-27 09:00:00'),
(13, 3, 'exit',  121.0,  'Ligne production F',   '2026-05-11 09:00:00'),
-- recent
(13, 3, 'exit',  123.0,  'Ligne production F',   '2026-05-23 09:00:00'),
(13, 3, 'exit',  120.0,  'Ligne production F',   '2026-05-27 09:00:00'),
(13, 3, 'exit',  122.0,  'Ligne production F',   '2026-05-31 09:00:00'),
(13, 3, 'exit',  124.0,  'Ligne production F',   '2026-06-04 09:00:00'),
(13, 3, 'exit',  121.0,  'Ligne production F',   '2026-06-08 09:00:00'),
(13, 3, 'exit',  123.0,  'Ligne production F',   '2026-06-12 09:00:00'),
(13, 3, 'exit',  120.0,  'Ligne production F',   '2026-06-16 09:00:00'),
(13, 3, 'exit',  122.0,  'Ligne production F',   '2026-06-20 09:00:00');

-- ── Product 14: Capsule aluminium 28mm (near threshold — avg ~198 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(14, 3, 'entry', 5000.0, 'Livraison CapAlgérie', '2025-11-10 08:00:00'),
(14, 3, 'exit',  195.0,  'Ligne production A+C', '2025-11-24 09:00:00'),
(14, 3, 'exit',  201.0,  'Ligne production A+C', '2025-12-08 09:00:00'),
(14, 3, 'entry', 5000.0, 'Livraison MediPlast',  '2025-12-22 08:00:00'),
(14, 3, 'exit',  198.0,  'Ligne production A+C', '2026-01-05 09:00:00'),
(14, 3, 'exit',  197.0,  'Ligne production A+C', '2026-01-19 09:00:00'),
(14, 3, 'entry', 5000.0, 'Livraison CapAlgérie', '2026-02-02 08:00:00'),
(14, 3, 'exit',  200.0,  'Ligne production A+C', '2026-02-16 09:00:00'),
(14, 3, 'exit',  196.0,  'Ligne production A+C', '2026-03-02 09:00:00'),
(14, 3, 'entry', 5000.0, 'Livraison MediPlast',  '2026-04-13 08:00:00'),
(14, 3, 'exit',  199.0,  'Ligne production A+C', '2026-04-27 09:00:00'),
(14, 3, 'exit',  198.0,  'Ligne production A+C', '2026-05-11 09:00:00'),
-- recent
(14, 3, 'exit',  200.0,  'Ligne production A+C', '2026-05-23 09:00:00'),
(14, 3, 'exit',  197.0,  'Ligne production A+C', '2026-05-27 09:00:00'),
(14, 3, 'exit',  199.0,  'Ligne production A+C', '2026-05-31 09:00:00'),
(14, 3, 'exit',  198.0,  'Ligne production A+C', '2026-06-04 09:00:00'),
(14, 3, 'exit',  201.0,  'Ligne production A+C', '2026-06-08 09:00:00'),
(14, 3, 'exit',  196.0,  'Ligne production A+C', '2026-06-12 09:00:00'),
(14, 3, 'exit',  199.0,  'Ligne production A+C', '2026-06-16 09:00:00'),
(14, 3, 'exit',  198.0,  'Ligne production A+C', '2026-06-20 09:00:00');

-- ── Product 15: Etiquette eau 1.5L (avg ~122 units/exit) ──
INSERT OR IGNORE INTO storage_history (product_id, user_id, movement_type, quantity, note, created_at) VALUES
(15, 3, 'entry', 4000.0, 'Livraison ImprimPack', '2025-11-10 08:00:00'),
(15, 3, 'exit',  120.0,  'Ligne production F',   '2025-11-24 09:00:00'),
(15, 3, 'exit',  124.0,  'Ligne production F',   '2025-12-08 09:00:00'),
(15, 3, 'entry', 4000.0, 'Livraison MediPlast',  '2025-12-22 08:00:00'),
(15, 3, 'exit',  121.0,  'Ligne production F',   '2026-01-05 09:00:00'),
(15, 3, 'exit',  123.0,  'Ligne production F',   '2026-01-19 09:00:00'),
(15, 3, 'entry', 4000.0, 'Livraison ImprimPack', '2026-03-16 08:00:00'),
(15, 3, 'exit',  122.0,  'Ligne production F',   '2026-03-30 09:00:00'),
(15, 3, 'exit',  120.0,  'Ligne production F',   '2026-04-13 09:00:00'),
(15, 3, 'entry', 4000.0, 'Livraison MediPlast',  '2026-05-11 08:00:00'),
-- recent
(15, 3, 'exit',  123.0,  'Ligne production F',   '2026-05-23 09:00:00'),
(15, 3, 'exit',  121.0,  'Ligne production F',   '2026-05-30 09:00:00'),
(15, 3, 'exit',  122.0,  'Ligne production F',   '2026-06-06 09:00:00'),
(15, 3, 'exit',  120.0,  'Ligne production F',   '2026-06-13 09:00:00'),
(15, 3, 'exit',  124.0,  'Ligne production F',   '2026-06-20 09:00:00');

-- ------------------------------------------------------------
--  Exceptional Periods (2026-2027)
-- ------------------------------------------------------------
INSERT OR IGNORE INTO exceptional_periods (name, start_date, end_date, factor) VALUES
('Aïd El Adha 2026', '2026-06-06', '2026-06-10', 0.3),
('Pic été 2026',     '2026-07-01', '2026-08-31', 1.3),
('Arrêt usine',      '2026-08-10', '2026-08-20', 0.0),
('Rentrée 2026',     '2026-09-01', '2026-09-15', 1.2),
('Ramadan 2027',     '2027-02-17', '2027-03-18', 1.4),
('Aïd El Fitr 2027', '2027-03-18', '2027-03-22', 0.3);