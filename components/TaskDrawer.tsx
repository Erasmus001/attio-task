
import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskPriority, SubTask, Project, KanbanColumn } from '../types';
import { refineTask, generateSummary } from '../services/gemini';

interface TaskDrawerProps {
  task: Task | null;
  projects: Project[];
  columns: KanbanColumn[];
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskDrawer: React.FC<TaskDrawerProps> = ({ task, projects, columns, onClose, onUpdate, onDelete }) => {
  const [isRefining, setIsRefining] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');
  const [newSubTaskText, setNewSubTaskText] = useState('');
  const [newSubTaskPriority, setNewSubTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newSubTaskDueDate, setNewSubTaskDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const playClickSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, context.currentTime + 0.1);

      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio feedback failed:", e);
    }
  }, []);

  useEffect(() => {
    if (task) {
      setLocalTitle(task.title);
      setLocalDesc(task.description);
      setShowDeleteConfirm(false);
    }
  }, [task]);

  if (!task) return null;

  const handleRefine = async () => {
    if (!localTitle) return;
    setIsRefining(true);
    const result = await refineTask(localTitle);
    if (result) {
      const mappedSubTasks: SubTask[] = result.subTasks.map(text => ({
        id: Math.random().toString(36).substr(2, 9),
        text,
        completed: false,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date().toISOString()
      }));

      onUpdate({
        ...task,
        description: result.description,
        priority: result.priority,
        subTasks: mappedSubTasks
      });
      setLocalDesc(result.description);
    }
    setIsRefining(false);
  };

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    const summary = await generateSummary(localTitle, localDesc);
    if (summary) {
      updateField('summary', summary);
    }
    setIsSummarizing(false);
  };

  const updateField = <K extends keyof Task>(field: K, value: Task[K]) => {
    onUpdate({ ...task, [field]: value });
  };

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskText.trim()) return;
    
    const newSubTask: SubTask = {
      id: Math.random().toString(36).substr(2, 9),
      text: newSubTaskText.trim(),
      completed: false,
      priority: newSubTaskPriority,
      dueDate: new Date(newSubTaskDueDate).toISOString()
    };
    
    const currentSubTasks = task.subTasks || [];
    updateField('subTasks', [...currentSubTasks, newSubTask]);
    setNewSubTaskText('');
    setNewSubTaskPriority(TaskPriority.MEDIUM);
    setNewSubTaskDueDate(new Date().toISOString().split('T')[0]);
  };

  const removeSubTask = (id: string) => {
    const currentSubTasks = task.subTasks || [];
    const updated = currentSubTasks.filter((st) => st.id !== id);
    updateField('subTasks', updated);
  };

  const toggleSubTask = (id: string) => {
    playClickSound();
    const currentSubTasks = task.subTasks || [];
    const updated = currentSubTasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    updateField('subTasks', updated);
  };

  const updateSubTaskPriority = (id: string, priority: TaskPriority) => {
    const currentSubTasks = task.subTasks || [];
    const updated = currentSubTasks.map(st => 
      st.id === id ? { ...st, priority } : st
    );
    updateField('subTasks', updated);
  };

  const updateSubTaskDueDate = (id: string, dueDate: string) => {
    const currentSubTasks = task.subTasks || [];
    const updated = currentSubTasks.map(st => 
      st.id === id ? { ...st, dueDate: new Date(dueDate).toISOString() } : st
    );
    updateField('subTasks', updated);
  };

  const getSubTaskPriorityStyle = (priority: TaskPriority, isCompleted: boolean) => {
    if (isCompleted) return 'text-slate-400 bg-slate-50 border-slate-100 opacity-60';
    switch (priority) {
      case TaskPriority.HIGH: return 'text-red-600 bg-red-50 border-red-100';
      case TaskPriority.MEDIUM: return 'text-amber-600 bg-amber-50 border-amber-100';
      case TaskPriority.LOW: return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`fixed inset-0 z-40 flex justify-end transition-opacity duration-300 ${task ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      <div className={`relative w-full md:w-2/5 bg-white border-l border-slate-200 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out h-full overflow-hidden flex flex-col ${task ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors">
              Delete Task
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            <input 
              type="text" 
              value={localTitle}
              onChange={(e) => {
                setLocalTitle(e.target.value);
                updateField('title', e.target.value);
              }}
              placeholder="Task title"
              className="w-full text-2xl font-bold text-slate-900 bg-white border-none focus:ring-0 placeholder-slate-400 p-0"
            />

            <div className="grid grid-cols-2 gap-4 md:gap-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project</label>
                <select 
                  value={task.projectId || ''}
                  onChange={(e) => updateField('projectId', e.target.value || undefined)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">No Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select 
                  value={task.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                <select 
                  value={task.priority}
                  onChange={(e) => updateField('priority', e.target.value as TaskPriority)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={TaskPriority.LOW}>Low</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.HIGH}>High</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                <input 
                  type="date"
                  value={task.dueDate.split('T')[0]}
                  onChange={(e) => updateField('dueDate', new Date(e.target.value).toISOString())}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <button onClick={handleRefine} disabled={isRefining} className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50">
                  {isRefining ? <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  AI Refine
                </button>
              </div>
              <textarea 
                rows={4}
                value={localDesc}
                onChange={(e) => { setLocalDesc(e.target.value); updateField('description', e.target.value); }}
                className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Summary</label>
                <button onClick={handleGenerateSummary} disabled={isSummarizing || !localTitle} className="flex items-center text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  {isSummarizing ? '...' : 'Generate'}
                </button>
              </div>
              <div className={`p-4 rounded-xl border transition-all duration-300 min-h-[60px] flex items-center ${task.summary ? 'bg-blue-50 border-blue-100 italic text-blue-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                <p className="text-xs font-medium leading-relaxed">{task.summary || "Click generate to create an AI summary."}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Sub-tasks</label>
              </div>
              <div className="space-y-3 mb-6">
                {task.subTasks?.map((st) => (
                  <div key={st.id} className={`group flex flex-col space-y-3 p-4 bg-white border rounded-xl shadow-sm ${st.completed ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200'}`}>
                    <div className="flex items-start space-x-3">
                      <button onClick={() => toggleSubTask(st.id)} className={`mt-0.5 w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center transition-all ${st.completed ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}>
                        {st.completed && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <span className={`flex-1 text-sm font-semibold leading-tight ${st.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{st.text}</span>
                      <button onClick={() => removeSubTask(st.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-4">
                <form onSubmit={handleAddSubTask} className="flex flex-col space-y-3">
                  <input 
                    type="text"
                    value={newSubTaskText}
                    onChange={(e) => setNewSubTaskText(e.target.value)}
                    placeholder="Add sub-task..."
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                  <button type="submit" disabled={!newSubTaskText.trim()} className="bg-blue-600 text-white text-xs font-bold py-1.5 rounded-lg disabled:opacity-50">Add Item</button>
                </form>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 font-bold">
            <button onClick={onClose} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-100 shadow-sm transition-all font-bold">Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDrawer;
