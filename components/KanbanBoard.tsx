
import React from 'react';
import {
  DndContext,
  closestCorners,
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus, TaskPriority, Project, ViewMode } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  onSelect: (id: string) => void;
  onUpdateTask: (task: Task) => void;
}

const KanbanCard = ({ task, project, onClick }: { task: Task, project?: Project, onClick: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
      className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3 group ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <h4 className={`text-sm font-bold text-slate-900 leading-tight ${task.status === TaskStatus.DONE ? 'line-through opacity-50' : ''}`}>
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

const KanbanColumn = ({ status, tasks, projects, onSelect }: { status: TaskStatus, tasks: Task[], projects: Project[], onSelect: (id: string) => void }) => {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status }
  });

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.DONE: return 'Done';
    }
  };

  return (
    <div className="flex flex-col w-80 min-w-[20rem] h-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${
            status === TaskStatus.TODO ? 'bg-slate-400' :
            status === TaskStatus.IN_PROGRESS ? 'bg-blue-500' : 'bg-emerald-500'
          }`}></span>
          {getStatusLabel(status)}
          <span className="ml-2 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold">{tasks.length}</span>
        </h3>
      </div>
      
      <div ref={setNodeRef} className="flex-1 overflow-y-auto overflow-x-hidden min-h-[100px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
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

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, projects, onSelect, onUpdateTask }) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

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

  const columns = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Moving a task over another task
    if (isOverTask) {
      const activeTask = active.data.current?.task as Task;
      const overTask = over.data.current?.task as Task;

      if (activeTask.status !== overTask.status) {
        onUpdateTask({ ...activeTask, status: overTask.status });
      }
    }

    // Moving a task over a column
    if (isOverColumn) {
      const activeTask = active.data.current?.task as Task;
      const overStatus = over.data.current?.status as TaskStatus;

      if (activeTask.status !== overStatus) {
        onUpdateTask({ ...activeTask, status: overStatus });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    
    // Additional logic if sorting within the same column is needed
  };

  return (
    <div className="flex-1 overflow-x-auto h-full p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 h-full pb-4">
          {columns.map(status => (
            <KanbanColumn 
              key={status} 
              status={status} 
              tasks={tasks.filter(t => t.status === status)}
              projects={projects}
              onSelect={onSelect}
            />
          ))}
        </div>
        
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeTask ? (
            <div className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-xl cursor-grabbing rotate-3">
              <h4 className="text-sm font-bold text-slate-900">{activeTask.title}</h4>
              <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {activeTask.status}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
