
import React, { useState, useMemo } from 'react';
import { FeedPost, FeedMedia, User } from '../types';
import { CURRENT_USER, MOCK_USERS } from '../constants';

const FeedArea: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: 'p1',
      author: MOCK_USERS[1],
      content: '今日完成了 Q4 销售数据的深度复盘。整体呈现增长趋势，特别是在亚太市场。标签管理真的很有用，我把这个归类到了核心总结里。',
      timestamp: Date.now() - 3600000,
      tags: ['核心总结', '数据复盘', '亚太市场'],
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&w=800' },
        { type: 'file', url: '#', name: 'Q4_APAC_Analysis.pdf' }
      ],
      likes: 12,
      comments: 3
    },
    {
      id: 'p2',
      author: MOCK_USERS[2],
      content: '最近在阅读《增长黑客》，结合我们的协作流，我认为可以引入更多的自动化节点。这属于我的个人成长总结。',
      timestamp: Date.now() - 86400000,
      tags: ['成长总结', '读书笔记', '自动化'],
      media: [
        { type: 'video', url: '#', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800' }
      ],
      likes: 24,
      comments: 8
    }
  ]);

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter(p => p.tags.includes(activeTag));
  }, [posts, activeTag]);

  const handlePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: FeedPost = {
      id: 'p' + Date.now(),
      author: CURRENT_USER,
      content: newPostContent,
      timestamp: Date.now(),
      tags: selectedTags,
      media: [],
      likes: 0,
      comments: 0
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setSelectedTags([]);
    setIsComposerOpen(false);
  };

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="h-full flex bg-slate-50/50 relative overflow-hidden">
      {/* Main Feed Column */}
      <div className="flex-1 h-full overflow-y-auto p-8 space-y-6 pb-24">
        {/* Filter Info */}
        {activeTag && (
          <div className="flex items-center justify-between px-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <h2 className="text-sm font-bold text-slate-500 flex items-center gap-2">
              正在查看 <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">#{activeTag}</span> 的内容
            </h2>
            <button onClick={() => setActiveTag(null)} className="text-xs font-bold text-indigo-600 hover:underline">清除筛选</button>
          </div>
        )}

        {/* Post List */}
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={post.author.avatar} className="w-10 h-10 rounded-2xl border border-slate-50" alt="" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{post.author.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {new Date(post.timestamp).toLocaleString()} · {post.author.role}
                    </p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-500 transition-colors"><i className="fas fa-ellipsis-h"></i></button>
              </div>

              <div className="pl-[52px] space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                
                {/* Media Display */}
                {post.media.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 max-w-xl">
                    {post.media.map((m, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden border border-slate-50 bg-slate-50">
                        {m.type === 'image' && <img src={m.url} className="w-full h-auto max-h-[400px] object-cover" alt="" />}
                        {m.type === 'video' && (
                          <div className="relative aspect-video flex items-center justify-center group cursor-pointer">
                            <img src={m.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-indigo-600 shadow-xl group-hover:scale-110 transition-transform">
                              <i className="fas fa-play ml-1"></i>
                            </div>
                          </div>
                        )}
                        {m.type === 'file' && (
                          <div className="p-4 flex items-center gap-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                              <i className="fas fa-file-pdf"></i>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-700">{m.name}</p>
                              <p className="text-[10px] text-slate-400">PDF Document · 2.4 MB</p>
                            </div>
                            <i className="fas fa-download text-slate-300 group-hover:text-indigo-500 transition-colors"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-2">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors">
                    <i className="far fa-heart"></i>
                    <span className="text-xs font-bold">{post.likes || '点赞'}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors">
                    <i className="far fa-comment"></i>
                    <span className="text-xs font-bold">{post.comments || '评论'}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <i className="far fa-share-square"></i>
                    <span className="text-xs font-bold">转发</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="absolute bottom-8 right-88 z-30 group">
        <button 
          onClick={() => setIsComposerOpen(true)}
          className="w-16 h-16 bg-indigo-600 text-white rounded-[24px] shadow-2xl shadow-indigo-300 flex items-center justify-center text-xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
        >
          <i className="fas fa-pen-nib"></i>
        </button>
        <span className="absolute right-20 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          发布新动态
        </span>
      </div>

      {/* Composer Modal Overlay */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsComposerOpen(false)}></div>
          
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-slate-100">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={CURRENT_USER.avatar} className="w-12 h-12 rounded-2xl border-2 border-indigo-50" alt="" />
                  <div>
                    <h3 className="font-bold text-slate-800">发布动态</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">正在作为 {CURRENT_USER.role} 发布</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsComposerOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="space-y-4">
                <textarea 
                  autoFocus
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="分享你的工作动态、知识总结或成长心得..."
                  className="w-full bg-slate-50/50 rounded-[32px] p-6 text-base outline-none border border-slate-100 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 min-h-[200px] resize-none placeholder:text-slate-400 font-medium transition-all"
                />
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center mr-2">推荐标签:</span>
                    {['核心总结', '成长记录', '技术分享', '会议纪要', '灵感碎片'].map(t => (
                      <button 
                        key={t}
                        onClick={() => toggleTagSelection(t)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                          selectedTags.includes(t) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-300'
                        }`}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>

                  <div className="h-[1px] bg-slate-100 w-full"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="w-12 h-12 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-slate-100" title="上传图片"><i className="fas fa-image"></i></button>
                      <button className="w-12 h-12 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-slate-100" title="上传视频"><i className="fas fa-video"></i></button>
                      <button className="w-12 h-12 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-slate-100" title="添加附件"><i className="fas fa-paperclip"></i></button>
                    </div>
                    
                    <button 
                      onClick={handlePost}
                      disabled={!newPostContent.trim()}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-3"
                    >
                      <span>发布动态</span>
                      <i className="fas fa-paper-plane text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Modal Bottom Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          </div>
        </div>
      )}

      {/* Right Sidebar - Tag Management & Groups */}
      <div className="w-80 h-full border-l border-slate-200 bg-white p-8 overflow-y-auto shrink-0 relative z-20">
        <h3 className="text-lg font-bold text-slate-800 mb-6">标签与知识分组</h3>
        
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">知识概览</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xl font-black text-indigo-600">{posts.length}</p>
                <p className="text-[10px] font-bold text-indigo-300">本月动态</p>
              </div>
              <div>
                <p className="text-xl font-black text-indigo-600">{allTags.length}</p>
                <p className="text-[10px] font-bold text-indigo-300">活跃标签</p>
              </div>
            </div>
          </div>

          {/* Core Categories */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">核心分组</h4>
            <div className="space-y-2">
              {[
                { name: '核心总结', icon: 'fa-star', color: 'text-amber-500 bg-amber-50' },
                { name: '成长记录', icon: 'fa-seedling', color: 'text-emerald-500 bg-emerald-50' },
                { name: '技术分享', icon: 'fa-code', color: 'text-indigo-500 bg-indigo-50' },
                { name: '日常碎片', icon: 'fa-coffee', color: 'text-slate-500 bg-slate-50' }
              ].map(cat => (
                <button 
                  key={cat.name}
                  onClick={() => setActiveTag(cat.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all hover:border-indigo-200 group ${
                    activeTag === cat.name ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${cat.color}`}>
                      <i className={`fas ${cat.icon}`}></i>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                  </div>
                  <i className="fas fa-chevron-right text-[8px] text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tag Cloud */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">热门标签云</h4>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                    activeTag === tag 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Group Invitation */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden mt-8 shadow-xl shadow-slate-200/50 group cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="relative z-10">
              <h4 className="text-sm font-bold mb-2">创建一个私有小组？</h4>
              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">为你的特定团队或兴趣话题建立专属的动态聚合流。</p>
              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                立即创建
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedArea;
