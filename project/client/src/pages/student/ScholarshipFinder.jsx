import { useState } from 'react';
import api from '../../utils/api';
import { GraduationCap, Search, ExternalLink, Filter } from 'lucide-react';

export default function ScholarshipFinder() {
    const [filters, setFilters] = useState({ category: 'general', income: '', gender: 'all', course: 'all', state: 'all' });
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const set = (k, v) => setFilters(p => ({ ...p, [k]: v }));

    const search = async () => {
        setLoading(true);
        const params = new URLSearchParams(filters).toString();
        const { data } = await api.get(`/scholarships?${params}`);
        setResults(data.scholarships); setSearched(true); setLoading(false);
    };

    const categories = ['general', 'obc', 'sc', 'st', 'minority', 'disabled'];
    const courses = ['all', 'engineering', 'medical', 'arts', 'commerce', 'science'];

    return (
        <div style={{ padding: 32, maxWidth: 900 }} className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <GraduationCap size={22} color="#06b6d4" /> Scholarship Finder
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>Find government, college, and private scholarships matching your profile</p>

            <div className="glass" style={{ padding: 24, marginBottom: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Category</label>
                        <select className="input" value={filters.category} onChange={e => set('category', e.target.value)} style={{ textTransform: 'uppercase', fontSize: 13 }}>
                            {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Annual Family Income (₹)</label>
                        <input className="input" type="number" placeholder="e.g. 300000" value={filters.income} onChange={e => set('income', e.target.value)} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Gender</label>
                        <select className="input" value={filters.gender} onChange={e => set('gender', e.target.value)}>
                            <option value="all">All</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Course</label>
                        <select className="input" value={filters.course} onChange={e => set('course', e.target.value)}>
                            {courses.map(c => <option key={c} value={c}>{c === 'all' ? 'All Courses' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>State</label>
                        <select className="input" value={filters.state} onChange={e => set('state', e.target.value)}>
                            <option value="all">All India</option>
                            <option value="maharashtra">Maharashtra</option>
                            <option value="northeast">North East</option>
                            <option value="gujarat">Gujarat</option>
                            <option value="rajasthan">Rajasthan</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="btn-primary" onClick={search} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                            <Search size={14} /> {loading ? 'Searching...' : 'Find Scholarships'}
                        </button>
                    </div>
                </div>
            </div>

            {searched && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 700 }}>Results</h3>
                        <span className="badge badge-primary">{results.length} found</span>
                    </div>
                    {results.length === 0 ? (
                        <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <GraduationCap size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                            No scholarships matched your criteria. Try broadening your filters.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {results.map(s => (
                                <div key={s.id} className="glass hover-card" style={{ padding: 22 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <div>
                                            <h4 style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>{s.name}</h4>
                                            <span className="badge badge-primary" style={{ fontSize: 11 }}>{s.provider}</span>
                                        </div>
                                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '7px 12px', fontSize: 12, textDecoration: 'none' }}>
                                            Apply <ExternalLink size={11} />
                                        </a>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 14, fontSize: 13 }}>
                                        <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: 8, padding: '8px 12px' }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Benefits</div>
                                            <div style={{ fontWeight: 600, color: '#10b981' }}>{s.benefits}</div>
                                        </div>
                                        <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: '8px 12px' }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Deadline</div>
                                            <div style={{ fontWeight: 600, color: '#f59e0b' }}>{s.deadline}</div>
                                        </div>
                                        <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: 8, padding: '8px 12px' }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Max Family Income</div>
                                            <div style={{ fontWeight: 600 }}>₹{s.eligibility.income.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    {s.source && (
                                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                📌 Source: <span style={{ fontWeight: 500 }}>{s.source}</span>
                                                {s.lastUpdated && <span style={{ marginLeft: 8, opacity: 0.7 }}>• Updated {s.lastUpdated}</span>}
                                            </div>
                                            <a href={s.link} target="_blank" rel="noopener noreferrer" className="btn-primary"
                                                style={{ padding: '7px 16px', fontSize: 12, textDecoration: 'none' }}>
                                                Apply Now <ExternalLink size={11} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
