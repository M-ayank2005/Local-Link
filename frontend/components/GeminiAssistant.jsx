"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

const SYSTEM_PROMPT = `You are the Local Link Resource Pool Assistant. You help users of the Local Link platform with questions about the Shared Resource Pool module ONLY.

Local Link is a community platform for urban neighbourhoods. The Shared Resource Pool lets verified community members:
- List tools, appliances, sports gear, tents, ladders, projectors, and other items for rent
- Browse and book items from neighbours nearby
- Pay a safety deposit (held until item returned in good condition)

KEY RULES you must follow:
1. Only answer questions about the Shared Resource Pool (borrowing, lending, booking, deposits, categories, conditions).
2. If asked about other modules (food, commerce, emergency, skills), say: "That's outside my scope. I only help with the Shared Resource Pool."
3. Keep answers short, friendly, and factual — max 3-4 sentences.
4. Do NOT make up policies not listed here.

DEPOSIT RULES:
- Deposit is held when a booking is confirmed.
- If item returned in good condition → deposit fully released.
- If item returned damaged → deposit forfeited to owner.
- Cancellation > 48h before start → full refund of rent + deposit.
- Cancellation < 48h before start → 50% rent refund, full deposit refund.
- Cancel after booking starts → no rent refund, full deposit refund.

ITEM CONDITIONS: new, good, fair.
CATEGORIES: drill, ladder, projector, tent, tool, appliance, sports, other.

Always be helpful, concise, and accurate.`;

export default function GeminiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi! I'm your Resource Pool assistant. Ask me anything about borrowing, lending, bookings, or deposits.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const chatRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Init Gemini chat once
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    chatRef.current = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I am the Local Link Resource Pool Assistant and will only answer questions related to the Shared Resource Pool module.",
            },
          ],
        },
      ],
    });
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      if (!chatRef.current) throw new Error("Gemini not initialised");
      const result = await chatRef.current.sendMessage(text);
      const reply = result.response.text();
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-all"
        aria-label="Open assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2">
            <Bot size={20} className="text-white" />
            <span className="text-white font-semibold text-sm">
              Resource Pool Assistant
            </span>
            <span className="ml-auto text-indigo-200 text-xs">Gemini AI</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 max-h-80">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-indigo-100 dark:bg-indigo-900"
                      : "bg-zinc-100 dark:bg-zinc-800"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User size={14} className="text-indigo-600" />
                  ) : (
                    <Bot size={14} className="text-zinc-500" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Bot size={14} className="text-zinc-500" />
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-3 py-2">
                  <Loader2 size={16} className="text-zinc-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 px-3 py-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about bookings, deposits…"
              className="flex-1 text-sm bg-transparent outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors"
            >
              <Send size={14} />
            </button>
          </div>

          <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 pb-2">
            Powered by Google Gemini
          </p>
        </div>
      )}
    </>
  );
}
