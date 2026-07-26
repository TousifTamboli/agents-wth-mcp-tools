"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header } from "../components/Header";
import { ChatMessage, Message } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";
import { ToolExecution } from "../components/ToolCallBadge";
import { Sparkles, Terminal, ShieldCheck, Wrench } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Home() {
  const [threadId, setThreadId] = useState<string>("session-default");

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewSession = () => {
    setThreadId("session-" + Math.floor(Math.random() * 10000));
    setMessages([]);
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      role: "assistant",
      content: "",
      tools: [],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage, initialBotMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          thread_id: threadId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));

            if (data.type === "text_chunk") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, content: msg.content + data.content }
                    : msg
                )
              );
            } else if (data.type === "tool_start") {
              const newTool: ToolExecution = {
                id: `${data.name}-${Date.now()}`,
                name: data.name,
                inputs: data.inputs,
                status: "running",
              };

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, tools: [...(msg.tools || []), newTool] }
                    : msg
                )
              );
            } else if (data.type === "tool_end") {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== botMessageId) return msg;
                  const updatedTools = (msg.tools || []).map((t) =>
                    t.name === data.name && t.status === "running"
                      ? { ...t, output: data.output, status: "completed" as const }
                      : t
                  );
                  return { ...msg, tools: updatedTools };
                })
              );
            }
          } catch (err) {
            console.error("Error parsing SSE JSON chunk:", err);
          }
        }
      }
    } catch (error: any) {
      console.error("Chat API error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content:
                  msg.content ||
                  `⚠️ Could not connect to Python backend at ${BACKEND_URL}. Ensure 'python3 server.py' is running. Error: ${error.message}`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Header */}
      <Header threadId={threadId} onNewSession={handleNewSession} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col justify-between">
        {messages.length === 0 ? (
          /* Hero Welcome Card */
          <div className="my-auto py-12 px-6 rounded-3xl glass-panel text-center max-w-2xl mx-auto space-y-6 border border-slate-800/80 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                LangGraph & Model Context Protocol Agent
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Interact with your AI agent backed by Chrome DevTools MCP, Filesystem MCP, and custom tools in real-time.
              </p>
            </div>

            {/* Tool Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Chrome DevTools</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Inspect pages, navigate web forms, take full-page screenshots & automate DOM actions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Filesystem MCP</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Safely list, read, search, and manage files in your allowed directories.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Custom Tools</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Built-in date/time utils, async waits, and extensible LangChain tool bindings.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Message List */
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Floating Input Section */}
        <div className="sticky bottom-4 mt-6 pt-2 bg-slate-950/90 backdrop-blur-md">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
