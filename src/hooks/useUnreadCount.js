"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useUnreadCount() {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!session) return;

    async function fetchCount() {
      try {
        const res = await fetch("/api/chat/unread");
        const data = await res.json();
        setCount(data.count || 0);
      } catch { }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, [session]);

  return count;
}