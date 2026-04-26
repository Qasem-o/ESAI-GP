import { useEffect, useState } from 'react';
import { Trash2, MessageSquare, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { API_BASE_URL, getHeaders } from '../../services/apiConfig';

interface PostRow {
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

interface CommentRow {
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
}

export function CommunityManagement() {
  const [posts, setPosts]       = useState<PostRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [tab, setTab]           = useState<'posts' | 'comments'>('posts');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/admin/community/posts?limit=100`,    { headers: getHeaders(true) }).then(r => r.json()),
      fetch(`${API_BASE_URL}/admin/community/comments?limit=200`, { headers: getHeaders(true) }).then(r => r.json()),
    ])
      .then(([p, c]) => { setPosts(p); setComments(c); setLoading(false); })
      .catch(() => { setError('Failed to load community data.'); setLoading(false); });
  };

  useEffect(fetchAll, []);

  const deletePost = async (id: number) => {
    if (!confirm('Delete this post? All its comments will also be deleted.')) return;
    await fetch(`${API_BASE_URL}/admin/community/posts/${id}`, { method: 'DELETE', headers: getHeaders(true) });
    fetchAll();
  };

  const deleteComment = async (id: number) => {
    if (!confirm('Delete this comment?')) return;
    await fetch(`${API_BASE_URL}/admin/community/comments/${id}`, { method: 'DELETE', headers: getHeaders(true) });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Community Management</h1>
        <p className="text-muted-foreground mt-1">Moderate posts and comments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['posts', 'comments'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize
              ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {t === 'posts' ? `Posts (${posts.length})` : `Comments (${comments.length})`}
          </button>
        ))}
        <Button variant="ghost" size="sm" onClick={fetchAll} className="ml-auto gap-1">
          <RefreshCw className="w-3 h-3" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-destructive bg-destructive/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : tab === 'posts' ? (
        <div className="space-y-3">
          {posts.map(p => (
            <div key={p.post_id} className="rounded-xl border bg-card p-4 shadow-sm flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">
                  User #{p.user_id} · {new Date(p.created_at.endsWith('Z') || p.created_at.includes('+') ? p.created_at : p.created_at + 'Z').toLocaleString()} · ❤️ {p.likes_count} · 💬 {p.comments_count}
                </p>
                <p className="text-sm line-clamp-3">{p.content}</p>
              </div>
              <Button
                variant="ghost" size="sm"
                onClick={() => deletePost(p.post_id)}
                className="flex-shrink-0 h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {posts.length === 0 && <p className="text-center py-12 text-muted-foreground">No posts found</p>}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Comment</th>
                <th className="px-4 py-3 text-left font-medium">Post ID</th>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {comments.map(c => (
                <tr key={c.comment_id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs truncate">{c.content}</td>
                  <td className="px-4 py-3 text-muted-foreground">#{c.post_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">#{c.user_id}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.created_at.endsWith('Z') || c.created_at.includes('+') ? c.created_at : c.created_at + 'Z').toLocaleString()}</td>
                  <td className="px-4 py-3 flex justify-center">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => deleteComment(c.comment_id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No comments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
