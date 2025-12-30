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
                `SELECT s.first_name, s.last_name, s.student_id, d.name as dept_name, s.enrollment_year, s.year_level
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
                    enrollmentYear: s.enrollment_year,
                    yearLevel: s.year_level
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
            INSERT INTO users (username, password_hash, role, student_id)
            VALUES ($1, $2, 'Student', $3)
            RETURNING user_id;
        `;
        const userInsertResult = await client.query(userInsertQuery, [username, passwordHash, username]);

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

app.post('/api/register/teacher', async (req, res) => {
    const client = await pool.connect();
    try {
        const { teacherId, password } = req.body; // teacherId is "0966/15"
        const username = teacherId.trim();

        // 1. Check if the teacher exists using the STRING ID
        const teacherResult = await client.query(
            'SELECT teacher_id FROM teachers WHERE teacher_id = $1', 
            [username]
        );

        if (teacherResult.rows.length === 0) {
            return res.status(404).json({ message: "Teacher ID not found. Contact Admin." });
        }

        // 2. IMPORTANT: Use the actual teacher_id string from the result
        // Not a serial ID or primary key number.
        const actualTeacherId = teacherResult.rows[0].teacher_id; 

        await client.query('BEGIN');
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Insert into users. 
        // We use the string "0966/15" for both username and teacher_id
        const userInsertQuery = `
            INSERT INTO users (username, password_hash, role, teacher_id) 
            VALUES ($1, $2, 'Teacher', $3) 
            RETURNING user_id;
        `;
        
        await client.query(userInsertQuery, [username, passwordHash, actualTeacherId]);
        
        await client.query('COMMIT');
        res.status(200).json({ message: "Account activated successfully!" });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error("Registration Error:", err.message);
        res.status(500).json({ message: "Server error during activation." });
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
        const { studentId, firstName, lastName, departmentId, enrollmentYear, yearLevel } = req.body;

        const insertQuery = `
            INSERT INTO students (student_id, first_name, last_name, department_id, enrollment_year, year_level)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING student_id;
        `;
        
        // Ensure values match the extracted variables above
        const values = [studentId, firstName, lastName, departmentId, enrollmentYear, yearLevel];

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

// 🛑 PROTECTED ROUTE: ADMIN ADD TEACHER
app.post('/api/admin/teachers/add', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        const { teacherId, firstName, lastName, email, phone, hire_date, course_ids } = req.body;

        await client.query('BEGIN');

        // Insert teacher (no department_id)
        const insertQuery = `INSERT INTO teachers (teacher_id, first_name, last_name, email, phone_number, hire_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING teacher_id;`;
        const teacherResult = await client.query(insertQuery, [
            teacherId.trim(), 
            firstName, 
            lastName, 
            email, 
            phone || null, 
            hire_date || null
        ]);

        const newTeacherId = teacherResult.rows[0].teacher_id;

        // Insert course assignments if provided
        if (course_ids && Array.isArray(course_ids) && course_ids.length > 0) {
            for (const course_id of course_ids) {
                await client.query(
                    'INSERT INTO teacher_assignments (teacher_id, course_id) VALUES ($1, $2)',
                    [newTeacherId, course_id]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ status: 'success', message: 'Teacher added successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ message: err.message || "Server error" });
    } finally {
        client.release();
    }
});

// server/index.js

// GET ALL DEPARTMENTS (Public endpoint for dropdowns)
app.get('/api/departments', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT department_id, name 
            FROM departments 
            ORDER BY name ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error fetching departments" });
    } finally {
        client.release();
    }
});

// 1. GET ALL STUDENTS
app.get('/api/admin/students', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        // We join 'students' with 'departments' to get the actual department name and ID
        const result = await client.query(`
            SELECT s.student_id, s.first_name, s.last_name, 
                   d.department_id, d.name as department_name, s.enrollment_year, s.year_level
            FROM students s
            LEFT JOIN departments d ON s.department_id = d.department_id
            ORDER BY s.student_id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error fetching students" });
    } finally {
        client.release();
    }
});

// 2. GET ALL TEACHERS
app.get('/api/admin/teachers', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT t.teacher_id, t.first_name, t.last_name, t.email, t.phone_number, t.hire_date,
                   COALESCE(
                       json_agg(DISTINCT jsonb_build_object('course_id', c.course_id, 'course_name', c.course_name))
                       FILTER (WHERE c.course_id IS NOT NULL),
                       '[]'::json
                   ) as courses
            FROM teachers t
            LEFT JOIN teacher_assignments ta ON t.teacher_id = ta.teacher_id
            LEFT JOIN courses c ON ta.course_id = c.course_id
            GROUP BY t.teacher_id, t.first_name, t.last_name, t.email, t.phone_number, t.hire_date
            ORDER BY t.teacher_id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error fetching teachers" });
    } finally {
        client.release();
    }
});
// --- DELETE STUDENT ---
app.delete('/api/admin/students/:id', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('DELETE FROM students WHERE student_id = $1', [id]);
        res.json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting student" });
    } finally {
        client.release();
    }
});
// --- DELETE TEACHER ---
app.delete('/api/admin/teachers/:id', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('DELETE FROM teachers WHERE teacher_id = $1', [id]);
        res.json({ message: "Teacher deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting teacher" });
    } finally {
        client.release();
    }
});

// --- UPDATE STUDENT (Basic Info) ---
app.put('/api/admin/students/:id', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        const originalId = req.params.id;
        const { student_id, first_name, last_name, department_id, enrollment_year, year_level } = req.body;
        
        await client.query(
            `UPDATE students 
             SET student_id = $1, first_name = $2, last_name = $3, department_id = $4, enrollment_year = $5, year_level = $6
             WHERE student_id = $7`,
            [student_id, first_name, last_name, department_id, enrollment_year, year_level, originalId]
        );
        res.json({ message: "Student updated successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Update failed" });
    } finally { client.release(); }
});


// --- UPDATE TEACHER ---
app.put('/api/admin/teachers/:id', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        const originalId = req.params.id;
        const { teacher_id, first_name, last_name, email, phone_number, hire_date, course_ids } = req.body;
        
        await client.query('BEGIN');

        // Update teacher basic info (no department_id)
        await client.query(
            `UPDATE teachers 
             SET teacher_id = $1, first_name = $2, last_name = $3, email = $4, phone_number = $5, hire_date = $6
             WHERE teacher_id = $7`,
            [teacher_id, first_name, last_name, email, phone_number, hire_date, originalId]
        );

        // Update course assignments
        // First, delete existing assignments
        await client.query('DELETE FROM teacher_assignments WHERE teacher_id = $1', [teacher_id]);

        // Then insert new assignments if provided
        if (course_ids && Array.isArray(course_ids) && course_ids.length > 0) {
            for (const course_id of course_ids) {
                await client.query(
                    'INSERT INTO teacher_assignments (teacher_id, course_id) VALUES ($1, $2)',
                    [teacher_id, course_id]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ message: "Teacher updated successfully" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ message: err.message || "Update failed" });
    } finally { client.release(); }
});

// ===================================================
// COURSE MANAGEMENT ENDPOINTS
// ===================================================

// GET ALL COURSES (Admin)
app.get('/api/admin/courses', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT c.course_id, c.course_name, c.credits, c.semester, c.description,
                   c.department_id, d.name as department_name,
                   c.teacher_id, t.first_name || ' ' || t.last_name as teacher_name
            FROM courses c
            LEFT JOIN departments d ON c.department_id = d.department_id
            LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
            ORDER BY c.course_name ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error fetching courses" });
    } finally {
        client.release();
    }
});

// GET ALL COURSES (Public - for dropdowns)
app.get('/api/courses', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT course_id, course_name, credits, semester, description
            FROM courses
            ORDER BY course_name ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error fetching courses" });
    } finally {
        client.release();
    }
});

// POST CREATE COURSE
app.post('/api/admin/courses', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        const { course_id, course_name, department_id, teacher_id, credits, semester, description } = req.body;

        if (!course_id || !course_name) {
            return res.status(400).json({ message: "Course ID and name are required." });
        }

        const insertQuery = `
            INSERT INTO courses (course_id, course_name, department_id, teacher_id, credits, semester, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING course_id;
        `;
        
        await client.query(insertQuery, [
            course_id,
            course_name,
            department_id || null,
            teacher_id || null,
            credits || 3,
            semester || null,
            description || null
        ]);

        res.status(201).json({ status: 'success', message: 'Course created successfully' });
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

// POST ASSIGN COURSE TO DEPARTMENT CURRICULUM
app.post('/api/admin/curriculum', authMiddleware, roleCheckMiddleware(['Admin']), async (req, res) => {
    const client = await pool.connect();
    try {
        const { department_id, course_id, year_level, semester } = req.body;

        if (!department_id || !course_id || !year_level || !semester) {
            return res.status(400).json({ message: "Department ID, Course ID, Year Level, and Semester are required." });
        }

        // Check if assignment already exists
        const checkQuery = `
            SELECT * FROM department_curriculum 
            WHERE department_id = $1 AND course_id = $2 AND year_level = $3 AND semester = $4
        `;
        const existing = await client.query(checkQuery, [department_id, course_id, year_level, semester]);

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "This course is already assigned to this department for this year level and semester." });
        }

        const insertQuery = `
            INSERT INTO department_curriculum (department_id, course_id, year_level, semester)
            VALUES ($1, $2, $3, $4)
            RETURNING department_id, course_id;
        `;
        
        await client.query(insertQuery, [department_id, course_id, year_level, semester]);

        res.status(201).json({ status: 'success', message: 'Course assigned to department curriculum successfully' });
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

// GET TEACHER COURSES (for dashboard)
app.get('/api/teachers/:id/courses', authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const result = await client.query(`
            SELECT c.course_id, c.course_name, c.credits, c.semester, c.description,
                   d.name as department_name
            FROM teacher_assignments ta
            JOIN courses c ON ta.course_id = c.course_id
            LEFT JOIN departments d ON c.department_id = d.department_id
            WHERE ta.teacher_id = $1
            ORDER BY c.course_name ASC
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error fetching teacher courses" });
    } finally {
        client.release();
    }
});

// GET STUDENT COURSES (for dashboard)
app.get('/api/students/:id/courses', authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        
        // First get student's department_id and year_level
        const studentQuery = await client.query(
            'SELECT department_id, year_level FROM students WHERE student_id = $1',
            [id]
        );

        if (studentQuery.rows.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        const { department_id, year_level } = studentQuery.rows[0];

        // Get courses from department_curriculum
        const result = await client.query(`
            SELECT c.course_id, c.course_name, c.credits, c.semester, c.description,
                   dc.year_level, dc.semester as curriculum_semester
            FROM department_curriculum dc
            JOIN courses c ON dc.course_id = c.course_id
            WHERE dc.department_id = $1 AND dc.year_level = $2
            ORDER BY c.course_name ASC
        `, [department_id, year_level]);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error fetching student courses" });
    } finally {
        client.release();
    }
});

// --- START SERVER ---

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});