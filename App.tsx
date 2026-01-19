
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, Project, ViewMode, UserSettings, Workspace } from './types';
import Sidebar from './components/Sidebar';
import TaskTable from './components/TaskTable';
import TaskDrawer from './components/TaskDrawer';
import KanbanBoard from './components/KanbanBoard';
import SettingsPage from './components/SettingsPage';

const App: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    userName: 'Erasmus Mensah',
    userEmail: 'erasmus@attio.design',
    defaultPriority: TaskPriority.MEDIUM,
    enableAISummaries: true,
    theme: 'system'
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<{ type: 'status' | 'project' | 'all' | 'settings', value: string }>({ type: 'all', value: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);

  // Initial dummy data
  useEffect(() => {
    const today = new Date().toISOString();
    
    const initialWorkspaces: Workspace[] = [
      { id: 'w1', name: 'Main Workspace', icon: '🏠', color: '#3B82F6' },
      { id: 'w2', name: 'Side Projects', icon: '🚀', color: '#8B5CF6' }
    ];

    const initialProjects: Project[] = [
      { id: 'p1', name: 'Product Launch', color: '#3B82F6', createdAt: today, workspaceId: 'w1' },
      { id: 'p2', name: 'Internal Audit', color: '#EF4444', createdAt: today, workspaceId: 'w1' },
      { id: 'p3', name: 'Gaming', color: '#10B981', createdAt: today, workspaceId: 'w2' },
    ];

    const initialTasks: Task[] = [
      {
        id: '1',
        title: 'Design system review',
        description: 'Review the new color palette and spacing variables with the team.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: today,
        createdAt: today,
        projectId: 'p1',
        workspaceId: 'w1',
        subTasks: []
      },
      {
        id: '2',
        title: 'Client onboarding',
        description: 'Schedule kickoff call with Acme Corp.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: today,
        createdAt: today,
        workspaceId: 'w1',
        subTasks: []
      }
    ];

    setWorkspaces(initialWorkspaces);
    setActiveWorkspaceId('w1');
    setProjects(initialProjects);
    setTasks(initialTasks);
  }, []);

  const currentWorkspace = useMemo(() => 
    workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  const filteredProjects = useMemo(() => 
    projects.filter(p => p.workspaceId === activeWorkspaceId),
    [projects, activeWorkspaceId]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.workspaceId !== activeWorkspaceId) return false;

      let matchesNav = true;
      if (activeFilter.type === 'status') {
        matchesNav = task.status === activeFilter.value;
      } else if (activeFilter.type === 'project') {
        matchesNav = task.projectId === activeFilter.value;
      }

      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesNav && matchesSearch;
    });
  }, [tasks, activeWorkspaceId, activeFilter, searchQuery]);

  const handleAddTask = () => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Task',
      description: '',
      status: TaskStatus.TODO,
      priority: settings.defaultPriority,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      projectId: activeFilter.type === 'project' ? activeFilter.value : undefined,
      workspaceId: activeWorkspaceId,
      subTasks: []
    };
    setTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleMoveTask = useCallback((activeId: string, overId: string, newStatus?: TaskStatus) => {
    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      const overIndex = prev.findIndex((t) => t.id === overId);
      
      if (activeIndex === -1) return prev;

      const newTasks = [...prev];
      const taskToMove = { ...newTasks[activeIndex] };
      
      if (newStatus) {
        taskToMove.status = newStatus;
      }

      newTasks.splice(activeIndex, 1);
      let targetIndex = overIndex !== -1 ? overIndex : newTasks.length;
      newTasks.splice(targetIndex, 0, taskToMove);
      return newTasks;
    });
  }, []);

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const handleAddProject = (name: string, color: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      color,
      createdAt: new Date().toISOString(),
      workspaceId: activeWorkspaceId
    };
    setProjects(prev => [...prev, newProject]);
  };

  const handleUpdateProject = (id: string, name: string, color: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name, color } : p));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.map(t => t.projectId === id ? { ...t, projectId: undefined } : t));
    if (activeFilter.type === 'project' && activeFilter.value === id) {
      setActiveFilter({ type: 'all', value: 'all' });
    }
  };

  const handleAddWorkspace = (name: string, icon: string, color: string) => {
    const newWorkspace: Workspace = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      icon,
      color
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    setActiveWorkspaceId(newWorkspace.id);
    setActiveFilter({ type: 'all', value: 'all' });
  };

  const handleUpdateWorkspace = (id: string, name: string, icon: string, color: string) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name, icon, color } : w));
  };

  const handleDeleteWorkspace = (id: string) => {
    if (workspaces.length <= 1) return;
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    setProjects(prev => prev.filter(p => p.workspaceId !== id));
    setTasks(prev => prev.filter(t => t.workspaceId !== id));
    if (activeWorkspaceId === id) {
      const remaining = workspaces.find(w => w.id !== id);
      if (remaining) setActiveWorkspaceId(remaining.id);
    }
  };

  const handleResetData = () => {
    setTasks(prev => prev.filter(t => t.workspaceId !== activeWorkspaceId));
    setProjects(prev => prev.filter(p => p.workspaceId !== activeWorkspaceId));
    setActiveFilter({ type: 'all', value: 'all' });
    setViewMode(ViewMode.LIST);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const currentMainContent = () => {
    if (activeFilter.type === 'settings') {
      return (
        <SettingsPage 
          projects={filteredProjects}
          settings={settings}
          onUpdateSettings={setSettings}
          onDeleteProject={handleDeleteProject}
          onUpdateProject={handleUpdateProject}
          onResetData={handleResetData}
        />
      );
    }

    return (
      <>
        <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4 flex-1">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {activeFilter.type === 'all' ? 'Dashboard' : 
               activeFilter.type === 'status' ? `Status: ${activeFilter.value}` :
               filteredProjects.find(p => p.id === activeFilter.value)?.name || 'Project'}
            </h1>
            <div className="relative max-w-sm w-full ml-4">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search everything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[13px] font-medium transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
              <button 
                onClick={() => setViewMode(ViewMode.LIST)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === ViewMode.LIST ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                <span>List</span>
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.KANBAN)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === ViewMode.KANBAN ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
                <span>Kanban</span>
              </button>
            </div>

            <button 
              onClick={handleAddTask}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
            >
              Add Task
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50/20">
          {viewMode === ViewMode.LIST ? (
            <TaskTable 
              tasks={filteredTasks} 
              projects={filteredProjects}
              selectedId={selectedTaskId} 
              onSelect={setSelectedTaskId} 
            />
          ) : (
            <KanbanBoard 
              tasks={filteredTasks} 
              projects={filteredProjects} 
              onSelect={setSelectedTaskId}
              onMoveTask={handleMoveTask}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className={`flex h-screen bg-[#F9FAFB] overflow-hidden ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar 
        currentFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
        onAddTask={handleAddTask}
        projects={filteredProjects}
        onAddProject={handleAddProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        userName={settings.userName}
        userEmail={settings.userEmail}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSwitchWorkspace={(id) => {
          setActiveWorkspaceId(id);
          setActiveFilter({ type: 'all', value: 'all' });
        }}
        onAddWorkspace={handleAddWorkspace}
        onUpdateWorkspace={handleUpdateWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
      />

      {/* Main content area with subtle shadow instead of shadow-2xl */}
      <main className="flex-1 flex flex-col min-w-0 bg-white border-l border-slate-200 shadow-sm z-0 overflow-hidden relative">
        {currentMainContent()}
      </main>

      <TaskDrawer 
        task={selectedTask} 
        projects={filteredProjects}
        onClose={() => setSelectedTaskId(null)} 
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default App;
