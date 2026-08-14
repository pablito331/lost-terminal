/**
 * Style reminder: persistence is invisible infrastructure for a recovered
 * Seed OS terminal. Never surface browser, account, cloud, or save-game
 * language in the shell. Store only a compact, versioned session snapshot.
 */

const DATABASE_NAME = "seed-os-local";
const DATABASE_VERSION = 1;
const STORE_NAME = "sessions";
const ACTIVE_KEY = "active";
const FALLBACK_KEY = "seed-os.session.v1";

type StoredRecord<T> = { key: string; savedAt: string; payload: T };

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexeddb-unavailable"));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error ?? new Error("indexeddb-open-failed"));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function readIndexedDb<T>(): Promise<T | null> {
  return openDatabase().then((database) => new Promise<T | null>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(ACTIVE_KEY);
    request.onerror = () => reject(request.error ?? new Error("indexeddb-read-failed"));
    request.onsuccess = () => {
      const record = request.result as StoredRecord<T> | undefined;
      resolve(record?.payload ?? null);
    };
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error ?? new Error("indexeddb-transaction-failed"));
  }));
}

function writeIndexedDb<T>(payload: T): Promise<void> {
  return openDatabase().then((database) => new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ key: ACTIVE_KEY, savedAt: new Date().toISOString(), payload } satisfies StoredRecord<T>);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error("indexeddb-write-failed")); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error("indexeddb-write-aborted")); };
  }));
}

function readFallback<T>(): T | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeFallback<T>(payload: T): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(FALLBACK_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be disabled or full. The terminal must continue operating.
  }
}

export async function loadSeedSession<T>(): Promise<T | null> {
  try {
    const indexed = await readIndexedDb<T>();
    if (indexed) return indexed;
  } catch {
    // Fall through to the local fallback without surfacing a browser error.
  }
  return readFallback<T>();
}

export async function saveSeedSession<T>(payload: T): Promise<void> {
  writeFallback(payload);
  try {
    await writeIndexedDb(payload);
  } catch {
    // The fallback remains available when IndexedDB is blocked or unavailable.
  }
}
