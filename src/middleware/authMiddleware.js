const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

// Protect routes: Only allow access if a valid JWT is present
exports.protect = (req, res, next) => {
  // The client should send an Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1]; // Grab the token part after 'Bearer '
  try {
    // Verify the token and decode its content.
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded info (user id, role) to the request.
    next(); // Pass control to the next middleware or route handler.
  } catch {
    // Token is invalid or expired.
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if the user is an admin (for admin-only routes)
exports.isAdmin = (req, res, next) => {
  // req.user was set by the protect middleware.
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Admin only' }); // Forbidden
  next(); // User is admin, continue.
};