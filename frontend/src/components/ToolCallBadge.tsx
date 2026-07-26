"use client";

import React, { useState } from "react";
import { Wrench, ChevronDown, ChevronUp, CheckCircle, Loader2 } from "lucide-react";

export interface ToolExecution {
  id: string;
  name: string;
  inputs?: Record<string, any>;
  output?: string;
  status: "running" | "completed";
}

interface ToolCallBadgeProps {
  tool: ToolExecution;
}

export const ToolCallBadge: React.FC<ToolCallBadgeProps> = ({ tool }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-2 text-xs rounded-lg overflow-hidden border border-slate-800 bg-slate-900/60 backdrop-blur-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {tool.status === "running" ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="font-mono font-medium text-slate-300 flex items-center gap-1.5">
            <Wrench className="w-3 h-3 text-purple-400" />
            {tool.name}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              tool.status === "running"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {tool.status === "running" ? "Executing..." : "Completed"}
          </span>
        </div>

        <div className="flex items-center text-slate-400">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {expanded && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 font-mono text-[11px] text-slate-300 space-y-2">
          {tool.inputs && Object.keys(tool.inputs).length > 0 && (
            <div>
              <span className="text-slate-500 font-semibold block mb-1">INPUTS:</span>
              <pre className="p-2 rounded bg-slate-900/80 overflow-x-auto text-blue-300 border border-slate-800">
                {JSON.stringify(tool.inputs, null, 2)}
              </pre>
            </div>
          )}

          {tool.output && (
            <div>
              <span className="text-slate-500 font-semibold block mb-1">OUTPUT / RESULT:</span>
              <pre className="p-2 rounded bg-slate-900/80 overflow-x-auto text-emerald-300 max-h-40 border border-slate-800">
                {tool.output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
