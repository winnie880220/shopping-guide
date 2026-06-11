import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data';
import { ViewState } from '../types';
import { motion } from 'motion/react';
import { useStudy } from '../context/StudyContext';
import { TaskHint } from './TaskHint';

const ROOM_FILTERS = ['全部', '客廳', '臥室', '書房', '廚房', '餐廳', '陽台'] as const;

const ROOM_CATEGORY_MAP: Record<string, string[]> = {
  '客廳': ['sofas', 'coffee-tables', 'lighting', 'rugs', 'decor'],
  '臥室': ['mattress', 'storage', 'lighting'],
  '書房': ['desks', 'chairs', 'lighting'],
  '廚房': ['storage', 'dining-tables'],
  '餐廳': ['dining-tables', 'chairs', 'lighting'],
  '陽台': ['decor', 'rugs'],
};

interface CategoryListProps {
  setView: (view: ViewState) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ setView }) => {
  const { tryAction, trackOffPathClick } = useStudy();
  const [activeFilter, setActiveFilter] = useState<string>('全部');
  const [usedRoomFilter, setUsedRoomFilter] = useState(false);

  const filteredCategories = activeFilter === '全部'
    ? CATEGORIES
    : CATEGORIES.filter(c => ROOM_CATEGORY_MAP[activeFilter]?.includes(c.id));

  return (
    <div className="pb-32 bg-white min-h-screen">
      <TaskHint sticky={false} setView={setView} />
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-50">
        <header className="px-6 pt-6 pb-2 flex justify-between items-center">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">商品分類</h1>
          <button
            onClick={() => tryAction('open-search', () => setView({ type: 'SEARCH' }))}
            className="p-2 text-gray-400 bg-gray-50 rounded-full"
          >
            <Search size={20} />
          </button>
        </header>

        <div className="pb-4">
          <div className="flex overflow-x-auto no-scrollbar px-6 space-x-2">
          {ROOM_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                if (filter === '全部') {
                  if (activeFilter !== '全部') {
                    setActiveFilter('全部');
                    setUsedRoomFilter(false);
                  }
                  return;
                }
                if (filter === '客廳' && activeFilter !== '客廳') {
                  tryAction(
                    'open-coffee-tables',
                    () => {
                      setActiveFilter(filter);
                      setUsedRoomFilter(true);
                    },
                    { entrySource: 'category_list_room_filter', buttonLabel: '商品分類-客廳篩選' }
                  );
                } else if (filter !== activeFilter) {
                  trackOffPathClick(`商品分類-空間篩選-${filter}`);
                }
              }}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-[11px] tracking-widest transition-all ${
                activeFilter === filter
                  ? 'bg-white border-2 border-gray-900 text-gray-900 font-bold'
                  : 'bg-gray-50 border-2 border-transparent text-gray-400 font-semibold'
              }`}
            >
              {filter}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-x-4 gap-y-8">
        {filteredCategories.map((category, idx) => {
          const isWoodTable = category.id === 'coffee-tables';

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                if (isWoodTable) {
                  tryAction(
                    'open-coffee-tables',
                    () => {
                      setView({ type: 'PRODUCT_LIST', categoryId: category.id });
                    },
                    {
                      entrySource: usedRoomFilter
                        ? 'category_list_room_filter'
                        : 'category_list_card',
                      buttonLabel: usedRoomFilter
                        ? '商品分類-茶几卡片(客廳篩選後)'
                        : '商品分類-茶几卡片',
                    }
                  );
                } else {
                  trackOffPathClick(`商品分類-${category.name}`);
                }
              }}
              className="flex flex-col group cursor-pointer"
            >
              <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100 mb-3 relative shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-gray-50">
                  <ChevronRight size={14} className="text-gray-900" />
                </div>
              </div>
              <div className="text-center px-2">
                <h3 className="text-[13px] font-bold text-gray-900">
                  {category.name}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
