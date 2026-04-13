"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "../../../lib/pusherClient";
import ChatInbox from "../../../components/chat/ChatInbox";
import { Send, MessageCircle, Loader2 } from "lucide-react";

export default function ChatPage() {
  const { data: session } = useSession();
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  async function selectConversation(convo) {
    setSelected(convo);
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/conversations/${convo._id}`);
      const msgs = await res.json();
      setMessages(Array.isArray(msgs) ? msgs : []);
    } finally {
      setLoading(false);
    }
  }

  // Pusher subscription for selected conversation
  useEffect(() => {
    if (!selected) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`conversation-${selected._id}`);
    channel.bind("new-message", (data) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`conversation-${selected._id}`);
    };
  }, [selected?._id]);

  // Scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || sending || !selected) return;
    setSending(true);


    const sentText = text.trim();
    setText("");

    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selected._id, text: sentText }),
    });
    setSending(false);
  }

  const userId = session?.user?.id;
  const other = selected
    ? selected.buyer?._id?.toString() === userId || selected.buyer === userId
      ? selected.seller
      : selected.buyer
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>

      <div
        className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden flex"
        style={{ height: "600px" }}
      >
        {/* Inbox sidebar */}
        <div className="w-72 border-r border-white/10 shrink-0 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h2 className="font-semibold text-slate-400 text-sm">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatInbox onSelectConversation={selectConversation} selectedId={selected?._id} />
          </div>
        </div>

        {/* Chat panel */}
        {selected ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <span className="text-indigo-300 font-bold text-sm">{other?.name?.[0] || "?"}</span>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{other?.name}</p>
                <p className="text-xs text-slate-400">{selected.property?.address?.locality}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 ">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-300" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageCircle className="w-10 h-10 mb-2 text-slate-400" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = msg.sender?._id?.toString?.() ?? "";
                  const isMe = senderId === userId || msg.sender === userId;

                  return (
                    <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[65%] px-4 py-2 rounded-2xl text-sm wrap-break-word ${isMe
                          ? "bg-indigo-500 text-white rounded-br-sm"
                          : "bg-white/5 text-slate-200 border border-white/10 shadow-sm rounded-bl-sm"
                          }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-indigo-300" : "text-slate-400"}`}>
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
            <form onSubmit={sendMessage} className="flex gap-2 px-4 py-3 border-t border-white/10 bg-[#0b1120]/50 shrink-0">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-sm rounded-full px-4 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/5 text-white focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-500/20 flex items-center justify-center text-white disabled:opacity-50 transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-16 h-16 text-slate-400 mb-4" />
            <p className="font-semibold text-slate-400">Select a conversation</p>
            <p className="text-sm text-slate-400 mt-1">Pick one from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}