
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Message, Attachment, FileItem, FileType } from '../types';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  onActionClick: (value: string) => void;
  availableFiles: FileItem[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, onActionClick, availableFiles }) => {
  const [input, setInput] = useState('');
  const [stagedAttachments, setStagedAttachments] = useState<Attachment[]>([]);
  const [showCloudPicker, setShowCloudPicker] = useState(false);
  const [cloudSearch, setCloudSearch] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Close cloud picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cloudPickerRef.current && !cloudPickerRef.current.contains(e.target as Node)) {
        setShowCloudPicker(false);
      }
    };
    if (showCloudPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCloudPicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && stagedAttachments.length === 0) return;
    onSendMessage(input, stagedAttachments);
    setInput('');
    setStagedAttachments([]);
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map(f => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type,
      isCloud: false
    }));

    setStagedAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addCloudFile = (file: FileItem) => {
    if (stagedAttachments.some(a => a.id === file.id)) return;
    
    const newAttachment: Attachment = {
      id: file.id,
      name: file.name,
      url: '#', // Placeholder for internal reference
      type: file.type,
      isCloud: true
    };
    
    // Fix: Remove spread operator from newAttachment as it is a single object, not an array
    setStagedAttachments(prev => [...prev, newAttachment]);
    setShowCloudPicker(false);
    setCloudSearch('');
  };

  const removeAttachment = (index: number) => {
    setStagedAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string | FileType) => {
    if (type.includes('image')) return 'fa-file-image text-purple-500';
    if (type.includes('pdf')) return 'fa-file-pdf text-red-500';
    if (type === 'SHEET') return 'fa-file-excel text-emerald-500';
    if (type === 'DOC') return 'fa-file-word text-blue-500';
    return 'fa-file-alt text-slate-400';
  };

  const filteredCloudFiles = useMemo(() => {
    return availableFiles.filter(f => 
      f.type !== 'FOLDER' && 
      f.name.toLowerCase().includes(cloudSearch.toLowerCase())
    );
  }, [availableFiles, cloudSearch]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full shrink-0 relative">
      {/* Header */}
      <div className="py-3 px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
            <i className="fas fa-brain text-xs"></i>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800 tracking-tight text-sm leading-none flex items-center gap-2">
              对话层
              <span className="text-[10px] text-slate-400 font-medium">Conversation</span>
            </h2>
            <p className="text-[8px] font-black text-indigo-500/60 uppercase tracking-widest mt-0.5">Intent Orchestrator</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Active</span>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/20 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.type === 'USER' ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`flex items-end gap-3 max-w-[85%]`}>
              {msg.type !== 'USER' && (
                <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mb-1 border border-indigo-100">
                  <i className="fas fa-robot text-[9px] text-indigo-400"></i>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className={`px-5 py-3 rounded-[24px] text-[13px] leading-relaxed shadow-sm font-medium ${
                  msg.type === 'USER' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${msg.type === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    {msg.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm text-[11px] font-bold text-slate-600">
                        <i className={`fas ${getFileIcon(att.type)}`}></i>
                        <span className="truncate max-w-[120px]">{att.name}</span>
                        {att.isCloud && <i className="fas fa-cloud text-[9px] text-indigo-400" title="Cloud Reference"></i>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={`mt-2 flex items-center gap-2 ${msg.type === 'USER' ? 'pr-2' : 'pl-10'}`}>
              <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {(msg.type === 'AI' || msg.type === 'ACTION') && msg.actions && (
              <div className="mt-6 ml-10 p-6 bg-white rounded-[32px] border border-slate-100 w-full max-w-[360px] shadow-xl shadow-slate-200/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">系统策略建议</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {msg.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => onActionClick(action.value)}
                      className={`w-full py-3 rounded-xl text-[11px] font-black tracking-tight transition-all border shadow-md ${
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
      <div className="px-5 py-5 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Staged Attachments Bar */}
          {stagedAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1 animate-in slide-in-from-bottom-2 duration-200">
              {stagedAttachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] font-bold text-indigo-600 animate-in zoom-in-90 duration-200">
                  <i className={`fas ${getFileIcon(att.type)}`}></i>
                  <span className="truncate max-w-[150px]">{att.name}</span>
                  {att.isCloud && <i className="fas fa-cloud text-[9px] opacity-60"></i>}
                  <button 
                    onClick={() => removeAttachment(i)}
                    className="ml-1 w-4 h-4 rounded-full hover:bg-indigo-200 flex items-center justify-center transition-colors"
                  >
                    <i className="fas fa-times text-[8px]"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Toolbar & Input Field */}
          <form onSubmit={handleSubmit} className="relative flex flex-col gap-3 group">
            {/* Cloud File Picker Overlay */}
            {showCloudPicker && (
              <div ref={cloudPickerRef} className="absolute bottom-full left-0 mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60] animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-3 bg-slate-50 border-b border-slate-100">
                  <div className="relative">
                    <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                    <input 
                      type="text" 
                      placeholder="搜索云端文档..."
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-7 pr-3 text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                      value={cloudSearch}
                      onChange={e => setCloudSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto p-2 no-scrollbar">
                  {filteredCloudFiles.length > 0 ? filteredCloudFiles.map(file => (
                    <button 
                      key={file.id}
                      type="button"
                      onClick={() => addCloudFile(file)}
                      className="w-full flex items-center gap-3 p-2.5 hover:bg-indigo-50 rounded-xl transition-all text-left group/file"
                    >
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm group-hover/file:border-indigo-200">
                        <i className={`fas ${getFileIcon(file.type)} text-[10px]`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">Cloud · {file.size}</p>
                      </div>
                    </button>
                  )) : (
                    <div className="py-8 text-center text-slate-300">
                      <i className="fas fa-folder-open text-lg mb-2 block"></i>
                      <p className="text-[10px] font-bold uppercase">无匹配文档</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1 shadow-inner focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:bg-white focus-within:border-indigo-100 transition-all">
              {/* Toolbar */}
              <div className="flex items-center gap-1 pl-1">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                  title="上传本地附件"
                >
                  <i className="fas fa-paperclip text-sm"></i>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCloudPicker(!showCloudPicker)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${showCloudPicker ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-white'}`}
                  title="引用云端文档"
                >
                  <i className="fas fa-cloud text-sm"></i>
                </button>
              </div>

              {/* Main Input */}
              <input
                type="text"
                className="flex-1 bg-transparent border-none py-3 px-2 text-[13px] outline-none placeholder:text-slate-300 font-bold"
                placeholder="下达指令、分析文件或做出决策..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button 
                type="submit" 
                disabled={!input.trim() && stagedAttachments.length === 0}
                className="w-10 h-10 bg-indigo-600 text-white rounded-[14px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center active:scale-90 disabled:opacity-30 disabled:grayscale shrink-0 mr-1"
              >
                <i className="fas fa-arrow-up text-[10px]"></i>
              </button>
            </div>
            
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleLocalFileChange}
            />
          </form>
          <div className="flex items-center justify-between px-2">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              Shift + Enter 换行 · 支持文件直接拖拽
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-slate-400">Context: <span className="text-indigo-500 font-black">All Project Docs</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
