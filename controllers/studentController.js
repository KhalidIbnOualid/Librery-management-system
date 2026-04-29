'use strict';

const db = require('../db/connection');

/* GET / (home page) */
exports.getHome = async (req, res) => {
  try {
    const [[totRow]]   = await db.query('SELECT COUNT(*) AS total FROM books');
    const [[stockOut]] = await db.query('SELECT COUNT(*) AS cnt FROM books WHERE stock_qty = 0');
    const [[inStock]]  = await db.query('SELECT COUNT(*) AS cnt FROM books WHERE stock_qty > 0');

    const [newArrivals] = await db.query(
      `SELECT b.*, c.name AS category_name, s.name AS subcategory_name
       FROM books b
       LEFT JOIN categories   c ON b.category_id    = c.id
       LEFT JOIN subcategories s ON b.subcategory_id = s.id
       ORDER BY b.created_at DESC LIMIT 8`
    );

    const [inStockBooks] = await db.query(
      `SELECT b.*, c.name AS category_name, s.name AS subcategory_name
       FROM books b
       LEFT JOIN categories   c ON b.category_id    = c.id
       LEFT JOIN subcategories s ON b.subcategory_id = s.id
       WHERE b.stock_qty > 0
       ORDER BY b.title LIMIT 8`
    );

    const [stockOutBooks] = await db.query(
      `SELECT b.*, c.name AS category_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.stock_qty = 0`
    );

    res.render('student/home', {
      title:       'Home',
      totalBooks:  totRow.total,
      stockOutCnt: stockOut.cnt,
      inStockCnt:  inStock.cnt,
      newArrivals,
      inStockBooks,
      stockOutBooks,
    });
  } catch (err) {
    console.error(err);
    res.render('student/home', { title: 'Home', totalBooks: 0, stockOutCnt: 0, inStockCnt: 0, newArrivals: [], inStockBooks: [], stockOutBooks: [] });
  }
};

/* GET /student/dashboard */
exports.getDashboard = async (req, res) => {
  const userId = req.session.user.id;
  try {
    const [borrows] = await db.query(
      `SELECT br.*, b.title, b.author, b.cover_image_path
       FROM borrow_requests br
       JOIN books b ON br.book_id = b.id
       WHERE br.user_id = ?
       ORDER BY br.requested_at DESC`,
      [userId]
    );

    const [purchases] = await db.query(
      `SELECT p.*, b.title, b.author, b.cover_image_path
       FROM purchases p
       JOIN books b ON p.book_id = b.id
       WHERE p.user_id = ?
       ORDER BY p.purchased_at DESC`,
      [userId]
    );

    res.render('student/dashboard', { title: 'My Dashboard', borrows, purchases });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load dashboard.');
    res.redirect('/');
  }
};

/* GET /books */
exports.getBooks = async (req, res) => {
  const { category, subcategory, search } = req.query;
  try {
    const [categories]    = await db.query('SELECT * FROM categories ORDER BY name');
    const [subcategories] = await db.query('SELECT * FROM subcategories ORDER BY name');

    let sql    = `SELECT b.*, c.name AS category_name, s.name AS subcategory_name
                  FROM books b
                  LEFT JOIN categories   c ON b.category_id    = c.id
                  LEFT JOIN subcategories s ON b.subcategory_id = s.id
                  WHERE 1=1`;
    const params = [];

    if (category) {
      sql += ' AND b.category_id = ?';
      params.push(category);
    }
    if (subcategory) {
      sql += ' AND b.subcategory_id = ?';
      params.push(subcategory);
    }
    if (search) {
      sql += ' AND (b.title LIKE ? OR b.author LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY b.title';

    const [books] = await db.query(sql, params);

    // Sub-categories for the selected category (for filter sidebar)
    let filteredSubs = subcategories;
    if (category) filteredSubs = subcategories.filter(s => s.category_id == category);

    res.render('books/index', {
      title: 'Browse Books',
      books,
      categories,
      subcategories: filteredSubs,
      allSubcategories: subcategories,
      selectedCategory:    category    || '',
      selectedSubcategory: subcategory || '',
      search:              search      || '',
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load books.');
    res.redirect('/');
  }
};

/* GET /books/:id */
exports.getBookDetail = async (req, res) => {
  const bookId = req.params.id;
  try {
    const [[book]] = await db.query(
      `SELECT b.*, c.name AS category_name, s.name AS subcategory_name
       FROM books b
       LEFT JOIN categories   c ON b.category_id    = c.id
       LEFT JOIN subcategories s ON b.subcategory_id = s.id
       WHERE b.id = ?`,
      [bookId]
    );
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/books');
    }

    // Check if student already has an active borrow for this book
    let activeBorrow = null;
    if (req.session.user) {
      const [ab] = await db.query(
        `SELECT * FROM borrow_requests
         WHERE user_id=? AND book_id=? AND status NOT IN ('Returned','Declined')`,
        [req.session.user.id, bookId]
      );
      if (ab.length > 0) activeBorrow = ab[0];
    }

    res.render('books/detail', { title: book.title, book, activeBorrow });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load book details.');
    res.redirect('/books');
  }
};

/* POST /books/:id/borrow */
exports.postBorrow = async (req, res) => {
  const bookId = req.params.id;
  const userId = req.session.user.id;
  try {
    const [[book]] = await db.query('SELECT * FROM books WHERE id=?', [bookId]);
    if (!book) { req.flash('error', 'Book not found.'); return res.redirect('/books'); }
    if (book.stock_qty <= 0) { req.flash('error', 'This book is out of stock.'); return res.redirect(`/books/${bookId}`); }

    // Check for duplicate active request
    const [existing] = await db.query(
      `SELECT id FROM borrow_requests WHERE user_id=? AND book_id=? AND status NOT IN ('Returned','Declined')`,
      [userId, bookId]
    );
    if (existing.length > 0) {
      req.flash('error', 'You already have an active borrow request for this book.');
      return res.redirect(`/books/${bookId}`);
    }

    await db.query(
      'INSERT INTO borrow_requests (user_id, book_id, status) VALUES (?,?,?)',
      [userId, bookId, 'Pending']
    );
    req.flash('success', 'Borrow request submitted! Await admin approval.');
    res.redirect('/student/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not submit borrow request.');
    res.redirect(`/books/${bookId}`);
  }
};

/* POST /books/:id/purchase */
exports.postPurchase = async (req, res) => {
  const bookId = req.params.id;
  const userId = req.session.user.id;
  const qty    = parseInt(req.body.qty || '1', 10);

  if (!qty || qty < 1) {
    req.flash('error', 'Invalid quantity.');
    return res.redirect(`/books/${bookId}`);
  }

  try {
    const [[book]] = await db.query('SELECT * FROM books WHERE id=?', [bookId]);
    if (!book)             { req.flash('error', 'Book not found.'); return res.redirect('/books'); }
    if (book.stock_qty < qty) { req.flash('error', 'Not enough stock available.'); return res.redirect(`/books/${bookId}`); }

    await db.query(
      'INSERT INTO purchases (user_id, book_id, qty, price_each) VALUES (?,?,?,?)',
      [userId, bookId, qty, book.price]
    );
    await db.query('UPDATE books SET stock_qty = stock_qty - ? WHERE id=?', [qty, bookId]);

    req.flash('success', `Purchase recorded! You bought ${qty} copy(ies) of "${book.title}".`);
    res.redirect('/student/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not complete purchase.');
    res.redirect(`/books/${bookId}`);
  }
};
