import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Mail, Lock, Building, BookOpen, Hash, Phone } from 'lucide-react';

function Field({ label, icon: Icon, name, type = 'text', placeholder, required = true, form, set }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>{label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}</label>
            <div style={{ position: 'relative' }}>
                {Icon && <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />}
                <input className="input" type={type} placeholder={placeholder} value={form[name]}
                    onChange={e => set(name, e.target.value)} style={{ paddingLeft: Icon ? 36 : 14, fontSize: 13 }} required={required} />
            </div>
        </div>
    );
}

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', college: '', department: '', batch: '', rollNumber: '', employeeId: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Client-side: require rollNumber for students
        if (form.role === 'student' && !form.rollNumber.trim()) {
            setError('Roll Number is required for student registration.');
            return;
        }
        setLoading(true); setError('');
        try {
            const user = await register(form);
            navigate(user.role === 'student' ? '/student' : '/faculty');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', padding: '20px' }}>
            <div className="glass fade-in" style={{ width: '100%', maxWidth: 520, padding: '36px 40px' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 14, marginBottom: 12 }}>
                        <GraduationCap size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 800 }} className="gradient-text">Create Account</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Join Smart Campus Companion</p>
                </div>

                {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Full Name" icon={User} name="name" placeholder="John Doe" form={form} set={set} />
                        <Field label="Email" icon={Mail} name="email" type="email" placeholder="you@college.edu" form={form} set={set} />
                    </div>
                    <Field label="Password" icon={Lock} name="password" type="password" placeholder="Min 6 characters" form={form} set={set} />

                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>Role <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <select className="input" value={form.role} onChange={e => set('role', e.target.value)} style={{ fontSize: 13 }}>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="College Name" icon={Building} name="college" placeholder="MIT College" form={form} set={set} />
                        <Field label="Department" icon={BookOpen} name="department" placeholder="Computer Science" form={form} set={set} />
                    </div>

                    {form.role === 'student' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <Field label="Batch Year" icon={Hash} name="batch" type="number" placeholder="2028" required={false} form={form} set={set} />
                            <Field label="Roll Number" icon={Hash} name="rollNumber" placeholder="CSE2024001" required={true} form={form} set={set} />
                        </div>
                    ) : (
                        <Field label="Employee ID" icon={Hash} name="employeeId" placeholder="FAC001" required={false} form={form} set={set} />
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: 13, marginTop: 4, fontSize: 14 }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 13 }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}