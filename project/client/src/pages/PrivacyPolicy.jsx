import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 40px', minHeight: '60vh', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ textAlign: 'center', padding: '40px 0', borderBottom: '1px solid var(--border)', marginBottom: 40 }}>
                <ShieldCheck size={48} color="#10b981" style={{ marginBottom: 15 }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--text-muted)' }}>Last updated: March 7, 2026</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 30, paddingBottom: 60 }}>
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                        <Lock size={20} color="#3b82f6" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>1. Information We Collect</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                        We collect information you provide directly to us, such as when you create an account, upload assignments, post in the community feed, or book campus resources. This includes your name, email address, roll number, department, and any content you upload.
                    </p>
                </section>

                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                        <Eye size={20} color="#3b82f6" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>2. How We Use Your Information</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                        We use the information we collect to provide, maintain, and improve our services, including:
                    </p>
                    <ul style={{ color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 20 }}>
                        <li>Facilitating academic assignments and grading.</li>
                        <li>Managing campus resource bookings.</li>
                        <li>Enabling community interactions and social networking.</li>
                        <li>Sending real-time notifications about campus activities.</li>
                        <li>Calculating helpfulness scores and academic progress.</li>
                    </ul>
                </section>

                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                        <FileText size={20} color="#3b82f6" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>3. Data Retention</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                        We retain your information as long as your account is active or as needed to provide you with the services. If you wish to delete your account, please contact the campus administration.
                    </p>
                </section>

                <section style={{ background: 'rgba(59, 130, 246, 0.05)', padding: 25, borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e40af', marginBottom: 10 }}>Contact Us</h3>
                    <p style={{ color: '#1e40af', opacity: 0.8, margin: 0 }}>
                        If you have any questions about this Privacy Policy, please reach out to us at <strong>privacy@smartcampus.edu</strong>.
                    </p>
                </section>
            </div>
        </div>
    );
}
