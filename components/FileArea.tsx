
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FileItem, FileType, User } from '../types';
import { CURRENT_USER, MOCK_USERS } from '../constants';

interface FileAreaProps {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

const FileArea: React.FC<FileAreaProps> = ({ files, setFiles }) => {
  const [filterType, setFilterType] = useState<FileType | 'ALL' | 'STARRED' | 'CLOUD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Drag and Drop States
  const [draggedGroup, setDraggedGroup] = useState<string[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropMode, setDropMode] = useState<'MOVE' | 'REORDER' | null>(null);
  
  // Refs
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);

  // Close new menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };

    if (isNewMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNewMenuOpen]);

  // Helper to get breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = files.find(f => f.id === currentId);
      if (folder) {
        crumbs.unshift(folder);
        currentId = folder.parentId || null;
      } else {
        break;
      }
    }
    return crumbs;
  }, [files, currentFolderId]);

  const filteredFiles = useMemo(() => {
    let result = files;

    if (searchQuery) {
      result = result.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      result = result.filter(f => (f.parentId || null) === currentFolderId);
    }

    if (filterType !== 'ALL') {
      if (filterType === 'STARRED') result = result.filter(f => f.isStarred);
      else if (filterType === 'CLOUD') result = result.filter(f => f.isCloud);
      else result = result.filter(f => f.type === filterType);
    }

    return result.sort((a, b) => {
      if (a.type === 'FOLDER' && b.type !== 'FOLDER') return -1;
      if (a.type !== 'FOLDER' && b.type === 'FOLDER') return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [files, filterType, searchQuery, currentFolderId]);

  // Handle Item Click for Selection and Navigation
  const handleItemClick = (e: React.MouseEvent, id: string, isFolder: boolean) => {
    e.stopPropagation();
    const isModifierPressed = e.ctrlKey || e.metaKey;

    if (isModifierPressed) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      if (isFolder && selectedIds.size <= 1) {
        setCurrentFolderId(id);
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set([id]));
      }
    }
  };

  // Drag and Drop Handlers
  const onDragStart = (id: string) => {
    if (selectedIds.has(id)) {
      setDraggedGroup([...selectedIds]);
    } else {
      setDraggedGroup([id]);
      setSelectedIds(new Set([id]));
    }
  };

  const onDragEnd = () => {
    setDraggedGroup([]);
    setDragOverId(null);
    setDropMode(null);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const onDragOver = (e: React.DragEvent, targetId: string, targetType: FileType) => {
    e.preventDefault();
    if (draggedGroup.includes(targetId)) return;

    setDragOverId(targetId);
    if (targetType === 'FOLDER') {
      setDropMode('MOVE');
    } else {
      setDropMode('REORDER');
    }
  };

  const onDragLeave = () => {
    setDragOverId(null);
    setDropMode(null);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedGroup.length === 0 || draggedGroup.includes(targetId)) return;

    const targetFile = files.find(f => f.id === targetId);
    if (!targetFile) return;

    setFiles(prev => {
      const newFiles = [...prev];
      if (targetFile.type === 'FOLDER') {
        // MOVE mode: Update parentId for all dragged items
        return newFiles.map(f => 
          draggedGroup.includes(f.id) ? { ...f, parentId: targetFile.id } : f
        );
      } else {
        // REORDER mode: (Simplified for group: Move them all to target position)
        const itemsToMove = newFiles.filter(f => draggedGroup.includes(f.id));
        const remainingItems = newFiles.filter(f => !draggedGroup.includes(f.id));
        const targetIdx = remainingItems.findIndex(f => f.id === targetId);
        remainingItems.splice(targetIdx, 0, ...itemsToMove);
        return remainingItems;
      }
    });

    onDragEnd();
    setSelectedIds(new Set());
  };

  // Back Button Drag Handlers
  const handleDragOverBack = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragOverId !== 'BACK_BUTTON') {
      setDragOverId('BACK_BUTTON');
      if (!hoverTimerRef.current && currentFolderId) {
        hoverTimerRef.current = setTimeout(() => {
          const parent = files.find(f => f.id === currentFolderId)?.parentId || null;
          setCurrentFolderId(parent);
          hoverTimerRef.current = null;
          setDragOverId(null);
        }, 1000);
      }
    }
  };

  const handleDragLeaveBack = () => {
    setDragOverId(null);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleDropBack = (e: React.DragEvent) => {
    e.preventDefault();
    handleDragLeaveBack();
    if (draggedGroup.length === 0 || !currentFolderId) return;

    const parentId = files.find(f => f.id === currentFolderId)?.parentId || null;
    setFiles(prev => prev.map(f => 
      draggedGroup.includes(f.id) ? { ...f, parentId: parentId || undefined } : f
    ));
    onDragEnd();
    setSelectedIds(new Set());
  };

  // Batch Actions
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`确认删除这 ${selectedIds.size} 个项目吗？`)) {
      setFiles(prev => prev.filter(f => !selectedIds.has(f.id)));
      setSelectedIds(new Set());
    }
  };

  const handleCopySelected = () => {
    if (selectedIds.size === 0) return;
    const itemsToCopy = files.filter(f => selectedIds.has(f.id));
    const copies = itemsToCopy.map(f => ({
      ...f,
      id: f.id + '_copy_' + Date.now(),
      name: f.name + ' (复件)',
      updatedAt: Date.now()
    }));
    setFiles(prev => [...prev, ...copies]);
    setSelectedIds(new Set());
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleCreateFolder = () => {
    const folderName = prompt('请输入文件夹名称', '新建文件夹');
    if (folderName) {
      const newFolder: FileItem = {
        id: 'dir' + Date.now(),
        name: folderName,
        type: 'FOLDER',
        size: '--',
        owner: CURRENT_USER,
        updatedAt: Date.now(),
        isCloud: false,
        isStarred: false,
        parentId: currentFolderId || undefined
      };
      setFiles([newFolder, ...files]);
    }
    setIsNewMenuOpen(false);
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'FOLDER': return { icon: 'fa-folder', color: 'text-amber-500 bg-amber-50' };
      case 'DOC': return { icon: 'fa-file-word', color: 'text-blue-500 bg-blue-50' };
      case 'SHEET': return { icon: 'fa-file-excel', color: 'text-emerald-500 bg-emerald-50' };
      case 'SLIDE': return { icon: 'fa-file-powerpoint', color: 'text-orange-500 bg-orange-50' };
      case 'IMAGE': return { icon: 'fa-file-image', color: 'text-purple-500 bg-purple-50' };
      case 'VIDEO': return { icon: 'fa-file-video', color: 'text-rose-500 bg-rose-50' };
      case 'AUDIO': return { icon: 'fa-file-audio', color: 'text-indigo-500 bg-indigo-50' };
      case 'PDF': return { icon: 'fa-file-pdf', color: 'text-red-500 bg-red-50' };
      case 'ARCHIVE': return { icon: 'fa-file-zipper', color: 'text-slate-500 bg-slate-50' };
      default: return { icon: 'fa-file', color: 'text-slate-400 bg-slate-50' };
    }
  };

  return (
    <div className="h-full flex bg-slate-50/50 relative" onClick={() => setSelectedIds(new Set())}>
      {/* Sidebar */}
      <div className="w-72 h-full bg-white border-r border-slate-200 p-6 flex flex-col shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="mb-8 relative" ref={newMenuRef}>
          <button 
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <i className={`fas ${isNewMenuOpen ? 'fa-times' : 'fa-plus'} transition-transform ${isNewMenuOpen ? 'rotate-90' : 'group-hover:rotate-90'}`}></i>
            {isNewMenuOpen ? '关闭菜单' : '新建或上传'}
          </button>

          {isNewMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button 
                onClick={handleCreateFolder}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center text-xs group-hover:bg-amber-100">
                  <i className="fas fa-folder-plus"></i>
                </div>
                <span className="text-xs font-bold text-slate-700">新建文件夹</span>
              </button>
              <button 
                onClick={() => setIsNewMenuOpen(false)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-xs group-hover:bg-blue-100">
                  <i className="fas fa-file-circle-plus"></i>
                </div>
                <span className="text-xs font-bold text-slate-700">新建云文档</span>
              </button>
              <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>
              <button 
                onClick={() => setIsNewMenuOpen(false)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center text-xs group-hover:bg-slate-100">
                  <i className="fas fa-upload"></i>
                </div>
                <span className="text-xs font-bold text-slate-700">上传本地文件</span>
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto pr-2 no-scrollbar">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">概览</h4>
            <div className="space-y-1">
              {[
                { id: 'ALL', name: '全部文件', icon: 'fa-layer-group' },
                { id: 'STARRED', name: '已星标', icon: 'fa-star' },
                { id: 'CLOUD', name: '云文档', icon: 'fa-cloud' },
                { id: 'FOLDER', name: '文件夹', icon: 'fa-folder-open' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setFilterType(item.id as any); setCurrentFolderId(null); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    filterType === item.id && !currentFolderId ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <i className={`fas ${item.icon} w-5`}></i>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">文档库</h4>
            <div className="space-y-1">
              {files.filter(f => f.type === 'FOLDER').map(folder => (
                <button
                  key={folder.id}
                  onClick={() => { setCurrentFolderId(folder.id); setFilterType('ALL'); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all truncate ${
                    currentFolderId === folder.id ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <i className="fas fa-folder text-[10px] opacity-40"></i>
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-3xl p-5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-3">
              <span>存储空间</span>
              <span>75%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-3/4 rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">15.2 GB / 20 GB</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-96 group">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-indigo-500 transition-colors"></i>
              <input
                type="text"
                placeholder="搜索文档、文件夹、媒体..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Breadcrumbs */}
            {!searchQuery && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <button 
                  onClick={() => { setCurrentFolderId(null); setSelectedIds(new Set()); }}
                  className={`hover:text-indigo-600 transition-colors ${!currentFolderId ? 'text-indigo-600' : ''}`}
                >
                  根目录
                </button>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.id}>
                    <i className="fas fa-chevron-right text-[8px] opacity-30"></i>
                    <button 
                      onClick={() => { setCurrentFolderId(crumb.id); setSelectedIds(new Set()); }}
                      className={`hover:text-indigo-600 transition-colors ${idx === breadcrumbs.length - 1 ? 'text-indigo-600' : ''}`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              <i className="fas fa-sort-amount-down"></i>
            </button>
          </div>
        </div>

        {/* File Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar relative" onClick={() => setSelectedIds(new Set())}>
          {currentFolderId && !searchQuery && (
            <button 
              onClick={() => {
                const parent = files.find(f => f.id === currentFolderId)?.parentId || null;
                setCurrentFolderId(parent);
                setSelectedIds(new Set());
              }}
              onDragOver={handleDragOverBack}
              onDragLeave={handleDragLeaveBack}
              onDrop={handleDropBack}
              className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-all text-xs font-bold w-fit border
                ${dragOverId === 'BACK_BUTTON' ? 'bg-indigo-100 text-indigo-700 border-indigo-300 ring-4 ring-indigo-500/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-transparent'}
              `}
            >
              <i className="fas fa-level-up-alt"></i> 返回上一级
            </button>
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
              {filteredFiles.map(file => {
                const { icon, color } = getFileIcon(file.type);
                const isFolder = file.type === 'FOLDER';
                const isDragged = draggedGroup.includes(file.id);
                const isDragOver = dragOverId === file.id;
                const isSelected = selectedIds.has(file.id);

                return (
                  <div 
                    key={file.id} 
                    draggable
                    onDragStart={() => onDragStart(file.id)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => onDragOver(e, file.id, file.type)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, file.id)}
                    onClick={(e) => handleItemClick(e, file.id, isFolder)}
                    className={`group bg-white p-4 rounded-3xl border transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-300 relative
                      ${isDragged ? 'opacity-30 scale-95 grayscale' : 'opacity-100'}
                      ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-indigo-50/20' : 'border-slate-100 shadow-sm'}
                      ${isDragOver && dropMode === 'MOVE' ? 'border-indigo-600 border-2 ring-8 ring-indigo-500/5 translate-y-[-2px]' : 'hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5'}
                    `}
                  >
                    {isDragOver && dropMode === 'REORDER' && (
                      <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-indigo-500 rounded-full z-10 animate-pulse"></div>
                    )}

                    <div className={`aspect-video mb-3 rounded-2xl overflow-hidden relative border border-slate-50 flex items-center justify-center ${isFolder ? 'bg-amber-50/40' : 'bg-slate-50'}`}>
                      {file.thumbnail ? (
                        <img src={file.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                          <i className={`fas ${icon}`}></i>
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur shadow-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 active:scale-90 transition-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fas fa-ellipsis-h text-[10px]"></i>
                        </button>
                      </div>

                      {file.isCloud && !isFolder && (
                        <div className="absolute top-2 left-2 bg-indigo-600/90 backdrop-blur text-white px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200/50">
                          Cloud
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between min-w-0">
                        <h4 className={`text-xs font-black text-slate-800 truncate pr-2 ${isFolder ? 'text-amber-800' : ''}`}>{file.name}</h4>
                        <button 
                          className={`${file.isStarred ? 'text-amber-400' : 'text-slate-200 hover:text-amber-400'} transition-colors shrink-0`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isStarred: !f.isStarred } : f));
                          }}
                        >
                          <i className="fas fa-star text-[9px]"></i>
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                        <span className="truncate mr-1">{isFolder ? '文件夹' : file.size}</span>
                        <span className="shrink-0">{new Date(file.updatedAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">名称</th>
                    <th className="px-6 py-3">大小</th>
                    <th className="px-6 py-3">所有者</th>
                    <th className="px-6 py-3">更新时间</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map(file => {
                    const { icon, color } = getFileIcon(file.type);
                    const isFolder = file.type === 'FOLDER';
                    const isDragged = draggedGroup.includes(file.id);
                    const isDragOver = dragOverId === file.id;
                    const isSelected = selectedIds.has(file.id);

                    return (
                      <tr 
                        key={file.id}
                        draggable
                        onDragStart={() => onDragStart(file.id)}
                        onDragEnd={onDragEnd}
                        onDragOver={(e) => onDragOver(e, file.id, file.type)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, file.id)}
                        onClick={(e) => handleItemClick(e, file.id, isFolder)}
                        className={`transition-all group cursor-pointer
                          ${isDragged ? 'opacity-30 bg-slate-50 grayscale' : ''}
                          ${isSelected ? 'bg-indigo-50/50 ring-inset ring-2 ring-indigo-500' : 'hover:bg-slate-50/50'}
                          ${isDragOver && dropMode === 'MOVE' ? 'bg-indigo-100 ring-2 ring-inset ring-indigo-600' : ''}
                        `}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${color} shadow-sm group-hover:scale-105 transition-transform`}>
                              <i className={`fas ${icon}`}></i>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`font-bold text-slate-800 text-xs truncate ${isFolder ? 'text-amber-700' : ''}`}>{file.name}</span>
                              {file.isCloud && !isFolder && <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">云端</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-500 font-bold text-[10px]">{file.size}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <img src={file.owner.avatar} className="w-5 h-5 rounded-full border border-slate-100 shadow-sm" alt="" />
                            <span className="text-slate-600 font-bold text-[10px]">{file.owner.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-400 font-bold text-[10px]">{new Date(file.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-indigo-600 text-slate-400 shadow-sm transition-all"><i className="fas fa-download text-[10px]"></i></button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-indigo-600 text-slate-400 shadow-sm transition-all"><i className="fas fa-share-alt text-[10px]"></i></button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 hover:text-rose-500 text-slate-400 shadow-sm transition-all" onClick={(e) => { e.stopPropagation(); setSelectedIds(new Set([file.id])); handleDeleteSelected(); }}><i className="fas fa-trash-alt text-[10px]"></i></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 opacity-30">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                <i className="fas fa-folder-open text-3xl"></i>
              </div>
              <p className="text-xl font-black uppercase tracking-tighter">目录为空</p>
              <p className="text-xs font-bold mt-2">点击左上角按钮开始创建或上传协作文件</p>
            </div>
          )}
        </div>

        {/* Floating Selection Toolbar */}
        {selectedIds.size > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 z-50 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center gap-3 border-r border-slate-700 pr-8">
              <span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black">{selectedIds.size}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">项目已选中</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleCopySelected}
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-2xl transition-all text-xs font-bold"
              >
                <i className="far fa-copy"></i> 复制
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-2xl transition-all text-xs font-bold"
                onClick={() => alert('请拖动项目到目标文件夹进行移动')}
              >
                <i className="far fa-folder-open"></i> 移动
              </button>
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 py-2 hover:bg-rose-500 hover:text-white rounded-2xl transition-all text-xs font-bold"
              >
                <i className="far fa-trash-alt"></i> 删除
              </button>
            </div>

            <div className="h-6 w-[1px] bg-slate-700"></div>

            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileArea;
