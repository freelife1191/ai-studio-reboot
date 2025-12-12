
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeChat, sendMessageToGeminiStream, fileToGenerativePart, generateWelcomeMessage, resetChatSession, generateDailyPlanFromProfile, generateItemDetail, generateDailyInsights, generateInstantDailyPlan, generateInstantDailyInsights } from './services/geminiService';
import { memoryService, getLocalDateString } from './services/memoryService'; 
import { Message, Sender, ActionPlan, UserContext, Language, DailyChecklist, DailySummary, MicroAction, CustomGuideItem, MedicalAnalysisData, RichDetail } from './types';
import { getTranslation } from './constants/translations';
import ChatBubble from './components/ChatBubble';
import ActionCard from './components/ActionCard';
import DeepDiveReport from './components/DeepDiveReport';
import OnboardingForm from './components/OnboardingForm';
import HistorySidebar from './components/HistorySidebar';
import HistoryModal from './components/HistoryModal';
import DetailModal from './components/DetailModal';
import { Content } from "@google/genai";

function App() {
  // Application State
  const [userContext, setUserContext] = useState<UserContext | null>(() => memoryService.getUserProfile());
  const [language, setLanguage] = useState<Language>(() => {
      const profile = memoryService.getUserProfile();
      return profile?.language || 'ko';
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<ActionPlan | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showHistory, setShowHistory] = useState(false); 
  const [historySummaries, setHistorySummaries] = useState<DailySummary[]>([]); 
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [checklistRefreshTrigger, setChecklistRefreshTrigger] = useState(0); 
  const [currentModel, setCurrentModel] = useState('gemini-2.5-flash');
  const [viewingHistoryDate, setViewingHistoryDate] = useState<string | null>(null);
  
  const [detailModalState, setDetailModalState] = useState<{
      type: 'action' | 'health' | 'medical';
      data: MicroAction | CustomGuideItem | MedicalAnalysisData;
  } | null>(null);
  
  const t = getTranslation(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializationRef = useRef(false);
  
  // 🔥 Abort Controller for Stopping Generation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load History when sidebar opens
  useEffect(() => {
    if (showHistory) {
      setHistorySummaries(memoryService.getDailySummaries());
    }
  }, [showHistory]);

  // --------------------------------------------------------------------------
  // 🔥 CENTRALIZED BACKGROUND ENRICHMENT LOGIC
  // --------------------------------------------------------------------------
  const runBackgroundEnrichment = useCallback(async (context: UserContext, lang: Language) => {
      const today = getLocalDateString();
      console.log(`🚀 [Background] Starting enrichment for ${today}...`);

      // 1. Enrich Daily Summary (Medical & Health Guides)
      const currentSummaries = memoryService.getDailySummaries();
      let summary = currentSummaries.find(s => s.date === today);

      if (summary) {
          // A. Enrich Medical Analysis
          if (summary.medicalAnalysis && !summary.medicalAnalysis.detail) {
              generateItemDetail(summary.medicalAnalysis.hormone, 'medical', context, lang).then(detail => {
                  if (detail) {
                      console.log("✅ [Background] Medical Analysis Enriched");
                      // Re-fetch to ensure freshness
                      const latestSummaries = memoryService.getDailySummaries();
                      const latestSummary = latestSummaries.find(s => s.date === today);
                      if (latestSummary && latestSummary.medicalAnalysis) {
                          const updated = { ...latestSummary, medicalAnalysis: { ...latestSummary.medicalAnalysis, detail } };
                          memoryService.saveDailySummary(updated);
                          setHistorySummaries(prev => prev.map(s => s.date === today ? updated : s));
                      }
                  }
              });
          }

          // B. Enrich Custom Guides (Loop)
          if (summary.customGuide) {
              summary.customGuide.forEach(async (guide, idx) => {
                  if (!guide.detail) {
                      const detail = await generateItemDetail(guide.title, 'health', context, lang);
                      if (detail) {
                          console.log(`✅ [Background] Guide '${guide.title}' Enriched`);
                          // Re-fetch & Update
                          const latestSummaries = memoryService.getDailySummaries();
                          const latestSummary = latestSummaries.find(s => s.date === today);
                          if (latestSummary && latestSummary.customGuide) {
                              const updatedGuides = [...latestSummary.customGuide];
                              updatedGuides[idx] = { ...updatedGuides[idx], detail };
                              const updatedSummary = { ...latestSummary, customGuide: updatedGuides };
                              memoryService.saveDailySummary(updatedSummary);
                              setHistorySummaries(prev => prev.map(s => s.date === today ? updatedSummary : s));
                          }
                      }
                  }
              });
          }
      }

      // 2. Enrich Checklist Items
      const checklist = memoryService.getChecklistForDate(today);
      if (checklist) {
          checklist.items.forEach(async (item, idx) => {
              if (!item.detail) {
                  const detail = await generateItemDetail(item.title, 'action', context, lang);
                  if (detail) {
                      console.log(`✅ [Background] Action '${item.title}' Enriched`);
                      // Re-fetch & Update
                      const currentList = memoryService.getChecklistForDate(today);
                      if (currentList) {
                          const updatedItems = [...currentList.items];
                          updatedItems[idx] = { ...updatedItems[idx], detail };
                          const updatedList = { ...currentList, items: updatedItems };
                          memoryService.saveChecklist(updatedList);
                          
                          // 🔥 CRITICAL: Update State Immediately so UI sees the detail
                          setCurrentPlan(prev => {
                              if (prev && currentList.date === today) {
                                  return { ...prev, actions: updatedItems };
                              }
                              return prev;
                          });
                          
                          // Trigger Report Refresh
                          setChecklistRefreshTrigger(prev => prev + 1);
                      }
                  }
              }
          });
      }
  }, []);

  // --------------------------------------------------------------------------
  // 🔥 NEW: Background AI Upgrade (Replace Instant Content with AI Content)
  // --------------------------------------------------------------------------
  const upgradeDailyContentWithAI = useCallback(async (context: UserContext, lang: Language) => {
      console.log("⚡ [Background] Upgrading Daily Content with AI...");
      const today = getLocalDateString();
      
      // 1. Upgrade Insights (Summary)
      const insights = await generateDailyInsights(context, lang);
      if (insights) {
          const latestSummaries = memoryService.getDailySummaries();
          // Merge with existing logic (keep generation flag if needed, or overwrite)
          const newSummary: DailySummary = {
              date: today,
              summary: lang === 'ko' ? "오늘의 건강 상태 분석 (AI Updated)" : "Daily Health Analysis (AI Updated)",
              sentimentScore: Math.max(1, 10 - context.stressLevel),
              healthTags: context.physicalStatus ? [context.physicalStatus.split(' ')[0]] : [],
              careerTags: [],
              keyFact: insights.medicalAnalysis.hormone,
              medicalAnalysis: insights.medicalAnalysis,
              customGuide: insights.customGuide,
              isGenerated: true
          };
          memoryService.saveDailySummary(newSummary);
          setHistorySummaries(prev => [...prev.filter(s => s.date !== today), newSummary]);
          setChecklistRefreshTrigger(prev => prev + 1);
          console.log("✅ [Background] Insights Upgraded");
      }

      // 2. Upgrade Action Plan (Checklist)
      const plan = await generateDailyPlanFromProfile(context, lang);
      if (plan) {
          // Check if user already checked some items in the 'Instant' plan
          const currentList = memoryService.getChecklistForDate(today);
          const completedIds = currentList ? currentList.items.filter(i => i.completed).map(i => i.id) : [];
          
          // Map completed status if possible (optional, but good UX)
          // For now, we replace actions but maybe keep completion rate logic if IDs match? 
          // Since IDs are generated, it's safer to just replace, or append.
          // Strategy: Just Replace for now as it's early in the session.
          
          memoryService.saveChecklist({ date: today, items: plan.actions, completionRate: 0, status: 'red' });
          setCurrentPlan(plan);
          setChecklistRefreshTrigger(prev => prev + 1);
          console.log("✅ [Background] Plan Upgraded");
      }
      
      // 3. Trigger Detail Enrichment for the NEW AI content
      runBackgroundEnrichment(context, lang);

  }, [runBackgroundEnrichment]);

  // Effect: Run Enrichment on Mount / Login
  useEffect(() => {
      if (!userContext) return;
      
      const initDailyContent = async () => {
          const today = getLocalDateString();
          let summary = memoryService.getDailySummaries().find(s => s.date === today);

          // If Summary missing, generate INSTANT basic one first
          if (!summary) {
              console.log("⚡ [Init] Generating INSTANT Daily Content...");
              
              // 1. Instant Insights
              const instantInsights = generateInstantDailyInsights(userContext, language);
              const newSummary: DailySummary = {
                  date: today,
                  summary: language === 'ko' ? "오늘의 건강 상태 분석" : "Daily Health Analysis",
                  sentimentScore: Math.max(1, 10 - userContext.stressLevel),
                  healthTags: userContext.physicalStatus ? [userContext.physicalStatus.split(' ')[0]] : [],
                  careerTags: [],
                  keyFact: instantInsights.medicalAnalysis.hormone,
                  medicalAnalysis: instantInsights.medicalAnalysis,
                  customGuide: instantInsights.customGuide,
                  isGenerated: true
              };
              memoryService.saveDailySummary(newSummary);
              setHistorySummaries(prev => [...prev.filter(s => s.date !== today), newSummary]);
              
              // 2. Instant Plan
              // Check if plan exists (might have been created by onboarding)
              let plan = memoryService.getChecklistForDate(today);
              if (!plan) {
                  const instantPlan = generateInstantDailyPlan(userContext, language);
                  memoryService.saveChecklist({ date: today, items: instantPlan.actions, completionRate: 0, status: 'red' });
                  setCurrentPlan(instantPlan);
              }

              // 3. Force UI Refresh
              setChecklistRefreshTrigger(prev => prev + 1);
              
              // 4. Trigger AI Upgrade in Background
              upgradeDailyContentWithAI(userContext, language);
          } else {
              // If exists, just run enrichment for details
              runBackgroundEnrichment(userContext, language);
          }
      };

      initDailyContent();

  }, [userContext?.name, language, runBackgroundEnrichment, upgradeDailyContentWithAI]);


  // Initialize Session / Chat
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    console.log("🚀 App Mounted.");

    if (userContext) {
        if (userContext.language && userContext.language !== language) {
            setLanguage(userContext.language);
        }
        
        // 🔥 LOAD ONLY TODAY'S LOGS (Previous days are in History Sidebar)
        const today = getLocalDateString();
        const todayLogs = memoryService.getLogsForDate(today); 
        
        // Prepare SDK History
        const sdkHistory: Content[] = [];

        if (todayLogs.length > 0) {
            const restoredMessages: Message[] = [];
            todayLogs.forEach(log => {
                 if (log.userMessage?.trim() && log.userMessage !== "Started Re:Boot") {
                     restoredMessages.push({ id: log.id + '_user', sender: Sender.USER, text: log.userMessage, timestamp: new Date(log.timestamp) });
                     // Add to SDK History
                     sdkHistory.push({ role: 'user', parts: [{ text: log.userMessage }] });
                 }
                 restoredMessages.push({ id: log.id + '_ai', sender: Sender.AI, text: log.aiResponse, timestamp: new Date(log.timestamp) });
                 // Add to SDK History
                 sdkHistory.push({ role: 'model', parts: [{ text: log.aiResponse }] });
            });
            setMessages(restoredMessages);
        } 
        
        initializeChat(userContext, currentModel, userContext.language || 'ko', sdkHistory);
        
        const existingChecklist = memoryService.getChecklistForDate(today);
        if (existingChecklist) {
            const lang = userContext.language || 'ko';
            const goal = lang === 'ko' ? "오늘의 작은 시작" : "Today's Small Start";
            setCurrentPlan({ goal: goal, actions: existingChecklist.items });
        }
    } 
  }, []); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setCurrentModel(newModel);
  };

  // 🔥 UPDATED: Language Toggle
  const toggleLanguage = () => {
    const newLang: Language = language === 'ko' ? 'en' : 'ko';
    
    // 1. Refresh Summaries
    setHistorySummaries(memoryService.getDailySummaries());

    // 2. Update Profile
    let updatedContext = { ...userContext!, language: newLang };
    setUserContext(updatedContext);
    memoryService.saveUserProfile(updatedContext);
    setLanguage(newLang);
    
    // 3. Update Checklist Title
    if (currentPlan) {
        setCurrentPlan(prev => prev ? ({ 
            ...prev, 
            goal: newLang === 'ko' ? "오늘의 작은 시작" : "Today's Small Start" 
        }) : null);
    }

    // 4. Preserve History Context
    const sdkHistory: Content[] = messages
        .filter(m => !m.isError && !m.isTyping) 
        .map(m => ({
            role: m.sender === Sender.USER ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

    initializeChat(updatedContext, currentModel, newLang, sdkHistory);
    setChecklistRefreshTrigger(prev => prev + 1);
  };

  const handleResetProfile = () => {
      memoryService.resetApplication();
      resetChatSession();
      setMessages([]);
      setCurrentPlan(null);
      setShowReport(false);
      setShowHistory(false);
      setUserContext(null);
      initializationRef.current = false; 
  };

  const handleDeleteHistory = (date: string) => {
    if (confirm(language === 'ko' ? "정말 삭제하시겠습니까?" : "Are you sure?")) {
      memoryService.deleteDailySummary(date);
      setHistorySummaries(prev => prev.filter(s => s.date !== date));
    }
  };

  const handleGenerateTestHistory = () => {
      memoryService.generateTestHistory(language);
      setHistorySummaries(memoryService.getDailySummaries());
      setChecklistRefreshTrigger(prev => prev + 1); 
  };

  // --------------------------------------------------------------------------
  // 🔥 ONBOARDING COMPLETE: Generate INSTANTLY + Upgrade Later
  // --------------------------------------------------------------------------
  const handleOnboardingComplete = async (data: UserContext) => {
        // 1. Save Profile
        memoryService.saveUserProfile(data); 
        setUserContext(data);
        setLanguage(data.language); 
        
        // Check if returning user or backup restore
        const hasHistory = memoryService.getDailySummaries().length > 0;
        if (hasHistory) {
            setHistorySummaries(memoryService.getDailySummaries());
            const today = getLocalDateString();
            const todayChecklist = memoryService.getChecklistForDate(today);
            
            if (todayChecklist) {
                const goalLabel = data.language === 'ko' ? "오늘의 작은 시작" : "Today's Small Start";
                setCurrentPlan({ goal: goalLabel, actions: todayChecklist.items });
            }
            setChecklistRefreshTrigger(prev => prev + 1);
            runBackgroundEnrichment(data, data.language);
            return;
        }

        // 2. New User Initialization
        initializeChat(data, currentModel, data.language);
        setIsLoading(true);

        // A. Generate Welcome Message (Async is fine here)
        generateWelcomeMessage(data, data.language).then(welcomeData => {
            addMessage({
              id: 'welcome',
              sender: Sender.AI,
              text: welcomeData.text,
              timestamp: new Date(),
              suggestedQuestions: welcomeData.suggestedQuestions,
              model: 'Gemini 2.5 Flash'
            });
            setIsLoading(false);
        });
        
        // 🔥 B. Generate INSTANT Action Plan (Checklist) - No API Wait
        const instantPlan = generateInstantDailyPlan(data, data.language);
        const today = getLocalDateString();
        memoryService.saveChecklist({ date: today, items: instantPlan.actions, completionRate: 0, status: 'red' });
        setCurrentPlan(instantPlan);

        // 🔥 C. Generate INSTANT Daily Summary (Medical/Health) - No API Wait
        const instantInsights = generateInstantDailyInsights(data, data.language);
        const newSummary: DailySummary = {
              date: today,
              summary: data.language === 'ko' ? "오늘의 건강 상태 분석" : "Daily Health Analysis",
              sentimentScore: Math.max(1, 10 - data.stressLevel),
              healthTags: data.physicalStatus ? [data.physicalStatus.split(' ')[0]] : [],
              careerTags: [],
              keyFact: instantInsights.medicalAnalysis.hormone,
              medicalAnalysis: instantInsights.medicalAnalysis,
              customGuide: instantInsights.customGuide,
              isGenerated: true
         };
         memoryService.saveDailySummary(newSummary);
         setHistorySummaries(prev => [...prev, newSummary]); 

         // D. Force UI Refresh of Sidebar
         setChecklistRefreshTrigger(prev => prev + 1);

         // E. 🔥 KICK OFF AI UPGRADE IN BACKGROUND
         upgradeDailyContentWithAI(data, data.language);
  };

  const handleToggleAction = (id: string) => {
    if (!currentPlan) return;
    setCurrentPlan(prev => {
        if (!prev) return null;
        return {
            ...prev,
            actions: prev.actions.map(a => 
                a.id === id ? { ...a, completed: !a.completed } : a
            )
        };
    });
    
    const today = getLocalDateString();
    const existing = memoryService.getChecklistForDate(today);
    if (existing) {
         const updatedItems = existing.items.map(item => 
             item.id === id ? { ...item, completed: !item.completed } : item
         );
         const completedCount = updatedItems.filter(i => i.completed).length;
         const rate = Math.round((completedCount / updatedItems.length) * 100);
         
         memoryService.saveChecklist({ ...existing, items: updatedItems, completionRate: rate, status: memoryService.calculateStatus(rate) });
         setChecklistRefreshTrigger(prev => prev + 1);
    }
  };

  // 🔥 UPDATED: Open Detail with DOUBLE CHECK
  const handleOpenDetail = async (type: 'action' | 'health' | 'medical', data: any) => {
      if (!userContext) return;
      
      // 1. Optimistic Open
      setDetailModalState({ type, data });

      // 2. 🔥 Check Storage (Truth) because React State might be slightly stale or data passed in is stale
      let existingDetail = data.detail;
      const today = getLocalDateString();

      if (!existingDetail) {
          if (type === 'action') {
              const checklist = memoryService.getChecklistForDate(today);
              const item = checklist?.items.find(i => i.id === data.id);
              if (item?.detail) existingDetail = item.detail;
          } else if (type === 'medical') {
              const summary = memoryService.getDailySummaries().find(s => s.date === today);
              if (summary?.medicalAnalysis?.detail) existingDetail = summary.medicalAnalysis.detail;
          } else if (type === 'health') {
              const summary = memoryService.getDailySummaries().find(s => s.date === today);
              const item = summary?.customGuide?.find(g => g.title === data.title);
              if (item?.detail) existingDetail = item.detail;
          }
      }

      // 3. If found in storage, update modal state immediately
      if (existingDetail) {
          console.log("✅ Detail found in storage. Skipping generation.");
          setDetailModalState({ type, data: { ...data, detail: existingDetail } });
          return;
      }

      // 4. Only if totally missing, generate (Fallback)
      try {
          let title = "";
          if (type === 'action') title = data.title;
          else if (type === 'health') title = data.title;
          else if (type === 'medical') title = data.hormone;

          console.log("⏳ Detail not found. Generating on-demand...");
          const richDetail = await generateItemDetail(title, type, userContext, language);
          
          if (richDetail) {
              const updatedData = { ...data, detail: richDetail };
              setDetailModalState({ type, data: updatedData });

              // Save to Storage & State Logic (Reusable)
              if (type === 'action') {
                  const checklist = memoryService.getChecklistForDate(today);
                  if (checklist) {
                      const updatedItems = checklist.items.map(item => 
                          item.id === data.id ? { ...item, detail: richDetail } : item
                      );
                      memoryService.saveChecklist({ ...checklist, items: updatedItems });
                      if (currentPlan) setCurrentPlan(prev => prev ? { ...prev, actions: updatedItems } : null);
                  }
              } else if (type === 'health' || type === 'medical') {
                  const summaries = memoryService.getDailySummaries();
                  const summary = summaries.find(s => s.date === today);
                  if (summary) {
                      let newSummary = { ...summary };
                      if (type === 'medical') {
                          newSummary.medicalAnalysis = { ...newSummary.medicalAnalysis!, detail: richDetail };
                      } else {
                          if (newSummary.customGuide) {
                              newSummary.customGuide = newSummary.customGuide.map(g => 
                                  g.title === data.title ? { ...g, detail: richDetail } : g
                              );
                          }
                      }
                      memoryService.saveDailySummary(newSummary);
                      setHistorySummaries(prev => prev.map(s => s.date === today ? newSummary : s));
                  }
              }
              setChecklistRefreshTrigger(prev => prev + 1);
          }
      } catch (e) { console.error("Detail fetch failed", e); }
  };

  const handleChecklistUpdate = (checklist: DailyChecklist) => {
      const today = getLocalDateString();
      if (checklist.date === today && currentPlan) {
          setCurrentPlan(prev => prev ? ({ ...prev, actions: checklist.items }) : null);
      }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsLoading(false);
    }
  };

  // 🔥 UPDATED: Execute Send with Streaming
  const executeSendMessage = async (text: string, img: File | null) => {
    if (!text.trim() && !img) return;
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    let base64;
    if (img) base64 = await fileToGenerativePart(img);

    addMessage({ id: Date.now().toString(), sender: Sender.USER, text: text || (img ? t.imgUpload : ""), timestamp: new Date(), image: base64 });
    setIsLoading(true);

    const aiMessageId = Date.now().toString() + '_ai';
    addMessage({ 
        id: aiMessageId, 
        sender: Sender.AI, 
        text: "", 
        timestamp: new Date(), 
        isTyping: true 
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
        await sendMessageToGeminiStream(
            text, 
            userContext!, 
            base64,
            (partialText) => {
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId 
                        ? { ...msg, text: partialText, isTyping: false } 
                        : msg
                ));
            },
            abortController.signal
        ).then(res => {
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId 
                    ? { ...msg, text: res.fullText || msg.text, isTyping: false, model: res.modelUsed, groundingSources: res.groundingSources } 
                    : msg
            ));
            memoryService.addLog(text || (img ? '[Image]' : ''), res.fullText || "");
        });

    } catch(e: any) {
        if (e.name === 'AbortError' || e.message?.includes('aborted')) {
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId 
                    ? { 
                        ...msg, 
                        text: (msg.text || "") + "\n\n" + `(🚫 ${t.msgCancelled})`,
                        isTyping: false,
                        isError: false
                      } 
                    : msg
            ));
        } else {
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId 
                    ? { ...msg, text: t.errorCommon, isError: true, isTyping: false } 
                    : msg
            ));
        }
    } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
    }
  };

  const handleSend = () => executeSendMessage(input, selectedImage);
  const handleSuggestionClick = (txt: string) => executeSendMessage(txt, null);
  const handleRetry = () => {}; 
  const handleKeyPress = (e: React.KeyboardEvent) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const getModalData = () => {
      if (!viewingHistoryDate) return { summary: undefined, logs: [] };
      const summary = historySummaries.find(s => s.date === viewingHistoryDate);
      const logs = memoryService.getLogsForDate(viewingHistoryDate);
      return { summary, logs };
  };

  if (!userContext) {
      if (memoryService.hasUserProfile()) {
           const profile = memoryService.getUserProfile();
           if (profile) {
               setUserContext(profile);
               return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
           }
      }
      return <OnboardingForm onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className={`fixed inset-0 z-20 transform transition-transform duration-300 md:relative md:translate-x-0 md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 ${showReport ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <button onClick={() => setShowReport(false)} className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <DeepDiveReport 
          userContext={{...userContext, language}} 
          onReset={handleResetProfile} 
          refreshTrigger={checklistRefreshTrigger}
          onChecklistUpdate={handleChecklistUpdate}
          onOpenDetail={handleOpenDetail}
        />
      </div>

      <div className="flex-1 flex flex-col h-full w-full relative">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow">R</div>
             <div>
                <h1 className="font-bold text-gray-800 text-lg">{t.appTitle}</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-1">
                    <p className="text-xs text-gray-500 hidden md:block">{t.appSubtitle}</p>
                    <div className="flex items-center gap-1">
                        <select value={currentModel} onChange={handleModelChange} className="text-xs font-semibold bg-gray-100 border-none rounded px-1 py-0.5 focus:ring-1 focus:ring-teal-500 cursor-pointer outline-none text-teal-700">
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
                        </select>
                        <button onClick={toggleLanguage} className="text-xs font-bold px-1.5 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center gap-1">
                            {language === 'ko' ? 'EN' : 'KR'}
                        </button>
                    </div>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-full transition-colors ${showHistory ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:text-teal-500 hover:bg-gray-100'}`} title={t.btnHistory}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              <button onClick={handleResetProfile} title={t.btnReset} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors hidden md:block">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
              <button onClick={() => setShowReport(!showReport)} className="md:hidden px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg border border-teal-100">{t.reportButton}</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#F8F9FA]">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} language={language} onSuggestionClick={handleSuggestionClick} onRetry={handleRetry} />
          ))}
          {currentPlan && (
            <div className="w-full max-w-[85%] md:max-w-[70%] mb-4">
                 <ActionCard plan={currentPlan} onToggle={handleToggleAction} onDetailClick={(id) => { const action = currentPlan.actions.find(a => a.id === id); if (action) handleOpenDetail('action', action); }} language={language} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white p-4 border-t border-gray-200">
            {selectedImage && (
                <div className="mb-2 flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 w-fit">
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{selectedImage.name}</span>
                    <button onClick={() => setSelectedImage(null)} className="text-gray-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            )}
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0" title="Upload Image">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                </button>
                <div className="flex-1 relative">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder={t.inputPlaceholder} className="w-full border border-gray-300 rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none max-h-32 shadow-sm" rows={1} style={{ minHeight: '48px' }} />
                </div>
                
                {isLoading ? (
                    <button 
                        onClick={handleStopGeneration} 
                        className="relative p-3 rounded-full flex-shrink-0 transition-all duration-200 shadow-md bg-white border border-red-100 group w-12 h-12 flex items-center justify-center"
                        title="Stop Generation"
                    >
                        <div className="absolute inset-0 rounded-full border-4 border-red-100 border-t-red-500 animate-spin"></div>
                        <div className="relative z-10 w-3 h-3 bg-red-500 rounded-sm group-hover:bg-red-600 transition-colors"></div>
                    </button>
                ) : (
                    <button 
                        onClick={handleSend} 
                        disabled={!input.trim() && !selectedImage} 
                        className={`p-3 rounded-full flex-shrink-0 transition-all duration-200 shadow-md w-12 h-12 flex items-center justify-center ${(!input.trim() && !selectedImage) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105'}`}
                    >
                        <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                )}
            </div>
            <div className="text-center mt-2 flex items-center justify-center gap-1.5 opacity-60">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-xs text-gray-500">{t.disclaimer}</p>
            </div>
        </div>
      </div>
      <HistorySidebar isOpen={showHistory} onClose={() => setShowHistory(false)} summaries={historySummaries} onDelete={handleDeleteHistory} onSelect={(date) => setViewingHistoryDate(date)} onGenerateTestHistory={handleGenerateTestHistory} language={language} />
      {viewingHistoryDate && (() => { const { summary, logs } = getModalData(); return <HistoryModal isOpen={!!viewingHistoryDate} onClose={() => setViewingHistoryDate(null)} date={viewingHistoryDate} summary={summary} logs={logs} language={language} />; })()}
      {detailModalState && <DetailModal isOpen={!!detailModalState} onClose={() => setDetailModalState(null)} type={detailModalState.type} data={detailModalState.data} language={language} />}
    </div>
  );
}

export default App;
