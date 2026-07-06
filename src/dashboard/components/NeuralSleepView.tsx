import React, { useState, useEffect } from 'react';
import { RawDemoTrace } from '../mockData.ts';
import { Server, Brain, ShieldAlert, Cpu, Eye } from 'lucide-react';

interface NeuralProps {
  trace: RawDemoTrace;
  isDreaming: boolean;
  dreamStep: number;
}

export default function NeuralSleepView({ trace, isDreaming, dreamStep }: NeuralProps) {
  const [animationTime, setAnimationTime] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (isDreaming) {
      interval = setInterval(() => {
        setAnimationTime((prev) => prev + 1);
      }, 150);
    } else {
      setAnimationTime(0);
    }
    return () => clearInterval(interval);
  }, [isDreaming]);

  return (
    <div className="w-full h-[550px] bg-slate-950 rounded-xl relative overflow-hidden flex flex-col justify-between border border-slate-900/80 p-4">
      {/* 背景梦境图层 */}
      <div className="absolute inset-0 z-0">
        <svg className="w-full h-full">
          {/* 力学突触连线 */}
          <g stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1.5">
            <line x1="15%" y1="50%" x2="50%" y2="25%" className={dreamStep >= 3 ? "pulse-line text-cyan-500/50" : ""} />
            <line x1="15%" y1="50%" x2="50%" y2="50%" className={dreamStep >= 3 ? "pulse-line text-cyan-500/50" : ""} />
            <line x1="15%" y1="50%" x2="50%" y2="75%" className={dreamStep >= 3 ? "pulse-line text-cyan-500/50" : ""} />
            <line x1="50%" y1="25%" x2="85%" y2="35%" className={dreamStep >= 3 ? "pulse-line text-purple-500/50" : ""} />
            <line x1="50%" y1="50%" x2="85%" y2="35%" className={dreamStep >= 3 ? "pulse-line text-purple-500/50" : ""} />
            <line x1="50%" y1="75%" x2="85%" y2="65%" className={dreamStep >= 3 ? "pulse-line text-amber-500/50" : ""} />
            <line x1="50%" y1="50%" x2="85%" y2="65%" className={dreamStep >= 3 ? "pulse-line text-amber-500/50" : ""} />
          </g>

          {/* dreaming 状态下的动态流动电突触 */}
          {isDreaming && (
            <g fill="#00f0ff">
              {dreamStep === 1 && (
                <>
                  <circle cx={`${15 + animationTime * 3}%`} cy="50%" r="3" className="animate-ping" />
                  <circle cx={`${15 + animationTime * 4}%`} cy="45%" r="2" />
                  <circle cx={`${15 + animationTime * 2.5}%`} cy="55%" r="2.5" />
                </>
              )}
              {dreamStep === 2 && (
                <>
                  <circle cx={`${40 + animationTime * 1.5}%`} cy="35%" r="3" className="fill-purple-400 animate-pulse" />
                  <circle cx={`${42 + animationTime * 1.2}%`} cy="65%" r="3" className="fill-amber-400 animate-pulse" />
                </>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* 节点层 (浮动层) */}
      <div className="absolute inset-0 flex items-center justify-between px-12 z-10">
        {/* 左端：数据感知源 (Raw Sensory Log) */}
        <div className="flex flex-col items-center gap-2">
          <div className={`p-4 bg-slate-900/90 rounded-full border ${
            dreamStep >= 1 ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.3)] text-cyan-400' : 'border-slate-800 text-slate-500'
          } transition duration-500`}>
            <Server className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400">Raw Trace Input</span>
          <span className="text-[9px] font-mono text-slate-500">24,510 Tokens</span>
        </div>

        {/* 中间：梦境整理过滤器 (Morpheus Dream Core) */}
        <div className="flex flex-col items-center gap-2">
          <div className={`p-6 bg-slate-900/90 rounded-full border ${
            dreamStep === 1 ? 'border-cyan-400 animate-pulse' :
            dreamStep === 2 ? 'border-purple-400 shadow-[0_0_20px_rgba(189,0,255,0.3)] text-purple-400' :
            dreamStep === 3 ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)] text-cyan-400' :
            'border-slate-800 text-slate-400'
          } transition duration-500 relative`}>
            <Brain className={`w-12 h-12 ${dreamStep === 2 ? 'animate-[spin_10s_linear_infinite]' : ''}`} />
            {isDreaming && (
              <span className="absolute inset-0 border border-cyan-500 rounded-full animate-ping opacity-30"></span>
            )}
          </div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400">Morpheus Consolidation</span>
          <span className="text-[9px] font-mono text-slate-500">
            {dreamStep === 0 && 'Ready to Scan'}
            {dreamStep === 1 && 'Reading raw trace segments...'}
            {dreamStep === 2 && 'Filtering out noise/redundancies...'}
            {dreamStep === 3 && 'Consolidating long-term facts...'}
            {dreamStep === 4 && 'Consolidation complete!'}
          </span>
        </div>

        {/* 右端：知识沉淀突触 (Synaptic Knowledge Nodes) */}
        <div className="flex flex-col gap-10">
          {/* 长期事实实体 */}
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-slate-900/90 rounded-full border ${
              dreamStep >= 3 ? 'border-purple-500/60 shadow-[0_0_15px_rgba(189,0,255,0.2)] text-purple-400' : 'border-slate-800 text-slate-500'
            } transition duration-500`}>
              <Cpu className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold text-slate-300">Long-term Memory</span>
              <span className="block text-[9px] font-mono text-slate-500">
                {dreamStep >= 3 ? `Consolidated ${trace.facts.length} Facts` : '0 Facts'}
              </span>
            </div>
          </div>

          {/* 警报、技术债 */}
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-slate-900/90 rounded-full border ${
              dreamStep >= 3 ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-400' : 'border-slate-800 text-slate-500'
            } transition duration-500`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold text-slate-300">Cognitive Insights</span>
              <span className="block text-[9px] font-mono text-slate-500">
                {dreamStep >= 3 ? `Generated ${trace.insights.length} Items` : '0 Issues'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部控制台输出 */}
      <div className="z-10 bg-slate-950/80 border border-slate-900 p-3 rounded-lg font-mono text-[10px] text-cyan-400 leading-relaxed max-h-24 overflow-y-auto">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1 border-b border-slate-900 pb-1">
          <Eye className="w-3.5 h-3.5" />
          CONSOLE REPLAY ENGINE
        </div>
        {dreamStep === 0 && <p className="text-slate-500">&gt; Morpheus engine idle. Click 'Trigger Consolidation' to start.</p>}
        {dreamStep >= 1 && <p>&gt; Reading session logs... parsing 24kb execution raw trace.</p>}
        {dreamStep >= 2 && <p className="text-purple-400">&gt; Scanning raw events... Filtered 95% redundant telemetry trace (network retries / loop hearts).</p>}
        {dreamStep >= 3 && <p className="text-cyan-300">&gt; Synaptic connecting. Formulating relational mappings for {trace.agentName} inside {trace.projectSlug}.</p>}
        {dreamStep >= 4 && (
          <>
            <p className="text-emerald-400">&gt; Consolidation Complete. Evaluated health score: {trace.healthScore}/100. Recorded in Prisma local engine successfully.</p>
            <p className="text-slate-400">&gt; Long-term facts: {trace.facts[0]}</p>
          </>
        )}
      </div>
    </div>
  );
}
