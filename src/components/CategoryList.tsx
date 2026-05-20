import React from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data';
import { ViewState } from '../types';
import { motion } from 'motion/react';
import { useStudy } from '../context/StudyContext';

interface CategoryListProps {
  setView: (view: ViewState) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ setView }) => {
  const { tryAction } = useStudy();

  return (
    <div className="pb-32 bg-white min-h-screen">
      <header className="px-6 pt-6 pb-2 sticky top-[88px] bg-white/80 backdrop-blur-md z-30 flex justify-between items-center">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">商品分類</h1>
        <button
          onClick={() => tryAction('open-search')}
          className="p-2 text-gray-400 bg-gray-50 rounded-full"
        >
          <Search size={20} />
        </button>
      </header>

      <div className="sticky top-[160px] bg-white/80 backdrop-blur-md z-20 pb-4 border-b border-gray-50">
        <div className="flex overflow-x-auto no-scrollbar px-6 space-x-2">
          {['全部', '客廳', '臥室', '書房', '廚房', '餐廳', '陽台'].map((filter, idx) => (
            <button
              key={filter}
              onClick={() => tryAction('open-coffee-tables')}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-[11px] font-black tracking-widest transition-all ${
                idx === 0
                  ? 'bg-white border-2 border-gray-900 text-gray-900'
                  : 'bg-gray-50 border-2 border-transparent text-gray-400'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-x-4 gap-y-8">
        {CATEGORIES.map((category, idx) => {
          const isWoodTable = category.id === 'coffee-tables';

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                if (isWoodTable) {
                  tryAction('open-coffee-tables', () => {
                    setView({ type: 'PRODUCT_LIST', categoryId: category.id });
                  });
                } else {
                  tryAction('open-coffee-tables');
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
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 mb-0.5">
                  {category.name}
                </h3>
                <p className="text-[9px] text-gray-400 font-medium tracking-tight truncate">
                  {category.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="px-6 mb-8 mt-4">
        <div className="bg-gray-900 rounded-3xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 block">
              Special Collection
            </span>
            <h2 className="text-white text-lg font-bold mb-4 tracking-tight">
              打造專屬你的
              <br />
              極簡北歐居家風格
            </h2>
            <button
              onClick={() =>
                tryAction('open-coffee-tables', () => {
                  setView({ type: 'PRODUCT_LIST', categoryId: 'coffee-tables' });
                })
              }
              className="bg-white text-gray-900 text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-wider"
            >
              立刻瀏覽
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};
