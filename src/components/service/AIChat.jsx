import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../config/api";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  ChevronDown,
  Maximize2,
  Minimize2,
  AlertCircle,
} from "lucide-react";

// ── System prompt: customize this for your Elearning context ──
const SYSTEM_PROMPT = `You are an AI learning assistant for Elearning, an e-learning platform focused on the ITE (Information Technology Engineering) programme at university level.

You help students with:
- Course and subject information (Foundation Year, Year 2, Year 3, Year 4)
- Projects, assignments, and practical tasks
- Programming help (Java, PHP, React, Python, databases, networking, etc.)
- Subscription, pricing, and certificate questions
- General study advice and motivation

Keep responses concise, friendly, and helpful. Use emojis sparingly. If a question is outside your scope, guide the student to the appropriate resource.`;

const API_BASE = API_BASE_URL;

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "👋 Hi! I'm your AI learning assistant. Ask me anything about courses, projects, or the ITE programme!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen && !isMinimized) {
        setIsMinimized(true);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, isMinimized]);

  const getAIResponse = async (userMessage, chatHistory) => {
    // Build messages array from chat history
    const apiMessages = chatHistory
      .filter((msg) => !(msg.id === 1 && msg.type === "bot")) // skip welcome msg
      .map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    // Append the new user message
    apiMessages.push({ role: "user", content: userMessage });

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Frontend received:", data);

      // Handle response format
      let text = "Sorry, I couldn't generate a response.";

      if (typeof data.response === "string") {
        text = data.response;
      } else if (typeof data.content === "string") {
        text = data.content;
      } else if (data.content && Array.isArray(data.content)) {
        text =
          data.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("") || "Sorry, I couldn't generate a response.";
      } else if (data.error) {
        throw new Error(data.error);
      }

      return text;
    } catch (error) {
      console.error("AI Chat Error:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getAIResponse(input, updatedMessages);
      const botMessage = {
        id: updatedMessages.length + 1,
        type: "bot",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage = {
        id: updatedMessages.length + 1,
        type: "bot",
        content:
          "Sorry, I'm having trouble connecting to the AI. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content:
          "👋 Hi! I'm your AI learning assistant. Ask me anything about courses, projects, or the ITE programme!",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Hidden SVG filter — powers the glass refraction warp, decorative only */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="lg-glass-distort">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.014"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Chat Button - Left Side */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 z-50 group sm:bottom-8 sm:left-8"
          aria-label="Open AI Chat"
        >
          <div className="relative">
            <div className="lg-fab-ring absolute -inset-1.5 rounded-full pointer-events-none" />
            <div className="chat-accent-pulse absolute inset-0 rounded-full animate-ping opacity-20" />
            <div className="lg-fab-button relative overflow-hidden w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-300">
              <Bot className="h-8 w-8 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white/80 animate-pulse" />
            </div>
          </div>
          <span className="lg-tooltip absolute left-20 top-1/2 -translate-y-1/2 text-white px-3 py-1.5 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ask AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`chat-window fixed left-3 right-3 z-50 transition-all duration-300 ease-in-out sm:left-8 sm:right-auto ${
            isMinimized ? "chat-window-minimized bottom-3 h-16 sm:bottom-8 sm:w-80" : "bottom-3 h-[min(600px,calc(100dvh-1.5rem))] sm:bottom-8 sm:w-96"
          }`}
        >
          {/* Chat Container */}
          <div className="lg-chat-shell relative h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div
              className={`lg-chat-header flex items-center justify-between cursor-pointer relative overflow-hidden ${isMinimized ? "h-full px-3 py-2 gap-2" : "p-4"}`}
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex min-w-0 items-center gap-3 relative z-10">
                <div className="lg-avatar-chip relative overflow-hidden w-9 h-9 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white/40" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-1 tracking-tight whitespace-nowrap">
                    AI Learning Assistant
                    <Sparkles className="h-3 w-3 text-yellow-300" />
                  </h3>
                  <p className={`text-white/70 text-[11px] font-medium uppercase tracking-wide whitespace-nowrap ${isMinimized ? "hidden" : ""}`}>
                    Online • Ready to help
                  </p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1 relative z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearChat();
                  }}
                  className="lg-header-btn w-8 h-8 inline-flex items-center justify-center p-0"
                  title="Clear chat"
                >
                  <AlertCircle className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="lg-header-btn w-8 h-8 inline-flex items-center justify-center p-0"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4 text-white" />
                  ) : (
                    <Minimize2 className="h-4 w-4 text-white" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  className="lg-header-btn w-8 h-8 inline-flex items-center justify-center p-0"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages Area - Only show when not minimized */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 lg-messages-bg">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.type === "user"
                              ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                              : "bg-gradient-to-r from-cyan-500 to-indigo-500"
                          }`}
                        >
                          {msg.type === "user" ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div
                            className={`rounded-2xl p-3 relative overflow-hidden ${
                              msg.type === "user"
                                ? "lg-bubble-user text-white"
                                : "lg-bubble-bot"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap relative z-10">
                              {msg.content}
                            </p>
                          </div>
                          <p className="chat-timestamp text-xs mt-1 px-2">
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="lg-bubble-bot relative overflow-hidden rounded-2xl px-4 py-3.5">
                          <div className="lg-typing-dots relative z-10">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="lg-quickbar px-3 py-2.5">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {["Foundation Year", "Projects", "Videos", "Pricing"].map(
                      (quick) => (
                        <button
                          key={quick}
                          onClick={() => {
                            setInput(quick);
                            inputRef.current?.focus();
                          }}
                          className="lg-quick-chip relative overflow-hidden text-xs px-3 py-1.5 whitespace-nowrap"
                        >
                          <span className="relative z-10">{quick}</span>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="lg-inputbar-wrap px-3 pb-3 pt-1">
                  <div className="lg-inputbar flex flex-col p-2">
                    <div className="w-full relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="lg-textarea w-full px-4 py-3 pr-12 resize-none text-sm"
                        rows="1"
                        style={{ minHeight: "44px", maxHeight: "120px" }}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="lg-send-btn overflow-hidden absolute right-2 bottom-1 w-9 h-9 inline-flex items-center justify-center p-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4 relative z-10" />
                      </button>
                    </div>
                  </div>
                  <p className="chat-disclaimer text-xs mt-2 text-center">
                    AI assistant may make mistakes. Verify important
                    information.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.94);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .chat-window {
          animation: slideIn 0.42s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif;
        }
        .chat-window::before,
        .chat-window::after {
          content: "";
          position: absolute;
          z-index: 0;
          border-radius: 999px;
          filter: blur(38px);
          pointer-events: none;
          opacity: 0.55;
          animation: driftGlow 9s ease-in-out infinite alternate;
        }
        .chat-window::before {
          width: 55%;
          height: 30%;
          top: -6%;
          left: -8%;
          background: var(--accent-gradient);
        }
        .chat-window::after {
          width: 45%;
          height: 26%;
          bottom: -8%;
          right: -6%;
          background: var(--accent-gradient);
          animation-delay: -4s;
        }
        @keyframes driftGlow {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(6px, -8px) scale(1.08); }
        }
        .lg-chat-shell { position: relative; z-index: 1; }

        /* ── iOS 26 "Liquid Glass" primitives ───────────────────────── */
        :root {
          --glass-hairline: rgba(255,255,255,0.75);
          --glass-hairline-soft: rgba(255,255,255,0.35);
          --glass-shine: rgba(255,255,255,0.55);
          --glass-fill: rgba(255,255,255,0.55);
          --glass-fill-soft: rgba(255,255,255,0.32);
          --glass-shadow-soft: 0 1px 1px rgba(255,255,255,0.6) inset, 0 -1px 6px rgba(15,15,35,0.05) inset;
        }

        .lg-fab-ring {
          background: conic-gradient(from 0deg, var(--accent-color), transparent 30%, transparent 70%, var(--accent-color));
          opacity: 0.55;
          filter: blur(2px);
          animation: spinRing 5s linear infinite;
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        .lg-fab-button {
          background: var(--accent-gradient);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid var(--glass-hairline-soft);
          border-radius: 999px;
          box-shadow:
            0 1px 1px rgba(255,255,255,0.5) inset,
            0 -6px 10px rgba(0,0,0,0.08) inset,
            0 14px 32px var(--accent-glow);
        }
        .lg-fab-button::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 42%);
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .lg-fab-button::after {
          content: "";
          position: absolute;
          top: 8%;
          left: 14%;
          width: 46%;
          height: 26%;
          border-radius: 999px;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%);
          filter: blur(1px);
          pointer-events: none;
        }
        .lg-fab-button {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        }
        .lg-fab-button:hover {
          transform: scale(1.08);
          box-shadow:
            0 1px 1px rgba(255,255,255,0.5) inset,
            0 -6px 10px rgba(0,0,0,0.08) inset,
            0 18px 40px var(--accent-glow);
        }
        .chat-accent-pulse { background:var(--accent-gradient); }
        .lg-tooltip {
          background: rgba(20,20,35,0.55);
          backdrop-filter: blur(18px) saturate(200%);
          -webkit-backdrop-filter: blur(18px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }

        .lg-chat-shell {
          color: #172033;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(36px) saturate(190%);
          -webkit-backdrop-filter: blur(36px) saturate(190%);
          border: 1px solid var(--glass-hairline-soft);
          border-radius: 32px;
          box-shadow:
            0 1px 1px rgba(255,255,255,0.8) inset,
            0 0 0 1px rgba(255,255,255,0.15) inset,
            0 30px 70px rgba(15,15,35,0.28);
        }
        .lg-chat-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          filter: url(#lg-glass-distort);
          opacity: 0.5;
          pointer-events: none;
        }

        .lg-chat-header {
          background: var(--accent-gradient);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.18);
        }
        .lg-chat-header::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 55%);
          pointer-events: none;
        }
        .lg-chat-header::after {
          content: "";
          position: absolute;
          top: -60%;
          left: -10%;
          width: 60%;
          height: 180%;
          background: radial-gradient(closest-side, rgba(255,255,255,0.35), rgba(255,255,255,0) 70%);
          transform: rotate(12deg);
          pointer-events: none;
        }
        .lg-avatar-chip {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 13px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.4) inset;
        }
        .lg-avatar-chip::before {
          content: "";
          position: absolute;
          top: 6%;
          left: 12%;
          width: 40%;
          height: 30%;
          border-radius: 999px;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.8), rgba(255,255,255,0) 75%);
          pointer-events: none;
        }
        .lg-header-btn {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 11px;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .lg-header-btn svg,
        .lg-send-btn svg,
        .lg-fab-button svg,
        .lg-avatar-chip svg {
          display:block;
          flex:none;
          margin:auto;
        }
        .lg-header-btn:hover { background: rgba(255,255,255,0.24); }
        .lg-header-btn:active { transform: scale(0.92); }

        .lg-messages-bg {
          background: rgba(244,245,251,0.35);
          mask-image: linear-gradient(to bottom, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%);
          scrollbar-width: thin;
          scrollbar-color: rgba(120,130,160,0.35) transparent;
        }
        .lg-messages-bg::-webkit-scrollbar { width: 5px; }
        .lg-messages-bg::-webkit-scrollbar-thumb {
          background: rgba(120,130,160,0.35);
          border-radius: 999px;
        }
        .lg-typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 18px;
        }
        .lg-typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--accent-color);
          opacity: 0.55;
          animation: typingBounce 1.1s ease-in-out infinite;
        }
        .lg-typing-dots span:nth-child(2) { animation-delay: 0.15s; }
        .lg-typing-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        .lg-bubble-user {
          background: var(--accent-gradient);
          box-shadow: 0 8px 20px var(--accent-glow);
        }
        .lg-bubble-user::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%);
          pointer-events: none;
        }
        .lg-bubble-bot {
          color: #172033 !important;
          background: rgba(255,255,255,0.62);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid var(--glass-hairline);
          box-shadow: 0 1px 1px rgba(255,255,255,0.7) inset, 0 6px 16px rgba(31,41,55,0.07);
        }
        .lg-bubble-bot::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 40%;
          background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%);
          pointer-events: none;
        }

        .lg-quickbar {
          background: transparent;
        }
        .lg-quick-chip {
          background: var(--glass-fill-soft);
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border: 1px solid var(--accent-border);
          border-radius: 999px;
          color: var(--accent-color);
          font-weight: 500;
          box-shadow: 0 1px 1px rgba(255,255,255,0.6) inset, 0 2px 8px rgba(15,15,35,0.04);
          transition: all 0.2s ease;
        }
        .lg-quick-chip::before {
          content: "";
          position: absolute;
          top: 0; left: 8%;
          width: 50%;
          height: 55%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 100%);
          pointer-events: none;
        }
        .lg-quick-chip:hover {
          background: var(--accent-light);
          transform: translateY(-1px);
        }
        .lg-quick-chip:active { transform: translateY(0) scale(0.97); }

        .lg-inputbar-wrap { background: transparent; }
        .lg-inputbar {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(22px) saturate(190%);
          -webkit-backdrop-filter: blur(22px) saturate(190%);
          border: 1px solid var(--glass-hairline);
          border-radius: 22px;
          box-shadow:
            0 1px 1px rgba(255,255,255,0.8) inset,
            0 10px 26px rgba(15,15,35,0.12);
        }
        .lg-textarea {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(31,41,55,0.06);
          color: #172033;
          border-radius: 16px;
          outline: none;
          box-shadow: 0 1px 1px rgba(255,255,255,0.7) inset;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .lg-textarea:focus {
          border-color: var(--accent-border);
          box-shadow: 0 0 0 3px var(--accent-ring), 0 1px 1px rgba(255,255,255,0.7) inset;
        }
        .lg-textarea::placeholder { color:#7d899e; opacity:1; }
        .chat-timestamp,
        .chat-disclaimer { color:#7b879d; }
        .lg-send-btn {
          background: var(--accent-gradient);
          color: #fff;
          border-radius: 999px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.5) inset, 0 6px 16px var(--accent-glow);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .lg-send-btn::before {
          content: "";
          position: absolute;
          top: 10%;
          left: 18%;
          width: 40%;
          height: 30%;
          border-radius: 999px;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.8), rgba(255,255,255,0) 75%);
          pointer-events: none;
        }
        .lg-send-btn:hover:not(:disabled) {
          transform: scale(1.08);
        }
        .lg-send-btn:active:not(:disabled) { transform: scale(0.96); }

        html.dark-mode .lg-chat-shell {
          color:#f5f7ff;
          background:rgba(12,16,34,.78);
          border-color:rgba(165,180,252,.2);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08), inset 0 0 0 1px rgba(255,255,255,0.04), 0 30px 76px rgba(0,0,0,.5);
        }
        html.dark-mode .lg-messages-bg { background:rgba(5,8,22,.32); }
        html.dark-mode .lg-bubble-bot {
          color:#eef2ff !important;
          background:rgba(26,32,63,.72);
          border-color:rgba(165,180,252,.18);
          box-shadow:0 6px 18px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.07);
        }
        html.dark-mode .lg-bubble-bot::before { background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%); }
        html.dark-mode .lg-quick-chip {
          color:var(--accent-color);
          background:rgba(20,24,48,.5);
          border-color:rgba(165,180,252,.22);
        }
        html.dark-mode .lg-quick-chip:hover { color:#fff; background:var(--accent-color); }
        html.dark-mode .lg-inputbar {
          background:rgba(12,16,34,.7);
          border-color:rgba(165,180,252,.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 10px 28px rgba(0,0,0,.35);
        }
        html.dark-mode .lg-textarea {
          color:#f5f7ff !important;
          background:rgba(6,9,24,.6) !important;
          border-color:rgba(165,180,252,.18) !important;
          caret-color:#a5b4fc;
        }
        html.dark-mode .lg-textarea::placeholder { color:#818daf !important; }
        html.dark-mode .chat-timestamp,
        html.dark-mode .chat-disclaimer { color:#8994b6; }

        @media (max-width:640px) {
          .chat-window { bottom:max(8px,env(safe-area-inset-bottom)); }
          .lg-chat-shell { border-radius:30px; }
          .lg-chat-header { padding:10px 12px; gap:8px; }
          .lg-chat-header .lg-avatar-chip { width:34px; height:34px; flex:none; }
          .lg-chat-header h3 { font-size:12px; line-height:16px; }
          .lg-chat-header p { font-size:9px; line-height:13px; letter-spacing:.035em; }
          .lg-chat-header .lg-header-btn { width:30px; height:30px; }
          .lg-messages-bg { padding:14px 12px; }
          .lg-quickbar > div { scrollbar-width:none; }
          .lg-quickbar > div::-webkit-scrollbar { display:none; }
          .chat-disclaimer { width:100%; margin-top:6px; font-size:10px; line-height:14px; white-space:normal; }
          .lg-inputbar-wrap { padding-bottom:max(10px,env(safe-area-inset-bottom)); }
        }
      `}</style>
    </>
  );
};

export default AIChat;
