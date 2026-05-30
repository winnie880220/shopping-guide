import React from 'react';
import { Home as HomeIcon, Heart, Search, ShoppingCart, User, Menu } from 'lucide-react';
import { ViewState } from '../types';
import { useStudy } from '../context/StudyContext';
import { StudyAction } from '../study/taskConfig';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  cartCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, cartCount }) => {
  const { tryAction, trackOffPathClick } = useStudy();

  const tabs: {
    id: string;
    icon: typeof HomeIcon;
    label: string;
    action?: StudyAction;
    count?: number;
  }[] = [
    { id: 'HOME', icon: HomeIcon, label: '首頁', action: 'nav-home' },
    { id: 'CATEGORY', icon: Menu, label: '商品分類', action: 'nav-category' },
    { id: 'FAVORITE', icon: Heart, label: '收藏' },
    { id: 'CART', icon: ShoppingCart, label: '購物車', action: 'nav-cart', count: cartCount },
    { id: 'USER', icon: User, label: '會員' },
  ];

  const handleTab = (tab: (typeof tabs)[number]) => {
    if (!tab.action) {
      trackOffPathClick(`底欄-${tab.label}`);
      return;
    }
    tryAction(
      tab.action,
      () => {
        if (tab.id === 'HOME') setView({ type: 'HOME' });
        else if (tab.id === 'CART') setView({ type: 'CART' });
        else if (tab.id === 'CATEGORY') setView({ type: 'CATEGORY_LIST' });
      },
      {
        buttonLabel: `底欄-${tab.label}`,
        ...(tab.id === 'CART' ? { entrySource: 'nav_cart_tab' } : {}),
      }
    );
  };

  const isActive = (tabId: string) =>
    currentView.type === tabId ||
    (tabId === 'CART' && currentView.type === 'CART') ||
    (tabId === 'CATEGORY' && currentView.type === 'CATEGORY_LIST');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-3 flex justify-around items-center z-50 shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTab(tab)}
          className={`flex flex-col items-center flex-1 py-1 relative transition-all ${
            isActive(tab.id) ? 'text-gray-900' : 'text-gray-300'
          }`}
        >
          <tab.icon size={22} strokeWidth={isActive(tab.id) ? 2 : 1.5} />
          <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          {tab.count !== undefined && tab.count > 0 && (
            <span className="absolute top-1 right-4 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};
