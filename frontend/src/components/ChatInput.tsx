"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, StopCircle } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickPrompts = [
    "What is the current date and time?",
    "Wait for 3 seconds then tell me a joke",
    "List files in the downloads directory using filesystem MCP",
    "Open chrome and take a screenshot of frontend",
  ];

  return (
    <div className="space-y-3">
      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium whitespace-nowrap pl-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Suggestions:</span>
        </div>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            disabled={isLoading}
            className="text-xs bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your MCP agent (e.g. browser tasks, datetime, filesystem)..."
          rows={1}
          disabled={isLoading}
          className="w-full bg-slate-900/90 border border-slate-800 focus:border-blue-500/50 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 backdrop-blur-md resize-none shadow-lg shadow-black/20"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-600/30"
        >
          {isLoading ? (
            <StopCircle className="w-4 h-4 animate-pulse" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};
