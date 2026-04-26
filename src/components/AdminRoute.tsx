import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';

/**
 * AdminRoute - Wraps routes that require admin access.
 * Redirects non-authenticated users to /login.
 * Shows a 403 Forbidden page for authenticated non-admin users.
 */
export function AdminRoute() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user?.is_admin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <ShieldX className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold text-destructive">403 — Access Denied</h1>
                <p className="text-muted-foreground">You don't have admin privileges to view this page.</p>
            </div>
        );
    }

    return <Outlet />;
}
