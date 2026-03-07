import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, AlertTriangle, BookOpen, FileSearch, LogOut, GraduationCap, Rss, User, Menu, X } from 'lucide-react';
import FacultyHome from './FacultyHome';
import ReportsView from './ReportsView';
import PlagiarismDetector from './PlagiarismDetector';
import AssignmentEvaluator from './AssignmentEvaluator';
import FacultyProfile from './FacultyProfile';
import CommunityFeed from '../student/CommunityFeed';
import Footer from '../../components/Footer';
import NotificationBell from '../../components/NotificationBell';


// import FacultySocialFeed from './FacultySocialFeed';

const navItems = [
    { path: '', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'reports', label: 'Incident Reports', icon: AlertTriangle },
    { path: 'assignments', label: 'Assignments', icon: BookOpen },
    { path: 'plagiarism', label: 'Plagiarism', icon: FileSearch },
    { path: 'feed', label: 'Social Feed', icon: Rss },
    { path: 'profile', label: 'Profile', icon: User },
];

export default function FacultyDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const currentPath = location.pathname.replace('/faculty/', '').replace('/faculty', '');

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Top Navbar */}
            <header className="top-navbar">
                <div className="nav-container">
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16, flexShrink: 0 }}>
                        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #0d9488, #16a34a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GraduationCap size={18} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', lineHeight: 1 }}>Smart Campus</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Faculty Portal</div>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <div key={path}
                                className={`nav-item ${currentPath === path ? 'active' : ''}`}
                                onClick={() => { navigate(`/faculty${path ? `/${path}` : ''}`); setMenuOpen(false); }}>
                                <Icon size={15} />
                                <span>{label}</span>
                            </div>
                        ))}
                    </nav>

                    {/* Right Section */}
                    <div className="nav-right">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer' }}
                            onClick={() => navigate('/faculty/profile')}>
                            <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, background: 'linear-gradient(135deg, #0d9488, #16a34a)' }}>{user?.name?.[0]?.toUpperCase()}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user?.role}</div>
                            </div>
                        </div>

                        <NotificationBell />

                        <button className="btn-danger" onClick={logout} style={{ padding: '7px 12px', fontSize: 12 }}>
                            <LogOut size={14} />
                        </button>

                        <button onClick={() => setMenuOpen(p => !p)}
                            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}
                            className="hamburger">
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="page-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="main-container">
                    <Routes>
                        <Route index element={<FacultyHome />} />
                        <Route path="reports" element={<ReportsView />} />
                        <Route path="assignments" element={<AssignmentEvaluator />} />
                        <Route path="plagiarism" element={<PlagiarismDetector />} />
                        <Route path="feed" element={<CommunityFeed />} />
                        <Route path="social" element={<Navigate to="../feed" replace />} />
                        <Route path="profile" element={<FacultyProfile />} />
                        <Route path="*" element={<Navigate to="/faculty" replace />} />

                        {/* <Route path="feed" element={<FacultySocialFeed />} /> */}
                    </Routes>
                </div>
                <Footer />
            </main>

            <style>{`
                @media (max-width: 768px) {
                    .hamburger { display: flex !important; }
                }
            `}</style>
        </div>
    );
}
