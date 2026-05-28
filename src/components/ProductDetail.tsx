import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Heart, Share2, MapPin, ChevronRight, Check, ShoppingCart, Ruler, Minus, Plus, Star } from 'lucide-react';
import { ViewState, CartItem } from '../types';
import { PRODUCTS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { GuardedButton } from './GuardedButton';
import { useStudy, TASK_TABLE_ID } from '../context/StudyContext';
import { TaskHint } from './TaskHint';
import { ProductCard } from './ProductCard';

const SCENE_PAIRING_CATEGORIES: Record<string, string[]> = {
  'coffee-tables': ['sofas', 'lighting', 'rugs', 'chairs'],
  mattress: ['lighting', 'decor', 'storage'],
  sofas: ['coffee-tables', 'rugs', 'lighting'],
  chairs: ['coffee-tables', 'lighting', 'desks'],
  'dining-tables': ['chairs', 'lighting', 'decor'],
  lighting: ['sofas', 'coffee-tables', 'decor'],
  desks: ['chairs', 'lighting', 'storage'],
  storage: ['decor', 'lighting', 'rugs'],
  rugs: ['sofas', 'coffee-tables', 'lighting'],
  decor: ['lighting', 'rugs', 'storage'],
};

interface ProductDetailProps {
  productId: string;
  setView: (view: ViewState) => void;
  addToCart: (productId: string, quantity?: number, mode?: 'increment' | 'set') => void;
  cartItems: CartItem[];
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  productId,
  setView,
  addToCart,
  cartItems,
}) => {
  const product = PRODUCTS.find(p => p.id === productId);
  const [showSpecs, setShowSpecs] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const imageToolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inCart = cartItems.find(item => item.productId === productId);
    setQuantity(inCart?.quantity ?? 1);
  }, [productId, cartItems]);

  useEffect(() => {
    const toolbarEl = imageToolbarRef.current;
    if (!toolbarEl) return;

    const updateHeader = () => {
      setShowStickyHeader(toolbarEl.getBoundingClientRect().bottom <= 0);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader);
    return () => {
      window.removeEventListener('scroll', updateHeader);
      window.removeEventListener('resize', updateHeader);
    };
  }, [productId]);
  const {
    tryAction,
    showToast,
    markSpecsViewed,
    markStockChecked,
    completeTaskWithFeedback,
    currentStep,
    specsViewed,
    stockChecked,
    canAction,
  } = useStudy();

  const blockAction = () => {
    showToast('此功能不在本次任務範圍內，請依上方提示繼續。');
  };

  const recommendedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = PRODUCTS.filter(
      p => p.id !== productId && p.categoryId === product.categoryId
    );
    const others = PRODUCTS.filter(
      p => p.id !== productId && p.categoryId !== product.categoryId
    );
    return [...sameCategory, ...others].slice(0, 4);
  }, [productId, product]);

  const pairingProducts = useMemo(() => {
    if (!product) return [];
    const categories =
      SCENE_PAIRING_CATEGORIES[product.categoryId] ?? ['lighting', 'decor', 'rugs'];
    let items = PRODUCTS.filter(
      p => p.id !== productId && categories.includes(p.categoryId)
    );
    if (product.categoryId === 'coffee-tables') {
      items = items.filter(p => p.categoryId === 'sofas');
    }
    return items.slice(0, 4);
  }, [productId, product]);

  if (!product) return null;

  const stockStatusLabel = (status: string) => {
    if (status === 'out-of-stock') return { text: '目前無庫存', color: 'text-red-500', dot: 'bg-red-500' };
    if (status === 'low-stock') return { text: '庫存偏低', color: 'text-amber-600', dot: 'bg-amber-500' };
    return { text: '現貨供應', color: 'text-green-600', dot: 'bg-green-500' };
  };

  const tableInCart = cartItems.some(item => item.productId === TASK_TABLE_ID);

  const tryFinishTask3 = (nextSpecs: boolean, nextStock: boolean, justAdded = false) => {
    const inCart = justAdded || tableInCart;
    if (currentStep === 3 && productId === TASK_TABLE_ID && nextSpecs && nextStock && inCart) {
      completeTaskWithFeedback(3, '茶几已加入購物車');
    }
  };

  const handleAddToCart = () => {
    if (currentStep === 3 && productId === TASK_TABLE_ID) {
      tryAction('add-table-to-cart', () => {
        addToCart(productId, quantity, 'set');
        tryFinishTask3(specsViewed, stockChecked, true);
      });
      return;
    }
    if (currentStep === 3) {
      blockAction();
      return;
    }
    tryAction('add-table-to-cart');
  };

  const handleViewSpecs = () => {
    tryAction('view-specs', () => {
      setShowSpecs(true);
      markSpecsViewed();
      tryFinishTask3(true, stockChecked);
    });
  };

  const handleCheckStock = () => {
    tryAction('check-stock', () => {
      setShowStock(true);
      markStockChecked();
      tryFinishTask3(specsViewed, true);
    });
  };

  const handleBack = () =>
    setView({ type: 'PRODUCT_LIST', categoryId: product.categoryId });

  return (
    <div className="bg-white min-h-screen pb-44">
      <TaskHint sticky={false} />

      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden border-b border-gray-50">
        <div
          ref={imageToolbarRef}
          className="absolute inset-x-0 top-0 p-4 flex justify-between items-center z-10 pointer-events-none"
        >
          <GuardedButton
            action="back-product-detail"
            onAllowedClick={handleBack}
            className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg pointer-events-auto active:scale-90 ${
              !canAction('back-product-detail') ? 'opacity-40' : ''
            }`}
          >
            <ArrowLeft size={20} />
          </GuardedButton>
          <div className="flex gap-2 pointer-events-auto">
            <button
              type="button"
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100"
              onClick={blockAction}
              aria-label="分享"
            >
              <Share2 size={18} />
            </button>
            <button
              type="button"
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 text-red-500"
              onClick={blockAction}
              aria-label="收藏"
            >
              <Heart size={18} />
            </button>
          </div>
        </div>
        <motion.img
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover ${
            productId === 'c1' ? 'object-[center_62%]' : 'object-bottom'
          }`}
        />
        <div
          className="absolute inset-x-0 bottom-3 flex justify-center items-center gap-1.5 z-10 pointer-events-none [&>button]:pointer-events-auto"
          aria-hidden
        >
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              type="button"
              onClick={blockAction}
              aria-label={`商品圖片 ${index + 1}`}
              className={`rounded-full bg-gray-900 transition-all pointer-events-auto ${
                index === 0 ? 'h-1.5 w-4 opacity-90' : 'h-1.5 w-1.5 opacity-35'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showStickyHeader && (
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 inset-x-0 z-50"
          >
            <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
              <div className="px-3 py-2.5 flex items-center gap-2">
                <GuardedButton
                  action="back-product-detail"
                  onAllowedClick={handleBack}
                  className={`p-1.5 flex-shrink-0 rounded-full active:scale-90 ${
                    !canAction('back-product-detail') ? 'opacity-40' : ''
                  }`}
                  aria-label="返回"
                >
                  <ArrowLeft size={22} />
                </GuardedButton>
                <h1 className="flex-1 min-w-0 text-sm font-bold text-gray-900 truncate text-center px-1">
                  {product.name}
                </h1>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    className="p-1.5 rounded-full active:scale-90"
                    onClick={blockAction}
                    aria-label="分享"
                  >
                    <Share2 size={20} className="text-gray-700" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-full active:scale-90 text-red-500"
                    onClick={blockAction}
                    aria-label="收藏"
                  >
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="px-6 pt-4">
        <div className="mb-6">
          <h2 className="text-xl font-black mb-0.5">{product.name}</h2>
          <p className="text-gray-400 text-[10px] mb-3">{product.description}</p>
          <span className="text-2xl font-black text-[--color-ikea-blue]">
            NT$ {product.price.toLocaleString()}
          </span>
        </div>

        <section className="mb-8 nest-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <Check size={14} className="text-green-500" />
            推薦理由
          </h3>
          <ul className="space-y-1.5">
            {product.details.map((detail, idx) => (
              <li key={idx} className="text-[10px] text-gray-600 flex items-start gap-2 leading-snug">
                <div className="mt-1 w-1.5 h-1.5 bg-gray-200 rounded-full flex-shrink-0" />
                {detail}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <GuardedButton
            action="check-stock"
            onAllowedClick={handleCheckStock}
            className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 text-left transition-all ${
              showStock ? 'border-gray-900 bg-gray-50/80' : 'border-gray-100 bg-white shadow-sm'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <MapPin size={22} className="text-gray-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">分店庫存</p>
              <p className="text-sm font-bold text-gray-900">查看分店庫存</p>
            </div>
            <ChevronRight
              size={20}
              className={`text-gray-400 flex-shrink-0 transition-transform ${showStock ? 'rotate-90' : ''}`}
            />
          </GuardedButton>

          <AnimatePresence>
            {showStock && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-5">
                  {product.stock.map(store => {
                    const status = stockStatusLabel(store.status);
                    const isOnline = store.location === '網路商店';
                    return (
                      <button
                        key={store.location}
                        type="button"
                        onClick={blockAction}
                        className="w-full flex justify-between items-start py-1 border-b border-gray-100 last:border-0 last:pb-0 text-left"
                      >
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-1.5">{store.location}</h4>
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                            <span className={`text-xs font-bold ${status.color}`}>{status.text}</span>
                          </div>
                          {!isOnline && store.placementArea && (
                            <p className="text-[10px] text-gray-400 mt-1.5">
                              放置區域: {store.placementArea}
                            </p>
                          )}
                        </div>
                        <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="mb-8 flex flex-col gap-2">
          <GuardedButton
            action="view-specs"
            onAllowedClick={handleViewSpecs}
            className={`nest-btn-secondary px-6 flex items-center justify-center gap-2 ${
              showSpecs ? 'border-amber-400 bg-amber-50' : ''
            }`}
          >
            <Ruler size={14} />
            查看產品規格與尺寸
            <ChevronRight size={14} className={`ml-auto transition-transform ${showSpecs ? 'rotate-90' : ''}`} />
          </GuardedButton>

          <AnimatePresence>
            {showSpecs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">尺寸與規格</p>
                  {product.specs.map(spec => (
                    <div key={spec.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-[11px] text-gray-500 font-medium">{spec.label}</span>
                      <span className="text-[11px] font-bold text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            className="nest-btn-secondary px-6 flex items-center justify-center gap-2 w-full"
            onClick={blockAction}
          >
            <Star size={14} />
            查看評價與搭配建議
            <ChevronRight size={14} className="ml-auto" />
          </button>
        </div>

        {recommendedProducts.length > 0 && (
          <section className="mb-8">
            <h4 className="font-bold text-sm mb-3">其他推薦產品</h4>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1">
              {recommendedProducts.map(p => (
                <div key={p.id} className="w-[8.25rem] flex-shrink-0">
                  <ProductCard
                    product={p}
                    compact
                    onOpen={blockAction}
                    onAddToCart={e => {
                      e.stopPropagation();
                      blockAction();
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {pairingProducts.length > 0 && (
          <section className="mb-6">
            <div className="mb-3">
              <h4 className="font-bold text-sm leading-tight mb-0.5">情境搭配建議</h4>
              <p className="text-[11px] text-gray-400 leading-snug">與此商品風格相近的空間搭配</p>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1">
              {pairingProducts.map(p => (
                <div key={p.id} className="w-[8.25rem] flex-shrink-0">
                  <ProductCard
                    product={p}
                    compact
                    onOpen={blockAction}
                    onAddToCart={e => {
                      e.stopPropagation();
                      blockAction();
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-[4.75rem] left-0 right-0 max-w-md mx-auto z-30 bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl px-1 flex-shrink-0">
            <button
              type="button"
              onClick={blockAction}
              className="w-10 h-10 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
              aria-label="減少數量"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold w-8 text-center tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={blockAction}
              className="w-10 h-10 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
              aria-label="增加數量"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 min-w-0 bg-gray-900 text-white py-3.5 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <ShoppingCart size={18} strokeWidth={2.5} />
            加入購物車
          </button>
        </div>
      </div>
    </div>
  );
};
