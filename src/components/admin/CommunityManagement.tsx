import { useEffect, useState } from 'react';
import { Trash2, MessageSquare, Loader2, AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Community Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderate user discussions, posts, and comments</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-muted/50 p-1 rounded-lg border w-fit">
          <button
            onClick={() => setTab('posts')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all
              ${tab === 'posts' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setTab('comments')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all
              ${tab === 'comments' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Comments ({comments.length})
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2 h-9">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-destructive bg-destructive/5 border-l-4 border-destructive p-4 rounded-r-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> 
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : tab === 'posts' ? (
        <div className="space-y-4">
          {posts.map(p => (
            <div key={p.post_id} className="rounded-lg border bg-card p-5 flex gap-5 items-start group">
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center border">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-foreground">User #{p.user_id}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.created_at.endsWith('Z') || p.created_at.includes('+') ? p.created_at : p.created_at + 'Z').toLocaleString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-4 leading-relaxed whitespace-pre-wrap">{p.content}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {p.likes_count}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {p.comments_count}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost" size="sm"
                onClick={() => deletePost(p.post_id)}
                className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 border rounded-lg bg-card/50">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">No posts found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5">Comment Content</th>
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5">Post ID</th>
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5">Author User ID</th>
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5">Date</th>
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comments.map(c => (
                  <tr key={c.comment_id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3 px-5 text-foreground max-w-md truncate" title={c.content}>{c.content}</td>
                    <td className="py-3 px-5 text-muted-foreground font-mono text-xs">#{c.post_id}</td>
                    <td className="py-3 px-5 text-foreground font-medium">#{c.user_id}</td>
                    <td className="py-3 px-5 text-xs text-muted-foreground">
                      {new Date(c.created_at.endsWith('Z') || c.created_at.includes('+') ? c.created_at : c.created_at + 'Z').toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => deleteComment(c.comment_id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {comments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-muted-foreground">
                      <MessageCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-20" />
                      No comments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
