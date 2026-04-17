import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Cpu, Zap, Shield, ChevronRight, Globe, Database, Code, Search, BrainCircuit } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import NeuralBackground from './NeuralBackground';

const FeatureCard = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
    viewport={{ once: true }}
    className="glass-panel p-8 group hover:scale-[1.02] transition-transform duration-500"
  >
    <div className="w-14 h-14 rounded-2xl bg-aether-accent/10 flex items-center justify-center border border-aether-accent/20 mb-6 group-hover:bg-aether-accent/20 transition-colors">
      <Icon className="w-7 h-7 text-aether-accent" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-aether-muted text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-aether-bg overflow-x-hidden pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <NeuralBackground />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-aether-accent/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] animate-pulse delay-1000" />
          <div className="neural-pulse" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <Zap className="w-4 h-4 text-aether-accent animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-aether-accent">Neural Core v3.1 Live</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[0.9]">
            <span className="block opacity-50 text-4xl md:text-5xl mb-2 reveal-text" style={{ animationDelay: '0.2s' }}>Universal</span>
            <span className="reveal-text text-transparent bg-clip-text bg-gradient-to-r from-aether-accent via-emerald-400 to-amber-500" style={{ animationDelay: '0.5s' }}>
              Intelligence
            </span>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-lg md:text-xl text-aether-muted max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Aether is the next-generation RAG platform that synthesizes complex documents, 
            images, and codebases into actionable intelligence.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              to="/console"
              className="w-full sm:w-auto px-12 py-6 bg-aether-accent text-white font-bold rounded-2xl hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] transition-all active:scale-95 flex items-center justify-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center">
                Initialize Neural Console
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              to="/console"
              className="w-full sm:w-auto px-12 py-6 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md active:scale-95 text-center"
            >
              Try Live Demo
            </Link>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[BrainCircuit, Cpu, Database, Globe, Shield, Zap].map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              className="absolute floating"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${Math.random() * 4 + 4}s`
              }}
            >
              <Icon className="w-12 h-12 text-aether-accent" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Latency', value: '< 150ms' },
              { label: 'Accuracy', value: '99.9%' },
              { label: 'Context', value: '2M Tokens' },
              { label: 'Languages', value: '50+' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-aether-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="capabilities" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Advanced Neural Capabilities</h2>
            <p className="text-aether-muted max-w-2xl mx-auto">
              Built on a proprietary RAG architecture, Aether processes multi-modal data streams 
              with unprecedented contextual awareness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Database, title: "Deep RAG Synthesis", description: "Connect disparate data points across massive document sets to find the hidden truth." },
              { icon: Code, title: "Code Intelligence", description: "Expert-level analysis of complex codebases, identifying bugs and security flaws instantly." },
              { icon: Globe, title: "Global Grounding", description: "Real-time web verification ensures your intelligence is always current and verified." },
              { icon: Shield, title: "Enterprise Security", description: "Bank-grade encryption and isolated neural instances for your most sensitive data." },
              { icon: Search, title: "Visual Analysis", description: "OCR and spatial reasoning for complex diagrams, charts, and technical schematics." },
              { icon: Zap, title: "Instant Inference", description: "Optimized for speed without compromising on the depth of synthesis." },
            ].map((feature, i) => (
              <FeatureCard 
                key={i}
                {...feature}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">The Neural Pipeline</h2>
              <p className="text-aether-muted text-lg leading-relaxed">
                Aether doesn't just search; it understands. Our pipeline transforms raw data into a structured neural graph, 
                allowing for multi-hop reasoning and deep synthesis.
              </p>
              
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Ingestion', desc: 'Securely upload documents, images, or code.' },
                  { step: '02', title: 'Vectorization', desc: 'Data is embedded into high-dimensional vector space.' },
                  { step: '03', title: 'Synthesis', desc: 'LLaMA synthesizes context with local model inference.' },
                  { step: '04', title: 'Intelligence', desc: 'Receive structured, verified, and actionable insights.' },
                ].map((item, i) => (
                  <motion.div 
                    key={item.step} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-6 group"
                  >
                    <div className="relative">
                      <div className="text-2xl font-mono font-bold text-aether-accent/40 group-hover:text-aether-accent transition-colors relative z-10">{item.step}</div>
                      <div className="absolute -inset-2 bg-aether-accent/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1 group-hover:text-aether-accent transition-colors">{item.title}</h4>
                      <p className="text-sm text-aether-muted">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-aether-accent/20 rounded-full blur-[100px] animate-pulse" />
              <div className="glass-panel p-10 relative z-10 border-aether-accent/30">
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shimmer">
                      <Cpu className="w-10 h-10 text-aether-accent/40" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-40 rounded-2xl bg-aether-accent/10 border border-aether-accent/20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-aether-accent flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-aether-accent">Neural Core Synthesis</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto glass-panel p-12 md:p-20 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-aether-accent/5 group-hover:bg-aether-accent/10 transition-colors pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-aether-accent/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter relative z-10">Ready to evolve?</h2>
          <p className="text-lg text-aether-muted mb-12 max-w-xl mx-auto relative z-10">
            Join the elite teams using Aether to transform raw data into strategic advantage.
          </p>
          <Link 
            to="/console"
            className="inline-flex items-center px-12 py-6 bg-white text-black font-bold rounded-2xl hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all active:scale-95 relative z-10 group/btn"
          >
            <span>Get Started Now</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between space-y-8 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-aether-accent flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tighter text-white uppercase">Aether</span>
          </div>
          <div className="flex space-x-12">
            <a href="#" className="text-sm text-aether-muted hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-aether-muted hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm text-aether-muted hover:text-white transition-colors">Security</a>
            <a href="#" className="text-sm text-aether-muted hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-aether-muted uppercase tracking-[0.2em]">© 2026 Aether Universal Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
