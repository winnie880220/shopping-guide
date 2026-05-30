import type { ViewState } from '../types';
import type { StudyTaskStep } from '../study/taskConfig';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function initGA() {
  if (!GA_ID || initialized || typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });

  initialized = true;
}

export function resolveAnalyticsPath(
  view: ViewState,
  options: {
    isStudyComplete: boolean;
    isStudyBriefingVisible: boolean;
    isTaskIntroVisible: boolean;
    taskCompleteOverlay: StudyTaskStep | null;
  }
): string {
  if (options.isStudyBriefingVisible) return '/study/briefing';
  if (options.isTaskIntroVisible) return '/study/task-intro';
  if (options.taskCompleteOverlay) {
    return `/study/task-complete/${options.taskCompleteOverlay}`;
  }
  if (options.isStudyComplete) return '/study/complete';

  switch (view.type) {
    case 'HOME':
      return '/home';
    case 'SEARCH':
      return '/search';
    case 'CATEGORY_LIST':
      return '/category-list';
    case 'CATEGORY':
      return `/category/${view.categoryId}`;
    case 'PRODUCT_LIST':
      return `/product-list/${view.categoryId}`;
    case 'PRODUCT_DETAIL':
      return `/product-detail/${view.productId}`;
    case 'CART':
      return '/cart';
    case 'CHECKOUT':
      return '/checkout';
    default:
      return '/home';
  }
}

export function trackPageView(pagePath: string) {
  if (!GA_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pagePath,
  });
}
