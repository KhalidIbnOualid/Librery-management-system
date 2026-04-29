'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/studentController');
const { isAuthenticated } = require('../middleware/auth');

// Home page (public)
router.get('/', ctrl.getHome);

// Student dashboard (protected)
router.get('/student/dashboard', isAuthenticated, ctrl.getDashboard);

module.exports = router;
