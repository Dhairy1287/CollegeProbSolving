import { useState } from 'react';
import api from '../../utils/api';
import { AlertTriangle, Swords, MapPin, Upload, Send, Shield, ToggleLeft, ToggleRight } from 'lucide-react';

export default function RaggingReport() {
    const [reportType, setReportType] = useState('ragging'); // 'ragging' | 'conflict'
    const [form, setForm] = useState({ description: '', severity: 'medium', latitude: '', longitude: '', address: '' });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const getLocation = () => {
        navigator.geolocation?.getCurrentPosition(pos => {
            setForm(p => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
        }, () => setError('Could not get location. Please enter manually.'));
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true); setSuccess(''); setError('');
        const fd = new FormData();
        fd.append('type', reportType);
        Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
        files.forEach(f => fd.append('media', f));
        try {
            const { data } = await api.post('/reports', fd);
            setSuccess(`${reportType === 'ragging' ? 'Ragging' : 'Conflict'} report submitted anonymously. ID: ${data.reportId}`);
            setForm({ description: '', severity: 'medium', latitude: '', longitude: '', address: '' });
            setFiles([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed');
        } finally { setLoading(false); }
    };

    const isRagging = reportType === 'ragging';
    const color = isRagging ? '#dc2626' : '#d97706';
    const Icon = isRagging ? AlertTriangle : Swords;

    return (
        <div style={{ padding: 32, maxWidth: 700 }} className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={color} />
                </div>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Incident Report</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Your identity is fully encrypted and protected</p>
                </div>
            </div>

            {/* Type Toggle */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                {[
                    { key: 'ragging', label: '🚨 Ragging Report', desc: 'Physical/mental harassment' },
                    { key: 'conflict', label: '⚠️ Conflict Report', desc: 'Disputes between students' },
                ].map(t => (
                    <div key={t.key} onClick={() => setReportType(t.key)}
                        style={{
                            flex: 1, padding: '14px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                            background: reportType === t.key ? (t.key === 'ragging' ? 'rgba(220,38,38,0.07)' : 'rgba(217,119,6,0.07)') : 'var(--surface2)',
                            border: `2px solid ${reportType === t.key ? (t.key === 'ragging' ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.3)') : 'var(--border)'}`,
                        }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: reportType === t.key ? (t.key === 'ragging' ? '#dc2626' : '#d97706') : 'var(--text)' }}>{t.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.desc}</div>
                    </div>
                ))}
            </div>

            {/* Privacy banner */}
            <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={16} color="var(--primary)" />
                <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
                    Your identity is encrypted using HMAC-SHA256. No one — including admins — can identify you.
                </span>
            </div>

            {success && <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: 'var(--primary)', fontSize: 14 }}>{success}</div>}
            {error && <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 }}>{error}</div>}

            <form onSubmit={submit} className="glass" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-muted)' }}>Severity Level</label>
                    <select className="input" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}>
                        <option value="low">🟡 Low</option>
                        <option value="medium">🟠 Medium</option>
                        <option value="high">🔴 High</option>
                        <option value="critical">🚨 Critical</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-muted)' }}>Description (optional)</label>
                    <textarea className="input" rows={4} placeholder="Describe what happened..." value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>

                {/* Location */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Location</label>
                        <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={getLocation}>
                            <MapPin size={12} /> Auto-detect
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                        <input className="input" placeholder="Latitude" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} />
                        <input className="input" placeholder="Longitude" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} />
                    </div>
                    <input className="input" placeholder="Address / Location description" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-muted)' }}>Evidence (photos / videos)</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', border: '2px dashed var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}>
                        <Upload size={18} />
                        {files.length ? `${files.length} file(s) selected` : 'Click to upload photos or videos'}
                        <input type="file" multiple accept="image/*,video/*" hidden onChange={e => setFiles(Array.from(e.target.files))} />
                    </label>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                    <Send size={16} /> {loading ? 'Submitting...' : `Submit ${isRagging ? 'Ragging' : 'Conflict'} Report Anonymously`}
                </button>
            </form>
        </div>
    );
}
