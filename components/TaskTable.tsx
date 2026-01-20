
import React from 'react';
import { Task, TaskPriority, Project, KanbanColumn } from '../types';

interface TaskTableProps {
  tasks: Task[];
  projects: Project[];
  kanbanColumns: KanbanColumn[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, projects, kanbanColumns, selectedId, onSelect }) => {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH: return 'bg-red-50 text-red-700 border-red-100';
      case TaskPriority.MEDIUM: return 'bg-amber-50 text-amber-700 border-amber-100';
      case TaskPriority.LOW: return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusColor = (statusId: string) => {
    const col = kanbanColumns.find(c => c.id === statusId);
    if (!col) return 'bg-slate-50 text-slate-700 border-slate-100';
    
    if (statusId === 'done') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (statusId === 'in-progress') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (statusId === 'todo') return 'bg-slate-50 text-slate-700 border-slate-100';

    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <p className="text-sm font-medium">No tasks found</p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50 sticky top-0 z-10">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Task</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-100">
        {tasks.map((task) => {
          const project = projects.find(p => p.id === task.projectId);
          const column = kanbanColumns.find(c => c.id === task.status);
          return (
            <tr 
              key={task.id} 
              onClick={() => onSelect(task.id)}
              className={`cursor-pointer transition-colors group ${
                selectedId === task.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </span>
                  <span className="text-xs text-slate-500 truncate max-w-md">{task.description}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {project ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-200" style={{ backgroundColor: project.color }}></div>
                    <span className="text-xs font-semibold text-slate-700">{project.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No project</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {column?.title || task.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TaskTable;
