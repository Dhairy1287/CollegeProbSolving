import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Swords, Wallet, BookCheck, Calculator, GraduationCap, Rss, ShoppingBag, Trophy, BookOpen } from 'lucide-react';

const features = [
    { path: 'assignments', label: 'My Assignments', desc: 'View and submit assignments', icon: BookOpen, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { path: 'ragging', label: 'Ragging Report', desc: 'Report anonymously & safely', icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { path: 'conflict', label: 'Conflict Report', desc: 'Report campus conflicts', icon: Swords, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { path: 'netowe', label: 'NetOwe', desc: 'Simplified group expenses', icon: Wallet, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { path: 'attendance', label: 'Attendance', desc: 'Track your class attendance', icon: BookCheck, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { path: 'spi', label: 'SPI / CGPA', desc: 'Plan your academic future', icon: Calculator, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { path: 'scholarships', label: 'Scholarships', desc: 'Find funding opportunities', icon: GraduationCap, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { path: 'feed', label: 'Community Feed', desc: 'Batch social network', icon: Rss, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
    { path: 'booking', label: 'Campus Booking', desc: 'Food & sports reservations', icon: ShoppingBag, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
];

export default function DashHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div style={{ padding: '32px 0', maxWidth: 1200, margin: '0 auto' }} className="fade-in">
            {/* Hero */}
            <div className="glass" style={{ padding: '32px 36px', marginBottom: 32, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(99,102,241,0.08)', borderRadius: '50%', filter: 'blur(40px)' }} />

                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
                        {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{user?.college} • {user?.department} • Batch {user?.batch}</p>
                    <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
                        <div className="glass-sm" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Trophy size={18} color="#f59e0b" />
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{user?.helpfulnessScore || 0}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Helpfulness Score</div>
                            </div>
                        </div>
                        <div className="glass-sm" style={{ padding: '12px 20px' }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>9</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Features available</div>
                        </div>
                    </div>
                </div>

                <div className="glass-sm" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(255,255,255,0.2)', minWidth: 280 }}>
                    <div style={{ position: 'relative' }}>
                        {user?.avatar ? (
                            <img src={user.avatar.startsWith('http') ? user.avatar : (user.avatar.startsWith('/uploads') ? `http://localhost:5000${user.avatar}` : user.avatar)} alt="Profile" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                        ) : (
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white' }}>
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: '#10b981', borderRadius: '50%', border: '2px solid white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{user?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {user?.bio || 'No bio yet. Update your profile to add one!'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Your Features</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {features.map(({ path, label, desc, icon: Icon, color, bg }) => (
                    <div key={path} className="glass hover-card" style={{ padding: 24, cursor: 'pointer' }} onClick={() => navigate(`/student/${path}`)}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Icon size={22} color={color} />
                        </div>
                        <h4 style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>{label}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
