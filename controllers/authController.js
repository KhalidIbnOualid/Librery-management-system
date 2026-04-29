'use strict';

const bcrypt = require('bcryptjs');
const db     = require('../db/connection');

/* GET /auth/register */
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register', errors: [], old: {} });
};

/* POST /auth/register */
exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];
  const old    = { name, email };

  if (!name || name.trim().length < 2)           errors.push('Name must be at least 2 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))     errors.push('A valid email is required.');
  if (!password || password.length < 6)          errors.push('Password must be at least 6 characters.');
  if (password !== confirmPassword)              errors.push('Passwords do not match.');

  if (errors.length > 0) return res.render('auth/register', { title: 'Register', errors, old });

  try {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      errors.push('An account with that email already exists.');
      return res.render('auth/register', { title: 'Register', errors, old });
    }
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)', [name.trim(), email.toLowerCase(), hash, 'student']);
    req.flash('success', 'Account created! Please log in.');
    return res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    errors.push('Server error. Please try again.');
    return res.render('auth/register', { title: 'Register', errors, old });
  }
};

/* GET /auth/login */
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

/* POST /auth/login */
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'Email and password are required.');
    return res.redirect('/auth/login');
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length === 0) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }
    const user  = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };

    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    return res.redirect('/student/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error. Please try again.');
    return res.redirect('/auth/login');
  }
};

/* GET /auth/logout */
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/auth/login'));
};
