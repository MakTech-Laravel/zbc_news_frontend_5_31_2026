// src/hooks/useNewsUpdates.ts
import { useEffect } from 'react';
import echo from '@/lib/echo';
import { useQueryClient } from '@tanstack/react-query';

export function useNewsUpdates() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = echo.channel('news-updates');

        channel.listen('.NewsPublished', (event: {
            id: number;
            title: string;
            slug: string;
            category: string;
        }) => {
            console.log('New article published:', event.title);

            // Invalidate your React Query cache to refetch
            queryClient.invalidateQueries({ queryKey: ['articles'] });
        });

        // Cleanup: leave channel on component unmount
        return () => {
            echo.leaveChannel('news-updates');
        };
    }, [queryClient]);
}