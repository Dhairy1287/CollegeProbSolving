import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Hash, Building, BookOpen, Phone, FileText, Edit3, Save, X } from 'lucide-react';
import api from '../../utils/api';

export default function FacultyProfile() {
    const { user, setUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        department: user?.department || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
    });
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        setLoading(true); setError(''); setSuccess('');
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('department', form.department);
            fd.append('phone', form.phone);
            fd.append('bio', form.bio);
            if (avatarFile) fd.append('avatar', avatarFile);

            const { data } = await api.put('/auth/profile', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (setUser) setUser(data.user);
            localStorage.setItem('scc_user', JSON.stringify(data.user));
            setSuccess('Profile updated successfully!');
            setEditing(false);
            setAvatarFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally { setLoading(false); }
    };

    const Field = ({ icon: Icon, label, value }) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(13,148,136,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="var(--secondary)" />
            </div>
            <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value || '—'}</div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: 32, maxWidth: 700 }} className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28 }}>Faculty Profile</h2>

            {success && <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: 'var(--primary)', fontSize: 13 }}>{success}</div>}
            {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                <div className="glass" style={{ padding: 24, textAlign: 'center', alignSelf: 'start' }}>
                    <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 16px' }}>
                        {user?.avatar ? (
                            <img src={user.avatar.startsWith('http') ? user.avatar : (user.avatar.startsWith('/uploads') ? `http://localhost:5000${user.avatar}` : user.avatar)} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }} />
                        ) : (
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'white' }}>
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        {editing && (
                            <label style={{ position: 'absolute', bottom: -5, right: -5, width: 28, height: 28, background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white', color: 'white' }}>
                                <Edit3 size={14} />
                                <input type="file" hidden accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} />
                            </label>
                        )}
                    </div>
                    {avatarFile && <div style={{ fontSize: 10, color: '#10b981', marginBottom: 10 }}>New photo selected: {avatarFile.name}</div>}
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, textTransform: 'capitalize' }}>{user?.role}</div>
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>{user?.department}</div>
                </div>

                <div className="glass" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 15 }}>Account Details</h3>
                        {!editing ? (
                            <button className="btn-secondary" onClick={() => setEditing(true)} style={{ padding: '7px 14px', fontSize: 12 }}>
                                <Edit3 size={13} /> Edit
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-primary" onClick={handleSave} disabled={loading} style={{ padding: '7px 14px', fontSize: 12 }}>
                                    <Save size={13} /> {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button className="btn-secondary" onClick={() => setEditing(false)} style={{ padding: '7px 12px', fontSize: 12 }}>
                                    <X size={13} />
                                </button>
                            </div>
                        )}
                    </div>

                    {!editing ? (
                        <>
                            <Field icon={User} label="Full Name" value={user?.name} />
                            <Field icon={Mail} label="Email" value={user?.email} />
                            <Field icon={Hash} label="Employee ID" value={user?.employeeId} />
                            <Field icon={Building} label="College" value={user?.college} />
                            <Field icon={BookOpen} label="Department" value={user?.department} />
                            <Field icon={Phone} label="Phone" value={user?.phone} />
                            <Field icon={FileText} label="Bio" value={user?.bio} />
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                            {[
                                { key: 'name', label: 'Full Name', type: 'text' },
                                { key: 'department', label: 'Department', type: 'text' },
                                { key: 'phone', label: 'Phone', type: 'tel' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
                                    <input className="input" type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
                                </div>
                            ))}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Bio / About</label>
                                <textarea className="input" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Your research interests, specialization..." style={{ resize: 'vertical' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
