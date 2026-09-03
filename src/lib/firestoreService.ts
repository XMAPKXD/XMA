import { 
  collection, 
  doc, 
  getDocFromServer, 
  getDocs, 
  setDoc, 
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

// Save single category to Firestore
export async function saveCategoryToFirestore(category: Category): Promise<void> {
  if (!db) return;
  const path = `categories/${category.id}`;
  try {
    await setDoc(doc(db, 'categories', category.id), category, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Batch save multiple categories to Firestore
export async function saveAllCategoriesToFirestore(categories: Category[]): Promise<void> {
  if (!db || !Array.isArray(categories)) return;
  try {
    for (const cat of categories) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'categories');
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
    await setDoc(doc(db, 'community_nominations', nomination.id), nomination, { merge: true });
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
    await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
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
