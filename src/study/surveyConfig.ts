/** SurveyCake 問卷網址；可於 .env.local 以 VITE_SURVEYCAKE_URL 覆寫 */
const DEFAULT_SURVEY_URL = 'https://www.surveycake.com/s/W2N7y';
const SURVEYCAKE_BASE =
  import.meta.env.VITE_SURVEYCAKE_URL?.trim() || DEFAULT_SURVEY_URL;

export function getSurveyCakeUrl(): string | null {
  if (!SURVEYCAKE_BASE) return null;

  try {
    const url = new URL(SURVEYCAKE_BASE);
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('pid');
    if (pid && !url.searchParams.has('pid')) {
      url.searchParams.set('pid', pid);
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function getSurveyCakeEmbedUrl(): string | null {
  const url = getSurveyCakeUrl();
  if (!url) return null;
  const parsed = new URL(url);
  if (!parsed.searchParams.has('embed')) {
    parsed.searchParams.set('embed', 'true');
  }
  return parsed.toString();
}
