
import React, { useState } from 'react';
import { Task, TaskStatus, StepStatus, User, UIIntent } from '../types';
import { MOCK_USERS } from '../constants';
import DynamicUI from './DynamicUI';

interface TaskDrawerProps {
  tasks: Task[];
  activeTaskId: string;
  onSetActiveTask: (id: string) => void;
  onStepAction: (taskId: string, stepId: string, data: any) => void;
  onAssignUser: (taskId: string, stepId: string, user: User) => void;
}

const TaskDrawer: React.FC<TaskDrawerProps> = ({ tasks, activeTaskId, onSetActiveTask, onStepAction, onAssignUser }) => {
  const [viewMode, setViewMode] = useState<'DETAIL' | 'OVERVIEW'>('OVERVIEW');
  const [showAssignModal, setShowAssignModal] = useState<{ taskId: string, stepId: string } | null>(null);
  const activeTask = tasks.find(t => t.id === activeTaskId);

  const getStatusLabel = (status: TaskStatus | StepStatus) => {
    const labels: Record<string, string> = {
      [TaskStatus.DONE]: '已完成',
      [StepStatus.SUCCEEDED]: '已成功',
      [TaskStatus.RUNNING]: '进行中',
      [TaskStatus.WAITING_INPUT]: '待交互',
      [StepStatus.NEED_CONFIRM]: '需要交互',
      [StepStatus.PENDING]: '等待中',
    };
    return labels[status] || status;
  };

  const getStatusStyles = (status: TaskStatus | StepStatus) => {
    switch (status) {
      case TaskStatus.DONE:
      case StepStatus.SUCCEEDED: return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case TaskStatus.RUNNING:
      case StepStatus.RUNNING: return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case TaskStatus.WAITING_INPUT:
      case StepStatus.NEED_CONFIRM: return 'text-amber-500 bg-amber-50 border-amber-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  const renderTaskTabs = () => (
    <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-2 shrink-0 z-30 overflow-x-auto no-scrollbar">
      <button
        onClick={() => setViewMode('OVERVIEW')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap group ${
          viewMode === 'OVERVIEW' 
          ? 'bg-slate-900 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
        }`}
      >
        <i className={`fas fa-th-large text-[10px] ${viewMode === 'OVERVIEW' ? 'text-indigo-400' : 'text-slate-300'}`}></i>
        <span className="text-[10px] font-black uppercase tracking-widest">总控制台</span>
      </button>

      <div className="h-4 w-[1px] bg-slate-100 mx-1 shrink-0"></div>

      {tasks.map(task => (
        <button
          key={task.id}
          onClick={() => {
            onSetActiveTask(task.id);
            setViewMode('DETAIL');
          }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all border whitespace-nowrap relative group ${
            activeTaskId === task.id && viewMode === 'DETAIL'
              ? 'bg-white border-indigo-200 text-slate-800 shadow-sm ring-1 ring-indigo-50'
              : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${
            task.status === TaskStatus.WAITING_INPUT ? 'bg-amber-500 animate-pulse' : 
            task.status === TaskStatus.RUNNING ? 'bg-indigo-500' : 'bg-emerald-500'
          }`}></div>
          <span className="text-[10px] font-bold truncate max-w-[100px]">{task.name}</span>
          {activeTaskId === task.id && viewMode === 'DETAIL' && (
            <div className="absolute -bottom-[15px] left-1/2 -translate-x-1/2 w-6 h-[2px] bg-indigo-600 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );

  const TaskCard = ({ task }: { task: Task }) => {
    const readySteps = task.steps.filter(s => s.status === StepStatus.SUCCEEDED).length;
    const progress = Math.round((readySteps / task.steps.length) * 100);
    
    return (
      <div 
        onClick={() => {
          onSetActiveTask(task.id);
          setViewMode('DETAIL');
        }}
        className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col min-h-[260px] relative overflow-hidden h-full"
      >
        <div className="flex items-start justify-between mb-6">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-md transition-transform group-hover:scale-105 ${
            task.status === TaskStatus.RUNNING ? 'bg-indigo-600 text-white shadow-indigo-100' : 
            task.status === TaskStatus.WAITING_INPUT ? 'bg-amber-500 text-white shadow-amber-100' :
            'bg-emerald-500 text-white shadow-emerald-50'
          }`}>
            <i className={`fas ${task.status === TaskStatus.RUNNING ? 'fa-rocket' : 
                            task.status === TaskStatus.WAITING_INPUT ? 'fa-hourglass-half' : 'fa-check'}`}></i>
          </div>
          <div className="text-right">
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border whitespace-nowrap ${getStatusStyles(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
            <p className="text-[8px] font-bold text-slate-300 mt-1.5 tracking-widest uppercase">#{task.id}</p>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{task.name}</h3>
          <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{task.description}</p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              <img src={task.initiator.avatar} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="" />
              {task.steps.map(s => s.assignee).filter((u, i, self) => u && self.findIndex(t => t?.id === u?.id) === i).slice(0, 2).map((u, i) => (
                <img key={i} src={u?.avatar} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="" />
              ))}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${task.status === TaskStatus.DONE ? 'text-emerald-500' : 'text-indigo-600'}`}>
              {readySteps}/{task.steps.length}
            </span>
          </div>
          <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${task.status === TaskStatus.DONE ? 'bg-emerald-500' : 'bg-indigo-600'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const runningTasks = tasks.filter(t => t.status === TaskStatus.RUNNING);
    const waitingTasks = tasks.filter(t => t.status === TaskStatus.WAITING_INPUT);
    const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE);

    return (
      <div className="absolute inset-0 overflow-y-auto bg-[#F9FBFF] animate-in fade-in duration-500 custom-scrollbar">
        <div className="p-6 md:p-8 md:pl-12 lg:pl-16 max-w-7xl space-y-12 md:space-y-16 pb-24">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">Mission Control</h2>
            <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[9px]">当前活跃执行流全景视图</p>
          </div>

          <div className="space-y-12 md:space-y-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                  <i className="fas fa-bolt text-[10px]"></i>
                </div>
                <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em]">正在进行中</h3>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black">{runningTasks.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {runningTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>

            {waitingTasks.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100">
                    <i className="fas fa-bell text-[10px]"></i>
                  </div>
                  <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em]">待交互 / 需确认</h3>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[9px] font-black">{waitingTasks.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {waitingTasks.map(task => <TaskCard key={task.id} task={task} />)}
                </div>
              </div>
            )}

            {doneTasks.length > 0 && (
              <div className="space-y-6 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-50">
                    <i className="fas fa-check-double text-[10px]"></i>
                  </div>
                  <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em]">已完成任务</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black">{doneTasks.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTask = () => {
    if (!activeTask) return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-300 py-40 opacity-30">
        <p className="text-[12px] font-black uppercase tracking-[0.5em]">请选择一个任务查看详情</p>
      </div>
    );

    return (
      <div className="absolute inset-0 overflow-y-auto bg-[#F9FBFF] animate-in fade-in duration-700 custom-scrollbar">
        <div className="p-6 md:p-8 md:pl-12 lg:pl-16 max-w-5xl space-y-12 md:space-y-16 pb-24">
          <div className="relative group">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
              <div className="flex-1 space-y-5 min-w-0">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${getStatusStyles(activeTask.status)}`}>
                    {getStatusLabel(activeTask.status)}
                  </span>
                  <span className="text-[10px] font-black text-slate-300 tracking-[0.2em]">TASK #{activeTask.id}</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tighter leading-[1.1] break-words">
                    {activeTask.name}
                  </h3>
                  <p className="text-base text-slate-500 font-medium leading-relaxed max-w-2xl">
                    {activeTask.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-3 shrink-0 lg:mt-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">协作团队成员</p>
                <div className="flex items-center -space-x-2">
                   <img src={activeTask.initiator.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-lg z-30" alt="" />
                  {activeTask.steps.filter(s => s.assignee && s.assignee.id !== activeTask.initiator.id).map((s, i) => (
                    <img key={s.id} src={s.assignee?.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 hover:z-50 cursor-pointer" style={{ zIndex: 20 - i }} alt="" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 bg-[#1E1B4B] rounded-xl flex items-center justify-center text-white shadow-md">
                    <i className="fas fa-project-diagram text-[10px]"></i>
                 </div>
                 <h4 className="text-[12px] font-black text-[#0F172A] uppercase tracking-[0.2em]">节点流水线</h4>
              </div>
            </div>

            <div className="space-y-5 relative">
              {activeTask.steps.map((step, idx) => (
                <div key={step.id} className={`p-5 md:p-6 rounded-[32px] border transition-all duration-500 bg-white relative group/node ${
                  step.status === StepStatus.NEED_CONFIRM ? 'ring-8 ring-indigo-500/5 border-indigo-200 shadow-xl' : 'border-slate-100 shadow-sm'
                }`}>
                  {idx < activeTask.steps.length - 1 && (
                    <div className="absolute left-[38px] md:left-[44px] top-[75px] bottom-[-25px] w-[2px] bg-slate-100 z-0"></div>
                  )}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-5 md:gap-6">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-xs md:text-sm font-black border-2 transition-all duration-500 shadow-md shrink-0 ${
                        step.status === StepStatus.SUCCEEDED ? 'bg-emerald-500 text-white border-emerald-50' : 
                        step.status === StepStatus.RUNNING ? 'bg-indigo-600 text-white border-indigo-50 animate-pulse scale-105' :
                        step.status === StepStatus.NEED_CONFIRM ? 'bg-[#1E1B4B] text-white border-white scale-105' : 'bg-white text-slate-300 border-slate-50'
                      }`}>
                        {step.status === StepStatus.SUCCEEDED ? <i className="fas fa-check"></i> : idx + 1}
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <h5 className={`text-lg md:text-xl font-black tracking-tight truncate ${step.status === StepStatus.PENDING ? 'text-slate-300' : 'text-[#1E293B]'}`}>{step.name}</h5>
                        <div className="flex flex-wrap items-center gap-2">
                           <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${getStatusStyles(step.status)}`}>{getStatusLabel(step.status)}</span>
                           {step.assignee && (
                             <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded-md">
                               <img src={step.assignee.avatar} className="w-3 h-3 rounded-full" alt="" />
                               <span className="text-[8px] font-bold text-slate-500">{step.assignee.name}</span>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button 
                        onClick={() => setShowAssignModal({ taskId: activeTask.id, stepId: step.id })}
                        className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center"
                        title="协作安排"
                      >
                        <i className="fas fa-user-plus text-[10px]"></i>
                      </button>
                    </div>
                  </div>

                  {step.status === StepStatus.NEED_CONFIRM && step.uiSchema && (
                    <div className="mt-8 ml-0 md:ml-16 lg:ml-20 animate-in fade-in slide-in-from-top-2 duration-500">
                      <DynamicUI intent={step.uiIntent} schema={step.uiSchema} onSubmit={(data) => onStepAction(activeTask.id, step.id, data)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {renderTaskTabs()}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'OVERVIEW' ? renderOverview() : renderActiveTask()}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAssignModal(null)}></div>
           <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden relative z-10 p-8 border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6">邀请同事协作</h3>
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {MOCK_USERS.map(user => (
                   <button 
                      key={user.id}
                      onClick={() => {
                        onAssignUser(showAssignModal.taskId, showAssignModal.stepId, user);
                        setShowAssignModal(null);
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                   >
                      <img src={user.avatar} className="w-10 h-10 rounded-xl border border-slate-50" alt="" />
                      <div className="text-left flex-1">
                         <p className="text-xs font-black text-slate-800">{user.name}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase">{user.role}</p>
                      </div>
                      <i className="fas fa-chevron-right text-[10px] text-slate-200 group-hover:text-indigo-500 transition-colors"></i>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskDrawer;
