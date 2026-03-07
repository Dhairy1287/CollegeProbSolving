import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, BookOpen, FileSearch } from 'lucide-react';

const features = [
    { path: 'reports', label: 'Incident Reports', desc: 'View ragging & conflict reports from students', icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { path: 'assignments', label: 'Assignment Evaluator', desc: 'Rate submissions with 0.5-star increments & feedback', icon: BookOpen, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { path: 'plagiarism', label: 'Plagiarism Detector', desc: 'Detect similarity across student submissions', icon: FileSearch, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
];

export default function FacultyHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div style={{ padding: '32px 0', maxWidth: 900, margin: '0 auto' }} className="fade-in">
            <div className="glass" style={{ padding: '32px 36px', marginBottom: 32, background: 'linear-gradient(135deg, rgba(15,52,96,0.5), rgba(83,52,131,0.3))', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(83,52,131,0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />

                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
                        {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 🎓
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{user?.college} • {user?.department} • Faculty</p>
                </div>

                <div className="glass-sm" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(255,255,255,0.15)', minWidth: 280 }}>
                    <div style={{ position: 'relative' }}>
                        {user?.avatar ? (
                            <img src={user.avatar.startsWith('http') ? user.avatar : user.avatar.startsWith('/uploads') ? `http://localhost:5000${user.avatar}` : user.avatar} alt="Profile" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }} />
                        ) : (
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white' }}>
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: '#10b981', borderRadius: '50%', border: '2px solid white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: 'white' }}>{user?.name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, lineHeight: 1.4, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {user?.bio || 'No bio yet. Update your profile to add one!'}
                        </div>
                    </div>
                </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Faculty Tools</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {features.map(({ path, label, desc, icon: Icon, color, bg }) => (
                    <div key={path} className="glass hover-card" style={{ padding: 28, cursor: 'pointer' }} onClick={() => navigate(`/faculty/${path}`)}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                            <Icon size={24} color={color} />
                        </div>
                        <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>{label}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
