require('dotenv').config();
const express = require('express');
const { Pool } = require('pg'); 
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = require('./controllers/auth.controller'); 

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
        // FIX 1: Use req.user.id to match the 'id' key stored during login
        console.log(`   [Auth] Token verified for User ID: ${req.user.id}, Role: ${req.user.role}`);
        next();
    } catch (err) {
        console.error('   [Auth] Token verification failed:', err.message);
        return res.status(403).json({ message: 'Token invalid or expired. Please log in again.' });
    }
};

const roleCheckMiddleware = (allowedRoles) => (req, res, next) => {
    const userRole = req.user.role.toLowerCase();
    if (allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
        next();
    } else {
        return res.status(403).json({ message: `Access Denied: Only ${allowedRoles.join(', ')} privileges required.` });
    }
};

// 🛑 PUBLIC ROUTE: LOGIN
app.post('/login', async (req, res) => {
    const client = await pool.connect();
    try {
        const { username, password } = req.body;
        const userResult = await client.query(
            'SELECT user_id, username, password_hash, role FROM users WHERE username = $1', 
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // --- CRITICAL FIX: Define userRole before using it ---
        const userRole = user.role ? user.role.toLowerCase() : '';
        let profileData = {};

        if (userRole === 'student') {
            const studentRes = await client.query(
                `SELECT s.first_name, s.last_name, s.student_id, d.name as dept_name, s.enrollment_year 
                 FROM students s 
                 LEFT JOIN departments d ON s.department_id = d.department_id 
                 WHERE s.student_id = $1`, 
                [username]
            );
            
            if (studentRes.rows.length > 0) {
                const s = studentRes.rows[0];
                profileData = {
                    fullName: `${s.first_name} ${s.last_name}`,
                    entityId: s.student_id,
                    department: s.dept_name,
                    enrollmentYear: s.enrollment_year 
                };
            }
        } 
        else if (userRole === 'teacher') {
            const teacherRes = await client.query(
                `SELECT t.first_name, t.last_name, t.teacher_id, t.email, t.phone_number, d.name as dept_name, t.hire_date
                 FROM teachers t
                 LEFT JOIN departments d ON t.department_id = d.department_id
                 WHERE t.teacher_id = $1`,
                [username]
            );

            if (teacherRes.rows.length > 0) {
                const t = teacherRes.rows[0];
                profileData = {
                    fullName: `${t.first_name} ${t.last_name}`,
                    entityId: t.teacher_id, // Added to display ID in dashboard
                    department: t.dept_name, // Added to display Dept in dashboard
                    email: t.email,
                    phone: t.phone_number,
                    hireDate: t.hire_date
                };
            }
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.role }, 
            jwtSecret, 
            { expiresIn: '1d' }
        );

        return res.json({
            token: token,
            user: {
                id: user.user_id,
                role: user.role,
                username: user.username,
                ...profileData 
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        client.release();
    }
});

// ----------------------------------------------------
// 🛑 PUBLIC ROUTE: STUDENT ACCOUNT ACTIVATION (Registration)
// ----------------------------------------------------
app.post('/api/register/student', async (req, res) => {
    const client = await pool.connect();
    try {
        const { studentId, password } = req.body; 

        if (!studentId || !password) {
            return res.status(400).json({ message: "Student ID and password are required." });
        }
        
        const username = studentId.trim(); 

        // 1. Check if username already exists in users table
        const usernameCheck = await client.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (usernameCheck.rows.length > 0) {
            return res.status(409).json({ message: "This Student ID is already registered." });
        }

        // 2. Find if the admin has already added this student profile
        const studentProfileQuery = `SELECT student_id FROM students WHERE student_id = $1`;
        const studentResult = await client.query(studentProfileQuery, [username]); 

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ message: "Student ID not found. Please contact Admin to add your profile first." });
        }

        // 3. Begin Transaction
        await client.query('BEGIN');

        // 4. Hash Password and Create User
        const passwordHash = await bcrypt.hash(password, 10);
        
        const userInsertQuery = `
            INSERT INTO users (username, password_hash, role)
            VALUES ($1, $2, 'Student')
            RETURNING user_id;
        `;
        const userInsertResult = await client.query(userInsertQuery, [username, passwordHash]);

        await client.query('COMMIT');
        return res.status(200).json({ message: "Account successfully activated!" });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error("Registration Error:", err.message);
        return res.status(500).json({ message: "Server error during registration." });
    } finally {
        client.release();
    }
});
// server/index.js (Teacher Registration Route)

app.post('/register/teacher', async (req, res) => {
    const client = await pool.connect();
    try {
        const { teacherId, password } = req.body; 
        
        if (!teacherId || !password) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        
        // Clean the input and force it to match the database format
        const username = teacherId.trim(); 

        // Check the profile using a case-insensitive search
        const teacherProfileQuery = `SELECT teacher_pk, user_account_id FROM teachers WHERE teacher_id = $1`;
        const teacherResult = await client.query(teacherProfileQuery, [username]); 

        if (teacherResult.rows.length === 0) {
            return res.status(404).json({ message: "Invalid Teacher ID Number. Profile not found." });
        }
        
        // ... (Keep the rest of your hashing and user insertion logic the same)
        await client.query('BEGIN');
        const passwordHash = await bcrypt.hash(password, 10);
        const userInsertQuery = `INSERT INTO users (username, password_hash, role, teacher_id) VALUES ($1, $2, 'Teacher', $3) RETURNING user_id;`;
        const userInsertResult = await client.query(userInsertQuery, [username, passwordHash, teacherResult.rows[0].teacher_pk]);
        
        const teacherUpdateQuery = `UPDATE teachers SET user_account_id = $1 WHERE teacher_pk = $2;`;
        await client.query(teacherUpdateQuery, [userInsertResult.rows[0].user_id, teacherResult.rows[0].teacher_pk]);
        await client.query('COMMIT');

        return res.status(200).json({ message: "Account successfully activated." });
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        return res.status(500).json({ message: "Server error during account activation." });
    } finally {
        client.release();
    }
});
// 🛑 PROTECTED ROUTE: ADMIN ADD STUDENT (FIXED)
app.post('/api/admin/students/add', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        console.log("DATA RECEIVED FROM FRONTEND:", req.body);

        // FIX 2: Using camelCase here to match formData keys in AddStudentPage.js
        const { studentId, firstName, lastName, departmentId, enrollmentYear } = req.body;

        const insertQuery = `
            INSERT INTO students (student_id, first_name, last_name, department_id, enrollment_year)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING student_id;
        `;
        
        // Ensure values match the extracted variables above
        const values = [studentId, firstName, lastName, departmentId, enrollmentYear];

        console.log("VALUES BEING SENT TO SQL:", values);
        
        await client.query(insertQuery, values);
        res.status(201).json({ status: 'success', message: 'Student added successfully' });
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

// 🛑 PROTECTED ROUTE: ADMIN ADD TEACHER (NOT TOUCHED)
app.post('/api/admin/teachers/add', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        // Ensure we extract the correct keys from the mapped frontend data
        const { teacherId, firstName, lastName, email, phone } = req.body;
        const departmentId = 1; // Explicitly set if not sent from front

        const insertQuery = `INSERT INTO teachers (teacher_id, first_name, last_name, email, phone_number, department_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING teacher_pk;`;
        await client.query(insertQuery, [teacherId.trim(), firstName, lastName, email, phone, departmentId]);
        
        res.status(201).json({ status: 'success', message: 'Teacher added successfully' });
        // ... error handling
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});