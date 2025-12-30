// client/src/pages/TeacherDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
    const { user, token } = useAuth(); // Access the real user data from context
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (user?.entityId && token) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/teachers/${user.entityId}/courses`, {
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

                <DashboardCard title="Assigned Courses" iconClass="fa-book">
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
                                        Semester: {course.semester || 'N/A'} | 
                                        Department: {course.department_name || 'N/A'}
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
                        <div style={{ color: '#999' }}>No courses assigned yet.</div>
                    )}
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