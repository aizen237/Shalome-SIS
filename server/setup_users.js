const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// --- 1. DATABASE CONNECTION ---
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lms_db',
    // 👇👇👇 REPLACE 'password' WITH YOUR REAL POSTGRES PASSWORD 👇👇👇
    password: 'root', 
    port: 5432,
});

const PLAIN_PASSWORD = 'password123';

// --- 2. SQL TO CREATE TABLES ---
const createTablesQuery = `
    DROP SCHEMA public CASCADE; 
    CREATE SCHEMA public;

    CREATE TABLE departments (
        department_id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        head_of_department VARCHAR(100)
    );

    CREATE TABLE students (
        student_id VARCHAR(9) PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        gender VARCHAR(10),
        date_of_birth DATE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone_number VARCHAR(15),
        department_id INT NOT NULL REFERENCES departments(department_id),
        enrollment_year INT,
        status VARCHAR(20) DEFAULT 'Active'
    );

    CREATE TABLE teachers (
        teacher_id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone_number VARCHAR(15),
        department_id INT REFERENCES departments(department_id),
        hire_date DATE DEFAULT CURRENT_DATE
    );

    CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        role VARCHAR(10) NOT NULL CHECK (role IN ('Admin', 'Teacher', 'Student')),
        student_id VARCHAR(10) UNIQUE REFERENCES students(student_id) ON DELETE CASCADE,
        teacher_id INT UNIQUE REFERENCES teachers(teacher_id) ON DELETE CASCADE
    );
`;

async function setupTestUsers() {
    let client;
    try {
        client = await pool.connect();
        console.log('--- Starting User Setup ---');

        // A. Create Structure (Tables)
        console.log('Creating tables...');
        await client.query(createTablesQuery);

        // B. Insert Departments
        console.log('Inserting data...');
        const deptInsert = await client.query(
            "INSERT INTO departments (name, head_of_department) VALUES ('Computer Science', 'Dr. Reed') RETURNING department_id"
        );
        const csDeptId = deptInsert.rows[0].department_id;

        // C. Insert Teacher
        const teacherResult = await client.query(
            "INSERT INTO teachers (first_name, last_name, email, phone_number, department_id) VALUES ($1, $2, $3, $4, $5) RETURNING teacher_id",
            ['Marie', 'Curie', 'marie@uni.edu', '555-1234', csDeptId]
        );
        const teacherId = teacherResult.rows[0].teacher_id;

        // D. Insert Student
        const studentId = '0933/17';
        await client.query(
            "INSERT INTO students (student_id, first_name, last_name, gender, date_of_birth, email, phone_number, department_id, enrollment_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            [studentId, 'John', 'Doe', 'Male', '2000-01-15', 'john.doe@uni.edu', '555-5678', csDeptId, 2025]
        );

        // E. Insert Hashed Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(PLAIN_PASSWORD, salt);

        await client.query("INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'Admin')", ['admin1', hashedPassword]);
        await client.query("INSERT INTO users (username, password_hash, role, teacher_id) VALUES ($1, $2, 'Teacher', $3)", ['teacher1', hashedPassword, teacherId]);
        await client.query("INSERT INTO users (username, password_hash, role, student_id) VALUES ($1, $2, 'Student', $3)", ['student1', hashedPassword, studentId]);

        console.log('--- Setup Complete. Tables created and Users inserted! ---');
    } catch (err) {
        console.error("SETUP ERROR:", err.message);
    } finally {
        if (client) client.release();
        pool.end();
    }
}

setupTestUsers();