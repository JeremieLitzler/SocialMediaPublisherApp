# Test Cases — Extract Constants to Parameters (Issue #47)

## TC-01: Settings page displays all constants grouped by platform

**Precondition:** No values are stored in IndexedDB (first run).
**Action:** User navigates to the settings page.
**Expected:** The page renders two sections — "Substack" and "Medium". The Substack section shows four input fields (EN share block, FR share block, EN UTM anchor, FR UTM anchor) pre-filled with the hardcoded defaults from `src/config/snippets.ts`. The Medium section shows two groups (EN and FR), each with a heading field and a body HTML textarea, pre-filled with defaults.

## TC-02: Persisted values are loaded on subsequent visits

**Precondition:** The user previously saved a custom EN UTM anchor text ("Read more").
**Action:** User closes and reopens the app, then navigates to the settings page.
**Expected:** The EN UTM anchor input field shows "Read more" (the stored value), not the hardcoded default.

## TC-03: Saving a value writes it to IndexedDB

**Precondition:** Settings page is open with default values.
**Action:** User changes the EN share block text to "Custom share text" and saves.
**Expected:** The value "Custom share text" is persisted in IndexedDB under the appropriate key. No page reload is required for the save to take effect.

## TC-04: Content generators use live values

**Precondition:** User has saved a custom FR UTM anchor text ("Lire l'article entier").
**Action:** User generates Substack content for a French blog post.
**Expected:** The generated Substack content uses "Lire l'article entier" as the UTM link anchor text, not the hardcoded default.

## TC-05: Reset to defaults clears all stored values

**Precondition:** One or more custom values are stored in IndexedDB.
**Action:** User clicks "Reset to defaults" on the settings page.
**Expected:** All IndexedDB entries for snippet keys are removed. The settings page then shows the hardcoded defaults in all fields. On next reload, defaults are still shown.

## TC-06: Missing IndexedDB key falls back to hardcoded default

**Precondition:** A key (e.g. FR Medium body HTML) does not exist in IndexedDB (e.g. first run, or key was removed by a new app version).
**Action:** The composable loads snippet values.
**Expected:** The missing key's value equals the hardcoded default from `src/config/snippets.ts`. No error is thrown; the app functions normally.

## TC-07: App version update does not overwrite persisted values

**Precondition:** The user has a custom EN share block stored.
**Action:** The application re-initialises (simulating a new deploy where the default value changed).
**Expected:** The user's custom value is still read from IndexedDB, not replaced by the updated default. The default is only used when the key is absent.

## TC-08: Settings page is reachable via navigation

**Precondition:** The app is loaded.
**Action:** User looks at the navigation menu.
**Expected:** A link to the settings page exists in the navigation. Clicking it navigates to the settings page.

## TC-09: Corrupt or unexpected shape in IndexedDB falls back to default

**Precondition:** An IndexedDB entry for a snippet key holds an unexpected value type (e.g. a number, null, or an object instead of a string).
**Action:** The composable loads snippet values.
**Expected:** The unexpected value is discarded; the hardcoded default is used instead. No error propagates to the user.

## TC-10: Substack plain-text constants use text inputs; Medium bodyHtml uses a textarea

**Precondition:** Settings page is open.
**Action:** User inspects the input controls.
**Expected:** Substack constants (plain text strings) are rendered as single-line text inputs. Medium bodyHtml fields are rendered as multi-line textareas. Medium heading fields are rendered as single-line text inputs.

## TC-11: useSnippets composable — default values match snippets.ts constants

**Precondition:** No IndexedDB entries exist.
**Action:** `useSnippets` loads all values.
**Expected:** Each snippet value returned by the composable equals the corresponding constant defined in `src/config/snippets.ts`.

## TC-12: useSnippets composable — save then load returns the saved value

**Precondition:** Fresh IndexedDB state.
**Action:** Save a new value for a key via the save operation, then load all values.
**Expected:** The loaded value for that key equals the saved value.

## TC-13: useSnippets composable — reset clears all keys and loading returns defaults

**Precondition:** Multiple custom values stored.
**Action:** Call the reset operation, then load all values.
**Expected:** Every value equals the corresponding hardcoded default.

## TC-14: useIndexedDb composable — get returns undefined for unknown key

**Precondition:** Empty IndexedDB store.
**Action:** Call `get` with a key that has never been stored.
**Expected:** Returns `undefined` (not null, not an error).

## TC-15: useIndexedDb composable — set then get round-trip preserves value

**Precondition:** Empty IndexedDB store.
**Action:** Call `set(key, value)`, then `get(key)`.
**Expected:** The returned value equals the stored value exactly.

## TC-16: useIndexedDb composable — del removes a previously stored key

**Precondition:** A key-value pair is stored.
**Action:** Call `del(key)`, then `get(key)`.
**Expected:** `get` returns `undefined` after deletion.

status: ready
