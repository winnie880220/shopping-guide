/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, CartItem } from './types';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { Search } from './components/Search';
import { CategoryList } from './components/CategoryList';
import { ProductList } from './components/ProductList';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { TaskHint } from './components/TaskHint';
import { StudyBriefing } from './components/StudyBriefing';
import { TaskIntro } from './components/TaskIntro';
import { TaskComplete } from './components/TaskComplete';
import { Toast } from './components/Toast';
import { useStudy } from './context/StudyContext';
import { AnimatePresence, motion } from 'motion/react';
import { StudyCompleteScreen } from './components/StudyCompleteScreen';
import { resolveAnalyticsPath, trackPageView } from './lib/analytics';

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'HOME' });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const navigate = useCallback((next: ViewState) => {
    setView((current) => {
      if (next.type === 'SEARCH' && next.returnTo == null) {
        return { ...next, returnTo: current };
      }
      if (next.type === 'CART') {
        if (next.returnTo != null) return next;
        if (current.type === 'CHECKOUT') {
          return { type: 'CART', returnTo: current.returnTo };
        }
        if (current.type === 'CART') return next;
        return { ...next, returnTo: current };
      }
      if (next.type === 'CHECKOUT' && current.type === 'CART') {
        return { type: 'CHECKOUT', returnTo: current.returnTo };
      }
      return next;
    });
  }, []);
  const {
    toast,
    isStudyBriefingVisible,
    isTaskIntroVisible,
    taskCompleteOverlay,
    isStudyComplete,
  } = useStudy();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  useEffect(() => {
    const pagePath = resolveAnalyticsPath(view, {
      isStudyComplete,
      isStudyBriefingVisible,
      isTaskIntroVisible,
      taskCompleteOverlay,
    });
    trackPageView(pagePath);
  }, [
    view,
    isStudyComplete,
    isStudyBriefingVisible,
    isTaskIntroVisible,
    taskCompleteOverlay,
  ]);

  const addToCart = (
    productId: string,
    quantity = 1,
    mode: 'increment' | 'set' = 'increment'
  ) => {
    const amount = Math.max(1, quantity);
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? {
                ...item,
                quantity: mode === 'set' ? amount : item.quantity + amount,
              }
            : item
        );
      }
      return [...prev, { productId, quantity: amount }];
    });
  };

  const renderView = () => {
    switch (view.type) {
      case 'HOME':
        return <Home setView={navigate} addToCart={addToCart} />;
      case 'SEARCH':
        return (
          <Search
            setView={navigate}
            initialQuery={view.query}
            returnTo={view.returnTo}
          />
        );
      case 'CATEGORY_LIST':
        return <CategoryList setView={navigate} />;
      case 'PRODUCT_LIST':
        return null;
      case 'PRODUCT_DETAIL':
        return null;
      case 'CART':
      case 'CHECKOUT':
        return null;
      default:
        return <Home setView={navigate} addToCart={addToCart} />;
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const showTaskHint =
    view.type !== 'SEARCH' &&
    view.type !== 'PRODUCT_LIST' &&
    view.type !== 'PRODUCT_DETAIL' &&
    view.type !== 'CART' &&
    view.type !== 'CHECKOUT';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white font-sans text-gray-900 overflow-x-clip selection:bg-[#ffda1a]/30">
      <AnimatePresence>
        {taskCompleteOverlay && <TaskComplete />}
        {!taskCompleteOverlay && isStudyBriefingVisible && <StudyBriefing />}
        {!taskCompleteOverlay && !isStudyBriefingVisible && isTaskIntroVisible && <TaskIntro />}
      </AnimatePresence>

      {!taskCompleteOverlay && !isStudyBriefingVisible && !isTaskIntroVisible && (
        <>
          {isStudyComplete ? (
            <StudyCompleteScreen />
          ) : (
            <>
              {showTaskHint && <TaskHint />}
              {view.type === 'PRODUCT_LIST' ? (
                <ProductList
                  categoryId={view.categoryId}
                  setView={navigate}
                  addToCart={addToCart}
                  aiSummary={view.aiSummary}
                  initialFilters={view.filters}
                  searchQuery={view.searchQuery}
                />
              ) : view.type === 'PRODUCT_DETAIL' ? (
                <ProductDetail
                  productId={view.productId}
                  setView={navigate}
                  addToCart={addToCart}
                  cartItems={cartItems}
                />
              ) : view.type === 'CART' ? (
                <Cart
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  setView={navigate}
                  returnTo={view.returnTo}
                />
              ) : view.type === 'CHECKOUT' ? (
                <Checkout
                  cartItems={cartItems}
                  setView={navigate}
                  setCartItems={setCartItems}
                />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={
                      view.type +
                      (view.type === 'PRODUCT_DETAIL' ? view.productId : '')
                    }
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transform: 'none' }}
                  >
                    {renderView()}
                  </motion.div>
                </AnimatePresence>
              )}

              <Navigation currentView={view} setView={navigate} cartCount={cartCount} />
            </>
          )}
        </>
      )}

      <Toast message={toast?.message ?? null} />
    </div>
  );
}
