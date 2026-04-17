import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Cpu, Zap, Shield, Menu, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const navLinks = [
    { name: 'Intelligence', path: '/console' },
    { name: 'Capabilities', path: '/#capabilities' },
    { name: 'Security', path: '/#security' },
    { name: 'Enterprise', path: '/#enterprise' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b",
      isLanding ? "bg-black/20 backdrop-blur-md border-white/5" : "bg-aether-bg/80 backdrop-blur-xl border-aether-border"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group relative">
          <div className="relative">
            <div className="absolute -inset-2 bg-aether-accent/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-10 h-10 rounded-xl bg-aether-accent flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform duration-500 relative z-10">
              <Cpu className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-white uppercase leading-none font-display">Aether</span>
            <span className="text-[8px] font-mono font-bold text-aether-accent tracking-[0.3em] uppercase opacity-60">Universal Intelligence</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="text-[10px] font-bold text-aether-muted hover:text-aether-accent transition-all uppercase tracking-[0.2em] relative group/link"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-aether-accent group-hover/link:w-full transition-all duration-300" />
            </Link>
          ))}
          <Link 
            to="/console"
            className="px-6 py-2.5 bg-aether-accent text-white text-xs font-bold rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95 border border-white/10"
          >
            Launch Console
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div 
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-aether-card border-b border-aether-border"
      >
        <div className="px-6 py-8 flex flex-col space-y-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-aether-text hover:text-aether-accent transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/console"
            onClick={() => setIsOpen(false)}
            className="w-full py-4 bg-aether-accent text-white text-center font-bold rounded-xl"
          >
            Launch Console
          </Link>
        </div>
      </motion.div>
    </nav>
  );
}
