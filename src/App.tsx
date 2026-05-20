/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'HOME' });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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
        return <Home setView={setView} addToCart={addToCart} />;
      case 'SEARCH':
        return <Search setView={setView} initialQuery={view.query} />;
      case 'CATEGORY_LIST':
        return <CategoryList setView={setView} />;
      case 'PRODUCT_LIST':
        return (
          <ProductList
            categoryId={view.categoryId}
            setView={setView}
            addToCart={addToCart}
            aiSummary={view.aiSummary}
            initialFilters={view.filters}
          />
        );
      case 'PRODUCT_DETAIL':
        return (
          <ProductDetail
            productId={view.productId}
            setView={setView}
            addToCart={addToCart}
            cartItems={cartItems}
          />
        );
      case 'CART':
        return (
          <Cart
            cartItems={cartItems}
            setCartItems={setCartItems}
            setView={setView}
          />
        );
      case 'CHECKOUT':
        return (
          <Checkout
            cartItems={cartItems}
            setView={setView}
            setCartItems={setCartItems}
          />
        );
      default:
        return <Home setView={setView} addToCart={addToCart} />;
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const showTaskHint = view.type !== 'SEARCH';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-[#ffda1a]/30">
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={
                    view.type +
                    (view.type === 'PRODUCT_LIST' ? view.categoryId : '') +
                    (view.type === 'PRODUCT_DETAIL' ? view.productId : '')
                  }
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>

              <Navigation currentView={view} setView={setView} cartCount={cartCount} />
            </>
          )}
        </>
      )}

      <Toast message={toast?.message ?? null} />
    </div>
  );
}
