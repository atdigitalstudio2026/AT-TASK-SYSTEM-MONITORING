/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 
  | 'DRAFT'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION'
  | 'APPROVED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type CategoryType = 'DESIGN' | 'CONTENT' | 'BOTH';

export type UserRole = 'ADMIN' | 'MANAGER' | 'DESIGNER' | 'CONTENT_CREATOR';

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorRole?: string;
  text: string;
  createdAt: string;
  type?: 'comment' | 'revision' | 'approval';
}

export interface Task {
  id: string;
  taskCode: string;
  title: string;
  projectId: string;
  projectName?: string;
  categoryId?: string;
  categoryName?: string;
  taskType?: string;
  requester?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  createdDate?: string;
  deadline?: string;
  designBrief?: string;
  revisionCount?: number;
  updatedAt?: string;
  // Creative specifications & deliverable assets
  figmaUrl?: string;
  assetsUrl?: string;
  specsDimensions?: string;
  fileFormat?: string;
  checklist?: TaskChecklistItem[];
  comments?: TaskComment[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface FilterState {
  search: string;
  projectId: string;
  categoryId: string;
  priority: string;
  status: string;
  assignedUserId: string;
  viewMode: 'kanban' | 'table' | 'calendar';
}
