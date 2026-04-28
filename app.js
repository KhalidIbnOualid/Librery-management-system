'use strict';

require('dotenv').config();

const express        = require('express');
const path           = require('path');
const session        = require('express-session');
const flash          = require('connect-flash');
const methodOverride = require('method-override');

const app = express();

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Static files ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Body parsing ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---------- Method override (for DELETE/PUT via forms) ----------
app.use(methodOverride('_method'));

// ---------- Session ----------
app.use(session({
  secret:            process.env.SESSION_SECRET || 'library_secret_key',
  resave:            false,
  saveUninitialized: false,
  cookie:            { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
}));

// ---------- Flash ----------
app.use(flash());

// ---------- Global template locals ----------
app.use((req, res, next) => {
  res.locals.user          = req.session.user || null;
  res.locals.successFlash  = req.flash('success');
  res.locals.errorFlash    = req.flash('error');
  next();
});

// ---------- Routes ----------
const authRoutes    = require('./routes/auth');
const studentRoutes = require('./routes/student');
const booksRoutes   = require('./routes/books');
const adminRoutes   = require('./routes/admin');

app.use('/auth',    authRoutes);
app.use('/admin',   adminRoutes);
app.use('/books',   booksRoutes);
app.use('/',        studentRoutes);

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error', message: err.message });
});

// ---------- Start server ----------
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`Library Management System running at http://localhost:${PORT}`);
});

module.exports = app;
