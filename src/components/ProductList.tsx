import React, { useState, useMemo } from 'react';
import { ArrowLeft, SlidersHorizontal, Info } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ViewState } from '../types';
import { PRODUCTS, CATEGORIES } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { GuardedButton } from './GuardedButton';
import { useStudy, TASK_MATTRESS_ID, TASK_TABLE_ID } from '../context/StudyContext';

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
}

export const ProductList: React.FC<ProductListProps> = ({
  categoryId,
  setView,
  addToCart,
  aiSummary,
  initialFilters,
}) => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  const { tryAction, canAction, completeTaskWithFeedback, currentStep } = useStudy();
  const [showFilters, setShowFilters] = useState(
    !!(initialFilters?.size || initialFilters?.minPrice || initialFilters?.maxPrice)
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(initialFilters?.size ?? null);
  const [minPrice] = useState<number>(initialFilters?.minPrice ?? 0);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice || 15000);

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
    <div className="bg-[#f5f5f5] min-h-screen pb-24">
      <div className="sticky top-[88px] bg-white z-10 shadow-sm">
        <div className="p-4 flex items-center gap-4">
          <GuardedButton
            action="back-product-list"
            onAllowedClick={() => {
              if (currentStep === 1) setView({ type: 'SEARCH' });
              else if (currentStep === 2) setView({ type: 'CATEGORY_LIST' });
              else setView({ type: 'HOME' });
            }}
            className={`p-1 ${!canAction('back-product-list') ? 'opacity-35' : ''}`}
          >
            <ArrowLeft size={24} />
          </GuardedButton>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{category?.name}</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-0.5">
              {products.length} 項商品
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${
              showFilters
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                : 'bg-white border-gray-100 text-gray-400'
            }`}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 overflow-hidden border-b border-gray-100 pb-6"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    尺寸規格
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                        className={`px-5 py-2 rounded-lg text-[11px] font-bold border transition-all ${
                          selectedSize === s
                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                            : 'bg-white text-gray-400 border-gray-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      預算上限
                    </h4>
                    <span className="text-xs font-black text-gray-900 font-mono">
                      NT$ {maxPrice.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="500"
                    value={maxPrice}
                    onChange={e => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-900"
                  />
                  {minPrice > 0 && (
                    <p className="text-[9px] text-gray-400 mt-2">
                      預算下限：NT$ {minPrice.toLocaleString()}（已自動設定）
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(aiSummary || (currentStep !== 2 && categoryId === 'mattress')) && (
        <div
          className={`px-6 py-4 flex flex-col gap-2 transition-colors ${
            aiSummary ? 'bg-gray-900 border-b border-white/5 shadow-2xl' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-full ${aiSummary ? 'bg-white/10' : 'bg-gray-200'}`}>
              <Info size={14} className={aiSummary ? 'text-white/60' : 'text-gray-400'} />
            </div>
            <p
              className={`text-[10px] font-bold tracking-tight ${
                aiSummary ? 'text-white' : 'text-gray-500'
              }`}
            >
              {aiSummary
                ? `已根據您的語意理解過濾：${aiSummary}`
                : 'Nest & Co. 建議您根據軟硬度與睡感進行挑選'}
            </p>
          </div>
        </div>
        )}
      </div>

      <div className="px-6 pt-6 pb-6 grid grid-cols-2 gap-x-4 gap-y-8">
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onOpen={() => handleProductClick(p.id)}
            onAddToCart={e => handleAddToCart(p.id, e)}
            showAiBadge={currentStep === 1}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="p-12 text-center text-gray-400">
          <p>沒有符合條件的商品，試著調整篩選範圍</p>
        </div>
      )}
    </div>
  );
};
