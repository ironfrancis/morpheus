export interface TimelineEvent {
  id: string;
  date: string; // ISO 8601 or YYYY-MM-DD
  title: string;
  summary: string;
  body?: string;
  typeSlug: string; // 'task' | 'plan-item' | 'record-entry' | 'bug-feedback' | 'custom'
  importance: number; // 0-5 (0 is highest, like P0)
  projectSlug?: string;
  assignee?: string;
  deadline?: string;
  subtasks?: { title: string; completed: boolean }[];
  tags: string[];
}

export interface BoardCard {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed' | 'backlog';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  summary: string;
  assignee?: string;
  dueDate?: string;
  tags: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'project' | 'event' | 'document' | 'task' | 'tag';
  importance?: number;
  val: number; // Node size/weight
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'belongs_to' | 'dependency' | 'related' | 'author';
}

export interface ParsedData {
  projectName: string;
  projectSlug: string;
  projectDescription: string;
  events: TimelineEvent[];
  cards: BoardCard[];
  nodes: GraphNode[];
  links: GraphLink[];
}
