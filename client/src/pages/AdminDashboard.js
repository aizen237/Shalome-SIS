// client/src/pages/AdminDashboard.js

import React from 'react';

// 🛑 FIX: Import Link from react-router-dom
import { Link } from 'react-router-dom'; 
import '../styles/Dashboard.css'; // Reusing styles

// --- Admin Details Card (using standard div for clean dashboard) ---
const AdminDetailsCard = () => {
    // Placeholder Data
    const adminInfo = {
        fullName: "Mr. Abraham Tesfaye",
        role: "System Admin",
        email: "a.tesfaye@sbtc.edu",
        joinedDate: "October 15, 2015"
    };

    return (
        <div className="admin-details-card-wrapper">
            <h1 className="welcome-header">Welcome, {adminInfo.fullName}</h1>
            <div className="dashboard-card admin-profile-card"> 
                <div className="card-header">
                    <i className="fas fa-user-shield"></i>
                    <h3>Admin Profile</h3>
                </div>
                <div className="card-content">
                    <div className="info-grid admin-info-grid">
                        <div className="info-item">
                            <span className="info-label">Full Name</span>
                            <span className="info-value large-value">{adminInfo.fullName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Role</span>
                            <span className="info-value large-value highlight-text">{adminInfo.role}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Email</span>
                            <span className="info-value large-value">{adminInfo.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Date Joined</span>
                            <span className="info-value large-value">{adminInfo.joinedDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdminDashboard = () => {
    return (
        <div className="dashboard-content">
            <AdminDetailsCard />
            
            <h2>Quick Management Links</h2>
            {/* Quick actions section for core admin tasks */}
            <div className="quick-links-section">
                <Link to="/admin/students/add" className="quick-link-btn primary-btn"><i className="fas fa-user-plus"></i> Register New Student</Link>
                <Link to="/admin/teachers/view" className="quick-link-btn"><i className="fas fa-chalkboard-teacher"></i> View All Teachers</Link>
                <Link to="/admin/students/report" className="quick-link-btn"><i className="fas fa-chart-bar"></i> Student Reports</Link>
            </div>
            
            {/* Summary Reports removed as requested */}
        </div>
    );
};

export default AdminDashboard;