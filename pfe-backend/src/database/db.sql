PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'manager', 'operator')),
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    reference       TEXT    NOT NULL UNIQUE,
    name            TEXT    NOT NULL,
    category        TEXT    NOT NULL,
    unit            TEXT    NOT NULL,
    alert_threshold REAL    NOT NULL DEFAULT 0,
    image_path      TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS suppliers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    contact    TEXT,
    phone      TEXT,
    address    TEXT,
    is_active  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS product_suppliers (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id        INTEGER NOT NULL REFERENCES products(id)  ON DELETE CASCADE,
    supplier_id       INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    unit_price        REAL    NOT NULL,
    delivery_days     INTEGER NOT NULL,
    reliability_score REAL    NOT NULL DEFAULT 1.0,
    UNIQUE (product_id, supplier_id)
);

CREATE TABLE IF NOT EXISTS storage (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    quantity   REAL    NOT NULL DEFAULT 0,
    max_capacity REAL,
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS storage_history (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    movement_type       TEXT    NOT NULL CHECK (movement_type IN ('entry', 'exit')),
    quantity   REAL    NOT NULL CHECK (quantity > 0),
    note       TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id      INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    status           TEXT    NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft', 'pending', 'validated')),
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    validated_at     TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   REAL    NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS alerts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id   INTEGER          REFERENCES orders(id) ON DELETE SET NULL, 
    alert_type       TEXT    NOT NULL CHECK (alert_type IN ('low_stock', 'forecast', 'anomaly', 'capacity')),
    message    TEXT    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'acknowledged', 'resolved')),
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exceptional_periods (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    start_date TEXT    NOT NULL,
    end_date   TEXT    NOT NULL,
    factor     REAL    NOT NULL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES
    ('anomaly_window_days',      '30'),
    ('anomaly_z_score_threshold','2.0'),
    ('forecast_horizon_days',    '30'),
    ('forecast_min_data_points', '3'),
    ('agent2_min_data_points',   '3'),
    ('weight_price',       '0.5'),
    ('weight_delivery',    '0.3'),
    ('weight_reliability', '0.2');