// auth.routes.js
const express = require('express');
const { registerController } = require('./auth.controller');

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerController);

module.exports = router;
