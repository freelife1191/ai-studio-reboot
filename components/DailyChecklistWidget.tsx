
import React from 'react';
import { DailyChecklist, MicroAction, Language } from '../types';
import { getLocalDateString } from '../services/memoryService';
import { getTranslation } from '../constants/translations';

interface DailyChecklistWidgetProps {
  checklist: DailyChecklist | null;
  onToggle: (id: string) => void;
  onItemClick?: (item: MicroAction) => void; 
  date: string;
  language?: Language;
}

const DailyChecklistWidget: React.FC<DailyChecklistWidgetProps> = ({ checklist, onToggle, onItemClick, date, language = 'ko' as Language }) => {
  const isToday = date === getLocalDateString();
  const t = getTranslation(language);

  if (!checklist || !checklist.items || checklist.items.length === 0) {
      return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="text-gray-800 font-bold mb-1">{t.checklistEmptyTitle}</h3>
              <p className="text-xs text-gray-500">
                  {isToday 
                    ? t.checklistEmptyDescToday 
                    : t.checklistEmptyDescPast}
              </p>
          </div>
      );
  }
  
  const getCategoryColor = (cat: string) => {
      const map: Record<string, string> = {
          career: 'bg-blue-50 text-blue-600',
          health: 'bg-emerald-50 text-emerald-600',
          routine: 'bg-purple-50 text-purple-600'
      };
      return map[cat?.toLowerCase()] || map['routine'];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-5">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t.dailyGuideTitle}
            </h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-full 
                ${checklist.status === 'green' ? 'bg-green-100 text-green-700' : 
                  checklist.status === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {checklist.completionRate}% {t.checklistAchieved}
            </span>
        </div>

        <div className="space-y-3">
            {checklist.items.map((item) => (
                <div 
                    key={item.id}
                    className={`
                        group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer
                        ${item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-teal-300'}
                    `}
                    onClick={() => onItemClick && onItemClick(item)}
                >
                    {/* Checkbox Area: Toggles Completion */}
                    <div 
                        onClick={(e) => { e.stopPropagation(); isToday && onToggle(item.id); }}
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors
                        ${item.completed ? 'bg-teal-500 border-teal-500' : 'bg-white border-gray-300 hover:border-teal-400'}
                        ${!isToday && 'cursor-default opacity-50'}`}
                    >
                        {item.completed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <p className={`text-sm font-medium leading-snug ${item.completed ? 'text-gray-400 line-through' : 'text-gray-800 group-hover:text-teal-700 transition-colors'}`}>
                                {item.title}
                            </p>
                            {/* Detail Icon Hint */}
                            <svg className="w-3.5 h-3.5 text-gray-300 ml-2 group-hover:text-teal-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className={`text-[10px] mt-1.5 inline-block px-1.5 py-0.5 rounded font-semibold tracking-wide ${getCategoryColor(item.category)}`}>
                            {item.category?.toUpperCase() || 'ROUTINE'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
        
        {isToday && checklist.completionRate < 100 && (
            <p className="text-xs text-center text-gray-400 mt-4">
                {t.checklistEncouragement}
            </p>
        )}
    </div>
  );
};

export default DailyChecklistWidget;
