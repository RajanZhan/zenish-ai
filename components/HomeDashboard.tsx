
import React from 'react';
import { MOCK_USERS } from '../constants';

const HomeDashboard: React.FC = () => {
  // Mock data for charts and stats
  const stats = [
    { label: '活跃项目', value: '12', change: '+2', icon: 'fa-folder-open', color: 'indigo' },
    { label: '待我协作', value: '05', change: '-1', icon: 'fa-user-clock', color: 'amber' },
    { label: '团队完成率', value: '94%', change: '+4%', icon: 'fa-chart-line', color: 'emerald' },
    { label: '本周里程碑', value: '28', change: '+12', icon: 'fa-flag', color: 'rose' },
  ];

  const activities = [
    { user: MOCK_USERS[1], action: '提交了', target: 'Q4 销售报表', time: '10分钟前' },
    { user: MOCK_USERS[2], action: '完成了', target: '文案初稿撰写', time: '2小时前' },
    { user: MOCK_USERS[3], action: '开启了', target: '品牌周计划视觉设计', time: '5小时前' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50 p-8 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">工作台概览</h1>
          <p className="text-slate-500 font-medium mt-1">欢迎回来，这是您今天的协作实时看板。</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            下载报告
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
            <i className="fas fa-plus"></i> 发起新任务
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 text-xl border border-${s.color}-100`}>
                <i className={`fas ${s.icon}`}></i>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${s.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {s.change}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">团队协作效率趋势</h3>
            <select className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-500 p-2 outline-none">
              <option>过去 7 天</option>
              <option>过去 30 天</option>
            </select>
          </div>
          <div className="relative h-64 w-full">
            {/* Simple SVG Area Chart Representation */}
            <svg viewBox="0 0 800 200" className="w-full h-full">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path 
                d="M0,150 Q100,80 200,120 T400,60 T600,100 T800,40 L800,200 L0,200 Z" 
                fill="url(#grad)" 
              />
              <path 
                d="M0,150 Q100,80 200,120 T400,60 T600,100 T800,40" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="4" 
                strokeLinecap="round"
              />
              {/* Data points */}
              {[0, 200, 400, 600, 800].map((x, i) => (
                <circle key={i} cx={x} cy={i === 0 ? 150 : i === 1 ? 120 : i === 2 ? 60 : i === 3 ? 100 : 40} r="5" fill="white" stroke="#6366f1" strokeWidth="2" />
              ))}
            </svg>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span>
            </div>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-8">任务分配比例</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <svg viewBox="0 0 36 36" className="w-40 h-40">
              <path className="text-slate-100" strokeDasharray="100, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-indigo-500" strokeDasharray="60, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500" strokeDasharray="25, 100" strokeDashoffset="-60" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <p className="text-2xl font-black text-slate-800">85%</p>
              <p className="text-[10px] font-bold text-slate-400">总负荷</p>
            </div>
          </div>
          <div className="space-y-3 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-xs font-bold text-slate-600">正在执行</span></div>
              <span className="text-xs font-bold text-slate-800">60%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-xs font-bold text-slate-600">已成功</span></div>
              <span className="text-xs font-bold text-slate-800">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span className="text-xs font-bold text-slate-600">等待中</span></div>
              <span className="text-xs font-bold text-slate-800">15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">实时协作动态</h3>
            <button className="text-xs font-bold text-indigo-600 hover:underline">查看全部</button>
          </div>
          <div className="space-y-6">
            {activities.map((act, i) => (
              <div key={i} className="flex items-center gap-4">
                <img src={act.user.avatar} className="w-10 h-10 rounded-2xl border border-slate-100" alt="" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">
                    <span className="font-bold text-slate-800">{act.user.name}</span> {act.action} 
                    <span className="font-bold text-indigo-600 ml-1 cursor-pointer">#{act.target}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{act.time}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Highlights */}
        <div className="bg-indigo-900 p-8 rounded-[32px] text-white relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-lg font-bold mb-2">团队协作之星</h3>
            <p className="text-indigo-200 text-sm mb-6">本周贡献度最高的协作成员</p>
            <div className="flex -space-x-4 mb-8">
              {MOCK_USERS.map((u, i) => (
                <div key={i} className="w-14 h-14 rounded-2xl border-4 border-indigo-900 overflow-hidden shadow-xl transform hover:-translate-y-2 transition-transform cursor-pointer">
                  <img src={u.avatar} className="w-full h-full object-cover" alt={u.name} />
                </div>
              ))}
              <div className="w-14 h-14 rounded-2xl border-4 border-indigo-900 bg-indigo-700 flex items-center justify-center text-xs font-bold shadow-xl">
                +12
              </div>
            </div>
            <div className="mt-auto bg-indigo-800/50 p-4 rounded-2xl border border-indigo-700">
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">系统小贴士</p>
              <p className="text-sm leading-relaxed text-indigo-100 font-medium italic">“多方协作能显著提高复杂任务的容错率。”</p>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl group-hover:scale-110 transition-transform"></div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
