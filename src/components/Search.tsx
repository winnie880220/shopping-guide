import React, { useState } from 'react';
import { Search as SearchIcon, X, ArrowLeft } from 'lucide-react';
import { ViewState } from '../types';
import { motion } from 'motion/react';
import { GuardedButton } from './GuardedButton';
import { parseMattressSearchQuery, MATTRESS_SEARCH_REQUIRED_TOAST } from '../study/taskConfig';
import { useStudy } from '../context/StudyContext';
import { TaskHint } from './TaskHint';

interface SearchProps {
  setView: (view: ViewState) => void;
  initialQuery?: string;
  returnTo?: ViewState;
}

export const Search: React.FC<SearchProps> = ({ setView, initialQuery = '', returnTo }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const { tryAction, canAction, showToast } = useStudy();

  const handleSearch = async (e: React.FormEvent, directQuery?: string) => {
    e.preventDefault();
    const q = (directQuery ?? query).trim();
    if (!q) return;

    if (canAction('submit-search') && !parseMattressSearchQuery(q)) {
      showToast(MATTRESS_SEARCH_REQUIRED_TOAST);
      return;
    }

    if (!tryAction('submit-search', undefined, { buttonLabel: '搜尋-提交' })) return;

    setIsLoading(true);
    try {
      const localResult = parseMattressSearchQuery(q);

      if (localResult) {
        setView({
          type: 'PRODUCT_LIST',
          categoryId: localResult.categoryId,
          searchQuery: q,
        });
        return;
      }

      const response = await fetch('/api/parse-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await response.json();

      if (data.categoryId) {
        setView({
          type: 'PRODUCT_LIST',
          categoryId: data.categoryId,
          filters: data,
          aiSummary: data.aiSummary,
          searchQuery: q,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      const fallback = parseMattressSearchQuery(q);
      if (fallback) {
        setView({
          type: 'PRODUCT_LIST',
          categoryId: fallback.categoryId,
          searchQuery: q,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      <TaskHint />

      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <GuardedButton
          action="back-search"
          onAllowedClick={() => setView(returnTo ?? { type: 'HOME' })}
          className={`p-1 ${!canAction('back-search') ? 'opacity-35' : ''}`}
        >
          <ArrowLeft size={24} />
        </GuardedButton>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋"
            autoFocus
            className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
          {isLoading ? (
            <div className="absolute right-3 top-2.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 text-gray-400"
              >
                <X size={18} />
              </button>
            )
          )}
        </form>
      </div>

      <div className="p-4">
        {!query && (
          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">熱門搜尋</h4>
            <div className="flex flex-wrap gap-2">
              {['床墊', '沙發', '書桌', '餐桌', '椅子', '茶几', '衣櫃', '燈具'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => { setQuery(tag); handleSearch({ preventDefault: () => {} } as React.FormEvent, tag); }}
                  className="px-3.5 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {query && (
          <button
            type="button"
            onClick={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
            className="w-full text-left p-4 flex items-center justify-between border border-gray-100 rounded-2xl bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <SearchIcon size={18} className="text-gray-400" />
              <span className="font-medium text-sm">搜尋「{query}」</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
