
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
import { Task, TaskStatus, TaskPriority, Project } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  onSelect: (id: string) => void;
  onMoveTask: (activeId: string, overId: string, newStatus?: TaskStatus) => void;
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

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

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

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, projects, onSelect, onMoveTask }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increased for stability
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

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

    // Moving a task over another task
    if (isOverTask) {
      const overTaskData = over.data.current?.task as Task;
      if (activeTaskData.status !== overTaskData.status) {
        // CROSS COLUMN MOVE
        onMoveTask(activeId, overId, overTaskData.status);
      } else {
        // SAME COLUMN REORDER
        onMoveTask(activeId, overId);
      }
    }

    // Moving a task over an empty column
    if (isOverColumn) {
      const overStatus = over.data.current?.status as TaskStatus;
      if (activeTaskData.status !== overStatus) {
        onMoveTask(activeId, overId, overStatus);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  return (
    <div className="flex-1 overflow-x-auto h-full p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection} // More reliable for vertical columns
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
                  {activeTask.status}
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
