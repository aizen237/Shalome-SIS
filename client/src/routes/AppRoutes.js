// client/src/routes/AppRoutes.js (UPDATED WITH TEACHER ROUTES)

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
// 🛑 NEW IMPORT
import TeacherRegistrationPage from '../pages/TeacherRegistrationPage'; 

// Admin Pages
import AdminLayout from '../components/AdminLayout'; 
import AdminDashboard from '../pages/AdminDashboard'; 
import AddStudentPage from '../pages/AddStudentPage'; 
// 🛑 NEW IMPORT
import AddTeacherPage from '../pages/AddTeacherPage'; 

// --- Role-Based Protected Route Wrapper ---
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { isLoggedIn, role } = useAuth();
    
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    // 1. Check if the user is authorized for the current path
    if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(role)) {
        // Redirect unauthorized users to their default path
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
        return <Navigate to="/dashboard" replace />; 
    }

    // 2. Render the correct layout based on role
    if (role === 'admin') { 
        // NOTE: Layout is now applied inside the Route element below for clarity
        return <AdminLayout>{children}</AdminLayout>;
    }
    if (role === 'teacher') {
        // NOTE: Layout is now applied inside the Route element below for clarity
        return <TeacherLayout>{children}</TeacherLayout>;
    }
    // Default to student layout
    return <AppLayout>{children}</AppLayout>;
};

// --- Main App Routes Component ---
const AppRoutes = () => {
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
            
            {/* 🛑 NEW PUBLIC ROUTE */}
            <Route path="/register/teacher" element={<TeacherRegistrationPage />} /> 
            
            {/* Admin Protected Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
            
            {/* Admin: Add Student Form */}
            <Route 
                path="/admin/students/add" 
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AddStudentPage /> 
                    </ProtectedRoute>
                } 
            />

            {/* 🛑 NEW ADMIN ROUTE: Add Teacher Form */}
            <Route 
                path="/admin/teachers/add" 
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AddTeacherPage /> 
                    </ProtectedRoute>
                } 
            />
            
            {/* Teacher Protected Routes */}
            <Route 
                path="/teacher/dashboard" 
                element={
                    <ProtectedRoute allowedRoles={['Teacher']}>
                        <TeacherDashboard />
                    </ProtectedRoute>
                } 
            />
            {/* Catch-all Teacher Routes */}
             <Route path="/teacher/*" element={<ProtectedRoute allowedRoles={['Teacher']}><div>Teacher Management Section</div></ProtectedRoute>} />

            {/* Student Protected Routes */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute allowedRoles={['Student']}> 
                        <StudentDashboard />
                    </ProtectedRoute>
                } 
            />

            {/* Default Route: Redirects to the appropriate dashboard or login */}
            <Route path="/" element={<Navigate to={getRedirectPath()} replace />} />
            <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
        </Routes>
    );
};

export default AppRoutes;