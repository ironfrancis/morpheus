import React, { useState, useEffect } from 'react';
import { demoTraces, RawDemoTrace } from './mockData.ts';
import NeuralSleepView from './components/NeuralSleepView.tsx';
import CognitiveTimeline from './components/CognitiveTimeline.tsx';
import MemoryArchive from './components/MemoryArchive.tsx';
import { Brain, Sparkles, Activity, FileText, RefreshCw, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [selectedTrace, setSelectedTrace] = useState<RawDemoTrace>(demoTraces[0]);
  const [activeTab, setActiveTab] = useState<'neural' | 'timeline' | 'archive'>('neural');
  const [isDreaming, setIsDreaming] = useState<boolean>(false);
  const [dreamStep, setDreamStep] = useState<number>(0); // 0: Idle, 1: Reading, 2: Filtering, 3: Consolidating, 4: Finished
  const [customTrace, setRawCustomTrace] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [sessionHistory, setSessionHistory] = useState<RawDemoTrace[]>(demoTraces);

  // 触发梦境整理流程
  const handleTriggerDream = () => {
    setIsDreaming(true);
    setDreamStep(1);
  };

  useEffect(() => {
    if (!isDreaming) return;

    const step1 = setTimeout(() => setDreamStep(2), 2000);
    const step2 = setTimeout(() => setDreamStep(3), 4000);
    const step3 = setTimeout(() => {
      setDreamStep(4);
      setIsDreaming(false);
    }, 7000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  }, [isDreaming, selectedTrace]);

  // 自定义日志导入
  const handleAddCustomTrace = () => {
    if (!customTrace.trim()) return;

    const newTrace: RawDemoTrace = {
      id: `custom-${Date.now()}`,
      agentId: "morpheus-cloud-agent",
      agentName: "莫菲斯 (Morpheus)",
      projectSlug: "morpheus",
      projectName: "Morpheus记忆巩固系统",
      date: new Date().toLocaleString(),
      rawTrace: customTrace,
      summary: `由 Morpheus 离线引擎对导入的自定义 Trace 进行了语义压缩与突触抽取。检测到了潜在系统报错，提取了实体属性，归纳了关键认知成果。`,
      healthScore: customTrace.toLowerCase().includes('error') ? 72 : 98,
      facts: [
        "用户手动向 Morpheus 梦境整合控制台喂入了第三方执行日志。",
        "成功抽取出运行时上下文节点，对异常流程执行了高能过滤并织网。"
      ],
      insights: [
        {
          type: customTrace.toLowerCase().includes('error') ? "WARNING" : "ACHIEVEMENT",
          category: "CUSTOM_TRACE",
          title: customTrace.toLowerCase().includes('error') ? "检测到异常日志特征" : "自定义日志导入成功",
          content: "提炼分析出包含多级步骤和工具响应的运行时上下文，已全量导入本地图谱。"
        }
      ]
    };

    setSessionHistory([newTrace, ...sessionHistory]);
    setSelectedTrace(newTrace);
    setShowCustomModal(false);
    setRawCustomTrace('');
    // 自动播放新日志的梦境整理
    setIsDreaming(true);
    setDreamStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans cyber-grid selection:bg-cyan-500 selection:text-slate-900">
      {/* 头部 */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/50 rounded-lg border border-cyan-500/30">
            <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-cyan-400 flex items-center gap-2">
              MORPHEUS
              <span className="text-xs bg-cyan-950 border border-cyan-500/40 px-2 py-0.5 rounded text-cyan-300 font-mono">
                v1.0.0-Beta
              </span>
            </h1>
            <p className="text-xs text-slate-400">看山实验室 · Agent 离线记忆整理与认知回放系统</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button 
            onClick={() => setShowCustomModal(true)}
            className="px-3 py-1.5 border border-cyan-500/30 text-cyan-400 rounded-md hover:bg-cyan-950/40 hover:border-cyan-400 transition"
          >
            导入自定义 Trace 日志
          </button>
          <div className="flex items-center gap-2 border border-slate-800 bg-slate-900/40 px-3 py-1.5 rounded-md font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Consolidation Engine: ONLINE</span>
          </div>
        </div>
      </header>

      {/* 主区 */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1600px] w-full mx-auto">
        {/* 左侧：Trace 来源与会话历史 */}
        <div className="lg:col-span-1 flex flex-col gap-6 bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl backdrop-blur-sm h-[calc(100vh-140px)] overflow-y-auto">
          <div>
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              选择梦境重放会话
            </h2>
            <div className="flex flex-col gap-2.5">
              {sessionHistory.map((trace) => (
                <button
                  key={trace.id}
                  onClick={() => { if (!isDreaming) setSelectedTrace(trace); }}
                  className={`text-left p-3 rounded-lg border transition text-xs relative ${
                    selectedTrace.id === trace.id
                      ? 'bg-slate-900 border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                      : 'bg-slate-950/50 border-slate-900/80 hover:bg-slate-900/40 hover:border-slate-800'
                  } ${isDreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-slate-500">{trace.date}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      trace.healthScore >= 90 
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-950/50 text-amber-400 border border-amber-500/20'
                    }`}>
                      健康度: {trace.healthScore}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    {trace.projectName}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{trace.summary}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-900/80 pt-4 text-[11px] text-slate-500 flex flex-col gap-2 leading-relaxed">
            <div className="flex items-center gap-1.5 text-cyan-500/60 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              MORPHEUS SYSTEM STATUS
            </div>
            <p>Morpheus 能够对冗长的 Agent CLI 日志执行过滤、解构与关系重塑。在此进行模拟的离线记忆提炼。</p>
          </div>
        </div>

        {/* 右侧：梦境整合控制台 */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-[calc(100vh-140px)]">
          {/* 上部：项目总结面板 */}
          <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                  Project: {selectedTrace.projectSlug}
                </span>
                <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                  Agent: {selectedTrace.agentName}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
                {selectedTrace.projectName} 整合总结
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isDreaming ? '墨菲斯梦境巩固引擎正在深度解析和压缩日志...' : selectedTrace.summary}
              </p>
            </div>

            <div className="flex items-center gap-4 border-l md:border-l border-slate-900 pl-0 md:pl-4">
              <button
                onClick={handleTriggerDream}
                disabled={isDreaming}
                className={`px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-100 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition text-xs font-semibold flex items-center gap-1.5 cyber-glow shadow-[0_0_15px_rgba(0,240,255,0.15)] ${
                  isDreaming ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDreaming ? 'animate-spin' : ''}`} />
                {isDreaming ? '正在做梦巩固中...' : '触发梦境整合提炼 (Consolidate)'}
              </button>
            </div>
          </div>

          {/* 中间：梦境整理主展台 */}
          <div className="flex-1 bg-slate-950/80 border border-slate-900 rounded-xl overflow-hidden flex flex-col relative">
            {/* 顶部标签 */}
            <div className="flex border-b border-slate-900 bg-slate-950">
              <button
                onClick={() => setActiveTab('neural')}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'neural'
                    ? 'border-cyan-500 text-cyan-400 bg-slate-900/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                Neural Sleep View (神经睡眠可视化)
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'timeline'
                    ? 'border-cyan-500 text-cyan-400 bg-slate-900/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Cognitive Timeline (认知提炼时间轴)
              </button>
              <button
                onClick={() => setActiveTab('archive')}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'archive'
                    ? 'border-cyan-500 text-cyan-400 bg-slate-900/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Memory Archive (巩固事实与技术债库)
              </button>
            </div>

            {/* 梦境状态条（当 dreaming 时高亮） */}
            {isDreaming && (
              <div className="absolute top-[41px] left-0 right-0 h-1 bg-slate-900 overflow-hidden z-20">
                <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 w-1/3 animate-[infinite_shimmer_1.5s_linear_infinite]" style={{
                  animation: 'shimmer 2s infinite linear'
                }}></div>
              </div>
            )}

            {/* 内容容器 */}
            <div className="flex-1 p-4 relative overflow-y-auto">
              {activeTab === 'neural' && (
                <NeuralSleepView 
                  trace={selectedTrace} 
                  isDreaming={isDreaming} 
                  dreamStep={dreamStep} 
                />
              )}
              {activeTab === 'timeline' && (
                <CognitiveTimeline 
                  trace={selectedTrace} 
                  isDreaming={isDreaming} 
                  dreamStep={dreamStep} 
                />
              )}
              {activeTab === 'archive' && (
                <MemoryArchive 
                  trace={selectedTrace} 
                  isDreaming={isDreaming} 
                  dreamStep={dreamStep} 
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 导入日志模态窗 */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 flex flex-col gap-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div>
              <h3 className="text-base font-bold text-slate-200">导入外部 Trace 日志进行梦境整合</h3>
              <p className="text-xs text-slate-400 mt-1">在这里可以直接粘贴你的 Agent 终端输出或者带有 API 请求的任意运行 Trace。Morpheus 能够自动剔除冗余重试，织网和提取健康度。</p>
            </div>
            <textarea
              value={customTrace}
              onChange={(e) => setRawCustomTrace(e.target.value)}
              placeholder="粘贴你的 verbose agent trace 文本在这里..."
              className="w-full h-80 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50 resize-none"
            ></textarea>
            <div className="flex items-center justify-end gap-3 text-xs font-semibold">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition"
              >
                取消
              </button>
              <button
                onClick={handleAddCustomTrace}
                className="px-4 py-2 bg-cyan-600 rounded-lg text-slate-100 hover:bg-cyan-500 transition cyber-glow"
              >
                确定导入并开始分析
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="border-t border-slate-900/60 bg-slate-950/80 backdrop-blur-md py-4 px-6 text-center text-slate-500 text-xs flex items-center justify-between">
        <p>看山实验室（KanShan AI Lab）· 2026</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Morpheus Cloud Assistant
        </p>
      </footer>
    </div>
  );
}
