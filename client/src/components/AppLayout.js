// client/src/components/AppLayout.js (FINAL, CONFIRMED STRUCTURE)

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // CRITICAL: Import useAuth
import '../styles/AppLayout.css'; 

// Function to determine if a link is currently active
const isLinkActive = (currentPath, linkPath) => {
    return currentPath.startsWith(linkPath); 
};

// --- Sidebar Navigation Component ---
const Sidebar = ({ isCollapsed, currentPath, logout, user }) => { // CRITICAL: Receive 'user'
    const [isOtherInfoOpen, setIsOtherInfoOpen] = useState(false); 
    
    // CRITICAL FIX: Dynamic user data extraction for sidebar profile
    const fullName = user?.fullName || user?.username || "User"; 
    const userRole = user?.role || "Student";

    const toggleOtherInfo = (e) => {
        if (e && e.preventDefault) e.preventDefault(); 
        setIsOtherInfoOpen(!isOtherInfoOpen);
    };
    
    // Custom NavItem component for clean link rendering
    const NavItem = ({ to, icon, label, isSubItem = false }) => (
        <Link 
            to={to} 
            // Use provided CSS classes: nav-item, active, sub-item
            className={`nav-item ${isLinkActive(currentPath, to) ? 'active' : ''} ${isSubItem ? 'sub-item' : ''}`}
        >
            <i className={`fas ${icon}`}></i> 
            <span className="nav-label">{label}</span>
        </Link>
    );

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            
            {/* A. Profile Avatar Section: Dynamic Name and Role */}
            {!isCollapsed && (
                <div className="profile-avatar-section">
                    <img src="/path/to/admin_uploaded_photo.jpg" alt="Profile" className="profile-img" />
                    <p className="user-name">{fullName}</p>
                    <p className="user-role">{userRole}</p>
                </div>
            )}
            
            {/* B. Navigation Links Section */}
            <nav className="sidebar-nav">
                {/* Use correct icons/labels matching the screenshot */}
                <NavItem to="/dashboard" icon="fa-th-large" label="Dashboard" />
                <NavItem to="/courses" icon="fa-book-open" label="Courses" />
                <NavItem to="/grades" icon="fa-graduation-cap" label="Grades" />
                <NavItem to="/academic" icon="fa-university" label="Academic Information" />

                {/* --- EXPANDABLE MENU: Other Information --- */}
                <div 
                    className={`nav-item dropdown ${isOtherInfoOpen ? 'active' : ''}`}
                    onClick={toggleOtherInfo}
                >
                    {/* Use 'fa-ellipsis-h' or similar simple icon */}
                    <i className="fas fa-ellipsis-h"></i>
                    <span className="nav-label">Other Information</span>
                    <i className={`fas fa-chevron-down dropdown-arrow ${isOtherInfoOpen ? 'rotated' : ''}`}></i>
                </div>

                {/* Sub-Items (Matches your full requested list) */}
                {isOtherInfoOpen && (
                    <div className="dropdown-content">
                        <Link to="/other/withdrawal">Withdrawal</Link>
                        <Link to="/other/readmission">Readmission</Link>
                        <Link to="/other/transfer">Transfer</Link>
                        <Link to="/other/payment">Payment</Link>
                    </div>
                )}
                
                {/* Online Library and LMS - Placed outside dropdown but use NavItem structure */}
                <NavItem to="/library" icon="fa-atlas" label="Online Library" />
                <NavItem to="/lms" icon="fa-chalkboard" label="LMS / E-Learning" />
            </nav>
        </div>
    );
};

// --- Main Layout Component ---
const AppLayout = ({ children }) => {
    const location = useLocation();
    const { logout, user } = useAuth(); // CRITICAL: Get user object here
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
            {/* A. Header (Uses classes from AppLayout.css) */}
            <header className="app-header">
                <div className="menu-toggle" onClick={toggleSidebar}>
                    <i className="fas fa-bars"></i>
                </div>
                
                <div className="header-title">
                    <img src="/path/to/college_logo.png" alt="SBTC Logo" className="college-logo" /> 
                    <span className="college-name">Shalom Business and Technology College</span>
                </div>
                
                {/* Header actions/dropdown */}
                <div className="header-actions">
                    <div className="menu-dropdown-container">
                        <i className="fas fa-cog action-icon" onClick={toggleHeaderMenu}></i>
                        
                        {isHeaderMenuOpen && (
                            <div className="header-dropdown-menu">
                                <Link to="/profile/change-password" onClick={() => setIsHeaderMenuOpen(false)}>
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

            {/* B. Sidebar (CRITICAL: Pass the user object) */}
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                currentPath={location.pathname}
                logout={logout} 
                user={user} // PASSES DYNAMIC USER DATA
            />

            {/* C. Content Wrapper */}
            <main className={`content-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="content-container">
                    {children} 
                </div>
            </main>
        </div>
    );
};

export default AppLayout;