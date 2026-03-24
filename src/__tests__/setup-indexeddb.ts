/**
 * Vitest setup: polyfill the global IndexedDB API with fake-indexeddb.
 *
 * happy-dom does not ship an IndexedDB implementation, so this shim makes
 * the native IDBFactory / IDBDatabase API available in all test files.
 * Imported in vitest.config.ts via setupFiles.
 */
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'

// Expose globals that the useIndexedDb composable accesses via bare `indexedDB`.
globalThis.indexedDB = new IDBFactory()
// IDBKeyRange is used by some IndexedDB consumers; polyfill it too.
globalThis.IDBKeyRange = IDBKeyRange
