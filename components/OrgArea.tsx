
import React, { useState, useMemo } from 'react';
import { OrganizationNode, User } from '../types';
import { INITIAL_ORG, MOCK_USERS } from '../constants';

const OrgArea: React.FC = () => {
  const [orgData, setOrgData] = useState<OrganizationNode[]>(INITIAL_ORG);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(INITIAL_ORG[0].id);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([INITIAL_ORG[0].id]));
  const [searchTerm, setSearchTerm] = useState('');

  const findNode = (nodes: OrganizationNode[], id: string): OrganizationNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = useMemo(() => findNode(orgData, selectedNodeId), [orgData, selectedNodeId]);

  const departmentUsers = useMemo(() => {
    return MOCK_USERS.filter(u => u.departmentId === selectedNodeId);
  }, [selectedNodeId]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderTreeNode = (node: OrganizationNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div 
          onClick={() => setSelectedNodeId(node.id)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
            isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'
          }`}
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {hasChildren ? (
              <button 
                onClick={(e) => toggleExpand(node.id, e)}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <i className={`fas fa-caret-${isExpanded ? 'down' : 'right'} text-[10px]`}></i>
              </button>
            ) : (
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            )}
          </div>
          <i className={`fas ${depth === 0 ? 'fa-building' : 'fa-folder'} text-xs opacity-40 group-hover:opacity-100`}></i>
          <span className="text-xs font-bold truncate">{node.name}</span>
          {isSelected && <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full"></div>}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex bg-slate-50 overflow-hidden">
      {/* Sidebar Tree */}
      <div className="w-72 h-full bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <i className="fas fa-sitemap text-indigo-600"></i> 组织架构
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Architecture</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-2">
          {orgData.map(node => renderTreeNode(node))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button className="w-full py-3 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-dashed border-slate-300 hover:border-indigo-300 flex items-center justify-center gap-2">
            <i className="fas fa-plus-circle"></i> 新增顶级组织
          </button>
        </div>
      </div>

      {/* Main Content Detail */}
      <div className="flex-1 h-full overflow-y-auto p-8 scroll-smooth no-scrollbar">
        {selectedNode ? (
          <div className="max-w-7xl space-y-8 animate-in fade-in duration-500">
            {/* Dept Header */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {selectedNode.parentId ? '二级部门' : '核心节点'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">ID: {selectedNode.id}</span>
                  </div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">{selectedNode.name}</h1>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
                    {selectedNode.description || '暂无部门描述。'}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-center md:items-end justify-center gap-4">
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">负责人</p>
                    {selectedNode.managerId ? (
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <img 
                          src={MOCK_USERS.find(u => u.id === selectedNode.managerId)?.avatar} 
                          className="w-10 h-10 rounded-xl border border-white shadow-sm" 
                          alt="" 
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800">
                            {MOCK_USERS.find(u => u.id === selectedNode.managerId)?.name}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400">
                            {MOCK_USERS.find(u => u.id === selectedNode.managerId)?.role}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-300 italic">未指派负责人</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                      编辑信息
                    </button>
                    <button className="p-2 w-10 h-10 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-100 transition-all flex items-center justify-center">
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* Users List Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold text-slate-800">成员列表</h3>
                  <div className="h-5 w-[1px] bg-slate-200"></div>
                  <div className="relative group">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"></i>
                    <input 
                      type="text" 
                      placeholder="搜索成员..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white border border-slate-100 rounded-full py-1.5 pl-8 pr-4 text-[11px] outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all w-48"
                    />
                  </div>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                  <i className="fas fa-user-plus text-[9px]"></i> 添加成员
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentUsers.filter(u => u.name.includes(searchTerm)).map(user => (
                  <div key={user.id} className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-indigo-200 shadow-sm transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <img src={user.avatar} className="w-12 h-12 rounded-2xl border-2 border-indigo-50 shadow-sm" alt="" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-800 truncate">{user.name}</h4>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase mt-0.5">{user.role}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-all">
                        <i className="fas fa-ellipsis-v text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {departmentUsers.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[32px] border border-dashed border-slate-200 opacity-40">
                    <i className="fas fa-users-slash text-4xl text-slate-300 mb-4"></i>
                    <p className="text-sm font-bold text-slate-400">该部门目前暂无正式成员</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-departments Cards */}
            {selectedNode.children && selectedNode.children.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">下属机构</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedNode.children.map(child => (
                    <div 
                      key={child.id}
                      onClick={() => setSelectedNodeId(child.id)}
                      className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-400 shadow-sm cursor-pointer transition-all group flex flex-col items-center text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-xl mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <i className="fas fa-folder-tree"></i>
                      </div>
                      <h4 className="text-xs font-black text-slate-800">{child.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">成员: {MOCK_USERS.filter(u => u.departmentId === child.id).length}人</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-30 py-40">
            <i className="fas fa-sitemap text-6xl text-slate-200 mb-6"></i>
            <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">请选择一个节点以管理其架构</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgArea;
