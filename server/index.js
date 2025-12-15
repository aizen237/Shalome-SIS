// server/index.js (FINAL, CLEANED VERSION WITH ROBUST SQL)

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg'); 
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const jwtSecret = 'super_secret_key'; 

// --- DATABASE CONNECTION ---
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lms_db',
    password: 'root', 
    port: 5432,
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQUEST]: ${req.method} ${req.url}`);
    next();
});

// ----------------------------------------------------
// --- AUTHENTICATION AND AUTHORIZATION MIDDLEWARE ---
// ----------------------------------------------------

/**
 * Middleware to verify JWT token and attach user payload to req.user
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authentication required: Token missing.' });
    }

    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: 'Authentication required: Token format invalid.' });
    }

    try {
        const payload = jwt.verify(token, jwtSecret);
        req.user = payload; 
        console.log(`   [Auth] Token verified for User ID: ${req.user.user_id}, Role: ${req.user.role}`);
        next();
    } catch (err) {
        console.error('   [Auth] Token verification failed:', err.message);
        return res.status(403).json({ message: 'Token invalid or expired. Please log in again.' });
    }
};

/**
 * Middleware to restrict access to only Admin users.
 */
const adminAuthMiddleware = (req, res, next) => {
    if (req.user && req.user.role.toLowerCase() === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access Denied: Admin privileges required.' });
    }
};

// ----------------------------------------------------
// --- PUBLIC ROUTE: LOGIN ---
// ----------------------------------------------------
app.post('/login', async (req, res) => {
    try {
        console.log('>>> Processing Login Request <<<');
        const { username: rawUsername, password: rawPassword } = req.body;

        if (!rawUsername || !rawPassword) {
            return res.status(400).json({ message: "Missing inputs" });
        }

        const username = rawUsername.trim();
        const password = rawPassword.trim();

        const queryText = `SELECT u.user_id, u.username, u.password_hash, u.role, s.first_name, s.last_name, s.enrollment_year, d.name AS department_name FROM users u LEFT JOIN students s ON u.user_id = s.user_account_id LEFT JOIN departments d ON s.department_id = d.department_id WHERE u.username = $1`; 

        const result = await pool.query(queryText, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const dbUser = result.rows[0];

        const valid = await bcrypt.compare(password, dbUser.password_hash);

        if (valid) {
            const token = jwt.sign({ user_id: dbUser.user_id, role: dbUser.role }, jwtSecret, { expiresIn: '1h' });
            
            // --- CONSTRUCT USER OBJECT TO SEND TO CLIENT ---
            const user = {
                user_id: dbUser.user_id,
                username: dbUser.username,
                role: dbUser.role,
                full_name: (dbUser.first_name && dbUser.last_name) 
                    ? `${dbUser.first_name} ${dbUser.last_name}` 
                    : null,
                department: dbUser.department_name,
                enrollment_year: dbUser.enrollment_year 
            };
            
            return res.json({ message: "Success", token, user });
        } else {
            return res.status(401).json({ message: "Invalid username or password" });
        }

    } catch (err) {
        console.error("SERVER ERROR in /login:", err.message);
        return res.status(500).json({ message: "Server error during login." });
    }
});


// ----------------------------------------------------
// --- PUBLIC ROUTE: STUDENT REGISTRATION (Activation) ---
// ----------------------------------------------------
app.post('/api/register/student', async (req, res) => {
    try {
        console.log('>>> Processing Student Registration Request <<<');
        const { studentId, password } = req.body; 

        if (!studentId || !password) {
            return res.status(400).json({ message: 'Student ID and Password are required.' });
        }
        
        const trimmedStudentId = studentId.trim();
        const trimmedPassword = password.trim();

        // 1. Check if the Student ID exists in the 'students' table AND is not yet activated (user_account_id IS NULL)
        const studentCheckResult = await pool.query(
            'SELECT user_account_id FROM students WHERE student_id = $1', 
            [trimmedStudentId]
        );

        const student = studentCheckResult.rows[0];

        if (!student) {
            return res.status(404).json({ message: 'Invalid Student ID. Record not found.' });
        }

        if (student.user_account_id) {
            return res.status(400).json({ message: 'This student account has already been activated. Please log in.' });
        }

        // 2. Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(trimmedPassword, saltRounds);

        // 3. Insert into the users table (using studentId as the username)
        const userInsertResult = await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
            [trimmedStudentId, passwordHash, 'Student'] 
        );
        const newUserId = userInsertResult.rows[0].user_id;
        
        // 4. Link the new user account ID back to the student record and set status to 'Enrolled'
        await pool.query(
            'UPDATE students SET user_account_id = $1, status = $2 WHERE student_id = $3',
            [newUserId, 'Enrolled', trimmedStudentId] 
        );

        console.log(`✅ Student account created and enrolled for ID: ${trimmedStudentId}`);
        return res.status(201).json({ message: 'Account successfully activated! You can now log in.' });

    } catch (err) {
        console.error("SERVER ERROR in /api/register/student:", err.message);
        if (err.code === '23505') { 
            return res.status(409).json({ message: 'This student ID is already registered as a user.' });
        }
        return res.status(500).json({ message: "Server error during student registration." });
    }
});


// ----------------------------------------------------
// --- PROTECTED ROUTE: ADMIN ADD STUDENT (FIXED) ---
// ----------------------------------------------------

app.post('/api/admin/students/add', authMiddleware, adminAuthMiddleware, async (req, res) => {
    try {
        console.log('>>> Processing Admin Add Student Request <<<');
        
        const { studentIdNumber, fullName, department, batchYear, registrationStatus } = req.body;
        
        if (!studentIdNumber || !fullName || !department || !batchYear || !registrationStatus) {
            return res.status(400).json({ message: 'Missing required student details.' });
        }

        // --- Name Splitting Logic ---
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        // Ensure lastName handles multi-part names
        const lastName = nameParts.slice(1).join(' '); 
        if (!lastName) {
            return res.status(400).json({ message: 'Please provide both a first and last name.' });
        }

        // --- BATCH YEAR VALIDATION AND CONVERSION ---
        const enrollmentYear = parseInt(batchYear, 10);
        if (isNaN(enrollmentYear) || enrollmentYear.toString().length !== 4) {
            return res.status(400).json({ 
                message: 'Invalid batch year format. Please provide a four-digit number (e.g., 2025).' 
            });
        }
        
        // --- Check for existing student ID (Correctly parameterized) ---
        const checkResult = await pool.query(
            'SELECT student_id FROM students WHERE student_id = $1', 
            [studentIdNumber.trim()]
        );

        if (checkResult.rows.length > 0) {
            return res.status(409).json({ message: `Student ID ${studentIdNumber} already exists.` });
        }

        // --- DEPARTMENT ID LOOKUP (Correctly parameterized) ---
        let departmentID;
        try {
            const departmentName = department.trim();
            
            const departmentLookupResult = await pool.query(
                'SELECT department_id FROM departments WHERE name = $1', 
                [departmentName]
            );

            if (departmentLookupResult.rows.length === 0) {
                return res.status(400).json({ message: `Invalid department: '${departmentName}' not found in the system.` });
            }
            departmentID = departmentLookupResult.rows[0].department_id; 

        } catch (lookupError) {
            console.error("Database lookup error for department:", lookupError.message);
            return res.status(500).json({ message: "Server error during department lookup. Check 'departments' table name/schema." });
        }


        // --- Final Insertion (Rewritten for maximum robustness) ---
        const studentInsertQuery = `
            INSERT INTO students (student_id, first_name, last_name, department_id, enrollment_year, status) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await pool.query(studentInsertQuery, [
            studentIdNumber.trim(), 
            firstName, 
            lastName, 
            departmentID, 
            enrollmentYear, 
            registrationStatus.trim() 
        ]);

        console.log(`✅ New student record added by Admin: ${studentIdNumber}`);
        return res.status(201).json({ message: 'Student record successfully added to the system.' });

    } catch (err) {
        // This error handler catches the original SQL error
        console.error("SERVER ERROR in /api/admin/students/add:", err.message);
        return res.status(500).json({ message: "Server error occurred while adding student record." });
    }
});

// ----------------------------------------------------
// --- Server Start ---
// ----------------------------------------------------
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`==========================================`);
});