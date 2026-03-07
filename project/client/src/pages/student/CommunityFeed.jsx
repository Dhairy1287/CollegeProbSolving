import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Rss, Heart, MessageCircle, Repeat2, Trophy, Upload, Send, Plus, Star, Edit2, Trash2 } from 'lucide-react';

const TYPES = ['post', 'doubt', 'note', 'announcement', 'resource', 'discussion', 'event'];
const typeColors = {
    post: '#6366f1', doubt: '#ef4444', note: '#10b981', announcement: '#f59e0b',
    resource: '#8b5cf6', discussion: '#0d9488', event: '#ec4899', discussion: '#0d9488'
};
const typeIcons = {
    post: '📝', doubt: '❓', note: '📓', announcement: '📢',
    resource: '📚', discussion: '💬', event: '🎉'
};

export default function CommunityFeed() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [posts, setPosts] = useState([]);
    const [tab, setTab] = useState('feed'); // feed | leaderboard
    const [postType, setPostType] = useState('post');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [expandedPost, setExpandedPost] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingPost, setEditingPost] = useState(null); // { id, content }

    const fetchPosts = async () => {
        const { data } = await api.get('/posts');
        setPosts(data.posts);
    };
    const fetchLeaderboard = async () => {
        const { data } = await api.get('/posts/leaderboard');
        setLeaderboard(data.leaderboard);
    };

    useEffect(() => { fetchPosts(); }, []);

    const createPost = async () => {
        if (!content.trim()) return;
        setLoading(true);
        const fd = new FormData();
        fd.append('content', content); fd.append('type', postType);
        files.forEach(f => fd.append('attachments', f));
        await api.post('/posts', fd);
        setContent(''); setFiles([]); fetchPosts(); setLoading(false);
    };

    const toggleLike = async (id) => {
        await api.patch(`/posts/${id}/like`);
        setPosts(p => p.map(post => post._id === id ? { ...post, likes: post.likes.includes(user._id) ? post.likes.filter(l => l !== user._id) : [...post.likes, user._id] } : post));
    };

    const addComment = async (id) => {
        if (!comment.trim()) return;
        await api.post(`/posts/${id}/comment`, { content: comment });
        setComment(''); fetchPosts();
    };

    const markAsSolution = async (postId, commentId) => {
        if (!window.confirm('Mark this as the solution? The solver will be awarded 10 points.')) return;
        try {
            await api.patch(`/posts/${postId}/solve`, { commentId });
            fetchPosts();
        } catch (err) { console.error(err); }
    };

    const deletePost = async (id) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.delete(`/posts/${id}`);
            fetchPosts();
        } catch (err) { console.error(err); }
    };

    const updatePost = async () => {
        if (!editingPost.content.trim()) return;
        try {
            await api.patch(`/posts/${editingPost.id}`, { content: editingPost.content });
            setEditingPost(null);
            fetchPosts();
        } catch (err) { console.error(err); }
    };

    const repost = async (id) => {
        try {
            await api.post('/posts', { repostOf: id, content: 'Check this out!', type: 'post' });
            fetchPosts();
            alert('Post reposted!');
        } catch (err) { console.error(err); }
    };


    return (
        <div style={{ padding: '32px 0', maxWidth: 780, margin: '0 auto' }} className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Rss size={22} color="#ec4899" /> Community Feed
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['feed', 'leaderboard'].map(t => (
                        <button key={t} onClick={() => { setTab(t); if (t === 'leaderboard') fetchLeaderboard(); }}
                            className={tab === t ? 'btn-primary' : 'btn-secondary'} style={{ padding: '7px 14px', fontSize: 12, textTransform: 'capitalize' }}>{t}</button>
                    ))}
                </div>
            </div>

            {tab === 'feed' && (
                <>
                    {/* Create post */}
                    <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                            {TYPES.filter(t => {
                                if (user.role === 'student') return ['post', 'doubt', 'note'].includes(t);
                                if (user.role === 'faculty') return ['announcement', 'resource', 'discussion', 'event'].includes(t);
                                return true;
                            }).map(t => (
                                <button key={t} onClick={() => setPostType(t)}
                                    className={postType === t ? 'btn-primary' : 'btn-secondary'}
                                    style={{ padding: '5px 12px', fontSize: 12, textTransform: 'capitalize' }}>
                                    {typeIcons[t]} {t}
                                </button>
                            ))}
                        </div>
                        <textarea className="input" rows={3} placeholder={`Share a ${postType}...`} value={content}
                            onChange={e => setContent(e.target.value)} style={{ resize: 'none', marginBottom: 12 }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
                                <Upload size={14} />
                                {files.length ? `${files.length} file(s)` : 'Attach files'}
                                <input type="file" multiple hidden onChange={e => setFiles(Array.from(e.target.files))} />
                            </label>
                            <button className="btn-primary" onClick={createPost} disabled={loading || !content.trim()} style={{ padding: '8px 18px', fontSize: 13 }}>
                                <Send size={12} /> {loading ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>

                    {/* Posts */}
                    {posts.map(post => (
                        <div key={post._id} className="glass" style={{ padding: 20, marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                                <div style={{ width: 38, height: 38, borderRadius: '50%', background: post.author?.role === 'faculty' ? 'linear-gradient(135deg, #0d9488, #16a34a)' : 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0, border: post.author?.role === 'faculty' ? '2px solid #fff' : 'none', boxShadow: post.author?.role === 'faculty' ? '0 0 0 2px #10b981' : 'none' }}>
                                    {post.author?.name?.[0]?.toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 700, fontSize: 14, color: post.author?.role === 'faculty' ? '#065f46' : 'var(--text)' }}>
                                            {post.author?.name}
                                            {post.author?.role === 'faculty' && <span style={{ marginLeft: 6, fontSize: 10, background: '#10b981', color: 'white', padding: '1px 6px', borderRadius: 4, verticalAlign: 'middle' }}>FACULTY</span>}
                                        </span>
                                        <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: `${typeColors[post.type]}20`, color: typeColors[post.type], display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {typeIcons[post.type]} {post.type}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⭐ {post.author?.helpfulnessScore || 0} pts</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {post.author?.role}</span>
                                    </div>
                                </div>
                                {(post.author?._id === user._id || user.role === 'admin') && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => setEditingPost({ id: post._id, content: post.content })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={14} /></button>
                                        <button onClick={() => deletePost(post._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                                    </div>
                                )}
                            </div>
                            {editingPost?.id === post._id ? (
                                <div style={{ marginBottom: 14 }}>
                                    <textarea className="input" value={editingPost.content} onChange={e => setEditingPost(p => ({ ...p, content: e.target.value }))} style={{ marginBottom: 8 }} />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn-primary" onClick={updatePost} style={{ padding: '5px 12px', fontSize: 12 }}>Save</button>
                                        <button className="btn-secondary" onClick={() => setEditingPost(null)} style={{ padding: '5px 12px', fontSize: 12 }}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14, whiteSpace: 'pre-wrap' }}>{post.content}</p>
                            )}

                            {post.attachments?.length > 0 && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                    {post.attachments.map((a, i) => (
                                        <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="tag" style={{ textDecoration: 'none' }}>{a.filename}</a>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 18, fontSize: 13, color: 'var(--text-muted)' }}>
                                <button onClick={() => toggleLike(post._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: post.likes?.includes(user._id) ? '#ef4444' : 'var(--text-muted)', fontSize: 13 }}>
                                    <Heart size={14} fill={post.likes?.includes(user._id) ? '#ef4444' : 'none'} /> {post.likes?.length || 0}
                                </button>
                                <button onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13 }}>
                                    <MessageCircle size={14} /> {post.comments?.length || 0}
                                </button>
                                <button onClick={() => repost(post._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13 }}>
                                    <Repeat2 size={14} /> {post.reposts?.length || 0}
                                </button>
                            </div>

                            {expandedPost === post._id && (
                                <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                                    {post.comments?.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                                {c.author?.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1, background: 'rgba(99,102,241,0.05)', borderRadius: 8, padding: '8px 12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                                    <span style={{ fontWeight: 600, fontSize: 12 }}>{c.author?.name}</span>
                                                    {post.type === 'doubt' && post.author?._id === user._id && !post.solved && (
                                                        <button onClick={() => markAsSolution(post._id, c._id)}
                                                            className="badge badge-success" style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Star size={10} fill="currentColor" /> Mark Solution
                                                        </button>
                                                    )}
                                                    {post.solutionCommentId === c._id && (
                                                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Star size={10} fill="currentColor" /> Solution
                                                        </span>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.content}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                        <input className="input" placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} style={{ fontSize: 13 }} />
                                        <button className="btn-primary" onClick={() => addComment(post._id)} style={{ padding: '9px 14px', flexShrink: 0 }}><Send size={12} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}

            {tab === 'leaderboard' && (
                <div>
                    <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Trophy size={18} color="#f59e0b" /> Helpfulness Leaderboard</h3>
                    {leaderboard.map((u, i) => (
                        <div key={u._id} className="glass hover-card" style={{ padding: '14px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: i < 3 ? ['#fbbf24', '#94a3b8', '#d97706'][i] : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: i < 3 ? 'white' : 'var(--text-muted)', flexShrink: 0 }}>
                                {i + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>{u.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.department} • Batch {u.batch}</div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 16, color: '#f59e0b' }}>{u.helpfulnessScore} ⭐</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
