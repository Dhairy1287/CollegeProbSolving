import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    ShoppingBag, Utensils, Dumbbell, Clock, CheckCircle, Plus,
    Trash2, XCircle, Calendar, MapPin, Coffee
} from 'lucide-react';

const MENU = [
    { name: 'Veg Thali', price: 60, emoji: '🍱' },
    { name: 'Non-Veg Thali', price: 80, emoji: '🍗' },
    { name: 'Sandwich', price: 30, emoji: '🥪' },
    { name: 'Samosa (2 pcs)', price: 15, emoji: '🥟' },
    { name: 'Tea', price: 10, emoji: '☕' },
    { name: 'Coffee', price: 15, emoji: '☕' },
    { name: 'Juice', price: 25, emoji: '🥤' },
    { name: 'Paratha', price: 35, emoji: '🫓' },
    { name: 'Idli Sambhar', price: 25, emoji: '🍽️' },
    { name: 'Pav Bhaji', price: 40, emoji: '🍲' },
    { name: 'Cold Drink', price: 20, emoji: '🥤' },
    { name: 'Brownie', price: 30, emoji: '🍫' },
];

const GROUNDS = ['Cricket Ground', 'Football Field', 'Basketball Court', 'Badminton Court', 'Table Tennis Room'];

const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#6366f1',
    preparing: '#06b6d4',
    ready: '#10b981',
    completed: '#94a3b8',
    cancelled: '#ef4444',
};

const STATUS_LABELS = {
    pending: '⏳ Pending',
    confirmed: '✅ Confirmed',
    preparing: '👨‍🍳 Preparing',
    ready: '🔔 Ready!',
    completed: '✔️ Completed',
    cancelled: '❌ Cancelled',
};

export default function CampusBooking() {
    const [tab, setTab] = useState('food');
    const [cart, setCart] = useState([]);
    const [pickupTime, setPickupTime] = useState('');
    const [myBookings, setMyBookings] = useState([]);
    const [cancellingId, setCancellingId] = useState(null);

    // Sports
    const [ground, setGround] = useState(GROUNDS[0]);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [sport, setSport] = useState('');
    const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

    const fetchBookings = async () => {
        const { data } = await api.get('/bookings/my');
        setMyBookings(data.bookings);
    };
    useEffect(() => { fetchBookings(); }, []);

    const addToCart = (item) => {
        setCart(p => {
            const i = p.findIndex(c => c.name === item.name);
            if (i >= 0) return p.map((c, idx) => idx === i ? { ...c, quantity: c.quantity + 1 } : c);
            return [...p, { ...item, quantity: 1 }];
        });
    };
    const removeFromCart = (name) => setCart(p => p.filter(c => c.name !== name));
    const changeQty = (name, delta) => setCart(p => p.map(c => c.name === name ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c));
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const placeFood = async () => {
        if (!cart.length) return;
        setLoading(true);
        await api.post('/bookings', { type: 'food', foodItems: cart, pickupTime });
        setCart([]); setPickupTime('');
        fetchBookings();
        setTab('history');
        flash('🍽️ Food order placed! Check your order in My Bookings.');
        setLoading(false);
    };

    const fetchSlots = async () => {
        if (!ground || !slotDate) return;
        const { data } = await api.get(`/bookings/slots?ground=${encodeURIComponent(ground)}&date=${slotDate}`);
        setSlots(data.slots);
    };

    const bookSport = async () => {
        if (!selectedSlot) return;
        setLoading(true);
        await api.post('/bookings', { type: 'sports', ground, sport, slot: selectedSlot });
        setSelectedSlot(null);
        fetchBookings();
        fetchSlots();
        setTab('history');
        flash('🏟️ Ground booked! Check My Bookings.');
        setLoading(false);
    };

    const cancelBooking = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        setCancellingId(id);
        try {
            await api.delete(`/bookings/${id}`);
            fetchBookings();
            flash('Booking cancelled successfully.');
        } catch (err) {
            flash('Error: ' + (err.response?.data?.message || 'Could not cancel.'));
        }
        setCancellingId(null);
    };

    const canCancel = (b) => ['pending', 'confirmed'].includes(b.status);

    return (
        <div style={{ padding: '28px 0', maxWidth: 940 }} className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <ShoppingBag size={22} color="#f97316" /> Campus Booking
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 22 }}>Order canteen food or book a sports ground.</p>

            {msg && (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#059669', fontSize: 13 }}>
                    {msg}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[['food', 'Food Order', Utensils], ['sports', 'Ground Booking', Dumbbell], ['history', 'My Bookings', Clock]].map(([t, label, Icon]) => (
                    <button key={t} onClick={() => { setTab(t); if (t === 'sports') fetchSlots(); }}
                        className={tab === t ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {/* ── FOOD ORDER ── */}
            {tab === 'food' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
                    <div>
                        <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>🍽️ Canteen Menu</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {MENU.map(item => {
                                const cartItem = cart.find(c => c.name === item.name);
                                return (
                                    <div key={item.name} className="glass-sm hover-card" style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.emoji} {item.name}</div>
                                            <div style={{ color: '#10b981', fontWeight: 700, fontSize: 13, marginTop: 3 }}>₹{item.price}</div>
                                        </div>
                                        {cartItem ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <button onClick={() => changeQty(item.name, -1)} style={{ width: 26, height: 26, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontWeight: 700 }}>−</button>
                                                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 18, textAlign: 'center' }}>{cartItem.quantity}</span>
                                                <button onClick={() => changeQty(item.name, 1)} style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: 'var(--primary)', cursor: 'pointer', fontWeight: 700, color: 'white' }}>+</button>
                                            </div>
                                        ) : (
                                            <button className="btn-primary" onClick={() => addToCart(item)} style={{ padding: '6px 12px', fontSize: 12 }}>
                                                <Plus size={12} /> Add
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: 20, position: 'sticky', top: 20, alignSelf: 'start' }}>
                        <h4 style={{ fontWeight: 700, marginBottom: 16 }}>🛒 Cart</h4>
                        {cart.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Add items to your cart</p>
                        ) : (
                            <>
                                {cart.map(item => (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                                        <span style={{ flex: 1 }}>{item.name} × {item.quantity}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                                            <button onClick={() => removeFromCart(item.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4, marginBottom: 14, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}>
                                    <span>Total</span><span style={{ color: '#10b981' }}>₹{total}</span>
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Pickup Time</label>
                                    <input className="input" type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} />
                                </div>
                                <button className="btn-primary" onClick={placeFood} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                                    {loading ? 'Placing...' : 'Place Order'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── SPORTS BOOKING ── */}
            {tab === 'sports' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Ground / Court</label>
                            <select className="input" value={ground} onChange={e => setGround(e.target.value)}>
                                {GROUNDS.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Purpose</label>
                            <input className="input" value={sport} onChange={e => setSport(e.target.value)} placeholder="Play, event venue..." />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Date</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="input" type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} />
                                <button className="btn-secondary" onClick={fetchSlots} style={{ flexShrink: 0, padding: '9px 14px', fontSize: 12 }}>
                                    <Calendar size={13} /> Check
                                </button>
                            </div>
                        </div>
                    </div>

                    {slots.length > 0 && (
                        <>
                            <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Available Time Slots (6 AM – 10 PM)</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                                {slots.map((s, i) => {
                                    const h = new Date(s.startTime).getHours();
                                    const label = `${h}:00 – ${h + 1}:00`;
                                    const isSel = selectedSlot?.startTime === s.startTime;
                                    return (
                                        <div key={i} onClick={() => s.available && setSelectedSlot(s)}
                                            style={{ padding: '11px 14px', borderRadius: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, cursor: s.available ? 'pointer' : 'not-allowed', transition: 'all 0.2s', border: `2px solid ${isSel ? 'var(--primary)' : s.available ? 'var(--border)' : 'rgba(239,68,68,0.25)'}`, background: isSel ? 'rgba(22,163,74,0.12)' : s.available ? 'var(--surface2)' : 'rgba(239,68,68,0.06)', color: s.available ? 'var(--text)' : 'var(--text-muted)', opacity: s.available ? 1 : 0.7 }}>
                                            {label}
                                            <div style={{ fontSize: 10, marginTop: 4, color: s.available ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                                                {s.available ? '✓ Free' : '✗ Booked'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {selectedSlot && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: 'var(--primary)' }}>
                                        <MapPin size={13} style={{ marginRight: 6 }} />
                                        {ground} • {new Date(selectedSlot.startTime).getHours()}:00–{new Date(selectedSlot.endTime).getHours()}:00
                                    </div>
                                    <button className="btn-primary" onClick={bookSport} disabled={loading}>
                                        <CheckCircle size={14} /> {loading ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ── MY BOOKINGS ── */}
            {tab === 'history' && (
                <div>
                    <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>My Bookings</h4>
                    {myBookings.length === 0 ? (
                        <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Clock size={36} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                            <p>No bookings yet. Order food or book a ground!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {myBookings.map(b => (
                                <div key={b._id} className="glass-sm" style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                    <div style={{ fontSize: 24 }}>{b.type === 'food' ? '🍽️' : '🏟️'}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'capitalize', marginBottom: 4 }}>
                                            {b.type === 'food' ? 'Food Order' : `${b.ground} – ${b.sport || 'Sports'}`}
                                        </div>
                                        {b.type === 'food' && b.foodItems?.length > 0 && (
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                                                {b.foodItems.map(i => `${i.name} ×${i.quantity}`).join(' • ')}
                                                {b.pickupTime && ` · Pickup: ${b.pickupTime}`}
                                            </div>
                                        )}
                                        {b.type === 'sports' && b.slot && (
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                                                {new Date(b.slot.startTime).toLocaleDateString()} · {new Date(b.slot.startTime).getHours()}:00 – {new Date(b.slot.endTime).getHours()}:00
                                            </div>
                                        )}
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                        {b.type === 'food' && b.totalAmount > 0 && (
                                            <div style={{ fontWeight: 800, color: '#10b981', fontSize: 14 }}>₹{b.totalAmount}</div>
                                        )}
                                        <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: `${STATUS_COLORS[b.status]}18`, color: STATUS_COLORS[b.status] }}>
                                            {STATUS_LABELS[b.status] || b.status}
                                        </span>
                                        {canCancel(b) && (
                                            <button onClick={() => cancelBooking(b._id)} disabled={cancellingId === b._id}
                                                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}>
                                                <XCircle size={12} /> {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
