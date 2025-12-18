// client/src/pages/TeacherDashboard.js

import React from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get logged-in user
import '../styles/Dashboard.css';

const DashboardCard = ({ title, iconClass, children }) => (
    <div className="dashboard-card">
        <div className="card-header">
            <i className={`fas ${iconClass}`}></i>
            <h3>{title}</h3>
        </div>
        <div className="card-content">{children}</div>
    </div>
);

const TeacherDashboard = () => {
    const { user } = useAuth(); // Access the real user data from context

    // If data is still loading or missing
    if (!user) return <div className="loading">Loading Profile...</div>;

    return (
        <div className="dashboard-content">
            <div className="teacher-details-card-wrapper">
                <h1 className="welcome-header">Welcome, {user.fullName || 'Teacher'}</h1>
                
                <DashboardCard title="Teacher Details" iconClass="fa-user-tie">
                    <div className="info-grid teacher-info-grid">
                        <div className="info-item">
                            <span className="info-label">Full Name</span>
                            <span className="info-value large-value">{user.fullName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Teacher ID</span>
                            <span className="info-value large-value">{user.entityId}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Department</span>
                            <span className="info-value large-value">{user.department || 'Not Assigned'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Email</span>
                            <span className="info-value large-value">{user.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Phone Number</span>
                            <span className="info-value large-value">{user.phone || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Date Hired</span>
                            <span className="info-value large-value">
                                {user.hireDate ? new Date(user.hireDate).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                </DashboardCard>
            </div>
            
            <div className="quick-links-section">
                <a href="/teacher/grades" className="quick-link-btn"><i className="fas fa-edit"></i> Submit Grades</a>
                <a href="/teacher/materials" className="quick-link-btn"><i className="fas fa-upload"></i> Upload Materials</a>
            </div>
        </div>
    );
};

export default TeacherDashboard;