/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Task, Project, Category, NotificationItem, UserProfile } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId according to Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test according to Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is waiting.');
      return false;
    }
    // Non-fatal if test doc does not exist yet or permissions are restricted
    return true;
  }
}

// Safe ID generator that strictly conforms to '^[a-zA-Z0-9_\\-]+$' and length <= 128
export function generateSafeId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomSuffix}`;
}

// --- Firestore API Wrappers with Error Handling ---

export async function saveTask(task: Task): Promise<void> {
  const path = `tasks/${task.id}`;
  try {
    // Sanitize payload to match firestore.rules and blueprint constraints
    const cleanTask: Task = {
      id: task.id,
      taskCode: (task.taskCode || 'AT-001').slice(0, 64),
      title: task.title.slice(0, 256),
      projectId: task.projectId.slice(0, 128),
      status: task.status,
      ...(task.projectName ? { projectName: task.projectName.slice(0, 256) } : {}),
      ...(task.categoryId ? { categoryId: task.categoryId.slice(0, 128) } : {}),
      ...(task.categoryName ? { categoryName: task.categoryName.slice(0, 256) } : {}),
      ...(task.taskType ? { taskType: task.taskType.slice(0, 128) } : {}),
      ...(task.requester ? { requester: task.requester.slice(0, 128) } : {}),
      ...(task.assignedUserId ? { assignedUserId: task.assignedUserId.slice(0, 128) } : {}),
      ...(task.assignedUserName ? { assignedUserName: task.assignedUserName.slice(0, 128) } : {}),
      ...(task.priority ? { priority: task.priority } : {}),
      ...(task.createdDate ? { createdDate: task.createdDate } : {}),
      ...(task.deadline ? { deadline: task.deadline } : {}),
      ...(task.designBrief ? { designBrief: task.designBrief.slice(0, 5000) } : {}),
      ...(task.figmaUrl ? { figmaUrl: task.figmaUrl.slice(0, 1000) } : {}),
      ...(task.assetsUrl ? { assetsUrl: task.assetsUrl.slice(0, 1000) } : {}),
      ...(task.specsDimensions ? { specsDimensions: task.specsDimensions.slice(0, 256) } : {}),
      ...(task.fileFormat ? { fileFormat: task.fileFormat.slice(0, 128) } : {}),
      ...(task.checklist ? { checklist: task.checklist } : {}),
      ...(task.comments ? { comments: task.comments } : {}),
      revisionCount: Number(task.revisionCount ?? 0),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'tasks', task.id), cleanTask);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateTaskPartial(id: string, updates: Partial<Task>): Promise<void> {
  const path = `tasks/${id}`;
  try {
    const payload: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    if (updates.title) payload.title = updates.title.slice(0, 256);
    if (updates.designBrief) payload.designBrief = updates.designBrief.slice(0, 5000);
    await updateDoc(doc(db, 'tasks', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeTask(id: string): Promise<void> {
  const path = `tasks/${id}`;
  try {
    await deleteDoc(doc(db, 'tasks', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveProject(project: Project): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    const cleanProject: Project = {
      id: project.id,
      name: project.name.slice(0, 256),
      ...(project.description ? { description: project.description.slice(0, 1000) } : {}),
      ...(project.color ? { color: project.color.slice(0, 64) } : {}),
      createdAt: project.createdAt || new Date().toISOString()
    };
    await setDoc(doc(db, 'projects', project.id), cleanProject);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCategory(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    const cleanCategory: Category = {
      id: category.id,
      name: category.name.slice(0, 256),
      type: category.type
    };
    await setDoc(doc(db, 'categories', category.id), cleanCategory);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveNotification(notification: NotificationItem): Promise<void> {
  const path = `notifications/${notification.id}`;
  try {
    const cleanNotification: NotificationItem = {
      id: notification.id,
      userId: notification.userId,
      title: notification.title.slice(0, 256),
      message: notification.message.slice(0, 1000),
      ...(notification.type ? { type: notification.type } : {}),
      read: Boolean(notification.read),
      createdAt: notification.createdAt || new Date().toISOString()
    };
    await setDoc(doc(db, 'notifications', notification.id), cleanNotification);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeUserProfile(id: string): Promise<void> {
  const path = `users/${id}`;
  try {
    await deleteDoc(doc(db, 'users', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllStudioData(options: { wipeAll?: boolean } = { wipeAll: true }): Promise<void> {
  try {
    // 1. Delete all tasks
    const tasksSnap = await getDocs(collection(db, 'tasks'));
    const deleteTasksPromises = tasksSnap.docs.map(d => deleteDoc(doc(db, 'tasks', d.id)));
    await Promise.all(deleteTasksPromises);

    // 2. Delete all notifications
    const notifSnap = await getDocs(collection(db, 'notifications'));
    const deleteNotifPromises = notifSnap.docs.map(d => deleteDoc(doc(db, 'notifications', d.id)));
    await Promise.all(deleteNotifPromises);

    if (options.wipeAll) {
      // 3. Delete projects
      const projSnap = await getDocs(collection(db, 'projects'));
      const deleteProjPromises = projSnap.docs.map(d => deleteDoc(doc(db, 'projects', d.id)));
      await Promise.all(deleteProjPromises);

      // 4. Delete categories
      const catSnap = await getDocs(collection(db, 'categories'));
      const deleteCatPromises = catSnap.docs.map(d => deleteDoc(doc(db, 'categories', d.id)));
      await Promise.all(deleteCatPromises);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'batch-reset');
  }
}
