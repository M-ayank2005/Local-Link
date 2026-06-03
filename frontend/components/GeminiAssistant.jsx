"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  MessageCircle, X, Send, Bot, User, Loader2,
  Package, HelpCircle, ArrowLeft, ExternalLink, Tag, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { resolveApiV1Base } from "@/lib/apiBase";

const API_BASE = resolveApiV1Base();

const MOCK_ITEMS = [
  { _id: "m1", title: "Bosch Drill Machine", category: "drill", condition: "good", pricePerDay: 80, depositAmount: 600, owner: { fullName: "Rajan Mehta" } },
  { _id: "m2", title: "8ft Aluminum Ladder", category: "ladder", condition: "good", pricePerDay: 50, depositAmount: 300, owner: { fullName: "Sunita Rao" } },
  { _id: "m3", title: "Epson Projector 3000 Lumens", category: "projector", condition: "new", pricePerDay: 200, depositAmount: 2000, owner: { fullName: "Amit Shah" } },
  { _id: "m4", title: "Large Camping Tent (6-person)", category: "tent", condition: "good", pricePerDay: 150, depositAmount: 800, owner: { fullName: "Priya Kapoor" } },
  { _id: "m5", title: "Power Drill Set", category: "tool", condition: "good", pricePerDay: 60, depositAmount: 400, owner: { fullName: "Vijay Kumar" } },
  { _id: "m6", title: "Cricket Kit (bat+pads+helmet)", category: "sports", condition: "good", pricePerDay: 120, depositAmount: 700, owner: { fullName: "Arjun Singh" } },
];

const CATEGORIES = ["all", "drill", "ladder", "projector", "tent", "tool", "appliance", "sports", "other"];

const SYSTEM_PROMPT = `You are the Local Link Resource Pool Assistant — a helpful guide for the Local Link community platform.

LOCAL LINK PLATFORM PAGES (help users navigate here):
- /resources → Browse all available items to borrow (tools, tents, projectors, ladders, etc.)
- /resources/item/[id] → View item details and ML demand forecast
- /resources/my-items → List your own items for rent OR view your bookings
- /resources/book/[id] → Book an item with dates and pay deposit
- /home → Home dashboard
- /food → Order food from local vendors
- /commerce → Local shops and products
- /emergency → Emergency services (blood, medicine)
- /skills → Skill exchange between community members

RESOURCE CATEGORIES AVAILABLE: drill, ladder, projector, tent, tool, appliance, sports, other

DEPOSIT & BOOKING RULES:
- Safety deposit held on booking confirmation
- Good return → full deposit released
- Damaged return → deposit forfeited to owner
- Cancel >48h before → full refund
- Cancel <48h before → 50% rent refund, deposit fully returned
- Cancel after start → no rent refund

YOUR JOB:
1. Answer questions about Local Link features
2. Tell users EXACTLY which page/URL to visit for their need
3. If someone asks about a resource type, tell them to go to /resources and filter by that category
4. Keep replies short (2-3 sentences max)
5. Always end with a helpful navigation tip like: "👉 Go to /resources to find this"`;

export default function GeminiAssistant() {
  // "home" | "browse" | "chat"
  const [mode, setMode] = useState("home");
  const [open, setOpen] = useState(false);

  // Browse state
  const [items, setItems] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // Chat state
  const [messages, setMessages] = useState([
    { role: "model", text: "Hi! What would you like help with? Ask me anything about the website or resources." },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Init Gemini
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return;
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel(
        { model: "gemini-1.5-flash" },
        { apiVersion: "v1" }
      );
      chatRef.current = model.startChat({
        history: [
          { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
          { role: "model", parts: [{ text: "Understood. I'm the Local Link Resource Pool Assistant, ready to help users navigate the platform and answer their resource-related questions." }] },
        ],
      });
    } catch (e) {
      // API key invalid or network issue — chat will show error gracefully
    }
  }, []);

  // Fetch items for browse mode
  const loadItems = async () => {
    setBrowseLoading(true);
    try {
      const params = new URLSearchParams({ lng: 77.209, lat: 28.6139, distance: 10000 });
      if (activeCategory !== "all") params.append("category", activeCategory);
      const res = await fetch(`${API_BASE}/resources?${params}`);
      const data = await res.json();
      setItems(data.data?.length ? data.data : MOCK_ITEMS);
    } catch {
      setItems(MOCK_ITEMS);
    } finally {
      setBrowseLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "browse") loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activeCategory]);

  const send = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setChatLoading(true);
    try {
      if (!chatRef.current) throw new Error("no-key");
      const result = await chatRef.current.sendMessage(text);
      setMessages((prev) => [...prev, { role: "model", text: result.response.text() }]);
    } catch (err) {
      const msg = err.message === "no-key"
        ? "Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file."
        : "Sorry, couldn't reach the AI right now. Please try again.";
      setMessages((prev) => [...prev, { role: "model", text: msg }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => {
    setMode("home");
    setActiveCategory("all");
    setItems([]);
  };

  const filteredItems = activeCategory === "all"
    ? items
    : items.filter((i) => i.category === activeCategory);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen((o) => !o); if (!open) reset(); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-all"
        aria-label="Open assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[540px]">

          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2 flex-shrink-0">
            {mode !== "home" && (
              <button onClick={reset} className="text-indigo-200 hover:text-white mr-1">
                <ArrowLeft size={16} />
              </button>
            )}
            <Bot size={18} className="text-white" />
            <span className="text-white font-semibold text-sm">
              {mode === "home" && "Resource Pool Assistant"}
              {mode === "browse" && "Browse Items"}
              {mode === "chat" && "Ask Assistant"}
            </span>
            <span className="ml-auto text-indigo-200 text-xs">Gemini AI</span>
          </div>

          {/* ── HOME MODE ── */}
          {mode === "home" && (
            <div className="flex flex-col gap-3 p-5">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                What would you like to do?
              </p>
              {/* Browse option */}
              <button
                onClick={() => setMode("browse")}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-100 dark:border-indigo-900 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200">
                  <Package size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">Browse Items</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">See what is available to borrow near you</p>
                </div>
                <ChevronRight size={16} className="ml-auto text-zinc-400 group-hover:text-indigo-500" />
              </button>

              {/* Ask option */}
              <button
                onClick={() => setMode("chat")}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-amber-100 dark:border-amber-900 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200">
                  <HelpCircle size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">Ask a Question</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Get help navigating the website with AI</p>
                </div>
                <ChevronRight size={16} className="ml-auto text-zinc-400 group-hover:text-amber-500" />
              </button>

              <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 pt-1">Powered by Google Gemini</p>
            </div>
          )}

          {/* ── BROWSE MODE ── */}
          {mode === "browse" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Category chips */}
              <div className="flex gap-1.5 px-3 py-2 overflow-x-auto flex-shrink-0 border-b border-zinc-100 dark:border-zinc-800">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      activeCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                {browseLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 size={24} className="text-indigo-500 animate-spin" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <p className="text-center text-sm text-zinc-400 py-8">No items found in this category.</p>
                ) : (
                  filteredItems.map((item) => (
                    <Link
                      key={item._id}
                      href={`/resources/item/${item._id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                        <Tag size={14} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{item.title}</p>
                        <p className="text-xs text-zinc-400">
                          ₹{item.pricePerDay}/day · {item.owner?.fullName}
                        </p>
                      </div>
                      <ExternalLink size={13} className="text-zinc-300 group-hover:text-indigo-500 flex-shrink-0" />
                    </Link>
                  ))
                )}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 p-2 flex-shrink-0">
                <Link
                  href="/resources"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  View all on website <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* ── CHAT MODE ── */}
          {mode === "chat" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 max-h-80">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" ? "bg-indigo-100 dark:bg-indigo-900" : "bg-zinc-100 dark:bg-zinc-800"
                    }`}>
                      {msg.role === "user"
                        ? <User size={14} className="text-indigo-600" />
                        : <Bot size={14} className="text-zinc-500" />}
                    </div>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-sm"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
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

              <div className="border-t border-zinc-200 dark:border-zinc-700 px-3 py-2 flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask anything about the website…"
                  className="flex-1 text-sm bg-transparent outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                />
                <button
                  onClick={send}
                  disabled={chatLoading || !input.trim()}
                  className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 pb-2">Powered by Google Gemini</p>
            </div>
          )}

        </div>
      )}
    </>
  );
}
