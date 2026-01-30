
import React from 'react';
import { Task, TaskStatus, StepStatus, User } from '../types';
import DynamicUI from './DynamicUI';

interface TaskDrawerProps {
  tasks: Task[];
  activeTaskId: string;
  onSetActiveTask: (id: string) => void;
  onStepAction: (taskId: string, stepId: string, data: any) => void;
  onAssign?: (taskId: string, stepId: string, user: User) => void;
}

const TaskDrawer: React.FC<TaskDrawerProps> = ({ tasks, activeTaskId, onSetActiveTask, onStepAction }) => {
  const activeTask = tasks.find(t => t.id === activeTaskId);

  const getStatusLabel = (status: TaskStatus | StepStatus) => {
    const labels: Record<string, string> = {
      [TaskStatus.DONE]: '已完成',
      [StepStatus.SUCCEEDED]: '已成功',
      [TaskStatus.RUNNING]: '进行中',
      [TaskStatus.WAITING_INPUT]: '待交互',
      [StepStatus.NEED_CONFIRM]: '需要确认',
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

  return (
    <div className="h-full flex flex-col bg-[#F9FBFF] overflow-hidden">
      {/* Premium Task Tab Navigation */}
      <div className="bg-white border-b border-slate-100 px-10 py-6 shrink-0 flex items-center gap-10 overflow-x-auto no-scrollbar">
        <div className="flex flex-col shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">当前任务列表</p>
          <div className="w-8 h-[2px] bg-indigo-500 mt-1 rounded-full opacity-50"></div>
        </div>
        <div className="flex items-center gap-4">
          {tasks.map(task => (
            <button
              key={task.id}
              onClick={() => onSetActiveTask(task.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-full text-[13px] font-black transition-all border shrink-0 relative active:scale-95 ${
                activeTaskId === task.id
                  ? 'bg-[#1E1B4B] text-white border-[#1E1B4B] shadow-xl shadow-indigo-100'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${task.status === TaskStatus.RUNNING ? 'bg-indigo-400 animate-pulse' : 'bg-slate-300'}`}></div>
              {task.name}
              {task.status === TaskStatus.WAITING_INPUT && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] border-2 border-white text-white font-black shadow-sm">
                  !
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 space-y-20 no-scrollbar scroll-smooth">
        {activeTask ? (
          <div className="max-w-5xl mx-auto space-y-20 pb-32 animate-in fade-in duration-700">
            {/* Massive Hero Section */}
            <div className="relative group">
              <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${getStatusStyles(activeTask.status)}`}>
                      {getStatusLabel(activeTask.status)}
                    </span>
                    <span className="text-[11px] font-black text-slate-300 tracking-[0.2em]">TASK #{activeTask.id}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-7xl font-black text-[#0F172A] tracking-tighter leading-[0.95] max-w-2xl">
                      {activeTask.name}
                    </h3>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                      {activeTask.description}
                    </p>
                  </div>
                </div>

                {/* Team Stack */}
                <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">协作团队成员</p>
                  <div className="flex items-center -space-x-4">
                    <div className="relative group/avatar">
                      <img src={activeTask.initiator.avatar} className="w-16 h-16 rounded-full border-4 border-white shadow-xl z-30 transition-all hover:scale-110 hover:z-50 cursor-pointer" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] z-40">
                        <i className="fas fa-crown"></i>
                      </div>
                    </div>
                    {activeTask.steps.filter(s => s.assignee && s.assignee.id !== activeTask.initiator.id).map((s, i) => (
                      <img key={s.id} src={s.assignee?.avatar} className={`w-16 h-16 rounded-full border-4 border-white shadow-xl transition-all hover:scale-110 hover:z-50 cursor-pointer`} style={{ zIndex: 20 - i }} alt="" />
                    ))}
                    <button className="w-16 h-16 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors shadow-sm z-0">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Background Accent */}
              <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-100/30 transition-colors duration-1000"></div>
            </div>

            {/* Execution Node Pipeline */}
            <div className="space-y-12">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 bg-[#1E1B4B] rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <i className="fas fa-project-diagram text-xs"></i>
                   </div>
                   <div>
                      <h4 className="text-[14px] font-black text-[#0F172A] uppercase tracking-[0.2em]">节点流水线</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Execution Pipeline</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-indigo-600">{Math.round((activeTask.steps.filter(s => s.status === StepStatus.SUCCEEDED).length / activeTask.steps.length) * 100)}%</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">总体进度</span>
                    </div>
                    <div className="h-1.5 w-48 bg-slate-200/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(79,70,229,0.5)]" 
                        style={{ width: `${(activeTask.steps.filter(s => s.status === StepStatus.SUCCEEDED).length / activeTask.steps.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10 relative">
                {activeTask.steps.map((step, idx) => (
                  <div key={step.id} className={`p-10 rounded-[56px] border transition-all duration-500 bg-white relative group/node ${
                    step.status === StepStatus.NEED_CONFIRM 
                      ? 'ring-[16px] ring-indigo-500/5 border-indigo-200 shadow-2xl shadow-indigo-100/30' 
                      : 'border-slate-100 shadow-sm'
                  }`}>
                    {/* Visual Connector Line */}
                    {idx < activeTask.steps.length - 1 && (
                      <div className="absolute left-[70px] top-[110px] bottom-[-40px] w-[3px] bg-slate-100 z-0 group-hover/node:bg-indigo-100 transition-colors"></div>
                    )}

                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-10">
                        {/* Status Circle */}
                        <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center text-lg font-black border-[4px] transition-all duration-500 shadow-xl ${
                          step.status === StepStatus.SUCCEEDED 
                            ? 'bg-emerald-500 text-white border-emerald-50' 
                            : step.status === StepStatus.RUNNING 
                            ? 'bg-indigo-600 text-white border-indigo-50 animate-pulse scale-110'
                            : step.status === StepStatus.NEED_CONFIRM
                            ? 'bg-[#1E1B4B] text-white border-white shadow-indigo-200/50 scale-110'
                            : 'bg-white text-slate-300 border-slate-50 shadow-none'
                        }`}>
                          {step.status === StepStatus.SUCCEEDED ? <i className="fas fa-check"></i> : idx + 1}
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className={`text-2xl font-black tracking-tight transition-colors ${step.status === StepStatus.PENDING ? 'text-slate-300' : 'text-[#1E293B]'}`}>
                            {step.name}
                          </h5>
                          <div className="flex items-center gap-5">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${getStatusStyles(step.status)}`}>
                              {getStatusLabel(step.status)}
                            </span>
                            {step.assignee && (
                              <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
                                <img src={step.assignee.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-md" alt="" />
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter leading-none">{step.assignee.name}</span>
                                   <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{step.assignee.role}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side Info */}
                      {step.status === StepStatus.SUCCEEDED && (
                        <div className="hidden md:flex flex-col items-end gap-1 opacity-40">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">节点已封存</p>
                          <i className="fas fa-lock text-[10px] text-slate-300"></i>
                        </div>
                      )}
                    </div>

                    {/* Feedback Content Receipt */}
                    {step.submission && (
                      <div className="mt-10 ml-28 p-10 bg-[#F8FAFC] rounded-[40px] border border-slate-100 text-[15px] text-slate-600 font-medium leading-relaxed italic animate-in fade-in slide-in-from-left-4 duration-500 relative">
                        <div className="absolute top-6 left-6 text-indigo-200/50">
                          <i className="fas fa-quote-left text-3xl"></i>
                        </div>
                        <div className="relative z-10 pl-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 not-italic">执行结果回执</p>
                          {step.submission.content}
                          {step.submission.attachments.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-3">
                              {step.submission.attachments.map((at, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm not-italic group/at cursor-pointer hover:border-indigo-300 transition-all">
                                  <i className="fas fa-file-csv text-emerald-500 text-xs"></i>
                                  <span className="text-[11px] font-bold text-slate-700">{at.name}</span>
                                  <i className="fas fa-download text-[10px] text-slate-300 group-hover/at:text-indigo-500 ml-2"></i>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step UI for Dynamic Interaction */}
                    {step.status === StepStatus.NEED_CONFIRM && step.uiSchema && (
                      <div className="mt-12 ml-28 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="mb-6 h-[1px] bg-slate-100 w-full"></div>
                        <DynamicUI 
                          intent={step.uiIntent} 
                          schema={step.uiSchema} 
                          onSubmit={(data) => onStepAction(activeTask.id, step.id, data)} 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 py-60 opacity-30">
            <div className="w-48 h-48 bg-white rounded-[64px] shadow-sm flex items-center justify-center mb-10 animate-bounce duration-[5000ms]">
              <i className="fas fa-atom text-7xl opacity-10"></i>
            </div>
            <p className="text-[14px] font-black uppercase tracking-[0.5em] text-[#1E1B4B]">等待编排指令</p>
            <p className="text-sm font-bold text-slate-400 mt-6 max-w-sm text-center leading-relaxed">
              对话层正在待命。您可以发起新任务或激活一个现有的执行流以查看详情。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDrawer;
