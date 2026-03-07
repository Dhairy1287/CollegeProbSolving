import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { AlertTriangle, MapPin, Clock, Eye, CheckCircle } from 'lucide-react';

const severityColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' };
const statusBadge = { pending: 'badge-warning', under_review: 'badge-primary', resolved: 'badge-success', dismissed: '' };

export default function ReportsView() {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState({ type: '', status: '', severity: '' });
    const [selected, setSelected] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [newStatus, setNewStatus] = useState('under_review');
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        const params = new URLSearchParams(Object.fromEntries(Object.entries(filter).filter(([, v]) => v))).toString();
        const { data } = await api.get(`/reports?${params}`);
        setReports(data.reports);
    };
    useEffect(() => { fetch(); }, [filter]);

    const updateStatus = async () => {
        setLoading(true);
        await api.patch(`/reports/${selected._id}/status`, { status: newStatus, adminNotes });
        setSelected(null); setAdminNotes(''); setLoading(false); fetch();
    };

    return (
        <div style={{ padding: 32, maxWidth: 1000 }} className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <AlertTriangle size={22} color="#ef4444" /> Incident Reports
            </h2>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {[['type', ['', 'ragging', 'conflict']], ['status', ['', 'pending', 'under_review', 'resolved', 'dismissed']], ['severity', ['', 'low', 'medium', 'high', 'critical']]].map(([key, opts]) => (
                    <select key={key} className="input" style={{ width: 160, fontSize: 13 }} value={filter[key]} onChange={e => setFilter(p => ({ ...p, [key]: e.target.value }))}>
                        {opts.map(o => <option key={o} value={o}>{o || `All ${key}s`}</option>)}
                    </select>
                ))}
                <button className="btn-secondary" onClick={fetch} style={{ padding: '9px 16px', fontSize: 12 }}>Refresh</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
                {/* Reports list */}
                <div>
                    {reports.length === 0 ? (
                        <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No reports match current filters.</div>
                    ) : reports.map(r => (
                        <div key={r._id} className={`glass hover-card`} style={{ padding: 18, marginBottom: 12, cursor: 'pointer', border: selected?._id === r._id ? '1px solid var(--primary)' : '1px solid var(--border)' }} onClick={() => { setSelected(r); setAdminNotes(r.adminNotes || ''); setNewStatus(r.status); }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div>
                                    <h4 style={{ fontWeight: 700, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {r.type === 'ragging' ? '🚨' : '⚠️'} {r.type} Report
                                        <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, background: `${severityColor[r.severity]}20`, color: severityColor[r.severity] }}>{r.severity}</span>
                                    </h4>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                        <Clock size={11} /> {new Date(r.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <span className={`badge ${statusBadge[r.status]}`} style={{ flexShrink: 0 }}>{r.status.replace('_', ' ')}</span>
                            </div>
                            {r.location?.address && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                    <MapPin size={11} /> {r.location.address}
                                </div>
                            )}
                            {r.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.description.slice(0, 120)}{r.description.length > 120 ? '...' : ''}</p>}
                        </div>
                    ))}
                </div>

                {/* Detail pane */}
                {selected && (
                    <div className="glass" style={{ padding: 24, alignSelf: 'start', position: 'sticky', top: 20 }}>
                        <h4 style={{ fontWeight: 700, marginBottom: 16, textTransform: 'capitalize' }}>{selected.type} Report Details</h4>
                        {selected.mediaFiles?.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Evidence</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {selected.mediaFiles.map((f, i) => (
                                        <a key={i} href={f} target="_blank" rel="noopener noreferrer" className="tag" style={{ textDecoration: 'none' }}>File {i + 1}</a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selected.location?.latitude && (
                            <div style={{ fontSize: 13, marginBottom: 12, color: 'var(--text-muted)' }}>
                                📍 {selected.location.latitude}, {selected.location.longitude}
                                {selected.location.address && ` • ${selected.location.address}`}
                            </div>
                        )}
                        {selected.description && <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{selected.description}</p>}
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Update Status</label>
                            <select className="input" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ fontSize: 13, marginBottom: 10 }}>
                                {['pending', 'under_review', 'resolved', 'dismissed'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                            <textarea className="input" rows={3} placeholder="Admin notes..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} style={{ resize: 'none' }} />
                        </div>
                        <button className="btn-primary" onClick={updateStatus} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                            <CheckCircle size={14} /> Update Report
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
