import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function MarkdownViewer({ filePath, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        setLoading(true);
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('No s\'ha pogut carregar el document');
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (filePath) {
      loadMarkdown();
    }
  }, [filePath]);

  // Detectar si és un fitxer JavaScript
  const isJavaScript = filePath?.endsWith('.js');

  if (!filePath) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-ink-pure bg-opacity-50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-paper rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-line">
            <h2 className="font-oswald text-[20pt] font-bold" style={{ color: 'hsl(var(--grey-ink-strong))' }}>
              Documentació
            </h2>
            <div className="flex items-center gap-2">
              <a
                href={filePath}
                download
                className="p-2 hover:bg-paper-soft rounded-lg transition-colors"
                title="Descarregar"
              >
                <Download className="w-5 h-5 text-ink-2" />
              </a>
              <button
                onClick={onClose}
                className="p-2 hover:bg-paper-soft rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-ink-2" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink-strong"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900">
                ❌ {error}
              </div>
            )}

            {!loading && !error && (
              isJavaScript ? (
                // Mostrar codi JavaScript
                <div className="font-mono text-[12pt] bg-ink-strong text-green-400 p-6 rounded-lg overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-words">{content}</pre>
                </div>
              ) : (
                // Renderitzar Markdown
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                    // Estils personalitzats per elements Markdown
                    h1: ({node, ...props}) => (
                      <h1 className="font-oswald text-[32pt] font-bold mb-4 mt-6" style={{ color: 'hsl(var(--grey-ink-strong))' }} {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 className="font-oswald text-[24pt] font-bold mb-3 mt-5 border-b border-line pb-2" style={{ color: 'hsl(var(--grey-ink-strong))' }} {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 className="font-oswald text-[18pt] font-bold mb-2 mt-4" style={{ color: 'hsl(var(--grey-ink-strong))' }} {...props} />
                    ),
                    h4: ({node, ...props}) => (
                      <h4 className="font-oswald text-[16pt] font-bold mb-2 mt-3" style={{ color: 'hsl(var(--grey-ink-strong))' }} {...props} />
                    ),
                    p: ({node, ...props}) => (
                      <p className="font-roboto text-[13pt] text-ink-2 mb-4 leading-relaxed" {...props} />
                    ),
                    a: ({node, ...props}) => (
                      <a className="text-blue-600 hover:text-blue-700 underline" {...props} />
                    ),
                    ul: ({node, ...props}) => (
                      <ul className="font-roboto text-[13pt] text-ink-2 list-disc list-inside mb-4 space-y-1" {...props} />
                    ),
                    ol: ({node, ...props}) => (
                      <ol className="font-roboto text-[13pt] text-ink-2 list-decimal list-inside mb-4 space-y-1" {...props} />
                    ),
                    li: ({node, ...props}) => (
                      <li className="font-roboto text-[13pt] text-ink-2" {...props} />
                    ),
                    code: ({node, inline, ...props}) => (
                      inline
                        ? <code className="bg-paper-soft px-1.5 py-0.5 rounded font-mono text-[12pt] text-red-600" {...props} />
                        : <code className="block bg-ink-strong text-green-400 p-4 rounded-lg font-mono text-[12pt] overflow-x-auto mb-4" {...props} />
                    ),
                    pre: ({node, ...props}) => (
                      <pre className="bg-ink-strong text-green-400 p-4 rounded-lg font-mono text-[12pt] overflow-x-auto mb-4" {...props} />
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-line-strong pl-4 italic text-ink-2 mb-4" {...props} />
                    ),
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full divide-y divide-line border border-line" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => (
                      <thead className="bg-paper-soft" {...props} />
                    ),
                    th: ({node, ...props}) => (
                      <th className="px-4 py-2 text-left font-oswald text-[12pt] font-bold border border-line" style={{ color: 'hsl(var(--grey-ink-strong))' }} {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="px-4 py-2 font-roboto text-[12pt] text-ink-2 border border-line" {...props} />
                    ),
                    hr: ({node, ...props}) => (
                      <hr className="my-6 border-t border-line-strong" {...props} />
                    ),
                    // Suport per checkboxes
                    input: ({node, ...props}) => (
                      <input className="mr-2" {...props} />
                    )
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-line bg-paper-soft flex justify-between items-center">
            <p className="font-roboto text-[11pt] text-ink-2">
              Prem <kbd className="px-2 py-1 bg-paper border border-line-strong rounded text-[10pt]">ESC</kbd> per tancar
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-ink-strong text-paper rounded-lg font-roboto text-[12pt] font-medium hover:bg-ink transition-colors"
            >
              Tancar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MarkdownViewer;
