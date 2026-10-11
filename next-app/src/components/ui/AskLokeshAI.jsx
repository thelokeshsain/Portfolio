"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Bot,
  User,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import SafeMarkdown from "./SafeMarkdown";

const SUGGESTED_PROMPTS = [
  "What is Lokesh's core technical stack?",
  "Explain his analysis on US PERM green card suspensions",
  "What full-stack projects has Lokesh built?",
  "How can I get in touch with Lokesh?",
];

export default function AskLokeshAI() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  // Mount tracking for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while dialog is open and restore on close
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus management: focus input on open, return focus to trigger on close, handle Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setError(null);
    setLastFailedPrompt(null);
    setInput("");

    // Add user message to state
    const userMsg = { role: "user", content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build lightweight conversation history (last 4 turns)
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || `Server responded with status ${res.status}`);
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
          model: data.model,
        },
      ]);
    } catch (err) {
      setError(err.message || "Failed to communicate with AI service.");
      setLastFailedPrompt(query);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedPrompt) {
      if (messages.length > 0 && messages[messages.length - 1].role === "user") {
        setMessages((prev) => prev.slice(0, -1));
      }
      handleSendMessage(lastFailedPrompt);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    setLastFailedPrompt(null);
    setInput("");
  };

  const dialogPortalContent = (
    <>
      {/* 1. Backdrop Overlay — Layered at z-index 1080 (above navbar 1000) */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 1080,
          animation: "fadeIn 0.18s ease-out",
        }}
      />

      {/* 2. Chat Dialog Modal — Layered at z-index 1090 (strictly above navbar and backdrop) */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-lokesh-title"
        style={{
          position: "fixed",
          zIndex: 1090,
          bottom: "max(20px, calc(env(safe-area-inset-bottom) + 20px))",
          right: "max(20px, calc(env(safe-area-inset-right) + 20px))",
          width: "min(420px, calc(100vw - 32px))",
          height: "min(600px, calc(100dvh - max(40px, env(safe-area-inset-top)) - 40px))",
          maxHeight: "calc(100dvh - 32px)",
          display: "flex",
          flexDirection: "column",
          background: "#080D1A",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.2)",
          overflow: "hidden",
          animation: "fadeInUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            background: "#0B1120",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(30, 58, 138, 0.4))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38BDF8",
                border: "1px solid rgba(56, 189, 248, 0.3)",
              }}
            >
              <Bot size={17} />
            </div>
            <div>
              <h2
                id="ask-lokesh-title"
                style={{
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: "#F8FAFC",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Ask Lokesh AI
              </h2>
              <div
                style={{
                  fontSize: 11,
                  color: "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#10B981",
                    display: "inline-block",
                  }}
                />
                Grounded Portfolio Guide
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                title="Clear conversation"
                aria-label="Clear conversation"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  padding: 6,
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F8FAFC")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                <RotateCcw size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              title="Close dialog (Escape)"
              aria-label="Close dialog"
              style={{
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                padding: 6,
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F8FAFC")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
            >
              <X size={17} />
            </button>
          </div>
        </header>

        {/* Messages Scroll Area */}
        <div
          data-ai-chat-messages
          style={{
            flex: 1,
            overflowY: "auto",
            overscrollBehavior: "contain",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {messages.length === 0 ? (
            <div style={{ margin: "auto 0" }}>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 18,
                  padding: "10px 14px",
                  background: "rgba(30, 41, 59, 0.4)",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "#CBD5E1",
                    margin: "0 0 6px",
                  }}
                >
                  Welcome! Ask questions about Lokesh&apos;s engineering background, skills, projects, or his published perspectives.
                </p>
                <span style={{ fontSize: 11, color: "#64748B" }}>
                  Answers are generated from verified portfolio data and published articles.
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#94A3B8",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  Suggested Questions
                </div>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    style={{
                      textAlign: "left",
                      padding: "9px 12px",
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(56, 189, 248, 0.18)",
                      borderRadius: 8,
                      color: "#E2E8F0",
                      fontSize: 12.5,
                      lineHeight: 1.4,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(30, 58, 138, 0.25)";
                      e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.45)";
                      e.currentTarget.style.color = "#38BDF8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                      e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.18)";
                      e.currentTarget.style.color = "#E2E8F0";
                    }}
                  >
                    <span>{prompt}</span>
                    <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.55,
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)"
                        : "#0F172A",
                    color: msg.role === "user" ? "#FFFFFF" : "#F1F5F9",
                    border:
                      msg.role === "user"
                        ? "1px solid rgba(96, 165, 250, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                    wordBreak: "break-word",
                    whiteSpace: msg.role === "user" ? "pre-wrap" : "normal",
                  }}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <SafeMarkdown content={msg.content} />
                  )}
                </div>

                {/* Public Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div
                    style={{
                      marginTop: 6,
                      maxWidth: "88%",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    {msg.sources.map((src, sIdx) => {
                      const isInternal = src.url.startsWith("/");
                      return (
                        <a
                          key={sIdx}
                          href={src.url}
                          target={isInternal ? "_self" : "_blank"}
                          rel={isInternal ? undefined : "noopener noreferrer"}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "rgba(30, 41, 59, 0.6)",
                            border: "1px solid rgba(56, 189, 248, 0.2)",
                            color: "#38BDF8",
                            textDecoration: "none",
                          }}
                        >
                          <span>{src.title}</span>
                          <ExternalLink size={10} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "10px 14px",
                borderRadius: 12,
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                color: "#94A3B8",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#38BDF8",
                  animation: "pulse 1s infinite alternate",
                }}
              />
              Thinking &amp; synthesizing sources...
            </div>
          )}

          {/* Error Message & Retry */}
          {error && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(153, 27, 27, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#FCA5A5",
                fontSize: 12,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
              {lastFailedPrompt && (
                <button
                  type="button"
                  onClick={handleRetry}
                  style={{
                    alignSelf: "flex-start",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: 4,
                    color: "#F8FAFC",
                    padding: "3px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Retry Question
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar pinned to bottom */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            padding: "12px 14px",
            background: "#0B1120",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#060A14",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 10,
              padding: "4px 6px 4px 12px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Lokesh's skills, projects..."
              disabled={isLoading}
              aria-label="Ask a question about Lokesh"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#F8FAFC",
                fontSize: 13,
                lineHeight: 1.4,
              }}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Submit question"
              style={{
                background: input.trim() && !isLoading ? "#0284C7" : "rgba(255, 255, 255, 0.06)",
                color: input.trim() && !isLoading ? "#FFFFFF" : "#64748B",
                border: "none",
                borderRadius: 7,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                transition: "all 0.15s ease",
              }}
            >
              <Send size={14} />
            </button>
          </div>

          {/* Disclaimer Notice */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
              fontSize: 10.5,
              color: "#64748B",
            }}
          >
            <span>AI-generated &middot; Grounded in public portfolio facts</span>
            <span>{input.length}/500</span>
          </div>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Floating Trigger Button: Layered at z-index 1020 (above page elements, won't conflict with navbar) */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close Ask Lokesh AI" : "Open Ask Lokesh AI Assistant"}
        aria-expanded={isOpen}
        style={{
          position: "fixed",
          bottom: "max(24px, calc(env(safe-area-inset-bottom) + 24px))",
          right: "max(24px, calc(env(safe-area-inset-right) + 24px))",
          zIndex: 1020,
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "11px 18px",
          background: "linear-gradient(135deg, #0B1120 0%, #111E38 100%)",
          border: "1px solid rgba(56, 189, 248, 0.4)",
          borderRadius: 9999,
          color: "#F8FAFC",
          fontSize: 13.5,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(56, 189, 248, 0.2)",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.7)";
          e.currentTarget.style.boxShadow =
            "0 12px 28px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
          e.currentTarget.style.boxShadow =
            "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(56, 189, 248, 0.2)";
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "rgba(56, 189, 248, 0.15)",
            color: "#38BDF8",
          }}
        >
          <Sparkles size={13} />
        </span>
        <span>Ask Lokesh AI</span>
      </button>

      {/* Render Dialog and Backdrop through React Portal directly into body */}
      {isOpen && mounted && createPortal(dialogPortalContent, document.body)}
    </>
  );
}
