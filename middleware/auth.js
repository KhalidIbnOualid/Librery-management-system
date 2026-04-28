'use strict';

/** Ensure the user is logged in */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  req.flash('error', 'Please log in to continue.');
  return res.redirect('/auth/login');
}

/** Ensure the user is a student */
function isStudent(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'student') return next();
  req.flash('error', 'Access denied.');
  return res.redirect('/auth/login');
}

/** Ensure the user is an admin */
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  req.flash('error', 'Access denied. Admins only.');
  return res.redirect('/auth/login');
}

module.exports = { isAuthenticated, isStudent, isAdmin };
