'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

// All admin routes require admin role
router.use(isAdmin);

router.get('/dashboard', ctrl.getDashboard);

// Books CRUD
router.get('/books',             ctrl.getBooks);
router.get('/books/add',         ctrl.getAddBook);
router.post('/books/add',        ctrl.uploadCover, ctrl.postAddBook);
router.get('/books/:id/edit',    ctrl.getEditBook);
router.post('/books/:id/edit',   ctrl.uploadCover, ctrl.postEditBook);
router.post('/books/:id/delete', ctrl.deleteBook);

// Categories
router.get('/categories',                 ctrl.getCategories);
router.post('/categories/add',            ctrl.postAddCategory);
router.post('/categories/:id/delete',     ctrl.deleteCategory);
router.post('/subcategories/add',         ctrl.postAddSubcategory);
router.post('/subcategories/:id/delete',  ctrl.deleteSubcategory);

// Borrow requests
router.get('/borrows',             ctrl.getBorrows);
router.post('/borrows/:id/action', ctrl.postBorrowAction);

// Records
router.get('/records', ctrl.getRecords);

// Students
router.get('/students',             ctrl.getStudents);
router.post('/students/:id/delete', ctrl.deleteStudent);

module.exports = router;
