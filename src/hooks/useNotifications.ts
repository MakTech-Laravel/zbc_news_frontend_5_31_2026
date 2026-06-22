// src/hooks/useNotifications.ts
import { useEffect } from 'react';
import echo from '@/lib/echo';
import toast from 'react-hot-toast';

interface Notification {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
}

export function useNotifications(userId: number | undefined) {
    useEffect(() => {
        if (!userId) return;

        // Echo automatically prefixes 'private-' to the channel name
        const channel = echo.private(`notifications.${userId}`);

        channel.listen('.NotificationSent', (event: Notification) => {
            toast(event.message, { icon: event.type === 'success' ? '✅' : '🔔' });
        });

        return () => {
            echo.leaveChannel(`private-notifications.${userId}`);
        };
    }, [userId]);
}