// client/src/components/AdminLayout.js

import React, { useState } from 'react';
// ⚠️ IMPORTANT: We only import Link and useLocation, NOT Router or BrowserRouter
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminLayout.css'; 

const isLinkActive = (currentPath, linkPath) => {
    // Check if the current path starts with the link path (for sub-menu highlighting)
    return currentPath.startsWith(linkPath);
};

// --- Sidebar Navigation Component ---
const Sidebar = ({ isCollapsed, currentPath, logout }) => {
    // Placeholder Data for Sidebar Profile
    const adminName = "Mr. Abraham Tesfaye"; 
    const adminRole = "System Admin";
    
    // State to handle sub-menu visibility
    const [openMenu, setOpenMenu] = useState(null); 
    
    const toggleMenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    const NavItem = ({ to, icon, label, onClick, isSubItem = false }) => (
        <Link 
            to={to} 
            className={`nav-item ${isLinkActive(currentPath, to) ? 'active' : ''} ${isSubItem ? 'sub-item' : ''}`}
            onClick={onClick}
        >
            <i className={`fas ${icon}`}></i> 
            <span className="nav-label">{label}</span>
        </Link>
    );

    // Sidebar rendering logic
    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}> 
            
            {/* 🛑 CRITICAL FIX: Profile Info Section */}
            {/* This structure is needed to handle the collapse state cleanly with the CSS */}
            {!isCollapsed && (
                <div className="profile-avatar-section"> 
                    {/* Placeholder image tag - Ensure you have an image at this path or replace it */}
                    <img src="/path/to/admin_photo.jpg" alt="Profile" className="profile-img" /> 
                    <p className="user-name">{adminName}</p>
                    <p className="user-role">{adminRole}</p>
                    <div className="profile-actions">
                        <Link to="/admin/profile" className="btn-profile-view">View Profile</Link>
                        <Link to="/admin/profile/edit" className="btn-profile-edit">Edit Profile</Link>
                    </div>
                </div>
            )}


            {/* Main Navigation */}
            <nav className="sidebar-nav"> 
                
                {/* Dashboard */}
                <NavItem to="/admin/dashboard" icon="fa-tachometer-alt" label="Dashboard" />

                {/* --- Student Management Menu --- */}
                <div className="menu-group" key="student-management">
                    <div 
                        className={`nav-item has-submenu ${isLinkActive(currentPath, '/admin/students') ? 'active' : ''}`}
                        onClick={() => toggleMenu('students')}
                    >
                        <i className="fas fa-user-graduate"></i>
                        <span className="nav-label">Student Management</span>
                        {/* 🛑 Hide arrow when collapsed */}
                        {!isCollapsed && (
                            <i className={`fas fa-chevron-${openMenu === 'students' ? 'up' : 'down'} submenu-arrow`}></i>
                        )}
                    </div>
                    {openMenu === 'students' && (
                        <div className="submenu">
                            <NavItem 
                                to="/admin/students/add" 
                                icon="fa-user-plus" 
                                label="Add New Student" 
                                isSubItem={true} 
                            />
                            <NavItem 
                                to="/admin/students" 
                                icon="fa-list-ul" 
                                label="View All Students" 
                                isSubItem={true} 
                            />
                            <NavItem 
                                to="/admin/students/report" 
                                icon="fa-chart-bar" 
                                label="Student Reports" 
                                isSubItem={true} 
                            />
                        </div>
                    )}
                </div>

                {/* --- Teacher Management Menu --- */}
                <div className="menu-group" key="teacher-management">
                    <div 
                        className={`nav-item has-submenu ${isLinkActive(currentPath, '/admin/teachers') ? 'active' : ''}`}
                        onClick={() => toggleMenu('teachers')}
                    >
                        <i className="fas fa-chalkboard-teacher"></i>
                        <span className="nav-label">Teacher Management</span>
                         {!isCollapsed && (
                            <i className={`fas fa-chevron-${openMenu === 'teachers' ? 'up' : 'down'} submenu-arrow`}></i>
                         )}
                    </div>
                    {openMenu === 'teachers' && (
                        <div className="submenu">
                            <NavItem to="/admin/teachers/add" icon="fa-user-plus" label="Add New Teacher" isSubItem={true} />
                            <NavItem to="/admin/teachers" icon="fa-list-ul" label="View All Teachers" isSubItem={true} />
                            <NavItem to="/admin/teachers/report" icon="fa-chart-bar" label="Teacher Reports" isSubItem={true} />
                        </div>
                    )}
                </div>

                {/* --- Staff Management Menu --- */}
                <div className="menu-group" key="staff-management">
                    <div 
                        className={`nav-item has-submenu ${isLinkActive(currentPath, '/admin/staff') ? 'active' : ''}`}
                        onClick={() => toggleMenu('staff')}
                    >
                        <i className="fas fa-users"></i>
                        <span className="nav-label">Staff Management</span>
                        {!isCollapsed && (
                            <i className={`fas fa-chevron-${openMenu === 'staff' ? 'up' : 'down'} submenu-arrow`}></i>
                        )}
                    </div>
                    {openMenu === 'staff' && (
                        <div className="submenu">
                            <NavItem to="/admin/staff/add" icon="fa-user-plus" label="Add New Staff" isSubItem={true} />
                            <NavItem to="/admin/staff/view" icon="fa-list-ul" label="View All Staff" isSubItem={true} />
                        </div>
                    )}
                </div>

                {/* --- System Management Menu --- */}
                <NavItem to="/admin/settings" icon="fa-cogs" label="System Settings" />

            </nav>

            {/* 🛑 Removed Logout/Footer section - Logout is now in the header dropdown */}
        </div>
    );
};


// --- Main Admin Layout Component ---
const AdminLayout = ({ children }) => {
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
        <div className="app-shell"> {/* 🛑 Changed class name to match CSS */}
            <header className="app-header"> {/* 🛑 Changed class name to match CSS */}
                <button className="menu-toggle" onClick={toggleSidebar}>
                    {/* Toggle button icon changes based on collapse state */}
                    <i className={`fas fa-${isSidebarCollapsed ? 'bars' : 'times'}`}></i>
                </button>
                <div className="header-title"> 
                    <span className="college-name">Shalom Business and Technology College</span>
                </div>
                
                <div className="header-actions">
                    <div className="menu-dropdown-container">
                        {/* Gear Icon remains here */}
                        <i className="fas fa-cog action-icon" onClick={toggleHeaderMenu}></i>
                        
                        {isHeaderMenuOpen && (
                            <div className="header-dropdown-menu">
                                <Link to="/admin/password-reset" onClick={() => setIsHeaderMenuOpen(false)}>
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

export default AdminLayout;