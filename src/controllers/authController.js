const User = require('../models/User'); // Import the User model.
const jwt = require('jsonwebtoken');    // Library for creating and verifying JWT tokens.

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey'; // Secret key for signing JWTs.

// Register a new user
exports.register = async (req, res) => {
  const { email, password, role } = req.body; // Extract data from the request.
  try {
    // Create a new User instance. Password will be hashed automatically.
    const user = new User({ email, password, role });
    await user.save(); // Save the user to the database.
    res.status(201).json({ message: 'User registered' }); // Respond with success.
  } catch (err) {
    // If something goes wrong (like duplicate email), send an error.
    res.status(400).json({ error: err.message });
  }
};

// Login an existing user and issue a JWT
exports.login = async (req, res) => {
  const { email, password } = req.body; // Extract credentials from the request.
  try {
    // 1. Find the user by email.
    const user = await User.findOne({ email });
    // 2. If user not found or password doesn't match, send error.
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    // 3. If correct, create a JWT containing user ID and role.
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '1d' // Token expires in 1 day.
    });
    res.json({ token }); // Send the token to the client.
  } catch (err) {
    // Handle unexpected errors.
    res.status(500).json({ error: err.message });
  }
};