import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Document {
  doc_id: string;
  filename: string;
  chunks: number;
}

interface KnowledgebaseManagerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function KnowledgebaseManager({ isOpen, onToggle }: KnowledgebaseManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load documents' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Ingested "${data.filename}" (${data.chunks_added} chunks)`,
      });

      loadDocuments();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload document' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc_id: string) => {
    if (!window.confirm('Delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${doc_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setMessage({ type: 'success', text: 'Document deleted' });
      loadDocuments();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete document' });
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all documents? This cannot be undone.')) return;

    try {
      const response = await fetch('/api/documents/clear-all', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Clear failed');

      setMessage({ type: 'success', text: 'All documents cleared' });
      setDocuments([]);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to clear documents' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-panel p-6 mb-6 border-aether-accent/20 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Knowledge Base</h3>
            <button
              onClick={() => setMessage(null)}
              className="text-xs text-aether-muted hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Upload Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-aether-muted">
              Ingest Documents
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="doc-upload"
                accept=".txt,.pdf,.md,.json,.csv"
              />
              <label
                htmlFor="doc-upload"
                className={cn(
                  'block p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                  isUploading
                    ? 'border-aether-accent/50 bg-aether-accent/5'
                    : 'border-white/10 hover:border-aether-accent/30 hover:bg-white/5'
                )}
              >
                <div className="flex items-center justify-center space-x-3 text-center">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 text-aether-accent animate-spin" />
                      <span className="text-xs text-aether-accent font-bold">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-aether-muted" />
                      <span className="text-xs text-aether-muted">drag file or click to upload</span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Status Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  'p-3 rounded-xl flex items-start space-x-3',
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                )}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <span className={cn('text-xs', message.type === 'success' ? 'text-green-400' : 'text-red-400')}>
                  {message.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-aether-muted">
                Ingested Documents ({documents.length})
              </label>
              {documents.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[8px] text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-aether-accent animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-[10px] text-aether-muted uppercase tracking-widest text-center py-4 opacity-50">
                No documents yet
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {documents.map((doc) => (
                  <motion.div
                    key={doc.doc_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-aether-accent/30 transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <FileText className="w-4 h-4 text-aether-accent flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-white truncate">{doc.filename}</p>
                        <p className="text-[8px] text-aether-muted">{doc.chunks} chunks</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.doc_id)}
                      className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
