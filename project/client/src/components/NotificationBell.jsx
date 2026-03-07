import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X, Clock, ExternalLink } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const [notifs, setNotifs] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { socket } = useSocket();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifs = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifs(data.notifications);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchNotifs();
        if (socket) {
            socket.on('booking-update', ({ notification }) => {
                if (notification) setNotifs(prev => [notification, ...prev]);
            });
            socket.on('new-notification', (notif) => {
                setNotifs(prev => [notif, ...prev]);
            });
        }
        return () => {
            if (socket) {
                socket.off('booking-update');
                socket.off('new-notification');
            }
        };
    }, [socket]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifs(notifs.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifs(notifs.map(n => ({ ...n, read: true })));
        } catch (err) { console.error(err); }
    };

    const clearAll = async () => {
        if (!window.confirm('Clear all notifications?')) return;
        try {
            await api.delete('/notifications/clear-all');
            setNotifs([]);
        } catch (err) { console.error(err); }
    };

    const unreadCount = notifs.filter(n => !n.read).length;

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
                    padding: 8, color: open ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', transition: 'color 0.2s'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 6, right: 6, background: 'var(--danger)',
                        color: 'white', fontSize: 9, fontWeight: 900, minWidth: 15, height: 15,
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', border: '2px solid white'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '100%', right: 0, width: 340,
                    background: 'white', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    border: '1px solid var(--border)', zIndex: 1000, marginTop: 10,
                    overflow: 'hidden', animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)' }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>Notifications</span>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} title="Mark all as read" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Mark all read</button>
                            )}
                            {notifs.length > 0 && (
                                <button onClick={clearAll} title="Clear all" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={13} /></button>
                            )}
                        </div>
                    </div>

                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {notifs.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                <Bell size={32} style={{ opacity: 0.1, marginBottom: 10 }} />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifs.map(n => (
                                <div key={n._id}
                                    onClick={() => { markRead(n._id); if (n.link) { navigate(n.link); setOpen(false); } }}
                                    style={{
                                        padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                                        transition: 'background 0.2s', background: n.read ? 'white' : 'rgba(22,163,74,0.04)',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'white' : 'rgba(22,163,74,0.04)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{n.title}</div>
                                        {!n.read && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }} />}
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 6 }}>{n.message}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: '#94a3b8' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        {n.link && <div style={{ color: 'var(--primary)', fontWeight: 600 }}>View Details <ExternalLink size={10} /></div>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
