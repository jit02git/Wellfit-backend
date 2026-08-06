import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../utils/api';

export default function ChatbotWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Hello ${user ? user.name : 'there'}! 👋 I am your Wellfit AI Assistant. Ask me anything about your booked sessions, wallet balance, or available slots!`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!user) return null;

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim()) return;

    // Add user message to local state
    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      // Package conversation history (excluding the current user message)
      const chatHistory = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          history: chatHistory,
        }),
      });

      setMessages((prev) => [...prev, { role: 'model', text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ Error: ${err.message || 'Could not communicate with Wellfit AI server.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const suggestions =
    user.role === 'member'
      ? [
          'What are my bookings?',
          'Any available slots?',
          'What is my wallet balance?',
        ]
      : ['Who has booked my slots?', 'Show my agenda'];

  // Helper to parse basic markdown (**bold**, bullet lists, and line breaks)
  const renderMessageContent = (text) => {
    if (!text) return '';
    // Format bold markdown (**text** to <strong>text</strong>)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return formatted.split('\n').map((line, idx) => {
      // Check if line is a bullet item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ')) {
        const bulletText = line.replace(/^[-*•]\s+/, '');
        return (
          <li key={idx} className="list-disc ml-4 my-1 text-slate-300">
            <span dangerouslySetInnerHTML={{ __html: bulletText }} />
          </li>
        );
      }
      return (
        <p key={idx} className="my-1.5 text-slate-300 min-h-[1em]" dangerouslySetInnerHTML={{ __html: line }} />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        >
          <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-12" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-slate-950 rounded-full animate-bounce"></span>
        </button>
      )}

      {/* Expanded Chat Widget */}
      {isOpen && (
        <div className="glass-panel border border-slate-800 rounded-2xl w-[380px] h-[520px] flex flex-col overflow-hidden shadow-2xl animate-fade-in relative">
          
          {/* Header */}
          <div className="bg-slate-950/80 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Wellfit AI Assistant
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </p>
                <p className="text-[10px] text-slate-400">Powered by Gemini 1.5 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/20 scrollbar-thin">
            {messages.map((msg, i) => {
              const isAI = msg.role === 'model';
              return (
                <div key={i} className={`flex items-start gap-2.5 ${!isAI ? 'justify-end' : ''}`}>
                  {isAI && (
                    <div className="w-7 h-7 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] shrink-0">
                      AI
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-xl px-3.5 py-2.5 text-sm ${
                    isAI 
                      ? 'bg-slate-900/60 text-slate-200 border border-slate-850' 
                      : 'bg-emerald-500 text-slate-950 font-medium'
                  }`}>
                    {isAI ? (
                      <div>{renderMessageContent(msg.text)}</div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  {!isAI && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase shrink-0">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                  )}
                </div>
              );
            })}
            
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] shrink-0">
                  AI
                </div>
                <div className="bg-slate-900/60 border border-slate-850 rounded-xl px-4 py-3 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="text-xs text-slate-400 font-medium animate-pulse">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 border-t border-slate-900/60 bg-slate-950/10 flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(s)}
                disabled={loading}
                className="text-[10px] font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-full transition-all disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your bookings..."
              disabled={loading}
              className="flex-1 bg-slate-900/60 border border-slate-800 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-60"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !message.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}
