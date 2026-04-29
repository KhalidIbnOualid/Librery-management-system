'use strict';

const path   = require('path');
const db     = require('../db/connection');
const multer = require('multer');

// ---------- multer setup ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename:    (req, file, cb) => cb(null, `book-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});
exports.uploadCover = upload.single('cover_image');

// ---------- Dashboard ----------
exports.getDashboard = async (req, res) => {
  try {
    const [[{ total_students }]] = await db.query(`SELECT COUNT(*) AS total_students FROM users WHERE role='student'`);
    const [[{ total_books }]]    = await db.query(`SELECT COUNT(*) AS total_books FROM books`);
    const [[{ stock_out }]]      = await db.query(`SELECT COUNT(*) AS stock_out FROM books WHERE stock_qty=0`);
    const [[{ pending_borrows }]] = await db.query(`SELECT COUNT(*) AS pending_borrows FROM borrow_requests WHERE status='Pending'`);

    const [recentBorrows] = await db.query(
      `SELECT br.*, u.name AS student_name, b.title
       FROM borrow_requests br
       JOIN users u ON br.user_id = u.id
       JOIN books b ON br.book_id = b.id
       ORDER BY br.requested_at DESC LIMIT 5`
    );
    const [recentPurchases] = await db.query(
      `SELECT p.*, u.name AS student_name, b.title
       FROM purchases p
       JOIN users u ON p.user_id = u.id
       JOIN books b ON p.book_id = b.id
       ORDER BY p.purchased_at DESC LIMIT 5`
    );

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      total_students, total_books, stock_out, pending_borrows,
      recentBorrows, recentPurchases,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load dashboard.');
    res.redirect('/');
  }
};

// ---------- Books ----------
exports.getBooks = async (req, res) => {
  try {
    const [books]         = await db.query(`SELECT b.*, c.name AS category_name, s.name AS subcategory_name FROM books b LEFT JOIN categories c ON b.category_id=c.id LEFT JOIN subcategories s ON b.subcategory_id=s.id ORDER BY b.title`);
    const [categories]    = await db.query('SELECT * FROM categories ORDER BY name');
    const [subcategories] = await db.query('SELECT * FROM subcategories ORDER BY name');
    res.render('admin/books', { title: 'Manage Books', books, categories, subcategories });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load books.');
    res.redirect('/admin/dashboard');
  }
};

exports.getAddBook = async (req, res) => {
  const [categories]    = await db.query('SELECT * FROM categories ORDER BY name');
  const [subcategories] = await db.query('SELECT * FROM subcategories ORDER BY name');
  res.render('admin/book-form', { title: 'Add Book', book: null, categories, subcategories });
};

exports.postAddBook = async (req, res) => {
  const { title, author, description, category_id, subcategory_id, isbn, stock_qty, price } = req.body;
  const cover = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    await db.query(
      'INSERT INTO books (title,author,description,category_id,subcategory_id,isbn,cover_image_path,stock_qty,price) VALUES (?,?,?,?,?,?,?,?,?)',
      [title, author, description, category_id || null, subcategory_id || null, isbn || null, cover, parseInt(stock_qty)||0, parseFloat(price)||0]
    );
    req.flash('success', 'Book added successfully.');
    res.redirect('/admin/books');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not add book.');
    res.redirect('/admin/books/add');
  }
};

exports.getEditBook = async (req, res) => {
  const [[book]]        = await db.query('SELECT * FROM books WHERE id=?', [req.params.id]);
  if (!book) { req.flash('error', 'Book not found.'); return res.redirect('/admin/books'); }
  const [categories]    = await db.query('SELECT * FROM categories ORDER BY name');
  const [subcategories] = await db.query('SELECT * FROM subcategories ORDER BY name');
  res.render('admin/book-form', { title: 'Edit Book', book, categories, subcategories });
};

exports.postEditBook = async (req, res) => {
  const { title, author, description, category_id, subcategory_id, isbn, stock_qty, price } = req.body;
  const bookId = req.params.id;
  try {
    const [[existing]] = await db.query('SELECT cover_image_path FROM books WHERE id=?', [bookId]);
    if (!existing) { req.flash('error', 'Book not found.'); return res.redirect('/admin/books'); }

    const cover = req.file ? `/uploads/${req.file.filename}` : existing.cover_image_path;
    await db.query(
      'UPDATE books SET title=?,author=?,description=?,category_id=?,subcategory_id=?,isbn=?,cover_image_path=?,stock_qty=?,price=? WHERE id=?',
      [title, author, description, category_id || null, subcategory_id || null, isbn || null, cover, parseInt(stock_qty)||0, parseFloat(price)||0, bookId]
    );
    req.flash('success', 'Book updated.');
    res.redirect('/admin/books');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not update book.');
    res.redirect(`/admin/books/${req.params.id}/edit`);
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await db.query('DELETE FROM books WHERE id=?', [req.params.id]);
    req.flash('success', 'Book deleted.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not delete book.');
  }
  res.redirect('/admin/books');
};

// ---------- Categories ----------
exports.getCategories = async (req, res) => {
  const [categories]    = await db.query('SELECT * FROM categories ORDER BY name');
  const [subcategories] = await db.query(`SELECT s.*, c.name AS category_name FROM subcategories s JOIN categories c ON s.category_id=c.id ORDER BY c.name, s.name`);
  res.render('admin/categories', { title: 'Manage Categories', categories, subcategories });
};

exports.postAddCategory = async (req, res) => {
  try {
    await db.query('INSERT INTO categories (name) VALUES (?)', [req.body.name.trim()]);
    req.flash('success', 'Category added.');
  } catch (err) {
    req.flash('error', 'Could not add category (may already exist).');
  }
  res.redirect('/admin/categories');
};

exports.deleteCategory = async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id=?', [req.params.id]);
    req.flash('success', 'Category deleted.');
  } catch (err) {
    req.flash('error', 'Could not delete category.');
  }
  res.redirect('/admin/categories');
};

exports.postAddSubcategory = async (req, res) => {
  try {
    await db.query('INSERT INTO subcategories (category_id, name) VALUES (?,?)', [req.body.category_id, req.body.name.trim()]);
    req.flash('success', 'Subcategory added.');
  } catch (err) {
    req.flash('error', 'Could not add subcategory.');
  }
  res.redirect('/admin/categories');
};

exports.deleteSubcategory = async (req, res) => {
  try {
    await db.query('DELETE FROM subcategories WHERE id=?', [req.params.id]);
    req.flash('success', 'Subcategory deleted.');
  } catch (err) {
    req.flash('error', 'Could not delete subcategory.');
  }
  res.redirect('/admin/categories');
};

// ---------- Borrow Requests ----------
exports.getBorrows = async (req, res) => {
  const { status } = req.query;
  let sql = `SELECT br.*, u.name AS student_name, u.email AS student_email, b.title
             FROM borrow_requests br
             JOIN users u ON br.user_id = u.id
             JOIN books b ON br.book_id = b.id`;
  const params = [];
  if (status) { sql += ' WHERE br.status = ?'; params.push(status); }
  sql += ' ORDER BY br.requested_at DESC';

  const [borrows] = await db.query(sql, params);
  res.render('admin/borrows', { title: 'Borrow Requests', borrows, filterStatus: status || '' });
};

exports.postBorrowAction = async (req, res) => {
  const { action } = req.body;
  const id         = req.params.id;
  try {
    const [[br]] = await db.query('SELECT * FROM borrow_requests WHERE id=?', [id]);
    if (!br) { req.flash('error', 'Request not found.'); return res.redirect('/admin/borrows'); }

    if (action === 'approve') {
      const due = new Date(); due.setDate(due.getDate() + 14);
      await db.query(
        `UPDATE borrow_requests SET status='Approved', approved_at=NOW(), due_at=? WHERE id=?`,
        [due, id]
      );
      // Decrease stock
      await db.query('UPDATE books SET stock_qty = stock_qty - 1 WHERE id=? AND stock_qty > 0', [br.book_id]);
      req.flash('success', 'Request approved. Due in 14 days.');
    } else if (action === 'decline') {
      await db.query(`UPDATE borrow_requests SET status='Declined' WHERE id=?`, [id]);
      req.flash('success', 'Request declined.');
    } else if (action === 'mark_borrowed') {
      await db.query(`UPDATE borrow_requests SET status='Borrowed', borrowed_at=NOW() WHERE id=?`, [id]);
      req.flash('success', 'Marked as borrowed.');
    } else if (action === 'return') {
      await db.query(
        `UPDATE borrow_requests SET status='Returned', returned_at=NOW() WHERE id=?`, [id]
      );
      // Return stock
      await db.query('UPDATE books SET stock_qty = stock_qty + 1 WHERE id=?', [br.book_id]);
      req.flash('success', 'Book returned. Stock updated.');
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'Action failed.');
  }
  res.redirect('/admin/borrows');
};

// ---------- Records ----------
exports.getRecords = async (req, res) => {
  const { student_id, from_date, to_date, tab } = req.query;
  const activeTab = tab === 'purchases' ? 'purchases' : 'borrows';

  let borrowSql = `SELECT br.*, u.name AS student_name, u.email, b.title
                   FROM borrow_requests br
                   JOIN users u ON br.user_id=u.id
                   JOIN books b ON br.book_id=b.id WHERE 1=1`;
  let purchaseSql = `SELECT p.*, u.name AS student_name, u.email, b.title
                     FROM purchases p
                     JOIN users u ON p.user_id=u.id
                     JOIN books b ON p.book_id=b.id WHERE 1=1`;
  const bParams = [], pParams = [];

  if (student_id) {
    borrowSql   += ' AND br.user_id=?'; bParams.push(student_id);
    purchaseSql += ' AND p.user_id=?';  pParams.push(student_id);
  }
  if (from_date) {
    borrowSql   += ' AND DATE(br.requested_at) >= ?'; bParams.push(from_date);
    purchaseSql += ' AND DATE(p.purchased_at) >= ?';  pParams.push(from_date);
  }
  if (to_date) {
    borrowSql   += ' AND DATE(br.requested_at) <= ?'; bParams.push(to_date);
    purchaseSql += ' AND DATE(p.purchased_at) <= ?';  pParams.push(to_date);
  }
  borrowSql   += ' ORDER BY br.requested_at DESC';
  purchaseSql += ' ORDER BY p.purchased_at DESC';

  const [borrows]   = await db.query(borrowSql,   bParams);
  const [purchases] = await db.query(purchaseSql, pParams);
  const [students]  = await db.query(`SELECT id, name, email FROM users WHERE role='student' ORDER BY name`);

  res.render('admin/records', {
    title: 'Records',
    borrows, purchases, students,
    filters: { student_id: student_id || '', from_date: from_date || '', to_date: to_date || '' },
    activeTab,
  });
};

// ---------- Students ----------
exports.getStudents = async (req, res) => {
  const [students] = await db.query(`SELECT * FROM users WHERE role='student' ORDER BY created_at DESC`);
  res.render('admin/students', { title: 'Manage Students', students });
};

exports.deleteStudent = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id=? AND role=?', [req.params.id, 'student']);
    req.flash('success', 'Student removed.');
  } catch (err) {
    req.flash('error', 'Could not remove student.');
  }
  res.redirect('/admin/students');
};
