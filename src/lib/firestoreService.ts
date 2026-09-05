import { 
  collection, 
  doc, 
  getDocFromServer, 
  getDocs, 
  setDoc, 
  deleteDoc,
  onSnapshot, 
  query,
  orderBy 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Category, CommunityNomination, CeremonySettings } from '../types';

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

/**
 * Strips undefined values recursively and converts any undefined fields to null
 * so Firestore setDoc never throws:
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function cleanForFirestore<T>(data: T): any {
  if (data === null || data === undefined) {
    return null;
  }
  try {
    return JSON.parse(
      JSON.stringify(data, (_key, value) => {
        if (value === undefined) {
          return null;
        }
        return value;
      })
    );
  } catch (err) {
    console.error('Erro na serialização para o Firestore:', err);
    return data;
  }
}

// Test connection on startup as requested by Firebase Integration Skill
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently running in offline/cached mode.');
    }
    return false;
  }
}

// Fetch categories once from Firestore
export async function getCategoriesOnce(): Promise<Category[] | null> {
  if (!db) return null;
  try {
    const colRef = collection(db, 'categories');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;

    const loadedCategories: Category[] = [];
    snapshot.forEach((docSnap) => {
      loadedCategories.push(docSnap.data() as Category);
    });
    loadedCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
    return loadedCategories;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'categories');
    return null;
  }
}

// Save single category to Firestore
export async function saveCategoryToFirestore(category: Category): Promise<boolean> {
  if (!db) return false;
  const path = `categories/${category.id}`;
  try {
    const cleaned = cleanForFirestore(category);
    await setDoc(doc(db, 'categories', category.id), cleaned, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

// Delete a category from Firestore
export async function deleteCategoryFromFirestore(categoryId: string): Promise<boolean> {
  if (!db) return false;
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

// Batch save multiple categories to Firestore (and clean up removed ones)
export async function saveAllCategoriesToFirestore(categories: Category[]): Promise<boolean> {
  if (!db || !Array.isArray(categories)) return false;
  try {
    // 1. Save current categories with clean data
    for (const cat of categories) {
      if (!cat.id) continue;
      const cleaned = cleanForFirestore(cat);
      await setDoc(doc(db, 'categories', cat.id), cleaned, { merge: true });
    }

    // 2. Check if any category was deleted from Firestore
    try {
      const activeIds = new Set(categories.map((c) => c.id));
      const existingSnap = await getDocs(collection(db, 'categories'));
      for (const docSnap of existingSnap.docs) {
        if (!activeIds.has(docSnap.id)) {
          await deleteDoc(docSnap.ref);
        }
      }
    } catch {}

    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'categories');
    return false;
  }
}

// Listen to categories in real-time
export function subscribeCategories(
  onUpdate: (categories: Category[]) => void
): () => void {
  if (!db) return () => {};

  const colRef = collection(db, 'categories');
  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const loadedCategories: Category[] = [];
        snapshot.forEach((docSnap) => {
          loadedCategories.push(docSnap.data() as Category);
        });
        loadedCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
        onUpdate(loadedCategories);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    }
  );

  return unsubscribe;
}

// Save community nomination
export async function saveCommunityNominationToFirestore(nomination: CommunityNomination): Promise<void> {
  if (!db) return;
  const path = `community_nominations/${nomination.id}`;
  try {
    const cleaned = cleanForFirestore(nomination);
    await setDoc(doc(db, 'community_nominations', nomination.id), cleaned, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Listen to community nominations in real-time
export function subscribeCommunityNominations(
  onUpdate: (nominations: CommunityNomination[]) => void
): () => void {
  if (!db) return () => {};

  const colRef = collection(db, 'community_nominations');
  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const loaded: CommunityNomination[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push(docSnap.data() as CommunityNomination);
      });
      if (loaded.length > 0) {
        onUpdate(loaded);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'community_nominations');
    }
  );

  return unsubscribe;
}

// Save Ceremony Settings to Firestore
export async function saveSettingsToFirestore(settings: CeremonySettings): Promise<void> {
  if (!db) return;
  const path = 'settings/global';
  try {
    const cleaned = cleanForFirestore(settings);
    await setDoc(doc(db, 'settings', 'global'), cleaned, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Subscribe to Settings
export function subscribeSettings(onUpdate: (settings: CeremonySettings) => void): () => void {
  if (!db) return () => {};
  const docRef = doc(db, 'settings', 'global');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as CeremonySettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
    }
  );
}
