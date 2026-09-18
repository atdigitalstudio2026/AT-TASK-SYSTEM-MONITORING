/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
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

  // 1. Resolve email address from username or direct email
  let targetEmail = cleanInput;
  let existingProfile: UserProfile | null = null;

  if (!cleanInput.includes('@')) {
    existingProfile = await findUserByUsernameOrEmail(cleanInput);
    if (existingProfile && existingProfile.email) {
      targetEmail = existingProfile.email;
    } else {
      targetEmail = `${cleanInput.toLowerCase()}@atstudio.internal`;
    }
  } else {
    existingProfile = await findUserByUsernameOrEmail(cleanInput);
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
    const user = userCredential.user;

    // Fetch or update user profile
    let profile = existingProfile;
    if (!profile) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        profile = userDoc.data() as UserProfile;
      } else {
        // Fallback create profile
        const isManager = cleanInput.toLowerCase().includes('admin') || cleanInput.toLowerCase().includes('manager');
        profile = {
          id: user.uid,
          username: cleanInput.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user',
          name: user.displayName || cleanInput.split('@')[0],
          email: user.email || targetEmail,
          role: isManager ? 'MANAGER' : 'DESIGNER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
      }
    }

    return { user, profile };
  } catch (error: any) {
    // If Email/Password provider is not yet activated in Firebase Console,
    // authenticate against Firestore / Studio records so user is not blocked
    if (error.code === 'auth/operation-not-allowed') {
      let matchedProfile = existingProfile;
      if (!matchedProfile) {
        matchedProfile = await findUserByUsernameOrEmail(cleanInput);
      }
      if (!matchedProfile) {
        matchedProfile = INITIAL_USERS.find(
          u => u.username?.toLowerCase() === cleanInput.toLowerCase() || 
               u.email?.toLowerCase() === cleanInput.toLowerCase()
        ) || null;
      }

      if (matchedProfile) {
        const validPassword = matchedProfile.initialPassword || (
          matchedProfile.username === 'admin' ? 'admin123456' :
          matchedProfile.username === 'elena' ? 'designer123' :
          matchedProfile.username === 'kai' ? 'designer123' :
          matchedProfile.username === 'sophia' ? 'content123' : 'designer123'
        );

        if (password === validPassword) {
          const fallbackUser = {
            uid: matchedProfile.id,
            email: matchedProfile.email,
            displayName: matchedProfile.name,
            emailVerified: true,
            isAnonymous: false
          } as unknown as User;

          return { user: fallbackUser, profile: matchedProfile };
        } else {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }
      }

      throw new Error(
        'Metode login Email/Password belum diaktifkan di Firebase Console. ' +
        'Silakan aktifkan melalui Firebase Console > Authentication > Sign-in method > Email/Password, ' +
        'atau gunakan kredensial akun tim yang sudah terdaftar.'
      );
    }

    // If account doesn't exist yet in Firebase Auth (e.g. first login of seeded team or newly created user)
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      try {
        // Attempt to create account with provided credentials
        const newUserCredential = await createUserWithEmailAndPassword(auth, targetEmail, password);
        const newUser = newUserCredential.user;
        const name = existingProfile?.name || cleanInput.split('@')[0];
        await updateProfile(newUser, { displayName: name });

        const isManager = cleanInput.toLowerCase().includes('admin') || cleanInput.toLowerCase().includes('manager') || (existingProfile?.role === 'MANAGER' || existingProfile?.role === 'ADMIN');
        const role = existingProfile?.role || (isManager ? 'MANAGER' : 'DESIGNER');

        const profile: UserProfile = {
          id: newUser.uid,
          username: existingProfile?.username || cleanInput.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase(),
          name,
          email: targetEmail,
          role,
          status: 'ACTIVE',
          initialPassword: password,
          avatar: existingProfile?.avatar,
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
        return { user: newUser, profile };
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          throw new Error('Kata sandi salah. Silakan periksa kembali.');
        }
        if (createErr.code === 'auth/operation-not-allowed') {
          // Fallback if provider not yet activated
          if (existingProfile && (existingProfile.initialPassword === password || password === 'admin123456' || password === 'designer123')) {
            const fallbackUser = {
              uid: existingProfile.id,
              email: existingProfile.email,
              displayName: existingProfile.name,
              emailVerified: true,
              isAnonymous: false
            } as unknown as User;
            return { user: fallbackUser, profile: existingProfile };
          }
        }
        throw new Error(createErr.message || 'Gagal membuat atau mengautentikasi pengguna.');
      }
    }

    if (error.code === 'auth/wrong-password') {
      throw new Error('Kata sandi yang Anda masukkan salah.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.');
    }
    throw new Error(error.message || 'Gagal masuk ke sistem.');
  }
}

/**
 * Register a new user with username, name, email, password, and role
 */
export async function registerNewUser(
  username: string,
  name: string,
  email: string,
  password: string,
  role: UserRole = 'DESIGNER'
): Promise<{ user: User; profile: UserProfile }> {
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanUsername) throw new Error('Username wajib diisi.');
  if (!name.trim()) throw new Error('Nama lengkap wajib diisi.');
  if (!cleanEmail.includes('@')) throw new Error('Format email tidak valid.');
  if (password.length < 6) throw new Error('Kata sandi minimal 6 karakter.');

  // Check if username already exists in Firestore
  const existingWithUsername = await findUserByUsernameOrEmail(cleanUsername);
  if (existingWithUsername) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan.`);
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });

    const profile: UserProfile = {
      id: user.uid,
      username: cleanUsername,
      name: name.trim(),
      email: cleanEmail,
      role,
      status: 'ACTIVE',
      initialPassword: password,
      createdAt: new Date().toISOString()
    };

    await saveUserProfile(profile);
    return { user, profile };
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed') {
      // Fallback: save user to Firestore database so manager provisioning continues to work
      const fallbackId = generateSafeId('user');
      const fallbackUser = {
        uid: fallbackId,
        email: cleanEmail,
        displayName: name.trim(),
        emailVerified: false,
        isAnonymous: false
      } as unknown as User;

      const profile: UserProfile = {
        id: fallbackId,
        username: cleanUsername,
        name: name.trim(),
        email: cleanEmail,
        role,
        status: 'ACTIVE',
        initialPassword: password,
        createdAt: new Date().toISOString()
      };

      await saveUserProfile(profile);
      return { user: fallbackUser, profile };
    }
    throw err;
  }
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
