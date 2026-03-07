import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const user = await login(form.email, form.password);
            navigate(user.role === 'student' ? '/student' : '/faculty');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 70%)' }}>
            {/* Background orbs */}
            <div style={{ position: 'fixed', top: '20%', left: '10%', width: 300, height: 300, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 250, height: 250, background: 'rgba(139,92,246,0.1)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <div className="glass fade-in" style={{ width: '100%', maxWidth: 440, padding: 40, margin: '20px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, marginBottom: 16 }}>
                        <GraduationCap size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800 }} className="gradient-text">Smart Campus</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>Companion – Sign in to continue</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#f87171', fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-muted)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="input" type="email" placeholder="you@college.edu" value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={{ paddingLeft: 40 }} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-muted)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={{ paddingLeft: 40, paddingRight: 40 }} required />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8, fontSize: 15 }}>
                        {loading ? <><Zap size={16} className="animate-spin" /> Signing in...</> : 'Sign in'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
                    Don't have an account? {' '}
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
                </p>

                {/* Demo credentials */}
                <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(6,182,212,0.08)', borderRadius: 10, border: '1px solid rgba(6,182,212,0.2)', fontSize: 12, color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--accent)' }}>Demo:</strong> Register with any email. Use role: student or faculty.
                </div>
            </div>
        </div>
    );
}