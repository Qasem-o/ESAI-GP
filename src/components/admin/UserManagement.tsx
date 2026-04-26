import { useEffect, useState } from 'react';
import { Search, Trash2, ShieldCheck, ShieldOff, UserCheck, UserX, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { API_BASE_URL, getHeaders } from '../../services/apiConfig';

interface UserRow {
  user_id: number;
  username: string;
  full_name: string | null;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

export function UserManagement() {
  const [users, setUsers]   = useState<UserRow[]>([]);
  const [query, setQuery]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/admin/users?limit=200`, { headers: getHeaders(true) })
      .then(r => { if (!r.ok) throw new Error('Forbidden'); return r.json(); })
      .then(data => { setUsers(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(fetchUsers, []);

  const patch = async (userId: number, body: object) => {
    await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PATCH', headers: getHeaders(true), body: JSON.stringify(body),
    });
    fetchUsers();
  };

  const deleteUser = async (userId: number, username: string) => {
    if (!confirm(`Delete user "${username}"? This is irreversible.`)) return;
    await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE', headers: getHeaders(true),
    });
    fetchUsers();
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage accounts, roles, and access</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9 pr-4 py-2 w-full border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 text-destructive bg-destructive/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3 text-left font-medium">Last Login</th>
                  <th className="px-4 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(u => (
                  <tr key={u.user_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{u.full_name || u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email} (@{u.username})</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                        ${u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {u.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">User</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost" size="sm"
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                          onClick={() => patch(u.user_id, { is_active: !u.is_active })}
                          className="h-8 w-8 p-0"
                        >
                          {u.is_active ? <UserX className="w-4 h-4 text-amber-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          title={u.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                          onClick={() => patch(u.user_id, { is_admin: !u.is_admin })}
                          className="h-8 w-8 p-0"
                        >
                          {u.is_admin ? <ShieldOff className="w-4 h-4 text-orange-500" /> : <ShieldCheck className="w-4 h-4 text-blue-500" />}
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          title="Delete User"
                          onClick={() => deleteUser(u.user_id, u.username)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
