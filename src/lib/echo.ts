import Echo from "laravel-echo";
import Pusher from "pusher-js";

import { getAccessToken } from "@/auth/token";
import { env } from "@/config/env";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: Echo<"reverb">;
  }
}

function resolveBroadcastAuthUrl(apiBaseUrl: string): string {
  const trimmed = apiBaseUrl.replace(/\/+$/, "");
  // Strip /api/vN suffix to get the root, then add /api/broadcasting/auth
  // apiBaseUrl = https://api.zbc-news.maktechlaravel.cloud/api/v1
  // root       = https://api.zbc-news.maktechlaravel.cloud
  // result     = https://api.zbc-news.maktechlaravel.cloud/api/broadcasting/auth
  const root = trimmed.replace(/\/api\/v\d+.*$/i, "");
  return `${root}/api/broadcasting/auth`;
}

let echoInstance: Echo<"reverb"> | null = null;

export function isReverbConfigured(): boolean {
  return Boolean(env.reverbAppKey && env.reverbHost);
}

export function getEcho(): Echo<"reverb"> | null {
  if (!isReverbConfigured()) {
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  window.Pusher = Pusher;

  // Handle all secure scheme variants
  const useTls =
    env.reverbScheme === "https" ||
    env.reverbScheme === "wss";

  const port = env.reverbPort ?? (useTls ? 443 : 8080);

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: env.reverbAppKey!,
    wsHost: env.reverbHost!,
    wsPort: port,
    wssPort: port,
    forceTLS: useTls,
    enabledTransports: ["ws", "wss"],
    authEndpoint: resolveBroadcastAuthUrl(env.apiBaseUrl),
    auth: {
      headers: {
        Accept: "application/json",
        // Token is read fresh on each auth call via getter
        get Authorization() {
          return `Bearer ${getAccessToken() ?? ""}`;
        },
      },
    },
  });

  window.Echo = echoInstance;

  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    delete window.Echo;
  }
}

export function subscribeToUserNotifications(
  userId: number | string,
  onNotification: (payload: Record<string, unknown>) => void,
): () => void {
  const echo = getEcho();
  if (!echo) {
    return () => undefined;
  }

  const channelName = `App.Models.User.${userId}`;
  const channel = echo.private(channelName);

  channel.listen(".notification.created", (payload: Record<string, unknown>) => {
    onNotification(payload);
  });

  return () => {
    echo.leave(channelName);
  };
}