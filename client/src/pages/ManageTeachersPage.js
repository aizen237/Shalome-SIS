// client/src/pages/ManageTeachersPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const ManageTeachersPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState({ 
        teacher_id: '', first_name: '', last_name: '', 
        email: '', phone_number: '', hire_date: '', course_ids: [] 
    });
    const [originalId, setOriginalId] = useState(''); // Keep track of ID if it changes

    useEffect(() => { 
        fetchTeachers(); 
        fetchCourses();
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

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/courses');
            setCourses(res.data);
        } catch (err) { console.log("Error fetching courses"); }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/teachers/${encodeURIComponent(id)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTeachers(teachers.filter(t => t.teacher_id !== id));
            alert("Teacher deleted successfully!");
        } catch (err) { 
            alert(err.response?.data?.message || "Delete failed."); 
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                teacher_id: editingTeacher.teacher_id,
                first_name: editingTeacher.first_name,
                last_name: editingTeacher.last_name,
                email: editingTeacher.email,
                phone_number: editingTeacher.phone_number,
                hire_date: editingTeacher.hire_date || null,
                course_ids: editingTeacher.course_ids || []
            };
            await axios.put(`http://localhost:5000/api/admin/teachers/${encodeURIComponent(originalId)}`, updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchTeachers(); // Refresh list to get new Dept names
            setIsModalOpen(false);
            alert("Teacher updated successfully!");
        } catch (err) { 
            alert(err.response?.data?.message || "Update failed. The ID might already exist."); 
        }
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
                            <th>Email</th>
                            <th>Courses</th>
                            <th>Hiring Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((t) => (
                            <tr key={t.teacher_id}>
                                <td>{t.teacher_id}</td>
                                <td>{t.first_name} {t.last_name}</td>
                                <td>{t.email}</td>
                                <td>
                                    {t.courses && Array.isArray(t.courses) && t.courses.length > 0
                                        ? t.courses.map(c => c.course_name).join(', ')
                                        : 'No courses assigned'}
                                </td>
                                <td>{t.hire_date ? new Date(t.hire_date).toISOString().split('T')[0] : 'N/A'}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => { 
                                        // Map department_name to department_id for the form
                                        setEditingTeacher({ 
                                            teacher_id: t.teacher_id,
                                            first_name: t.first_name,
                                            last_name: t.last_name,
                                            email: t.email || '',
                                            phone_number: t.phone_number || '',
                                            hire_date: t.hire_date ? new Date(t.hire_date).toISOString().split('T')[0] : '',
                                            course_ids: t.courses && Array.isArray(t.courses) 
                                                ? t.courses.map(c => c.course_id) 
                                                : []
                                        }); 
                                        setOriginalId(t.teacher_id);
                                        setIsModalOpen(true); 
                                    }}><i className="fas fa-edit"></i></button>
                                    <button className="btn-delete" onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this teacher?")) {
                                            handleDelete(t.teacher_id);
                                        }
                                    }}><i className="fas fa-trash"></i></button>
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
                            <h3><i className="fas fa-chalkboard-teacher"></i> Edit Teacher Details</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="edit-form">
                            <div className="edit-form-grid">
                                <div className="form-group">
                                    <label htmlFor="edit-teacher-id">Teacher ID *</label>
                                    <input 
                                        id="edit-teacher-id"
                                        type="text" 
                                        value={editingTeacher.teacher_id} 
                                        onChange={(e) => setEditingTeacher({...editingTeacher, teacher_id: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="edit-teacher-courses">Assigned Courses</label>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
                                        {courses.map(course => (
                                            <label key={course.course_id} style={{ display: 'block', marginBottom: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={editingTeacher.course_ids.includes(course.course_id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setEditingTeacher({
                                                                ...editingTeacher,
                                                                course_ids: [...editingTeacher.course_ids, course.course_id]
                                                            });
                                                        } else {
                                                            setEditingTeacher({
                                                                ...editingTeacher,
                                                                course_ids: editingTeacher.course_ids.filter(id => id !== course.course_id)
                                                            });
                                                        }
                                                    }}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                {course.course_id} - {course.course_name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-teacher-fname">First Name *</label>
                                    <input 
                                        id="edit-teacher-fname"
                                        type="text" 
                                        value={editingTeacher.first_name} 
                                        onChange={(e) => setEditingTeacher({...editingTeacher, first_name: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-teacher-lname">Last Name *</label>
                                    <input 
                                        id="edit-teacher-lname"
                                        type="text" 
                                        value={editingTeacher.last_name} 
                                        onChange={(e) => setEditingTeacher({...editingTeacher, last_name: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="edit-teacher-email">Email Address *</label>
                                    <input 
                                        id="edit-teacher-email"
                                        type="email" 
                                        value={editingTeacher.email} 
                                        onChange={(e) => setEditingTeacher({...editingTeacher, email: e.target.value})} 
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="edit-teacher-phone">Phone Number</label>
                                    <input 
                                        id="edit-teacher-phone"
                                        type="text" 
                                        value={editingTeacher.phone_number || ''} 
                                        onChange={(e) => setEditingTeacher({...editingTeacher, phone_number: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-teacher-hire-date">Hiring Date</label>
                                    <input 
                                        id="edit-teacher-hire-date"
                                        type="date" 
                                        value={editingTeacher.hire_date || ''} 
                                        onChange={(e) => setEditingTeacher({...editingTeacher, hire_date: e.target.value})} 
                                    />
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