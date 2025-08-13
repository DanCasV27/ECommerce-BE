const User = require('../models/User'); 
const jwt = require('jsonwebtoken');    // Libreria para manejar JSON Web Tokens (JWT).

/**
 *  Parámetros JWT y cookies configurables por .env,
 *    permitiendo ajustes por ambiente (dev/staging/prod).
 */
const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';
const JWT_ISSUER = process.env.JWT_ISSUER || 'ecommerce-be';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'ecommerce-fe';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'access_token';
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE || (COOKIE_SECURE ? 'none' : 'lax');
const COOKIE_MAX_AGE_MS = Number(process.env.COOKIE_MAX_AGE_MS || 1000 * 60 * 60 * 8); // 8h
//opciones comunes para las cookies de autenticación.
const baseCookieOptions = {
  httpOnly: true, // HttpOnly mejora seguridad (no accesible por JS)
  path: '/',
  maxAge: COOKIE_MAX_AGE_MS,
  secure: COOKIE_SECURE, // true en prod con HTTPS y dominios distintos
  sameSite: COOKIE_SAMESITE, // 'none' si dominios distintos; 'lax' en dev
};

// Registrar un nuevo usuario
exports.register = async (req, res) => {
  const { email, password, role } = req.body; // Extraemos los datos del body de la solicitud.
  try {
    // Creamos un nuevo usuario con los datos proporcionados, la contraseña se encriptará automáticamente gracias al middleware definido en el modelo User.
    const user = new User({ email, password, role });
    await user.save(); //Guardamos el usuario en la base de datos.
    res.status(201).json({ message: 'User registered' }); // Mensaje de éxito.
  } catch (err) {
    // Si algo sale mal, enviamos un error 400 con el mensaje.
    res.status(400).json({ error: err.message });
  }
};
// Obtener todos los usuarios registrados
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Obtenemos todos los usuarios de la base de datos.
    res.status(200).json(users); // respondemos con la lista de usuarios.
  } catch (err) {
    res.status(500).json({ error: err.message }); // Mensaje default de error.
  }
};

// Login: valida credenciales, firma JWT con metadatos y lo setea en cookie HttpOnly
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1) Buscar usuario y validar contraseña sin revelar si el email existe
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2) Firmar JWT con issuer/audience/subject para robustez en validación
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        subject: user._id.toString(),
      }
    );

    // 3) Enviar cookie HttpOnly con el JWT
    res.cookie(COOKIE_NAME, token, baseCookieOptions);

    // 4) Retornar datos no sensibles para inicializar sesión en FE
    return res.status(200).json({
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Logout: limpiar cookie JWT manteniendo flags coherentes (secure/sameSite/path)
exports.logout = async (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
  });
  return res.sendStatus(204);
};

// Perfil autenticado: req.user viene del middleware requireAuth (cookie)
exports.me = async (req, res) => {
  return res.status(200).json({ user: req.user });
};