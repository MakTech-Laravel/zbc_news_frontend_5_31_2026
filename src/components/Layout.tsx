// src/components/Layout.tsx
import { useNewsUpdates } from '@/hooks/useNewsUpdates';

export function Layout({ children }: { children: React.ReactNode }) {
    useNewsUpdates();

    return <>{children}</>;
}