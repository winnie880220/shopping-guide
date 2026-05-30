import React from 'react';
import { ClipboardList, ExternalLink } from 'lucide-react';
import { getSurveyCakeEmbedUrl, getSurveyCakeUrl } from '../study/surveyConfig';

function getParticipantId(): string {
  return sessionStorage.getItem('study-participant-id') || '';
}

export const StudyCompleteScreen: React.FC = () => {
  const userId = getParticipantId();
  const surveyUrl = getSurveyCakeUrl(userId);
  const embedUrl = getSurveyCakeEmbedUrl(userId);

  const openSurveyInNewTab = () => {
    if (surveyUrl) window.open(surveyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="px-8 pt-16 pb-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-6 mx-auto">
          <ClipboardList size={32} strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">請接續填寫研究問卷</h1>
        <p className="text-[15px] text-gray-500 leading-relaxed">
          您已完成全部操作任務，感謝您的參與。
        </p>
        {surveyUrl && (
          <p className="text-[14px] text-gray-600 leading-relaxed mt-4">
            請於下方填寫問卷（約 3–5 分鐘），完成後本次測試才算正式結束。您的回饋將有助於我們改進介面設計。
          </p>
        )}
      </div>

      {surveyUrl ? (
        <>
          <div className="px-6 pb-4">
            <button
              type="button"
              onClick={openSurveyInNewTab}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-gray-200"
            >
              另開新分頁
              <ExternalLink size={18} />
            </button>
          </div>
          {embedUrl && (
            <div className="flex-1 min-h-0 px-4 pb-6">
              <iframe
                title="SurveyCake 問卷"
                src={embedUrl}
                className="w-full h-[calc(100vh-280px)] min-h-[360px] rounded-2xl border border-gray-100 bg-gray-50"
              />
            </div>
          )}
        </>
      ) : (
        <p className="px-8 text-center text-[13px] text-amber-700 leading-relaxed">
          請在專案根目錄的 <code className="text-xs bg-amber-50 px-1 rounded">.env.local</code>{' '}
          設定 <code className="text-xs bg-amber-50 px-1 rounded">VITE_SURVEYCAKE_URL</code>
          （您的 SurveyCake 問卷連結）。
        </p>
      )}
    </div>
  );
};
