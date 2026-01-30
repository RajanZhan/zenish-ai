
import React, { useState, useMemo } from 'react';
import { Task, Step, User, StepStatus } from '../types';
import { CURRENT_USER } from '../constants';

interface TodoAreaProps {
  tasks: Task[];
  onCompleteStep: (taskId: string, stepId: string, submission: { content: string, attachments: any[] }) => void;
}

const TodoArea: React.FC<TodoAreaProps> = ({ tasks, onCompleteStep }) => {
  const [activeSubmission, setActiveSubmission] = useState<{ taskId: string, stepId: string } | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');

  // Filter tasks assigned to me that are not yet succeeded
  const myAssignedSteps = useMemo(() => {
    const list: Array<{ task: Task, step: Step }> = [];
    tasks.forEach(task => {
      task.steps.forEach(step => {
        if (step.assignee?.id === CURRENT_USER.id && step.status !== StepStatus.SUCCEEDED) {
          list.push({ task, step });
        }
      });
    });
    return list;
  }, [tasks]);

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    onCompleteStep(activeSubmission.taskId, activeSubmission.stepId, {
      content: submissionContent,
      attachments: [] // Placeholder for attachments
    });
    setActiveSubmission(null);
    setSubmissionContent('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full shrink-0 overflow-hidden relative">
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-clipboard-list text-sm"></i>
          </div>
          <h2 className="font-bold text-slate-800 tracking-tight">协作待办 (My To-do)</h2>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
          {myAssignedSteps.length} 项协作
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {myAssignedSteps.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">分配给我的任务</h4>
            {myAssignedSteps.map(({ task, step }) => (
              <div key={step.id} className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-extrabold text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded-full">
                    来自: {task.name}
                  </span>
                  <div className="flex -space-x-1.5">
                    <img src={task.initiator.avatar} className="w-4 h-4 rounded-full border border-white" title={`发起人: ${task.initiator.name}`} alt="" />
                  </div>
                </div>
                <h5 className="text-sm font-bold text-slate-700 mb-1">{step.name}</h5>
                <p className="text-[11px] text-slate-400 mb-4">指派人: {task.initiator.name}</p>
                
                <button 
                  onClick={() => setActiveSubmission({ taskId: task.id, stepId: step.id })}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-reply-all text-[10px]"></i> 交付工作
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-40 py-20">
            <i className="fas fa-check-double text-4xl text-slate-300 mb-4"></i>
            <p className="text-sm font-bold text-slate-400">目前暂无指派给您的协作任务</p>
          </div>
        )}
      </div>

      {/* Submission Overlay (Rich Text Mock) */}
      {activeSubmission && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">提交协作成果</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  节点: {myAssignedSteps.find(s => s.step.id === activeSubmission.stepId)?.step.name}
                </p>
              </div>
              <button onClick={() => setActiveSubmission(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-t-2xl border-x border-t border-slate-100">
                  <button type="button" className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><i className="fas fa-bold"></i></button>
                  <button type="button" className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><i className="fas fa-italic"></i></button>
                  <button type="button" className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><i className="fas fa-link"></i></button>
                  <button type="button" className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors ml-auto"><i className="fas fa-paperclip"></i></button>
                </div>
                <textarea 
                  required
                  rows={6}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="请输入您的执行反馈或说明文本..."
                  className="w-full bg-white border border-slate-100 rounded-b-2xl p-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all shadow-inner"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-400 shadow-sm">
                  <i className="fas fa-file-export"></i>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-indigo-600 uppercase">附件上传</p>
                  <p className="text-[10px] text-indigo-400 font-medium">支持 PDF, CSV, PNG, DOCX (最大 50MB)</p>
                </div>
                <button type="button" className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold hover:bg-indigo-700 transition-all">
                  选择文件
                </button>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                确认并提交至发起人 <i className="fas fa-paper-plane text-xs"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoArea;
