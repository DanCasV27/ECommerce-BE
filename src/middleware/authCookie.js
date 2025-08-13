/** 
 * Este va a ser el middleware que se encargue de verificar si la cookie de autenticación existe y es válida.
 * Lo que haremos es autenticar usando el JWT almacenado en un cookie**/
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

/**
 * 1) Reutilizamos la misma configuración de validación que en el controlador:
 *    - Se valida el issuer/audience además de la firma para mayor seguridad.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';
const JWT_ISSUER = process.env.JWT_ISSUER || 'ecommerce-be';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'ecommerce-fe';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'access_token';

// Declaramos el middleware requireAuth que se encargará de autenticar al usuario usando el JWT almacenado en una cookie.
// Este middleware se usará en las rutas que requieran autenticación.
exports.requireAuth = async (req, res, next) => {
  try {
    /**
     * Tomamos el JWT desde la cookie HttpOnly (no viene en headers).
     */
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    /**
     *  Verificamos el token con firma + issuer + audience.
     *   clockTolerance da resiliencia a pequeñas diferencias de reloj.
     */
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTolerance: 5,
    });

    /**
     * Cargamos el usuario (sin password) para adjuntar info actual al request.
     *    Si el usuario fue eliminado o deshabilitado, negar acceso.
     */
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    //Inyectar datos mínimos en req para uso de controladores y autorizaciones.
    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

