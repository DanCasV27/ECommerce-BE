const express = require('express');
const router = express.Router();
const { register, login,getAllUsers } = require('../controllers/authController');

// Route to register a new user
router.post('/register', register);

// Route to login and receive a JWT
router.post('/login', login);

router.get('/users', getAllUsers); // Route to get all registered users

module.exports = router;