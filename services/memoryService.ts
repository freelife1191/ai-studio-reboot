
import { UserContext, MemoryLog, DailySummary, DailyChecklist, ChecklistStatus, MicroAction, MedicalAnalysisData, CustomGuideItem, Language, RichDetail } from '../types';
import { getDemoScenario } from '../initial_profile'; // 🔥 Import the Unified Generator

const USER_STORAGE_KEY = 'reboot_user_profile';
const INDEX_STORAGE_KEY = 'reboot_memory_index';   // Compact Summaries (JSON)
const CHECKLIST_STORAGE_KEY = 'reboot_checklists'; // NEW: Daily Checklists

const SafeStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            try {
                return sessionStorage.getItem(key);
            } catch (e2) {
                return null;
            }
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            try {
                sessionStorage.setItem(key, value);
            } catch (e2) {}
        }
    },
    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (e) {}
        try {
            sessionStorage.removeItem(key);
        } catch (e) {}
    },
    clear: (): void => {
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('reboot_')) keysToRemove.push(key);
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch(e) {}
        try {
            const keysToRemoveSession: string[] = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith('reboot_')) keysToRemoveSession.push(key);
            }
            keysToRemoveSession.forEach(k => sessionStorage.removeItem(k));
        } catch(e) {}
    }
};

export const getLocalDateString = (offsetDays: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLogKey = (date: string) => `reboot_logs_${date}`;

export const memoryService = {
  // ... (Existing Profile Methods - kept same)
  saveUserProfile: (profile: UserContext) => {
    try {
        const dataStr = JSON.stringify({ ...profile, lastActive: new Date().toISOString() });
        SafeStorage.setItem(USER_STORAGE_KEY, dataStr);
    } catch (e) { console.error("Save profile error", e); }
  },
  getUserProfile: (): UserContext | null => {
    try {
        const data = SafeStorage.getItem(USER_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },
  hasUserProfile: (): boolean => !!SafeStorage.getItem(USER_STORAGE_KEY),
  clearUserProfile: () => SafeStorage.clear(),
  resetApplication: () => memoryService.clearUserProfile(),
  exportBackup: (): string => {
      const backupData: Record<string, any> = {};
      try {
          for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('reboot_')) backupData[key] = localStorage.getItem(key);
          }
          return JSON.stringify(backupData);
      } catch (e) { return "{}"; }
  },
  importBackup: (jsonString: string): boolean => {
      try {
          const data = JSON.parse(jsonString);
          if (!data || Object.keys(data).length === 0) return false;
          memoryService.clearUserProfile();
          Object.keys(data).forEach(key => {
              if (key.startsWith('reboot_')) SafeStorage.setItem(key, data[key]);
          });
          return true;
      } catch (e) { return false; }
  },

  // --- Logs ---
  addLog: (userMsg: string, aiMsg: string) => {
    try {
        const now = new Date();
        const dateStr = getLocalDateString();
        const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
        const newLog: MemoryLog = {
          id: Date.now().toString(),
          timestamp: now.toISOString(),
          time: timeStr,
          userMessage: userMsg,
          aiResponse: aiMsg
        };
        const currentDayLogs = memoryService.getLogsForDate(dateStr);
        if (currentDayLogs.length >= 100) currentDayLogs.shift();
        const updatedLogs = [...currentDayLogs, newLog];
        SafeStorage.setItem(getLogKey(dateStr), JSON.stringify(updatedLogs));
    } catch (e) { console.error("Save log error", e); }
  },
  getLogsForDate: (date: string): MemoryLog[] => {
    const key = getLogKey(date);
    try {
        const data = SafeStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  getRecentLogs: (daysToLookBack: number = 7): MemoryLog[] => {
      try {
          let allLogs: MemoryLog[] = [];
          for (let i = daysToLookBack - 1; i >= 0; i--) {
              const dateStr = getLocalDateString(i);
              const logs = memoryService.getLogsForDate(dateStr);
              if (logs && logs.length > 0) allLogs = [...allLogs, ...logs];
          }
          return allLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      } catch (e) { return []; }
  },
  getLogs: (): MemoryLog[] => memoryService.getLogsForDate(getLocalDateString()),
  deleteLogsForDate: (date: string) => {
      try { SafeStorage.removeItem(getLogKey(date)); } catch (e) {}
  },

  // --- Summaries ---
  saveDailySummary: (summary: DailySummary) => {
      try {
          const existing = memoryService.getDailySummaries();
          let updated = existing.filter(s => s.date !== summary.date);
          updated.push(summary);
          updated = updated.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          SafeStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) { console.error("Save summary error", e); }
  },
  getDailySummaries: (): DailySummary[] => {
      try {
          const data = SafeStorage.getItem(INDEX_STORAGE_KEY);
          return data ? JSON.parse(data) : [];
      } catch (e) { return []; }
  },
  deleteDailySummary: (date: string) => {
      try {
          const existing = memoryService.getDailySummaries();
          const filtered = existing.filter(s => s.date !== date);
          SafeStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(filtered));
          memoryService.deleteLogsForDate(date);
      } catch (e) {}
  },
  getSmartContext: (): string => {
      try {
          const summaries = memoryService.getDailySummaries();
          const recent = summaries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-14);
          if (recent.length === 0) return "";
          return `[MEMORY] ${recent.map(s => `- ${s.date}: ${s.summary}`).join('\n')}`;
      } catch (e) { return ""; }
  },

  // --- Checklists ---
  saveChecklist: (checklist: DailyChecklist) => {
      try {
          const all = memoryService.getAllChecklists();
          const filtered = all.filter(c => c.date !== checklist.date);
          const updated = [...filtered, checklist];
          SafeStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
  },
  getAllChecklists: (): DailyChecklist[] => {
      try {
          const data = SafeStorage.getItem(CHECKLIST_STORAGE_KEY);
          return data ? JSON.parse(data) : [];
      } catch (e) { return []; }
  },
  getChecklistForDate: (date: string): DailyChecklist | null => {
      const all = memoryService.getAllChecklists();
      return all.find(c => c.date === date) || null;
  },
  calculateStatus: (rate: number): ChecklistStatus => {
      if (rate >= 80) return 'green';
      if (rate >= 40) return 'yellow';
      return 'red';
  },

  // --- Test Generator ---
  generateTestHistory: (language: Language = 'ko') => {
      try {
          console.log(`🛠️ Generating FULL 30-DAY narrative history (${language})...`);
          
          const existingSummaries = memoryService.getDailySummaries();
          const newSummaries = existingSummaries.filter(s => !s.isGenerated);
          
          const getLogDateStr = (off: number) => {
             const d = new Date();
             d.setDate(d.getDate() - off);
             const y = d.getFullYear();
             const m = String(d.getMonth() + 1).padStart(2, '0');
             const dy = String(d.getDate()).padStart(2, '0');
             return `${y}-${m}-${dy}`;
          };

          for (let offset = 0; offset < 30; offset++) {
              const dateStr = getLogDateStr(offset);
              if (newSummaries.find(s => s.date === dateStr)) continue;

              // 🔥 CALL CENTRALIZED FACTORY
              const scenarioData = getDemoScenario(offset, language);
              
              if (scenarioData) {
                  // Summary
                  newSummaries.push({ ...scenarioData.summary, date: dateStr });
                  
                  // Logs
                  SafeStorage.setItem(getLogKey(dateStr), JSON.stringify(scenarioData.logs));
                  
                  // Checklist
                  memoryService.saveChecklist({ ...scenarioData.checklist, date: dateStr });
              }
          }

          SafeStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(newSummaries));
          console.log("✅ Generated Rich Test History Data - Ready for Instant Swap");
      } catch (e) {
          console.error("Failed to generate test history", e);
      }
  }
};
