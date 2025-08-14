const express = require('express');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const cors = require('cors'); //CROSS ORIGIN RESOURCE SHARING, es lo que permite que mi BE y FE se comuniquen
const cookieParser = require('cookie-parser'); //Necesario para leer/escribir cookies, indispinsable ya que guardaremos el JWT en una cookie
const helmet = require('helmet'); //Middleware de seguridad para proteger la app de ataques comunes
const mongoSanitize = require('express-mongo-sanitize'); //Middleware para evitar inyecciones de código malicioso en la base de datos
const csrf = require('csurf'); //Middleware para proteger contra ataques CSRF (Cross-Site Request Forgery)

const app = express();

/**
 * 1) Lista blanca de orígenes desde .env (permite varios separados por coma).
 *    Esto evita hardcodear un solo origen y facilita dev/staging/prod.
 */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

/**
 *  Configuración de CORS con función origin que valida contra la whitelist.
 *    - credentials: true es necesario para cookies.
 *    - allowedHeaders incluye X-CSRF-Token para pasar el token por header.
 */
const corsOptions = {
    origin:function(origin,callback){
        //permitir herramientas de desarrollo y peticiones sin origen (como Postman, de esta manera si podre probarlo)
        if (!origin) return callback(null, true);
        if(allowedOrigins.includes(origin)) return callback(null, true); //si el origen está en la lista blanca, permitirlo
        return callback(new Error(`Not allowed by CORS: ${origin}`)); //si no, denegar la petición
    },
    // Permitir cookies y credenciales en las peticiones CORS
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}

if (process.env.NODE_ENV === 'production') {
    /**
     * trust proxy: necesario en producción si estás detrás de un proxy
     *    para que las cookies "secure" y el esquema HTTPS funcionen correctamente.
     */
    app.set('trust proxy', 1);
  }

  /**
 * Endurecer superficie: quitar x-powered-by, aplicar helmet.
 * Esto se hace para reducir la superficie de ataque y proteger la app.
 * Helmet aplica múltiples cabeceras de seguridad.
 * x powered by es una cabecera que revela que se usa Express, lo cual no es necesario y puede ser un riesgo de seguridad.
 */

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false }));
/**
 * 5) Aplicar CORS antes de los parsers para que las respuestas preflight
 *    tengan los headers correctos.
 */
app.use(cors(corsOptions));
// (Opcional) Responder explícitamente a preflights.
// un preflight es una petición OPTIONS que envía el navegador cuando detecta CORS.
app.options('*', cors(corsOptions));

/**
 *  Parsers y sanitización:
 *    - Limitar tamaño de body para evitar abusos.
 *    - Sanitizar payloads para prevenir inyección NoSQL.
 *    - cookieParser antes de csurf (csurf requiere acceso a cookies).
 */
app.use(express.json({ limit: '100kb' }));
app.use(mongoSanitize());
app.use(cookieParser());
/**
 * 7) CSRF con cookie:
 *    - cookie httpOnly=false para que el FE pueda leer el token CSRF y enviarlo por header.
 *    - Secure/SameSite se controlan por .env (ver .env.example).
 */
const CSRF_SECURE = process.env.COOKIE_SECURE === 'true';
const CSRF_SAMESITE = process.env.COOKIE_SAMESITE || (CSRF_SECURE ? 'none' : 'lax');
const csrfProtection = csrf({
  cookie: {
    httpOnly: false, // FE debe poder leerla para mandar el token
    secure: CSRF_SECURE,
    sameSite: CSRF_SAMESITE,
    path: '/',
  },
});
app.use(csrfProtection);

/**
 * 8) Endpoint para entregar el token CSRF al FE.
 *    El FE debe llamar a este endpoint y luego enviar el token en 'X-CSRF-Token'
 *    para operaciones de escritura (POST/PUT/PATCH/DELETE).
 */
app.get('/api/auth/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});


////
app.use(cors());

app.use('/api/products', productRoutes);
app.use('/api/auth',authRoutes); 

app.use(errorHandler);

module.exports = app;