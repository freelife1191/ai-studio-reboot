
import React from 'react';
import { ActionPlan, Language } from '../types';
import { getTranslation } from '../constants/translations';

interface ActionCardProps {
  plan: ActionPlan;
  onToggle: (id: string) => void;
  onDetailClick?: (actionId: string) => void; 
  language?: Language;
}

const ActionCard: React.FC<ActionCardProps> = ({ plan, onToggle, onDetailClick, language = 'ko' as Language }) => {
  if (!plan || !plan.actions || plan.actions.length === 0) return null;

  const t = getTranslation(language);

  // Safe lookup for colors with fallback
  const getDifficultyColor = (diff: string) => {
      const colors: Record<string, string> = {
        easy: 'text-green-600 bg-green-50 border-green-200',
        medium: 'text-orange-600 bg-orange-50 border-orange-200',
        hard: 'text-red-600 bg-red-50 border-red-200',
      };
      return colors[diff?.toLowerCase()] || colors['easy'];
  };

  const getDifficultyLabel = (diff: string) => {
      const labels: Record<string, string> = {
        easy: t.difficultyEasy,
        medium: t.difficultyMedium,
        hard: t.difficultyHard,
      };
      return labels[diff?.toLowerCase()] || t.difficultyEasy;
  };
  
  const getCategoryColor = (cat: string) => {
      const map: Record<string, string> = {
          career: 'text-blue-600 bg-blue-50',
          health: 'text-emerald-600 bg-emerald-50',
          routine: 'text-purple-600 bg-purple-50'
      };
      return map[cat?.toLowerCase()] || map['routine'];
  };

  const completedCount = plan.actions.filter(a => a.completed).length;
  const progress = Math.round((completedCount / plan.actions.length) * 100);
  
  // 🔥 Fallback Title Logic
  const displayGoal = plan.goal || (language === 'ko' ? "오늘의 작은 시작" : "Today's Small Start");

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden mb-6 animate-fade-in-up">
      
      {/* Header: Goal */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-4">
        <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                <svg className="w-5 h-5 opacity-90 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {displayGoal}
            </h3>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm text-white">
                {language === 'ko' ? '행동 활성화' : 'Behavioral Activation'}
            </span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-black/20 rounded-full h-1.5 overflow-hidden">
                <div 
                    className="h-full bg-white transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <span className="text-xs font-medium opacity-90 text-white">{progress}% {t.percentAchieved}</span>
        </div>
      </div>

      {/* Action List */}
      <div className="p-4 space-y-3 bg-gray-50/50">
        {plan.actions.map((action) => (
          <div 
            key={action.id} 
            className={`group relative bg-white rounded-xl border p-3 transition-all duration-200 shadow-sm
                ${action.completed 
                    ? 'border-teal-200 bg-teal-50/30' 
                    : 'border-gray-200 hover:border-teal-300'
                }`}
          >
            <div className="flex items-start gap-3">
                {/* Checkbox (Toggle Only) */}
                <div 
                    onClick={() => onToggle(action.id)}
                    className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 cursor-pointer
                    ${action.completed ? 'bg-teal-500 border-teal-500' : 'bg-white border-gray-300 hover:border-teal-400'}`}
                >
                    {action.completed && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>

                <div className="flex-1">
                    {/* Content (Click for Detail) */}
                    <div 
                        className="cursor-pointer"
                        onClick={() => onDetailClick && onDetailClick(action.id)}
                    >
                        <div className="flex justify-between items-start">
                            <h4 className={`text-base font-semibold ${action.completed ? 'text-gray-500 line-through' : 'text-gray-800'} hover:text-teal-600 transition-colors`}>
                                {action.title}
                            </h4>
                            {/* Detail Icon Hint */}
                             <svg className="w-4 h-4 text-gray-300 hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>

                        <p className={`text-sm mt-1 ${action.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {action.description}
                        </p>

                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {action.estimated_time}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-md border ${getDifficultyColor(action.difficulty)}`}>
                                {getDifficultyLabel(action.difficulty)}
                            </span>
                            <span className={`text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded ml-auto ${getCategoryColor(action.category)}`}>
                                {action.category || 'ROUTINE'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      {completedCount === plan.actions.length && (
          <div className="bg-teal-50 px-4 py-3 text-center animate-pulse">
              <span className="text-teal-700 font-bold text-sm">{t.goalAchieved}</span>
          </div>
      )}
    </div>
  );
};

export default ActionCard;
