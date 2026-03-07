import { useState } from 'react';
import { Calculator, Target, TrendingUp, Plus, Trash2 } from 'lucide-react';

export default function SPICalculator() {
    const [pastSPIs, setPastSPIs] = useState([{ sem: 1, spi: '' }]);
    const [targetCGPA, setTargetCGPA] = useState('');
    const [totalSems, setTotalSems] = useState('8');
    const [result, setResult] = useState(null);

    const addSem = () => setPastSPIs(p => [...p, { sem: p.length + 1, spi: '' }]);
    const removeSem = (i) => setPastSPIs(p => p.filter((_, idx) => idx !== i));
    const updateSPI = (i, val) => setPastSPIs(p => p.map((item, idx) => idx === i ? { ...item, spi: val } : item));

    const calculate = () => {
        const spis = pastSPIs.map(s => parseFloat(s.spi)).filter(s => !isNaN(s) && s >= 0 && s <= 10);
        if (!spis.length || !targetCGPA) return;

        const totalS = parseInt(totalSems);
        const completedS = spis.length;
        const remainingS = totalS - completedS;
        const currentCGPA = spis.reduce((s, v) => s + v, 0) / completedS;

        // Formula: targetCGPA = (currentCGPA * completed + requiredSPI * remaining) / total
        const requiredSPI = (parseFloat(targetCGPA) * totalS - currentCGPA * completedS) / remainingS;
        const isAchievable = requiredSPI <= 10;

        const roadmap = [];
        for (let s = 1; s <= remainingS; s++) {
            roadmap.push(`Semester ${completedS + s}: Target ≥ ${Math.min(10, requiredSPI).toFixed(2)} SPI`);
        }
        setResult({ currentCGPA: currentCGPA.toFixed(2), requiredSPI: requiredSPI.toFixed(2), isAchievable, remainingS, roadmap });
    };

    return (
        <div style={{ padding: 32, maxWidth: 700 }} className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Calculator size={22} color="#8b5cf6" /> SPI / CGPA Calculator
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>Plan the SPI you need in remaining semesters to hit your CGPA goal</p>

            <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Past SPIs</h4>
                {pastSPIs.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ width: 90, fontSize: 13, color: 'var(--text-muted)' }}>Semester {s.sem}</span>
                        <input className="input" type="number" min="0" max="10" step="0.01" placeholder="e.g. 8.5" value={s.spi}
                            onChange={e => updateSPI(i, e.target.value)} style={{ maxWidth: 140, fontSize: 13 }} />
                        <button onClick={() => removeSem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                    </div>
                ))}
                <button className="btn-secondary" onClick={addSem} style={{ padding: '7px 14px', fontSize: 12 }}><Plus size={12} /> Add Semester</button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Target CGPA</label>
                        <input className="input" type="number" min="0" max="10" step="0.01" placeholder="e.g. 8.0" value={targetCGPA} onChange={e => setTargetCGPA(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Total Semesters</label>
                        <select className="input" value={totalSems} onChange={e => setTotalSems(e.target.value)}>
                            {[6, 8, 10].map(n => <option key={n} value={n}>{n} Semesters</option>)}
                        </select>
                    </div>
                </div>

                <button className="btn-primary" onClick={calculate} style={{ marginTop: 18 }}>
                    <Target size={14} /> Calculate Roadmap
                </button>
            </div>

            {result && (
                <div className="glass fade-in" style={{ padding: 28 }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Your Academic Roadmap</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{result.currentCGPA}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current CGPA</div>
                        </div>
                        <div style={{ background: result.isAchievable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: result.isAchievable ? '#10b981' : '#ef4444' }}>{Math.min(10, parseFloat(result.requiredSPI)).toFixed(2)}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Required SPI per semester</div>
                        </div>
                    </div>

                    {!result.isAchievable && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: '#f87171' }}>
                            ⚠️ Achieving {targetCGPA} CGPA requires SPI &gt; 10, which is not possible. Consider reducing your target or working harder from now.
                        </div>
                    )}

                    <h5 style={{ fontWeight: 600, marginBottom: 12, color: 'var(--text-muted)' }}>Semester-by-Semester Roadmap</h5>
                    {result.roadmap.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(99,102,241,0.05)', borderRadius: 8, marginBottom: 8 }}>
                            <TrendingUp size={14} color="var(--primary)" />
                            <span style={{ fontSize: 13 }}>{r}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
