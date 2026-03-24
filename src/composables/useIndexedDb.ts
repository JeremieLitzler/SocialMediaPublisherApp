/**
 * Thin IndexedDB wrapper composable — ADR-008.
 *
 * Exposes three operations: get(key), set(key, value), del(key).
 * The IDBDatabase connection is cached at module level so only one open
 * call is made per page lifetime, regardless of how many callers import
 * this composable.
 *
 * Error messages are kept generic (no raw values logged) to comply with
 * security-guidelines.md rule 3.
 */

const DB_NAME = 'social-media-publisher'
const DB_VERSION = 1
const STORE_NAME = 'snippets'

// Module-level cached connection (null until first open call resolves).
let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise !== null) return dbPromise

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result)
    }

    request.onerror = () => {
      // Do not log request.error.message — security-guidelines.md rule 3.
      dbPromise = null
      reject(new Error('IndexedDB failed to open.'))
    }
  })

  return dbPromise
}

/**
 * Retrieve a stored value by key.
 * Returns `undefined` when the key does not exist (TC-14).
 *
 * @param key - Storage key
 * @returns Stored value, or `undefined` if absent
 */
async function get(key: string): Promise<string | undefined> {
  const db = await openDb()
  return new Promise<string | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(key)

    request.onsuccess = () => {
      const value: unknown = request.result
      // Type-narrow: only accept string values (security-guidelines.md rule 4).
      resolve(typeof value === 'string' ? value : undefined)
    }

    request.onerror = () => {
      reject(new Error('IndexedDB get operation failed.'))
    }
  })
}

/**
 * Store a value under the given key.
 *
 * @param key - Storage key
 * @param value - String value to store
 */
async function set(key: string, value: string): Promise<void> {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(value, key)

    request.onsuccess = () => resolve()
    request.onerror = () => {
      reject(new Error('IndexedDB set operation failed.'))
    }
  })
}

/**
 * Delete a stored key-value pair.
 * Resolves successfully even if the key did not exist.
 *
 * @param key - Storage key to remove
 */
async function del(key: string): Promise<void> {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(key)

    request.onsuccess = () => resolve()
    request.onerror = () => {
      reject(new Error('IndexedDB del operation failed.'))
    }
  })
}

/**
 * Composable that exposes the three IndexedDB operations.
 * The same db connection is reused across all composable instances.
 */
export function useIndexedDb() {
  return { get, set, del }
}
