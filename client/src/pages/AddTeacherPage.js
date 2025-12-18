// client/src/pages/AddTeacherPage.js

import React, { useState } from 'react';
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
        department: 'Computer Science', 
        hireDate: new Date().toISOString().substring(0, 10), 
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const departments = [
        'Computer Science', 'Business Management', 'Accounting', 
        'Marketing Management', 'Electrical Engineering', 'Law'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); 
        setMessage('');
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // FIX: Map teacherIdNumber to teacherId to match the backend index.js
    const dataToSend = {
        teacherId: formData.teacherIdNumber, // Change key here
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phoneNumber,
        departmentId: 1 // Default ID as expected by your DB schema
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
                phoneNumber: '', department: 'Computer Science', 
                hireDate: new Date().toISOString().substring(0, 10)
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
                        <label htmlFor="department">Department *</label>
                        <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
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