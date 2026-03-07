import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, AlertTriangle, Wallet, BookCheck,
    Calculator, GraduationCap, Rss, ShoppingBag, LogOut,
    Trophy, Menu, X, User, ChevronDown, BookOpen
} from 'lucide-react';

import DashHome from './DashHome';
import RaggingReport from './RaggingReport';
import ConflictReport from './ConflictReport';
import NetOwe from './NetOwe';
import AttendanceTracker from './AttendanceTracker';
import SPICalculator from './SPICalculator';
import ScholarshipFinder from './ScholarshipFinder';
import CommunityFeed from './CommunityFeed';
import CampusBooking from './CampusBooking';
import UserProfile from './UserProfile';
import StudentAssignments from './StudentAssignments';
import Footer from '../../components/Footer';
import NotificationBell from '../../components/NotificationBell';

const navItems = [
    { path: '', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'assignments', label: 'Assignments', icon: BookOpen },
    { path: 'ragging', label: 'Reports', icon: AlertTriangle },
    { path: 'netowe', label: 'NetOwe', icon: Wallet },
    { path: 'attendance', label: 'Attendance', icon: BookCheck },
    { path: 'spi', label: 'SPI/CGPA', icon: Calculator },
    { path: 'scholarships', label: 'Scholarships', icon: GraduationCap },
    { path: 'feed', label: 'Community', icon: Rss },
    { path: 'booking', label: 'Booking', icon: ShoppingBag },
    { path: 'profile', label: 'Profile', icon: User },
];

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const currentPath = location.pathname.replace('/student/', '').replace('/student', '');

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Top Navbar */}
            <header className="top-navbar">
                <div className="nav-container">
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16, flexShrink: 0 }}>
                        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GraduationCap size={18} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', lineHeight: 1 }}>Smart Campus</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Student Portal</div>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <div key={path}
                                className={`nav-item ${currentPath === path ? 'active' : ''}`}
                                onClick={() => { navigate(`/student${path ? `/${path}` : ''}`); setMenuOpen(false); }}>
                                <Icon size={15} />
                                <span>{label}</span>
                            </div>
                        ))}
                    </nav>

                    {/* Right Section */}
                    <div className="nav-right">
                        {/* Score */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(245,158,11,0.1)', padding: '5px 10px', borderRadius: 20, border: '1px solid rgba(245,158,11,0.2)' }}>
                            <Trophy size={13} color="#f59e0b" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>{user?.helpfulnessScore || 0} pts</span>
                        </div>

                        <NotificationBell />

                        {/* Avatar + User */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer' }}
                            onClick={() => navigate('/student/profile')}>
                            <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{user?.name?.[0]?.toUpperCase()}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user?.rollNumber || user?.department}</div>
                            </div>
                        </div>

                        {/* Logout */}
                        <button className="btn-danger" onClick={logout} style={{ padding: '7px 12px', fontSize: 12 }}>
                            <LogOut size={14} />
                        </button>

                        {/* Mobile hamburger */}
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
                        <Route index element={<DashHome />} />
                        <Route path="assignments" element={<StudentAssignments />} />
                        <Route path="ragging" element={<RaggingReport />} />
                        <Route path="conflict" element={<ConflictReport />} />
                        <Route path="netowe" element={<NetOwe />} />
                        <Route path="attendance" element={<AttendanceTracker />} />
                        <Route path="spi" element={<SPICalculator />} />
                        <Route path="scholarships" element={<ScholarshipFinder />} />
                        <Route path="feed" element={<CommunityFeed />} />
                        <Route path="booking" element={<CampusBooking />} />
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="*" element={<Navigate to="/student" replace />} />
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
