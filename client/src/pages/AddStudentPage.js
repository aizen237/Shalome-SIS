// client/src/pages/AddStudentPage.js (CONFIRMED VERSION)

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import '../styles/FormPage.css';

const AddStudentPage = () => {
    // Get the authentication token
    const { token } = useAuth(); 

    const [formData, setFormData] = useState({
        studentIdNumber: '',
        fullName: '',
        department: '',
        batchYear: new Date().getFullYear(),
        registrationStatus: 'admitted'
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const departments = [
        'Computer Science', 'Business Management', 'Accounting', 
        'Marketing Management', 'Electrical Engineering', 'Law'
    ];
    const registrationStatuses = ['admitted', 'enrolled', 'deferred', 'withdrawn'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear errors on input
        setMessage(''); // Clear success message on input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        // Check if token exists before sending
        if (!token) {
            setError("Authentication token missing. Please log in again.");
            setIsLoading(false);
            return;
        }

        try {
            // CRITICAL FIX: Include Authorization Header
            const response = await axios.post('/api/admin/students/add', formData, {
                headers: {
                    // NOTE: The backend listens on port 5000, but axios in React defaults to 
                    // the current port (3000). By using a relative path, we rely on 
                    // the proxy setting in package.json to redirect this to 5000. 
                    // If you don't have "proxy": "http://localhost:5000" in 
                    // client/package.json, this line will break.
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            setMessage(response.data.message);
            
            // Clear the form after a successful submission
            setFormData({
                studentIdNumber: '',
                fullName: '',
                department: '',
                batchYear: new Date().getFullYear(),
                registrationStatus: 'admitted'
            });

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Network error occurred. Check server connection.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-page-container">
            <div className="form-wrapper admin-form-wrapper">
                <h2>Register New Student Record</h2>
                <p>This creates the student's academic record and allows them to activate their account later.</p>

                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <form onSubmit={handleSubmit} className="admin-form">
                    
                    {/* Student ID Number */}
                    <div className="input-group">
                        <label htmlFor="studentIdNumber">Student ID Number *</label>
                        <input
                            id="studentIdNumber"
                            name="studentIdNumber"
                            type="text"
                            placeholder="e.g., 2025/01 or SBTC/2025/001" 
                            value={formData.studentIdNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    {/* Full Name */}
                    <div className="input-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="e.g., Jane Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Department */}
                    <div className="input-group">
                        <label htmlFor="department">Department *</label>
                        <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select Department --</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Batch Year */}
                    <div className="input-group">
                        <label htmlFor="batchYear">Batch Year *</label>
                        <input
                            id="batchYear"
                            name="batchYear"
                            type="number"
                            min="2000"
                            max={new Date().getFullYear() + 5}
                            value={formData.batchYear}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Registration Status */}
                    <div className="input-group">
                        <label htmlFor="registrationStatus">Registration Status *</label>
                        <select
                            id="registrationStatus"
                            name="registrationStatus"
                            value={formData.registrationStatus}
                            onChange={handleChange}
                            required
                        >
                            {registrationStatuses.map(status => (
                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? 'Adding Student...' : 'Add Student Record'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddStudentPage;