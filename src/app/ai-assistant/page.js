"use client";

import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I am the NestIQ Real Estate Assistant. How can I help you regarding properties in Chandigarh, Punjab, or Haryana?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch response");

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "I'm sorry, I'm having trouble connecting right now. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-[#0b1120] text-slate-300 flex flex-col items-center py-6">
      <div className="w-full max-w-4xl px-4 flex flex-col h-full">

        <div className="flex items-center gap-4 mb-6 px-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/20 rounded-2xl ring-1 ring-indigo-500/30 shadow-inner">
            <Bot className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Real Estate AI Assistant</h1>
            <p className="text-slate-400 text-sm mt-1">Chat with our AI bot to get property insights and guidelines.</p>
          </div>
        </div>

        <div className="flex-1 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.3)]">

          {/* Chat Window */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'ai' ? 'items-start' : 'items-start flex-row-reverse'}`}>
                <div className={`p-3 shrink-0 rounded-2xl flex items-center justify-center ${m.role === 'ai' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {m.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] ${m.role === 'ai'
                  ? 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-sm'
                  : 'bg-indigo-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                  }`}>
                  {m.role === 'ai' ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#0b1120] prose-pre:border prose-pre:border-white/10 prose-headings:text-slate-200 prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 items-start animate-fade-in">
                <div className="p-3 shrink-0 rounded-2xl flex items-center justify-center bg-indigo-500/20 text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-slate-800/80 border border-white/5 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white/5 border-t border-white/10">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about properties..."
                className="w-full bg-[#0b1120] border border-white/10 text-white text-sm rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
