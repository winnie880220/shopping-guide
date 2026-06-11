import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Heart, Share2, MapPin, ChevronRight, ShoppingCart, Minus, Plus, Star } from 'lucide-react';
import { ViewState, CartItem, Product } from '../types';
import { PRODUCTS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { GuardedButton } from './GuardedButton';
import { useStudy, TASK_TABLE_ID, TASK_MATTRESS_ID } from '../context/StudyContext';
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

const STICKY_HEADER_ESTIMATE = 48;

function getDetailTags(product: Product): string[] {
  if (product.variantTags?.length) return product.variantTags.slice(0, 2);
  if (product.sizeDisplay) return [product.sizeDisplay];
  return [];
}

function getLongDescription(product: Product): string {
  const lead = product.description.endsWith('。') ? product.description : `${product.description}。`;
  const detailText = product.details.length ? `${product.details.join('，')}。` : '';
  const materialText = product.material
    ? `材質採用${product.material}，在耐用度與日常保養之間取得良好平衡。`
    : '';
  return `${lead}${detailText}${materialText}無論是日常使用或長時間倚靠，都能提供穩定且舒適的體驗；細緻做工與簡約外觀也讓它更容易融入不同風格的居家空間，是兼顧機能與美感的實用選擇。`;
}

interface ProductDetailProps {
  productId: string;
  setView: (view: ViewState) => void;
  addToCart: (productId: string, quantity?: number, mode?: 'increment' | 'set') => void;
  cartItems: CartItem[];
  returnTo?: ViewState;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  productId,
  setView,
  addToCart,
  cartItems,
  returnTo,
}) => {
  const product = PRODUCTS.find(p => p.id === productId);
  const [showDescription, setShowDescription] = useState(true);
  const [showSpecs, setShowSpecs] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const imageToolbarRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const getSectionTop = useCallback((el: HTMLElement) => {
    return el.getBoundingClientRect().top + window.scrollY;
  }, []);

  const getStickyHeaderHeight = useCallback(() => {
    const gallery = sectionRefs.current['section-gallery'];
    if (!gallery || gallery.getBoundingClientRect().bottom > 0) return 0;
    return stickyHeaderRef.current?.offsetHeight ?? STICKY_HEADER_ESTIMATE;
  }, []);

  const getPinnedOffset = useCallback(() => {
    return getStickyHeaderHeight() + 8;
  }, [getStickyHeaderHeight]);

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
    trackOffPathClick,
    markSpecsViewed,
    markStockChecked,
    completeTaskWithFeedback,
    currentStep,
    specsViewed,
    stockChecked,
    canAction,
  } = useStudy();

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

  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (sectionId === 'section-gallery') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const el = sectionRefs.current[sectionId];
      if (!el) return;

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const targetTop = Math.max(0, Math.min(getSectionTop(el) - getPinnedOffset(), maxScroll));
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    },
    [getSectionTop, getPinnedOffset]
  );

  const setSectionRef = useCallback(
    (sectionId: string) => (el: HTMLElement | null) => {
      sectionRefs.current[sectionId] = el;
    },
    []
  );

  if (!product) return null;

  const detailTags = getDetailTags(product);
  const longDescription = getLongDescription(product);

  const stockStatusLabel = (status: string) => {
    if (status === 'out-of-stock') return { text: '目前無庫存', color: 'text-red-500', dot: 'bg-red-500' };
    if (status === 'low-stock') return { text: '庫存偏低', color: 'text-amber-600', dot: 'bg-amber-500' };
    return { text: '現貨供應', color: 'text-green-600', dot: 'bg-green-500' };
  };

  const tryFinishTask3 = (nextSpecs: boolean, nextStock: boolean) => {
    if (currentStep === 3 && productId === TASK_TABLE_ID && nextSpecs && nextStock) {
      completeTaskWithFeedback(3, '已確認規格與庫存');
    }
  };

  const handleAddToCart = () => {
    if (currentStep === 1 && productId === TASK_MATTRESS_ID) {
      tryAction(
        'add-mattress-to-cart',
        () => {
          addToCart(productId, quantity, 'set');
          completeTaskWithFeedback(
            1,
            `${product.name} 已加入購物車`,
            () => setView({ type: 'HOME' })
          );
        },
        {
          entrySource: 'product_detail',
          buttonLabel: '商品詳情-加入購物車',
        }
      );
      return;
    }
    if (currentStep === 1) {
      tryAction('add-mattress-to-cart', undefined, { buttonLabel: '商品詳情-加入購物車' });
      return;
    }
    if (currentStep === 4 && productId === TASK_TABLE_ID) {
      tryAction(
        'add-table-to-cart',
        () => {
          addToCart(productId, quantity, 'set');
        },
        { buttonLabel: '商品詳情-加入購物車' }
      );
      return;
    }
    if (currentStep === 3) {
      trackOffPathClick('商品詳情-加入購物車');
      return;
    }
    if (currentStep === 4) {
      trackOffPathClick('商品詳情-加入購物車');
      return;
    }
    tryAction('add-table-to-cart', undefined, { buttonLabel: '商品詳情-加入購物車' });
  };

  const handleToggleSpecs = () => {
    if (showSpecs) {
      setShowSpecs(false);
      return;
    }
    tryAction(
      'view-specs',
      () => {
        setShowSpecs(true);
        markSpecsViewed();
        tryFinishTask3(true, stockChecked);
      },
      { buttonLabel: '查看產品規格與尺寸' }
    );
  };

  const handleCheckStock = () => {
    setShowStock(true);
    markStockChecked();
    tryFinishTask3(specsViewed, true);
    scrollToSection('section-stock');
  };

  const handleBack = () => {
    if (returnTo) {
      setView(returnTo);
      return;
    }
    setView({ type: 'PRODUCT_LIST', categoryId: product.categoryId });
  };

  return (
    <div className="bg-white min-h-screen pb-44">
      <TaskHint sticky={false} setView={setView} />

      <div
        id="section-gallery"
        ref={setSectionRef('section-gallery')}
        className="relative aspect-[4/3] bg-gray-100 overflow-hidden border-b border-gray-50"
      >
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
              onClick={() => trackOffPathClick('商品詳情-分享')}
            >
              <Share2 size={18} />
            </button>
            <button
              type="button"
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 text-red-500"
              onClick={() => trackOffPathClick('商品詳情-收藏')}
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
            productId === 'c1' ? 'object-[center_55%]' : 'object-center'
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
              onClick={() => trackOffPathClick(`商品詳情-商品圖片${index + 1}`)}
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
            ref={stickyHeaderRef}
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
                    onClick={() => trackOffPathClick('商品詳情-分享')}
                    aria-label="分享"
                  >
                    <Share2 size={20} className="text-gray-700" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-full active:scale-90 text-red-500"
                    onClick={() => trackOffPathClick('商品詳情-收藏(置頂列)')}
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
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h2>
          {detailTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {detailTags.map(tag => (
                <span
                  key={tag}
                  className="inline-block rounded-md bg-[#eef3f8] text-[#6b849c] text-[10px] px-2 py-0.5 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span className="font-bold text-gray-900">
            <span className="text-[13px]">NT$</span>{' '}
            <span className="text-2xl">{product.price.toLocaleString()}</span>
          </span>
        </div>

        <section
          id="section-stock"
          ref={setSectionRef('section-stock')}
          className="mb-6"
        >
          <GuardedButton
            action="check-stock"
            onAllowedClick={handleCheckStock}
            actionMeta={{ buttonLabel: '查看分店庫存' }}
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
                        className="w-full flex items-start justify-between gap-3 text-left"
                        onClick={() => trackOffPathClick(`商品詳情-分店-${store.location}`)}
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

        <section id="section-description" className="mb-6">
          <button
            type="button"
            onClick={() => setShowDescription(prev => !prev)}
            className="w-full flex items-center justify-between py-3 border-b border-gray-100"
          >
            <span className="text-sm font-bold text-gray-900">商品說明</span>
            <ChevronRight
              size={16}
              className={`text-gray-400 transition-transform ${showDescription ? 'rotate-90' : ''}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {showDescription && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="pt-3 text-[13px] text-gray-600 leading-relaxed">
                  {longDescription}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section id="section-specs" className="mb-8">
          <button
            type="button"
            onClick={handleToggleSpecs}
            className="w-full flex items-center justify-between py-3 border-b border-gray-100"
          >
            <span className="text-sm font-bold text-gray-900">商品規格</span>
            <ChevronRight
              size={16}
              className={`text-gray-400 transition-transform ${showSpecs ? 'rotate-90' : ''}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {showSpecs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {product.specs.map(spec => (
                    <div key={spec.label} className="flex justify-between items-start gap-4 text-[13px] leading-relaxed">
                      <span className="text-gray-500">{spec.label}</span>
                      <span className="font-bold text-gray-900 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section id="section-reviews" className="mb-8">
          <h4 className="font-bold text-sm mb-3">商品評價</h4>
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={14} fill={i <= 4 ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">4.6</span>
              <span className="text-[11px] text-gray-400">（128 則評價）</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-bold text-gray-900 mb-1">支撐感很好，睡眠品質有提升</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  使用一週後翻身時較不易干擾到另一側，整體睡感符合期待，配送與組裝流程也很順暢。
                </p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-900 mb-1">外觀簡潔，與臥室風格很搭</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  材質觸感不錯，細節做工穩定，若需要偏硬一點的床墊會是很值得考慮的選項。
                </p>
              </div>
            </div>
          </div>
        </section>

        {pairingProducts.length > 0 && (
          <section id="section-pairing" className="mb-8">
            <div className="mb-3">
              <h4 className="font-bold text-sm leading-tight">情境搭配建議</h4>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1">
              {pairingProducts.map(p => (
                <div key={p.id} className="w-[8.25rem] flex-shrink-0">
                  <ProductCard
                    product={p}
                    compact
                    onOpen={() => trackOffPathClick('商品詳情-情境搭配商品')}
                    onAddToCart={e => {
                      e.stopPropagation();
                      trackOffPathClick('商品詳情-情境搭配加入購物車');
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {recommendedProducts.length > 0 && (
          <section id="section-recommended" className="mb-8">
            <h4 className="font-bold text-sm mb-3">其他推薦產品</h4>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1">
              {recommendedProducts.map(p => (
                <div key={p.id} className="w-[8.25rem] flex-shrink-0">
                  <ProductCard
                    product={p}
                    compact
                    onOpen={() => trackOffPathClick('商品詳情-其他推薦商品')}
                    onAddToCart={e => {
                      e.stopPropagation();
                      trackOffPathClick('商品詳情-其他推薦加入購物車');
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-[4.25rem] left-0 right-0 max-w-md mx-auto z-40 bg-white border-t border-gray-100 px-4 pt-3 pb-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl px-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => trackOffPathClick('商品詳情-減少數量')}
              className="w-10 h-10 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
              aria-label="減少數量"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold w-8 text-center tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => trackOffPathClick('商品詳情-增加數量')}
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
