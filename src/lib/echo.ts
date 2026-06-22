import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Required: make Pusher available globally for laravel-echo
(window as Window & { Pusher: typeof Pusher }).Pusher = Pusher;

// Import your existing axios instance
// Adjust the import path to match where your axios instance lives
import axiosInstance from './axios';

const echo = new Echo({
    broadcaster: 'reverb',

    // The public WS domain (from env)
    wsHost: import.meta.env.VITE_REVERB_HOST,

    // Port — 443 in production (Traefik handles SSL)
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),

    // App key must match backend REVERB_APP_KEY
    key: import.meta.env.VITE_REVERB_APP_KEY,

    // Force TLS since we're using wss:// in production
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'wss'
           || import.meta.env.VITE_REVERB_SCHEME === 'https',

    // Only use secure WebSocket transport
    enabledTransports: ['ws', 'wss'],

    // Disable Pusher stats (not needed for Reverb)
    disableStats: true,

    /*
     * CRITICAL for Passport Bearer auth on private channels.
     *
     * When Echo tries to subscribe to a private channel, it calls
     * this authorizer instead of the default fetch-based one.
     * We reuse your existing axios instance so the Bearer token
     * from sessionStorage is automatically attached.
     *
     * Echo will call: POST /api/v1/broadcasting/auth
     * with { socket_id, channel_name } in the body.
     * Your backend validates the Passport token and returns
     * a signed auth string that Reverb accepts.
     */
    authorizer: (channel: { name: string }) => ({
        authorize: (
            socketId: string,
            callback: (error: boolean, data: unknown) => void
        ) => {
            axiosInstance
                .post('/broadcasting/auth', {
                    socket_id:    socketId,
                    channel_name: channel.name,
                })
                .then((response) => {
                    callback(false, response.data);
                })
                .catch((error) => {
                    callback(true, error);
                });
        },
    }),
});

// Optional: connection event logging for debugging
if (import.meta.env.DEV) {
    echo.connector.pusher.connection.bind('connected', () => {
        console.log('[Echo] ✅ Connected to Reverb');
    });
    echo.connector.pusher.connection.bind('disconnected', () => {
        console.warn('[Echo] ❌ Disconnected from Reverb');
    });
    echo.connector.pusher.connection.bind('error', (err: unknown) => {
        console.error('[Echo] Error:', err);
    });
}

export default echo;