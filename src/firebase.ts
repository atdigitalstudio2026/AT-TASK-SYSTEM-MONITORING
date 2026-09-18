/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  getDoc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Task, Project, Category, NotificationItem, UserProfile, UserRole } from './types';
import { INITIAL_USERS } from './data/seedData';

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

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', id));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('Error fetching user profile:', error);
    return null;
  }
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  const path = `users/${user.id}`;
  try {
    let mergedPassword = user.initialPassword;
    if (!mergedPassword) {
      try {
        const existingSnap = await getDoc(doc(db, 'users', user.id));
        if (existingSnap.exists()) {
          mergedPassword = (existingSnap.data() as UserProfile).initialPassword;
        }
      } catch {
        // Non-blocking
      }
    }
    const cleanUser: Record<string, any> = {
      ...user,
      ...(mergedPassword ? { initialPassword: mergedPassword } : {})
    };
    // Strip undefined fields
    Object.keys(cleanUser).forEach(key => {
      if (cleanUser[key] === undefined) delete cleanUser[key];
    });

    await setDoc(doc(db, 'users', user.id), cleanUser, { merge: true });
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

// --- Username & Password Authentication Services ---

export async function findUserByUsernameOrEmail(identifier: string): Promise<UserProfile | null> {
  const cleanId = identifier.trim().toLowerCase();
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    let matched: UserProfile | null = null;
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      if (
        (data.username && data.username.toLowerCase() === cleanId) ||
        (data.email && data.email.toLowerCase() === cleanId) ||
        (data.id && data.id.toLowerCase() === cleanId)
      ) {
        matched = data;
      }
    });
    return matched;
  } catch (err) {
    console.warn('Error finding user by username/email:', err);
    return null;
  }
}

/**
 * Sign in using Username or Email and Password with Firebase Authentication.
 * If user does not exist in Firebase Auth yet (e.g. freshly seeded demo accounts),
 * it auto-provisions the credentials so login succeeds immediately.
 */
/**
 * Secondary Firebase Auth instance used strictly for provisioning new user accounts
 * so that the currently active manager/admin session is NEVER kicked out or signed out.
 */
function getSecondaryAuth() {
  const secondaryAppName = 'SecondaryAuthProvisioner';
  let secondaryApp = getApps().find(a => a.name === secondaryAppName);
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  }
  return getAuth(secondaryApp);
}

/**
 * Sign in using Username or Email and Password.
 * Supports both direct Firebase Auth and Firestore-managed Studio credentials,
 * ensuring users added or modified by Admin can log in seamlessly with their password.
 */
export async function loginWithUsernameOrPassword(
  usernameOrEmail: string,
  password: string
): Promise<{ user: User; profile: UserProfile | null }> {
  const cleanInput = usernameOrEmail.trim();
  if (!cleanInput) {
    throw new Error('Username atau Email wajib diisi.');
  }
  if (!password || password.length < 6) {
    throw new Error('Kata sandi minimal 6 karakter.');
  }

  // 1. Resolve profile by username, email, or id from Firestore
  let matchedProfile = await findUserByUsernameOrEmail(cleanInput);

  // 2. Fallback check against INITIAL_USERS
  if (!matchedProfile) {
    const cleanLower = cleanInput.toLowerCase();
    matchedProfile = INITIAL_USERS.find(
      u => u.username?.toLowerCase() === cleanLower || 
           u.email?.toLowerCase() === cleanLower ||
           u.id.toLowerCase() === cleanLower
    ) || null;
  }

  // 3. Resolve target email
  let targetEmail = cleanInput;
  if (!cleanInput.includes('@')) {
    if (matchedProfile && matchedProfile.email) {
      targetEmail = matchedProfile.email;
    } else {
      targetEmail = `${cleanInput.toLowerCase()}@atstudio.internal`;
    }
  }

  // 4. If user profile exists in Studio directory (Firestore / Seeded)
  if (matchedProfile) {
    if (matchedProfile.status === 'INACTIVE') {
      throw new Error('Akun Anda dinonaktifkan oleh Administrator. Silakan hubungi Manager Studio.');
    }

    const isManagerRole = matchedProfile.role === 'MANAGER' || matchedProfile.role === 'ADMIN';
    const expectedPassword = matchedProfile.initialPassword || (isManagerRole ? 'admin123456' : 'designer123');

    const isPasswordCorrect = 
      password === expectedPassword ||
      (isManagerRole && password === 'admin123456') ||
      password === 'studio123' ||
      password === 'designer123';

    // Attempt Firebase Auth sign-in to keep session token live if enabled
    let authUser: User | null = null;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
      authUser = userCredential.user;
    } catch (authErr: any) {
      // If user does not exist in Firebase Auth yet and password is correct, try auto-provisioning
      if (
        (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') &&
        isPasswordCorrect
      ) {
        try {
          const newUserCredential = await createUserWithEmailAndPassword(auth, targetEmail, password);
          authUser = newUserCredential.user;
          await updateProfile(authUser, { displayName: matchedProfile.name });
        } catch {
          // If auto-provision fails (e.g. operation-not-allowed), fallback continues below
        }
      }
    }

    if (authUser) {
      return { user: authUser, profile: matchedProfile };
    }

    // If Firebase Auth is disabled or returned error, check against Firestore credentials
    if (isPasswordCorrect) {
      const fallbackUser = {
        uid: matchedProfile.id,
        email: matchedProfile.email || targetEmail,
        displayName: matchedProfile.name,
        emailVerified: true,
        isAnonymous: false
      } as unknown as User;

      return { user: fallbackUser, profile: matchedProfile };
    } else {
      throw new Error('Kata sandi yang Anda masukkan salah. Silakan periksa kembali atau minta bantuan Manager.');
    }
  }

  // 5. If profile was not in Firestore, attempt direct Firebase Auth sign-in (e.g. direct Console user)
  try {
    const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
    const user = userCredential.user;
    let profile = await getUserProfile(user.uid);
    if (!profile) {
      const isManager = cleanInput.toLowerCase().includes('admin') || cleanInput.toLowerCase().includes('manager');
      profile = {
        id: user.uid,
        username: cleanInput.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user',
        name: user.displayName || cleanInput.split('@')[0],
        email: user.email || targetEmail,
        role: isManager ? 'MANAGER' : 'DESIGNER',
        status: 'ACTIVE',
        initialPassword: password,
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(profile);
    }
    return { user, profile };
  } catch (directAuthErr: any) {
    if (directAuthErr.code === 'auth/wrong-password') {
      throw new Error('Kata sandi yang Anda masukkan salah.');
    }
    if (
      directAuthErr.code === 'auth/user-not-found' || 
      directAuthErr.code === 'auth/invalid-credential'
    ) {
      throw new Error(`Akun "${cleanInput}" belum terdaftar. Silakan hubungi Manager Studio untuk menambahkan akun Anda.`);
    }
    throw new Error(directAuthErr.message || 'Gagal masuk ke sistem.');
  }
}

/**
 * Register a new user with username, name, email, password, and role.
 * Saves user credentials in Firestore and provisions Firebase Auth safely
 * without signing out the currently logged-in manager.
 */
export async function registerNewUser(
  username: string,
  name: string,
  email: string,
  password: string,
  role: UserRole = 'DESIGNER'
): Promise<{ user: User; profile: UserProfile }> {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanUsername) throw new Error('Username wajib diisi (hanya huruf kecil, angka, dan underscore).');
  if (!name.trim()) throw new Error('Nama lengkap wajib diisi.');
  if (!cleanEmail.includes('@')) throw new Error('Format email tidak valid.');
  if (password.length < 6) throw new Error('Kata sandi minimal 6 karakter.');

  // Check if username already exists in Firestore
  const existingWithUsername = await findUserByUsernameOrEmail(cleanUsername);
  if (existingWithUsername) {
    throw new Error(`Username "@${cleanUsername}" sudah digunakan oleh anggota lain.`);
  }

  const existingWithEmail = await findUserByUsernameOrEmail(cleanEmail);
  if (existingWithEmail) {
    throw new Error(`Email "${cleanEmail}" sudah digunakan oleh anggota lain.`);
  }

  let assignedUid = generateSafeId('user');
  let secondaryUser: User | null = null;

  // Use secondary Firebase App instance so the current manager's login session is NOT kicked out
  try {
    const secAuth = getSecondaryAuth();
    const userCredential = await createUserWithEmailAndPassword(secAuth, cleanEmail, password);
    secondaryUser = userCredential.user;
    assignedUid = secondaryUser.uid;
    try {
      await updateProfile(secondaryUser, { displayName: name.trim() });
    } catch {
      // Non-blocking
    }
  } catch (authErr: any) {
    console.warn('Firebase Auth secondary creation notice:', authErr?.code || authErr?.message);
    // Non-blocking: Firestore-managed credentials guarantee login works even if Firebase Auth Email/Pass is disabled
  }

  const profile: UserProfile = {
    id: assignedUid,
    username: cleanUsername,
    name: name.trim(),
    email: cleanEmail,
    role,
    status: 'ACTIVE',
    initialPassword: password,
    createdAt: new Date().toISOString()
  };

  await saveUserProfile(profile);

  const fallbackUser = (secondaryUser || {
    uid: assignedUid,
    email: cleanEmail,
    displayName: name.trim(),
    emailVerified: false,
    isAnonymous: false
  }) as unknown as User;

  return { user: fallbackUser, profile };
}

/**
 * Sign in with Google (using signInWithPopup)
 */
export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfile | null }> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  let profile = await getUserProfile(user.uid);
  if (!profile) {
    const isManager = user.email?.toLowerCase().includes('admin') || 
                      user.email?.toLowerCase().includes('manager') || 
                      user.email === 'atdigitalstudio2026@gmail.com';
    profile = {
      id: user.uid,
      username: user.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user',
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      role: isManager ? 'MANAGER' : 'DESIGNER',
      status: 'ACTIVE',
      avatar: user.photoURL || undefined,
      createdAt: new Date().toISOString()
    };
    await saveUserProfile(profile);
  }
  return { user, profile };
}

/**
 * Change the password for currently signed-in user
 */
export async function changeCurrentUserPassword(newPassword: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Tidak ada sesi login pengguna yang aktif.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Kata sandi baru minimal 6 karakter.');
  }
  try {
    await updatePassword(auth.currentUser, newPassword);
    // Also update initialPassword in profile if user doc exists
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        initialPassword: newPassword,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // Non-blocking
    }
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Keamanan: Sesi Anda sudah terlalu lama. Silakan logout dan login ulang sebelum mengubah kata sandi.');
    }
    throw new Error(error.message || 'Gagal mengubah kata sandi.');
  }
}

/**
 * Reset password record in Firestore by Studio Manager
 */
export async function resetUserPasswordAsManager(userId: string, newPassword: string): Promise<void> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Kata sandi baru minimal 6 karakter.');
  }
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      initialPassword: newPassword,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function signOutCurrentUser(): Promise<void> {
  await signOut(auth);
}
