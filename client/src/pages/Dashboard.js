// client/src/pages/Dashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    
    // This uses the fullName property from your index.js login response
    const studentName = user?.fullName || user?.username || "Student"; 
    
    const studentInfo = {
        name: user?.fullName || 'N/A', // Corrected to show Name instead of ID
        id: user?.entityId || 'N/A', 
        department: user?.department || 'N/A',
        registeredDate: user?.enrollmentYear || 'N/A',
        yearLevel: user?.yearLevel || 'N/A'
    };

    useEffect(() => {
        const fetchCourses = async () => {
            if (user?.entityId && token) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/students/${user.entityId}/courses`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setCourses(res.data);
                } catch (err) {
                    console.error('Error fetching courses:', err);
                } finally {
                    setLoadingCourses(false);
                }
            }
        };
        fetchCourses();
    }, [user, token]);

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
                        <div className="info-item">
                            <span className="info-label">Year Level</span>
                            <span className="info-value large-value">{studentInfo.yearLevel}</span>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard title="Current Courses" iconClass="fa-book-open">
                    {loadingCourses ? (
                        <div>Loading courses...</div>
                    ) : courses.length > 0 ? (
                        <div className="course-list">
                            {courses.map((course) => (
                                <div key={course.course_id} className="course-tag" style={{ marginBottom: '10px', padding: '12px', backgroundColor: 'rgba(68, 114, 196, 0.1)', borderRadius: '6px' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-blue)', marginBottom: '4px' }}>
                                        {course.course_id} - {course.course_name}
                                    </div>
                                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                                        Credits: {course.credits || 'N/A'} | 
                                        Semester: {course.semester || course.curriculum_semester || 'N/A'}
                                    </div>
                                    {course.description && (
                                        <div style={{ fontSize: '0.85em', color: '#888', marginTop: '4px' }}>
                                            {course.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ color: '#999' }}>No courses available for your year level and department.</div>
                    )}
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