
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, Project, ViewMode, UserSettings, Workspace, KanbanColumn } from './types';
import Sidebar from './components/Sidebar';
import TaskTable from './components/TaskTable';
import TaskDrawer from './components/TaskDrawer';
import KanbanBoard from './components/KanbanBoard';
import SettingsPage from './components/SettingsPage';
import AuthPage from './components/AuthPage';
import { db, id } from './services/instantDb';

const App: React.FC = () => {
  // 1. Authentication Hook - Always called first
  const { isLoading: authLoading, user } = db.useAuth();

  // 2. Stable Query Object - Stabilizing the object reference to prevent internal hook count mismatches in libraries
  const query = useMemo(() => (user ? { 
    tasks: {}, 
    projects: {}, 
    workspaces: {},
    kanbanColumns: {}
  } : null), [user?.id]); // Use user.id for stability

  // 3. Data Query Hook - Always called, reference stabilized by useMemo
  const { isLoading: queryLoading, data } = db.useQuery(query);

  // 4. UI State Hooks - Always called
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<{ type: 'status' | 'project' | 'all' | 'settings', value: string }>({ type: 'all', value: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);

  // 5. Settings State - Initialized safely
  const [settings, setSettings] = useState<UserSettings>({
    userName: 'User',
    userEmail: '',
    defaultPriority: TaskPriority.MEDIUM,
    enableAISummaries: true,
    theme: 'system'
  });

  // 6. Effect Hooks - Always called
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        userName: user.email.split('@')[0],
        userEmail: user.email
      }));
    }
  }, [user?.email]);

  useEffect(() => {
    if (queryLoading || !data || !user) return;
    const currentWorkspaces = (data.workspaces as Workspace[]) || [];
    if (currentWorkspaces.length === 0) {
      const workspaceId = id();
      const todoColId = id();
      const inProgressColId = id();
      const doneColId = id();
      db.transact([
        db.tx.workspaces[workspaceId].update({ name: 'Main Workspace', icon: '🏠', color: '#3B82F6' }),
        db.tx.kanbanColumns[todoColId].update({ title: 'To Do', isDefault: true, color: '#94A3B8', workspaceId }),
        db.tx.kanbanColumns[inProgressColId].update({ title: 'In Progress', isDefault: true, color: '#3B82F6', workspaceId }),
        db.tx.kanbanColumns[doneColId].update({ title: 'Done', isDefault: true, color: '#10B981', workspaceId })
      ]);
      setActiveWorkspaceId(workspaceId);
    } else if (!activeWorkspaceId || !currentWorkspaces.find(w => w.id === activeWorkspaceId)) {
      setActiveWorkspaceId(currentWorkspaces[0].id);
    }
  }, [queryLoading, data, activeWorkspaceId, user]);

  // 7. Data Extraction
  const workspaces = (data?.workspaces as Workspace[]) || [];
  const projects = (data?.projects as Project[]) || [];
  const tasks = (data?.tasks as Task[]) || [];
  const allKanbanColumns = (data?.kanbanColumns as KanbanColumn[]) || [];
  const kanbanColumns = useMemo(() => 
    allKanbanColumns.filter(c => c.workspaceId === activeWorkspaceId),
    [allKanbanColumns, activeWorkspaceId]
  );

  // 8. Derived State
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
                            (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesNav && matchesSearch;
    });
  }, [tasks, activeWorkspaceId, activeFilter, searchQuery]);

  const handleMoveTask = useCallback((activeId: string, overId: string, newStatus?: string) => {
    if (newStatus) {
      db.transact([db.tx.tasks[activeId].update({ status: newStatus })]);
    }
  }, []);

  // Handlers
  const handleSignOut = () => db.auth.signOut();
  const handleUpdateTask = (updatedTask: Task) => db.transact([db.tx.tasks[updatedTask.id].update(updatedTask)]);
  const handleDeleteTask = (id: string) => {
    db.transact([db.tx.tasks[id].delete()]);
    if (selectedTaskId === id) setSelectedTaskId(null);
  };
  const handleAddProject = (name: string, color: string) => db.transact([db.tx.projects[id()].update({ name, color, createdAt: new Date().toISOString(), workspaceId: activeWorkspaceId })]);
  const handleUpdateProject = (projectId: string, name: string, color: string) => db.transact([db.tx.projects[projectId].update({ name, color })]);
  const handleDeleteProject = (projectId: string) => {
    const relatedTasks = tasks.filter(t => t.projectId === projectId);
    const updates = relatedTasks.map(t => db.tx.tasks[t.id].update({ projectId: null }));
    db.transact([db.tx.projects[projectId].delete(), ...updates]);
    if (activeFilter.type === 'project' && activeFilter.value === projectId) setActiveFilter({ type: 'all', value: 'all' });
  };
  const handleAddWorkspace = (name: string, icon: string, color: string) => {
    const workspaceId = id();
    db.transact([
      db.tx.workspaces[workspaceId].update({ name, icon, color }),
      db.tx.kanbanColumns[id()].update({ title: 'To Do', isDefault: true, color: '#94A3B8', workspaceId }),
      db.tx.kanbanColumns[id()].update({ title: 'In Progress', isDefault: true, color: '#3B82F6', workspaceId }),
      db.tx.kanbanColumns[id()].update({ title: 'Done', isDefault: true, color: '#10B981', workspaceId })
    ]);
    setActiveWorkspaceId(workspaceId);
  };
  const handleUpdateWorkspace = (workspaceId: string, name: string, icon: string, color: string) => db.transact([db.tx.workspaces[workspaceId].update({ name, icon, color })]);
  const handleDeleteWorkspace = (workspaceId: string) => {
    if (workspaces.length <= 1) return;
    const relatedProjects = projects.filter(p => p.workspaceId === workspaceId);
    const relatedTasks = tasks.filter(t => t.workspaceId === workspaceId);
    const relatedCols = allKanbanColumns.filter(c => c.workspaceId === workspaceId);
    db.transact([db.tx.workspaces[workspaceId].delete(), ...relatedProjects.map(p => db.tx.projects[p.id].delete()), ...relatedTasks.map(t => db.tx.tasks[t.id].delete()), ...relatedCols.map(c => db.tx.kanbanColumns[c.id].delete())]);
    if (activeWorkspaceId === workspaceId) setActiveWorkspaceId(workspaces.find(w => w.id !== workspaceId)?.id || '');
  };
  const handleAddColumn = (title: string, color: string) => db.transact([db.tx.kanbanColumns[id()].update({ title, isDefault: false, color, workspaceId: activeWorkspaceId })]);
  const handleUpdateColumn = (columnId: string, title: string) => db.transact([db.tx.kanbanColumns[columnId].update({ title })]);
  const handleDeleteColumn = (columnId: string) => {
    const todoCol = kanbanColumns.find(c => c.title.toLowerCase() === 'to do');
    const tasksToMove = tasks.filter(t => t.status === columnId);
    db.transact([db.tx.kanbanColumns[columnId].delete(), ...tasksToMove.map(t => db.tx.tasks[t.id].update({ status: todoCol?.id || 'todo' }))]);
  };
  const handleResetData = () => {
    const relatedTasks = tasks.filter(t => t.workspaceId === activeWorkspaceId);
    const relatedProjects = projects.filter(p => p.workspaceId === activeWorkspaceId);
    db.transact([...relatedTasks.map(t => db.tx.tasks[t.id].delete()), ...relatedProjects.map(p => db.tx.projects[p.id].delete())]);
  };

  const handleAddTask = () => {
    const defaultCol = kanbanColumns.find(c => c.title.toLowerCase() === 'to do' || c.isDefault) || kanbanColumns[0];
    const taskId = id();
    db.transact([
      db.tx.tasks[taskId].update({
        title: 'New Task',
        description: '',
        status: defaultCol?.id || 'todo',
        priority: settings.defaultPriority,
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        projectId: activeFilter.type === 'project' ? activeFilter.value : null,
        workspaceId: activeWorkspaceId,
        subTasks: []
      })
    ]);
    setSelectedTaskId(taskId);
  };

  // 9. Final Rendering Logic - Consolidating into a single stable tree
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-slate-900" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Establishing Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (queryLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2"><div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce"></div></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Cloud Workspace...</span>
        </div>
      </div>
    );
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

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
        onSwitchWorkspace={setActiveWorkspaceId}
        onAddWorkspace={handleAddWorkspace}
        onUpdateWorkspace={handleUpdateWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        onSignOut={handleSignOut}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-white border-l border-slate-200 shadow-sm z-0 overflow-hidden relative">
        {activeFilter.type === 'settings' ? (
          <SettingsPage 
            projects={filteredProjects}
            settings={settings}
            onUpdateSettings={setSettings}
            onDeleteProject={handleDeleteProject}
            onUpdateProject={handleUpdateProject}
            onResetData={handleResetData}
          />
        ) : (
          <>
            <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-4 flex-1">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {activeFilter.type === 'all' ? 'Dashboard' : 
                   activeFilter.type === 'status' ? `Status: ${kanbanColumns.find(c => c.id === activeFilter.value)?.title || 'Status'}` :
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
                  <button onClick={() => setViewMode(ViewMode.LIST)} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === ViewMode.LIST ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg><span>List</span></button>
                  <button onClick={() => setViewMode(ViewMode.KANBAN)} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === ViewMode.KANBAN ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg><span>Kanban</span></button>
                </div>
                <button onClick={handleAddTask} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95">Add Task</button>
              </div>
            </header>
            <div className="flex-1 overflow-auto bg-slate-50/20">
              {viewMode === ViewMode.LIST ? (
                <TaskTable tasks={filteredTasks} projects={filteredProjects} kanbanColumns={kanbanColumns} selectedId={selectedTaskId} onSelect={setSelectedTaskId} />
              ) : (
                <KanbanBoard tasks={filteredTasks} projects={filteredProjects} columns={kanbanColumns} onSelect={setSelectedTaskId} onMoveTask={handleMoveTask} onAddColumn={handleAddColumn} onUpdateColumn={handleUpdateColumn} onDeleteColumn={handleDeleteColumn} />
              )}
            </div>
          </>
        )}
      </main>

      <TaskDrawer 
        task={selectedTask} 
        projects={filteredProjects} 
        columns={kanbanColumns} 
        onClose={() => setSelectedTaskId(null)} 
        onUpdate={handleUpdateTask} 
        onDelete={handleDeleteTask} 
      />
    </div>
  );
};

export default App;
