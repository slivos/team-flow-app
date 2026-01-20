export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Assignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  priority?: Priority;
  tags?: Tag[];
  assignees?: Assignee[];
  dueDate?: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface BoardState {
  columns: Column[];
  cards: Card[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}
