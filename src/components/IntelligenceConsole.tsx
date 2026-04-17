import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Search, 
  Database, 
  History, 
  Activity, 
  Shield, 
  Zap, 
  ChevronRight, 
  Clock, 
  Terminal,
  BrainCircuit,
  Network,
  Fingerprint,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { cn } from '../lib/utils';
import DocumentScanner from './DocumentScanner';
import AnalysisResult from './AnalysisResult';
import KnowledgebaseManager from './KnowledgebaseManager';
import { analyzeFileData, IntelligenceResult } from '../services/llama';

const PIPELINE_STEPS = [
  { id: 'query', label: 'Query Analysis', icon: MessageSquare },
  { id: 'retrieval', label: 'Context Retrieval', icon: Database },
  { id: 'verification', label: 'Context Verification', icon: ShieldCheck },
  { id: 'synthesis', label: 'Neural Synthesis', icon: BrainCircuit },
  { id: 'output', label: 'Intelligence Output', icon: Sparkles },
];

export default function IntelligenceConsole() {
  const [selectedFile, setSelectedFile] = useState<{ file: File; base64: string; mimeType: string } | null>(null);
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [result, setResult] = useState<IntelligenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ query: string; answer?: string; timestamp: Date; type: string }[]>(() => {
    const saved = localStorage.getItem('aether_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [consoleId] = useState(() => Math.random().toString(36).substring(7).toUpperCase());
  
  // System Vitals Simulation State
  const [vitals, setVitals] = useState({
    cpu: 24.8,
    memory: 1.2,
    nodes: 12,
    latency: 0
  });

  // Advanced Config State
  const [useGrounding, setUseGrounding] = useState(true);
  const [model, setModel] = useState('llama-2-7b');
  const [temperature, setTemperature] = useState(0.4);
  const [showConfig, setShowConfig] = useState(false);
  // RAG State
  const [useRAG, setUseRAG] = useState(true);
  const [showKnowledgebase, setShowKnowledgebase] = useState(false);
  const [ragTopK, setRagTopK] = useState(3);
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const vitalsTimer = setInterval(() => {
      setVitals(prev => ({
        cpu: Math.min(100, Math.max(10, prev.cpu + (Math.random() * 4 - 2))),
        memory: Math.min(16, Math.max(0.5, prev.memory + (Math.random() * 0.1 - 0.05))),
        nodes: Math.floor(Math.random() * 5) + 10,
        latency: prev.latency
      }));
    }, 2000);
    return () => {
      clearInterval(timer);
      clearInterval(vitalsTimer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('aether_history', JSON.stringify(history));
  }, [history]);

  const handleFileSelect = (file: File, base64: string, mimeType: string) => {
    setSelectedFile({ file, base64, mimeType });
  };

  const handleAnalyze = async (overrideQuery?: string) => {
    const finalQuery = overrideQuery || query;
    if (!finalQuery.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    
    // Pipeline Simulation (Optimized for Maximum Speed)
    const runPipeline = async () => {
      setActiveStep('query');
      await new Promise(r => setTimeout(r, 20));
      setActiveStep('retrieval');
      await new Promise(r => setTimeout(r, 20));
      setActiveStep('verification');
      await new Promise(r => setTimeout(r, 20));
      setActiveStep('synthesis');
    };

    try {
      let response: any;

      if (useRAG && !selectedFile) {
        // Use RAG endpoint for knowledge base queries
        const ragPromise = fetch('/api/rag-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: finalQuery,
            use_rag: true,
            top_k: ragTopK,
            config: {
              useGrounding,
              model,
              temperature,
            },
          }),
        }).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          return r.json();
        });

        await Promise.all([runPipeline(), ragPromise]);
        response = await ragPromise;
      } else {
        // Use direct analysis (file-based or without RAG)
        const analysisPromise = analyzeFileData(
          finalQuery,
          selectedFile ? { data: selectedFile.base64, mimeType: selectedFile.mimeType } : undefined,
          {
            useGrounding,
            model,
            temperature,
            history: history.slice(0, 5).map(h => ({ query: h.query, answer: h.answer || '' })),
          }
        );

        await Promise.all([runPipeline(), analysisPromise]);
        response = await analysisPromise;
      }

      setActiveStep('output');
      await new Promise(r => setTimeout(r, 50));

      setResult(response);
      setHistory(prev => [
        {
          query: finalQuery,
          answer: response.answer,
          timestamp: new Date(),
          type: selectedFile ? selectedFile.file.type.split('/')[1].toUpperCase() : useRAG ? 'RAG' : 'GENERAL',
        },
        ...prev,
      ].slice(0, 20));
    } catch (err: any) {
      console.error("Analysis failed:", err);
      const errorMessage = err?.message || String(err);
      const errorString = errorMessage.toLowerCase();

      const isQuotaError =
        errorString.includes('429') ||
        errorString.includes('resource_exhausted') ||
        errorString.includes('quota');

      const isTransientError =
        errorString.includes('500') ||
        errorString.includes('rpc failed') ||
        errorString.includes('xhr error') ||
        errorString.includes('internal error');

      if (isQuotaError) {
        setError("SYSTEM OVERLOAD: Neural core quota exceeded. The system is cooling down. Please wait 30-60 seconds before retrying.");
      } else if (isTransientError) {
        setError("SIGNAL INTERFERENCE: Neural link dropped due to network instability. Retrying may restore the connection.");
      } else {
        setError(`CRITICAL ERROR: Neural synthesis failed. ${errorMessage}`);
      }
    } finally {
      setIsAnalyzing(false);
      setActiveStep(null);
    }
  };

  const suggestions = result ? [
    "Explain in more detail",
    "What are the implications?",
    "Summarize for an executive",
    "Identify potential risks"
  ] : [
    "Summarize intelligence",
    "Identify key risks",
    "Extract action items",
    "Technical deep dive"
  ];

  return (
    <div className="min-h-screen bg-aether-bg pt-24 pb-20 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Sidebar: System Vitals */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "space-y-6 transition-all duration-500",
            result ? "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 order-last" : "lg:col-span-3"
          )}
        >
          <div className="glass-panel p-6 border-l-4 border-aether-accent">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-aether-accent animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-aether-accent">System Vitals</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-aether-muted">
                  <span>Neural Load</span>
                  <span className="font-mono text-white">{vitals.cpu.toFixed(1)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-aether-accent"
                    animate={{ width: `${vitals.cpu}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="block text-[8px] uppercase tracking-widest text-aether-muted mb-1">Memory</span>
                  <span className="text-xs font-mono text-white">{vitals.memory.toFixed(1)} GB</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="block text-[8px] uppercase tracking-widest text-aether-muted mb-1">Nodes</span>
                  <span className="text-xs font-mono text-white">{vitals.nodes} Active</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-aether-muted" />
                  <span className="text-[10px] uppercase tracking-tighter text-aether-muted">Security Level</span>
                </div>
                <span className="text-xs font-mono text-aether-accent">OMEGA</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-aether-muted" />
                <span className="text-xs font-bold uppercase tracking-widest text-aether-muted">Neural History</span>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={() => setHistory([])}
                  className="text-[8px] uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                  <p className="text-[10px] text-aether-muted uppercase tracking-widest text-center py-10 opacity-50">No recent synthesis</p>
                ) : (
                  history.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-aether-accent/30 transition-all group cursor-pointer"
                      onClick={() => setQuery(item.query)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 rounded bg-aether-accent/20 text-aether-accent text-[8px] font-bold tracking-tighter uppercase">{item.type}</span>
                        <span className="text-[8px] text-aether-muted font-mono">{item.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">{item.query}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Main Console: Intelligence Synthesis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-12 space-y-12"
        >
          {/* Header HUD */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-aether-accent/20 rounded-full blur-2xl animate-pulse" />
                <div className="w-16 h-16 rounded-2xl bg-aether-accent flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-white/20">
                  <BrainCircuit className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tighter uppercase glitch-text" data-text="AETHER CONSOLE">Aether Console</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-aether-accent animate-ping" />
                    <span className="text-[10px] text-aether-accent font-bold uppercase tracking-widest">Universal Intelligence Active</span>
                  </div>
                  <span className="text-aether-muted text-[10px] uppercase tracking-widest">•</span>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3 h-3 text-aether-muted" />
                    <span className="text-[10px] text-aether-muted font-mono">{currentTime.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-3">
                <Network className="w-4 h-4 text-aether-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Node: ASIA-SE-1</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-3">
                <Fingerprint className="w-4 h-4 text-aether-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">ID: {consoleId}</span>
              </div>
            </div>
          </div>

          {/* Pipeline Visualization */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel p-6 overflow-hidden"
              >
                <div className="flex justify-between items-center relative">
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0" />
                  {PIPELINE_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = activeStep === step.id;
                    const isCompleted = PIPELINE_STEPS.findIndex(s => s.id === activeStep) > i;
                    
                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center space-y-3">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                          isActive ? "bg-aether-accent border-aether-accent shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110" : 
                          isCompleted ? "bg-aether-accent/20 border-aether-accent text-aether-accent" : 
                          "bg-aether-card border-white/10 text-aether-muted"
                        )}>
                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className={cn("w-6 h-6", isActive ? "text-white animate-pulse" : "")} />}
                        </div>
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-widest transition-colors duration-500",
                          isActive ? "text-aether-accent" : "text-aether-muted"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Column: Input & Controls */}
            <div className="space-y-10 lg:sticky lg:top-12 z-20">
              {/* Knowledge Base Manager */}
              <KnowledgebaseManager isOpen={showKnowledgebase} onToggle={() => setShowKnowledgebase(!showKnowledgebase)} />

              {/* Input Section: Scanner & Config */}
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <DocumentScanner onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} />
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setShowKnowledgebase(!showKnowledgebase)}
                      className={cn(
                        "p-3 rounded-xl border transition-all",
                        showKnowledgebase ? "bg-aether-accent/20 border-aether-accent text-aether-accent" : "bg-white/5 border-white/10 text-aether-muted hover:text-white"
                      )}
                      title="Knowledge Base"
                    >
                      <BookOpen className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setShowConfig(!showConfig)}
                      className={cn(
                        "p-3 rounded-xl border transition-all",
                        showConfig ? "bg-aether-accent/20 border-aether-accent text-aether-accent" : "bg-white/5 border-white/10 text-aether-muted hover:text-white"
                      )}
                      title="Advanced Config"
                    >
                      <Cpu className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showConfig && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="glass-panel p-6 grid grid-cols-1 gap-6 border-aether-accent/20">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-aether-muted">RAG Mode</label>
                          <button 
                            onClick={() => setUseRAG(!useRAG)}
                            className={cn(
                              "w-full py-2 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest",
                              useRAG ? "bg-aether-accent/20 border-aether-accent text-aether-accent" : "bg-white/5 border-white/10 text-aether-muted"
                            )}
                          >
                            {useRAG ? 'RAG Enabled' : 'RAG Disabled'}
                          </button>
                        </div>
                        {useRAG && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-aether-muted">Context Chunks (Top-K)</label>
                            <div className="flex items-center space-x-4">
                              <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                step="1"
                                value={ragTopK}
                                onChange={(e) => setRagTopK(parseInt(e.target.value))}
                                className="flex-1 accent-aether-accent"
                              />
                              <span className="text-xs font-mono text-aether-accent">{ragTopK}</span>
                            </div>
                          </div>
                        )}
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-aether-muted">Neural Model</label>
                          <select 
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-aether-accent outline-none"
                          >
                            <option value="llama3">LLaMA 3</option>
                            <option value="llama2">LLaMA 2</option>
                            <option value="mistral">Mistral</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-aether-muted">Neural Depth (Temp)</label>
                          <div className="flex items-center space-x-4">
                            <input 
                              type="range" 
                              min="0" 
                              max="1" 
                              step="0.1"
                              value={temperature}
                              onChange={(e) => setTemperature(parseFloat(e.target.value))}
                              className="flex-1 accent-aether-accent"
                            />
                            <span className="text-xs font-mono text-aether-accent">{temperature}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-aether-muted">Grounding</label>
                          <button 
                            onClick={() => setUseGrounding(!useGrounding)}
                            className={cn(
                              "w-full py-2 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest",
                              useGrounding ? "bg-aether-accent/20 border-aether-accent text-aether-accent" : "bg-white/5 border-white/10 text-aether-muted"
                            )}
                          >
                            {useGrounding ? 'Grounding Active' : 'Grounding Disabled'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Command Input Area */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnalyze(s)}
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] text-aether-muted hover:text-aether-accent hover:border-aether-accent/30 transition-all uppercase tracking-widest"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-aether-accent to-amber-500 rounded-3xl blur opacity-10 group-focus-within:opacity-30 transition duration-1000 pointer-events-none" />
                  <div className="relative glass-panel p-2 flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="pl-4 text-aether-accent">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        placeholder="Enter command..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-aether-muted py-4 text-base font-medium"
                      />
                    </div>
                    <button 
                      onClick={() => handleAnalyze()}
                      disabled={isAnalyzing || !query.trim()}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-3",
                        isAnalyzing || !query.trim() 
                          ? "bg-white/5 text-aether-muted cursor-not-allowed" 
                          : "bg-aether-accent text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95"
                      )}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Synthesizing...</span>
                        </>
                      ) : (
                        <>
                          <span>Execute Synthesis</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Results & Errors */}
            <div className="w-full">
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full"
                  >
                    <div className="relative group/result">
                      <div className="absolute -inset-1 bg-gradient-to-b from-aether-accent/10 to-transparent rounded-[2rem] blur-2xl -z-10 opacity-50 group-hover/result:opacity-100 transition-opacity duration-1000" />
                      <AnalysisResult result={result} />
                    </div>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-8 border-red-500/20 flex flex-col items-center text-center space-y-4"
                  >
                    <AlertCircle className="w-12 h-12 text-red-500 animate-pulse" />
                    <p className="text-sm text-red-400 font-mono">{error}</p>
                    <button 
                      onClick={() => handleAnalyze()}
                      className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white hover:bg-white/10 transition-all"
                    >
                      Retry Synthesis
                    </button>
                  </motion.div>
                )}
                {!result && !error && !isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full min-h-[500px] flex flex-col items-center justify-center glass-panel border-dashed border-aether-accent/10 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-aether-accent)_0%,transparent_70%)] animate-pulse" />
                      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                        {Array.from({ length: 100 }).map((_, i) => (
                          <div key={i} className="border-[0.5px] border-aether-accent/20" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative flex flex-col items-center text-center space-y-8 p-12">
                      <div className="relative">
                        <div className="absolute -inset-10 bg-aether-accent/20 rounded-full blur-3xl animate-pulse" />
                        <div className="w-24 h-24 rounded-3xl bg-aether-accent/10 border border-aether-accent/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                          <BrainCircuit className="w-12 h-12 text-aether-accent" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-white tracking-tight uppercase">Aether Neural Core</h3>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-aether-muted max-w-[200px] leading-relaxed">
                          Awaiting Neural Input for Synthesis
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          {[1, 2, 3].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                              className="w-1 h-1 rounded-full bg-aether-accent"
                            />
                          ))}
                        </div>
                        <span className="text-[8px] font-mono text-aether-muted uppercase tracking-widest">System Ready</span>
                      </div>
                    </div>
                    
                    {/* Decorative HUD elements */}
                    <div className="absolute top-6 left-6 w-10 h-10 border-t border-l border-aether-accent/20" />
                    <div className="absolute bottom-6 right-6 w-10 h-10 border-b border-r border-aether-accent/20" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* System Log Terminal */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-6 bg-black/40 border-aether-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Terminal className="w-4 h-4 text-aether-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-aether-muted">Neural System Log</span>
              </div>
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/20" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                <div className="w-2 h-2 rounded-full bg-green-500/20" />
              </div>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto font-mono text-[10px] custom-scrollbar">
              <p className="text-green-500/60">[SYSTEM] Neural core initialized successfully.</p>
              <p className="text-aether-accent/60">[NETWORK] Connection established with node ASIA-SE-1.</p>
              <p className="text-white/40">[AUTH] Operator-01 verified via biometric handshake.</p>
              {isAnalyzing && <p className="text-yellow-500/60 animate-pulse">[PROCESS] {PIPELINE_STEPS.find(s => s.id === activeStep)?.label || 'Synthesizing'}...</p>}
              {result && <p className="text-aether-accent/60">[SUCCESS] Intelligence synthesis complete. Confidence: {(result.metadata.confidence * 100).toFixed(0)}%.</p>}
              {error && <p className="text-red-500/60">[ERROR] {error}</p>}
              <p className="text-white/20">[IDLE] Awaiting next command sequence...</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
