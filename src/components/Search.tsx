import React, { useState } from 'react';
import { Search as SearchIcon, X, ArrowLeft, Sparkles } from 'lucide-react';
import { ViewState } from '../types';
import { motion } from 'motion/react';
import { GuardedButton } from './GuardedButton';
import { parseMattressSearchQuery } from '../study/taskConfig';
import { useStudy } from '../context/StudyContext';
import { TaskHint } from './TaskHint';

interface SearchProps {
  setView: (view: ViewState) => void;
  initialQuery?: string;
}

export const Search: React.FC<SearchProps> = ({ setView, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const { tryAction, canAction } = useStudy();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    if (!tryAction('submit-search')) return;

    setIsLoading(true);
    try {
      const localResult = parseMattressSearchQuery(q);

      if (localResult) {
        setView({
          type: 'PRODUCT_LIST',
          categoryId: localResult.categoryId,
          filters: {
            minPrice: localResult.minPrice,
            maxPrice: localResult.maxPrice,
            size: localResult.size,
            keywords: localResult.keywords,
          },
          aiSummary: localResult.aiSummary,
          autoFilled: localResult.autoFilled,
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
        });
      } else {
        setView({ type: 'PRODUCT_LIST', categoryId: 'mattress' });
      }
    } catch (error) {
      console.error('Search error:', error);
      const fallback = parseMattressSearchQuery(q);
      if (fallback) {
        setView({
          type: 'PRODUCT_LIST',
          categoryId: fallback.categoryId,
          filters: {
            minPrice: fallback.minPrice,
            maxPrice: fallback.maxPrice,
            size: fallback.size,
            keywords: fallback.keywords,
          },
          aiSummary: fallback.aiSummary,
          autoFilled: fallback.autoFilled,
        });
      } else {
        setView({ type: 'PRODUCT_LIST', categoryId: 'mattress' });
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
          onAllowedClick={() => setView({ type: 'HOME' })}
          className={`p-1 ${!canAction('back-search') ? 'opacity-35' : ''}`}
        >
          <ArrowLeft size={24} />
        </GuardedButton>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="1000元的桌子"
            autoFocus
            className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
        <div className="mb-6 p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-lg">
          <div className="flex items-center gap-2.5 mb-3">
            <Sparkles size={18} className="text-amber-300 flex-shrink-0" />
            <h4 className="text-[15px] font-bold text-white">尋感助手</h4>
          </div>
          <p className="text-[14px] text-gray-200 leading-relaxed">
            您可以用自然語言描述需求，系統會理解語意並代為設定篩選條件，您只需確認結果即可。
          </p>
        </div>

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
