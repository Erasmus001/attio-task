
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum ViewMode {
  LIST = 'list',
  KANBAN = 'kanban'
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  summary?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  projectId?: string;
  subTasks?: SubTask[];
}

export interface AIResponse {
  description: string;
  priority: TaskPriority;
  subTasks: string[];
}
