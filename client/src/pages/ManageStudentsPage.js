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
        student_id: '', first_name: '', last_name: '', department_id: '', enrollment_year: '', year_level: '' 
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
            const updateData = {
                student_id: editingStudent.student_id,
                first_name: editingStudent.first_name,
                last_name: editingStudent.last_name,
                department_id: parseInt(editingStudent.department_id),
                enrollment_year: parseInt(editingStudent.enrollment_year),
                year_level: parseInt(editingStudent.year_level)
            };
            await axios.put(`http://localhost:5000/api/admin/students/${encodeURIComponent(originalId)}`, updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchStudents(); 
            setIsModalOpen(false);
            alert("Student updated successfully!");
        } catch (err) { 
            alert(err.response?.data?.message || "Update failed. Check if ID is a duplicate."); 
        }
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
                            <th>Enrollment Year</th>
                            <th>Year Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.student_id}>
                                <td>{s.student_id}</td>
                                <td>{s.first_name} {s.last_name}</td>
                                <td>{s.department_name}</td>
                                <td>{s.enrollment_year || 'N/A'}</td>
                                <td>{s.year_level || 'N/A'}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => { 
                                        // Map department_name to department_id for the form
                                        setEditingStudent({ 
                                            student_id: s.student_id,
                                            first_name: s.first_name,
                                            last_name: s.last_name,
                                            department_id: s.department_id || '',
                                            enrollment_year: s.enrollment_year || '',
                                            year_level: s.year_level || ''
                                        }); 
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
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><i className="fas fa-user-graduate"></i> Edit Student Details</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="edit-form">
                            <div className="edit-form-grid">
                                <div className="form-group">
                                    <label htmlFor="edit-student-id">Student ID *</label>
                                    <input 
                                        id="edit-student-id"
                                        type="text" 
                                        value={editingStudent.student_id} 
                                        onChange={(e) => setEditingStudent({...editingStudent, student_id: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-student-dept">Department *</label>
                                    <select 
                                        id="edit-student-dept"
                                        value={editingStudent.department_id || ''} 
                                        onChange={(e) => setEditingStudent({...editingStudent, department_id: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.department_id} value={d.department_id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-student-fname">First Name *</label>
                                    <input 
                                        id="edit-student-fname"
                                        type="text" 
                                        value={editingStudent.first_name} 
                                        onChange={(e) => setEditingStudent({...editingStudent, first_name: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-student-lname">Last Name *</label>
                                    <input 
                                        id="edit-student-lname"
                                        type="text" 
                                        value={editingStudent.last_name} 
                                        onChange={(e) => setEditingStudent({...editingStudent, last_name: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-student-year">Enrollment Year *</label>
                                    <input 
                                        id="edit-student-year"
                                        type="number" 
                                        value={editingStudent.enrollment_year} 
                                        onChange={(e) => setEditingStudent({...editingStudent, enrollment_year: e.target.value})} 
                                        required 
                                        min="2000"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-student-year-level">Year Level *</label>
                                    <select
                                        id="edit-student-year-level"
                                        value={editingStudent.year_level || ''}
                                        onChange={(e) => setEditingStudent({...editingStudent, year_level: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Year Level</option>
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                        <option value="4">Year 4</option>
                                        <option value="5">Year 5</option>
                                    </select>
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