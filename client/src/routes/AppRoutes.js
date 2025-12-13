// client/src/routes/AppRoutes.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

// Student Pages
import AppLayout from '../components/AppLayout';
import StudentDashboard from '../pages/Dashboard'; 
import StudentRegistrationPage from '../pages/StudentRegistrationPage'; 

// Teacher Pages
import TeacherLayout from '../components/TeacherLayout';
import TeacherDashboard from '../pages/TeacherDashboard'; 
// Admin Pages
import AdminLayout from '../components/AdminLayout'; 
import AdminDashboard from '../pages/AdminDashboard'; 
// 🛑 NEW IMPORT: AddStudentPage for the Admin section
import AddStudentPage from '../pages/AddStudentPage'; 

// --- Role-Based Protected Route Wrapper ---
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { isLoggedIn, role } = useAuth();
    
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    // 1. Check if the user is authorized for the current path
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect unauthorized users to their default path
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
        return <Navigate to="/dashboard" replace />; 
    }

    // 2. Render the correct layout based on role
    if (role === 'admin') { 
        return <AdminLayout>{children}</AdminLayout>;
    }
    if (role === 'teacher') {
        return <TeacherLayout>{children}</TeacherLayout>;
    }
    // Default to student layout
    return <AppLayout>{children}</AppLayout>;
};

// --- Main App Routes Component ---
const AppRoutes = () => {
    // FIX: Call useAuth() inside the component where it's allowed
    const { isLoggedIn, role } = useAuth(); 

    // Helper function to calculate the redirect path using the state from useAuth()
    const getRedirectPath = () => {
        if (!isLoggedIn) return '/login';
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'teacher') return '/teacher/dashboard';
        return '/dashboard';
    };
    
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/student" element={<StudentRegistrationPage />} />
            
            {/* Admin Protected Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            
            {/* 🛑 NEW ADMIN ROUTE: To the Add Student Form */}
            <Route 
                path="/admin/students/add" 
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AddStudentPage /> 
                    </ProtectedRoute>
                } 
            />

            {/* Keep the other generic routes for students/teachers/staff as they were */}
            <Route path="/admin/students/*" element={<ProtectedRoute allowedRoles={['admin']}><div>Student Management Section</div></ProtectedRoute>} />
            <Route path="/admin/teachers/*" element={<ProtectedRoute allowedRoles={['admin']}><div>Teacher Management Section</div></ProtectedRoute>} />
            <Route path="/admin/staff/*" element={<ProtectedRoute allowedRoles={['admin']}><div>Staff Management Section</div></ProtectedRoute>} />
            <Route path="/admin/profile/*" element={<ProtectedRoute allowedRoles={['admin']}><div>Admin Profile Management</div></ProtectedRoute>} />
            
            {/* Teacher Protected Routes */}
            <Route 
                path="/teacher/dashboard" 
                element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                        <TeacherDashboard />
                    </ProtectedRoute>
                } 
            />

            {/* Student Protected Routes */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute allowedRoles={['student']}> 
                        <StudentDashboard />
                    </ProtectedRoute>
                } 
            />

            {/* Default Route: Uses the fixed logic inside the component */}
            <Route path="/" element={<Navigate to={getRedirectPath()} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;