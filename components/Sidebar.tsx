
import React, { useState } from 'react';
import { TaskStatus, Project } from '../types';

interface SidebarProps {
  currentFilter: { type: 'status' | 'project' | 'all', value: string };
  onFilterChange: (filter: { type: 'status' | 'project' | 'all', value: string }) => void;
  onAddTask: () => void;
  projects: Project[];
  onAddProject: (name: string, color: string) => void;
  onUpdateProject: (id: string, name: string, color: string) => void;
  onDeleteProject: (id: string) => void;
}

interface NavItemProps {
  label: string;
  type: 'status' | 'project' | 'all';
  value: string;
  icon?: React.ReactNode;
  color?: string;
  currentFilter: { type: 'status' | 'project' | 'all', value: string };
  onFilterChange: (filter: { type: 'status' | 'project' | 'all', value: string }) => void;
  onEdit?: (e: React.MouseEvent) => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  label, 
  type, 
  value, 
  icon, 
  color, 
  currentFilter, 
  onFilterChange, 
  onEdit 
}) => (
  <div className="group relative flex items-center">
    <button
      onClick={() => onFilterChange({ type, value })}
      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        currentFilter.type === type && currentFilter.value === value 
        ? 'bg-slate-200 text-slate-900' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className="mr-3 text-slate-400 flex-shrink-0">
        {icon ? icon : (
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
        )}
      </span>
      <span className="truncate">{label}</span>
    </button>
    {type === 'project' && onEdit && (
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
  onDeleteProject 
}) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState('#3B82F6');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    if (editingProjectId) {
      onUpdateProject(editingProjectId, projectName, projectColor);
    } else {
      onAddProject(projectName, projectColor);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setIsAddingProject(false);
    setEditingProjectId(null);
    setProjectName('');
    setProjectColor('#3B82F6');
    setShowDeleteConfirm(false);
  };

  const startEdit = (e: React.MouseEvent, p: Project) => {
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

  return (
    <div className="w-64 flex-shrink-0 flex flex-col bg-[#F9FAFB] p-4 border-r border-slate-200">
      <div className="flex items-center px-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-md">
          A
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">AttioTask</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        <nav className="space-y-1">
          <NavItem 
            label="All Tasks" 
            type="all"
            value="all" 
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>} 
          />
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status
          </div>
          <NavItem 
            label="Todo" 
            type="status"
            value={TaskStatus.TODO} 
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
          />
          <NavItem 
            label="In Progress" 
            type="status"
            value={TaskStatus.IN_PROGRESS} 
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
          />
          <NavItem 
            label="Done" 
            type="status"
            value={TaskStatus.DONE} 
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>} 
          />
        </nav>

        <div className="space-y-1">
          <div className="flex items-center justify-between pt-4 pb-2 px-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects</span>
            <button 
              onClick={() => setIsAddingProject(true)}
              className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          {projects.map(p => (
            <NavItem 
              key={p.id}
              label={p.name}
              type="project"
              value={p.id}
              color={p.color}
              currentFilter={currentFilter}
              onFilterChange={onFilterChange}
              onEdit={(e) => startEdit(e, p)}
            />
          ))}
          {projects.length === 0 && !isAddingProject && (
            <div className="px-3 py-4 text-xs text-slate-400 italic">No projects yet</div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 space-y-4">
        <button 
          onClick={onAddTask}
          className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-slate-300 rounded-md text-sm font-medium text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-all"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Quick Add Task
        </button>
      </div>

      {/* Project Modal */}
      {isAddingProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]"
          onClick={resetForm}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingProjectId ? 'Edit Project' : 'New Project'}
            </h3>
            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Project Name</label>
                <input 
                  autoFocus
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Q4 Marketing"
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Color</label>
                <div className="flex flex-wrap gap-2">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setProjectColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${projectColor === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-3 pt-4">
                <div className="flex space-x-3">
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                    disabled={!projectName.trim()}
                  >
                    {editingProjectId ? 'Update' : 'Create'}
                  </button>
                </div>
                {editingProjectId && (
                  <button 
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Delete Project
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Delete Confirmation */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px]"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete project?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete this project? All tasks associated with it will be moved to "No Project". This cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteProject}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
