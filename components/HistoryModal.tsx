
import React, { useMemo } from 'react';
import { DailySummary, MemoryLog, Message, Sender, Language } from '../types';
import ChatBubble from './ChatBubble';
import { getTranslation } from '../constants/translations';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  summary: DailySummary | undefined;
  logs: MemoryLog[];
  language: Language;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, date, summary, logs, language }) => {
  if (!isOpen) return null;

  const t = getTranslation(language);

  // Convert MemoryLog (Storage format) to Message[] (UI format) for ChatBubble
  const chatMessages = useMemo(() => {
    const messages: Message[] = [];
    logs.forEach((log) => {
      // User Message
      messages.push({
        id: log.id + '_user',
        sender: Sender.USER,
        text: log.userMessage,
        timestamp: new Date(log.timestamp),
      });
      // AI Message
      messages.push({
        id: log.id + '_ai',
        sender: Sender.AI,
        text: log.aiResponse,
        timestamp: new Date(log.timestamp), // Use same timestamp or add offset if needed
      });
    });
    return messages;
  }, [logs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
          <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📅</span> {date}
              </h2>
              <p className="text-xs text-gray-500">
                {language === 'ko' ? '대화 기록 상세 보기' : 'Conversation History Details'}
              </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 bg-gray-50 space-y-6">
            
            {/* 📌 Compact Summary Section */}
            {summary && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">📝</span>
                        <h3 className="font-bold text-teal-900 text-sm uppercase tracking-wide">
                            {language === 'ko' ? '오늘의 요약 (Compact Summary)' : 'Daily Compact Summary'}
                        </h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed font-medium">
                        {summary.summary}
                    </p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {summary.healthTags.map((tag, idx) => (
                             <span key={`h-${idx}`} className="text-[10px] bg-white border border-teal-200 text-teal-600 px-2 py-0.5 rounded-full font-bold">
                                {tag}
                             </span>
                        ))}
                        {summary.careerTags.map((tag, idx) => (
                             <span key={`c-${idx}`} className="text-[10px] bg-white border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                {tag}
                             </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Divider */}
            <div className="flex items-center justify-center gap-2">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-xs text-gray-400 font-medium">Chat History</span>
                <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            {/* Chat Logs */}
            <div className="space-y-4">
                {chatMessages.length > 0 ? (
                    chatMessages.map((msg) => (
                        <ChatBubble 
                            key={msg.id} 
                            message={msg} 
                            language={language}
                            // Suggestions are disabled in history view
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        {language === 'ko' ? '저장된 대화 내용이 없습니다.' : 'No conversation logs found.'}
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
