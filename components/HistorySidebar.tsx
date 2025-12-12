
import React from 'react';
import { DailySummary, Language } from '../types';
import { getTranslation } from '../constants/translations';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: DailySummary[];
  onDelete: (date: string) => void;
  onSelect: (date: string) => void; // NEW: Callback for selection
  onGenerateTestHistory?: () => void; // NEW: Callback for generating test data
  language: Language;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, summaries, onDelete, onSelect, onGenerateTestHistory, language }) => {
  const t = getTranslation(language);

  return (
    <div className={`fixed inset-y-0 right-0 z-30 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🕰️</span> {t.historyTitle}
        </h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {summaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400 space-y-3">
             <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <p className="text-sm">{t.historyEmpty}</p>
          </div>
        ) : (
          summaries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Newest first
            .map((item) => (
            <div 
                key={item.date} 
                onClick={() => onSelect(item.date)} // NEW: Handle Click
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-300 hover:bg-teal-50/30 transition-all group relative cursor-pointer"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                  {item.date}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item.date); }}
                  className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-50"
                  title={t.btnDelete}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed mb-3">
                {item.summary}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                 {item.healthTags && item.healthTags.slice(0, 2).map((tag, idx) => (
                   <span key={idx} className="text-[10px] bg-gray-50 border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded">#{tag}</span>
                 ))}
                 {item.careerTags && item.careerTags.slice(0, 1).map((tag, idx) => (
                   <span key={idx} className="text-[10px] bg-blue-50 border border-blue-100 text-blue-500 px-1.5 py-0.5 rounded">#{tag}</span>
                 ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer (Test Generator) */}
      {onGenerateTestHistory && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
             <button 
                onClick={onGenerateTestHistory}
                className="w-full px-4 py-3 text-sm font-bold text-teal-600 bg-white border border-teal-200 rounded-xl hover:bg-teal-50 transition-all shadow-sm flex items-center justify-center gap-2"
             >
                <span>📝</span>
                {language === 'ko' ? '빈 날짜 채우기 (30일)' : 'Fill Empty Dates (30 Days)'}
             </button>
          </div>
      )}
    </div>
  );
};

export default HistorySidebar;
