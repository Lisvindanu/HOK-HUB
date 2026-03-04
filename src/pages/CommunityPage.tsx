import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { fetchPosts, createPost, deletePost, toggleLike, type Post, type PostType } from '../api/community';
import { useNavigate } from '@tanstack/react-router';

// ─── helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  dev:        { label: 'Dev Update',  color: '#fcd34d', bg: 'rgba(120,90,10,0.35)' },
  build:      { label: 'Build',       color: '#60a5fa', bg: 'rgba(30,60,120,0.35)' },
  strategy:   { label: 'Strategy',    color: '#34d399', bg: 'rgba(10,80,50,0.35)' },
  discussion: { label: 'Discussion',  color: '#a78bfa', bg: 'rgba(60,30,100,0.35)' },
};

const TABS: { key: string; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'dev',        label: 'Dev Updates' },
  { key: 'build',      label: 'Build' },
  { key: 'strategy',   label: 'Strategy' },
  { key: 'discussion', label: 'Discussion' },
];

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

// ─── NewPostModal ─────────────────────────────────────────────────────────────

function NewPostModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Post) => void }) {
  const { token } = useAuth();
  const [type, setType] = useState<PostType>('discussion');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().replace(/^#/, '');
      if (t && !tags.includes(t) && tags.length < 5) {
        setTags([...tags, t]);
        setTagInput('');
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const post = await createPost({ type, title, content, tags }, token);
      onCreated(post);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }

  const typeList: { value: PostType; label: string }[] = [
    { value: 'discussion', label: 'Discussion' },
    { value: 'build',      label: 'Build' },
    { value: 'strategy',   label: 'Strategy' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 p-6"
        style={{ background: 'linear-gradient(135deg, #0d1f35, #101c2e)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">New Post</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {typeList.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
                style={
                  type === t.value
                    ? { background: TYPE_META[t.value].bg, color: TYPE_META[t.value].color, borderColor: TYPE_META[t.value].color + '80' }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Post title..."
            maxLength={120}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your post content..."
            rows={6}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm resize-none"
          />

          {/* Tags */}
          <div>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-900/40 text-blue-300 border border-blue-500/30">
                  #{t}
                  <button type="button" onClick={() => setTags(tags.filter(x => x !== t))} className="text-blue-400/60 hover:text-blue-300">×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tags (press Enter)..."
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onLike,
  onDelete,
  currentUserId,
}: {
  post: Post;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  currentUserId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[post.type] ?? TYPE_META.discussion;
  const isOwn = currentUserId && post.author_id !== null && String(post.author_id) === currentUserId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 overflow-hidden"
      style={{
        background: post.is_dev
          ? 'linear-gradient(135deg, rgba(18,14,5,0.95), rgba(25,18,4,0.95))'
          : 'linear-gradient(135deg, rgba(10,20,38,0.95), rgba(8,16,30,0.95))',
        borderColor: post.is_dev ? 'rgba(252,211,77,0.2)' : post.is_pinned ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Dev update banner */}
      {post.is_dev && (
        <div className="px-5 py-1.5 flex items-center gap-2 border-b border-yellow-500/20"
          style={{ background: 'rgba(120,90,10,0.25)' }}>
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-yellow-400 text-xs font-semibold tracking-wide uppercase">Dev Update</span>
        </div>
      )}
      {/* Pinned banner */}
      {post.is_pinned && !post.is_dev && (
        <div className="px-5 py-1 flex items-center gap-2 border-b border-blue-500/20"
          style={{ background: 'rgba(30,60,120,0.25)' }}>
          <span className="text-blue-300 text-xs">📌</span>
          <span className="text-blue-300 text-xs font-medium">Pinned</span>
        </div>
      )}

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border border-white/10"
            style={{ background: 'rgba(40,60,100,0.6)', color: '#93c5fd' }}
          >
            {initials(post.author_name)}
          </div>

          <div className="flex-1 min-w-0">
            {/* Author + meta row */}
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className="text-white/70 text-sm font-medium">{post.author_name ?? 'Anonymous'}</span>
              <span className="text-white/25 text-xs">·</span>
              <span className="text-white/35 text-xs">{timeAgo(post.created_at)}</span>
              {/* Type badge */}
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ color: meta.color, background: meta.bg }}
              >
                {meta.label}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-white font-semibold text-base leading-snug mb-2">{post.title}</h3>

            {/* Content preview / full */}
            <div
              className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap"
              style={{ maxHeight: expanded ? 'none' : '4.5rem', overflow: 'hidden' }}
            >
              {post.content}
            </div>
            {post.content.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-blue-400 text-xs hover:text-blue-300 transition-colors"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {post.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-blue-900/30 text-blue-300/70 border border-blue-500/20">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom row — actions */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
          {/* Like */}
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: post.liked ? '#f87171' : 'rgba(255,255,255,0.35)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span>{post.likes}</span>
          </button>

          <div className="flex-1" />

          {/* Delete (own posts) */}
          {isOwn && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-xs text-white/20 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── CommunityPage ────────────────────────────────────────────────────────────

export function CommunityPage() {
  const { isAuthenticated, token, contributorId } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPosts({ type: activeTab });
      setPosts(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  async function handleLike(id: number) {
    const result = await toggleLike(id);
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, liked: result.liked, likes: result.liked ? p.likes + 1 : Math.max(p.likes - 1, 0) }
          : p
      )
    );
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id, token);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch {/* ignore */}
  }

  function handleCreated(_post: Post) {
    // Re-fetch to include the joined author_name
    load();
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #070f1d, #091828 60%, #07111e)' }}>
      {/* Hero header */}
      <div
        className="relative border-b border-white/5 px-6 py-10 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(10,25,55,0.8), rgba(5,15,35,0.9))' }}
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1d7fd4 0%, transparent 70%)' }} />
        <h1 className="relative text-3xl font-bold text-white tracking-tight">Community Board</h1>
        <p className="relative text-white/45 mt-1 text-sm max-w-lg mx-auto">
          Share builds, strategies, and discussions with other players
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Tab bar + New Post button */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <div className="flex flex-1 flex-wrap gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
                style={
                  activeTab === tab.key
                    ? { background: 'rgba(29,127,212,0.3)', color: '#93c5fd', borderColor: 'rgba(29,127,212,0.5)' }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.1)' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              <span>New Post</span>
            </button>
          ) : (
            <button
              onClick={() => navigate({ to: '/auth' })}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-400 border border-blue-500/30 hover:border-blue-500/60 transition-colors"
            >
              Login to post
            </button>
          )}
        </div>

        {/* Post list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  currentUserId={contributorId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <NewPostModal
            onClose={() => setShowNewPost(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
