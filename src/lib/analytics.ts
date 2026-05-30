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
let currentPagePath = '/home';

export function setCurrentPagePath(pagePath: string) {
  currentPagePath = pagePath;
}

function getParticipantId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return sessionStorage.getItem('study-participant-id') ?? undefined;
}

function ensureGtag() {
  if (typeof window === 'undefined' || !GA_ID) return false;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }
  return true;
}

function gtagEvent(...args: unknown[]) {
  if (!ensureGtag()) return;
  window.gtag(...args);
}

function baseEventParams(taskStep?: number) {
  return {
    page_path: currentPagePath,
    ...(taskStep != null ? { task_step: taskStep } : {}),
    ...(getParticipantId() ? { participant_id: getParticipantId() } : {}),
  };
}

/** 若 index.html 已注入 gtag，這裡只補 user_id；否則動態載入（本機 dev 備援） */
export function initGA() {
  if (!GA_ID || initialized || typeof window === 'undefined') return;

  if (window.gtag) {
    const userId = getParticipantId();
    if (userId) {
      window.gtag('config', GA_ID, { user_id: userId });
    }
    initialized = true;
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  ensureGtag();
  window.gtag('js', new Date());

  const userId = getParticipantId();
  window.gtag('config', GA_ID, {
    send_page_view: false,
    ...(userId ? { user_id: userId } : {}),
  });

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
  if (!GA_ID) return;
  setCurrentPagePath(pagePath);
  gtagEvent('event', 'page_view', {
    page_path: pagePath,
    page_title: pagePath,
    ...baseEventParams(),
  });
}

/** A：主流程有效操作 */
export function trackStudyAction(action: string, taskStep: StudyTaskStep) {
  if (!GA_ID) return;
  gtagEvent('event', 'study_action', {
    action,
    ...baseEventParams(taskStep),
  });
}

/** B：任務外／不允許的操作 */
export function trackStudyOffPath(action: string, taskStep: StudyTaskStep) {
  if (!GA_ID) return;
  gtagEvent('event', 'study_off_path', {
    action,
    ...baseEventParams(taskStep),
  });
}

/** 任務完成 */
export function trackTaskComplete(taskStep: StudyTaskStep, durationSec: number) {
  if (!GA_ID) return;
  gtagEvent('event', 'task_complete', {
    ...baseEventParams(taskStep),
    duration_sec: Math.round(durationSec * 10) / 10,
  });
}

export function getGaMeasurementId() {
  return GA_ID ?? null;
}
