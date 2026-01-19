
import React, { useState } from 'react';
import { TaskStatus, Project, Workspace } from '../types';

interface SidebarProps {
  currentFilter: { type: 'status' | 'project' | 'all' | 'settings', value: string };
  onFilterChange: (filter: { type: 'status' | 'project' | 'all' | 'settings', value: string }) => void;
  onAddTask: () => void;
  projects: Project[];
  onAddProject: (name: string, color: string) => void;
  onUpdateProject: (id: string, name: string, color: string) => void;
  onDeleteProject: (id: string) => void;
  userName?: string;
  userEmail?: string;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (id: string) => void;
  onAddWorkspace: (name: string, icon: string, color: string) => void;
  onUpdateWorkspace: (id: string, name: string, icon: string, color: string) => void;
  onDeleteWorkspace: (id: string) => void;
}

interface NavItemProps {
  label: string;
  type: 'status' | 'project' | 'all' | 'settings' | 'workspace';
  value: string;
  icon?: React.ReactNode;
  color?: string;
  isActive?: boolean;
  onFilterChange: (filter: any) => void;
  onEdit?: (e: React.MouseEvent) => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  label, 
  type, 
  value, 
  icon, 
  color, 
  isActive, 
  onFilterChange, 
  onEdit 
}) => (
  <div className="group relative flex items-center">
    <button
      onClick={() => onFilterChange({ type, value })}
      className={`w-full flex items-center px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors ${
        isActive 
        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
        : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
      }`}
    >
      <span className={`mr-3 flex-shrink-0 flex items-center justify-center w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
        {icon ? icon : (
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
        )}
      </span>
      <span className="truncate">{label}</span>
    </button>
    {onEdit && (
      <button 
        onClick={onEdit}
        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
      >
        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>
    )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  currentFilter, 
  onFilterChange, 
  onAddTask, 
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  userName = "Erasmus Mensah",
  userEmail = "erasmus@attio.design",
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
  onAddWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace
}) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState('#3B82F6');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [showWorkspaceDeleteConfirm, setShowWorkspaceDeleteConfirm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    if (editingProjectId) onUpdateProject(editingProjectId, projectName, projectColor);
    else onAddProject(projectName, projectColor);
    resetForm();
  };

  const resetForm = () => {
    setIsAddingProject(false);
    setEditingProjectId(null);
    setProjectName('');
    setProjectColor('#3B82F6');
    setShowDeleteConfirm(false);
  };

  const startEditProject = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation();
    setEditingProjectId(p.id);
    setProjectName(p.name);
    setProjectColor(p.color);
    setIsAddingProject(true);
  };

  const confirmDeleteProject = () => {
    if (editingProjectId) {
      onDeleteProject(editingProjectId);
      resetForm();
    }
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    onAddWorkspace(newWorkspaceName.trim(), '📁', '#3B82F6');
    setNewWorkspaceName('');
    setIsAddingWorkspace(false);
    setIsSwitcherOpen(false);
  };

  const handleUpdateWorkspaceInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace || !editingWorkspace.name.trim()) return;
    onUpdateWorkspace(editingWorkspace.id, editingWorkspace.name, editingWorkspace.icon, editingWorkspace.color);
    setEditingWorkspace(null);
  };

  const confirmDeleteWorkspace = () => {
    if (editingWorkspace) {
      onDeleteWorkspace(editingWorkspace.id);
      setShowWorkspaceDeleteConfirm(false);
      setEditingWorkspace(null);
    }
  };

  const commonIcons = ['🏠', '🚀', '🛠️', '📈', '📁', '🎨', '🌟', '🛡️', '💬', '💡'];
  const commonColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

  return (
    <div className="w-[260px] flex-shrink-0 flex flex-col bg-[#F9FAFB] p-4 border-r border-slate-200 h-screen">
      {/* Current Workspace Selection Display */}
      <div className="relative mb-6">
        <div 
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className="flex items-center px-2 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold border mr-3 shadow-inner text-lg"
            style={{ backgroundColor: `${activeWorkspace?.color}20`, borderColor: activeWorkspace?.color, color: activeWorkspace?.color }}
          >
            {activeWorkspace?.icon || activeWorkspace?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[13px] font-bold text-slate-900 truncate tracking-tight">{activeWorkspace?.name}</h2>
            <p className="text-[11px] text-slate-500 truncate font-medium">{userName}</p>
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>

        {isSwitcherOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)}></div>
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in slide-in-from-top-2 duration-200">
              <div className="max-h-64 overflow-y-auto space-y-1">
                {workspaces.map(w => (
                  <div key={w.id} className="group relative flex items-center">
                    <button
                      onClick={() => {
                        onSwitchWorkspace(w.id);
                        setIsSwitcherOpen(false);
                      }}
                      className={`flex-1 flex items-center px-3 py-2 rounded-xl text-left transition-colors ${w.id === activeWorkspaceId ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                      <span className="mr-3 text-lg">{w.icon}</span>
                      <span className="text-[13px] font-bold text-slate-900 truncate">{w.name}</span>
                      {w.id === activeWorkspaceId && (
                        <svg className="w-4 h-4 ml-auto text-blue-600 mr-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingWorkspace(w);
                        setIsSwitcherOpen(false);
                      }}
                      className="absolute right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded-lg transition-all text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setIsAddingWorkspace(true);
                    setIsSwitcherOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Quick Add Workspace
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-1 custom-scrollbar">
        {/* Navigation Section */}
        <nav className="space-y-1">
          <NavItem 
            label="Dashboard" 
            type="all"
            value="all" 
            isActive={currentFilter.type === 'all'}
            onFilterChange={onFilterChange}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} 
          />
          
          <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Status</div>
          <NavItem 
            label="Todo" 
            type="status"
            value={TaskStatus.TODO} 
            isActive={currentFilter.type === 'status' && currentFilter.value === TaskStatus.TODO}
            onFilterChange={onFilterChange}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
          />
          <NavItem 
            label="In Progress" 
            type="status"
            value={TaskStatus.IN_PROGRESS} 
            isActive={currentFilter.type === 'status' && currentFilter.value === TaskStatus.IN_PROGRESS}
            onFilterChange={onFilterChange}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
          />
          <NavItem 
            label="Done" 
            type="status"
            value={TaskStatus.DONE} 
            isActive={currentFilter.type === 'status' && currentFilter.value === TaskStatus.DONE}
            onFilterChange={onFilterChange}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>} 
          />
        </nav>

        {/* Projects Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 pt-4 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Projects</span>
            <button onClick={() => setIsAddingProject(true)} className="p-1 hover:bg-slate-200 rounded-md text-slate-400 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          {projects.map(p => (
            <NavItem 
              key={p.id}
              label={p.name}
              type="project"
              value={p.id}
              color={p.color}
              isActive={currentFilter.type === 'project' && currentFilter.value === p.id}
              onFilterChange={onFilterChange}
              onEdit={(e) => startEditProject(e, p)}
            />
          ))}
          {projects.length === 0 && !isAddingProject && (
            <div className="px-3 py-2 text-[11px] text-slate-400 italic font-medium">No projects in this workspace</div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 space-y-4">
        <nav className="space-y-1">
          <NavItem 
            label="Settings" 
            type="settings"
            value="settings" 
            isActive={currentFilter.type === 'settings'}
            onFilterChange={onFilterChange}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} 
          />
        </nav>
      </div>

      {/* Edit Workspace Modal */}
      {editingWorkspace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setEditingWorkspace(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 max-w-sm w-full p-8 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Workspace Settings</h3>
            <form onSubmit={handleUpdateWorkspaceInternal} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Name</label>
                <input 
                  autoFocus
                  type="text"
                  value={editingWorkspace.name}
                  onChange={(e) => setEditingWorkspace({...editingWorkspace, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {commonIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setEditingWorkspace({...editingWorkspace, icon})}
                      className={`text-xl p-2 rounded-xl transition-all ${editingWorkspace.icon === icon ? 'bg-slate-100 ring-2 ring-slate-900 ring-offset-2' : 'hover:bg-slate-50 opacity-50 hover:opacity-100'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Workspace Color</label>
                <div className="flex flex-wrap gap-2.5">
                  {commonColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditingWorkspace({...editingWorkspace, color: c})}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${editingWorkspace.color === c ? 'border-slate-900 scale-110 shadow-md ring-2 ring-white ring-inset' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-3 pt-6">
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setEditingWorkspace(null)} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-md">Save Changes</button>
                </div>
                {workspaces.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setShowWorkspaceDeleteConfirm(true)} 
                    className="w-full px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    Delete Workspace
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Delete Confirmation Overlay */}
      {showWorkspaceDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[4px]"
          onClick={() => setShowWorkspaceDeleteConfirm(false)}
        >
          <div 
            className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 max-w-sm w-full p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 border border-red-100 shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Delete workspace?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              Are you sure? This will permanently delete the workspace "{editingWorkspace?.name}" along with all its projects and tasks. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowWorkspaceDeleteConfirm(false)} 
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteWorkspace} 
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Create Modal */}
      {isAddingWorkspace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setIsAddingWorkspace(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 max-w-sm w-full p-8 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">New Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Workspace Name</label>
                <input 
                  autoFocus
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm shadow-sm font-medium"
                />
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsAddingWorkspace(false)} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50" disabled={!newWorkspaceName.trim()}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal (Existing) */}
      {isAddingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]" onClick={resetForm}>
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 max-w-sm w-full p-8 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">{editingProjectId ? 'Edit Project' : 'New Project'}</h3>
            <form onSubmit={handleSaveProject} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Project Name</label>
                <input 
                  autoFocus
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Q4 Marketing"
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder-slate-400 shadow-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Workspace Color</label>
                <div className="flex flex-wrap gap-2.5">
                  {commonColors.map(c => (
                    <button key={c} type="button" onClick={() => setProjectColor(c)} className={`w-9 h-9 rounded-xl border-2 transition-all shadow-sm ${projectColor === c ? 'border-slate-900 scale-110 shadow-md ring-2 ring-white ring-inset' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-3 pt-6">
                <div className="flex space-x-3">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50" disabled={!projectName.trim()}>{editingProjectId ? 'Update' : 'Create'}</button>
                </div>
                {editingProjectId && (
                  <button type="button" onClick={() => setShowDeleteConfirm(true)} className="w-full px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">Delete Project</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Delete Confirmation (Existing) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[4px]" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 max-w-sm w-full p-8 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 border border-red-100 shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Delete project?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">Are you sure? All tasks will be moved to "No Project". This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
              <button onClick={confirmDeleteProject} className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-md">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
