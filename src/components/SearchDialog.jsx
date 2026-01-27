import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

function SearchDialog({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Carregar historial de cerques
  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error('Error loading search history:', e);
      }
    }
  }, []);

  // Focus input quan s'obre el diàleg
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Tancar amb ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const saveToHistory = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Eliminar duplicats i afegir al principi
    const newHistory = [
      trimmedQuery,
      ...searchHistory.filter(item => item !== trimmedQuery)
    ].slice(0, MAX_HISTORY_ITEMS);

    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  const removeHistoryItem = (itemToRemove) => {
    const newHistory = searchHistory.filter(item => item !== itemToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
      // Navegar a la pàgina de resultats amb la query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery('');
    }
  };

  const handleHistoryClick = (historyQuery) => {
    setSearchQuery(historyQuery);
    saveToHistory(historyQuery);
    navigate(`/search?q=${encodeURIComponent(historyQuery)}`);
    onClose();
  };

  const handleBackdropClick = (e) => {
    // Només tancar si el clic és directament al backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 lg:pt-32 px-4 bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white rounded shadow-xl w-full max-w-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="p-1">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Productes"
                  className="w-full pl-4 pr-12 py-1 font-roboto text-[13pt] rounded-sm focus:outline-none text-gray-400 placeholder:text-gray-400 focus:placeholder-transparent"
                  style={{
                    border: 'none',
                    fontWeight: '300'
                  }}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 -translate-y-1/2 h-9 w-9 rounded-sm hover:bg-transparent"
                  style={{ right: '10px' }}
                  disabled={!searchQuery.trim()}
                  aria-label="Cercar"
                >
                  <Search className="h-[26px] w-[26px]" strokeWidth={1.5} style={{ color: '#9ca3af' }} />
                </Button>
              </div>
            </form>

            {/* Search History */}
            {searchHistory.length > 0 && !searchQuery && (
              <div className="border-t border-gray-100">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-roboto" style={{ fontWeight: '300' }}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>Cerques recents</span>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-400 hover:text-gray-600 font-roboto"
                    style={{ fontWeight: '300' }}
                  >
                    Esborrar tot
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchHistory.map((historyItem, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between group cursor-pointer"
                      onClick={() => handleHistoryClick(historyItem)}
                    >
                      <span className="text-sm text-gray-700 font-roboto" style={{ fontWeight: '300' }}>
                        {historyItem}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(historyItem);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Eliminar"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SearchDialog;
