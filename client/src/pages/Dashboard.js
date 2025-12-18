// client/src/pages/Dashboard.js

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

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // This uses the fullName property from your index.js login response
    const studentName = user?.fullName || user?.username || "Student"; 
    
    const studentInfo = {
        name: user?.fullName || 'N/A', // Corrected to show Name instead of ID
        id: user?.entityId || 'N/A', 
        department: user?.department || 'N/A',
        registeredDate: user?.enrollmentYear || 'N/A', 
    };

    return (
        <div className="dashboard-content">
            <div className="student-dashboard-header">
                <h1 className="welcome-header">Welcome Back, {user.fullName || 'Student'}</h1>
            </div>

            <div className="student-details-card-wrapper">
                <DashboardCard title="Student Details" iconClass="fa-address-card"> 
                    <div className="info-grid"> 
                        <div className="info-item">
                            <span className="info-label">Student Name</span>
                            <span className="info-value large-value">{studentInfo.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Student ID</span>
                            <span className="info-value large-value">{studentInfo.id}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Department</span>
                            <span className="info-value large-value">{studentInfo.department}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Enrollment Year</span>
                            <span className="info-value large-value">{studentInfo.registeredDate}</span>
                        </div>
                    </div>
                </DashboardCard>
            </div>

            <div className="quick-links-section">
                <a 
                    href="/courses" 
                    onClick={(e) => { e.preventDefault(); navigate('/courses'); }} 
                    className="quick-link-btn"
                > 
                    <i className="fas fa-book-open"></i> View Current Courses
                </a>
                
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