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
      {/* Chat Button - Left Side */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 z-50 group sm:bottom-8 sm:left-8"
          aria-label="Open AI Chat"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-ping opacity-20" />
            <div className="lg-fab-button relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-300">
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
            isMinimized ? "bottom-3 h-14 sm:bottom-8 sm:w-72" : "bottom-3 h-[min(600px,calc(100dvh-1.5rem))] sm:bottom-8 sm:w-96"
          }`}
        >
          {/* Chat Container */}
          <div className="lg-chat-shell relative h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div
              className="lg-chat-header p-4 flex items-center justify-between cursor-pointer"
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-3">
                <div className="lg-avatar-chip relative w-9 h-9 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white/40" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm flex items-center gap-1">
                    AI Learning Assistant
                    <Sparkles className="h-3 w-3 text-yellow-300" />
                  </h3>
                  <p className="text-white/70 text-xs">
                    Online • Ready to help
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearChat();
                  }}
                  className="lg-header-btn p-1.5"
                  title="Clear chat"
                >
                  <AlertCircle className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="lg-header-btn p-1.5"
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
                  className="lg-header-btn p-1.5"
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
                            className={`rounded-2xl p-3 ${
                              msg.type === "user"
                                ? "lg-bubble-user text-white"
                                : "lg-bubble-bot"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
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
                        <div className="lg-bubble-bot rounded-2xl p-4">
                          <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="lg-quickbar px-4 py-2.5">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {["Foundation Year", "Projects", "Videos", "Pricing"].map(
                      (quick) => (
                        <button
                          key={quick}
                          onClick={() => {
                            setInput(quick);
                            inputRef.current?.focus();
                          }}
                          className="lg-quick-chip text-xs px-3 py-1.5 whitespace-nowrap"
                        >
                          {quick}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="lg-inputbar p-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
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
                        className="lg-send-btn absolute right-2 bottom-2 p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
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
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .chat-window {
          animation: slideIn 0.3s ease-out;
        }

        /* ── Liquid glass primitives ───────────────────────── */
        .lg-fab-button {
          background: linear-gradient(135deg, rgba(99,102,241,0.92), rgba(139,92,246,0.92));
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 999px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.4) inset, 0 12px 30px rgba(99,102,241,0.45);
        }
        .lg-fab-button:hover {
          transform: scale(1.08);
          box-shadow: 0 1px 1px rgba(255,255,255,0.4) inset, 0 16px 36px rgba(99,102,241,0.55);
        }
        .lg-tooltip {
          background: rgba(20,20,35,0.7);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
        }

        .lg-chat-shell {
          color: #172033;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 24px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.7) inset, 0 24px 60px rgba(15,15,35,0.25);
        }

        .lg-chat-header {
          background: linear-gradient(135deg, rgba(79,70,229,0.9), rgba(139,92,246,0.9));
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.15);
        }
        .lg-avatar-chip {
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 12px;
        }
        .lg-header-btn {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        .lg-header-btn:hover { background: rgba(255,255,255,0.22); }

        .lg-messages-bg {
          background: rgba(244,245,251,0.5);
        }

        .lg-bubble-user {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          box-shadow: 0 6px 16px rgba(99,102,241,0.3);
        }
        .lg-bubble-bot {
          color: #172033 !important;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 4px 14px rgba(31,41,55,0.06);
        }

        .lg-quickbar {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border-top: 1px solid rgba(255,255,255,0.6);
        }
        .lg-quick-chip {
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 999px;
          color: #4338ca;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .lg-quick-chip:hover {
          background: rgba(99,102,241,0.16);
        }

        .lg-inputbar {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border-top: 1px solid rgba(255,255,255,0.7);
        }
        .lg-textarea {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(31,41,55,0.08);
          color: #172033;
          border-radius: 16px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .lg-textarea:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .lg-textarea::placeholder { color:#7d899e; opacity:1; }
        .chat-timestamp,
        .chat-disclaimer { color:#7b879d; }
        .lg-send-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
          transition: transform 0.2s ease;
        }
        .lg-send-btn:hover:not(:disabled) {
          transform: scale(1.06);
        }

        html.dark-mode .lg-chat-shell {
          color:#f5f7ff;
          background:rgba(10,14,31,.90);
          border-color:rgba(165,180,252,.22);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 28px 72px rgba(0,0,0,.48);
        }
        html.dark-mode .lg-messages-bg { background:rgba(5,8,22,.48); }
        html.dark-mode .lg-bubble-bot {
          color:#eef2ff !important;
          background:rgba(26,32,63,.88);
          border-color:rgba(165,180,252,.16);
          box-shadow:0 6px 18px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.06);
        }
        html.dark-mode .lg-quickbar,
        html.dark-mode .lg-inputbar {
          background:rgba(11,15,34,.82);
          border-color:rgba(165,180,252,.14);
        }
        html.dark-mode .lg-quick-chip {
          color:#cbd5ff;
          background:rgba(99,102,241,.16);
          border-color:rgba(165,180,252,.20);
        }
        html.dark-mode .lg-quick-chip:hover { color:#fff; background:rgba(99,102,241,.28); }
        html.dark-mode .lg-textarea {
          color:#f5f7ff !important;
          background:rgba(5,8,22,.76) !important;
          border-color:rgba(165,180,252,.22) !important;
          caret-color:#a5b4fc;
        }
        html.dark-mode .lg-textarea::placeholder { color:#818daf !important; }
        html.dark-mode .chat-timestamp,
        html.dark-mode .chat-disclaimer { color:#8994b6; }

        @media (max-width:640px) {
          .chat-window { bottom:max(8px,env(safe-area-inset-bottom)); }
          .lg-chat-shell { border-radius:26px; }
          .lg-chat-header { padding:12px; }
          .lg-messages-bg { padding:14px 12px; }
          .lg-inputbar { padding:12px; padding-bottom:max(12px,env(safe-area-inset-bottom)); }
        }
      `}</style>
    </>
  );
};

export default AIChat;
