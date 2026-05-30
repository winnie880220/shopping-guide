import React, { useMemo, useState } from 'react';
import { Search, Star, Lamp, Bed, Sofa, ChevronRight } from 'lucide-react';
import { CoffeeTableIcon } from './icons/CoffeeTableIcon';
import { OtherFurnitureIcon } from './icons/OtherFurnitureIcon';
import { ProductCard } from './ProductCard';
import { ViewState } from '../types';
import { PRODUCTS } from '../data';
import { GuardedDiv } from './GuardedButton';
import { useStudy, TASK_TABLE_ID } from '../context/StudyContext';

const POPULAR_CATEGORY_ORDER = ['sofas', 'storage', 'lighting', 'chairs'] as const;

interface HomeProps {
  setView: (view: ViewState) => void;
  addToCart: (productId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setView }) => {
  const { trackOffPathClick, tryAction, currentStep, completeTaskWithFeedback } = useStudy();
  const [activeCategory, setActiveCategory] = useState<'popular' | 'table'>('popular');

  const handleCategoryClick = (itemId: string) => {
    if (itemId === 'popular') {
      setActiveCategory('popular');
      return;
    }
    if (itemId === 'table') {
      if (currentStep === 2) {
        tryAction(
          'open-coffee-tables',
          () => setActiveCategory('table'),
          { entrySource: 'home_category', buttonLabel: '首頁-茶几/邊几' }
        );
      } else {
        trackOffPathClick(`首頁-分類-${itemId}`);
      }
      return;
    }
    trackOffPathClick(`首頁-分類-${itemId}`);
  };

  const handleViewAllTables = () => {
    tryAction(
      'open-coffee-tables',
      () => setView({ type: 'PRODUCT_LIST', categoryId: 'coffee-tables' }),
      { entrySource: 'home_category', buttonLabel: '首頁-茶几/邊几-查看全部' }
    );
  };

  const handleTableProductOpen = (productId: string) => {
    if (currentStep !== 2) {
      trackOffPathClick('首頁-茶几/邊几商品卡片');
      return;
    }
    if (productId === TASK_TABLE_ID) {
      tryAction(
        'open-wood-table',
        () => {
          setView({ type: 'PRODUCT_DETAIL', productId });
          completeTaskWithFeedback(2, '已開啟商品頁面');
        },
        { buttonLabel: '首頁-茶几/邊几-開啟木紋茶几' }
      );
    } else {
      tryAction('open-wood-table', undefined, { buttonLabel: '首頁-茶几/邊几-開啟商品' });
    }
  };

  const customCategories = [
    { id: 'popular', name: '熱門商品', icon: <Star size={24} fill="currentColor" /> },
    { id: 'armchair', name: '沙發', icon: <Sofa size={24} /> },
    { id: 'table', name: '茶几/邊几', icon: <CoffeeTableIcon size={24} /> },
    { id: 'other', name: '衣櫃/書櫃', icon: <OtherFurnitureIcon size={24} /> },
    { id: 'bed', name: '床墊', icon: <Bed size={24} /> },
    { id: 'lamp', name: '燈具', icon: <Lamp size={24} /> },
  ];

  const popularProducts = POPULAR_CATEGORY_ORDER.map(categoryId =>
    PRODUCTS.find(p => p.categoryId === categoryId)
  ).filter((p): p is (typeof PRODUCTS)[number] => p != null);

  const tableProducts = useMemo(
    () => PRODUCTS.filter(p => p.categoryId === 'coffee-tables').slice(0, 4),
    []
  );

  const displayedProducts = activeCategory === 'table' ? tableProducts : popularProducts;

  return (
    <div className="pb-28 bg-white min-h-screen">
      <header className="px-6 pt-4 pb-2 bg-white">
        <GuardedDiv
          action="open-search"
          onAllowedClick={() => setView({ type: 'SEARCH' })}
          className="relative cursor-pointer"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} strokeWidth={2} />
          </div>
          <input
            type="text"
            readOnly
            placeholder="搜尋"
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none cursor-pointer"
          />
        </GuardedDiv>
      </header>

      <div className="px-6 mt-4 mb-8" onClick={() => trackOffPathClick('首頁-促銷橫幅')}>
        <div className="relative h-48 rounded-3xl overflow-hidden bg-gray-900 group cursor-pointer">
          <img
            src="/images/living_room_inspiration_1779274975609.png"
            alt="Promotion"
            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <span className="text-xs font-black bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded w-fit mb-2 uppercase tracking-widest">Limited Offer</span>
            <h2 className="text-2xl font-display font-bold text-white mb-1">打造理想客廳</h2>
            <p className="text-white/60 text-xs">精選家具 85 折起，活動至本月底</p>
          </div>
        </div>
      </div>

      <section className="px-6 mb-10">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-base font-bold uppercase tracking-widest text-gray-900 font-sans">情境找靈感</h3>
          <button onClick={() => trackOffPathClick('首頁-Explore All')} className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-0.5">
            Explore All <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
          {[
            { title: '小坪數收納', img: '/images/living_room_inspiration_1779274975609.png' },
            { title: '極簡臥室', img: '/images/bedroom_inspiration_1779274993139.png' },
            { title: '木質風格', img: '/images/coffee_table_low_wood.jpg' },
          ].map((item, idx) => (
            <div key={idx} className="flex-shrink-0 w-40 group cursor-pointer" onClick={() => trackOffPathClick(`首頁-情境-${item.title}`)}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-2 bg-gray-100 border border-gray-50">
                <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
              </div>
              <p className="text-[13px] font-medium text-gray-900">{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-0 overflow-hidden">
        <div className="px-6 overflow-x-auto no-scrollbar flex gap-6 items-start pb-6">
          {customCategories.map((item) => {
            const isActive = activeCategory === 'popular'
              ? item.id === 'popular'
              : item.id === activeCategory;

            return (
            <div
              key={item.id}
              className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer"
              onClick={() => handleCategoryClick(item.id)}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                isActive ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-gray-50 text-gray-300'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[11px] uppercase tracking-wider ${
                isActive
                  ? 'text-gray-900 font-bold'
                  : 'text-gray-300 font-semibold'
              }`}>
                {item.name}
              </span>
            </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 mt-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {displayedProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={() =>
                activeCategory === 'table'
                  ? handleTableProductOpen(p.id)
                  : trackOffPathClick('首頁-熱門商品卡片')
              }
              onAddToCart={e => {
                e.stopPropagation();
                trackOffPathClick(
                  activeCategory === 'table'
                    ? '首頁-茶几/邊几-加入購物車'
                    : '首頁-熱門商品加入購物車'
                );
              }}
            />
          ))}
        </div>
        {activeCategory === 'table' && (
          <button
            type="button"
            onClick={handleViewAllTables}
            className="w-full mt-8 py-3.5 rounded-2xl border-2 border-gray-900 text-gray-900 text-sm font-bold active:scale-[0.98] transition-transform"
          >
            查看全部
          </button>
        )}
      </section>
    </div>
  );
};
