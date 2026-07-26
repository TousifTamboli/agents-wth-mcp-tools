"use client";

import React, { useState } from "react";
import { User, Bot, Copy, Check } from "lucide-react";
import { ToolCallBadge, ToolExecution } from "./ToolCallBadge";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tools?: ToolExecution[];
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3.5 my-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/10 border border-blue-400/20">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[82%] group`}>
        <div
          className={`p-4 rounded-2xl ${
            isUser
              ? "bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-600/20"
              : "bg-slate-900/80 border border-slate-800 text-slate-100 rounded-bl-xs backdrop-blur-md"
          }`}
        >
          {/* Render MCP Tools called during message turn */}
          {message.tools && message.tools.length > 0 && (
            <div className="mb-3 space-y-1">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Tool Operations ({message.tools.length})
              </span>
              {message.tools.map((tool) => (
                <ToolCallBadge key={tool.id} tool={tool} />
              ))}
            </div>
          )}

          {/* Message Text Content */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
            {message.content ? (
              message.content
            ) : (
              message.tools && message.tools.length > 0 && (
                <span className="italic text-slate-400 text-xs">Executing MCP tools...</span>
              )
            )}
          </div>
        </div>

        {/* Message Footer */}
        <div className={`flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-500 ${isUser ? "justify-end" : "justify-start"}`}>
          <span>{message.timestamp}</span>
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 border border-slate-700">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
