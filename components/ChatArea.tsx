
import React, { useRef, useEffect, useState } from 'react';
import { Message, Attachment, FileItem } from '../types';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  onActionClick: (value: string) => void;
  availableFiles: FileItem[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, onActionClick }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <i className="fas fa-brain text-lg"></i>
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-slate-800 tracking-tight text-lg leading-none">对话层 (Conversation)</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Intent Orchestrator</p>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 bg-slate-50/20 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.type === 'USER' ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`flex items-end gap-3 max-w-[85%]`}>
              {msg.type !== 'USER' && (
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mb-1 border border-indigo-100">
                  <i className="fas fa-robot text-[10px] text-indigo-400"></i>
                </div>
              )}
              <div className={`px-6 py-4 rounded-[32px] text-[13px] leading-relaxed shadow-sm font-medium ${
                msg.type === 'USER' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>

            <div className={`mt-3 flex items-center gap-2 ${msg.type === 'USER' ? 'pr-2' : 'pl-11'}`}>
              <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {(msg.type === 'AI' || msg.type === 'ACTION') && msg.actions && (
              <div className="mt-8 ml-11 p-8 bg-white rounded-[40px] border border-slate-100 w-full max-w-[400px] shadow-2xl shadow-slate-200/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">系统策略建议</p>
                </div>
                <div className="flex flex-col gap-3">
                  {msg.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => onActionClick(action.value)}
                      className={`w-full py-4 rounded-2xl text-xs font-black tracking-tight transition-all border shadow-lg ${
                        action.recommended 
                          ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-slate-200 active:scale-[0.98]' 
                          : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:border-slate-200 shadow-slate-100 active:scale-[0.98]'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="p-8 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative flex items-center group">
          <input
            type="text"
            className="w-full bg-slate-50 border border-transparent rounded-[24px] py-5 pl-8 pr-16 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 outline-none transition-all placeholder:text-slate-300 font-bold shadow-inner"
            placeholder="下达指令或做出决策..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-3 w-12 h-12 bg-indigo-600/20 text-indigo-600 rounded-[18px] hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center active:scale-90 disabled:opacity-30 disabled:grayscale"
          >
            <i className="fas fa-arrow-up text-xs"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
