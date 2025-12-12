
export enum Sender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export type Language = 'ko' | 'en';

export interface GroundingSource {
  uri: string;
  title: string;
}

// NEW: Pre-generated Rich Detail Content
export interface RichDetail {
  background: string;       // Scientific/Psychological context
  guideSteps: string[];     // Specific step-by-step instructions
  doctorComment: string;    // Encouraging remark
  expectedEffect: string;   // What to expect
}

export interface MicroAction {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'career' | 'routine' | 'mental';
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: string; // e.g., "5분"
  detail?: RichDetail;    // NEW: Detailed info generated upfront
}

export interface ActionPlan {
  goal: string;
  actions: MicroAction[];
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
  image?: string; // base64 string
  isTyping?: boolean;
  isError?: boolean; 
  groundingSources?: GroundingSource[]; 
  suggestedQuestions?: string[]; 
  model?: string; // NEW: Displays the model name used for generation (e.g., "Gemini 2.5 Flash")
  translations?: { [key in Language]?: string }; // 🔥 NEW: Cache for translations
}

// New: For persistent storage history
export interface MemoryLog {
  id: string;
  timestamp: string; // ISO String (YYYY-MM-DDTHH:mm:ss.sssZ)
  time: string;      // HH:MM:SS (Added for clearer daily partitioning)
  userMessage: string;
  aiResponse: string;
  summary?: string; // Optional: AI generated summary of the turn
}

// NEW: Detailed Medical Report Data for Daily Summary
export interface MedicalAnalysisData {
  hormone: string;       // e.g., "Cortisol Spike"
  hormoneDesc: string;   // e.g., "Chronic stress causing..."
  suggestion: string;    // e.g., "Immediate rest required..."
  nutrient: string;      // e.g., "Magnesium, Vitamin B"
  detail?: RichDetail;   // NEW: Detailed info generated upfront
}

export interface CustomGuideItem {
  type: 'physical' | 'mental';
  icon: string;
  title: string;
  exercise: string;
  tip: string;
  detail?: RichDetail;   // NEW: Detailed info generated upfront
}

// NEW: Compact Summary for Long-term Memory
export interface DailySummary {
  date: string; // YYYY-MM-DD
  summary: string; // Compact summary of the day's conversation
  sentimentScore: number; // 1-10 (AI evaluated mood)
  healthTags: string[]; // e.g., ["neck_pain", "insomnia"]
  careerTags: string[]; // e.g., ["interview_prep", "burnout"]
  keyFact: string; // One crucial fact to remember
  
  // New fields for rich historical data (Non-repetitive)
  medicalAnalysis?: MedicalAnalysisData; 
  customGuide?: CustomGuideItem[];
  
  // 🔥 NEW: Identifies if this record was auto-generated (allows for instant translation swap)
  isGenerated?: boolean; 
  translations?: { [key in Language]?: string }; // 🔥 NEW: Cache for summary text
}

// NEW: Daily Checklist for Health Calendar
export type ChecklistStatus = 'green' | 'yellow' | 'red' | 'none';

export interface DailyChecklist {
  date: string; // YYYY-MM-DD
  items: MicroAction[];
  completionRate: number; // 0-100
  status: ChecklistStatus;
}

export interface UserContext {
  name: string;
  age: string;
  jobStatus: string;
  physicalStatus: string;
  mentalStatus: string;
  stressLevel: number;
  moodHistory: { date: string; score: number }[];
  lastActive?: string; // Last login timestamp
  language: Language; // User's preferred language
}
