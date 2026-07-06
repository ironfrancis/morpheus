import React from 'react';
import { RawDemoTrace } from '../mockData.ts';
import { Layers, CheckCircle2, ChevronRight } from 'lucide-react';

interface TimelineProps {
  trace: RawDemoTrace;
  isDreaming: boolean;
  dreamStep: number;
}

export default function CognitiveTimeline({ trace, isDreaming, dreamStep }: TimelineProps) {
  if (dreamStep < 2 && isDreaming) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 font-mono flex flex-col items-center justify-center gap-3">
        <Layers className="w-8 h-8 text-cyan-500 animate-spin" />
        正在扫描并压缩原始 trace 日志 (24KB)...
      </div>
    );
  }

  const lines = trace.rawTrace.trim().split('\n').filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-slate-900/80 p-4 rounded-xl">
      {/* 左侧：压缩后认知提炼 */}
      <div className="flex flex-col gap-4">
        <h4 className="text-xs font-bold text-slate-400 border-b border-slate-900 pb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          压缩重组认知事实 (Cognitive Steps)
        </h4>
        <div className="flex flex-col gap-3">
          {trace.facts.map((fact, index) => (
            <div key={index} className="flex gap-2.5 p-3 rounded-lg bg-slate-900/20 border border-slate-900 text-xs leading-relaxed">
              <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300">{fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：原始 Trace 日志快照 */}
      <div className="flex flex-col gap-4">
        <h4 className="text-xs font-bold text-slate-400 border-b border-slate-900 pb-2">
          原始 Raw Trace (Verbose Output)
        </h4>
        <div className="bg-slate-950 border border-slate-900 p-3 rounded-lg h-[400px] overflow-y-auto font-mono text-[10px] text-slate-500 leading-relaxed">
          {lines.map((line, index) => (
            <p 
              key={index}
              className={
                line.includes('SUCCESS') ? 'text-emerald-500/70 font-semibold' :
                line.includes('WARN') ? 'text-amber-500/70' :
                line.includes('ERROR') ? 'text-rose-500/80' : ''
              }
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
