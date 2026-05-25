export type StudyTaskStep = 1 | 2 | 3 | 4 | 5;

export type StudyAction =
  | 'open-search'
  | 'submit-search'
  | 'add-mattress-to-cart'
  | 'nav-home'
  | 'nav-category'
  | 'nav-cart'
  | 'open-coffee-tables'
  | 'open-wood-table'
  | 'view-specs'
  | 'check-stock'
  | 'add-table-to-cart'
  | 'select-home-delivery'
  | 'go-checkout'
  | 'remove-mattress'
  | 'back-search'
  | 'back-product-list'
  | 'back-product-detail'
  | 'back-cart';

export const TASK_MATTRESS_ID = 'm1';
export const TASK_TABLE_ID = 'c1';

export type BriefingSegment = { text: string; semibold?: boolean };

export const STUDY_BRIEFING = {
  title: {
    main: '生活居家電商介面設計研究',
    sub: '測試說明',
  },
  paragraphs: [
    [
      {
        text: '感謝您參與本次研究測試。本研究旨在了解生活居家品牌 App 在完整購物流程中的介面易用性，作為後續介面優化與學術分析的重要依據。',
      },
    ],
    [
      { text: '接下來，您將依序完成 ' },
      {
        text: '5 項操作任務；每項任務開始前，系統會先顯示該任務的步驟說明，請您依指示盡力完成。',
        semibold: true,
      },
    ],
    [{ text: '在您實際操作的同時，系統將針對各項任務分別進行計時。', semibold: true }],
    [
      {
        text: '本測試無標準答案，亦不進行對錯評分，請依照您平時的使用習慣與直覺操作即可。',
      },
    ],
    [
      { text: '本研究採' },
      { text: '匿名方式進行', semibold: true },
      {
        text: '，不會蒐集任何可識別個人身分的資訊；所有資料僅供學術分析使用，亦不對外公開，請安心參與。',
      },
    ],
    [
      {
        text: '整體操作時間約為 10–15 分鐘，請依您的實際使用經驗與直覺進行操作。',
      },
    ],
    [{ text: '若您同意參與本研究，請點選下方「開始」按鈕。', semibold: true }],
  ] satisfies BriefingSegment[][],
} as const;

export const TASK_HINTS: Record<StudyTaskStep, { title: string; hint: string; assist?: string }> = {
  1: {
    title: '任務 1 · 搜尋與篩選',
    hint: '請搜尋「床墊」，並透過篩選功能設定「雙人尺寸」與「預算 NT$5,000–12,000」，找出符合條件的商品並加入購物車。',
  },
  2: {
    title: '任務 2 · 分類瀏覽',
    hint: '您已回到首頁。請在不使用搜尋欄的前提下，透過商品分類找到木紋材質的茶几／邊桌。',
  },
  3: {
    title: '任務 3 · 規格與庫存',
    hint: '請查看本商品的尺寸規格，確認內湖店現貨狀況，並將茶几加入購物車。',
  },
  4: {
    title: '任務 4 · 配送方式',
    hint: '請找到購物車，選擇「宅配到府」配送方式，確認運費後點選「前往結帳」。',
    assist: '請先前往購物車',
  },
  5: {
    title: '任務 5 · 調整購物車',
    hint: '您目前在結帳頁。請前往購物車移除床墊，並確認更新後的結帳金額。',
    assist: '移除商品後，金額將即時更新',
  },
};

/** 任務完成畫面說明 */
export const TASK_COMPLETE_MESSAGES: Record<StudyTaskStep, { title: string; subtitle: string }> = {
  1: {
    title: '任務 1 已完成',
    subtitle: '床墊已成功加入購物車，請繼續進行下一項任務。',
  },
  2: {
    title: '任務 2 已完成',
    subtitle: '您已找到木紋茶几／邊桌，請繼續確認商品詳情。',
  },
  3: {
    title: '任務 3 已完成',
    subtitle: '您已確認規格與庫存，並將茶几加入購物車。',
  },
  4: {
    title: '任務 4 已完成',
    subtitle: '您已前往結帳頁面，請繼續下一個任務。',
  },
  5: {
    title: '全部任務已完成',
    subtitle: '感謝您的參與，操作測試至此結束。',
  },
};

const STEP_ACTIONS: Record<StudyTaskStep, StudyAction[]> = {
  1: ['open-search', 'submit-search', 'add-mattress-to-cart', 'back-search', 'back-product-list'],
  2: ['nav-home', 'nav-category', 'open-coffee-tables', 'open-wood-table', 'back-product-list'],
  3: ['view-specs', 'check-stock', 'add-table-to-cart', 'nav-cart'],
  4: ['nav-cart', 'select-home-delivery', 'go-checkout'],
  5: ['nav-cart', 'remove-mattress', 'go-checkout', 'back-cart'],
};

export function isActionAllowed(step: StudyTaskStep, action: StudyAction): boolean {
  return STEP_ACTIONS[step].includes(action);
}

export const OFF_PATH_TOAST =
  '此操作不在本次任務範圍內，請依上方提示繼續。';

export const OFF_PATH_TOAST_VARIANTS = [
  '此功能不在本次任務範圍內，請依上方提示繼續。',
  '目前無需使用此功能，請依照任務指引操作。',
  '請先完成目前步驟，其他功能可稍後再試。',
];

export function parseMattressSearchQuery(query: string) {
  const q = query.trim();
  const isMattressQuery = /床墊|mattress/i.test(q);

  if (!isMattressQuery) return null;

  return {
    categoryId: 'mattress',
  };
}
