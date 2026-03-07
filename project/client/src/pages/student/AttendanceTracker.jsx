import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BookCheck, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AttendanceTracker() {
    const [record, setRecord] = useState(null);
    const [semester, setSemester] = useState('1');
    const [academicYear, setAcademicYear] = useState('2024-25');
    const [showForm, setShowForm] = useState(false);
    const [subForm, setSubForm] = useState({ name: '', code: '', totalClasses: '', attendedClasses: '', minRequired: '75' });
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        setLoading(true);
        const { data } = await api.get(`/attendance?semester=${semester}&academicYear=${academicYear}`);
        setRecord(data.record); setLoading(false);
    };

    useEffect(() => { fetch(); }, [semester, academicYear]);

    const saveSubject = async () => {
        await api.post('/attendance/subject', { semester, academicYear, ...subForm, totalClasses: +subForm.totalClasses, attendedClasses: +subForm.attendedClasses, minRequired: +subForm.minRequired });
        setSubForm({ name: '', code: '', totalClasses: '', attendedClasses: '', minRequired: '75' });
        setShowForm(false); fetch();
    };

    const deleteSubject = async (code) => {
        await api.delete('/attendance/subject', { data: { semester, academicYear, subjectCode: code } });
        fetch();
    };

    return (
        <div style={{ padding: 32, maxWidth: 900 }} className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BookCheck size={22} color="#6366f1" /> Attendance Tracker
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Know how many classes you can safely miss</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(p => !p)}><Plus size={14} /> Add Subject</button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <select className="input" value={semester} onChange={e => setSemester(e.target.value)} style={{ width: 160 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
                <input className="input" style={{ width: 140 }} value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="2024-25" />
            </div>

            {showForm && (
                <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Add / Update Subject</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'flex-end' }}>
                        {[['name', 'Subject Name', 'text', 'Mathematics'], ['code', 'Code', 'text', 'MA201'], ['totalClasses', 'Total Classes', 'number', '40'], ['attendedClasses', 'Attended', 'number', '35'], ['minRequired', 'Min %', 'number', '75']].map(([k, lbl, t, ph]) => (
                            <div key={k}>
                                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>{lbl}</label>
                                <input className="input" type={t} placeholder={ph} value={subForm[k]} onChange={e => setSubForm(p => ({ ...p, [k]: e.target.value }))} style={{ fontSize: 13 }} />
                            </div>
                        ))}
                    </div>
                    <button className="btn-primary" onClick={saveSubject} style={{ marginTop: 14 }}>Save Subject</button>
                </div>
            )}

            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {(record?.subjects || []).length === 0 ? (
                        <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <BookCheck size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                            <p>No subjects added yet. Add your first subject above.</p>
                        </div>
                    ) : (record?.subjects || []).map((s, i) => (
                        <div key={i} className="glass hover-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div>
                                    <h4 style={{ fontWeight: 700, marginBottom: 2 }}>{s.name} <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 400 }}>({s.code})</span></h4>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.attendedClasses} / {s.totalClasses} classes attended</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className={`badge ${s.status === 'safe' ? 'badge-success' : 'badge-danger'}`}>
                                        {s.status === 'safe' ? <CheckCircle size={10} /> : <AlertCircle size={10} />} {s.percentage}%
                                    </span>
                                    <button onClick={() => deleteSubject(s.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="progress-bar" style={{ marginBottom: 10 }}>
                                <div className={`progress-fill ${s.status === 'safe' ? 'safe' : 'danger'}`} style={{ width: `${Math.min(s.percentage, 100)}%` }} />
                            </div>
                            <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
                                <span style={{ color: s.safeLeaves > 0 ? '#10b981' : 'var(--text-muted)' }}>✅ Safe leaves: <strong>{s.safeLeaves}</strong></span>
                                {s.classesNeeded > 0 && <span style={{ color: '#ef4444' }}>⚠️ Need {s.classesNeeded} consecutive classes to recover</span>}
                                <span style={{ color: 'var(--text-muted)' }}>Min required: {s.minRequired}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
