const express = require('express');
const router = express.Router(); // Use Router() instead of express() for sub-routes

// Note: CORS is already handled in server.js, removed here to avoid conflict.

router.use(express.json());

// --- Routes Definition ---
router.use('/login', require('./login'));
router.use('/side', require('./sidebar'));
router.use('/profile', require('./profileRoutes'));
router.use('/location', require('./locationRoutes'));
router.use('/courses', require('./courseRoutes'));

console.log("✅ API Router Loaded");

module.exports = router;