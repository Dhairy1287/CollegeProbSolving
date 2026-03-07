import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, GraduationCap, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const [hoveredSocial, setHoveredSocial] = useState(null);

    const socialLinks = [
        { icon: Facebook, color: '#1877F2', href: 'https://www.facebook.com/share/1AdFYbJH1W/', name: 'facebook' },
        { icon: Twitter, color: '#1DA1F2', href: 'https://x.com/ImDevarshH', name: 'twitter' },
        { icon: Instagram, color: '#E4405F', href: 'https://www.instagram.com/_dhairy.mehta.1017_?utm_source=qr&igsh=cGRiNTk5dXBmaXk1', name: 'instagram' },
        { icon: Linkedin, color: '#0A66C2', href: 'https://www.linkedin.com/in/dhairymehta2007?utm_source=share_via&utm_content=profile&utm_medium=member_android', name: 'linkedin' },
        { icon: Youtube, color: '#FF0000', href: 'https://www.youtube.com/@darshanuniversity7322', name: 'youtube' },
    ];

    const linkStyle = {
        color: '#9ca3af',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'inline-block'
    };

    const handleMouseEnter = (e) => {
        e.target.style.color = '#3b82f6';
        e.target.style.transform = 'translateX(5px) scale(1.05)';
        e.target.style.fontWeight = '600';
    };

    const handleMouseLeave = (e) => {
        e.target.style.color = '#9ca3af';
        e.target.style.transform = 'translateX(0) scale(1)';
        e.target.style.fontWeight = '400';
    };

    return (
        <footer style={{ background: '#111827', color: '#f3f4f6', padding: '60px 20px 20px', marginTop: 'auto' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
                {/* About Section */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #0d9488, #16a34a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GraduationCap size={18} color="white" />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>Smart Campus</div>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: '#9ca3af' }}>
                        Empowering students and faculty with a seamless digital ecosystem for daily campus activities, from resource booking to collaborative expense management.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'white' }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <li><Link to="/about" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>About Us</Link></li>
                        <li><Link to="/contact" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Contact</Link></li>
                        <li><Link to="/student/booking" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Campus Booking</Link></li>
                        <li><Link to="/student/netowe" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>NetOwe Dashboard</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'white' }}>Contact Us</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af' }}><Mail size={14} /> dhairymehta122024@gmail.com</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af' }}><Phone size={14} /> +91 13576 73289</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af' }}><MapPin size={14} /> Darshan University, Rajkot</li>
                    </ul>
                </div>

                {/* Policies & Social */}
                <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'white' }}>Legal & Follow</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                        <li><Link to="/privacy" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Privacy Policy</Link></li>
                        <li><Link to="/terms" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Terms of Service</Link></li>
                        <li><Link to="/faq" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>FAQ</Link></li>
                    </ul>
                    <div style={{ display: 'flex', gap: 15 }}>
                        {socialLinks.map(({ icon: Icon, color, href, name }) => (
                            <a
                                key={name}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onMouseEnter={() => setHoveredSocial(name)}
                                onMouseLeave={() => setHoveredSocial(null)}
                                style={{
                                    color: hoveredSocial === name ? color : '#9ca3af',
                                    transition: 'all 0.3s ease',
                                    transform: hoveredSocial === name ? 'scale(1.2) translateY(-3px)' : 'scale(1)',
                                    display: 'inline-block'
                                }}
                            >
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid #1f2937', paddingTop: 20, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
                &copy; {new Date().getFullYear()} Smart Campus Companion. All rights reserved. Built with ❤️ for our campus community.
            </div>

            <style>{`
                a:hover {
                    text-decoration: underline !important;
                }
            `}</style>
        </footer>
    );
}
