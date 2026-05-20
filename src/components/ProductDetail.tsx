import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Share2, MapPin, ChevronRight, Check, ShoppingCart, Ruler, Minus, Plus } from 'lucide-react';
import { ViewState, CartItem } from '../types';
import { PRODUCTS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { GuardedButton } from './GuardedButton';
import { useStudy, TASK_TABLE_ID } from '../context/StudyContext';

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

  useEffect(() => {
    const inCart = cartItems.find(item => item.productId === productId);
    setQuantity(inCart?.quantity ?? 1);
  }, [productId, cartItems]);
  const {
    tryAction,
    markSpecsViewed,
    markStockChecked,
    completeTaskWithFeedback,
    currentStep,
    specsViewed,
    stockChecked,
    canAction,
  } = useStudy();

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
      completeTaskWithFeedback(3, '茶几已加入購物車', () => setView({ type: 'CART' }));
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

  return (
    <div className="bg-white min-h-screen pb-44">
      <div className="absolute top-[88px] left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
        <GuardedButton
          action="back-product-detail"
          onAllowedClick={() =>
            setView({ type: 'PRODUCT_LIST', categoryId: product.categoryId })
          }
          className={`p-2 bg-white rounded-full shadow-lg pointer-events-auto active:scale-90 ${
            !canAction('back-product-detail') ? 'opacity-40' : ''
          }`}
        >
          <ArrowLeft size={20} />
        </GuardedButton>
        <div className="flex gap-2 pointer-events-auto">
          <button className="p-2 bg-white rounded-full shadow-lg border border-gray-100" onClick={() => tryAction('view-specs')}>
            <Share2 size={18} />
          </button>
          <button className="p-2 bg-white rounded-full shadow-lg border border-gray-100 text-red-500" onClick={() => tryAction('view-specs')}>
            <Heart size={18} />
          </button>
        </div>
      </div>

      <div className="bg-gray-100 aspect-square overflow-hidden mb-6 border-b border-gray-50 mt-[88px]">
        <motion.img
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply"
        />
      </div>

      <div className="px-6">
        <div className="mb-6">
          <h2 className="text-xl font-black mb-0.5">{product.name}</h2>
          <p className="text-gray-400 text-[10px] italic mb-3">{product.description}</p>
          <span className="text-2xl font-black text-[--color-ikea-blue]">
            NT$ {product.price.toLocaleString()}
          </span>
        </div>

        <section className="mb-8 nest-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <Check size={14} className="text-green-500" />
            推薦理由
          </h3>
          <ul className="space-y-3">
            {product.details.map((detail, idx) => (
              <li key={idx} className="text-[10px] text-gray-600 flex items-start gap-2 leading-relaxed">
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
                    return (
                      <div
                        key={store.location}
                        className="flex justify-between items-start py-1 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div>
                          <h4 className="font-bold text-base mb-1.5">{store.location}</h4>
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                            <span className={`text-xs font-bold ${status.color}`}>{status.text}</span>
                          </div>
                        </div>
                        <MapPin size={18} className="text-gray-400 mt-1" />
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-400 pt-2">放置區域: 貨架 12, 走道 04</p>
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

          <button className="nest-btn-secondary px-6" onClick={() => tryAction('view-specs')}>
            查看評價與搭配建議
          </button>
        </div>
      </div>

      <div className="fixed bottom-[4.75rem] left-0 right-0 max-w-md mx-auto z-30 bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl px-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
              aria-label="減少數量"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold w-8 text-center tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(q => Math.min(99, q + 1))}
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
