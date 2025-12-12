
import React from 'react';
import { CustomGuideItem, MedicalAnalysisData, MicroAction, Language, RichDetail } from '../types';
import { getTranslation } from '../constants/translations';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'health' | 'medical' | 'action';
  data: CustomGuideItem | MedicalAnalysisData | MicroAction | null;
  language: Language;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, type, data, language }) => {
  if (!isOpen || !data) return null;

  const t = getTranslation(language);
  const isHealth = type === 'health';
  const isMedical = type === 'medical';
  const isAction = type === 'action';
  const isKo = language === 'ko';

  // Type Guards & Data Extraction
  const healthData = isHealth ? (data as CustomGuideItem) : null;
  const medicalData = isMedical ? (data as MedicalAnalysisData) : null;
  const actionData = isAction ? (data as MicroAction) : null;

  const richContent: RichDetail | undefined = data.detail;
  const mainTitle = isHealth ? healthData?.title : isMedical ? medicalData?.hormone : actionData?.title;

  // Theme Logic
  let themeColor = 'teal';
  let bgColor = 'bg-teal-50';
  let borderColor = 'border-teal-100';
  let textColor = 'text-teal-900'; // Darker for better contrast
  let accentColor = 'text-teal-600';
  
  if (isMedical) {
      themeColor = 'rose';
      bgColor = 'bg-rose-50';
      borderColor = 'border-rose-100';
      textColor = 'text-rose-900';
      accentColor = 'text-rose-600';
  } else if (isAction && actionData) {
      const cat = actionData.category || 'routine';
      if (cat === 'career') {
          themeColor = 'blue';
          bgColor = 'bg-blue-50';
          borderColor = 'border-blue-100';
          textColor = 'text-blue-900';
          accentColor = 'text-blue-600';
      } else if (cat === 'health') {
          themeColor = 'emerald';
          bgColor = 'bg-emerald-50';
          borderColor = 'border-emerald-100';
          textColor = 'text-emerald-900';
          accentColor = 'text-emerald-600';
      } else {
          themeColor = 'purple';
          bgColor = 'bg-purple-50';
          borderColor = 'border-purple-100';
          textColor = 'text-purple-900';
          accentColor = 'text-purple-600';
      }
  }

  // Icons for Action
  const getActionIcon = (cat: string) => {
      switch(cat) {
          case 'career': return '💼';
          case 'health': return '💪';
          case 'social': return '🤝';
          default: return '📅';
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content - Expanded Width */}
      <div className={`relative w-full max-w-2xl md:max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-fade-in-up border ${borderColor} flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`${bgColor} px-6 py-6 border-b ${borderColor} flex items-center justify-between shrink-0`}>
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-white`}>
                    {isHealth && healthData?.icon}
                    {isMedical && '🩺'}
                    {isAction && actionData && getActionIcon(actionData.category)}
                </div>
                <div>
                    <h3 className={`font-extrabold text-xl md:text-2xl ${textColor} leading-tight`}>
                        {mainTitle}
                    </h3>
                    <p className={`text-sm font-bold opacity-80 ${accentColor} uppercase tracking-wide mt-1`}>
                         {isKo ? '심층 분석 & 가이드' : 'Deep Dive Analysis'}
                    </p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className={`p-2 rounded-full hover:bg-white/50 transition-colors ${textColor} opacity-70 hover:opacity-100`}
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto scrollbar-hide">
            
            {richContent ? (
                <div className="space-y-8 animate-fade-in-up">
                    
                    {/* Section: Scientific Background (Why) */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${bgColor.replace('50', '500')}`}></div>
                        <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                             <span className="text-2xl">🔬</span>
                             {isKo ? '과학적/심리학적 배경' : 'Scientific Context'}
                        </h4>
                        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line font-medium">
                            {richContent.background}
                        </p>
                    </div>

                    {/* Section: How-To Steps */}
                    <div className={`rounded-3xl p-6 md:p-8 border ${borderColor} ${bgColor} bg-opacity-40`}>
                        <h4 className={`text-lg font-extrabold ${textColor} mb-5 flex items-center gap-2`}>
                             <span className="text-2xl">📋</span>
                             {isKo ? '구체적 실행 가이드 (Step-by-Step)' : 'Action Guide'}
                        </h4>
                        <ul className="space-y-4">
                            {richContent.guideSteps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-white/60 hover:border-white transition-colors">
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-full ${bgColor.replace('50', '200')} ${accentColor} flex items-center justify-center text-sm font-black`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-gray-800 text-base md:text-lg font-semibold leading-snug pt-0.5 whitespace-pre-line">
                                        {step}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Section: Effect & Doctor's Comment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-center">
                             <h4 className="text-xs font-black text-indigo-600 uppercase mb-3 tracking-wider flex items-center gap-1">
                                <span>✨</span> {isKo ? '기대 효과' : 'Expected Effect'}
                             </h4>
                             <p className="text-lg text-indigo-900 font-bold leading-snug">
                                {richContent.expectedEffect}
                             </p>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 relative">
                             <svg className="w-10 h-10 text-gray-200 absolute top-4 right-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.01699V21H14.017ZM16.017 21H19.017C20.1216 21 21.017 20.1046 21.017 19V6H3.01699V19C3.01699 20.1046 3.91243 21 5.01699 21H8.01699V15C8.01699 13.3431 9.36014 12 11.017 12H13.017C14.6738 12 16.017 13.3431 16.017 15V21ZM5.01699 4C3.91243 4 3.01699 4.89543 3.01699 6H21.017C21.017 4.89543 20.1216 4 19.017 4H5.01699Z" /></svg>
                             <h4 className="text-xs font-black text-gray-500 uppercase mb-3 tracking-wide flex items-center gap-1">
                                🩺 {isKo ? '닥터스 코멘트' : "Doctor's Comment"}
                             </h4>
                             <p className="text-base text-gray-700 italic leading-relaxed whitespace-pre-line font-medium">
                                "{richContent.doctorComment}"
                             </p>
                        </div>
                    </div>
                </div>
            ) : (
                 <div className="text-center py-20 flex flex-col items-center justify-center animate-pulse">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin mb-6"></div>
                    <p className="text-lg text-gray-600 font-bold">
                        {isKo ? 'AI가 상세 분석 정보를 생성하고 있습니다...' : 'AI is analyzing detailed info...'}
                    </p>
                    <p className="text-sm text-gray-400 mt-2 max-w-[80%]">
                        {isHealth && (healthData as CustomGuideItem).exercise}
                        {isMedical && (medicalData as MedicalAnalysisData).suggestion}
                        {isAction && (actionData as MicroAction).description}
                    </p>
                 </div>
            )}

        </div>
        
        {/* Footer with Legal Disclaimer */}
        {richContent && (
        <div className="bg-gray-50 px-8 py-5 text-center border-t border-gray-200 shrink-0 animate-fade-in-up">
            {/* Legal Disclaimer Box */}
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4 text-xs text-orange-700 flex items-start gap-2 text-left">
                <svg className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p>{t.disclaimer}</p>
            </div>

            <button 
                onClick={onClose}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95 text-white transform hover:-translate-y-0.5
                    ${isHealth ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-200' : 
                      isMedical ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' :
                      `bg-${themeColor}-600 hover:bg-${themeColor}-700 shadow-${themeColor}-200`
                    }`}
                style={isAction ? { backgroundColor: textColor.replace('text', 'bg').replace('900', '600') } : {}}
            >
                {isKo ? '확인했습니다' : 'Got it'}
            </button>
        </div>
        )}

      </div>
    </div>
  );
};

export default DetailModal;
