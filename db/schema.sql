-- Library Management System Database Schema
-- Run this file to create all tables

CREATE DATABASE IF NOT EXISTS library_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_management;

-- Users table (students + admin)
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role        ENUM('student','admin') NOT NULL DEFAULT 'student',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  title             VARCHAR(255) NOT NULL,
  author            VARCHAR(255) NOT NULL,
  description       TEXT,
  category_id       INT,
  subcategory_id    INT,
  isbn              VARCHAR(50),
  cover_image_path  VARCHAR(500),
  stock_qty         INT NOT NULL DEFAULT 0,
  price             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id)    REFERENCES categories(id)    ON DELETE SET NULL,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
);

-- Borrow requests table
CREATE TABLE IF NOT EXISTS borrow_requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  book_id      INT NOT NULL,
  status       ENUM('Pending','Approved','Borrowed','Returned','Declined') NOT NULL DEFAULT 'Pending',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at  DATETIME,
  borrowed_at  DATETIME,
  due_at       DATETIME,
  returned_at  DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  book_id      INT NOT NULL,
  qty          INT NOT NULL DEFAULT 1,
  price_each   DECIMAL(10,2) NOT NULL,
  purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
