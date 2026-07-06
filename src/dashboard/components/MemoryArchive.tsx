import React from 'react';
import { RawDemoTrace } from '../mockData.ts';
import { AlertTriangle, Award, Info } from 'lucide-react';

interface ArchiveProps {
  trace: RawDemoTrace;
  isDreaming: boolean;
  dreamStep: number;
}

export default function MemoryArchive({ trace, isDreaming, dreamStep }: ArchiveProps) {
  if (dreamStep < 3 && isDreaming) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 font-mono flex flex-col items-center justify-center gap-3">
        <Award className="w-8 h-8 text-purple-500 animate-bounce" />
        正在整理归档长期记忆和关系实体...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧：整理的长期经验 (Memory facts) */}
        <div className="flex flex-col gap-4 bg-slate-900/20 border border-slate-900 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
            <Award className="w-4 h-4" />
            长期记忆与项目健康事实
          </h4>
          <div className="flex flex-col gap-3">
            {trace.facts.map((fact, index) => (
              <div key={index} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed border-l-2 border-purple-500/60 pl-3 py-1">
                <p>{fact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：警报与技术债 (Insights) */}
        <div className="flex flex-col gap-4 bg-slate-900/20 border border-slate-900 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
            <AlertTriangle className="w-4 h-4" />
            智能洞察、潜在技术债与警报
          </h4>
          <div className="flex flex-col gap-3">
            {trace.insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  insight.type === 'WARNING' 
                    ? 'bg-rose-950/20 border-rose-500/30' 
                    : 'bg-amber-950/20 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1.5">
                  {insight.type === 'WARNING' ? (
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                  <span className={insight.type === 'WARNING' ? 'text-rose-400' : 'text-amber-400'}>
                    [{insight.category}] {insight.title}
                  </span>
                </div>
                <p className="text-slate-400">{insight.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部使用引导 */}
      <div className="border border-slate-900 p-4 rounded-xl bg-slate-950/40 text-xs leading-relaxed text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-400 mb-1">Morpheus MCP 引擎如何与其他 Agent 协同？</p>
          <p>数字员工在执行任务前会先在初始化阶段调用 `query_agent_memories` 查询对应项目的长期记忆事实。Morpheus 会返回此前整合提炼的核心事实及踩坑经验（例如：对 oil-icon 替换时注意 zero-dependency 前端规范），从而使 Agent 避免重复踩坑，具有跨会话的持续脑容进化！</p>
        </div>
      </div>
    </div>
  );
}
