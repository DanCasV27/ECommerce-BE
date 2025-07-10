const express = require('express');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/auth',authRoutes); 

app.use(errorHandler);

module.exports = app;