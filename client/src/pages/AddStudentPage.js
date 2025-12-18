// client/src/pages/AddStudentPage.js (RESTORED VERSION)

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import '../styles/FormPage.css'; // Points to your original style

const AddStudentPage = () => {
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
        setError(''); 
        setMessage(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        // DATA MAPPING: Splitting fullName into first and last for the DB
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

        const dataToSend = {
            studentId: formData.studentIdNumber,
            firstName: firstName,
            lastName: lastName,
            departmentId: 1, // Defaulting to 1 for now as DB expects Integer
            enrollmentYear: parseInt(formData.batchYear)
        };

        try {
            const response = await axios.post(
                'http://localhost:5000/api/admin/students/add',
                dataToSend,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.status === 201) {
                setMessage('Student added successfully!');
                setFormData({
                    studentIdNumber: '',
                    fullName: '',
                    department: '',
                    batchYear: new Date().getFullYear(),
                    registrationStatus: 'admitted'
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Network error occurred. Check server connection.');
        } finally {
            setIsLoading(false);
        }
    };

     // client/src/pages/AddStudentPage.js

return (
    <div className="form-page-container"> {/* Changed from form-container */}
        <div className="form-wrapper">    {/* Changed from form-card */}
            <h2>Register New Student</h2>
            <p>Use this form to pre-register a student's profile. They will use their ID to activate their account later.</p>

            {message && <div className="success-message">{message}</div>} {/* Changed class */}
            {error && <div className="error-message">{error}</div>}       {/* Changed class */}

            <form className="admin-form" onSubmit={handleSubmit}> {/* Added admin-form class */}
                
                <div className="input-group">
                    <label htmlFor="studentIdNumber">Student ID Number *</label>
                    <input
                        id="studentIdNumber"
                        name="studentIdNumber"
                        type="text"
                        value={formData.studentIdNumber}
                        onChange={handleChange}
                        placeholder="e.g. 0933/15"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter first and last name"
                        required
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
                        <option value="">Select Department</option>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="batchYear">Batch Year *</label>
                    <input
                        id="batchYear"
                        name="batchYear"
                        type="number"
                        value={formData.batchYear}
                        onChange={handleChange}
                        required
                    />
                </div>

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