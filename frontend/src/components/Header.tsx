"use client";

import React from "react";
import { Cpu, RefreshCw, Globe, FolderGit2, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  threadId: string;
  onNewSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({ threadId, onNewSession }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Title & MCP Status */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                MCP Agent Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                LangGraph v1.2
              </span>
            </div>

            {/* Active MCP Badges */}
            <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Chrome DevTools MCP</span>
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FolderGit2 className="w-3 h-3 text-amber-400" />
                <span>Filesystem MCP</span>
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Thread: {threadId}</span>
          </div>

          <button
            onClick={onNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
            title="Start a fresh conversation thread"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>
      </div>
    </header>
  );
};
