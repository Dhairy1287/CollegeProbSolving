import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BookOpen, Upload, CheckCircle, Clock, FileText, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentAssignments() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState({});
    const [files, setFiles] = useState({});
    const [comments, setComments] = useState({});

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/assignments');
            setAssignments(data.assignments);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchAssignments(); }, []);

    const handleSubmit = async (e, assignmentId) => {
        e.preventDefault();
        const assignment = assignments.find(a => a._id === assignmentId);

        if (assignment.requirePdf && !files[assignmentId]) {
            alert("This assignment requires a PDF upload.");
            return;
        }

        setSubmitting(p => ({ ...p, [assignmentId]: true }));
        const formData = new FormData();
        if (files[assignmentId]) formData.append('file', files[assignmentId]);
        formData.append('content', comments[assignmentId] || '');

        try {
            await api.post(`/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Assignment submitted successfully!");
            fetchAssignments();
        } catch (err) {
            alert(err.response?.data?.message || "Submission failed");
        }
        setSubmitting(p => ({ ...p, [assignmentId]: false }));
    };

    const isSubmitted = (assignment) => {
        return assignment.submissions.some(s => s.student._id === user._id || s.student === user._id);
    };

    const getSubmission = (assignment) => {
        return assignment.submissions.find(s => s.student._id === user._id || s.student === user._id);
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading assignments...</div>;

    return (
        <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }} className="fade-in">
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <BookOpen size={24} color="#6366f1" /> My Assignments
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Manage and submit your academic assignments.</p>
            </div>

            {assignments.length === 0 ? (
                <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <BookOpen size={30} color="#6366f1" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Assignments Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't been assigned anything yet. Check back later!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                    {assignments.map(a => {
                        const submitted = isSubmitted(a);
                        const sub = getSubmission(a);
                        const isPastDue = new Date(a.dueDate) < new Date();

                        return (
                            <div key={a._id} className="glass" style={{ padding: 24, borderLeft: submitted ? '4px solid #10b981' : isPastDue ? '4px solid #ef4444' : '4px solid #6366f1' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: 11 }}>{a.subject}</span>
                                            {submitted && <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={10} /> Submitted</span>}
                                            {isPastDue && !submitted && <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Past Due</span>}
                                        </div>
                                        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>{a.title}</h3>
                                        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{a.description || 'No description provided.'}</p>

                                        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Due: {new Date(a.dueDate).toLocaleString()}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14} /> {a.maxMarks} Marks</div>
                                            {a.requirePdf && <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 600 }}><AlertCircle size={14} /> PDF Required</div>}
                                        </div>

                                        {submitted && sub.feedback && (
                                            <div style={{ marginTop: 20, padding: 16, background: 'rgba(16,185,129,0.05)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.1)' }}>
                                                <div style={{ fontWeight: 700, fontSize: 12, color: '#047857', marginBottom: 4 }}>Faculty Feedback</div>
                                                <p style={{ fontSize: 13, color: '#065f46' }}>{sub.feedback}</p>
                                                {sub.rating && <div style={{ marginTop: 8, fontWeight: 800, color: '#f59e0b' }}>⭐ {sub.rating} / 5 Rating</div>}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
                                        {submitted ? (
                                            <div>
                                                <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>My Submission</h4>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                                                    Submitted on: {new Date(sub.submittedAt).toLocaleString()}
                                                </div>
                                                {sub.fileName && (
                                                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', fontSize: 12, fontWeight: 600, border: '1px solid var(--border)' }}>
                                                        <FileText size={14} color="#ef4444" /> {sub.fileName}
                                                    </a>
                                                )}
                                                {sub.internalMarks !== undefined && (
                                                    <div style={{ marginTop: 16, textAlign: 'center', padding: 12, background: 'rgba(16,185,129,0.1)', borderRadius: 12 }}>
                                                        <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>{sub.internalMarks} <span style={{ fontSize: 14, color: '#6b7280' }}>/ {a.maxMarks}</span></div>
                                                        <div style={{ fontSize: 10, color: '#059669', textTransform: 'uppercase', fontWeight: 800 }}>Final Score</div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <form onSubmit={(e) => handleSubmit(e, a._id)}>
                                                <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Submit Solution</h4>
                                                <div style={{ marginBottom: 12 }}>
                                                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Comments / Notes</label>
                                                    <textarea
                                                        className="input"
                                                        rows={2}
                                                        placeholder="Add any notes for the faculty..."
                                                        value={comments[a._id] || ''}
                                                        onChange={e => setComments(p => ({ ...p, [a._id]: e.target.value }))}
                                                        style={{ resize: 'none', fontSize: 12 }}
                                                    />
                                                </div>
                                                <div style={{ marginBottom: 16 }}>
                                                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Upload PDF {a.requirePdf && <span style={{ color: '#ef4444' }}>*</span>}</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={e => setFiles(p => ({ ...p, [a._id]: e.target.files[0] }))}
                                                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                                        />
                                                        <div style={{ padding: '8px 12px', border: '1px dashed var(--border)', borderRadius: 8, textAlign: 'center', fontSize: 12, color: files[a._id] ? 'var(--text)' : 'var(--text-muted)', background: files[a._id] ? 'rgba(99,102,241,0.05)' : 'none' }}>
                                                            {files[a._id] ? files[a._id].name : 'Choose PDF file'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn-primary"
                                                    disabled={submitting[a._id] || isPastDue}
                                                    style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                                                >
                                                    {submitting[a._id] ? 'Submitting...' : <><Upload size={14} /> Submit Now</>}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
