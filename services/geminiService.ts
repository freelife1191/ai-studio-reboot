
import { GoogleGenAI, Chat, GenerateContentResponse, Type, Content } from "@google/genai";
import { ActionPlan, UserContext, Language, DailySummary, MicroAction, MedicalAnalysisData, CustomGuideItem, RichDetail, Message } from "../types";
import { memoryService } from "./memoryService";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fallback Questions
const FALLBACK_QUESTIONS = {
    ko: ["내 증상의 원인이 뭘까?", "지금 당장 먹으면 좋은 음식은?", "누워서 할 수 있는 이완 운동 알려줘"],
    en: ["Possible cause of my symptom?", "Best foods for now?", "Relaxation exercises lying down"]
};

// Helper: Retry Operation with Robust 429 Handling
async function retryOperation<T>(operation: () => Promise<T>, retries = 5, delay = 2000): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        const msg = error?.message || error?.toString() || "";
        const isRateLimit = msg.includes('429') || msg.includes('Quota') || msg.includes('RESOURCE_EXHAUSTED');
        const isTransient = msg.includes('503') || msg.includes('Overloaded');
        
        if (retries <= 0 || (!isRateLimit && !isTransient)) throw error;
        
        // Exponential backoff with jitter for rate limits
        let waitTime = isRateLimit ? Math.max(delay, 8000) : delay;
        waitTime = waitTime + Math.random() * 2000;
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return retryOperation(operation, retries - 1, waitTime * 1.5);
    }
}

// Helper to clean and parse JSON
const cleanAndParseJson = (text: string) => {
    if (!text) return null;
    try {
        let cleaned = text.trim();
        if (cleaned.includes('```')) {
             cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1');
        }
        const firstOpen = cleaned.indexOf('{');
        const lastClose = cleaned.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            cleaned = cleaned.substring(firstOpen, lastClose + 1);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        return null;
    }
};

// Helper to clean chat text
const cleanChatResponseText = (text: string) => {
    if (!text) return "";
    let cleaned = text.trim();
    const codeBlockRegex = /^```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = cleaned.match(codeBlockRegex);
    if (match) {
      cleaned = match[1].trim();
    }
    cleaned = cleaned.replace(/["']?\}\}```$/, '');
    cleaned = cleaned.replace(/}\s*```$/, '');
    cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.replace(/["']?\}\}$/, '');
    return cleaned;
};

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- CHAT INITIALIZATION ---

let chatSession: Chat | null = null;
let currentModelName: string = 'gemini-2.5-flash';
let currentLanguage: Language = 'ko';

// 🔥 ADVANCED PROMPT ENGINEERING: CORE SYSTEM INSTRUCTION
const SYSTEM_INSTRUCTION_TEMPLATE = (language: Language, context: UserContext, memory: string) => {
  const isKo = language === 'ko';
  const targetLangName = isKo ? 'Korean (한국어)' : 'English';
  
  // Dynamic Headers based on Language
  // 🔥 UPDATED ICON: Stethoscope (🩺) to match user screenshot
  const T = {
      insight: isKo ? "### 🩺 1. Health Insight (건강 분석)" : "### 🩺 1. Health Insight",
      mechanism: isKo ? "*   **메커니즘 (Mechanism)**" : "*   **Mechanism**",
      connection: isKo ? "*   **연관성 (Connection)**" : "*   **Connection**",
      causes: isKo ? "*   **관찰된 패턴 (Observed Patterns)**" : "*   **Observed Patterns**",
      
      nutritionHeader: isKo ? "### 💊 2. Nutrition & Pharmaceutical Guide (영양 및 의약 가이드)" : "### 💊 2. Nutrition & Pharmaceutical Guide",
      nutrient: isKo ? "*   **영양소 (Nutrient)**" : "*   **Nutrient**",
      otc: isKo ? "*   **일반 의약품 (OTC)**" : "*   **OTC**",
      
      recoveryHeader: isKo ? "### 🧘 3. Rehab & Action Prescription (재활 및 행동 처방)" : "### 🧘 3. Rehab & Action Prescription",
      physical: isKo ? "*   **신체 (Physical)**" : "*   **Physical**",
      mental: isKo ? "*   **멘탈 (Mental)**" : "*   **Mental**",
      
      redflagsHeader: isKo ? "### ⚠️ 4. Red Flags (주의사항)" : "### ⚠️ 4. Red Flags"
  };

  return `
ROLE & OBJECTIVE:
You are 'Re:Boot', an **AI Wellness & Health Coach**.
Your goal is to provide **informational, systematic, and actionable health suggestions**.
**CRITICAL**: You are NOT a doctor. DO NOT provide medical diagnoses or prescriptions.

USER PROFILE:
- Name: ${context.name}
- Job Status: ${context.jobStatus}
- Primary Physical Complaint: "${context.physicalStatus}"
- Primary Mental Complaint: "${context.mentalStatus}"
- Current Stress Level: ${context.stressLevel}/10
- Recent History Summary: ${memory.slice(0, 300)}...

RESPONSE PROTOCOL (DYNAMIC):
1. **NEW SYMPTOM / FULL ANALYSIS**: If the user reports a *new* condition or asks for a *comprehensive check*, use the **Markdown Template** below.
2. **FOLLOW-UP / CONVERSATION**: If the user asks a specific question, answer directly without the template.

---
${T.insight}
${T.mechanism}: Explain the mechanism using professional terms.
${T.connection}: Explain the link between mental state and physical pain.

${T.nutritionHeader}
${T.nutrient}: Recommend nutrients.
${T.otc}: Mention Over-The-Counter options if relevant.

${T.recoveryHeader}
${T.physical}: Provide specific movements.
${T.mental}: Provide specific cognitive techniques.

${T.redflagsHeader}
*   List symptoms requiring hospital visits.
---

STRICT RULES:
1. **Language**: Respond in **${targetLangName}** ONLY.
2. **Formatting**: 
   - **Always use '###' for Section Headers** (e.g., ### ⚠️ 4. Red Flags).
   - **Insert a blank line** before every bullet point ('*').
   - **Do not** put multiple bullet points on the same line.
   - Use **bold** for key terms (e.g., **Key**).
3. **Tone**: Professional, Empathetic, Coaching-oriented.
4. **Legal**: Avoid definitive medical diagnosis terms.
`;
};

// 🔥 UPDATED: Initialize Chat with History & Enhanced Context
export const initializeChat = (
    userContext?: UserContext, 
    modelName: string = 'gemini-2.5-flash', 
    language: Language = 'ko',
    history: Content[] = [] 
) => {
  currentModelName = modelName;
  currentLanguage = language;
  
  const smartContext = memoryService.getSmartContext();
  let instruction = "";
  
  if (userContext) {
      instruction = SYSTEM_INSTRUCTION_TEMPLATE(language, userContext, smartContext);
  } else {
      instruction = `You are Re:Boot, a health coach AI. Respond in ${language === 'ko' ? 'Korean' : 'English'}. Do not diagnose.`;
  }

  try {
      chatSession = ai.chats.create({
        model: currentModelName,
        config: { 
            systemInstruction: instruction,
            temperature: 0.7, 
            tools: [{ googleSearch: {} }] 
        },
        history: history 
      });
  } catch (e) { chatSession = null; }
  return chatSession;
};

export const resetChatSession = () => { chatSession = null; };

// Legacy: Non-streaming
export const sendMessageToGemini = async (text: string, userContext: UserContext, imageBase64?: string): Promise<{ text: string; groundingSources?: { uri: string; title: string }[], modelUsed: string }> => {
  if (!chatSession) initializeChat(userContext, currentModelName, userContext.language);
  
  try {
    let response: GenerateContentResponse;
    await retryOperation(async () => {
        if (imageBase64) {
            response = await chatSession!.sendMessage({
                message: [{ inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }, { text: text || "Analyze this symptom visibly." }]
            });
        } else {
            response = await chatSession!.sendMessage({ message: text });
        }
    });
    // @ts-ignore
    let responseText = cleanChatResponseText(response?.text || "");
    // @ts-ignore
    const groundingSources = (response?.candidates?.[0]?.groundingMetadata?.groundingChunks || []).filter(c=>c.web).map(c=>({uri:c.web.uri, title:c.web.title}));
    return { text: responseText, groundingSources, modelUsed: currentModelName };
  } catch (e) { throw e; }
};

// 🔥 NEW: Streaming Message Handler
export const sendMessageToGeminiStream = async (
    text: string, 
    userContext: UserContext, 
    imageBase64: string | undefined,
    onUpdate: (text: string) => void,
    signal?: AbortSignal
): Promise<{ fullText: string; groundingSources?: { uri: string; title: string }[], modelUsed: string }> => {
    
    // Important: Do not re-initialize chat if it exists. 
    // App.tsx handles initialization on mount.
    if (!chatSession) initializeChat(userContext, currentModelName, userContext.language);
    
    let fullText = "";
    let groundingSources: { uri: string; title: string }[] = [];
    
    try {
        const streamResult = await chatSession!.sendMessageStream({
             message: imageBase64 
                ? [{ inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }, { text: text || "Analyze this symptom." }] 
                : text
        });

        for await (const chunk of streamResult) {
            if (signal?.aborted) {
                break;
            }

            const chunkText = chunk.text || "";
            fullText += chunkText;
            onUpdate(fullText);

            // Collect grounding metadata
            // @ts-ignore
            const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                // @ts-ignore
                const validSources = chunks.filter(c => c.web).map(c => ({ uri: c.web.uri, title: c.web.title }));
                if (validSources.length > 0) groundingSources = validSources;
            }
        }
        
        // Final Cleanup
        const cleaned = cleanChatResponseText(fullText);
        const finalText = cleaned.length < fullText.length * 0.5 ? fullText : cleaned;
        
        return { text: finalText, groundingSources, modelUsed: currentModelName } as any;

    } catch (e) {
        throw e;
    }
};

export const generateNextQuestions = async (context: string, lastAiResponse: string, language: Language): Promise<string[]> => {
    try {
        const prompt = `
        Context: User asked "${context}". AI Answered: "${lastAiResponse}".
        Task: Generate 3 short follow-up questions for the user to ask the doctor.
        Language: ${language === 'ko' ? 'Korean' : 'English'}.
        Format: JSON Array of strings.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const questions = cleanAndParseJson(response.text || "[]");
        return Array.isArray(questions) && questions.length > 0 ? questions : (language === 'ko' ? FALLBACK_QUESTIONS.ko : FALLBACK_QUESTIONS.en);
    } catch {
        return language === 'ko' ? FALLBACK_QUESTIONS.ko : FALLBACK_QUESTIONS.en;
    }
};

export const generateWelcomeMessage = async (userContext: UserContext, language: Language): Promise<{ text: string, suggestedQuestions: string[] }> => {
    const defaultWelcome = language === 'ko' 
        ? `안녕하세요, ${userContext.name}님. Re:Boot 통합 건강 코치입니다.\n현재 '${userContext.physicalStatus}' 증상과 스트레스 수준(${userContext.stressLevel}/10)을 확인했습니다.\n오늘 컨디션은 어떠신가요? 불편한 곳을 구체적으로 말씀해 주시면 건강 분석을 도와드리겠습니다.` 
        : `Hello, ${userContext.name}. I am your Re:Boot Integrated Health Coach.\nI see you are experiencing '${userContext.physicalStatus}' with a stress level of ${userContext.stressLevel}/10.\nHow are you feeling today? Please describe any discomfort for a health analysis.`;
    
    return { text: defaultWelcome, suggestedQuestions: language === 'ko' ? FALLBACK_QUESTIONS.ko : FALLBACK_QUESTIONS.en };
};

// ---------------------------------------------------------
// 🔥 UPDATED: Action Plan (FAST - No Details)
// ---------------------------------------------------------

export const generateMicroActions = async (context: string, language: Language = 'ko'): Promise<ActionPlan | null> => {
     try {
        const langInstruction = language === 'ko' ? 'Korean (Hangul)' : 'English';
        
        const prompt = `Context: "${context}"
            Task: Create a Micro-Action Plan for recovery in **${langInstruction}**.
            Focus: Rehabilitation, Stress Relief, Small Wins.
            Return JSON only.`;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.5,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        goal: { type: Type.STRING },
                        actions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    category: { type: Type.STRING },
                                    difficulty: { type: Type.STRING },
                                    estimated_time: { type: Type.STRING },
                                    completed: { type: Type.BOOLEAN }
                                },
                                required: ['title', 'description']
                            }
                        }
                    },
                    required: ['goal', 'actions']
                }
            }
        }));
        
        const parsed = cleanAndParseJson(response.text || "{}");
        if (parsed && Array.isArray(parsed.actions)) {
            parsed.actions = parsed.actions.map((action: any, index: number) => ({
                ...action,
                id: action.id || `action-${Date.now()}-${index}`,
                category: action.category?.toLowerCase() || 'health',
                difficulty: action.difficulty?.toLowerCase() || 'easy',
                completed: !!action.completed
            }));
            
            // 🔥 FORCE TITLE OVERRIDE: Ensure consistency regardless of AI output
            parsed.goal = language === 'ko' ? "오늘의 작은 시작" : "Today's Small Start";
            
            return parsed as ActionPlan;
        }
        return null;
    } catch (e) { 
        return null; 
    }
}

// ---------------------------------------------------------
// 🔥 INSTANT / FALLBACK GENERATORS (NO API)
// ---------------------------------------------------------

// Generates immediate content based on profile tags to avoid waiting for API
export const generateInstantDailyInsights = (user: UserContext, language: Language): DailyInsightsResult => {
    const isKo = language === 'ko';
    
    // Simple logic to detect keywords
    const physical = (user.physicalStatus || "").toLowerCase();
    const mental = (user.mentalStatus || "").toLowerCase();
    
    let hormone = isKo ? "스트레스 호르몬 분석 중..." : "Analyzing Stress Hormones...";
    let desc = isKo ? "현재 상태를 기반으로 정밀 분석을 준비하고 있습니다." : "Preparing detailed analysis based on your status.";
    let sugg = isKo ? "물 한 잔을 마시며 심호흡을 하세요." : "Drink water and take deep breaths.";
    let nutrient = isKo ? "종합 비타민" : "Multivitamin";
    
    if (physical.includes('목') || physical.includes('neck')) {
        hormone = isKo ? "승모근 긴장 (Trapezius)" : "Trapezius Tension";
        desc = isKo ? "스트레스로 인해 어깨 주변 근육이 수축된 상태입니다." : "Shoulder muscles contracted due to stress.";
        sugg = isKo ? "매 시간 어깨를 으쓱여주세요." : "Shrug shoulders every hour.";
    }

    return {
        medicalAnalysis: {
            hormone: hormone,
            hormoneDesc: desc,
            suggestion: sugg,
            nutrient: nutrient
        },
        customGuide: [
            {
                type: 'physical',
                icon: '🧘',
                title: isKo ? '기본 이완 스트레칭' : 'Basic Relaxation',
                exercise: isKo ? '편안하게 앉아 눈을 감으세요' : 'Sit comfortably and close eyes',
                tip: isKo ? '3분간 호흡에 집중합니다.' : 'Focus on breath for 3 mins.'
            },
            {
                type: 'mental',
                icon: '🍵',
                title: isKo ? '마음 챙김' : 'Mindfulness',
                exercise: isKo ? '따뜻한 차 한 잔' : 'Warm Tea',
                tip: isKo ? '온기를 느끼며 천천히 마십니다.' : 'Sip slowly feeling the warmth.'
            }
        ]
    };
};

export const generateInstantDailyPlan = (user: UserContext, lang: Language): ActionPlan => {
    const isKo = lang === 'ko';
    
    // Generate basic plan instantly
    return {
        goal: isKo ? '오늘의 작은 시작' : "Today's Small Start",
        actions: [
            {
                id: 'inst-1',
                title: isKo ? '물 한 잔 마시기' : 'Drink Water',
                description: isKo ? '신체 수분 공급 및 기분 전환' : 'Hydrate and refresh',
                category: 'routine',
                difficulty: 'easy',
                completed: false,
                estimated_time: '1min'
            },
            {
                id: 'inst-2',
                title: isKo ? '창문 열고 환기하기' : 'Open Window',
                description: isKo ? '뇌에 신선한 산소 공급' : 'Fresh oxygen for the brain',
                category: 'health',
                difficulty: 'easy',
                completed: false,
                estimated_time: '2min'
            },
            {
                id: 'inst-3',
                title: isKo ? '1분간 눈 감고 있기' : 'Close Eyes 1min',
                description: isKo ? '시각 정보 차단으로 뇌 휴식' : 'Rest brain by blocking vision',
                category: 'mental',
                difficulty: 'easy',
                completed: false,
                estimated_time: '1min'
            }
        ]
    };
};

export const getFallbackRichDetail = (language: Language): RichDetail => {
    const isKo = language === 'ko';
    return {
        background: isKo 
            ? "일시적인 네트워크 지연이나 분석 부하로 인해 상세 정보를 가져오지 못했습니다. 하지만 이 활동은 일반적으로 스트레스 감소와 이완에 도움이 됩니다."
            : "Could not fetch details due to temporary network delay. However, this activity is generally helpful for stress reduction.",
        guideSteps: isKo 
            ? ["편안한 자세를 취하세요.", "천천히 호흡하세요.", "5분간 지속하세요."]
            : ["Sit comfortably.", "Breathe slowly.", "Continue for 5 minutes."],
        doctorComment: isKo 
            ? "작은 실천이 큰 변화를 만듭니다. 꾸준히 시도해보세요."
            : "Small actions create big changes. Keep trying.",
        expectedEffect: isKo 
            ? "심신 안정 및 활력 증진"
            : "Mental stability and vitality boost"
    };
};

export interface DailyInsightsResult {
    medicalAnalysis: MedicalAnalysisData;
    customGuide: CustomGuideItem[];
}

export const generateDailyInsights = async (userContext: UserContext, language: Language = 'ko'): Promise<DailyInsightsResult | null> => {
    try {
        const smartContext = memoryService.getSmartContext();
        const langInstruction = language === 'ko' ? 'Korean' : 'English';
        
        const prompt = `
        Profile: ${userContext.name}, ${userContext.jobStatus}, Stress:${userContext.stressLevel}.
        Physical Complaint: ${userContext.physicalStatus}
        Mental Complaint: ${userContext.mentalStatus}
        History: ${smartContext.slice(0, 500)}...
        
        Task: Create 1 Neuro/Stress Analysis (Hormone/Neurotransmitter trend focus) and 2 Health Guides (1 Phys, 1 Mental).
        Lang: **${langInstruction}**. 
        Icon: **MUST BE A SINGLE EMOJI** (e.g. 🧘, 🧠). No text.
        JSON Only.
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.4,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        medicalAnalysis: {
                            type: Type.OBJECT,
                            properties: {
                                hormone: { type: Type.STRING, description: "Key hormone/neurotransmitter (e.g. Cortisol trend)" },
                                hormoneDesc: { type: Type.STRING, description: "Analysis of current status" },
                                suggestion: { type: Type.STRING, description: "Coaching advice" },
                                nutrient: { type: Type.STRING, description: "Recommended supplement/food" }
                            },
                            required: ['hormone', 'hormoneDesc', 'suggestion', 'nutrient']
                        },
                        customGuide: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['physical', 'mental'] },
                                    icon: { type: Type.STRING, description: "A single emoji character" },
                                    title: { type: Type.STRING },
                                    exercise: { type: Type.STRING },
                                    tip: { type: Type.STRING }
                                },
                                required: ['title', 'icon', 'type']
                            }
                        }
                    },
                    required: ['medicalAnalysis', 'customGuide']
                }
            }
        }));

        const data = cleanAndParseJson(response.text || "{}");
        if (data && data.medicalAnalysis && data.customGuide) {
            return data as DailyInsightsResult;
        }
        return generateInstantDailyInsights(userContext, language);
    } catch (e) {
        console.warn("Failed to generate daily insights, using fallback");
        return generateInstantDailyInsights(userContext, language);
    }
};

const RICH_DETAIL_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        background: { type: Type.STRING, description: "Scientific/Physiological mechanism (Pathophysiology)" },
        guideSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 actionable step-by-step instructions" },
        doctorComment: { type: Type.STRING, description: "Encouraging coaching advice" },
        expectedEffect: { type: Type.STRING, description: "Physiological/Psychological benefit" }
    },
    required: ['background', 'guideSteps', 'doctorComment', 'expectedEffect']
};

export const generateItemDetail = async (
    title: string, 
    type: 'action' | 'medical' | 'health', 
    userContext: UserContext,
    language: Language = 'ko'
): Promise<RichDetail | null> => {
    try {
        const langInstruction = language === 'ko' ? 'Korean' : 'English';
        const prompt = `
        Item: "${title}" (Category: ${type})
        User Condition: ${userContext.physicalStatus}, ${userContext.mentalStatus}
        Task: Provide deep-dive health/wellness details.
        
        Requirements:
        1. Background: Explain the scientific mechanism (Why this helps). Mention physiology.
        2. GuideSteps: Concrete steps.
        3. DoctorComment: Warm but professional coaching advice.
        
        Lang: **${langInstruction}**. JSON.
        `;

        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.4,
                responseSchema: RICH_DETAIL_SCHEMA
            }
        }));
        
        const data = cleanAndParseJson(response.text || "{}");
        if (data && data.background) {
            return data as RichDetail;
        }
        return getFallbackRichDetail(language);
    } catch (e: any) {
        return getFallbackRichDetail(language);
    }
};

export const generateDailyPlanFromProfile = async (userContext: UserContext, language: Language = 'ko'): Promise<ActionPlan | null> => {
     try {
        const smartContext = memoryService.getSmartContext();
        const langInstruction = language === 'ko' ? 'Korean' : 'English';
        
        const prompt = `
        Profile: ${userContext.name}, Stress:${userContext.stressLevel}
        Pain: ${userContext.physicalStatus}
        Mental: ${userContext.mentalStatus}
        History: ${smartContext.slice(0, 500)}...
        
        Task: Create a 3-item Micro-Action Checklist for Today in **${langInstruction}**.
        Items should address pain relief, mental grounding, and basic routine.
        JSON Only.
        `;
        
        // Use common generation logic
        const plan = await generateMicroActions(prompt, language);
        
        // Double Ensure Title consistency for Profile Init flow
        if (plan) {
            plan.goal = language === 'ko' ? "오늘의 작은 시작" : "Today's Small Start";
        }
        return plan;
    } catch (e) {
        return generateInstantDailyPlan(userContext, language);
    }
};
