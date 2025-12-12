
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserContext, DailyChecklist, DailySummary, CustomGuideItem, MedicalAnalysisData, MicroAction } from '../types';
import { getTranslation } from '../constants/translations';
import { memoryService, getLocalDateString } from '../services/memoryService';
import { generateItemDetail } from '../services/geminiService';
import HealthCalendar from './HealthCalendar';
import DailyChecklistWidget from './DailyChecklistWidget';

interface DeepDiveReportProps {
  userContext: UserContext;
  onReset?: () => void;
  refreshTrigger?: number; // Prop to force refresh when checklist changes
  onChecklistUpdate?: (checklist: DailyChecklist) => void;
  onOpenDetail: (type: 'action' | 'health' | 'medical', data: any) => void; // 🔥 New Handler
}

type TimeRange = 'week' | 'month' | 'year';

// Helper to format Date object to YYYY-MM-DD
const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DeepDiveReport: React.FC<DeepDiveReportProps> = ({ userContext, onReset, refreshTrigger, onChecklistUpdate, onOpenDetail }) => {
  const t = getTranslation(userContext.language || 'ko');
  const lang = userContext.language || 'ko';
  
  // Calendar State: Initialize with Local Date String
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [allChecklists, setAllChecklists] = useState<DailyChecklist[]>([]);
  const [currentChecklist, setCurrentChecklist] = useState<DailyChecklist | null>(null);
  
  // NEW: State for Summaries to drive historical analysis
  const [allSummaries, setAllSummaries] = useState<DailySummary[]>([]);

  // Chart Time Range State
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  // File Input Ref for Restore
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load checklists and summaries from memory
  useEffect(() => {
      const checklists = memoryService.getAllChecklists();
      setAllChecklists(checklists);
      
      const summaries = memoryService.getDailySummaries();
      setAllSummaries(summaries);

      const targetList = checklists.find(c => c.date === selectedDate) || null;
      setCurrentChecklist(targetList);
  }, [selectedDate, refreshTrigger]); 

  // Handle Checklist Toggle
  const handleChecklistToggle = (id: string) => {
      if (!currentChecklist) return;

      const updatedItems = currentChecklist.items.map(item => 
          item.id === id ? { ...item, completed: !item.completed } : item
      );
      
      const completedCount = updatedItems.filter(i => i.completed).length;
      const rate = Math.round((completedCount / updatedItems.length) * 100);
      
      const updatedChecklist: DailyChecklist = {
          ...currentChecklist,
          items: updatedItems,
          completionRate: rate,
          status: memoryService.calculateStatus(rate)
      };

      // Save to memory
      memoryService.saveChecklist(updatedChecklist);
      
      // Update local state
      setCurrentChecklist(updatedChecklist);
      
      // Update Calendar/Chart state
      setAllChecklists(prev => {
          const filtered = prev.filter(c => c.date !== updatedChecklist.date);
          return [...filtered, updatedChecklist];
      });

      // Notify Parent to sync if needed
      if (onChecklistUpdate) onChecklistUpdate(updatedChecklist);
  };
  
  // --- Backup & Restore Handlers ---
  const handleBackup = () => {
      const json = memoryService.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reboot_backup_${getLocalDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
          const json = ev.target?.result as string;
          if (json) {
              const success = memoryService.importBackup(json);
              if (success) {
                  alert(lang === 'ko' ? '복구가 완료되었습니다. 앱을 새로고침합니다.' : 'Restore successful. Reloading app.');
                  window.location.reload();
              } else {
                  alert(lang === 'ko' ? '복구에 실패했습니다. 올바른 백업 파일인지 확인해주세요.' : 'Restore failed. Invalid backup file.');
              }
          }
      };
      reader.readAsText(file);
      // Reset input value to allow re-uploading same file
      if (fileInputRef.current) fileInputRef.current.value = '';
  };


  // --- Real-time Chart Data Integration ---
  const chartData = useMemo(() => {
      const today = new Date();
      // Determine how many days back to show
      const daysToLoad = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90; 
      
      const data = [];

      for (let i = daysToLoad - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = formatDateKey(d);
          
          // 1. Try to find REAL data from checklists (User Activity)
          const checklist = allChecklists.find(c => c.date === dateStr);
          const summary = allSummaries.find(s => s.date === dateStr);
          
          let score = 0;
          let isReal = false;

          if (summary) {
              score = summary.sentimentScore;
              isReal = true;
          } else if (checklist) {
              score = Math.round(checklist.completionRate / 10);
              if (checklist.completionRate > 0 && score === 0) score = 1;
              isReal = true;
          } else {
              // 2. Fallback to Initial Profile History
              const historyItem = userContext.moodHistory.find(h => {
                  if ((h.date === '오늘' || h.date === 'Today') && i === 0) return true;
                  
                  // Korean Format: "15일전"
                  const matchKo = h.date.match(/(\d+)일전/);
                  if (matchKo && parseInt(matchKo[1]) === i) return true;
                  
                  // English Format: "15 days ago"
                  const matchEn = h.date.match(/(\d+) days ago/i);
                  if (matchEn && parseInt(matchEn[1]) === i) return true;
                  
                  return false;
              });

              if (historyItem) {
                  score = historyItem.score;
              } else {
                  score = Math.max(2, 10 - (userContext.stressLevel || 5));
              }
          }

          data.push({
              date: `${d.getMonth() + 1}/${d.getDate()}`, 
              fullDate: dateStr,
              score: score,
              isReal: isReal
          });
      }
      return data;
  }, [userContext.moodHistory, timeRange, allChecklists, allSummaries, userContext.stressLevel]);

  // Retrieve Summary for the selected date (if any)
  const selectedSummary = useMemo(() => {
      return allSummaries.find(s => s.date === selectedDate);
  }, [selectedDate, allSummaries]);

  // --- Dynamic Health Guide Logic (Dual Mode: Physical & Mental) ---
  const healthGuides = useMemo((): CustomGuideItem[] => {
    // 1. PREFER STORED UNIQUE DATA
    if (selectedSummary?.customGuide && selectedSummary.customGuide.length > 0) {
        return selectedSummary.customGuide;
    }

    // 2. Fallback Inference Logic
    const isToday = selectedDate === getLocalDateString();
    
    let physicalConditions: string[] = [];
    let mentalConditions: string[] = [];

    if (isToday) {
        physicalConditions.push((userContext.physicalStatus || "").toLowerCase());
        mentalConditions.push((userContext.mentalStatus || "").toLowerCase());
    } else if (selectedSummary) {
        physicalConditions = selectedSummary.healthTags.map(t => t.toLowerCase());
        if (selectedSummary.sentimentScore <= 4) mentalConditions.push("sad", "low_energy");
        if (selectedSummary.healthTags.some(t => t.includes('insomnia'))) mentalConditions.push("insomnia");
    }

    const pStr = physicalConditions.join(' ');
    
    const guides: CustomGuideItem[] = [];

    // Physical Fallback
    let pGuide: CustomGuideItem = {
        type: 'physical',
        icon: "🧘",
        title: lang === 'ko' ? "전신 순환 루틴" : "Full Body Circulation",
        exercise: lang === 'ko' ? "기지개 켜기 & 가벼운 제자리 걷기 3분" : "Stretch & Light Walk for 3 mins",
        tip: lang === 'ko' ? "수분 섭취를 늘려 피로를 회복하세요." : "Increase water intake to recover fatigue."
    };

    if (pStr.includes('목') || pStr.includes('neck')) {
        pGuide = {
            type: 'physical',
            icon: "🦒",
            title: lang === 'ko' ? "거북목 케어" : "Neck Care",
            exercise: lang === 'ko' ? "맥켄지 신전 운동" : "McKenzie Extension",
            tip: lang === 'ko' ? "모니터 상단을 눈높이에 맞추세요." : "Align monitor to eye level."
        };
    }
    guides.push(pGuide);

    // Mental Fallback
    let mGuide: CustomGuideItem = {
        type: 'mental',
        icon: "🧠",
        title: lang === 'ko' ? "마음 챙김" : "Mindfulness",
        exercise: lang === 'ko' ? "하루 5분, 나만의 조용한 시간" : "5 mins of quiet time",
        tip: lang === 'ko' ? "감정을 판단하지 말고 관찰하세요." : "Observe emotions without judgment."
    };
    guides.push(mGuide);

    return guides;
  }, [userContext, lang, selectedSummary, selectedDate]);

  // Medical / Neuro Analysis
  const medicalAnalysis = useMemo((): MedicalAnalysisData => {
    // 1. PREFER STORED UNIQUE DATA
    if (selectedSummary?.medicalAnalysis) {
        return selectedSummary.medicalAnalysis;
    }

    // 2. Fallback Inference Logic
    const isToday = selectedDate === getLocalDateString();
    let stressLevel = 5;
    let hasPain = false;

    if (isToday) {
        stressLevel = userContext.stressLevel || 5;
        const pStatus = userContext.physicalStatus || "";
        hasPain = pStatus.length > 2 && !pStatus.includes('없음');
    } else if (selectedSummary) {
        stressLevel = 10 - selectedSummary.sentimentScore + 1; 
        hasPain = selectedSummary.healthTags.some(t => t.includes('pain') || t.includes('ache'));
    }

    const isHighStress = stressLevel >= 7;

    return {
        hormone: isHighStress 
            ? (lang === 'ko' ? "코르티솔 과다 경고" : "High Cortisol Alert") 
            : (lang === 'ko' ? "도파민 안정권" : "Stable Dopamine"),
        hormoneDesc: isHighStress
            ? (lang === 'ko' ? "만성 스트레스로 편도체가 과활성화되었습니다." : "Chronic stress overactivates the amygdala.")
            : (lang === 'ko' ? "안정적인 신경전달물질 균형을 유지하고 있습니다." : "Maintaining balanced neurotransmitters."),
        suggestion: hasPain
            ? (lang === 'ko' ? "신체화 반응 가능성이 높습니다." : "High possibility of somatization.")
            : (lang === 'ko' ? "예방적 멘탈 케어가 필요합니다." : "Preventive mental care needed."),
        nutrient: isHighStress
            ? (lang === 'ko' ? "추천: 마그네슘, 테아닌" : "Rec: Magnesium, Theanine")
            : (lang === 'ko' ? "추천: 오메가-3, 유산균" : "Rec: Omega-3, Probiotics")
    };
  }, [userContext, lang, selectedSummary, selectedDate]);

  const hasRecord = !!currentChecklist || !!selectedSummary;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 pb-20">
      
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-800">{t.reportTitle}</h2>
        <p className="text-gray-500 text-sm mt-1">
          {userContext.name}{t.reportSubtitle}
        </p>
      </div>

      {/* Health Calendar */}
      <HealthCalendar 
        checklists={allChecklists} 
        selectedDate={selectedDate} 
        onDateSelect={setSelectedDate} 
        language={lang}
      />

      {/* Conditionally Render Details */}
      {hasRecord ? (
        <>
            {/* Daily Checklist */}
            <DailyChecklistWidget 
                checklist={currentChecklist} 
                onToggle={handleChecklistToggle}
                onItemClick={(item) => onOpenDetail('action', item)} 
                date={selectedDate} 
                language={lang}
            />

            {/* 🔥 UPDATED: Custom Health Guide (Green Header / White Body) */}
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="bg-emerald-50 px-5 py-4 border-b border-emerald-100">
                    <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                        <span className="text-2xl">🏥</span>
                        {t.healthGuideTitle}
                    </h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {healthGuides.map((guide, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => onOpenDetail('health', guide)} 
                            className="p-4 hover:bg-emerald-50/30 transition-colors cursor-pointer group flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
                                <span className="leading-none select-none">{guide.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${guide.type === 'physical' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'} shrink-0`}>
                                        {guide.type === 'physical' ? (lang==='ko'?'신체':'BODY') : (lang==='ko'?'마음':'MIND')}
                                    </span>
                                    <h4 className="text-sm font-bold text-gray-800 truncate">{guide.title}</h4>
                                </div>
                                <p className="text-sm text-gray-700 font-medium mb-1 truncate">{guide.exercise}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {guide.tip}
                                </p>
                            </div>
                            <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🔥 RESTORED: Detailed Medical Analysis Card */}
            <div 
                onClick={() => onOpenDetail('medical', medicalAnalysis)} // 🔥 Delegate to App.tsx
                className="bg-rose-50 rounded-2xl p-5 border border-rose-100 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
            >
                <div className="flex justify-between items-start mb-4 relative z-10">
                     <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {t.medicalTitle}
                     </h3>
                     <svg className="w-4 h-4 text-rose-300 group-hover:text-rose-500 transition-colors bg-white rounded-full p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </div>
                
                {/* Hormone Section */}
                <div className="mb-4 relative z-10">
                    <p className="text-xs font-bold text-rose-500 mb-1">{t.medicalHormone}</p>
                    <p className="text-lg font-bold text-gray-800 leading-tight mb-1">{medicalAnalysis.hormone}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{medicalAnalysis.hormoneDesc}</p>
                </div>

                <div className="border-t border-rose-200 my-3 relative z-10"></div>

                {/* Nutrition Section */}
                <div className="mb-3 relative z-10">
                     <p className="text-xs font-bold text-rose-500 mb-1">{t.medicalNutrition}</p>
                     <p className="text-sm text-gray-800 font-medium">{medicalAnalysis.nutrient}</p>
                </div>

                <div className="border-t border-rose-200 my-3 relative z-10"></div>
                
                {/* Advice Section */}
                <div className="relative z-10">
                     <p className="text-xs font-bold text-rose-500 mb-1">{t.medicalAdvice}</p>
                     <p className="text-sm text-gray-800 font-medium">{medicalAnalysis.suggestion}</p>
                </div>
                
                {/* Decoration */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-100 rounded-full opacity-50 z-0 group-hover:scale-110 transition-transform duration-500"></div>

                {/* 🔥 MEDICAL DISCLAIMER FOOTER */}
                <div className="relative z-10 mt-4 pt-3 border-t border-rose-200/50 flex items-center gap-2 text-[10px] text-rose-700/60 font-medium">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p>{t.disclaimer}</p>
                </div>
            </div>
        </>
      ) : (
         <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
            <span className="text-4xl mb-2 opacity-20">📅</span>
            <p className="text-sm font-medium">
                {t.noDataForDate}
            </p>
         </div>
      )}

      {/* Mood/Energy Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-start mb-4 gap-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                {t.chartTitle}
            </h3>
            
            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                {(['week', 'month', 'year'] as TimeRange[]).map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setTimeRange(r)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                            timeRange === r 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {r === 'week' ? t.chartRangeWeek : r === 'month' ? t.chartRangeMonth : t.chartRangeYear}
                    </button>
                ))}
            </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
              <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 10]} />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                cursor={{stroke: '#3B82F6', strokeWidth: 1}}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Interpretive Guide (Legend) */}
        <div className="mt-5 bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs text-gray-600">
             <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {t.chartDescTitle}
             </h4>
             <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    {t.chartDescTrendUp}
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    {t.chartDescTrendDown}
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    {t.chartDescTrendStable}
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    {t.chartDescVolatile}
                </div>
             </div>
        </div>

      </div>
      
       {/* Reset Section */}
      {onReset && (
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-8">
            <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">{t.accountSettings}</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
                 <button
                    type="button"
                    onClick={handleBackup}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-xs shadow-sm"
                 >
                     <span>💾</span> {t.btnBackup}
                 </button>
                 <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-xs shadow-sm"
                 >
                     <span>📂</span> {t.btnRestore}
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleRestore}
                    accept=".json"
                    className="hidden"
                 />
            </div>

            <button 
                type="button"
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-medium text-sm shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {t.btnReset} {t.startOver}
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
                * {lang === 'ko' ? "저장된 모든 프로필과 대화 내용이 삭제됩니다." : "All profiles and chat history will be deleted."}
            </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(DeepDiveReport);
