
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
  KANBAN = 'kanban',
  SETTINGS = 'settings'
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  workspaceId: string;
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
  workspaceId: string;
  subTasks?: SubTask[];
}

export interface UserSettings {
  userName: string;
  userEmail: string;
  defaultPriority: TaskPriority;
  enableAISummaries: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface AIResponse {
  description: string;
  priority: TaskPriority;
  subTasks: string[];
}
