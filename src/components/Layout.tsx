// src/components/Layout.tsx
import { useNewsUpdates } from '@/hooks/useNewsUpdates';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/auth/useAuth'; // your existing auth hook

export function Layout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // Real-time news updates (public — always active)
    useNewsUpdates();

    // Real-time notifications (private — only when logged in)
    useNotifications(user?.id as number);

    return <>{children}</>;
}