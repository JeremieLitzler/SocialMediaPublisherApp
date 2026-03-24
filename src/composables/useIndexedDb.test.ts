/**
 * Tests for useIndexedDb composable (TC-14, TC-15, TC-16).
 *
 * Each test uses its own unique key name to ensure independence within the
 * shared in-memory fake-indexeddb store (set up in src/__tests__/setup-indexeddb.ts).
 * The module-level dbPromise cache in useIndexedDb is shared, but since each test
 * uses unique keys, test isolation is maintained without needing to re-open the DB.
 */
import { describe, it, expect } from 'vitest'
import { useIndexedDb } from './useIndexedDb'

const { get, set, del } = useIndexedDb()

describe('useIndexedDb', () => {
  describe('TC-14: get returns undefined for unknown key', () => {
    it('returns undefined for a key that has never been stored', async () => {
      const result = await get('__tc14_nonexistent_key__')
      expect(result).toBeUndefined()
    })
  })

  describe('TC-15: set then get round-trip preserves value', () => {
    it('returns the exact value that was stored', async () => {
      await set('tc15-a-key', 'hello world')
      const result = await get('tc15-a-key')
      expect(result).toBe('hello world')
    })

    it('preserves a value with special characters', async () => {
      const value = "J'utilise Medium <p>test</p> & «guillemets»"
      await set('tc15-b-special', value)
      const result = await get('tc15-b-special')
      expect(result).toBe(value)
    })

    it('returns the last written value after an overwrite', async () => {
      await set('tc15-c-overwrite', 'first')
      await set('tc15-c-overwrite', 'second')
      const result = await get('tc15-c-overwrite')
      expect(result).toBe('second')
    })
  })

  describe('TC-16: del removes a previously stored key', () => {
    it('returns undefined after deleting a stored key', async () => {
      await set('tc16-a-key', 'to-be-deleted')
      await del('tc16-a-key')
      const result = await get('tc16-a-key')
      expect(result).toBeUndefined()
    })

    it('does not throw when deleting a key that does not exist', async () => {
      await expect(del('tc16-b-never-stored')).resolves.toBeUndefined()
    })
  })
})
