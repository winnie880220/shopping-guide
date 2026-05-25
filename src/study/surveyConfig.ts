/** SurveyCake 問卷網址；可於 .env.local 以 VITE_SURVEYCAKE_URL 覆寫 */
const DEFAULT_SURVEY_URL = 'https://www.surveycake.com/s/W2N7y';
const SURVEYCAKE_BASE =
  import.meta.env.VITE_SURVEYCAKE_URL?.trim() || DEFAULT_SURVEY_URL;

/**
 * SurveyCake「受測者編號」欄位的隱藏題 hash。
 * 在 SurveyCake 後台新增一個「隱藏題」，取得其 hash 後填入此處。
 * URL 會變成: https://www.surveycake.com/s/W2N7y?svq_1=UserID值
 */
const SURVEYCAKE_USERID_PARAM = 'svq_1';

export function getSurveyCakeUrl(userId?: string): string | null {
  if (!SURVEYCAKE_BASE) return null;

  try {
    const url = new URL(SURVEYCAKE_BASE);
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('pid');
    if (pid && !url.searchParams.has('pid')) {
      url.searchParams.set('pid', pid);
    }
    if (userId) {
      url.searchParams.set(SURVEYCAKE_USERID_PARAM, userId);
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function getSurveyCakeEmbedUrl(userId?: string): string | null {
  const url = getSurveyCakeUrl(userId);
  if (!url) return null;
  const parsed = new URL(url);
  if (!parsed.searchParams.has('embed')) {
    parsed.searchParams.set('embed', 'true');
  }
  return parsed.toString();
}
