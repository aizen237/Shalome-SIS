import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const ManageCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({
        course_id: '',
        course_name: '',
        department_id: '',
        teacher_id: '',
        credits: 3,
        semester: '',
        description: ''
    });
    const [curriculum, setCurriculum] = useState({
        department_id: '',
        course_id: '',
        year_level: '',
        semester: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCourses(res.data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error('Error fetching courses:', err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/departments');
            setDepartments(res.data);
        } catch (err) {
            console.log("Error fetching departments");
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await axios.post('http://localhost:5000/api/admin/courses', newCourse, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Course created successfully!');
            setNewCourse({
                course_id: '',
                course_name: '',
                department_id: '',
                teacher_id: '',
                credits: 3,
                semester: '',
                description: ''
            });
            setIsCourseModalOpen(false);
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create course');
        }
    };

    const handleAssignCurriculum = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await axios.post('http://localhost:5000/api/admin/curriculum', curriculum, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Course assigned to department curriculum successfully!');
            setCurriculum({
                department_id: '',
                course_id: '',
                year_level: '',
                semester: ''
            });
            setIsCurriculumModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign course to curriculum');
        }
    };

    if (loading) return <div className="dashboard-content">Loading...</div>;

    return (
        <div className="dashboard-content">
            <div className="card-header">
                <h3><i className="fas fa-book"></i> Course Management</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-save" onClick={() => setIsCourseModalOpen(true)}>
                        <i className="fas fa-plus"></i> Add Course
                    </button>
                    <button className="btn-save" onClick={() => setIsCurriculumModalOpen(true)}>
                        <i className="fas fa-link"></i> Assign to Curriculum
                    </button>
                </div>
            </div>

            {message && <div className="success-message" style={{ margin: '20px 0' }}>{message}</div>}
            {error && <div className="error-message" style={{ margin: '20px 0' }}>{error}</div>}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Course ID</th>
                            <th>Course Name</th>
                            <th>Credits</th>
                            <th>Semester</th>
                            <th>Department</th>
                            <th>Teacher</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((c) => (
                            <tr key={c.course_id}>
                                <td>{c.course_id}</td>
                                <td>{c.course_name}</td>
                                <td>{c.credits || 'N/A'}</td>
                                <td>{c.semester || 'N/A'}</td>
                                <td>{c.department_name || 'N/A'}</td>
                                <td>{c.teacher_name || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Course Modal */}
            {isCourseModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCourseModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><i className="fas fa-book"></i> Create New Course</h3>
                            <button className="modal-close" onClick={() => setIsCourseModalOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateCourse} className="edit-form">
                            <div className="edit-form-grid">
                                <div className="form-group">
                                    <label htmlFor="course-id">Course ID *</label>
                                    <input
                                        id="course-id"
                                        type="text"
                                        value={newCourse.course_id}
                                        onChange={(e) => setNewCourse({...newCourse, course_id: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="course-name">Course Name *</label>
                                    <input
                                        id="course-name"
                                        type="text"
                                        value={newCourse.course_name}
                                        onChange={(e) => setNewCourse({...newCourse, course_name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="course-dept">Department</label>
                                    <select
                                        id="course-dept"
                                        value={newCourse.department_id || ''}
                                        onChange={(e) => setNewCourse({...newCourse, department_id: e.target.value})}
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
                                    <label htmlFor="course-credits">Credits</label>
                                    <input
                                        id="course-credits"
                                        type="number"
                                        min="1"
                                        value={newCourse.credits}
                                        onChange={(e) => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="course-semester">Semester</label>
                                    <select
                                        id="course-semester"
                                        value={newCourse.semester || ''}
                                        onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                                    >
                                        <option value="">Select Semester</option>
                                        <option value="Fall">Fall</option>
                                        <option value="Spring">Spring</option>
                                        <option value="Summer">Summer</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="course-description">Description</label>
                                    <textarea
                                        id="course-description"
                                        value={newCourse.description || ''}
                                        onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsCourseModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign to Curriculum Modal */}
            {isCurriculumModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCurriculumModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><i className="fas fa-link"></i> Assign Course to Department Curriculum</h3>
                            <button className="modal-close" onClick={() => setIsCurriculumModalOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAssignCurriculum} className="edit-form">
                            <div className="edit-form-grid">
                                <div className="form-group">
                                    <label htmlFor="curriculum-dept">Department *</label>
                                    <select
                                        id="curriculum-dept"
                                        value={curriculum.department_id || ''}
                                        onChange={(e) => setCurriculum({...curriculum, department_id: e.target.value})}
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
                                    <label htmlFor="curriculum-course">Course *</label>
                                    <select
                                        id="curriculum-course"
                                        value={curriculum.course_id || ''}
                                        onChange={(e) => setCurriculum({...curriculum, course_id: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(c => (
                                            <option key={c.course_id} value={c.course_id}>
                                                {c.course_id} - {c.course_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="curriculum-year">Year Level *</label>
                                    <select
                                        id="curriculum-year"
                                        value={curriculum.year_level || ''}
                                        onChange={(e) => setCurriculum({...curriculum, year_level: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                        <option value="4">Year 4</option>
                                        <option value="5">Year 5</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="curriculum-semester">Semester *</label>
                                    <select
                                        id="curriculum-semester"
                                        value={curriculum.semester || ''}
                                        onChange={(e) => setCurriculum({...curriculum, semester: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Semester</option>
                                        <option value="Fall">Fall</option>
                                        <option value="Spring">Spring</option>
                                        <option value="Summer">Summer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsCurriculumModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Assign Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCoursesPage;

