
import React, { useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Message, Sender, Language } from '../types';
import { getTranslation } from '../constants/translations';

interface ChatBubbleProps {
  message: Message;
  language?: Language;
  onSuggestionClick?: (text: string) => void;
  onRetry?: () => void;
}

// Helper to safely extract text from React Children
const extractText = (children: React.ReactNode): string => {
    if (typeof children === 'string') return children;
    if (typeof children === 'number') return String(children);
    if (Array.isArray(children)) return children.map(extractText).join('');
    // @ts-ignore
    if (React.isValidElement(children) && children.props.children) {
        // @ts-ignore
        return extractText(children.props.children);
    }
    return '';
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, language = 'ko' as Language, onSuggestionClick, onRetry }) => {
  const isUser = message.sender === Sender.USER;
  const t = getTranslation(language);

  // OPTIMIZATION: Check text length to decide rendering strategy
  const isLongText = (message.text || "").length > 15000; // Increased limit for better markdown support

  // 🔥 PREPROCESSING: Clean Markdown text
  const processedText = useMemo(() => {
      if (!message.text) return "";
      let text = message.text;
      
      // 1. Force newlines around Headers (### or ##) to prevent clumping
      // Handles cases like: "text\n## Header" -> "text\n\n## Header"
      text = text.replace(/([^\n])\n(#{1,3})\s/g, '$1\n\n$2 ');

      // 2. 🔥 IMPROVED: Force newlines before Bullet Points & Numbered Lists
      // Now handles indentation (nested lists) correctly.
      // Matches: non-newline -> newline -> optional whitespace -> bullet/number
      text = text.replace(/([^\n])\n(\s*)([\*\-]|\d+\.)\s/g, '$1\n\n$2$3 ');
      
      // 3. Remove standalone H1 (#) if it appears unexpectedly (Gemini artifact)
      text = text.replace(/^\s*#\s*$/gm, '');

      return text;
  }, [message.text]);

  // 🛡️ Robust Header Renderer: Handles H1, H2, H3 consistently for Key Sections
  const renderStyledHeader = (level: string, children: React.ReactNode, props: any) => {
      const text = extractText(children);
      // Keywords that trigger the Boxed Style (Includes Health Insight, Search Icon, & '건강')
      const isSectionHeader = /🩺|💊|🧘|⚠️|🔍|Clinical|Nutrition|Rehab|Red Flags|Health Insight|의학적|영양|재활|주의사항|건강/.test(text);
      
      if (isSectionHeader) {
          const isWarning = text.includes('⚠️') || text.includes('Red Flags') || text.includes('주의사항');
          return (
              <div 
                  className={`
                      flex items-center gap-2 text-base md:text-lg font-extrabold mt-8 mb-4 px-4 py-3 rounded-xl border-l-4 shadow-sm
                      ${isWarning 
                          ? 'bg-red-50 text-red-800 border-red-500' 
                          : 'bg-indigo-50 text-indigo-900 border-indigo-500'}
                  `} 
                  {...props}
              >
                  {children}
              </div>
          );
      }

      // Default Styles for non-section headers
      const styles: Record<string, string> = {
          h1: "text-2xl font-bold mt-8 mb-4 text-gray-900 border-b pb-2",
          h2: "text-xl font-bold mt-6 mb-3 text-gray-800",
          h3: "text-lg font-bold mt-5 mb-2 text-gray-800",
          h4: "text-base font-bold mt-4 mb-1 text-gray-800"
      };
      
      const Tag = level as any;
      return <Tag className={styles[level] || styles.h3} {...props}>{children}</Tag>;
  };

  // 🎨 Custom Markdown Renderers
  const markdownComponents: Components = useMemo(() => ({
    // Headings: Use Unified Renderer
    h1: ({ node, children, ...props }) => renderStyledHeader('h1', children, props),
    h2: ({ node, children, ...props }) => renderStyledHeader('h2', children, props),
    h3: ({ node, children, ...props }) => renderStyledHeader('h3', children, props),
    h4: ({ node, children, ...props }) => renderStyledHeader('h4', children, props),
    
    // Bold: Yellow Highlighter Effect
    strong: ({ node, children, ...props }) => (
        <strong className="font-bold text-gray-900 bg-yellow-200 px-1 rounded box-decoration-clone" {...props}>
            {children}
        </strong>
    ),
    // Lists: Spacious and Clean
    // 🔥 Added 'pl-4' to support nested indentation visibly
    ul: ({ node, children, ...props }) => (
        <ul className="space-y-2 my-3 pl-4 list-none" {...props}>{children}</ul>
    ),
    ol: ({ node, children, ...props }) => (
        <ol className="space-y-2 my-3 pl-4 list-decimal marker:text-gray-500" {...props}>{children}</ol>
    ),
    // List Item: Custom Dot logic mostly for top-level, but handles nesting gracefully now
    li: ({ node, children, ...props }) => (
        <li className="flex gap-2.5 text-gray-700 leading-relaxed text-sm md:text-base items-start relative">
             {/* Only show custom dot for unordered lists (parents check) - simplified to standard behavior for robustness with nesting */}
             <div className="shrink-0 w-1.5 h-1.5 mt-2.5 rounded-full bg-indigo-400 opacity-80"></div>
             <div className="flex-1 min-w-0">{children}</div>
        </li>
    ),
    // Paragraphs: Increased margin and line-height for better readability
    p: ({ node, children, ...props }) => (
        <p className="mb-4 text-gray-700 leading-7 md:leading-8 text-sm md:text-base tracking-wide" {...props}>{children}</p>
    ),
    // Divider
    hr: ({ ...props }) => (
        <div className="h-px bg-gray-200 my-8 border-none" {...props} />
    ),
    // Blockquote
    blockquote: ({ node, children, ...props }) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 py-1 my-4 text-gray-500 italic text-sm bg-gray-50 rounded-r-lg" {...props}>
            {children}
        </blockquote>
    )
  }), []);

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[95%] md:max-w-[85%] lg:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Timestamp / Sender Name */}
        <div className="text-xs text-gray-400 mb-1 px-1 flex items-center gap-1">
           <span className={`font-semibold ${isUser ? 'text-blue-500' : 'text-teal-600'}`}>
             {isUser ? t.me : t.coach}
           </span>
           <span>•</span>
           <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           {/* Model Badge */}
           {!isUser && message.model && (
               <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-[10px] rounded text-gray-500 font-medium border border-gray-200 hidden sm:inline-block">
                   {message.model.includes('3.0') || message.model.includes('3-pro') ? '🧠 Gemini 3.0' : '⚡ Gemini 2.5'}
               </span>
           )}
        </div>

        {/* Bubble */}
        <div
          className={`p-1 shadow-sm text-sm md:text-base leading-relaxed break-words relative overflow-hidden
            ${isUser 
              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none px-5 py-3' 
              : message.isError 
                ? 'bg-red-50 text-red-600 border border-red-200 rounded-2xl rounded-tl-none px-5 py-4'
                : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none'
            }`}
        >
            {/* AI Response Container (Extra Padding & Styling) */}
            {!isUser && !message.isError && (
                 <div className="px-5 py-2 md:px-7 md:py-4">
                    {/* Image attachment */}
                    {message.image && (
                        <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                            <img 
                                src={`data:image/jpeg;base64,${message.image}`} 
                                alt="User upload" 
                                className="max-w-full h-auto max-h-80 object-cover mx-auto"
                            />
                        </div>
                    )}

                    {/* Loading Indicator (Only show if typing AND text is empty) */}
                    {message.isTyping && !message.text ? (
                        <div className="flex space-x-1.5 h-6 items-center px-1 py-4">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    ) : (
                        <div className="markdown-medical-theme">
                        {/* SAFETY: Render plain text if too long to avoid parser freeze */}
                        {isLongText ? (
                            <div className="whitespace-pre-wrap font-sans text-gray-700 leading-8">{processedText}</div>
                        ) : (
                            <ReactMarkdown 
                                components={markdownComponents}
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                            >
                                {processedText}
                            </ReactMarkdown>
                        )}
                        </div>
                    )}
                    
                    {/* 🔥 Medical Disclaimer Footer */}
                    {!message.isTyping && (
                        <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            {t.medicalWarningShort}
                        </div>
                    )}
                 </div>
            )}

            {/* User Message Container (Simple) */}
            {isUser && (
                 <div className="whitespace-pre-wrap font-sans text-white">
                    {message.image && (
                        <div className="mb-3 rounded-lg overflow-hidden border border-white/20 bg-black/10">
                            <img 
                                src={`data:image/jpeg;base64,${message.image}`} 
                                alt="User upload" 
                                className="max-w-full h-auto max-h-60 object-cover"
                            />
                        </div>
                    )}
                    {message.text}
                 </div>
            )}
            
            {/* Error Message Container */}
            {message.isError && (
                 <div>
                     <p className="font-bold flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        오류 발생
                     </p>
                     <p className="text-sm opacity-90">{message.text}</p>
                 </div>
            )}

            {/* Retry Button (Only for Error Messages) */}
            {message.isError && onRetry && (
                <div className="mt-3 pt-3 border-t border-red-200">
                    <button 
                        onClick={onRetry}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 transition-colors bg-white px-3 py-1.5 rounded-full border border-red-200 shadow-sm hover:bg-red-50"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {t.btnRetry}
                    </button>
                </div>
            )}
        </div>

        {/* Grounding Sources (Citations) */}
        {!isUser && message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-2 ml-4 bg-white/80 border border-gray-200 rounded-xl p-3 w-[95%] text-xs animate-fade-in-up backdrop-blur-sm shadow-sm">
                <p className="font-bold text-gray-500 mb-2 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    {t.groundingTitle}
                </p>
                <div className="flex flex-wrap gap-2">
                    {message.groundingSources.map((source, idx) => (
                        <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-blue-600 hover:text-blue-800 hover:border-blue-300 hover:bg-blue-50 transition-all truncate max-w-[200px]"
                        >
                            {source.title || new URL(source.uri).hostname}
                        </a>
                    ))}
                </div>
            </div>
        )}

        {/* Suggested Questions (Interactive Chips) */}
        {!isUser && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
            <div className="mt-4 ml-1 w-full animate-fade-in-up pl-2">
                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-[10px] uppercase tracking-wider">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    {t.suggestedLabel}
                </div>
                <div className="flex flex-wrap gap-2">
                    {message.suggestedQuestions.map((question, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSuggestionClick && onSuggestionClick(question)}
                            className="text-left px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all duration-200 active:scale-95"
                        >
                            {question}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatBubble);
