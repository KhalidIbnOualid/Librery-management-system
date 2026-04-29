'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/studentController');
const { isAuthenticated } = require('../middleware/auth');

// Browse books (public)
router.get('/', ctrl.getBooks);
router.get('/:id', ctrl.getBookDetail);

// Actions require login
router.post('/:id/borrow',   isAuthenticated, ctrl.postBorrow);
router.post('/:id/purchase', isAuthenticated, ctrl.postPurchase);

module.exports = router;
