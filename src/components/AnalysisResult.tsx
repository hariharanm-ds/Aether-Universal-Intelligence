import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Zap, 
  Database, 
  Globe, 
  Layers, 
  Download, 
  Volume2, 
  VolumeX,
  FileText,
  Lightbulb,
  Search,
  Clock,
  BarChart3,
  Shield,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { IntelligenceResult } from '../services/llama';

interface AnalysisResultProps {
  result: IntelligenceResult;
}

type Tab = 'answer' | 'sources' | 'reasoning' | 'rag';

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<Tab>('answer');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset and start typing animation when result changes
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const text = result.answer;
    
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    
    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        // Type 10 characters at a time for near-instant delivery
        const chunk = text.substring(index, index + 10);
        setDisplayedText(prev => prev + chunk);
        index += 10;
      } else {
        setIsTyping(false);
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      }
    }, 5);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [result.answer]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const exportContent = `
# AETHER INTELLIGENCE REPORT
Generated: ${new Date().toLocaleString()}

## ANSWER
${result.answer}

## REASONING
${result.reasoning.map(r => `- ${r}`).join('\n')}

## SOURCES
${result.sources.map(s => `- ${s}`).join('\n')}

## METADATA
- Confidence: ${(result.metadata.confidence * 100).toFixed(2)}%
- Latency: ${result.metadata.latency}
- Tokens: ${result.metadata.tokens}
    `;
    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aether-intelligence-${new Date().getTime()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(result.answer.substring(0, 1000));
    utterance.rate = 0.95;
    utterance.pitch = 0.85;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const tabs = [
    { id: 'answer', label: 'Intelligence', icon: SparklesIcon },
    { id: 'sources', label: 'Sources', icon: Database },
    { id: 'reasoning', label: 'Reasoning', icon: Lightbulb },
    ...((result as any).rag_context ? [{ id: 'rag', label: 'RAG Context', icon: Database }] : []),
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 md:p-10 relative overflow-hidden group border-aether-accent/20"
    >
      {/* HUD corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-aether-accent/30 rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-aether-accent/30 rounded-br-3xl" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-aether-accent/10 border border-aether-accent/20">
              <Cpu className="w-6 h-6 text-aether-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight uppercase">Neural Synthesis</h3>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1 text-[8px] text-aether-accent font-bold uppercase tracking-widest">
                  <BarChart3 className="w-3 h-3" />
                  <span>Confidence: {(result.metadata.confidence * 100).toFixed(0)}%</span>
                </div>
                <span className="text-white/10 text-[8px]">|</span>
                <div className="flex items-center space-x-1 text-[8px] text-aether-muted font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>{result.metadata.latency}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === tab.id 
                    ? "bg-aether-accent text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                    : "text-aether-muted hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeTab === 'answer' && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="markdown-body relative"
              >
                <ReactMarkdown>{displayedText}</ReactMarkdown>
                {isTyping && (
                  <motion.span 
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2 h-5 bg-aether-accent ml-1 translate-y-1"
                  />
                )}
                
                <div className="mt-10 flex items-center space-x-4">
                  <button 
                    onClick={handleSpeak}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest",
                      isSpeaking ? "bg-aether-accent/20 border-aether-accent text-aether-accent" : "bg-white/5 border-white/10 text-aether-muted hover:text-white"
                    )}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? 'Stop Briefing' : 'Neural Briefing'}</span>
                  </button>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-aether-muted hover:text-white hover:border-white/20 transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-aether-accent" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy Intelligence'}</span>
                  </button>
                  <button 
                    onClick={handleExport}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-aether-muted hover:text-white hover:border-white/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Intelligence</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'sources' && (
              <motion.div
                key="sources"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {result.sources.map((source, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-aether-accent/30 transition-all group">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-aether-accent/10 text-aether-accent">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-white/90 leading-relaxed">{source}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-[8px] font-bold text-aether-accent uppercase tracking-widest">Verified Context</span>
                          <span className="text-white/10 text-[8px]">|</span>
                          <span className="text-[8px] font-bold text-aether-muted uppercase tracking-widest">Source Node: {100 + i}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'reasoning' && (
              <motion.div
                key="reasoning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {result.reasoning.map((step, i) => (
                  <div key={i} className="flex items-start space-x-6 group">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-aether-accent group-hover:bg-aether-accent/20 transition-all">
                        {i + 1}
                      </div>
                      {i < result.reasoning.length - 1 && (
                        <div className="absolute top-8 left-1/2 w-[1px] h-12 bg-white/10 -translate-x-1/2" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-aether-muted leading-relaxed group-hover:text-white/90 transition-colors">{step}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'rag' && (result as any).rag_context && (
              <motion.div
                key="rag"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-aether-accent/10 border border-aether-accent/20">
                  <p className="text-[10px] font-bold text-aether-accent uppercase tracking-widest mb-2">
                    Retrieved {(result as any).rag_context.chunks_used} Context Chunks
                  </p>
                  <p className="text-xs text-aether-muted">
                    From sources: {(result as any).rag_context.sources.join(', ')}
                  </p>
                </div>
                
                {(result as any).rag_context.chunks.map((chunk: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-aether-accent/30 transition-all group">
                    <div className="flex items-start space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-aether-accent" />
                        <span className="text-[8px] font-bold text-aether-muted uppercase tracking-widest">{chunk.source}</span>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-aether-accent/20 border border-aether-accent/30">
                        <span className="text-[8px] font-mono text-aether-accent">
                          Similarity: {(chunk.similarity * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{chunk.text}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Advanced HUD Footer */}
      <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Neural Tokens', value: result.metadata.tokens, icon: Zap },
          { label: 'Data Integrity', value: '99.9%', icon: Shield },
          { label: 'Source Nodes', value: result.sources.length, icon: Database },
          { label: 'Global Sync', value: 'Active', icon: Globe },
        ].map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-widest text-aether-muted">
              <item.icon className="w-3 h-3 text-aether-accent" />
              <span>{item.label}</span>
            </div>
            <p className="text-xs font-bold text-white tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
