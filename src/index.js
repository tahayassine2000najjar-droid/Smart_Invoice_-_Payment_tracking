const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();


connectDB();


const auth = require('./routes/auth');
const suppliers = require('./routes/suppliers');
 const invoices = require('./routes/invoices');
 const dashboard = require('./routes/dashboard');
 const admin = require('./routes/admin');

const app = express();

app.use(express.json());


app.use('/api/auth', auth);
app.use('/api/suppliers', suppliers);
 app.use('/api/invoices', invoices);
 app.use('/api/dashboard', dashboard);
 app.use('/api/admin', admin);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Invoice Management API' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});