"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "../../lib/pusherClient";
import { MessageCircle, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import SafeImage from "../common/SafeImage";

export default function ChatInbox({ onSelectConversation, selectedId }) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    fetch("/api/chat/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Subscribe to each conversation for live last-message updates
  useEffect(() => {
    if (!conversations.length || !session) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelNames = conversations.map((c) => {
      const channelName = `conversation-${c._id}`;
      const ch = pusher.subscribe(channelName);

      const handleNewMessage = (msg) => {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv._id !== c._id) return conv;
            const isMine = msg.sender?._id === session.user.id || msg.sender === session.user.id;
            const isOpen = selectedIdRef.current === c._id;
            return {
              ...conv,
              lastMessage: msg.text,
              lastMessageAt: msg.createdAt,
              buyerUnread:
                !isMine && !isOpen && conv.buyer?._id === session.user.id
                  ? (conv.buyerUnread || 0) + 1
                  : conv.buyerUnread,
              sellerUnread:
                !isMine && !isOpen && conv.seller?._id === session.user.id
                  ? (conv.sellerUnread || 0) + 1
                  : conv.sellerUnread,
            };
          })
        );
      };

      ch.bind("new-message", handleNewMessage);

      // Store the handler on the channel instance so we can unbind it later easily
      ch._inboxHandler = handleNewMessage;

      return channelName;
    });

    return () => {
      channelNames.forEach((name) => {
        const ch = pusher.channel(name);
        if (ch && ch._inboxHandler) {
          ch.unbind("new-message", ch._inboxHandler);
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.map(c => c._id).join(","), session]);

  // Separate effect for user-level channel subscription
  useEffect(() => {
    if (!session?.user?.id) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const userCh = pusher.subscribe(`user-${session.user.id}`);
    userCh.bind("chat-update", () => {
      fetch("/api/chat/conversations")
        .then((r) => r.json())
        .then((data) => setConversations(Array.isArray(data) ? data : []));
    });

    return () => {
      userCh.unbind_all();
      pusher.unsubscribe(`user-${session.user.id}`);
    };
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="text-center py-10 px-4">
        <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-400">No conversations yet</p>
        <Link href="/properties" className="text-indigo-400 text-xs hover:underline mt-1 inline-block">
          Browse properties →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/10">
      {conversations.map((c) => {
        const userId = session?.user?.id;
        const isBuyer = c.buyer?._id?.toString() === userId || c.buyer === userId;
        const other = isBuyer ? c.seller : c.buyer;
        const unread = isBuyer ? c.buyerUnread : c.sellerUnread;
        const isActive = selectedId === c._id;

        return (
          <button
            key={c._id}
            onClick={() => {
              onSelectConversation(c);
              // Optimistically clear the unread counter for the selected conversation
              setConversations((prev) =>
                prev.map((conv) =>
                  conv._id === c._id
                    ? { ...conv, buyerUnread: 0, sellerUnread: 0 }
                    : conv
                )
              );
            }}
            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-indigo-500/10 transition ${isActive ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""
              }`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 overflow-hidden">
              {other?.avatar ? (
                <SafeImage src={other.avatar} alt={other.name || ""} width={40} height={40} fallbackType="avatar" fallbackClassName="bg-indigo-500/20 text-indigo-400" className="rounded-full object-cover" />
              ) : (
                <span className="text-indigo-400 font-bold text-sm">{other?.name?.[0] || "?"}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-slate-400 truncate">{other?.name || "Unknown"}</p>
                <span className="text-[11px] text-slate-400 shrink-0 ml-1">
                  {new Date(c.lastMessageAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-slate-400 truncate max-w-37.5">
                  {c.lastMessage || "No messages yet"}
                </p>
                {unread > 0 && (
                  <span className="bg-violet-600 text-white text-[11px] font-medium rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Home className="w-3 h-3 text-slate-400" />
                <p className="text-[11px] text-slate-400 truncate">{c.property?.address?.locality}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
