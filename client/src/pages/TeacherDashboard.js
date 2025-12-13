// client/src/pages/TeacherDashboard.js

import React from 'react';
import '../styles/Dashboard.css'; // Reuse Dashboard CSS styles for cards

// --- Reusable Dashboard Card Component (Copied from Student Dashboard) ---
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

// --- Teacher Details Card ---
const TeacherDetailsCard = () => {
    // Placeholder Data
    const teacherInfo = {
        fullName: "Dr. Jane Smith",
        phone: "+251 911 123 456",
        email: "j.smith@sbtc.edu",
        hiredDate: "August 1, 2018",
        courses: ["CS-101: Intro to Programming", "CS-305: Database Systems", "CS-410: AI & Ethics"]
    };

    return (
        <div className="teacher-details-card-wrapper">
            <h1 className="welcome-header">Welcome, Dr. Smith</h1>
            <DashboardCard title="Teacher Details" iconClass="fa-user-tie">
                <div className="info-grid teacher-info-grid">
                    <div className="info-item">
                        <span className="info-label">Full Name</span>
                        <span className="info-value large-value">{teacherInfo.fullName}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Date Hired</span>
                        <span className="info-value large-value">{teacherInfo.hiredDate}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value large-value">{teacherInfo.email}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Phone Number</span>
                        <span className="info-value large-value">{teacherInfo.phone}</span>
                    </div>
                    <div className="info-item full-width">
                        <span className="info-label">Courses Taught</span>
                        <div className="course-list">
                            {teacherInfo.courses.map((course, index) => (
                                <span key={index} className="course-tag">{course}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};


const TeacherDashboard = () => {
    return (
        <div className="dashboard-content">
            <TeacherDetailsCard />
            
            {/* Optional: Quick actions section */}
            <div className="quick-links-section">
                <a href="/teacher/grades" className="quick-link-btn"><i className="fas fa-edit"></i> Submit Grades</a>
                <a href="/teacher/materials" className="quick-link-btn"><i className="fas fa-upload"></i> Upload Materials</a>
            </div>
        </div>
    );
};

export default TeacherDashboard;