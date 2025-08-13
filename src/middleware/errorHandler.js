// Manejador global de errores con respuestas prudentes en producción.
module.exports = (err, req, res, next) => {
  const status = err.status || 500;

  // Log interno completo (para observabilidad)
  console.error(err.stack || err);

  // En producción, evitar filtrar detalles.
  if (process.env.NODE_ENV === 'production') {
    return res.status(status).json({
      error: status >= 500 ? 'Internal server error' : 'Request failed',
    });
  }

  // En desarrollo, mensaje completo ayuda a depurar.
  res.status(status).json({ error: err.message || 'Something went wrong!' });
};