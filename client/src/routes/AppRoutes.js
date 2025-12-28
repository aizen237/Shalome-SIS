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
import TeacherRegistrationPage from '../pages/TeacherRegistrationPage'; 

// Admin Pages
import AdminLayout from '../components/AdminLayout'; 
import AdminDashboard from '../pages/AdminDashboard'; 
import AddStudentPage from '../pages/AddStudentPage'; 
import AddTeacherPage from '../pages/AddTeacherPage'; 
// 🛑 NEW IMPORTS: View/Manage Pages
import ManageStudentsPage from '../pages/ManageStudentsPage';
import ManageTeachersPage from '../pages/ManageTeachersPage';

// --- Role-Based Protected Route Wrapper ---
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { isLoggedIn, role } = useAuth();
    
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    // Check if the user is authorized for the current path
    if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(role?.toLowerCase())) {
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
        return <Navigate to="/dashboard" replace />; 
    }

    // Render the correct layout based on role
    if (role === 'admin') return <AdminLayout>{children}</AdminLayout>;
    if (role === 'teacher') return <TeacherLayout>{children}</TeacherLayout>;
    
    return <AppLayout>{children}</AppLayout>;
};

// --- Main App Routes Component ---
const AppRoutes = () => {
    const { isLoggedIn, role } = useAuth(); 

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
            <Route path="/register/teacher" element={<TeacherRegistrationPage />} /> 
            
            {/* Admin Protected Routes */}
            <Route 
                path="/admin/dashboard" 
                element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} 
            />
            
            <Route 
                path="/admin/students/add" 
                element={<ProtectedRoute allowedRoles={['Admin']}><AddStudentPage /></ProtectedRoute>} 
            />

            <Route 
                path="/admin/teachers/add" 
                element={<ProtectedRoute allowedRoles={['Admin']}><AddTeacherPage /></ProtectedRoute>} 
            />

            {/* 🛑 NEW ADMIN ROUTE: View All Students */}
            <Route 
                path="/admin/students" 
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <ManageStudentsPage />
                    </ProtectedRoute>
                } 
            />

            {/* 🛑 NEW ADMIN ROUTE: View All Teachers */}
            <Route 
                path="/admin/teachers" 
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <ManageTeachersPage />
                    </ProtectedRoute>
                } 
            />
            
            {/* Teacher Protected Routes */}
            <Route 
                path="/teacher/dashboard" 
                element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherDashboard /></ProtectedRoute>} 
            />
            
            <Route 
                path="/teacher/*" 
                element={<ProtectedRoute allowedRoles={['Teacher']}><div>Teacher Management Section</div></ProtectedRoute>} 
            />

            {/* Student Protected Routes */}
            <Route 
                path="/dashboard" 
                element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} 
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to={getRedirectPath()} replace />} />
            <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
        </Routes>
    );
};

export default AppRoutes;