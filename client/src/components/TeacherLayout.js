// client/src/components/TeacherLayout.js

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/TeacherLayout.css'; 

const isLinkActive = (currentPath, linkPath) => {
    return currentPath === linkPath;
};

// --- Sidebar Navigation Component ---
const Sidebar = ({ isCollapsed, currentPath, logout }) => {
    // FIX: Access the real user data from AuthContext
    const { user } = useAuth(); 

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            
            {/* Profile Avatar Section */}
            {!isCollapsed && (
                <div className="profile-avatar-section">
                    <img src="/path/to/teacher_photo.jpg" alt="Profile" className="profile-img" />
                    {/* DISPLAY ACTUAL NAME HERE */}
                    <p className="user-name">{user?.fullName || "Teacher"}</p>
                    <p className="user-role">Teacher</p>
                    <div className="profile-actions">
                        <Link to="/teacher/profile" className="btn-profile-view">View Profile</Link>
                        <Link to="/teacher/profile/edit" className="btn-profile-edit">Edit Profile</Link>
                    </div>
                </div>
            )}
            
            <nav className="sidebar-nav">
                <Link to="/teacher/dashboard" className={`nav-item ${isLinkActive(currentPath, '/teacher/dashboard') ? 'active' : ''}`}>
                    <i className="fas fa-th-large"></i> 
                    <span className="nav-label">Dashboard</span>
                </Link>

                <Link to="/teacher/materials" className={`nav-item ${isLinkActive(currentPath, '/teacher/materials') ? 'active' : ''}`}>
                    <i className="fas fa-upload"></i> 
                    <span className="nav-label">Course Materials</span>
                </Link>

                <Link to="/teacher/grades" className={`nav-item ${isLinkActive(currentPath, '/teacher/grades') ? 'active' : ''}`}>
                    <i className="fas fa-edit"></i> 
                    <span className="nav-label">Grade Submission</span>
                </Link>

                <Link to="/teacher/attendance" className={`nav-item ${isLinkActive(currentPath, '/teacher/attendance') ? 'active' : ''}`}>
                    <i className="fas fa-clipboard-check"></i> 
                    <span className="nav-label">Attendance Mgmt</span>
                </Link>
            </nav>
        </div>
    );
};

// --- Main Layout Component ---
const TeacherLayout = ({ children }) => {
    const { logout } = useAuth();
    const location = useLocation();
    
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false); 

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };
    
    const toggleHeaderMenu = () => {
        setIsHeaderMenuOpen(!isHeaderMenuOpen);
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <div className="menu-toggle" onClick={toggleSidebar}>
                    <i className="fas fa-bars"></i>
                </div>
                
                <div className="header-title">
                    <img src="/path/to/college_logo.png" alt="SBTC Logo" className="college-logo" /> 
                    <span className="college-name">Shalom Business and Technology College</span>
                </div>
                
                <div className="header-actions">
                    <div className="menu-dropdown-container">
                        <i className="fas fa-cog action-icon" onClick={toggleHeaderMenu}></i>
                        
                        {isHeaderMenuOpen && (
                            <div className="header-dropdown-menu">
                                <Link to="/teacher/password-reset" onClick={() => setIsHeaderMenuOpen(false)}>
                                    <i className="fas fa-key"></i> Change Password
                                </Link>
                                <button onClick={logout} className="logout-button">
                                    <i className="fas fa-sign-out-alt"></i> Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                currentPath={location.pathname}
                logout={logout} 
            />

            <main className={`content-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="content-container">
                    {children} 
                </div>
            </main>
        </div>
    );
};

export default TeacherLayout;