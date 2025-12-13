// client/src/pages/Dashboard.js (FINAL, CONFIRMED STRUCTURE)

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; 

// --- Reusable Dashboard Card Component ---
const DashboardCard = ({ title, iconClass, children }) => (
    <div className="dashboard-card">
        <div className="card-header">
            <i className={`fas ${iconClass}`}></i>
            <h3>{title}</h3>
        </div>
        <div className="card-content">
            {children}
        </div>
    </div>
);

// --- Student Dashboard ---
const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Data extraction
    const studentName = user?.full_name || user?.username || "Student"; 
    
    // Extract Student details for the Info Card
    const studentInfo = {
        name: user?.full_name || 'N/A',
        id: user?.username || 'N/A', 
        department: user?.department || 'N/A',
        enrollmentYear: user?.enrollment_year || 'N/A', 
    };

    return (
        <div className="dashboard-content">
            
            {/* The student photo/header structure from the uploaded file is used here */}
            <div className="student-dashboard-header">
                {/* The welcome header is now correctly centered */}
                <h1 className="welcome-header">Welcome Back, {studentName}</h1>
            </div>

            {/* 2. Student Details Card (Uses wrapper to apply max-width) */}
            <div className="student-details-card-wrapper">
                {/* The title and icon match the screenshot */}
                <DashboardCard title="Student Details" iconClass="fa-address-card"> 
                    {/* CRITICAL LAYOUT FIX: Uses info-grid for the two-column CSS layout */}
                    <div className="info-grid"> 
                        
                        {/* PAIR 1: Student Name (Column 1) */}
                        <div className="info-item">
                            <span className="info-label">Student Name</span>
                            <span className="info-value large-value">{studentInfo.name}</span>
                        </div>
                        
                        {/* PAIR 2: ID (Column 2) */}
                        <div className="info-item">
                            <span className="info-label">Student ID</span>
                            <span className="info-value large-value">{studentInfo.id}</span>
                        </div>

                        {/* PAIR 3: Department (Column 1) */}
                        <div className="info-item">
                            <span className="info-label">Department</span>
                            <span className="info-value large-value">{studentInfo.department}</span>
                        </div>
                        
                        {/* PAIR 4: Registered Date (Column 2) */}
                        <div className="info-item">
                            <span className="info-label">Registered Date</span>
                            <span className="info-value large-value">{studentInfo.enrollmentYear}</span>
                        </div>
                        
                    </div>
                </DashboardCard>
            </div>

            {/* 3. Action Buttons (Uses quick-links-section for side-by-side flex layout) */}
            <div className="quick-links-section">
                
                {/* View Current Course Button */}
                <a 
                    href="/courses" 
                    onClick={(e) => { e.preventDefault(); navigate('/courses'); }} 
                    className="quick-link-btn"
                > 
                    <i className="fas fa-book-open"></i> View Current Courses
                </a>
                
                {/* Go to LMS Button */}
                <a 
                    href="/lms" 
                    onClick={(e) => { e.preventDefault(); navigate('/lms'); }} 
                    className="quick-link-btn"
                > 
                    <i className="fas fa-chalkboard"></i> Go to LMS
                </a>
            </div>
        </div>
    );
};

export default StudentDashboard;