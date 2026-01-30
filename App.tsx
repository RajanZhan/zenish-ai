
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Task, Message, TaskStatus, StepStatus, MessageType, User, Attachment, FileItem } from './types';
import { INITIAL_TASKS, INITIAL_FILES, WELCOME_MESSAGE, CURRENT_USER, MOCK_USERS } from './constants';
import ChatArea from './components/ChatArea';
import TaskDrawer from './components/TaskDrawer';
import HomeDashboard from './components/HomeDashboard';
import FeedArea from './components/FeedArea';
import FileArea from './components/FileArea';
import TodoArea from './components/TodoArea';
import OrgArea from './components/OrgArea';
import { chatWithGemini } from './services/geminiService';

const Header: React.FC = () => (
  <header className="h-[72px] bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-50">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
          <i className="fas fa-bolt text-lg"></i>
        </div>
        <div className="h-8 w-[1px] bg-slate-100 mx-4"></div>
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="text-slate-400">团队项目</span>
          <i className="fas fa-chevron-right text-[10px] text-slate-300"></i>
          <span className="text-slate-800">任务编排</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-8">
      <div className="relative">
        <i className="far fa-bell text-slate-400 text-xl cursor-pointer hover:text-indigo-600 transition-colors"></i>
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
        <div className="text-right">
          <p className="text-sm font-black text-slate-800 leading-none">{CURRENT_USER.name}</p>
          <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{CURRENT_USER.role}</p>
        </div>
        <div className="w-11 h-11 bg-slate-100 rounded-2xl overflow-hidden border border-slate-50 shadow-sm">
          <img src={CURRENT_USER.avatar} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </header>
);

const Sidebar: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => (
  <div className="w-[84px] h-full bg-slate-900 flex flex-col items-center py-8 shrink-0 z-40">
    <div className="flex-1 flex flex-col gap-6">
      {[
        { id: 'home', icon: 'fa-house', label: '工作台' },
        { id: 'chat', icon: 'fa-message', label: '任务协作' },
        { id: 'feed', icon: 'fa-hashtag', label: '工作动态' },
        { id: 'todo', icon: 'fa-clipboard-check', label: '我的待办' },
        { id: 'files', icon: 'fa-folder-tree', label: '文件管理' },
        { id: 'org', icon: 'fa-sitemap', label: '组织管理' },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`group w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative ${
            activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <i className={`fas ${item.icon} text-xl`}></i>
          <span className="absolute left-20 bg-slate-800 text-white text-[11px] px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-black border border-slate-700 shadow-2xl">
            {item.label}
          </span>
          {activeTab === item.id && <div className="absolute -left-2 w-2 h-8 bg-indigo-500 rounded-r-full shadow-[4px_0_12px_rgba(99,102,241,0.5)]"></div>}
        </button>
      ))}
    </div>
    <div className="mt-auto flex flex-col gap-6">
      <button className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-colors">
        <i className="fas fa-plus text-lg"></i>
      </button>
      <button className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-colors">
        <i className="fas fa-gear text-lg"></i>
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeTaskId, setActiveTaskId] = useState<string>(INITIAL_TASKS[0].id);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'm1', 
      text: WELCOME_MESSAGE, 
      type: 'AI', 
      timestamp: Date.now(),
      actions: [
        { label: '新建并行任务', value: 'parallel_new', recommended: true },
        { label: '查看当前任务进度', value: 'check_progress' }
      ]
    }
  ]);

  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  
  // Resizing state
  const [sidebarWidth, setSidebarWidth] = useState(520);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      // Sidebar width = mouse position - far left sidebar width (84px)
      const newWidth = e.clientX - 84;
      if (newWidth >= 380 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const addMessage = useCallback((text: string, type: MessageType, actions?: any[]) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      text, type, timestamp: Date.now(), actions
    }]);
  }, []);

  const handleSendMessage = async (text: string) => {
    addMessage(text, 'USER');
    const response = await chatWithGemini(text);
    addMessage(response || "正在调度资源，请稍候...", 'AI', [
      { label: '并行新建任务 (推荐)', value: 'parallel_new', recommended: true },
      { label: '等待当前任务完成', value: 'wait_current' }
    ]);
  };

  const handleActionClick = (value: string) => {
    if (value === 'parallel_new') {
      const newTask: Task = {
        id: 't' + Date.now(),
        name: '未命名实时协作',
        description: '由对话层发起的动态任务。',
        status: TaskStatus.RUNNING,
        initiator: CURRENT_USER,
        steps: [
          { 
            id: 's' + Date.now(), 
            name: '任务节点初始化', 
            status: StepStatus.NEED_CONFIRM, 
            uiIntent: 'FORM' as any,
            uiSchema: {
              title: '补全初步任务详情',
              fields: [
                { key: 'target', label: '目标描述', type: 'text', required: true },
                { key: 'deadline', label: '截止时间', type: 'text' }
              ],
              actions: [{ type: 'SUBMIT', label: '创建任务' }]
            }
          }
        ]
      };
      setTasks(prev => [...prev, newTask]);
      setActiveTaskId(newTask.id);
      addMessage("已在右侧任务抽屉启动新任务执行流。", 'AI');
    }
  };

  const handleStepAction = (taskId: string, stepId: string, data: any) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        steps: task.steps.map(step => step.id === stepId ? { ...step, status: StepStatus.SUCCEEDED } : step)
      };
    }));
    addMessage(`节点 [${tasks.find(t=>t.id===taskId)?.steps.find(s=>s.id===stepId)?.name}] 已在执行层处理。`, 'AI');
  };

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden bg-white font-sans antialiased text-slate-900 ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' ? (
            <div className="flex h-full animate-in fade-in duration-300">
              {/* Conversation Layer */}
              <div 
                className="shrink-0 h-full relative" 
                style={{ width: `${sidebarWidth}px` }}
              >
                <ChatArea 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                  onActionClick={handleActionClick}
                  availableFiles={files}
                />
                
                {/* Resizer Handle */}
                <div
                  onMouseDown={startResizing}
                  className={`absolute top-0 -right-0.5 w-1 h-full cursor-col-resize z-50 transition-colors group flex items-center justify-center ${isResizing ? 'bg-indigo-500' : 'hover:bg-indigo-400/30'}`}
                >
                  <div className={`w-[2px] h-12 rounded-full transition-all ${isResizing ? 'bg-white opacity-100' : 'bg-slate-200 opacity-0 group-hover:opacity-100'}`}></div>
                </div>
              </div>

              {/* Execution Layer */}
              <div className="flex-1 h-full">
                <TaskDrawer 
                  tasks={tasks} 
                  activeTaskId={activeTaskId} 
                  onSetActiveTask={setActiveTaskId}
                  onStepAction={handleStepAction}
                />
              </div>
            </div>
          ) : activeTab === 'home' ? (
            <HomeDashboard />
          ) : activeTab === 'feed' ? (
            <FeedArea />
          ) : activeTab === 'todo' ? (
            <TodoArea tasks={tasks} onCompleteStep={() => {}} />
          ) : activeTab === 'files' ? (
            <FileArea files={files} setFiles={setFiles} />
          ) : activeTab === 'org' ? (
            <OrgArea />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default App;
