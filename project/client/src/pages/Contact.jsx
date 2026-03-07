import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setError('');
        try {
            await api.post('/contact', formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to send message. Please try again later.');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div style={{ maxWidth: 800, margin: '100px auto', padding: '0 20px', textAlign: 'center' }} className="fade-in">
                <div style={{ width: 80, height: 80, background: 'rgba(22, 163, 74, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle size={40} color="var(--primary)" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Message Sent!</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 18, marginBottom: 32 }}>Thank you for reaching out. We will get back to you at dhairymehta122024@gmail.com if necessary.</p>
                <button className="btn-primary" onClick={() => setStatus('idle')}>Send Another Message</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 20px' }} className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50, background: 'rgba(22, 163, 74, 0.1)', borderRadius: '12px', marginBottom: 15 }}>
                    <Mail size={30} color="var(--primary)" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Contact Us</h1>
                <p style={{ color: 'var(--text-muted)' }}>Found an issue? Have a suggestion? We're here to help.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: 40, alignItems: 'start' }}>
                <div className="glass" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Get in Touch</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                        Our team is dedicated to improving your college experience. Please use the form to report any technical issues or provide feedback about the Smart Campus Companion.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, background: 'var(--surface2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Mail size={18} color="var(--primary)" />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Email Support</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>dhairymehta122024@gmail.com</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, background: 'var(--surface2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MessageSquare size={18} color="var(--primary)" />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Community</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>Post on the Social Feed</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass" style={{ padding: 32 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {error && (
                            <div style={{ padding: '12px 16px', background: 'rgba(220, 38, 38, 0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: 14 }}>
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Your Name</label>
                                <input
                                    className="input"
                                    required
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Email Address</label>
                                <input
                                    className="input"
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Issue Type / Subject</label>
                            <select
                                className="input"
                                required
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            >
                                <option value="" disabled>Select an issue type</option>
                                <option value="Technical Bug">Technical Bug</option>
                                <option value="Assignment Issue">Assignment Issue</option>
                                <option value="Feature Suggestion">Feature Suggestion</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Message / Details</label>
                            <textarea
                                className="input"
                                required
                                rows={6}
                                style={{ resize: 'none' }}
                                placeholder="Describe the issue you're facing in detail..."
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={status === 'submitting'}
                            style={{ justifyContent: 'center', padding: '14px' }}
                        >
                            {status === 'submitting' ? 'Sending Message...' : <><Send size={18} /> Send Message</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
