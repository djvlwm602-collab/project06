export type Priority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';

export type TaskType = 'Story' | 'Bug' | 'Task';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Task {
  id: string;
  key: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  phone: string;
  assignedDate: string;
  firstCallDate: string;
  recentCallDate: string;
  tag: '종합진단' | '보험료점검' | '보장확대';
  callCount: number;
  isCancelled?: boolean;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  group?: '상담 대기' | '상담 중';
}

export interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

