import React, { useState, useMemo } from 'react';
import { ArrowLeft, SlidersHorizontal, ChevronDown, X, Search } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ViewState } from '../types';
import { PRODUCTS, CATEGORIES } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { GuardedButton } from './GuardedButton';
import { useStudy, TASK_MATTRESS_ID, TASK_TABLE_ID } from '../context/StudyContext';
import { TaskHint } from './TaskHint';

interface ProductListProps {
  categoryId: string;
  setView: (view: ViewState) => void;
  addToCart: (productId: string) => void;
  aiSummary?: string;
  initialFilters?: {
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    keywords?: string[];
  };
  searchQuery?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  categoryId,
  setView,
  addToCart,
  aiSummary,
  initialFilters,
  searchQuery,
}) => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  const { tryAction, canAction, completeTaskWithFeedback, currentStep } = useStudy();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(initialFilters?.size ?? null);
  const [minPrice, setMinPrice] = useState<number>(initialFilters?.minPrice ?? 0);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice || 20000);
  const [minPriceInput, setMinPriceInput] = useState<string>(String(initialFilters?.minPrice ?? 0));
  const [maxPriceInput, setMaxPriceInput] = useState<string>(String(initialFilters?.maxPrice || 20000));
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedFirmness, setSelectedFirmness] = useState<string | null>(null);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const products = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchCategory = p.categoryId === categoryId;
      const matchSize = !selectedSize || p.sizeDisplay === selectedSize;
      const matchMinPrice = p.price >= minPrice;
      const matchMaxPrice = p.price <= maxPrice;

      let matchKeywords = true;
      if (initialFilters?.keywords) {
        matchKeywords = initialFilters.keywords.some(
          k =>
            p.name.toLowerCase().includes(k.toLowerCase()) ||
            p.description.toLowerCase().includes(k.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(k.toLowerCase()))
        );
      }

      return matchCategory && matchSize && matchMinPrice && matchMaxPrice && matchKeywords;
    });
  }, [categoryId, selectedSize, minPrice, maxPrice, initialFilters]);

  const sizes = categoryId === 'mattress' ? ['單人', '雙人', '雙人加大'] : ['小', '中', '大'];

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStep === 1 && productId === TASK_MATTRESS_ID) {
      tryAction('add-mattress-to-cart', () => {
        const product = PRODUCTS.find(p => p.id === productId);
        addToCart(productId);
        completeTaskWithFeedback(
          1,
          `${product?.name ?? '商品'} 已加入購物車`,
          () => setView({ type: 'HOME' })
        );
      });
      return;
    }
    if (currentStep === 3 && productId === TASK_TABLE_ID) {
      tryAction('add-table-to-cart', () => addToCart(productId));
      return;
    }
    tryAction('add-mattress-to-cart');
  };

  const handleProductClick = (productId: string) => {
    if (currentStep === 2 && categoryId === 'coffee-tables') {
      if (productId === TASK_TABLE_ID) {
        tryAction('open-wood-table', () => {
          setView({ type: 'PRODUCT_DETAIL', productId });
          completeTaskWithFeedback(2, '已開啟商品頁面');
        });
      } else {
        tryAction('open-wood-table');
      }
      return;
    }
    tryAction('open-wood-table');
  };

  return (
    <>
      <TaskHint sticky={false} />
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="p-4 flex items-center gap-4">
          <GuardedButton
            action="back-product-list"
            onAllowedClick={() => {
              if (currentStep === 1) setView({ type: 'SEARCH', returnTo: { type: 'HOME' } });
              else if (currentStep === 2) setView({ type: 'CATEGORY_LIST' });
              else setView({ type: 'HOME' });
            }}
            className={`p-1 flex-shrink-0 ${!canAction('back-product-list') ? 'opacity-35' : ''}`}
          >
            <ArrowLeft size={24} />
          </GuardedButton>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{searchQuery || category?.name}</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-0.5">
              {products.length} 項商品
            </p>
          </div>
          <GuardedButton
            action="open-search"
            onAllowedClick={() => setView({ type: 'SEARCH' })}
            aria-label="搜尋商品"
            className={`p-2 flex-shrink-0 text-gray-500 ${!canAction('open-search') ? 'opacity-35' : ''}`}
          >
            <Search size={22} />
          </GuardedButton>
        </div>
      </header>

      <div className="bg-[#f5f5f5] min-h-screen pb-24">
      <div className="px-6 pt-6 pb-6 grid grid-cols-2 gap-x-4 gap-y-8">
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onOpen={() => handleProductClick(p.id)}
            onAddToCart={e => handleAddToCart(p.id, e)}
            showAiBadge={false}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="p-12 text-center text-gray-400">
          <p>沒有符合條件的商品，試著調整篩選範圍</p>
        </div>
      )}

      {/* 懸浮篩選按鈕 - 導覽列上方右側 */}
      <button
        onClick={() => setShowFilters(true)}
        className="fixed bottom-[5.5rem] right-4 z-40 w-12 h-12 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform"
      >
        <SlidersHorizontal size={20} />
      </button>

      {/* 篩選 Overlay - 從右滑入，覆蓋 80% */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] bg-white z-[60] shadow-2xl flex flex-col min-h-0"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">篩選條件</h3>
                <button onClick={() => setShowFilters(false)} className="p-1 text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100">
                {/* 風格 */}
                <div className="px-5">
                  <button onClick={() => setExpandedFilter(expandedFilter === 'style' ? null : 'style')} className="w-full py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">風格</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedFilter === 'style' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFilter === 'style' && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pb-4">
                        <div className="flex flex-wrap gap-2">
                          {['北歐', '現代簡約', '工業風', '日系無印', '古典'].map(s => (
                            <button key={s} onClick={() => setSelectedStyle(selectedStyle === s ? null : s)}
                              className={`px-4 py-2 rounded-lg text-[11px] font-bold border transition-all ${selectedStyle === s ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                            >{s}</button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 材質 */}
                <div className="px-5">
                  <button onClick={() => setExpandedFilter(expandedFilter === 'material' ? null : 'material')} className="w-full py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">材質</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedFilter === 'material' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFilter === 'material' && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pb-4">
                        <div className="flex flex-wrap gap-2">
                          {['獨立筒彈簧', '泡棉', '乳膠', '記憶棉', '椰棕'].map(s => (
                            <button key={s} onClick={() => setSelectedMaterial(selectedMaterial === s ? null : s)}
                              className={`px-4 py-2 rounded-lg text-[11px] font-bold border transition-all ${selectedMaterial === s ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                            >{s}</button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 尺寸規格 */}
                <div className="px-5">
                  <button onClick={() => setExpandedFilter(expandedFilter === 'size' ? null : 'size')} className="w-full py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">尺寸規格</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedFilter === 'size' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFilter === 'size' && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pb-4">
                        <div className="flex flex-wrap gap-2">
                          {sizes.map(s => (
                            <button key={s} onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                              className={`px-5 py-2 rounded-lg text-[11px] font-bold border transition-all ${selectedSize === s ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                            >{s}</button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 軟硬度 */}
                <div className="px-5">
                  <button onClick={() => setExpandedFilter(expandedFilter === 'firmness' ? null : 'firmness')} className="w-full py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">軟硬度</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedFilter === 'firmness' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFilter === 'firmness' && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pb-4">
                        <div className="flex flex-wrap gap-2">
                          {['偏軟', '適中', '偏硬', '極硬'].map(s => (
                            <button key={s} onClick={() => setSelectedFirmness(selectedFirmness === s ? null : s)}
                              className={`px-4 py-2 rounded-lg text-[11px] font-bold border transition-all ${selectedFirmness === s ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                            >{s}</button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 顏色 */}
                <div className="px-5">
                  <button onClick={() => setExpandedFilter(expandedFilter === 'color' ? null : 'color')} className="w-full py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">顏色</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedFilter === 'color' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFilter === 'color' && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pb-4">
                        <div className="flex flex-wrap gap-2">
                          {['白色', '灰色', '米色', '深色木紋', '淺色木紋'].map(s => (
                            <button key={s} onClick={() => setSelectedColor(selectedColor === s ? null : s)}
                              className={`px-4 py-2 rounded-lg text-[11px] font-bold border transition-all ${selectedColor === s ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                            >{s}</button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 預算 */}
                <div className="px-5">
                  <button onClick={() => setExpandedFilter(expandedFilter === 'price' ? null : 'price')} className="w-full py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">預算範圍</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedFilter === 'price' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFilter === 'price' && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pb-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">最低價</label>
                            <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1.5">
                              <span className="text-xs text-gray-400 mr-1">NT$</span>
                              <input
                                type="text" inputMode="numeric" value={minPriceInput}
                                onChange={e => setMinPriceInput(e.target.value.replace(/[^\d]/g, ''))}
                                onBlur={() => { const v = parseInt(minPriceInput) || 0; setMinPrice(v); setMinPriceInput(String(v)); }}
                                onKeyDown={e => { if (e.key === 'Enter') { const v = parseInt(minPriceInput) || 0; setMinPrice(v); setMinPriceInput(String(v)); (e.target as HTMLInputElement).blur(); } }}
                                className="w-full text-sm font-mono text-gray-900 outline-none bg-transparent"
                              />
                            </div>
                          </div>
                          <span className="text-gray-300 mt-4">—</span>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">最高價</label>
                            <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1.5">
                              <span className="text-xs text-gray-400 mr-1">NT$</span>
                              <input
                                type="text" inputMode="numeric" value={maxPriceInput}
                                onChange={e => setMaxPriceInput(e.target.value.replace(/[^\d]/g, ''))}
                                onBlur={() => { const v = parseInt(maxPriceInput) || 50000; setMaxPrice(v); setMaxPriceInput(String(v)); }}
                                onKeyDown={e => { if (e.key === 'Enter') { const v = parseInt(maxPriceInput) || 50000; setMaxPrice(v); setMaxPriceInput(String(v)); (e.target as HTMLInputElement).blur(); } }}
                                className="w-full text-sm font-mono text-gray-900 outline-none bg-transparent"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="relative h-10 mx-2.5">
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full">
                            <div
                              className="absolute h-1 bg-gray-800 rounded-full"
                              style={{ left: `${(minPrice / 50000) * 100}%`, right: `${100 - (maxPrice / 50000) * 100}%` }}
                            />
                          </div>
                          <div
                            className="absolute w-5 h-5 bg-white border-2 border-gray-800 rounded-full shadow pointer-events-none"
                            style={{ left: `${(minPrice / 50000) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                          />
                          <div
                            className="absolute w-5 h-5 bg-white border-2 border-gray-800 rounded-full shadow pointer-events-none"
                            style={{ left: `${(maxPrice / 50000) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                          />
                          <input
                            type="range" min="0" max="50000" step="500" value={minPrice}
                            onChange={e => { const v = parseInt(e.target.value); const clamped = Math.min(v, maxPrice - 500); setMinPrice(clamped); setMinPriceInput(String(clamped)); }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            style={{ zIndex: 5, clipPath: `inset(0 ${100 - ((minPrice + maxPrice) / 2 / 50000) * 100}% 0 0)` }}
                          />
                          <input
                            type="range" min="0" max="50000" step="500" value={maxPrice}
                            onChange={e => { const v = parseInt(e.target.value); const clamped = Math.max(v, minPrice + 500); setMaxPrice(clamped); setMaxPriceInput(String(clamped)); }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            style={{ zIndex: 5, clipPath: `inset(0 0 0 ${((minPrice + maxPrice) / 2 / 50000) * 100}%)` }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-auto flex-shrink-0 px-5 pt-4 pb-[4.5rem] border-t border-gray-100 bg-white">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
                >
                  查看結果（{products.length} 項）
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};
