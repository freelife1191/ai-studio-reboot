
import React, { useState, useRef } from 'react';
import { UserContext, Language } from '../types';
import { getTranslation } from '../constants/translations';
import { INITIAL_PROFILE_KO, INITIAL_PROFILE_EN, generateDemoBackup } from '../initial_profile';
import { memoryService } from '../services/memoryService';

interface OnboardingFormProps {
  onComplete: (data: UserContext) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<Language>('ko'); 
  const [isLoadingRestore, setIsLoadingRestore] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // 🔥 NEW: Custom UI State to replace blocked window.confirm/alert
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    jobStatus: 'employee',
    physicalStatus: '',
    mentalStatus: '',
    stressLevel: 5,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslation(language);

  // Helper: Toast Notification
  const showToast = (type: 'success' | 'error', message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const fillDemoData = () => {
      const profile = language === 'ko' ? INITIAL_PROFILE_KO : INITIAL_PROFILE_EN;
      
      setFormData({
          name: profile.name,
          age: profile.age,
          jobStatus: profile.jobStatus,
          physicalStatus: profile.physicalStatus,
          mentalStatus: profile.mentalStatus,
          stressLevel: profile.stressLevel
      });
      setStep(2);
  };

  // 🔥 SAFE RESTORE: Uses Toast instead of Alert & Direct Transition
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsLoadingRestore(true);
      setLoadingMessage(language === 'ko' ? "데이터를 복구 중입니다..." : "Restoring data...");
      
      setTimeout(() => {
          const reader = new FileReader();
          reader.onload = (ev) => {
              try {
                  const json = ev.target?.result as string;
                  if (json) {
                      const success = memoryService.importBackup(json);
                      if (success) {
                          showToast('success', language === 'ko' ? '복구 완료! 앱으로 이동합니다.' : 'Restore successful. Starting app...');
                          
                          // Direct transition without reload
                          const profile = memoryService.getUserProfile();
                          if (profile) {
                              setTimeout(() => onComplete(profile), 1000);
                          } else {
                              throw new Error("Profile not found in backup");
                          }
                      } else {
                          throw new Error("Invalid backup format");
                      }
                  }
              } catch (error) {
                  console.error("Restore Error:", error);
                  showToast('error', language === 'ko' ? '복구 실패: 올바른 파일이 아닙니다.' : 'Restore failed: Invalid file.');
                  setIsLoadingRestore(false);
              }
          };
          reader.readAsText(file);
      }, 500);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 🔥 STEP 1: Show Custom Modal (Replaces window.confirm)
  const handleLoadDemoClick = () => {
      setShowConfirmModal(true);
  };

  // 🔥 STEP 2: Execute Load (No window.confirm needed, No Reload)
  const executeLoadDemo = async () => {
      setShowConfirmModal(false);
      setIsLoadingRestore(true);
      setLoadingMessage(language === 'ko' ? "데모 환경을 구성 중입니다..." : "Setting up demo environment...");

      setTimeout(() => {
          try {
              console.log("🚀 Starting Demo Data Generation...");
              const json = generateDemoBackup(language);
              
              console.log("💾 Importing to Storage...");
              const success = memoryService.importBackup(json);
              
              if (success) {
                  console.log("✅ Import Successful. Transitioning...");
                  
                  // Retrieve the generated profile from memory
                  const profile = memoryService.getUserProfile();
                  
                  if (profile) {
                      // Pass to App.tsx directly to trigger state update
                      onComplete(profile); 
                  } else {
                      // Fallback profile if something went wrong but import said success
                      onComplete(language === 'ko' ? INITIAL_PROFILE_KO : INITIAL_PROFILE_EN);
                  }
              } else {
                  throw new Error("Storage import returned false");
              }
          } catch (e) {
              console.error("Demo Load Critical Error:", e);
              showToast('error', language === 'ko' 
                  ? "데모 로드 중 오류가 발생했습니다." 
                  : "Error loading demo."
              );
              setIsLoadingRestore(false);
          }
      }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initialHistory = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i)); 
        return {
            date: `${d.getMonth() + 1}/${d.getDate()}`,
            score: i === 13 ? 10 - Number(formData.stressLevel) : 5 + Math.floor(Math.random() * 4) - 2 
        };
    });

    onComplete({
      ...formData,
      stressLevel: Number(formData.stressLevel),
      moodHistory: initialHistory,
      language: language 
    });
  };

  // Render Full Screen Loading Overlay if needed
  if (isLoadingRestore) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 z-50">
              <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-bold text-gray-700">{loadingMessage}</h2>
              <p className="text-gray-500 mt-2 text-sm">{language === 'ko' ? '잠시만 기다려주세요...' : 'Please wait...'}</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      
      {/* 🔥 Toast Notification */}
      {toast && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl text-sm font-bold z-[100] transition-all animate-fade-in-up flex items-center gap-2
              ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-teal-600 text-white'}`}>
              <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
              {toast.message}
          </div>
      )}

      {/* 🔥 Custom Confirmation Modal Overlay */}
      {showConfirmModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center transform scale-100 transition-all">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🚀
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {language === 'ko' ? '데모 데이터 로드' : 'Load Demo Data'}
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {language === 'ko' 
                        ? '기존에 입력하신 데이터는 모두 삭제되고, 7일간의 가상 데이터가 로드됩니다. 계속하시겠습니까?' 
                        : 'Existing data will be cleared and replaced with 7 days of demo data. Continue?'}
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                    >
                        {language === 'ko' ? '취소' : 'Cancel'}
                    </button>
                    <button 
                        onClick={executeLoadDemo}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-indigo-200 shadow-md transition-colors"
                    >
                        {language === 'ko' ? '로드하기' : 'Load'}
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative z-10">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10 flex bg-black/20 rounded-lg p-1">
            <button 
                type="button"
                onClick={() => setLanguage('ko')}
                className={`px-2 py-1 text-xs font-bold rounded ${language === 'ko' ? 'bg-white text-teal-600' : 'text-white/80'}`}
            >
                KR
            </button>
            <button 
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-white text-teal-600' : 'text-white/80'}`}
            >
                EN
            </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
             <span className="text-2xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{t.onboardingTitle}</h1>
          <p className="text-blue-100 text-sm whitespace-pre-line">{t.onboardingDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 flex justify-end">
            <button 
                type="button" 
                onClick={fillDemoData}
                className="text-xs text-teal-600 font-medium underline hover:text-teal-800"
            >
                📝 {language === 'ko' ? '입력폼 자동 채우기' : 'Auto-fill Form'}
            </button>
          </div>

          {step === 1 && (
            <div className="space-y-5 animate-fade-in-up">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.labelName}</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder={t.placeholderName}
                />
              </div>

              <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.labelAge}</label>
                    <input
                      type="number"
                      name="age"
                      required
                      min="10"
                      max="100"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      placeholder={t.placeholderAge}
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.labelJob}</label>
                <select
                  name="jobStatus"
                  value={formData.jobStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white text-gray-900"
                >
                  <optgroup label={t.jobGroupEco}>
                    <option value="employee">{t.jobEmployee}</option>
                    <option value="business">{t.jobBusiness}</option>
                    <option value="freelancer">{t.jobFreelancer}</option>
                  </optgroup>
                  <optgroup label={t.jobGroupStudy}>
                    <option value="student">{t.jobStudent}</option>
                    <option value="seeking">{t.jobSeeking}</option>
                  </optgroup>
                  <optgroup label={t.jobGroupRest}>
                    <option value="job_loss">{t.jobLoss}</option>
                    <option value="retired">{t.jobRetired}</option>
                    <option value="unemployed">{t.jobUnemployed}</option>
                    <option value="homemaker">{t.jobHomemaker}</option>
                  </optgroup>
                  <option value="other">{t.jobOther}</option>
                </select>
                <p className="text-xs text-gray-500 mt-2 ml-1">
                  {t.labelJobDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.name || !formData.age}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {t.btnNext}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.labelPhysical}</label>
                <input
                  type="text"
                  name="physicalStatus"
                  value={formData.physicalStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  placeholder={t.placeholderPhysical}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.labelMental}</label>
                <input
                  type="text"
                  name="mentalStatus"
                  value={formData.mentalStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  placeholder={t.placeholderMental}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.labelStress} (1 ~ 10)
                    <span className="ml-2 text-teal-600 font-bold">{formData.stressLevel}</span>
                </label>
                <input
                  type="range"
                  name="stressLevel"
                  min="1"
                  max="10"
                  value={formData.stressLevel}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{t.stressLow}</span>
                    <span>{t.stressMid}</span>
                    <span>{t.stressHigh}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    {t.btnPrev}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                  >
                    {t.btnStart}
                  </button>
              </div>
            </div>
          )}
        </form>
        
        {/* Footer: Restore Options */}
        <div className="bg-gray-50 border-t border-gray-100 p-4">
             <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">{t.restoreTitle || (language==='ko'?'데이터 복구 옵션':'Restore Options')}</h4>
             
             <div className="grid grid-cols-2 gap-3">
                 <button
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-xs font-semibold shadow-sm"
                 >
                     <span>📂</span> {t.btnRestoreJson || (language==='ko'?'백업파일 복원':'Restore Backup')}
                 </button>
                 <button
                    type="button" 
                    onClick={handleLoadDemoClick}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all text-xs font-semibold shadow-sm"
                 >
                     <span>🚀</span> {t.btnLoadDemo || (language==='ko'?'데모(7일) 로드':'Load Demo Data')}
                 </button>
             </div>
             
             <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleRestoreBackup}
                accept=".json"
                className="hidden"
             />
        </div>
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-6 pt-2">
            <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
            <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
