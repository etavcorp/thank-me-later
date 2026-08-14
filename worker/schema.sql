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
