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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage accounts, roles, and platform access control</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-10 pr-4 h-10 w-full border rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-destructive bg-destructive/5 border-l-4 border-destructive p-4 rounded-r-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> 
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-lg font-semibold text-foreground">Registered Users</h2>
            <div className="text-sm text-muted-foreground">{filtered.length} users found</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">User</th>
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Status</th>
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Role</th>
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Joined Date</th>
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b">Last Login</th>
                  <th className="font-medium text-xs text-muted-foreground uppercase tracking-wider py-3 px-5 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(u => (
                  <tr key={u.user_id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-5">
                      <div>
                        <p className="font-semibold text-foreground">{u.full_name || u.username}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{u.email} <span className="opacity-50">(@{u.username})</span></p>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${u.is_active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground border'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-foreground text-foreground">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-5 text-muted-foreground">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="sm"
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                          onClick={() => patch(u.user_id, { is_active: !u.is_active })}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          title={u.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                          onClick={() => patch(u.user_id, { is_admin: !u.is_admin })}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          {u.is_admin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          title="Delete User"
                          onClick={() => deleteUser(u.user_id, u.username)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      No users found matching "{query}"
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
