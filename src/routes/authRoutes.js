const express = require('express');
const router = express.Router();
const { register, login,getAllUsers } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authCookie'); // Cookie-based auth
const { isAdmin } = require('../middleware/authMiddleware'); // Autorización por rol
const rateLimit = require('express-rate-limit');
/**
 * 1) Rate limiting para mitigar fuerza bruta en /register y /login.
 *    Configurable por .env para ajustar límites según entorno.
 */
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000); // 15 min
const max = Number(process.env.RATE_LIMIT_MAX || 100);
const authLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});


// Rutas publicas
router.post('/register',authLimiter, register);
router.post('/login',authLimiter, login);
//Rutas protegidas
router.get('/users',requireAuth,isAdmin, getAllUsers); // Route to get all registered users


module.exports = router;