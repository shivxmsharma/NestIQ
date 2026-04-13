"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "../../lib/pusherClient";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ChatWindow({ propertyId, onClose }) {
  const { data: session } = useSession();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Init: create or fetch conversation, then load messages
  useEffect(() => {
    if (!session) return;

    async function init() {
      try {
        const res = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId }),
        });
        const convo = await res.json();
        if (convo.error) { setLoading(false); return; }
        setConversation(convo);

        const msgRes = await fetch(`/api/chat/conversations/${convo._id}`);
        const msgs = await msgRes.json();
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [propertyId, session]);

  // Subscribe to Pusher channel for this conversation
  useEffect(() => {
    if (!conversation) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`conversation-${conversation._id}`);

    channel.bind("new-message", (data) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === data._id)) return prev; // dedupe
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`conversation-${conversation._id}`);
    };
  }, [conversation?._id]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || sending || !conversation) return;

    setSending(true);


    const sentText = text.trim();
    setText("");

    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversation._id, text: sentText }),
    });

    setSending(false);
  }

  // Determine the other party
  const other = conversation
    ? session?.user?.id === conversation.buyer?._id?.toString() ||
      session?.user?.id === conversation.buyer?._id
      ? conversation.seller
      : conversation.buyer
    : null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden"
      style={{ width: "360px", height: "480px" }}
    >
      {/* Header */}
      <div className="bg-indigo-500/10 border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {other?.avatar ? (
              <Image src={other.avatar} alt={other.name || ""} width={32} height={32} className="rounded-full object-cover" />
            ) : (
              <span className="text-white text-sm font-bold">{other?.name?.[0] || "?"}</span>
            )}
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">{other?.name || "Loading..."}</p>
            <p className="text-violet-200 text-xs truncate max-w-50">
              {conversation?.property?.address?.locality || "Property Chat"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 ">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <MessageCircle className="w-10 h-10 mb-2 text-slate-400" />
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const senderId = msg.sender?._id?.toString?.() ?? msg.sender?.toString?.() ?? "";
            const isMe = senderId === session?.user?.id;

            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-snug ${isMe
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-white/10 text-slate-200 border border-white/10 shadow-sm rounded-bl-sm"
                    }`}
                >
                  <p className="wrap-break-word">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-violet-300" : "text-slate-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 px-3 py-2.5 border-t border-white/10 bg-white/5 shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          disabled={loading || !conversation}
          className="flex-1 text-sm rounded-full px-4 py-2 bg-black/20 text-white placeholder-slate-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending || !conversation}
          className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}