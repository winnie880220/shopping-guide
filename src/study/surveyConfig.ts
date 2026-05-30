/** SurveyCake 問卷網址；可於 .env.local 以 VITE_SURVEYCAKE_URL 覆寫 */
const DEFAULT_SURVEY_URL = 'https://www.surveycake.com/s/wqpxM';
const SURVEYCAKE_BASE =
  import.meta.env.VITE_SURVEYCAKE_URL?.trim() || DEFAULT_SURVEY_URL;

/**
 * 第一題「受測者編號」在 SurveyCake 後台設定的「別名」。
 * 後台：單行文字題 → 進階 → 別名與預設值 → 別名填 participant_id
 * SurveyCake 網址參數為 aka_別名，例如 ?aka_participant_id=P-xxx
 * 若未設別名，可改設 VITE_SURVEYCAKE_USERID_PARAM=ssn1（第一題預設編碼）
 */
const SURVEYCAKE_USERID_ALIAS =
  import.meta.env.VITE_SURVEYCAKE_USERID_PARAM?.trim() || 'participant_id';

/** SurveyCake 別名對應的 URL 參數名（aka_ 前綴）；ssn1 等則直接使用 */
function resolveUserIdParamKey(aliasOrParam: string): string {
  const raw = aliasOrParam.trim();
  if (/^(aka_|ssn\d+)/i.test(raw)) return raw;
  return `aka_${raw}`;
}

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
      url.searchParams.set(resolveUserIdParamKey(SURVEYCAKE_USERID_ALIAS), userId);
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
