-- Seed data for Library Management System
-- Run AFTER schema.sql

USE library_management;

-- Default admin user  (password: Admin@1234)
-- Hash generated with bcrypt rounds=10
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Categories
INSERT IGNORE INTO categories (name) VALUES
('Academic Books'),
('Comics'),
('Novel'),
('Story'),
('Science Fiction'),
('Biography'),
('Self-Help'),
('History');

-- Subcategories for Academic Books (id=1)
INSERT IGNORE INTO subcategories (category_id, name)
SELECT id, sub FROM categories
CROSS JOIN (
  SELECT 'Science'    AS sub UNION ALL
  SELECT 'Humanities' UNION ALL
  SELECT 'Commerce'   UNION ALL
  SELECT 'Engineering' UNION ALL
  SELECT 'Medicine'   UNION ALL
  SELECT 'Law'
) subs WHERE categories.name = 'Academic Books';

-- Subcategories for Comics (id=2)
INSERT IGNORE INTO subcategories (category_id, name)
SELECT id, sub FROM categories
CROSS JOIN (
  SELECT 'Superhero' AS sub UNION ALL
  SELECT 'Manga'            UNION ALL
  SELECT 'Graphic Novel'    UNION ALL
  SELECT 'Humor'
) subs WHERE categories.name = 'Comics';

-- Subcategories for Novel (id=3)
INSERT IGNORE INTO subcategories (category_id, name)
SELECT id, sub FROM categories
CROSS JOIN (
  SELECT 'Romance'   AS sub UNION ALL
  SELECT 'Thriller'         UNION ALL
  SELECT 'Mystery'          UNION ALL
  SELECT 'Fantasy'          UNION ALL
  SELECT 'Adventure'
) subs WHERE categories.name = 'Novel';

-- Subcategories for Story (id=4)
INSERT IGNORE INTO subcategories (category_id, name)
SELECT id, sub FROM categories
CROSS JOIN (
  SELECT 'Short Stories' AS sub UNION ALL
  SELECT 'Fairy Tales'          UNION ALL
  SELECT 'Folk Tales'           UNION ALL
  SELECT 'Children Stories'
) subs WHERE categories.name = 'Story';

-- Subcategories for Science Fiction (id=5)
INSERT IGNORE INTO subcategories (category_id, name)
SELECT id, sub FROM categories
CROSS JOIN (
  SELECT 'Space Opera' AS sub UNION ALL
  SELECT 'Cyberpunk'          UNION ALL
  SELECT 'Dystopian'          UNION ALL
  SELECT 'Time Travel'
) subs WHERE categories.name = 'Science Fiction';

-- Subcategories for Biography (id=6)
INSERT IGNORE INTO subcategories (category_id, name)
SELECT id, sub FROM categories
CROSS JOIN (
  SELECT 'Autobiography' AS sub UNION ALL
  SELECT 'Political'             UNION ALL
  SELECT 'Scientific'            UNION ALL
  SELECT 'Literary'
) subs WHERE categories.name = 'Biography';

-- Subcategories for Self-Help (id=7)
INSERT IGNORE INTO subcategories (category_id, name)
SELECT id, sub FROM categories
CROSS JOIN (
  SELECT 'Productivity' AS sub UNION ALL
  SELECT 'Finance'              UNION ALL
  SELECT 'Health & Wellness'    UNION ALL
  SELECT 'Relationships'
) subs WHERE categories.name = 'Self-Help';

-- Subcategories for History (id=8)
INSERT IGNORE INTO subcategories (category_id, name)
SELECT id, sub FROM categories
CROSS JOIN (
  SELECT 'Ancient History'  AS sub UNION ALL
  SELECT 'Medieval History'        UNION ALL
  SELECT 'Modern History'          UNION ALL
  SELECT 'World Wars'
) subs WHERE categories.name = 'History';

-- Sample books
INSERT IGNORE INTO books (title, author, description, category_id, subcategory_id, isbn, cover_image_path, stock_qty, price) VALUES
('Introduction to Algorithms', 'Thomas H. Cormen', 'A comprehensive textbook on computer algorithms.', 1, 4, '978-0262033848', NULL, 5, 49.99),
('The Great Gatsby', 'F. Scott Fitzgerald', 'A novel set in the Jazz Age on Long Island.', 3, NULL, '978-0743273565', NULL, 3, 12.99),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'A survey of the history of humankind from the Stone Age to the 21st century.', 8, NULL, '978-0062316097', NULL, 7, 16.99),
('Dune', 'Frank Herbert', 'A science fiction masterpiece set in a desert world.', 5, 1, '978-0441013593', NULL, 4, 14.99),
('Batman: Year One', 'Frank Miller', 'The origin story of the Dark Knight.', 2, 1, '978-1401207526', NULL, 6, 19.99),
('Atomic Habits', 'James Clear', 'Tiny changes, remarkable results.', 7, 1, '978-0735211292', NULL, 8, 18.99),
('1984', 'George Orwell', 'A dystopian social science fiction novel.', 5, 3, '978-0451524935', NULL, 2, 11.99),
('Steve Jobs', 'Walter Isaacson', 'The exclusive biography of Steve Jobs.', 6, 1, '978-1451648539', NULL, 3, 21.99),
('Calculus Made Easy', 'Silvanus Thompson', 'A classic introduction to calculus.', 1, 1, '978-0312185480', NULL, 10, 24.99),
('The Alchemist', 'Paulo Coelho', 'A magical story about following your dreams.', 3, 5, '978-0062315007', NULL, 0, 10.99);
