// server/config/database.js

const { Pool } = require('pg');

// Use environment variables for production, but hardcode for now based on index.js
const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lms_db',
    password: 'root', // <--- CHECK THIS PASSWORD CAREFULLY
    port: 5432,
});

module.exports = db;