PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO menu_items (title, price, description) VALUES
  ('Marinade Grilled Lamb Chops', '$35', 'Juicy grilled lamb chops marinated to perfection.'),
  ('Crispy Fried Chicken', '$22', 'Golden, crispy fried chicken with savory seasoning.'),
  ('Pan-Seared Salmon', '$28', 'Fresh salmon seared to a delicate crisp finish.'),
  ('Smothered Turkey Wings', '$24', 'Tender turkey wings slow-cooked and smothered in rich gravy.'),
  ('Baked Mac & Cheese', '$12', 'Classic baked mac and cheese with creamy, comforting flavor.'),
  ('Collard Greens', '$10', 'Slow-simmered collard greens with savory southern seasoning.');

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  booking_date TEXT NOT NULL,
  service_name TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
