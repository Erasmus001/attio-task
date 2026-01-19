
import React, { useMemo, useState } from 'react';
import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskPriority, Project, KanbanColumn } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  columns: KanbanColumn[];
  onSelect: (id: string) => void;
  onMoveTask: (activeId: string, overId: string, newStatus?: string) => void;
  onAddColumn: (title: string, color: string) => void;
  onUpdateColumn: (id: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
}

const KanbanCard = ({ task, project, onClick }: { task: Task, project?: Project, onClick: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id, 
    data: { type: 'Task', task } 
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH: return 'bg-red-50 text-red-700 border-red-100';
      case TaskPriority.MEDIUM: return 'bg-amber-50 text-amber-700 border-amber-100';
      case TaskPriority.LOW: return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3 group ${isDragging ? 'z-50 ring-2 ring-blue-500 border-transparent shadow-xl' : ''}`}
    >
      <div className="flex flex-col space-y-3 pointer-events-none">
        <div className="flex items-start justify-between">
          <h4 className={`text-sm font-bold text-slate-900 leading-tight ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </h4>
        </div>
        
        {project && (
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }}></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{project.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-tighter ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.subTasks && task.subTasks.length > 0 && (
              <span className="text-[10px] text-slate-400 font-medium flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
             {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

const KanbanColumnComponent = ({ 
  column, 
  tasks, 
  projects, 
  onSelect, 
  onUpdateColumn, 
  onDeleteColumn 
}: { 
  column: KanbanColumn, 
  tasks: Task[], 
  projects: Project[], 
  onSelect: (id: string) => void,
  onUpdateColumn: (id: string, title: string) => void,
  onDeleteColumn: (id: string) => void
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'Column', status: column.id }
  });

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  const handleUpdate = () => {
    if (editTitle.trim()) {
      onUpdateColumn(column.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col w-80 min-w-[20rem] h-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-4 px-2 group">
        <div className="flex items-center flex-1 min-w-0">
          <span className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: column.color || '#94A3B8' }}></span>
          {isEditing ? (
            <input 
              autoFocus
              className="bg-white border border-slate-200 text-xs font-bold text-slate-900 uppercase tracking-widest px-2 py-0.5 rounded outline-none w-full"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
            />
          ) : (
            <h3 
              className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => !column.isDefault && setIsEditing(true)}
            >
              {column.title}
            </h3>
          )}
          <span className="ml-2 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold">{tasks.length}</span>
        </div>
        
        {!column.isDefault && !isEditing && (
          <button 
            onClick={() => onDeleteColumn(column.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all rounded-md hover:bg-slate-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
      </div>
      
      <div ref={setNodeRef} className="flex-1 overflow-y-auto overflow-x-hidden min-h-[150px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard 
              key={task.id} 
              task={task} 
              project={projects.find(p => p.id === task.projectId)} 
              onClick={() => onSelect(task.id)} 
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  projects, 
  columns, 
  onSelect, 
  onMoveTask, 
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    const activeTaskData = active.data.current?.task as Task;

    if (isOverTask) {
      const overTaskData = over.data.current?.task as Task;
      if (activeTaskData.status !== overTaskData.status) {
        onMoveTask(activeId, overId, overTaskData.status);
      } else {
        onMoveTask(activeId, overId);
      }
    }

    if (isOverColumn) {
      const overStatus = over.data.current?.status as string;
      if (activeTaskData.status !== overStatus) {
        onMoveTask(activeId, overId, overStatus);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleCreateColumn = () => {
    if (newColumnTitle.trim()) {
      onAddColumn(newColumnTitle.trim(), '#64748B');
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto h-full p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 h-full pb-4">
          {columns.map(col => (
            <KanbanColumnComponent 
              key={col.id} 
              column={col} 
              tasks={tasks.filter(t => t.status === col.id)}
              projects={projects}
              onSelect={onSelect}
              onUpdateColumn={onUpdateColumn}
              onDeleteColumn={onDeleteColumn}
            />
          ))}
          
          <div className="flex flex-col w-80 min-w-[20rem] h-fit">
            {isAddingColumn ? (
              <div className="bg-white border-2 border-slate-200 border-dashed rounded-2xl p-4 space-y-3 shadow-sm">
                <input 
                  autoFocus
                  placeholder="Column name..."
                  className="w-full text-sm font-bold text-slate-900 border border-slate-200 bg-white rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
                />
                <div className="flex space-x-2">
                  <button 
                    onClick={handleCreateColumn}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    Add
                  </button>
                  <button 
                    onClick={() => setIsAddingColumn(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingColumn(true)}
                className="group flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                <span className="text-sm font-bold">Add Column</span>
              </button>
            )}
          </div>
        </div>
        
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          }),
        }}>
          {activeTask ? (
            <div className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-2xl cursor-grabbing scale-105 opacity-90">
              <h4 className="text-sm font-bold text-slate-900">{activeTask.title}</h4>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {columns.find(c => c.id === activeTask.status)?.title || activeTask.status}
                </span>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
