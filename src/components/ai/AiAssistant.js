/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SUGGESTIONS = [
  "Best areas to buy under ₹50L in Chandigarh?",
  "How do I calculate home loan EMI?",
  "What is RERA and how does it protect buyers?",
  "What are red flags in a property deal?",
  "What are stamp duty rates in Punjab/Haryana?",
];

export default function AIAssistant({ propertyContext = null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const updated = [...messages, { role: "user", text: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      const history = updated.slice(0, -1);
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, propertyContext }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.reply || "Sorry, I couldn't process that." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-90 bg-[#0b1120]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">NestIQ Assistant</p>
                <p className="text-indigo-200 text-xs">AI real estate guide</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3 p-4 overflow-y-auto min-h-55 max-h-85 custom-scrollbar">
            {messages.length === 0 && (
              <>
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3">
                  <p className="text-sm text-indigo-200">
                    👋 Hi! I'm your NestIQ AI guide — ask me anything about buying, renting, or investing in property across India.
                  </p>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Try asking…
                </p>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="text-left text-xs text-indigo-300 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors leading-relaxed"
                  >
                    {s}
                  </button>
                ))}
              </>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white/10 text-slate-200 rounded-bl-sm prose prose-invert prose-p:text-slate-200 prose-sm"
                    }`}
                >
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1 items-center">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about properties in India…"
              className="flex-1 text-sm border border-white/10 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white/5 text-white placeholder-slate-400"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/10 disabled:text-slate-500 flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 text-current" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all text-white ${open
          ? "bg-white/10 hover:bg-white/20 border border-white/10"
          : "bg-linear-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/25 hover:shadow-xl"
          }`}
      >
        {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        {!open && <span className="text-sm font-medium">AI Assistant</span>}
      </button>
    </div>
  );
}