// client/src/pages/ManageTeachersPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const ManageTeachersPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]); // Added for Dept dropdown
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState({ 
        teacher_id: '', first_name: '', last_name: '', 
        email: '', phone_number: '', department_id: '' 
    });
    const [originalId, setOriginalId] = useState(''); // Keep track of ID if it changes

    useEffect(() => { 
        fetchTeachers(); 
        fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchTeachers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/teachers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTeachers(res.data);
            setLoading(false);
        } catch (err) { setLoading(false); }
    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/departments'); // Assumes you have this route
            setDepartments(res.data);
        } catch (err) { console.log("Error fetching departments"); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Use originalId in URL to find the record, editingTeacher.teacher_id in body to update it
            await axios.put(`http://localhost:5000/api/admin/teachers/${encodeURIComponent(originalId)}`, editingTeacher, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchTeachers(); // Refresh list to get new Dept names
            setIsModalOpen(false);
            alert("Teacher updated successfully!");
        } catch (err) { alert("Update failed. The ID might already exist."); }
    };

    if (loading) return <div className="dashboard-content">Loading...</div>;

    return (
        <div className="dashboard-content">
            <div className="card-header"><h3><i className="fas fa-chalkboard-teacher"></i> Detailed Teacher Management</h3></div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Dept</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((t) => (
                            <tr key={t.teacher_id}>
                                <td>{t.teacher_id}</td>
                                <td>{t.first_name} {t.last_name}</td>
                                <td>{t.department_name}</td>
                                <td>{t.email}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => { 
                                        setEditingTeacher(t); 
                                        setOriginalId(t.teacher_id);
                                        setIsModalOpen(true); 
                                    }}><i className="fas fa-edit"></i></button>
                                    {/* Delete logic remains same as before */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Teacher Details</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="edit-form-grid">
                                <div className="form-group">
                                    <label>Teacher ID</label>
                                    <input type="text" value={editingTeacher.teacher_id} onChange={(e) => setEditingTeacher({...editingTeacher, teacher_id: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select value={editingTeacher.department_id} onChange={(e) => setEditingTeacher({...editingTeacher, department_id: e.target.value})}>
                                        <option value="">Select Dept</option>
                                        {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" value={editingTeacher.first_name} onChange={(e) => setEditingTeacher({...editingTeacher, first_name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" value={editingTeacher.last_name} onChange={(e) => setEditingTeacher({...editingTeacher, last_name: e.target.value})} required />
                                </div>
                                <div className="form-group full-width">
                                    <label>Email Address</label>
                                    <input type="email" value={editingTeacher.email} onChange={(e) => setEditingTeacher({...editingTeacher, email: e.target.value})} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Phone Number</label>
                                    <input type="text" value={editingTeacher.phone_number} onChange={(e) => setEditingTeacher({...editingTeacher, phone_number: e.target.value})} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ManageTeachersPage;