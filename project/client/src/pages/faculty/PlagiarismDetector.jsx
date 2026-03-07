import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileSearch, Upload, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';

export default function PlagiarismDetector() {
    const [assignments, setAssignments] = useState([]);
    const [selected, setSelected] = useState(null);
    const [results, setResults] = useState([]);
    const [checking, setChecking] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ title: '', subject: '', batch: '', dueDate: '', maxMarks: '10', description: '', requirePdf: false });

    const fetchAssignments = async () => {
        const { data } = await api.get('/assignments');
        setAssignments(data.assignments);
    };
    useEffect(() => { fetchAssignments(); }, []);

    const create = async () => {
        try {
            await api.post('/assignments', form);
            setShowCreate(false); fetchAssignments();
            alert("Assignment created successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create assignment");
        }
    };

    const checkPlagiarism = async () => {
        if (!selected) return;
        setChecking(true);
        try {
            const { data } = await api.post(`/assignments/${selected}/plagiarism`);
            setResults(data.results || []);
        } catch (err) {
            console.error(err);
        }
        setChecking(false);
    };

    const plagColor = (score) => score > 70 ? '#ef4444' : score > 40 ? '#f59e0b' : '#10b981';

    return (
        <div style={{ padding: 32, maxWidth: 900 }} className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileSearch size={22} color="#06b6d4" /> Plagiarism Detector
                </h2>
                <button className="btn-primary" onClick={() => setShowCreate(p => !p)}>
                    {showCreate ? 'Cancel' : '+ New Assignment'}
                </button>
            </div>

            {showCreate && (
                <div className="glass" style={{ padding: 24, marginBottom: 24, border: '1px solid var(--primary-light)' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 18 }}>Create New Assignment</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        {[['title', 'Title'], ['subject', 'Subject'], ['batch', 'Batch Year']].map(([k, l]) => (
                            <div key={k} style={{ gridColumn: k === 'title' ? '1 / span 2' : 'auto' }}>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{l}</label>
                                <input className="input" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={`Enter ${l.toLowerCase()}...`} />
                            </div>
                        ))}
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Due Date</label>
                            <input className="input" type="datetime-local" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Max Marks</label>
                            <input className="input" type="number" value={form.maxMarks} onChange={e => setForm(p => ({ ...p, maxMarks: e.target.value }))} />
                        </div>
                        <div style={{ gridColumn: '1 / span 2' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 0' }}>
                                <input type="checkbox" checked={form.requirePdf} onChange={e => setForm(p => ({ ...p, requirePdf: e.target.checked }))} style={{ width: 18, height: 18 }} />
                                <span style={{ fontSize: 14, fontWeight: 600 }}>Require PDF Upload (Mandatory for students)</span>
                            </label>
                        </div>
                        <div style={{ gridColumn: '1 / span 2', marginTop: 10 }}>
                            <button className="btn-primary" onClick={create} style={{ width: '100%', height: 45, fontSize: 15 }}>Create Assignment</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Select Assignment</label>
                    <select className="input" value={selected || ''} onChange={e => { setSelected(e.target.value); setResults([]); }}>
                        <option value="">Choose an assignment...</option>
                        {assignments.map(a => <option key={a._id} value={a._id}>{a.title} ({a.subject}) – {a.submissions?.length || 0} submissions</option>)}
                    </select>
                </div>
                <button className="btn-primary" onClick={checkPlagiarism} disabled={!selected || checking} style={{ padding: '12px 20px' }}>
                    <FileSearch size={14} /> {checking ? 'Analyzing...' : 'Run Plagiarism Check'}
                </button>
            </div>

            {results.length > 0 && (
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Results</h4>
                    {results.map((r, i) => (
                        <div key={i} className="glass" style={{ padding: 18, marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{r.student?.name || r.student?.rollNumber || 'Student'}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {r.plagiarismScore > 0 ? (
                                        <span style={{ fontWeight: 800, fontSize: 16, color: plagColor(r.plagiarismScore) }}>
                                            {r.plagiarismScore.toFixed(1)}% similarity
                                        </span>
                                    ) : (
                                        <span className="badge badge-success"><CheckCircle size={10} /> Original</span>
                                    )}
                                </div>
                            </div>
                            <div className="progress-bar" style={{ marginBottom: 10 }}>
                                <div style={{ height: '100%', borderRadius: 100, width: `${r.plagiarismScore}%`, background: `linear-gradient(90deg, ${plagColor(r.plagiarismScore)}, ${plagColor(r.plagiarismScore)}88)`, transition: 'width 0.6s ease' }} />
                            </div>
                            {r.matches?.length > 0 && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    Similar to: {r.matches.map(m => `${m.matchedWith?.name || 'Unknown'} (${m.similarity}%)`).join(', ')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
