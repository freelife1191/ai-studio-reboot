
import React, { useState, useEffect } from 'react';
import { DailyChecklist, Language } from '../types';
import { getLocalDateString } from '../services/memoryService';
import { getTranslation } from '../constants/translations';

interface HealthCalendarProps {
  checklists: DailyChecklist[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  language?: Language;
}

const HealthCalendar: React.FC<HealthCalendarProps> = ({ checklists, selectedDate, onDateSelect, language = 'ko' as Language }) => {
  const t = getTranslation(language);
  
  // State to track the currently viewed month/year
  // Initialize based on the selectedDate so it opens to the relevant month
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate));

  // If selectedDate changes externally (e.g. from a reset), update the view
  useEffect(() => {
      if (selectedDate) {
          setViewDate(new Date(selectedDate));
      }
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = getLocalDateString(); // Current Local Date YYYY-MM-DD

  // Navigation Handlers
  const handlePrevMonth = () => {
      setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
      setViewDate(new Date(year, month + 1, 1));
  };

  // Get number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }

  // Helper to get status color
  const getStatusColor = (dateStr: string) => {
    const checklist = checklists.find(c => c.date === dateStr);
    if (!checklist) return 'bg-gray-200'; // No data
    
    switch(checklist.status) {
        case 'green': return 'bg-green-500 shadow-green-200';
        case 'yellow': return 'bg-yellow-400 shadow-yellow-200';
        case 'red': return 'bg-red-400 shadow-red-200';
        default: return 'bg-gray-200';
    }
  };

  const getStatusLabel = (dateStr: string) => {
      const checklist = checklists.find(c => c.date === dateStr);
      if (!checklist) return null;
      return `${checklist.completionRate}%`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-teal-500 rounded-full"></span>
        {t.healthCalendarTitle}
      </h3>

      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
              <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                  aria-label="Previous Month"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              <span className="text-sm font-bold text-gray-800 select-none w-24 text-center">
                  {year} {t.monthNames[month]}
              </span>

              <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                  aria-label="Next Month"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
          </div>

          {/* Legend */}
          <div className="flex gap-2 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>{t.signalGood}</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>{t.signalCaution}</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div>{t.signalWarning}</span>
          </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {t.daysShort.map((day: string) => (
            <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
        ))}
        
        {calendarDays.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="p-2"></div>;
            
            // Generate Local Date String manually to match getLocalDateString format
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            
            const isToday = dateStr === todayStr;
            const isSelected = selectedDate === dateStr;
            const statusClass = getStatusColor(dateStr);
            const statusLabel = getStatusLabel(dateStr);

            return (
                <button 
                    key={dateStr}
                    onClick={() => onDateSelect(dateStr)}
                    className={`
                        relative flex flex-col items-center justify-center p-2 rounded-xl transition-all
                        ${isSelected ? 'ring-2 ring-teal-500 bg-teal-50' : 'hover:bg-gray-50'}
                    `}
                >
                    <span className={`text-xs mb-1 ${isToday ? 'font-bold text-teal-700' : 'text-gray-600'}`}>
                        {date.getDate()}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${statusClass} shadow-sm`}></div>
                    {statusLabel && isSelected && (
                        <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] bg-gray-800 text-white px-1 py-0.5 rounded opacity-90 whitespace-nowrap z-10">
                            {t.checklistAchieved} {statusLabel}
                        </span>
                    )}
                </button>
            );
        })}
      </div>
    </div>
  );
};

export default HealthCalendar;
