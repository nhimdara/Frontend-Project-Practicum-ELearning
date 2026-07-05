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

// ── System prompt: customize this for your LearnFlow context ──
const SYSTEM_PROMPT = `You are an AI learning assistant for LearnFlow, an e-learning platform focused on the ITE (Information Technology Engineering) programme at university level.

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

      if (data.content && Array.isArray(data.content)) {
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
          className="fixed bottom-8 left-8 z-50 group"
          aria-label="Open AI Chat"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-ping opacity-20" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-xl shadow-indigo-500/40 group-hover:shadow-indigo-500/60">
              <Bot className="h-8 w-8 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
          </div>
          <span className="absolute left-20 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ask AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed left-8 z-50 transition-all duration-300 ease-in-out ${
            isMinimized ? "bottom-8 w-72 h-14" : "bottom-8 w-96 h-[600px]"
          }`}
        >
          {/* Chat Container */}
          <div className="relative h-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div
              className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between cursor-pointer"
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="h-6 w-6 text-white" />
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-indigo-600" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm flex items-center gap-1">
                    AI Learning Assistant
                    <Sparkles className="h-3 w-3 text-yellow-300" />
                  </h3>
                  <p className="text-indigo-200 text-xs">
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
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <AlertCircle className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
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
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages Area - Only show when not minimized */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                                : "bg-white text-gray-800 shadow-sm border border-gray-200"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 px-2">
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
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                          <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-2 bg-white border-t border-gray-100">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {["Foundation Year", "Projects", "Videos", "Pricing"].map(
                      (quick) => (
                        <button
                          key={quick}
                          onClick={() => {
                            setInput(quick);
                            inputRef.current?.focus();
                          }}
                          className="text-xs bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
                        >
                          {quick}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                        rows="1"
                        style={{ minHeight: "44px", maxHeight: "120px" }}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
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
      `}</style>
    </>
  );
};

export default AIChat;
