// 1. Load Environment Variables (DB Password, etc.)
require('dotenv').config();

// 2. Import Libraries
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// 3. Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Allows cross-origin requests and parses JSON bodies)
app.use(cors());
app.use(express.json());

// 4. Configure PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client from pool:', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database!');
  release();
});

// 5. Define a simple test route
app.get('/', (req, res) => {
  res.send('Server is running and connected!');
});

// 6. Start the Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});