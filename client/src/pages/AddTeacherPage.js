// client/src/pages/AddTeacherPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/FormPage.css';

const AddTeacherPage = () => {
    const { token } = useAuth(); 

    const [formData, setFormData] = useState({
        teacherIdNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        hireDate: new Date().toISOString().substring(0, 10),
        course_ids: []
    });
    const [courses, setCourses] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/courses');
                setCourses(res.data);
            } catch (err) {
                console.log("Error fetching courses");
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); 
        setMessage('');
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSend = {
        teacherId: formData.teacherIdNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phoneNumber,
        hire_date: formData.hireDate,
        course_ids: formData.course_ids
    };

    try {
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };
        
        // Use dataToSend instead of formData
        await axios.post('/api/admin/teachers/add', dataToSend, config);
        
        setMessage(`Success! Teacher record for ID ${formData.teacherIdNumber} has been created.`);
        // ... rest of your reset logic
            
            // Reset form fields after successful addition
            setFormData({
                teacherIdNumber: '', firstName: '', lastName: '', email: '', 
                phoneNumber: '', hireDate: new Date().toISOString().substring(0, 10),
                course_ids: []
            });

        } catch (err) {
            console.error('Error adding teacher:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to add teacher record. Check the server console.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-page-container">
            <div className="form-wrapper">
                <h2>Register New Teacher</h2>
                <p>Use this form to pre-register a teacher's profile. They will use their ID to activate their account later.</p>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form className="admin-form" onSubmit={handleSubmit}>
                    
                    {/* Input fields remain the same */}
                    <div className="input-group">
                        <label htmlFor="teacherIdNumber">Teacher ID Number *</label>
                        <input
                            id="teacherIdNumber"
                            name="teacherIdNumber"
                            type="text"
                            value={formData.teacherIdNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* ... (Other fields are unchanged) ... */}
                    
                    <div className="input-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="courses">Assigned Courses</label>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ced4da', borderRadius: '8px', padding: '10px', backgroundColor: '#fff' }}>
                            {courses.length === 0 ? (
                                <p style={{ color: '#6c757d', fontSize: '0.9em' }}>No courses available. Create courses first.</p>
                            ) : (
                                courses.map(course => (
                                    <label key={course.course_id} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.course_ids.includes(course.course_id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        course_ids: [...formData.course_ids, course.course_id]
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        course_ids: formData.course_ids.filter(id => id !== course.course_id)
                                                    });
                                                }
                                            }}
                                            style={{ marginRight: '8px' }}
                                        />
                                        {course.course_id} - {course.course_name}
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="hireDate">Hire Date *</label>
                        <input
                            id="hireDate"
                            name="hireDate"
                            type="date"
                            value={formData.hireDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? 'Adding Teacher...' : 'Add Teacher Record'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTeacherPage;