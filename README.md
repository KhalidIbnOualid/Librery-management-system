# Library Management System

A full-featured campus Library Management System built with **Node.js + Express + EJS + MySQL**.

Students can browse books, borrow and purchase them. Admins can manage everything through a dedicated admin panel.

---

## Features

### Student
- Registration & login (bcrypt password hashing, session auth)
- Home page with stats: New Arrivals, In Stock, Stock Out, Total Books
- Browse books with category/subcategory filters and keyword search
- Book detail page with Borrow (request) and Purchase actions
- Personal dashboard: borrow request status tracking, purchase history

### Admin
- Dashboard with summary cards (total students, books, stock-out count, pending borrows)
- Full CRUD for Books (with optional cover image upload)
- Full CRUD for Categories and Subcategories
- Borrow request management: Approve → Mark Borrowed → Mark Returned / Decline
- Records view: all borrow & purchase records, filterable by student and date range
- Student management

---

## Tech Stack

- **Backend**: Node.js, Express 4
- **View Engine**: EJS
- **Database**: MySQL (via `mysql2`)
- **Auth**: `express-session` + `bcryptjs`
- **File Upload**: `multer`
- **UI**: Bootstrap 5 + Bootstrap Icons

---

## Prerequisites

- Node.js 18+
- MySQL 5.7+ or 8.x

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/KhalidIbnOualid/Librery-management-system.git
cd Librery-management-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

Open your MySQL client and run:

```sql
source db/schema.sql
source db/seed.sql
```

This creates the `library_management` database with all tables and seeds demo data including a default admin user and 10 sample books.

### 4. Configure environment

Copy the example environment file and fill in your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=library_management

SESSION_SECRET=change_this_to_a_random_string

PORT=3000
```

### 5. Start the server

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Default Credentials

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@library.com      | `password` |
| Student | Register a new account | —          |

> **Note:** Change the admin password after first login in a production environment.

---

## Project Structure

```
├── app.js                   # Express application entry point
├── package.json
├── .env.example             # Environment variable template
├── controllers/
│   ├── adminController.js   # Admin CRUD logic
│   ├── authController.js    # Register / Login / Logout
│   └── studentController.js # Home, browse, borrow, purchase
├── db/
│   ├── connection.js        # MySQL connection pool
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Demo data
├── middleware/
│   └── auth.js              # isAuthenticated, isAdmin guards
├── public/
│   ├── css/style.css        # Custom styles
│   ├── js/main.js           # Client-side JS
│   └── uploads/             # Uploaded book cover images
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── books.js
│   └── student.js
└── views/
    ├── admin/               # Admin EJS templates
    ├── auth/                # Login / Register
    ├── books/               # Browse & detail
    ├── partials/            # Navbar, footer, flash
    ├── student/             # Home & dashboard
    ├── 404.ejs
    └── 500.ejs
```

---

## Database Schema

| Table              | Purpose                              |
|--------------------|--------------------------------------|
| `users`            | Students and admin accounts          |
| `categories`       | Book categories (Academic, Novel…)   |
| `subcategories`    | Sub-groups within each category      |
| `books`            | Book catalogue with stock and price  |
| `borrow_requests`  | Borrow lifecycle tracking            |
| `purchases`        | Purchase records                     |

