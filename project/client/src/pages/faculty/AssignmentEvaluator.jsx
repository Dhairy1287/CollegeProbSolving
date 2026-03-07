import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BookOpen, Star, Send, ChevronDown } from 'lucide-react';

function StarRating({ value, onChange }) {
    const [hover, setHover] = useState(0);
    const stars = [];
    for (let i = 0.5; i <= 5; i += 0.5) stars.push(i);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(full => {
                const halfVal = full - 0.5;
                const filled = value >= full ? 'full' : value >= halfVal ? 'half' : 'empty';
                return (
                    <div key={full} style={{ position: 'relative', width: 28, height: 28, cursor: 'pointer' }}>
                        {/* Half star left */}
                        <div style={{ position: 'absolute', left: 0, width: '50%', height: '100%', overflow: 'hidden', zIndex: 1 }}
                            onMouseEnter={() => setHover(halfVal)} onMouseLeave={() => setHover(0)} onClick={() => onChange(halfVal)}>
                            <Star size={28} fill={hover >= halfVal || value >= halfVal ? '#f59e0b' : 'none'} color={hover >= halfVal || value >= halfVal ? '#f59e0b' : '#374151'} />
                        </div>
                        {/* Full star right */}
                        <div style={{ position: 'absolute', right: 0, width: '50%', height: '100%', overflow: 'hidden', zIndex: 1 }}
                            onMouseEnter={() => setHover(full)} onMouseLeave={() => setHover(0)} onClick={() => onChange(full)}>
                            <div style={{ position: 'absolute', right: 0, width: 28 }}>
                                <Star size={28} fill={hover >= full || value >= full ? '#f59e0b' : 'none'} color={hover >= full || value >= full ? '#f59e0b' : '#374151'} />
                            </div>
                        </div>
                    </div>
                );
            })}
            <span style={{ marginLeft: 8, fontWeight: 700, color: '#f59e0b', fontSize: 16 }}>{value || 0}</span>
        </div>
    );
}

export default function AssignmentEvaluator() {
    const [assignments, setAssignments] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [ratings, setRatings] = useState({});
    const [feedbacks, setFeedbacks] = useState({});
    const [saving, setSaving] = useState({});
    const [loadingPlagiarism, setLoadingPlagiarism] = useState(false);

    const fetch = async () => {
        const { data } = await api.get('/assignments');
        setAssignments(data.assignments);
        if (selected) {
            const updated = data.assignments.find(a => a._id === selected);
            setSelectedAssignment(updated);
        }
    };
    useEffect(() => { fetch(); }, []);

    const loadSubmissions = async (assignmentId) => {
        setSelected(assignmentId);
        const found = assignments.find(a => a._id === assignmentId);
        setSelectedAssignment(found);
        const r = {}, f = {};
        found?.submissions?.forEach(s => { r[s._id] = s.rating || 0; f[s._id] = s.feedback || ''; });
        setRatings(r); setFeedbacks(f);
    };

    const rateSubmission = async (subId) => {
        setSaving(p => ({ ...p, [subId]: true }));
        await api.patch(`/assignments/${selected}/submissions/${subId}/rate`, { rating: ratings[subId], feedback: feedbacks[subId] });
        setSaving(p => ({ ...p, [subId]: false })); fetch();
    };

    const runPlagiarismCheck = async () => {
        if (!selected) return;
        setLoadingPlagiarism(true);
        try {
            await api.post(`/assignments/${selected}/plagiarism`);
            await fetch();
            alert("Plagiarism scan completed. Results updated below.");
        } catch (err) {
            console.error(err);
            alert("Failed to run plagiarism check.");
        }
        setLoadingPlagiarism(false);
    };

    const maxMarks = selectedAssignment?.maxMarks || 10;

    return (
        <div style={{ padding: 32, maxWidth: 900 }} className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <BookOpen size={22} color="#6366f1" /> Assignment Evaluator
            </h2>

            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-end', gap: 15 }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Select Assignment to Evaluate</label>
                    <select className="input" style={{ width: '100%' }} value={selected || ''} onChange={e => loadSubmissions(e.target.value)}>
                        <option value="">Choose an assignment...</option>
                        {assignments.map(a => <option key={a._id} value={a._id}>{a.title} ({a.subject}) – {a.submissions?.length} submissions</option>)}
                    </select>
                </div>
                {selected && (
                    <button
                        className="btn-secondary"
                        onClick={runPlagiarismCheck}
                        disabled={loadingPlagiarism}
                        style={{ padding: '10px 20px', fontSize: 13, background: '#fef2f2', color: '#dc2626', borderColor: '#fee2e2' }}
                    >
                        {loadingPlagiarism ? 'Scanning...' : '🔥 Check Plagiarism'}
                    </button>
                )}
            </div>

            {selectedAssignment && (
                <div>
                    <div className="glass-sm" style={{ padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center' }}>
                        <span style={{ fontSize: 13 }}><strong>{selectedAssignment.title}</strong></span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Max marks: <strong style={{ color: 'var(--text)' }}>{maxMarks}</strong></span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Due: <strong style={{ color: 'var(--text)' }}>{new Date(selectedAssignment.dueDate).toLocaleDateString()}</strong></span>
                    </div>

                    {selectedAssignment.submissions?.length === 0 ? (
                        <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No submissions yet.</div>
                    ) : selectedAssignment.submissions?.map(sub => (
                        <div key={sub._id} className="glass" style={{ padding: 22, marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div>
                                    <h4 style={{ fontWeight: 700 }}>{sub.student?.name || 'Student'}</h4>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                        Submitted: {new Date(sub.submittedAt).toLocaleString()}
                                        {sub.plagiarismScore > 0 && <span style={{ marginLeft: 10, color: sub.plagiarismScore > 50 ? '#ef4444' : '#f59e0b' }}>⚠️ {sub.plagiarismScore}% similarity</span>}
                                    </div>
                                </div>
                                {sub.internalMarks > 0 && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{sub.internalMarks}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ {maxMarks} marks</div>
                                    </div>
                                )}
                            </div>

                            {sub.content && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14, background: 'rgba(99,102,241,0.05)', borderRadius: 8, padding: '10px 14px' }}>{sub.content.slice(0, 300)}{sub.content.length > 300 ? '...' : ''}</p>}
                            {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="tag" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: 14 }}>📎 {sub.fileName}</a>}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Star Rating (0.5 increments → = {((ratings[sub._id] || 0) / 5 * maxMarks).toFixed(1)} / {maxMarks} marks)</label>
                                    <StarRating value={ratings[sub._id] || 0} onChange={val => setRatings(p => ({ ...p, [sub._id]: val }))} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Feedback & Suggestions</label>
                                    <textarea className="input" rows={2} placeholder="Write feedback for the student..." value={feedbacks[sub._id] || ''}
                                        onChange={e => setFeedbacks(p => ({ ...p, [sub._id]: e.target.value }))} style={{ resize: 'none' }} />
                                </div>
                                <button className="btn-primary" onClick={() => rateSubmission(sub._id)} disabled={saving[sub._id]} style={{ alignSelf: 'flex-start', padding: '8px 18px', fontSize: 13 }}>
                                    <Send size={12} /> {saving[sub._id] ? 'Saving...' : 'Save Rating'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
