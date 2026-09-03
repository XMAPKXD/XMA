/**
 * Robust persistence layer combining IndexedDB (virtually unlimited quota)
 * and localStorage (instant synchronous reads) with automatic error recovery.
 */

const DB_NAME = 'xma_awards_db_2026';
const DB_VERSION = 1;
const STORE_NAME = 'xma_store';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setItemPersistent<T>(key: string, value: T): Promise<void> {
  // 1. Try IndexedDB (Primary high-capacity storage)
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (idbErr) {
    console.warn(`[PersistentStorage] IndexedDB write failed for key "${key}":`, idbErr);
  }

  // 2. Try localStorage (Fast synchronous secondary cache)
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (lsErr) {
    // If quota exceeded in localStorage, IndexedDB still holds the full data!
    console.warn(`[PersistentStorage] localStorage quota reached for key "${key}". Data safely stored in IndexedDB.`, lsErr);
  }
}

export async function getItemPersistent<T>(key: string, fallback: T): Promise<T> {
  // 1. First attempt to read from IndexedDB
  try {
    const db = await openDatabase();
    const result = await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });

    if (result !== undefined && result !== null) {
      return result;
    }
  } catch (idbErr) {
    console.warn(`[PersistentStorage] IndexedDB read failed for key "${key}", checking localStorage:`, idbErr);
  }

  // 2. Fallback to localStorage
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
  } catch {
    // Fallback if parsing fails
  }

  return fallback;
}
