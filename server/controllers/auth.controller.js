// server/controllers/auth.controller.js

const db = require('../config/database'); // <-- FIX APPLIED HERE
const bcrypt = require('bcryptjs'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Assuming you use this for tokens

// Helper function to create a basic user account in the 'users' table
const createBasicUserAccount = async (id_number, password, role) => {
    // 1. Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); 
    
    // 2. Insert into the users table
    // NOTE: Your current schema uses 'username' and 'password_hash' in the users table.
    const result = await db.query(
        'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
        [id_number, hashedPassword, role]
    );
    return result.rows[0].user_id;
};

// --- Student Registration Logic (Account Activation) ---
exports.registerStudent = async (req, res) => {
    const { studentId, password } = req.body;

    // Basic Input Validation
    if (!studentId || !password) {
        return res.status(400).json({ message: 'Student ID and Password are required.' });
    }

    try {
        const studentResult = await db.query(
            'SELECT user_account_id FROM students WHERE student_id = $1',
            [studentId]
        );

        const student = studentResult.rows[0];

        if (!student) {
            return res.status(404).json({ message: 'Invalid Student ID. Record not found.' });
        }
        
        if (student.user_account_id) {
            return res.status(400).json({ message: 'This student account has already been activated. Please log in.' });
        }

        const user_id = await createBasicUserAccount(studentId, password, 'Student');
        
        await db.query(
            'UPDATE students SET user_account_id = $1 WHERE student_id = $2',
            [user_id, studentId]
        );

        res.status(201).json({ 
            message: 'Account successfully activated! You can now log in.',
            userId: user_id
        });

    } catch (error) {
        console.error('Student Registration Error:', error);
        res.status(500).json({ message: 'An internal server error occurred during registration.' });
    }
};


// --- TEACHER REGISTRATION LOGIC (Account Activation) ---
exports.registerTeacher = async (req, res) => {
    const { teacherId, password } = req.body;

    if (!teacherId || !password) {
        return res.status(400).json({ message: 'Teacher ID and Password are required.' });
    }

    try {
        const teacherResult = await db.query(
            'SELECT user_account_id, teacher_id FROM teachers WHERE  teacher_id = $1',
            [teacherId]
        );

        const teacher = teacherResult.rows[0];

        if (!teacher) {
            return res.status(404).json({ message: 'Invalid Teacher ID. Record not found.' });
        }
        
        if (teacher.user_account_id) {
            return res.status(400).json({ message: 'This teacher account has already been activated. Please log in.' });
        }

        const user_id = await createBasicUserAccount(teacherId, password, 'Teacher');
        
        await db.query(
            'UPDATE teachers SET user_account_id = $1 WHERE teacher_id = $2',
            [user_id, teacher.teacher_id]
        );

        res.status(201).json({ 
            message: 'Teacher account successfully activated! You can now log in.',
            userId: user_id
        });

    } catch (error) {
        console.error('Teacher Registration Error:', error);
        if (error.code === '23505') { 
            return res.status(409).json({ message: 'This Teacher ID is already registered as a user.' });
        }
        res.status(500).json({ message: 'An internal server error occurred during registration.' });
    }
};

exports.login = async (req, res) => {
    // ... your existing login logic goes here ...
};