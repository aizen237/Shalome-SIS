-- server/database.sql - SCHEMA ONLY

-- Create the table to store department names and details
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    head_of_department VARCHAR(100)
);

CREATE TABLE students (
    student_id VARCHAR(10) PRIMARY KEY, 
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    department_id INT NOT NULL,
    enrollment_year INT CHECK (enrollment_year >= 2000),
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
); 

ALTER TABLE students
ADD CONSTRAINT fk_department
FOREIGN KEY (department_id)
REFERENCES departments (department_id)
ON DELETE RESTRICT;

CREATE TABLE teachers (
    teacher_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    department_id INT REFERENCES departments(department_id),
    hire_date DATE DEFAULT CURRENT_DATE
);


CREATE TABLE courses (
    course_code VARCHAR(10) PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL CHECK (credits BETWEEN 1 AND 6),
    course_type VARCHAR(20) NOT NULL CHECK (course_type IN ('Core', 'Elective')),
    department_id INT NOT NULL,
    teacher_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',

    CONSTRAINT fk_course_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_course_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
        ON DELETE RESTRICT
);


CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    course_code VARCHAR(10) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Enrolled' CHECK (status IN ('Enrolled', 'Completed', 'Dropped', 'Withdrawn')),

    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_code)
        REFERENCES courses(course_code)
        ON DELETE RESTRICT,

    CONSTRAINT unique_student_course_semester 
        UNIQUE(student_id, course_code, semester)
);

CREATE TABLE grades (
    grade_id SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL,
    assessment_type VARCHAR(20) NOT NULL CHECK (assessment_type IN ('Quiz', 'Midterm', 'Final', 'Assignment', 'Project')),
    score DECIMAL(5, 2) NOT NULL CHECK (score >= 0),
    max_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00 CHECK (max_score > 0),
    remarks TEXT,
    graded_date DATE DEFAULT CURRENT_DATE,

    CONSTRAINT fk_grade_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(enrollment_id)
        ON DELETE CASCADE,

    CHECK (score <= max_score)
);

CREATE TABLE materials (
    material_id SERIAL PRIMARY KEY,
    course_code VARCHAR(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL CHECK (file_path <> ''),
    file_type VARCHAR(10) CHECK (file_type IN ('pdf', 'ppt', 'docx', 'xlsx', 'zip', 'mp4')),
    uploaded_by INT NOT NULL REFERENCES teachers(teacher_id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_material_course
        FOREIGN KEY (course_code)
        REFERENCES courses(course_code)
        ON DELETE CASCADE
);


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('Admin', 'Teacher', 'Student')),
    
    student_id VARCHAR(10) UNIQUE,
    teacher_id INT UNIQUE,
    
    CHECK (
        (role = 'Student' AND student_id IS NOT NULL AND teacher_id IS NULL) OR
        (role = 'Teacher' AND teacher_id IS NOT NULL AND student_id IS NULL) OR
        (role = 'Admin' AND student_id IS NULL AND teacher_id IS NULL)
    ),

    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);