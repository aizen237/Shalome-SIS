// server/controllers/authController.js

const db = require('../database'); // Adjust path as needed for your database connection
const bcrypt = require('bcryptjs'); // Library for hashing passwords

// Helper function to create a basic user account in the 'users' table
const createBasicUserAccount = async (id_number, password, role) => {
    // 1. Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); 
    
    // 2. Insert into the users table
    const result = await db.query(
        'INSERT INTO users (id_number, password, role) VALUES ($1, $2, $3) RETURNING user_id',
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
        // 1. Check if the Student ID exists in the 'students' table AND has no user account linked (user_account_id is NULL)
        const studentResult = await db.query(
            'SELECT user_account_id FROM students WHERE student_id = $1',
            [studentId]
        );

        const student = studentResult.rows[0];

        if (!student) {
            return res.status(404).json({ message: 'Invalid Student ID. Record not found.' });
        }
        
        // 2. Check if the account is already activated (user_account_id is not NULL)
        if (student.user_account_id) {
            return res.status(400).json({ message: 'This student account has already been activated. Please log in.' });
        }

        // 3. Create the user account in the generic 'users' table
        const user_id = await createBasicUserAccount(studentId, password, 'student');
        
        // 4. Link the new user account ID back to the student record
        await db.query(
            'UPDATE students SET user_account_id = $1 WHERE student_id = $2',
            [user_id, studentId]
        );

        // 5. Success response
        res.status(201).json({ 
            message: 'Account successfully activated! You can now log in.',
            userId: user_id
        });

    } catch (error) {
        console.error('Student Registration Error:', error);
        res.status(500).json({ message: 'An internal server error occurred during registration.' });
    }
};

// Assuming you have other functions like login:
exports.login = async (req, res) => {
    // ... your existing login logic goes here ...
};