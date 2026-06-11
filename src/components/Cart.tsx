import React, { useEffect } from 'react';
import { ArrowLeft, Minus, Plus, Trash2, ArrowRight, Truck, Store, ShoppingCart } from 'lucide-react';
import { ViewState, CartItem } from '../types';
import { PRODUCTS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { GuardedButton } from './GuardedButton';
import { ProductCard } from './ProductCard';
import { useStudy, TASK_MATTRESS_ID } from '../context/StudyContext';

interface CartProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setView: (view: ViewState) => void;
  returnTo?: ViewState;
}

export const Cart: React.FC<CartProps> = ({ cartItems, setCartItems, setView, returnTo }) => {
  const {
    tryAction,
    canAction,
    showToast,
    markDeliverySelected,
    completeTaskWithFeedback,
    currentStep,
    deliverySelected,
    cartDeliveryMethod,
    setCartDeliveryMethod,
  } = useStudy();
  const deliveryMethod = cartDeliveryMethod;

  useEffect(() => {
    if (currentStep >= 5 && deliverySelected) {
      setCartDeliveryMethod('HOME');
    }
  }, [currentStep, deliverySelected, setCartDeliveryMethod]);

  const getProduct = (id: string) => PRODUCTS.find(p => p.id === id);

  const removeItem = (productId: string) => {
    if (productId === TASK_MATTRESS_ID) {
      tryAction(
        'remove-mattress',
        () => {
          setCartItems(prev => prev.filter(item => item.productId !== productId));
          if (currentStep === 5) {
            completeTaskWithFeedback(5, '床墊已從購物車移除');
          }
        },
        { buttonLabel: '購物車-移除床墊' }
      );
    } else {
      tryAction('remove-mattress', undefined, { buttonLabel: '購物車-移除商品' });
    }
  };

  const handleDecrement = (productId: string, quantity: number) => {
    if (quantity <= 1) {
      removeItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const p = getProduct(item.productId);
    return acc + (p?.price || 0) * item.quantity;
  }, 0);

  const shippingFee = deliveryMethod === 'HOME' ? 500 : 0;
  const total = subtotal + (deliveryMethod === 'HOME' ? shippingFee : 0);

  const handleSelectDelivery = (method: 'HOME' | 'STORE') => {
    if (method === 'HOME') {
      tryAction(
        'select-home-delivery',
        () => {
          setCartDeliveryMethod('HOME');
          markDeliverySelected();
        },
        { buttonLabel: '購物車-宅配到府' }
      );
    } else {
      tryAction('select-home-delivery', undefined, { buttonLabel: '購物車-門市取貨' });
    }
  };

  return (
    <>
      <div className="bg-white pb-36">
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
          <div className="px-4 py-3 flex items-center gap-3">
            <GuardedButton
              action="back-from-cart"
              onAllowedClick={() => setView(returnTo ?? { type: 'HOME' })}
              className={`p-1 flex-shrink-0 ${!canAction('back-from-cart') ? 'opacity-35' : ''}`}
              aria-label="返回"
            >
              <ArrowLeft size={24} />
            </GuardedButton>
            <h2 className="text-xl font-bold flex-1 min-w-0">購物車</h2>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex-shrink-0">
              {cartItems.length} 個項目
            </span>
          </div>
        </header>

        <div className="p-4 space-y-4">
        <AnimatePresence initial={false}>
          {cartItems.map(item => {
            const p = getProduct(item.productId);
            if (!p) return null;
            return (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-white rounded-xl p-4 flex gap-4 shadow-sm"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm truncate pr-2">{p.name}</h3>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-300 hover:text-gray-500 active:scale-95 transition-all p-0.5"
                      aria-label="移除商品"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{p.sizeDisplay}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1">
                      <button
                        onClick={() => handleDecrement(item.productId, item.quantity)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => tryAction('select-home-delivery')}
                        className="w-8 h-8 flex items-center justify-center text-gray-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-gray-900">NT$ {(p.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {cartItems.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium mb-2">購物車是空的</p>
            {currentStep === 5 && (
              <p className="text-[11px] text-green-600 font-bold">應付總額：NT$ 0</p>
            )}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-bold text-sm mb-4">選擇配送方式</h4>
            <div className="space-y-3">
              <button
                onClick={() => handleSelectDelivery('HOME')}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                  deliveryMethod === 'HOME'
                    ? 'border-gray-900 bg-gray-50/50 shadow-md'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    deliveryMethod === 'HOME' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <Truck size={20} />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-bold">宅配到府</h5>
                    <p className="text-[10px] text-gray-500">預計 3-5 個工作天</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">NT$ 500</span>
              </button>
              <button
                onClick={() => handleSelectDelivery('STORE')}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                  deliveryMethod === 'STORE' ? 'border-gray-900 bg-gray-50/50 shadow-md' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                    <Store size={20} />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-bold">門市取貨</h5>
                    <p className="text-[10px] text-gray-500">請確認門市庫存</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-400">免費</span>
              </button>
            </div>

            {deliveryMethod === 'HOME' && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-gray-400">配送至</p>
                    <span
                      className="text-[11px] font-bold text-gray-500 border border-gray-200 px-2.5 py-1 rounded-md bg-gray-50 pointer-events-none select-none"
                      aria-hidden
                    >
                      修改
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">王大明</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    台北市內湖區新湖一路 168 號
                    <br />
                    0912-345-678
                  </p>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-gray-400">宅配運費</span>
                  <span className="font-bold text-gray-900">NT$ 500</span>
                </div>
              </div>
            )}
            {deliveryMethod === 'STORE' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 mb-2">取貨門市</p>
                <p className="text-sm font-bold text-gray-900">內湖店</p>
                <p className="text-xs text-gray-500 mt-1">台北市內湖區新湖一路 168 號</p>
              </div>
            )}
          </div>
        )}

        <section className="pt-2 pb-3">
          <h4 className="font-bold text-sm mb-3">你可能會感興趣</h4>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {PRODUCTS.slice(2, 4).map(p => (
              <div key={p.id} className="w-[6.75rem] flex-shrink-0">
                <ProductCard
                  product={p}
                  compact
                  dense
                  onOpen={() => tryAction('select-home-delivery')}
                  onAddToCart={e => {
                    e.stopPropagation();
                    tryAction('select-home-delivery');
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-4 pt-3 pb-[4.75rem] z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          {(currentStep === 4 || deliveryMethod === 'HOME') && (
            <div className="space-y-1 text-[10px] text-gray-400 mb-2">
              <div className="flex justify-between gap-4">
                <span>商品小計</span>
                <span className="tabular-nums">NT$ {subtotal.toLocaleString()}</span>
              </div>
              {deliveryMethod != null && (
                <div className="flex justify-between gap-4">
                  <span>運費</span>
                  <span className="tabular-nums">
                    {deliveryMethod === 'HOME'
                      ? `NT$ ${shippingFee.toLocaleString()}`
                      : '免費'}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[9px] text-gray-400 font-medium block leading-none mb-0.5">
                {currentStep === 5 ? '應付總額' : '總計金額'}
              </span>
              <span className="text-lg font-bold text-gray-900 leading-tight">
                NT$ {total.toLocaleString()}
              </span>
            </div>
            <GuardedButton
              action="go-checkout"
              actionMeta={{ buttonLabel: '購物車-前往結帳' }}
              onAllowedClick={() => {
                if (currentStep === 4) {
                  if (deliveryMethod !== 'HOME') {
                    showToast('請選擇配送方式');
                    return;
                  }
                  setView({ type: 'CHECKOUT' });
                  completeTaskWithFeedback(4, '前往結帳', () =>
                    setView({ type: 'CHECKOUT' })
                  );
                  return;
                }
                setView({ type: 'CHECKOUT' });
              }}
              className="flex-shrink-0 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-[0.98] transition-transform"
            >
              前往結帳
              <ArrowRight size={16} />
            </GuardedButton>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
