import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";

export function useNewsUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel("news-updates");

    channel.listen(
      ".NewsPublished",
      (event: {
        id: number;
        title: string;
        slug: string;
        category: string;
      }) => {
        console.log("New article published:", event.title);
        queryClient.invalidateQueries({ queryKey: ["articles"] });
      },
    );

    return () => {
      echo.leaveChannel("news-updates");
    };
  }, [queryClient]);
}
