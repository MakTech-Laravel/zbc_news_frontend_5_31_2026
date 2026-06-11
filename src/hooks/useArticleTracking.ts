import { useEffect, useRef } from "react";
// import { useAuth } from "@/auth/useAuth";

const MIN_READ_SECONDS = 5;

export const useArticleTracking = (articleId: number | undefined): void => {
  const startTime = useRef<number>(Date.now());
  const maxScroll = useRef<number>(0);
  const sessionId = useRef<string>(crypto.randomUUID());
  const hasSent = useRef<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight);
      const percent = Math.round(Math.min(scrolled * 100, 100));
      if (percent > maxScroll.current) maxScroll.current = percent;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sendTrackingData = () => {
    if (hasSent.current || !articleId) return;

    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    if (timeSpent < MIN_READ_SECONDS) return;

    hasSent.current = true;
    // const user = useAuth().user;

    const payload = JSON.stringify({
      article_id: articleId,
      session_id: sessionId.current,
      time_spent: timeSpent,
      scroll_depth: maxScroll.current,
    //   user_id: user?.id ?? null,
    });

    console.log('[Tracking] Sending payload →', payload);

    const TRACK_URL = "/api/v1/articles/track-read";

    const sent = navigator.sendBeacon(
      TRACK_URL,
      new Blob([payload], { type: "application/json" }),
    );

    console.log('[Tracking] sendBeacon result →', sent ? ' sent' : ' failed');

    if (!sent) {
      fetch(TRACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  };

  useEffect(() => {
    if (!articleId) return;

    hasSent.current = false;
    startTime.current = Date.now();
    maxScroll.current = 0;
    sessionId.current = crypto.randomUUID();

    console.log('[Tracking] Started for articleId →', articleId);

    const onVisibilityChange = () => {
      if (document.hidden) sendTrackingData();
    };

    window.addEventListener("beforeunload", sendTrackingData);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      sendTrackingData();
      window.removeEventListener("beforeunload", sendTrackingData);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [articleId]);
};
