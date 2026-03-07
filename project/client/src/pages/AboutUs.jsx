import React from 'react';
import { Users, Target, ShieldCheck, Heart, GraduationCap } from 'lucide-react';

const team = [
    { name: "Dhairy Mehta", role: "Leader", color: "#6366f1" },
    { name: "Devarsh Barevadiya", role: "Team Member", color: "#10b981" },
    { name: "Het Mehta", role: "Team Member", color: "#f59e0b" },
    { name: "Maharshi Dave", role: "Team Member", color: "#ef4444" },
];

export default function AboutUs() {
    return (
        <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 20px' }} className="fade-in">
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, background: 'rgba(22, 163, 74, 0.1)', borderRadius: '16px', marginBottom: 20 }}>
                    <Users size={32} color="var(--primary)" />
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>About Us</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 700, margin: '0 auto' }}>
                    Empowering students through technology to build a better, more connected campus community.
                </p>
            </div>

            {/* Mission Section */}
            <div className="glass" style={{ padding: 40, marginBottom: 50, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}>
                    <Target size={200} color="var(--primary)" />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Target color="var(--primary)" /> Our Mission
                    </h2>
                    <p style={{ color: 'var(--text)', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
                        Our mission is to make a simple, accessible, and effective platform where students can share their problems and get support in solving them. We believe that by providing a digital platform, students can express their concerns and help bring positive changes in their college environment.
                    </p>
                </div>
            </div>

            {/* Description Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, marginBottom: 60 }}>
                <div className="glass" style={{ padding: 32 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <GraduationCap size={20} color="var(--primary)" /> Project Goal
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>
                        This platform is a Student College Problem Helping Tool designed to help students easily share and report common issues they face in college, from academics to facilities and communication.
                    </p>
                </div>
                <div className="glass" style={{ padding: 32 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Heart size={20} color="#ec4899" /> Student Initiative
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>
                        Developed as part of a student initiative to improve the college experience through technology. We aim to make problem reporting easier, more organized, and transparent.
                    </p>
                </div>
            </div>

            {/* Team Section */}
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 40 }}>Project Team</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                    {team.map((member, index) => (
                        <div key={index} className="glass hover-card" style={{ padding: 24, textAlign: 'center' }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                background: member.color + '15',
                                border: `2px solid ${member.color}30`,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                fontSize: 32,
                                fontWeight: 800,
                                color: member.color
                            }}>
                                {member.name[0]}
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{member.name}</h3>
                            <div style={{
                                fontSize: 12,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: member.color,
                                background: member.color + '10',
                                padding: '4px 12px',
                                borderRadius: 100,
                                display: 'inline-block'
                            }}>
                                {member.role}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: 80, textAlign: 'center', padding: '40px 0', borderTop: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    Working together to design and develop this project with the aim of helping students and improving communication within the college community.
                </p>
            </div>
        </div>
    );
}
