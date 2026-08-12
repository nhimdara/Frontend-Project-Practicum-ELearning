import React, { useState, useEffect, useRef, useCallback, memo } from "react";
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
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react";

// ── System prompt ──
const SYSTEM_PROMPT = `You are an AI learning assistant for Elearning, an e-learning platform focused on the ITE (Information Technology Engineering) programme at university level.

You help students with:
- Course and subject information (Foundation Year, Year 2, Year 3, Year 4)
- Projects, assignments, and practical tasks
- Programming help (Java, PHP, React, Python, databases, networking, etc.)
- Subscription, pricing, and certificate questions
- General study advice and motivation

Keep responses concise, friendly, and helpful. Use emojis sparingly. If a question is outside your scope, guide the student to the appropriate resource.`;

const API_BASE = API_BASE_URL;
const QUICK_ACTIONS = ["Foundation Year", "Projects", "Videos", "Pricing"];
const STORAGE_KEY = "ai_chat_history";
const WELCOME_MESSAGE = {
  id: "welcome",
  type: "bot",
  content:
    "👋 Hi! I'm your AI learning assistant. Ask me anything about courses, projects, or the ITE programme!",
  timestamp: new Date().toISOString(),
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ── Simple Markdown Parser (no external libs needed) ──
const CodeBlock = memo(function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="my-2 rounded-xl overflow-hidden bg-gray-900 border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-gray-700"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto">
        <code className="text-xs font-mono text-gray-100 whitespace-pre leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
});

const MarkdownContent = memo(function MarkdownContent({ content }) {
  const parseContent = () => {
    const lines = content.split("\n");
    const elements = [];
    let i = 0;
    let key = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code blocks
      if (line.startsWith("```")) {
        const lang = line.slice(3).trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++;
        elements.push(
          <CodeBlock
            key={`code-${key++}`}
            code={codeLines.join("\n")}
            language={lang}
          />,
        );
        continue;
      }

      // Empty line
      if (line.trim() === "") {
        i++;
        continue;
      }

      // Inline formatting
      let html = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/```([^`]+)```/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:text-indigo-600">$1</a>',
        );

      elements.push(
        <p
          key={`p-${key++}`}
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />,
      );
      i++;
    }

    return elements;
  };

  return <div className="space-y-1">{parseContent()}</div>;
});

// ── Message Bubble ──
const MessageBubble = memo(function MessageBubble({
  msg,
  onFeedback,
  onRetry,
}) {
  const isUser = msg.type === "user";
  const isError = msg.isError;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-gradient-to-r from-indigo-600 to-violet-600"
              : "bg-gradient-to-r from-cyan-500 to-indigo-500"
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>
        <div className="min-w-0">
          <div
            className={`rounded-2xl p-3 ${
              isUser
                ? "lg-bubble-user text-white"
                : isError
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "lg-bubble-bot"
            }`}
          >
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            ) : (
              <MarkdownContent content={msg.content} />
            )}

            {isError && msg.retryMessage && (
              <button
                onClick={() => onRetry?.(msg.retryMessage)}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 px-2">
            <p className="chat-timestamp text-[11px]">
              {formatTime(msg.timestamp)}
            </p>
            {!isUser && !isError && msg.id !== "welcome" && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onFeedback?.(msg.id, "up")}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Helpful"
                  title="Helpful"
                >
                  <ThumbsUp className="h-3 w-3 text-gray-400 hover:text-emerald-500" />
                </button>
                <button
                  onClick={() => onFeedback?.(msg.id, "down")}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Not helpful"
                  title="Not helpful"
                >
                  <ThumbsDown className="h-3 w-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Message List ──
const ChatMessages = memo(function ChatMessages({
  messages,
  isLoading,
  bottomRef,
  containerRef,
  onScroll,
  onFeedback,
  onRetry,
}) {
  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4 lg-messages-bg"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.map((msg) => (
        <div key={msg.id} className="group">
          <MessageBubble msg={msg} onFeedback={onFeedback} onRetry={onRetry} />
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex gap-3 max-w-[80%]">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="lg-bubble-bot rounded-2xl px-4 py-3.5">
              <div className="lg-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
});

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const idCounter = useRef(1);
  const nextId = () => `m${idCounter.current++}`;

  // ── Load history from localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Find highest existing ID to continue counter
          const maxId = parsed.reduce((max, msg) => {
            const num = parseInt(msg.id?.replace("m", "") || "0");
            return Math.max(max, num);
          }, 0);
          idCounter.current = maxId + 1;
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  }, []);

  // ── Save history to localStorage ──
  useEffect(() => {
    try {
      if (messages.length > 1) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [messages]);

  // ── Smart scroll: only auto-scroll if user is near bottom ──
  useEffect(() => {
    if (isOpen && !isMinimized && isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isNearBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen && !isMinimized) setIsMinimized(true);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, isMinimized]);

  // ── Scroll handler ──
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 120;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsNearBottom(distance < threshold);
  }, []);

  // ── API Call (FIXED: no longer duplicates user message) ──
  const getAIResponse = useCallback(async (apiMessages) => {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();

    if (typeof data.response === "string") return data.response;
    if (typeof data.content === "string") return data.content;
    if (Array.isArray(data.content)) {
      return (
        data.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("") || "Sorry, I couldn't generate a response."
      );
    }
    if (data.error) throw new Error(data.error);
    return "Sorry, I couldn't generate a response.";
  }, []);

  // ── Send message (FIXED: separated state update from API call) ──
  const handleSend = useCallback(
    async (textToSend = input) => {
      const trimmed = textToSend.trim();
      if (!trimmed || isLoading) return;

      const userMessage = {
        id: nextId(),
        type: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      // Build API history (exclude welcome, include all prior + new user msg)
      const apiHistory = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content,
        }));
      apiHistory.push({ role: "user", content: trimmed });

      // Update UI immediately
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setIsNearBottom(true);
      if (textareaRef.current) textareaRef.current.style.height = "44px";

      try {
        const response = await getAIResponse(apiHistory);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            type: "bot",
            content: response,
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error("AI Chat Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            type: "bot",
            content: `Sorry, I'm having trouble connecting to the AI. ${error.message}`,
            timestamp: new Date().toISOString(),
            isError: true,
            retryMessage: trimmed,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, getAIResponse],
  );

  // ── Retry failed message ──
  const handleRetry = useCallback(
    (retryMessage) => {
      // Remove the error message
      setMessages((prev) => prev.filter((msg) => !msg.isError));
      handleSend(retryMessage);
    },
    [handleSend],
  );

  // ── Feedback handler ──
  const handleFeedback = useCallback((messageId, type) => {
    // TODO: Send to your analytics backend
    console.log(`Feedback ${type} for message ${messageId}`);
    // Visual feedback could be added here
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "44px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const clearChat = useCallback(() => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      idCounter.current = 1;
      setMessages([WELCOME_MESSAGE]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleQuickAction = useCallback(
    (quick) => {
      handleSend(quick);
    },
    [handleSend],
  );

  // ── Unread badge when closed ──
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.type === "bot" && lastMsg.id !== "welcome") {
        setUnreadCount((c) => c + 1);
      }
    }
  }, [messages, isOpen]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
          }}
          className="fixed bottom-4 left-4 z-50 group sm:bottom-8 sm:left-8"
          aria-label="Open AI Chat"
        >
          <div className="relative">
            <div className="lg-fab-ring absolute -inset-1.5 rounded-full pointer-events-none" />
            <div className="chat-accent-pulse absolute inset-0 rounded-full animate-ping opacity-20" />
            <div className="lg-fab-button relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-300">
              <Bot className="h-8 w-8 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-white/80 flex items-center justify-center text-[10px] font-bold text-white px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white/80 animate-pulse" />
            </div>
          </div>
          <span className="lg-tooltip absolute left-20 top-1/2 -translate-y-1/2 text-white px-3 py-1.5 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ask AI Assistant
          </span>
        </button>
      )}

      {isOpen && (
        <div
          className={`chat-window fixed left-3 right-3 z-50 transition-all duration-300 ease-in-out sm:left-8 sm:right-auto ${
            isMinimized
              ? "chat-window-minimized bottom-3 h-16 sm:bottom-8 sm:w-80"
              : "bottom-3 h-[min(600px,calc(100dvh-1.5rem))] sm:bottom-8 sm:w-96"
          }`}
        >
          <div className="lg-chat-shell relative h-full flex flex-col overflow-hidden">
            <div
              className={`lg-chat-header flex items-center justify-between cursor-pointer relative ${
                isMinimized ? "h-full px-3 py-2 gap-2" : "p-4"
              }`}
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex min-w-0 items-center gap-3 relative z-10">
                <div className="lg-avatar-chip relative w-9 h-9 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white/40" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-1 tracking-tight whitespace-nowrap">
                    AI Learning Assistant
                    <Sparkles className="h-3 w-3 text-yellow-300" />
                  </h3>
                  <p
                    className={`text-white/70 text-[11px] font-medium uppercase tracking-wide whitespace-nowrap ${
                      isMinimized ? "hidden" : ""
                    }`}
                  >
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
                  title={isMinimized ? "Expand" : "Minimize"}
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
                  title="Close"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  bottomRef={messagesEndRef}
                  containerRef={messagesContainerRef}
                  onScroll={handleScroll}
                  onFeedback={handleFeedback}
                  onRetry={handleRetry}
                />

                <div className="lg-quickbar px-3 py-2.5">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {QUICK_ACTIONS.map((quick) => (
                      <button
                        key={quick}
                        onClick={() => handleQuickAction(quick)}
                        className="lg-quick-chip text-xs px-3 py-1.5 whitespace-nowrap"
                      >
                        <span className="relative z-10">{quick}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg-inputbar-wrap px-3 pb-3 pt-1">
                  <div className="lg-inputbar flex flex-col p-2">
                    <div className="w-full relative">
                      <textarea
                        ref={(el) => {
                          inputRef.current = el;
                          textareaRef.current = el;
                        }}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        className="lg-textarea w-full px-4 py-3 pr-12 resize-none text-sm"
                        rows="1"
                        style={{ minHeight: "44px", maxHeight: "120px" }}
                        disabled={isLoading}
                        aria-label="Message input"
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="lg-send-btn absolute right-2 bottom-1 w-9 h-9 inline-flex items-center justify-center p-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Send message"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 relative z-10 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 relative z-10" />
                        )}
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
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .chat-window {
          animation: slideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif;
          contain: layout paint;
        }

        .chat-window::before {
          content: "";
          position: absolute;
          z-index: 0;
          width: 60%;
          height: 32%;
          top: -6%;
          left: -8%;
          border-radius: 999px;
          background: var(--accent-gradient);
          filter: blur(20px);
          opacity: 0.35;
          pointer-events: none;
        }
        .lg-chat-shell { position: relative; z-index: 1; }

        :root {
          --glass-hairline: rgba(255,255,255,0.75);
          --glass-hairline-soft: rgba(255,255,255,0.35);
          --glass-fill-soft: rgba(255,255,255,0.32);
        }

        .lg-fab-ring {
          background: conic-gradient(from 0deg, var(--accent-color), transparent 30%, transparent 70%, var(--accent-color));
          opacity: 0.55;
          filter: blur(1px);
          animation: spinRing 6s linear infinite;
          will-change: transform;
        }
        @keyframes spinRing { to { transform: rotate(360deg); } }

        .lg-fab-button {
          background: var(--accent-gradient);
          border: 1px solid var(--glass-hairline-soft);
          border-radius: 999px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.5) inset, 0 12px 26px var(--accent-glow);
          transition: transform 0.2s ease;
        }
        .lg-fab-button:hover { transform: scale(1.06); }
        .chat-accent-pulse { background: var(--accent-gradient); }

        .lg-tooltip {
          background: rgba(20,20,35,0.85);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }

        .lg-chat-shell {
          color: #172033;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid var(--glass-hairline-soft);
          border-radius: 28px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.8) inset, 0 24px 56px rgba(15,15,35,0.22);
        }

        .lg-chat-header {
          background: var(--accent-gradient);
          border-bottom: 1px solid rgba(255,255,255,0.18);
        }
        .lg-avatar-chip {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 13px;
        }
        .lg-header-btn {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 11px;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .lg-header-btn svg, .lg-send-btn svg, .lg-fab-button svg, .lg-avatar-chip svg {
          display: block; flex: none; margin: auto;
        }
        .lg-header-btn:hover { background: rgba(255,255,255,0.24); }
        .lg-header-btn:active { transform: scale(0.92); }

        .lg-messages-bg {
          background: rgba(244,245,251,0.5);
          scrollbar-width: thin;
          scrollbar-color: rgba(120,130,160,0.35) transparent;
          contain: layout paint;
        }
        .lg-messages-bg::-webkit-scrollbar { width: 5px; }
        .lg-messages-bg::-webkit-scrollbar-thumb { background: rgba(120,130,160,0.35); border-radius: 999px; }

        .lg-typing-dots { display: flex; align-items: center; gap: 4px; height: 18px; }
        .lg-typing-dots span {
          width: 6px; height: 6px; border-radius: 999px;
          background: var(--accent-color); opacity: 0.55;
          animation: typingBounce 1.1s ease-in-out infinite;
        }
        .lg-typing-dots span:nth-child(2) { animation-delay: 0.15s; }
        .lg-typing-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }

        .lg-bubble-user {
          background: var(--accent-gradient);
          box-shadow: 0 6px 14px var(--accent-glow);
        }
        .lg-bubble-bot {
          color: #172033 !important;
          background: rgba(255,255,255,0.85);
          border: 1px solid var(--glass-hairline);
          box-shadow: 0 4px 10px rgba(31,41,55,0.06);
        }

        .lg-quick-chip {
          background: var(--glass-fill-soft);
          border: 1px solid var(--accent-border);
          border-radius: 999px;
          color: var(--accent-color);
          font-weight: 500;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .lg-quick-chip:hover { background: var(--accent-light); transform: translateY(-1px); }
        .lg-quick-chip:active { transform: translateY(0) scale(0.97); }

        .lg-inputbar {
          background: rgba(255,255,255,0.9);
          border: 1px solid var(--glass-hairline);
          border-radius: 22px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.8) inset, 0 8px 18px rgba(15,15,35,0.1);
        }
        .lg-textarea {
          background: transparent;
          border: 1px solid rgba(31,41,55,0.06);
          color: #172033;
          border-radius: 16px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .lg-textarea:focus {
          border-color: var(--accent-border);
          box-shadow: 0 0 0 3px var(--accent-ring);
        }
        .lg-textarea::placeholder { color: #7d899e; opacity: 1; }
        .chat-timestamp, .chat-disclaimer { color: #7b879d; }

        .lg-send-btn {
          background: var(--accent-gradient);
          color: #fff;
          border-radius: 999px;
          box-shadow: 0 4px 12px var(--accent-glow);
          transition: transform 0.15s ease;
        }
        .lg-send-btn:hover:not(:disabled) { transform: scale(1.06); }
        .lg-send-btn:active:not(:disabled) { transform: scale(0.96); }

        html.dark-mode .lg-chat-shell {
          color: #f5f7ff;
          background: rgba(12,16,34,.9);
          border-color: rgba(165,180,252,.2);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 24px 56px rgba(0,0,0,.5);
        }
        html.dark-mode .lg-messages-bg { background: rgba(5,8,22,.4); }
        html.dark-mode .lg-bubble-bot {
          color: #eef2ff !important;
          background: rgba(26,32,63,.85);
          border-color: rgba(165,180,252,.18);
        }
        html.dark-mode .lg-quick-chip { color: var(--accent-color); background: rgba(20,24,48,.5); border-color: rgba(165,180,252,.22); }
        html.dark-mode .lg-quick-chip:hover { color: #fff; background: var(--accent-color); }
        html.dark-mode .lg-inputbar { background: rgba(12,16,34,.85); border-color: rgba(165,180,252,.18); }
        html.dark-mode .lg-textarea { color: #f5f7ff !important; border-color: rgba(165,180,252,.18) !important; caret-color: #a5b4fc; }
        html.dark-mode .lg-textarea::placeholder { color: #818daf !important; }
        html.dark-mode .chat-timestamp, html.dark-mode .chat-disclaimer { color: #8994b6; }

        @media (prefers-reduced-motion: reduce) {
          .chat-window, .lg-fab-ring, .lg-typing-dots span, .chat-accent-pulse, .animate-pulse, .animate-ping {
            animation: none !important;
          }
        }

        @media (max-width: 640px) {
          .chat-window { bottom: max(8px, env(safe-area-inset-bottom)); }
          .lg-chat-shell { border-radius: 26px; }
          .lg-chat-header { padding: 10px 12px; gap: 8px; }
          .lg-chat-header .lg-avatar-chip { width: 34px; height: 34px; flex: none; }
          .lg-chat-header h3 { font-size: 12px; line-height: 16px; }
          .lg-chat-header p { font-size: 9px; line-height: 13px; letter-spacing: .035em; }
          .lg-chat-header .lg-header-btn { width: 30px; height: 30px; }
          .lg-messages-bg { padding: 14px 12px; }
          .lg-quickbar > div { scrollbar-width: none; }
          .lg-quickbar > div::-webkit-scrollbar { display: none; }
          .chat-disclaimer { width: 100%; margin-top: 6px; font-size: 10px; line-height: 14px; white-space: normal; }
          .lg-inputbar-wrap { padding-bottom: max(10px, env(safe-area-inset-bottom)); }
        }
      `}</style>
    </>
  );
};

export default AIChat;
