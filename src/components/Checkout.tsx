import React from 'react';
import { ArrowLeft, Check, CheckCircle2, Truck, Store, Info, ShieldCheck } from 'lucide-react';
import { ViewState, CartItem } from '../types';
import { PRODUCTS } from '../data';
import { GuardedButton } from './GuardedButton';
import { TaskHint } from './TaskHint';
import { useStudy } from '../context/StudyContext';

interface CheckoutProps {
  cartItems: CartItem[];
  setView: (view: ViewState) => void;
  setCartItems: (items: CartItem[]) => void;
  returnTo?: ViewState;
}

export const Checkout: React.FC<CheckoutProps> = ({ cartItems, setView, returnTo }) => {
  const { canAction, tryAction, cartDeliveryMethod } = useStudy();
  const deliveryMethod = cartDeliveryMethod ?? 'HOME';

  const getProduct = (id: string) => PRODUCTS.find(p => p.id === id);

  const subtotal = cartItems.reduce((acc, item) => {
    const p = getProduct(item.productId);
    return acc + (p?.price || 0) * item.quantity;
  }, 0);

  const shippingFee = deliveryMethod === 'HOME' ? 500 : 0;
  const total = subtotal + shippingFee;
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const checkoutSteps = ['資訊', '付款'] as const;
  const currentCheckoutStep = 1;

  return (
    <>
      <TaskHint sticky={false} setView={setView} />
      <div className="bg-white pb-40">
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
          <div className="px-4 py-3 flex items-center gap-4">
            <GuardedButton
              action="back-cart"
              onAllowedClick={() => setView(returnTo ?? { type: 'CART' })}
              actionMeta={{ entrySource: 'checkout_back', buttonLabel: '結帳頁-返回購物車' }}
              className={`p-1 ${!canAction('back-cart') ? 'opacity-35' : ''}`}
            >
              <ArrowLeft size={24} />
            </GuardedButton>
            <h2 className="text-xl font-bold">結帳</h2>
          </div>
        </header>

        <div className="p-4 space-y-4">
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            {checkoutSteps.map((step, idx) => {
              const isCompleted = idx < currentCheckoutStep;
              const isActive = idx === currentCheckoutStep;
              return (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 transition-colors ${
                      isCompleted
                        ? 'bg-[#0058ab] text-white'
                        : isActive
                          ? 'bg-[#0058ab] text-white ring-2 ring-[#0058ab]/20'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check size={11} strokeWidth={3} /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      isCompleted || isActive ? 'text-[#0058ab]' : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-1 bg-gray-100 rounded-full relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[#0058ab] rounded-full transition-all"
              style={{ width: `${(currentCheckoutStep / (checkoutSteps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">您購買的商品</h3>
            <span className="text-[11px] text-gray-400">{itemCount} 件</span>
          </div>
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">購物車目前沒有商品</p>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => {
                const p = getProduct(item.productId);
                if (!p) return null;
                return (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-100">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-[13px] font-bold text-gray-900 truncate">{p.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{p.sizeDisplay}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[12px] text-gray-500">數量 {item.quantity}</span>
                        <span className="text-[13px] font-bold text-gray-900">
                          NT$ {(p.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 mb-4">收件資訊</h3>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold mb-1">王大明</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                台北市內湖區新湖一路 168 號
                <br />
                0912-345-678
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <h3 className="text-sm font-bold text-gray-400 mb-4">配送方式</h3>

          {deliveryMethod === 'HOME' ? (
            <div className="w-full p-4 rounded-xl border-2 border-gray-900 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full text-gray-900">
                  <Truck size={24} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold">宅配到府</h4>
                  <p className="text-[11px] text-gray-500">預計 3–5 個工作天送達</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">NT$ 500</span>
            </div>
          ) : (
            <div className="w-full p-4 rounded-xl border-2 border-gray-900 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full text-gray-900">
                  <Store size={24} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold">門市取貨</h4>
                  <p className="text-[11px] text-gray-500">內湖店</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">免費</span>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <h3 className="text-sm font-bold text-gray-400 mb-4">訂單摘要</h3>
          <div className="space-y-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">商品小計 ({itemCount} 件)</span>
              <span className="font-bold text-gray-900">NT$ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">運費</span>
              <span className="font-bold text-gray-900">
                {shippingFee === 0 ? '免費' : `NT$ ${shippingFee.toLocaleString()}`}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900">應付總額</span>
              <span className="text-xl font-black text-gray-900">NT$ {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl flex gap-3 text-[12px] text-gray-500 leading-relaxed">
            <Info size={14} className="flex-shrink-0 text-gray-400" />
            本次測試僅需確認金額，無需完成實際付款。
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-4 pt-3 pb-[4.75rem] z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[9px] text-gray-400 font-medium block leading-none mb-0.5">
              應付總額
            </span>
            <span className="text-lg font-bold text-gray-900 leading-tight">
              NT$ {total.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => tryAction('go-checkout')}
            disabled={cartItems.length === 0}
            className="flex-shrink-0 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <ShieldCheck size={18} />
            安全付款，完成訂單
          </button>
        </div>
      </div>
      </div>
    </>
  );
};
