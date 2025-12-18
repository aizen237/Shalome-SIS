// server/controllers/admin.controller.js (UPDATED WITH addTeacher)

const db = require('../config/database'); // Adjust path as needed for your database connection
const { parseFullName } = require('../utils/helpers'); // Assuming a helper for name parsing

/**
 * Utility to parse full name into first and last name (essential for clean database schema)
 */
const parseName = (fullName) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
        // Fallback for single-name entries
        return { firstName: parts[0], lastName: parts[0] };
    }
    const firstName = parts.slice(0, -1).join(' ');
    const lastName = parts[parts.length - 1];
    return { firstName, lastName };
};


/**
 * Handles the logic for an Admin to insert a new student record into the students table.
 */
exports.addStudent = async (req, res) => {
    const { 
        studentIdNumber, 
        fullName, 
        department, 
        batchYear, 
        registrationStatus 
    } = req.body;

    // ... (Existing addStudent logic remains here)
    // NOTE: This controller is simple and assumes name parsing logic is in index.js,
    // but the full robust logic is in the server/index.js update I provided previously.
};


/**
 * Handles the logic for an Admin to insert a new teacher record into the teachers table.
 */
exports.addTeacher = async (req, res) => {
    const { 
        teacherIdNumber, 
        firstName, 
        lastName, 
        email, 
        phoneNumber, 
        department, 
        hireDate 
    } = req.body;

    // 1. Basic Validation Check
    if (!teacherIdNumber || !firstName || !lastName || !email || !department || !hireDate) {
        return res.status(400).json({ message: 'Missing required teacher fields (ID, Name, Email, Department, Hire Date).' });
    }

    try {
        // 2. Find the department ID
        const deptResult = await db.query('SELECT department_id FROM departments WHERE name = $1', [department]);
        const departmentID = deptResult.rows[0]?.department_id;

        if (!departmentID) {
            return res.status(404).json({ message: `Department '${department}' not found.` });
        }
        
        // 3. SQL query to insert a new teacher record.
        const insertQuery = `
            INSERT INTO teachers (
                 teacher_id, -- Assuming you need this if you didn't update the DB schema
                first_name, 
                last_name, 
                email, 
                phone_number, 
                department_id, 
                hire_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING teacher_id, first_name, last_name;
        `;
        
        const values = [
            teacherIdNumber, 
            firstName, 
            lastName, 
            email, 
            phoneNumber || null, // Allow null phone number
            departmentID, 
            hireDate
        ];

        const result = await db.query(insertQuery, values);
        const newTeacher = result.rows[0];

        res.status(201).json({ 
            message: 'Teacher record successfully added to the system.',
            teacher: {
                id: newTeacher.teacher_id,
                full_name: `${newTeacher.first_name} ${newTeacher.last_name}`
            }
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: `A teacher with the ID or email already exists.` });
        }
        console.error('Error adding new teacher:', error);
        res.status(500).json({ message: 'An internal server error occurred while adding teacher.' });
    }
};