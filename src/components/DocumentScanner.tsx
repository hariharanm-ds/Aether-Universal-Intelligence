import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle2, Loader2, File, Image as ImageIcon, FileCode, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface DocumentScannerProps {
  onFileSelect: (file: File, base64: string, mimeType: string) => void;
  isAnalyzing: boolean;
}

export default function DocumentScanner({ onFileSelect, isAnalyzing }: DocumentScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress (Optimized for Speed)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 50);

    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        const base64 = reader.result as string;
        setPreview(base64);
        onFileSelect(file, base64, file.type);
        setIsUploading(false);
      }, 300);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-8 h-8 text-aether-accent" />;
    const type = selectedFile.type.toLowerCase();
    const name = selectedFile.name.toLowerCase();
    
    if (type.includes('image')) return <ImageIcon className="w-10 h-10 text-aether-accent" />;
    if (type.includes('pdf')) return <FileText className="w-10 h-10 text-red-500" />;
    
    // Code and configuration files
    const codeExtensions = ['.js', '.ts', '.tsx', '.jsx', '.py', '.cpp', '.c', '.h', '.java', '.go', '.rs', '.php', '.rb', '.html', '.css', '.json', '.yaml', '.yml', '.md'];
    if (type.includes('javascript') || 
        type.includes('typescript') || 
        type.includes('json') || 
        type.includes('python') || 
        type.includes('x-c') || 
        codeExtensions.some(ext => name.endsWith(ext))) {
      return <FileCode className="w-10 h-10 text-yellow-500" />;
    }
    
    return <File className="w-10 h-10 text-aether-muted" />;
  };

  return (
    <div className="w-full">
      <div 
        className={cn(
          "relative glass-panel p-10 border-2 border-dashed transition-all duration-700 group",
          selectedFile ? "border-aether-accent/40 bg-aether-accent/5" : "border-aether-border hover:border-aether-accent/30 hover:bg-white/5",
          isDragging && "border-aether-accent bg-aether-accent/10 scale-[1.02] shadow-[0_0_40px_rgba(16,185,129,0.2)]",
          isAnalyzing && "ring-4 ring-aether-accent/10"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div 
              key="upload-prompt"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-aether-accent/10 flex items-center justify-center border border-aether-accent/20 group-hover:scale-110 transition-transform duration-500">
                {getFileIcon()}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-aether-text tracking-tight">Ingest Intelligence</h3>
                <p className="text-sm text-aether-muted max-w-xs mx-auto leading-relaxed">
                  Drop any document, image, or code file to expand Aether's knowledge base.
                </p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-aether-accent text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95"
              >
                Select Source
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="file-preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className={cn(
                "relative rounded-2xl overflow-hidden border border-aether-border bg-black/60 flex items-center justify-center shadow-inner transition-all duration-500",
                isAnalyzing ? "aspect-square md:aspect-video" : "aspect-video"
              )}>
                {selectedFile.type.includes('image') ? (
                  preview && (
                    <img 
                      src={preview} 
                      alt="Source Preview" 
                      className={cn("w-full h-full object-cover opacity-40", isAnalyzing && "blur-sm")}
                      referrerPolicy="no-referrer"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                      {getFileIcon()}
                    </div>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-aether-bg/60 backdrop-blur-sm z-20">
                    <div className="w-64 space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-aether-accent uppercase tracking-widest">Ingesting Data</span>
                        <span className="text-xs font-mono text-white">{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-aether-accent shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-aether-bg/80 backdrop-blur-xl">
                    <div className="scan-line" />
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-aether-accent)_0%,transparent_70%)] animate-pulse" />
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-8 bg-aether-accent/20 rounded-full blur-2xl animate-ping" />
                      <Loader2 className="w-20 h-20 text-aether-accent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu className="w-8 h-8 text-aether-accent animate-pulse" />
                      </div>
                    </div>
                    <div className="mt-10 space-y-2 text-center">
                      <p className="text-aether-accent font-mono text-sm tracking-[0.5em] uppercase animate-pulse">
                        Neural Synthesis in Progress
                      </p>
                      <p className="text-[10px] text-aether-muted font-mono uppercase tracking-[0.2em]">
                        Decoding Data Stream • Contextualizing Nodes
                      </p>
                    </div>
                  </div>
                )}
                
                {!isAnalyzing && !isUploading && (
                  <button 
                    onClick={clearFile}
                    className="absolute top-6 right-6 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all backdrop-blur-md flex items-center space-x-2 font-bold text-[10px] uppercase tracking-widest z-30"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove Source</span>
                  </button>
                )}

                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                   <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-aether-accent/20 border border-aether-accent/30">
                        {getFileIcon()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white truncate max-w-[300px]">{selectedFile.name}</p>
                        <p className="text-[10px] text-aether-muted uppercase tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown Type'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-aether-accent/10 border border-aether-accent/20">
                      <CheckCircle2 className="w-3 h-3 text-aether-accent" />
                      <span className="text-[10px] font-bold text-aether-accent uppercase tracking-tighter">Source Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
