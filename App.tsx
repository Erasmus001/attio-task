
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, Project, ViewMode } from './types';
import Sidebar from './components/Sidebar';
import TaskTable from './components/TaskTable';
import TaskDrawer from './components/TaskDrawer';
import KanbanBoard from './components/KanbanBoard';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<{ type: 'status' | 'project' | 'all', value: string }>({ type: 'all', value: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);

  // Initial dummy data
  useEffect(() => {
    const today = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    
    const initialProjects: Project[] = [
      { id: 'p1', name: 'Product Launch', color: '#3B82F6', createdAt: today },
      { id: 'p2', name: 'Internal Audit', color: '#EF4444', createdAt: today },
    ];

    const initialTasks: Task[] = [
      {
        id: '1',
        title: 'Design system review',
        description: 'Review the new color palette and spacing variables with the team.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: tomorrow,
        createdAt: today,
        projectId: 'p1',
        subTasks: [
          { id: 'st1', text: 'Review typography scale', completed: true, priority: TaskPriority.HIGH, dueDate: today },
          { id: 'st2', text: 'Check color contrast ratios', completed: false, priority: TaskPriority.MEDIUM, dueDate: tomorrow }
        ]
      },
      {
        id: '2',
        title: 'Client onboarding',
        description: 'Schedule kickoff call with Acme Corp.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        createdAt: today,
        subTasks: []
      }
    ];
    setProjects(initialProjects);
    setTasks(initialTasks);
  }, []);

  const handleAddTask = () => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Task',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      projectId: activeFilter.type === 'project' ? activeFilter.value : undefined,
      subTasks: []
    };
    setTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleReorderTasks = (activeId: string, overId: string) => {
    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      const overIndex = prev.findIndex((t) => t.id === overId);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newTasks = [...prev];
        const [removed] = newTasks.splice(activeIndex, 1);
        newTasks.splice(overIndex, 0, removed);
        return newTasks;
      }
      return prev;
    });
  };

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
    };
    setProjects(prev => [...prev, newProject]);
  };

  const handleUpdateProject = (id: string, name: string, color: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name, color } : p));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    // Orphan tasks
    setTasks(prev => prev.map(t => t.projectId === id ? { ...t, projectId: undefined } : t));
    if (activeFilter.type === 'project' && activeFilter.value === id) {
      setActiveFilter({ type: 'all', value: 'all' });
    }
  };

  const filteredTasks = tasks.filter(task => {
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

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar 
        currentFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
        onAddTask={handleAddTask}
        projects={projects}
        onAddProject={handleAddProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white border-l border-slate-200 shadow-sm overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4 flex-1">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {activeFilter.type === 'all' ? 'All Tasks' : 
               activeFilter.type === 'status' ? `Status: ${activeFilter.value}` :
               projects.find(p => p.id === activeFilter.value)?.name || 'Project'}
            </h1>
            <div className="relative max-w-sm w-full ml-4">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode(ViewMode.LIST)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  viewMode === ViewMode.LIST ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                <span>List</span>
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.KANBAN)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  viewMode === ViewMode.KANBAN ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
                <span>Kanban</span>
              </button>
            </div>

            <button 
              onClick={handleAddTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              Add task
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50/30">
          {viewMode === ViewMode.LIST ? (
            <TaskTable 
              tasks={filteredTasks} 
              projects={projects}
              selectedId={selectedTaskId} 
              onSelect={setSelectedTaskId} 
            />
          ) : (
            <KanbanBoard 
              tasks={filteredTasks} 
              projects={projects} 
              onSelect={setSelectedTaskId}
              onUpdateTask={handleUpdateTask}
              onReorderTasks={handleReorderTasks}
            />
          )}
        </div>
      </main>

      <TaskDrawer 
        task={selectedTask} 
        projects={projects}
        onClose={() => setSelectedTaskId(null)} 
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default App;
