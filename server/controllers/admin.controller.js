// server/controllers/admin.controller.js

// 🛑 IMPORTANT: Update this path if your database client is in a different location!
const db = require('../config/database'); 

/**
 * Handles the logic for an Admin to insert a new student record into the students table.
 */
exports.addStudent = async (req, res) => {
    // We expect detailed student information from the Admin form
    const { 
        studentIdNumber, 
        fullName, 
        department, 
        batchYear, 
        registrationStatus 
    } = req.body;

    // Basic Validation Check
    if (!studentIdNumber || !fullName || !department || !batchYear) {
        return res.status(400).json({ message: 'Missing required student fields.' });
    }

    try {
        // SQL query to insert a new student record.
        // The user_account_id is explicitly set to NULL because the student has not registered their login yet.
        const insertQuery = `
            INSERT INTO students (
                student_id_number, 
                full_name, 
                department, 
                batch_year, 
                registration_status, 
                user_account_id
            )
            VALUES ($1, $2, $3, $4, $5, NULL)
            RETURNING id, student_id_number;
        `;
        
        const values = [
            studentIdNumber, 
            fullName, 
            department, 
            batchYear, 
            registrationStatus || 'admitted' // Default to 'admitted' if not specified
        ];

        const result = await db.query(insertQuery, values);

        res.status(201).json({ 
            message: 'Student record successfully added to the system.',
            student: result.rows[0]
        });

    } catch (error) {
        // Catch duplicate key errors (e.g., if studentIdNumber already exists)
        if (error.code === '23505') {
            return res.status(409).json({ message: `A student with ID ${studentIdNumber} already exists.` });
        }
        console.error('Error adding new student:', error);
        res.status(500).json({ message: 'An internal server error occurred while adding the student.' });
    }
};