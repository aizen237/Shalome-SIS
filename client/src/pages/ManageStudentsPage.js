import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const ManageStudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [originalId, setOriginalId] = useState('');
    const [editingStudent, setEditingStudent] = useState({ 
        student_id: '', first_name: '', last_name: '', department_id: '' 
    });

    useEffect(() => { 
        fetchStudents(); 
        fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(res.data);
            setLoading(false);
        } catch (err) { setLoading(false); }
    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/departments'); 
            setDepartments(res.data);
        } catch (err) { console.log("Error fetching departments"); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/admin/students/${encodeURIComponent(originalId)}`, editingStudent, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchStudents(); 
            setIsModalOpen(false);
            alert("Student updated successfully!");
        } catch (err) { alert("Update failed. Check if ID is a duplicate."); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/students/${encodeURIComponent(id)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStudents(students.filter(s => s.student_id !== id));
            } catch (err) { alert("Delete failed."); }
        }
    };

    if (loading) return <div className="dashboard-content">Loading...</div>;

    return (
        <div className="dashboard-content">
            <div className="card-header"><h3><i className="fas fa-user-graduate"></i> Detailed Student Management</h3></div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.student_id}>
                                <td>{s.student_id}</td>
                                <td>{s.first_name} {s.last_name}</td>
                                <td>{s.department_name}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => { 
                                        setEditingStudent(s); 
                                        setOriginalId(s.student_id);
                                        setIsModalOpen(true); 
                                    }}><i className="fas fa-edit"></i></button>
                                    <button className="btn-delete" onClick={() => handleDelete(s.student_id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Student Details</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="edit-form-grid">
                                <div className="form-group">
                                    <label>Student ID</label>
                                    <input type="text" value={editingStudent.student_id} onChange={(e) => setEditingStudent({...editingStudent, student_id: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select value={editingStudent.department_id} onChange={(e) => setEditingStudent({...editingStudent, department_id: e.target.value})}>
                                        <option value="">Select Dept</option>
                                        {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" value={editingStudent.first_name} onChange={(e) => setEditingStudent({...editingStudent, first_name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" value={editingStudent.last_name} onChange={(e) => setEditingStudent({...editingStudent, last_name: e.target.value})} required />
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
export default ManageStudentsPage;