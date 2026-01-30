
export enum TaskStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  WAITING_INPUT = 'WAITING_INPUT',
  DONE = 'DONE',
  ABORTED = 'ABORTED'
}

export enum StepStatus {
  PENDING = 'PENDING',
  NEED_CONFIRM = 'NEED_CONFIRM',
  READY = 'READY',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export enum UIIntent {
  FORM = 'FORM',
  TABLE = 'TABLE',
  CARD = 'CARD',
  PREVIEW = 'PREVIEW',
  NONE = 'NONE'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email?: string;
  departmentId?: string;
}

export interface OrganizationNode {
  id: string;
  name: string;
  parentId?: string;
  managerId?: string;
  description?: string;
  children?: OrganizationNode[];
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  id?: string;
  isCloud?: boolean;
}

export interface Submission {
  content: string;
  attachments: Attachment[];
  submittedAt: number;
}

export interface UISchema {
  title: string;
  fields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'checkbox';
    options?: string[];
    required?: boolean;
    defaultValue?: any;
  }>;
  columns?: Array<{ key: string; label: string }>;
  data?: any[];
  items?: Array<{ id: string; title: string; description: string; image?: string }>;
  previewUrl?: string;
  content?: string;
  actions: Array<{ type: 'SUBMIT' | 'CANCEL' | 'SELECT'; label: string }>;
}

export interface Step {
  id: string;
  name: string;
  status: StepStatus;
  uiIntent: UIIntent;
  uiSchema?: UISchema;
  assignee?: User;
  submission?: Submission;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  steps: Step[];
  initiator: User;
}

export type MessageType = 'USER' | 'AI' | 'ACTION';

export interface Message {
  id: string;
  text: string;
  type: MessageType;
  timestamp: number;
  actions?: Array<{ label: string; value: string; recommended?: boolean }>;
  attachments?: Attachment[];
}

export type FileType = 'FOLDER' | 'DOC' | 'SHEET' | 'SLIDE' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'ARCHIVE' | 'OTHER';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: string;
  owner: User;
  updatedAt: number;
  isCloud: boolean;
  isStarred: boolean;
  thumbnail?: string;
  parentId?: string;
}

/* Added missing interfaces for FeedArea */
export interface FeedMedia {
  type: 'image' | 'video' | 'file';
  url: string;
  name?: string;
  thumbnail?: string;
}

export interface FeedPost {
  id: string;
  author: User;
  content: string;
  timestamp: number;
  tags: string[];
  media: FeedMedia[];
  likes: number;
  comments: number;
}
