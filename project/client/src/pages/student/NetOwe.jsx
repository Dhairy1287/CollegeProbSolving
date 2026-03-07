import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    Wallet, Plus, Users, RefreshCw, CheckCircle, ArrowRight,
    Trash2, ArrowLeftRight, UserCircle2, TrendingUp, TrendingDown,
    List, X, Edit2, Save
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────── */
const fmt = (n) => `₹${Number(n).toFixed(2)}`;

/* ─── tiny sub-components ────────────────────────────── */
function SectionHeader({ title, color = 'var(--primary)' }) {
    return (
        <h4 style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>
            {title}
        </h4>
    );
}

export default function NetOwe() {
    const { user } = useAuth();

    /* group state */
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [simplified, setSimplified] = useState([]);

    /* direct state */
    const [directTxs, setDirectTxs] = useState([]);
    const [showDirectForm, setShowDirectForm] = useState(false);
    const [directForm, setDirectForm] = useState({ toEmail: '', amount: '', description: '' });
    const [editDirect, setEditDirect] = useState(null); // { id, amount }
    const [viewTx, setViewTx] = useState(null); // Full transaction object for modal

    /* group form */
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [gName, setGName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]); // Array of user objects { _id, name, email }
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    /* expense form */
    const [showExpForm, setShowExpForm] = useState(false);
    const [expForm, setExpForm] = useState({ description: '', amount: '', splitType: 'equal', customSplits: {} });

    /* tab: 'direct' | 'groups' | 'all' | 'settle' */
    const [tab, setTab] = useState('direct');
    const [groupTab, setGroupTab] = useState('expenses'); // expenses | simplified
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

    /* fetchers */
    const fetchGroups = async () => {
        const { data } = await api.get('/expenses/groups');
        setGroups(data.groups);
    };
    const fetchGroupExpenses = async (g) => {
        const { data } = await api.get(`/expenses/group/${g._id}`);
        setExpenses(data.expenses);
    };
    const fetchDirect = async () => {
        const { data } = await api.get('/expenses/direct');
        setDirectTxs(data.transactions);
    };
    const simplify = async () => {
        if (!selectedGroup) return;
        const { data } = await api.get(`/expenses/simplify/${selectedGroup._id}`);
        setSimplified(data.simplifiedDebts);
        setGroupTab('simplified');
    };

    useEffect(() => { fetchGroups(); fetchDirect(); }, []);

    const selectGroup = (g) => { setSelectedGroup(g); fetchGroupExpenses(g); setGroupTab('expenses'); setSimplified([]); };

    /* ── Direct Transactions ── */
    const addDirect = async () => {
        if (!directForm.amount || !directForm.description) return;
        setLoading(true);
        try {
            // toEmail field: try to find user by email on server (we pass toUserEmail)
            await api.post('/expenses/direct', {
                toUserEmail: directForm.toEmail,
                amount: parseFloat(directForm.amount),
                description: directForm.description,
            });
            setDirectForm({ toEmail: '', amount: '', description: '' });
            setShowDirectForm(false);
            fetchDirect();
            flash('1-to-1 transaction added!');
        } catch (err) { flash('Error: ' + (err.response?.data?.message || err.message)); }
        setLoading(false);
    };

    const updateDirect = async (id) => {
        await api.patch(`/expenses/direct/${id}`, { amount: parseFloat(editDirect.amount) });
        setEditDirect(null);
        fetchDirect();
        flash('Amount updated!');
    };

    const deleteDirect = async (id) => {
        await api.delete(`/expenses/direct/${id}`);
        fetchDirect();
        flash('Transaction removed.');
    };

    const settleDirect = async (id) => {
        try {
            await api.patch(`/expenses/direct/${id}/settle`);
            fetchDirect();
            flash('Transaction marked as settled!');
        } catch (err) { flash('Error: ' + (err.response?.data?.message || err.message)); }
    };

    const fetchTxDetails = async (id, source) => {
        try {
            const endpoint = source === 'direct' ? `/expenses/direct/${id}` : `/expenses/${id}`;
            const { data } = await api.get(endpoint);
            setViewTx(data.transaction || data.expense);
        } catch (err) { flash('Could not fetch details'); }
    };

    /* ── User Search for Group ── */
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                const { data } = await api.get(`/auth/users/search?q=${searchQuery}`);
                setSearchResults(data.users.filter(u => u._id !== user._id));
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const toggleMember = (u) => {
        if (selectedMembers.find(m => m._id === u._id)) {
            setSelectedMembers(members => members.filter(m => m._id !== u._id));
        } else {
            setSelectedMembers(members => [...members, u]);
        }
    };

    /* ── Group Actions ── */
    const createGroup = async () => {
        if (!gName.trim()) return flash('Group name is required');
        if (selectedMembers.length === 0) return flash('Select at least one member');

        await api.post('/expenses/groups', {
            name: gName,
            memberIds: selectedMembers.map(m => m._id),
        });
        setGName(''); setSelectedMembers([]); setShowGroupForm(false); setSearchQuery('');
        fetchGroups();
        flash('Group created!');
    };

    const deleteGroup = async (id) => {
        if (!window.confirm('Delete this group and all its expenses? This cannot be undone.')) return;
        try {
            await api.delete(`/expenses/groups/${id}`);
            setSelectedGroup(null);
            fetchGroups();
            flash('Group deleted.');
        } catch (err) { flash('Error: ' + (err.response?.data?.message || err.message)); }
    };

    const addExpense = async () => {
        if (!selectedGroup || !expForm.amount) return;
        const members = selectedGroup.members.map(m => m._id);
        const payload = {
            groupId: selectedGroup._id,
            description: expForm.description || 'Expense',
            amount: parseFloat(expForm.amount),
            splitType: expForm.splitType,
            splitAmong: members,
            customSplits: expForm.splitType === 'custom'
                ? selectedGroup.members.map(m => ({
                    user: m._id,
                    amount: parseFloat(expForm.customSplits[m._id] || 0),
                }))
                : [],
        };
        await api.post('/expenses/add', payload);
        setShowExpForm(false);
        setExpForm({ description: '', amount: '', splitType: 'equal', customSplits: {} });
        fetchGroupExpenses(selectedGroup);
        flash('Expense added!');
    };

    const deleteExpense = async (id) => {
        await api.delete(`/expenses/${id}`);
        fetchGroupExpenses(selectedGroup);
        flash('Expense deleted.');
    };

    /* ─ Colors / Status ─ */
    const tabBg = (t) => tab === t
        ? { background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', border: 'none' }
        : { background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)' };

    const TABS = [
        { key: 'direct', label: '1-to-1 Owes', icon: UserCircle2 },
        { key: 'groups', label: 'Group Expenses', icon: Users },
        { key: 'all', label: 'All Transactions', icon: List },
    ];

    /* All Transactions combined view */
    const allItems = [
        ...directTxs.map(t => ({ ...t, _source: 'direct' })),
        ...expenses.map(e => ({ ...e, _source: 'expense' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div style={{ padding: '28px 0', maxWidth: 960, margin: '0 auto' }} className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Wallet size={22} color="#10b981" /> NetOwe – Expense Simplifier
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Track who owes whom. Simplify debts with one click.</p>
                </div>
            </div>

            {msg && (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#059669', fontSize: 13, fontWeight: 500 }}>
                    {msg}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setTab(key)}
                        style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', ...tabBg(key) }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {/* ═══════ TAB: DIRECT (1-to-1) ═══════ */}
            {tab === 'direct' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <SectionHeader title="1-to-1 Transactions" />
                        <button className="btn-primary" onClick={() => setShowDirectForm(p => !p)} style={{ padding: '8px 16px', fontSize: 12 }}>
                            <Plus size={13} /> Add Owe
                        </button>
                    </div>

                    {showDirectForm && (
                        <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
                            <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Record who owes you (or you owe)</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Other person's Email</label>
                                    <input className="input" value={directForm.toEmail} onChange={e => setDirectForm(p => ({ ...p, toEmail: e.target.value }))} placeholder="friend@email.com" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Amount (₹) they owe you</label>
                                    <input className="input" type="number" value={directForm.amount} onChange={e => setDirectForm(p => ({ ...p, amount: e.target.value }))} placeholder="250" />
                                </div>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Description</label>
                                <input className="input" value={directForm.description} onChange={e => setDirectForm(p => ({ ...p, description: e.target.value }))} placeholder="Canteen lunch, bus ticket..." />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-primary" onClick={addDirect} disabled={loading} style={{ padding: '9px 20px', fontSize: 13 }}>
                                    <Plus size={13} /> Add Transaction
                                </button>
                                <button className="btn-secondary" onClick={() => setShowDirectForm(false)} style={{ padding: '9px 16px', fontSize: 13 }}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {directTxs.length === 0 ? (
                        <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <ArrowLeftRight size={36} style={{ opacity: 0.25, margin: '0 auto 12px' }} />
                            <p style={{ fontSize: 14 }}>No 1-to-1 transactions yet. Click "Add Owe" to start.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {directTxs.map(tx => {
                                const iOwe = tx.from?._id === user?._id;
                                const other = iOwe ? tx.to : tx.from;
                                const isEditing = editDirect?.id === tx._id;
                                return (
                                    <div key={tx._id} className="glass-sm" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: tx.settled ? 0.55 : 1 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: iOwe ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {iOwe ? <TrendingDown size={18} color="#ef4444" /> : <TrendingUp size={18} color="#10b981" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{tx.description}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                {iOwe ? `You owe ${other?.name}` : `${other?.name} owes you`}
                                                {tx.settled && <span style={{ marginLeft: 8, color: '#10b981', fontWeight: 600 }}>✓ Settled</span>}
                                            </div>
                                        </div>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                <input className="input" type="number" value={editDirect.amount}
                                                    onChange={e => setEditDirect(p => ({ ...p, amount: e.target.value }))}
                                                    style={{ width: 100, fontSize: 13 }} />
                                                <button className="btn-primary" onClick={() => updateDirect(tx._id)} style={{ padding: '7px 12px', fontSize: 12 }}><Save size={12} /></button>
                                                <button className="btn-secondary" onClick={() => setEditDirect(null)} style={{ padding: '7px 10px', fontSize: 12 }}><X size={12} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ fontWeight: 800, fontSize: 16, color: iOwe ? '#ef4444' : '#10b981' }}>{fmt(tx.amount)}</div>
                                                {!tx.settled && (
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button title="Edit amount" onClick={() => setEditDirect({ id: tx._id, amount: tx.amount })}
                                                            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button title="Mark settled" onClick={() => settleDirect(tx._id)}
                                                            style={{ background: 'none', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#10b981' }}>
                                                            <CheckCircle size={13} />
                                                        </button>
                                                        <button title="Delete" onClick={() => deleteDirect(tx._id)}
                                                            style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#ef4444' }}>
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════ TAB: GROUPS ═══════ */}
            {tab === 'groups' && (
                <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
                    {/* Sidebar: Group list */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <SectionHeader title="My Groups" />
                            <button className="btn-primary" onClick={() => setShowGroupForm(p => !p)} style={{ padding: '6px 12px', fontSize: 11 }}>
                                <Plus size={12} /> New
                            </button>
                        </div>

                        {showGroupForm && (
                            <div className="glass" style={{ padding: 14, marginBottom: 16 }}>
                                <input className="input" value={gName} onChange={e => setGName(e.target.value)} placeholder="Group name" style={{ marginBottom: 10, fontSize: 13 }} />

                                <div style={{ position: 'relative', marginBottom: 10 }}>
                                    <input className="input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Add members..." style={{ fontSize: 12 }} />
                                    {searchResults.length > 0 && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 100, maxHeight: 180, overflowY: 'auto', boxShadow: 'var(--shadow-lg)', marginTop: 4 }}>
                                            {searchResults.map(u => (
                                                <div key={u._id} onClick={() => { toggleMember(u); setSearchQuery(''); setSearchResults([]); }}
                                                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{u.name[0]}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedMembers.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                        {selectedMembers.map(m => (
                                            <div key={m._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--surface3)', padding: '3px 10px', borderRadius: 100, fontSize: 11 }}>
                                                {m.name}
                                                <X size={10} style={{ cursor: 'pointer' }} onClick={() => toggleMember(m)} />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn-primary" onClick={createGroup} style={{ flex: 1, fontSize: 12, padding: '8px 0', justifyContent: 'center' }}>Create</button>
                                    <button className="btn-secondary" onClick={() => { setShowGroupForm(false); setSelectedMembers([]); setSearchQuery(''); }} style={{ padding: '8px 12px', fontSize: 12 }}><X size={14} /></button>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {groups.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '0 4px' }}>No groups yet.</p> :
                                groups.map(g => (
                                    <div key={g._id} onClick={() => selectGroup(g)}
                                        className="hover-card"
                                        style={{ padding: '14px', cursor: 'pointer', borderRadius: 12, border: selectedGroup?._id === g._id ? '2px solid var(--primary)' : '1px solid var(--border)', background: selectedGroup?._id === g._id ? 'rgba(16,185,129,0.06)' : 'var(--surface2)', transition: 'all 0.2s' }}>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: selectedGroup?._id === g._id ? 'var(--primary)' : 'inherit' }}>{g.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                            <Users size={12} /> {g.members?.length} members
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Main Content: Group Details */}
                    <div>
                        {!selectedGroup ? (
                            <div className="glass" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Users size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
                                <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Welcome to Groups</h4>
                                <p style={{ fontSize: 14, maxWidth: 280, marginTop: 8 }}>Select a group from the sidebar or create a new one to manage shared expenses.</p>
                            </div>
                        ) : (
                            <div className="fade-in">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <div>
                                        <h3 style={{ fontWeight: 800, fontSize: 18 }}>{selectedGroup.name}</h3>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Users size={12} /> {selectedGroup.members?.map(m => m.name).join(', ')}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn-secondary" onClick={() => setShowExpForm(p => !p)} style={{ padding: '9px 16px', fontSize: 12 }}>
                                            <Plus size={14} /> Add Expense
                                        </button>
                                        <button className="btn-primary" onClick={simplify} style={{ padding: '9px 16px', fontSize: 12 }}>
                                            <RefreshCw size={14} /> Final Settle
                                        </button>
                                        {selectedGroup.createdBy === user._id && (
                                            <button className="btn-danger" onClick={() => deleteGroup(selectedGroup._id)} title="Delete Group" style={{ padding: '9px 12px' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Add expense form */}
                                {showExpForm && (
                                    <div className="glass" style={{ padding: 24, marginBottom: 20, border: '1px solid var(--primary-light)' }}>
                                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>New Group Expense</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                                            <div>
                                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Description</label>
                                                <input className="input" value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} placeholder="Dinner, movie..." style={{ fontSize: 13 }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Total amount (₹)</label>
                                                <input className="input" type="number" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" style={{ fontSize: 13 }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Split Strategy</label>
                                                <select className="input" value={expForm.splitType} onChange={e => setExpForm(p => ({ ...p, splitType: e.target.value }))} style={{ fontSize: 13 }}>
                                                    <option value="equal">Split Equally</option>
                                                    <option value="custom">Unequal Split</option>
                                                </select>
                                            </div>
                                        </div>

                                        {expForm.splitType === 'custom' && (
                                            <div style={{ marginBottom: 20, background: 'var(--surface2)', padding: 16, borderRadius: 12 }}>
                                                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 12 }}>Specify share for each person:</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                    {selectedGroup.members?.map(m => (
                                                        <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', padding: '8px 12px', borderRadius: 8 }}>
                                                            <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{m.name}</span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹</span>
                                                                <input className="input" type="number" placeholder="0"
                                                                    value={expForm.customSplits[m._id] || ''}
                                                                    onChange={e => setExpForm(p => ({ ...p, customSplits: { ...p.customSplits, [m._id]: e.target.value } }))}
                                                                    style={{ width: 80, fontSize: 12, padding: '4px 8px' }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button className="btn-primary" onClick={addExpense} style={{ padding: '10px 24px', fontSize: 13 }}>Record Expense</button>
                                            <button className="btn-secondary" onClick={() => setShowExpForm(false)} style={{ padding: '10px 18px', fontSize: 13 }}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {/* Sub-tabs for group detail */}
                                <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                                    {[['expenses', 'Activity Log'], ['simplified', 'Optimization']].map(([t, l]) => (
                                        <button key={t} onClick={() => setGroupTab(t)}
                                            style={{
                                                padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 8, border: 'none',
                                                background: groupTab === t ? 'var(--primary)' : 'transparent',
                                                color: groupTab === t ? 'white' : 'var(--text-muted)',
                                                transition: 'all 0.2s'
                                            }}>{l}</button>
                                    ))}
                                </div>

                                {groupTab === 'expenses' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {expenses.length === 0 ? (
                                            <div className="glass-sm" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <List size={24} style={{ opacity: 0.2, margin: '0 auto 8px' }} />
                                                <p style={{ fontSize: 13 }}>No expenses recorded yet.</p>
                                            </div>
                                        ) : (
                                            expenses.map(e => (
                                                <div key={e._id} className="glass-sm" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Wallet size={18} color="var(--primary)" />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.description}</div>
                                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                            Paid by <span style={{ color: 'var(--text)', fontWeight: 500 }}>{e.paidBy?.name}</span> • {e.splitType === 'equal' ? 'Split equally' : 'Custom split'}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 16 }}>{fmt(e.amount)}</div>
                                                        <button onClick={() => deleteExpense(e._id)} title="Delete record"
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', padding: 4, cursor: 'pointer', opacity: 0.7, marginTop: 4 }}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div className="fade-in">
                                        {simplified.length === 0 ? (
                                            <div className="glass-sm" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <RefreshCw size={32} style={{ opacity: 0.2, margin: '0 auto 12px' }} className="spin-slow" />
                                                <p style={{ fontSize: 14 }}>Debts are fully balanced or optimization requested.</p>
                                                <button className="btn-primary" onClick={simplify} style={{ marginTop: 16, padding: '8px 16px', fontSize: 12 }}>Run Optimization</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#059669', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <CheckCircle size={18} />
                                                    <span>Optimized! All debts can be settled in {simplified.length} transaction(s).</span>
                                                </div>
                                                {simplified.map((s, i) => (
                                                    <div key={i} className="glass-sm" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                            <div style={{ textAlign: 'center' }}>
                                                                <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Payer</div>
                                                                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.from?.name}</div>
                                                            </div>
                                                            <ArrowRight size={20} color="var(--text-muted)" style={{ margin: '0 8px' }} />
                                                            <div style={{ textAlign: 'center' }}>
                                                                <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Receiver</div>
                                                                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.to?.name}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontWeight: 900, color: '#f59e0b', fontSize: 20 }}>{fmt(s.amount)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════ TAB: ALL TRANSACTIONS ═══════ */}
            {tab === 'all' && (
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <SectionHeader title="Global Activity Feed" />
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} /> Group</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} /> Personal</span>
                        </div>
                    </div>

                    {allItems.length === 0 ? (
                        <div className="glass" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <List size={48} style={{ opacity: 0.15, margin: '0 auto 16px' }} />
                            <p style={{ fontSize: 15 }}>No activity found yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {allItems.map((item, i) => {
                                const isDirect = item._source === 'direct';
                                const iOwe = isDirect && item.from?._id === user?._id;
                                return (
                                    <div key={item._id + i} className="glass-sm"
                                        onClick={() => fetchTxDetails(item._id, item._source)}
                                        style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: isDirect ? 'rgba(99,102,241,0.08)' : 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isDirect ? <UserCircle2 size={20} color="#6366f1" /> : <Users size={20} color="var(--primary)" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{item.description}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                                {isDirect
                                                    ? (iOwe ? `Transaction with ${item.to?.name}` : `Transaction with ${item.from?.name}`)
                                                    : `Shared expense • Paid by ${item.paidBy?.name}`}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, fontSize: 16, color: isDirect ? (iOwe ? '#ef4444' : '#10b981') : 'var(--primary)' }}>
                                                {isDirect && iOwe ? '-' : ''}{fmt(item.amount)}
                                            </div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4, fontWeight: 700 }}>{isDirect ? 'Direct' : 'Group'}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Transaction Details Modal */}
            {viewTx && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="glass fade-in" style={{ width: '100%', maxWidth: 500, padding: 32, position: 'relative' }}>
                        <button onClick={() => setViewTx(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wallet size={24} color="#10b981" />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 800, fontSize: 18 }}>Transaction Detail</h3>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {viewTx._id}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Description</div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{viewTx.description}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Amount</div>
                                <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>{fmt(viewTx.amount)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Date</div>
                                <div style={{ fontSize: 14 }}>{new Date(viewTx.createdAt).toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Status</div>
                                <div style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: viewTx.settled ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: viewTx.settled ? '#10b981' : '#ef4444' }}>
                                    {viewTx.settled ? '✓ SETTLED' : '⚠ PENDING'}
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Participants</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {viewTx.from ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{viewTx.from?.name[0]}</div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{viewTx.from?.name} (Payer)</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{viewTx.from?.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>{viewTx.to?.name[0]}</div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{viewTx.to?.name} (Receiver)</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{viewTx.to?.email}</div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{viewTx.paidBy?.name[0]}</div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{viewTx.paidBy?.name} (Paid full amount)</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{viewTx.paidBy?.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Split among: {viewTx.splitAmong?.map(m => m.name).join(', ')}</div>
                                    </>
                                )}
                            </div>
                        </div>

                        <button className="btn-primary" onClick={() => setViewTx(null)} style={{ width: '100%', justifyContent: 'center' }}>Close Details</button>
                    </div>
                </div>
            )}
        </div>
    );
}
