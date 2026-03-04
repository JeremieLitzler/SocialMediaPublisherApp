# Business Specifications — Task 041: Allow Switching to a Different Platform

## Overview

A user who has already fetched and extracted an article should be able to navigate to a different platform's output page in a single click, without re-entering the article URL and without re-fetching the article. The fetched article remains available in the application until the user explicitly resets via "Start Over".

## Goals

- Eliminate the need to re-enter the URL when the user wants to share the same article on multiple platforms.
- Remove friction between platform views by providing one-click platform switching on every platform page.
- Preserve the existing "Start Over" behaviour as the sole mechanism for discarding the fetched article.

## Glossary

- **Platform page**: Any of the four output routes — X, LinkedIn, Medium, Substack.
- **Active platform**: The platform page the user is currently viewing.
- **Inactive platform**: Any platform that is not the currently displayed one.
- **Article state**: The in-memory data representing the fetched and extracted article, held for the duration of the browser session or until "Start Over" is invoked.
- **Platform switcher**: The UI element on each platform page that lists the inactive platforms and allows one-click navigation to one of them.

## Rules

### R-1 — Article State Persistence During Navigation

The article state is not discarded when the user navigates between platform pages. It persists as long as "Start Over" has not been invoked. This is consistent with the existing singleton composable pattern (ADR-002).

### R-2 — Platform Switcher Presence and Position

Every platform page displays a platform switcher above the generated platform content. The switcher lists all platforms except the active one.

### R-3 — Single-Click Platform Switch

Activating a platform switcher item navigates the user to the corresponding platform page immediately. No modal, confirmation dialog, or additional step is required.

### R-4 — No Re-Fetch on Switch

When the user switches to another platform, the application must not call the backend proxy again. The already-extracted article data is used directly.

### R-5 — "Start Over" Remains the Reset Mechanism

Clicking "Start Over" on any platform page clears the article state and returns the user to the home page (`/`). This behaviour is unchanged from the current implementation.

### R-6 — Platform Switcher Not Shown on Home Page

The home page (`/`) does not display the platform switcher. The switcher is only relevant once an article has been extracted and a platform page is active.

### R-7 — Switcher Visibility Requires a Loaded Article

If no article is in state (e.g. a user navigates directly to a platform route without extracting an article), the platform switcher is not rendered. The page redirects to the home page instead, consistent with existing guard behaviour.

## Example Mapping

### Story: Switching from X to LinkedIn after sharing

**Rule:** R-1, R-2, R-3, R-4

#### Example 1 — Happy path: navigate to LinkedIn from X

```
Given the user has submitted an article URL and selected the X platform
And the article has been extracted successfully
And the user is on the X platform page
When the user clicks "LinkedIn" in the platform switcher
Then the user is navigated to the LinkedIn platform page
And the same article data is displayed without re-fetching
And no network request is sent to the backend proxy
```

#### Example 2 — Switching to all remaining platforms

```
Given the user is on the X platform page with a loaded article
When the user inspects the platform switcher
Then buttons or links for "LinkedIn", "Medium", and "Substack" are visible
And no button or link for "X" is shown
```

#### Example 3 — Switching from LinkedIn back to X

```
Given the user has navigated from X to LinkedIn via the platform switcher
When the user clicks "X" in the platform switcher on the LinkedIn page
Then the user is navigated to the X platform page
And the same article data is still available
```

### Story: Preserving state across multiple platform switches

**Rule:** R-1, R-4

#### Example 4 — Article data unchanged after three switches

```
Given the user has extracted an article and is on the X platform page
When the user switches to LinkedIn, then to Medium, then to Substack
Then at each step the article title, description, and other fields remain identical
And the backend proxy has been called exactly once (the initial extraction)
```

### Story: Start Over still clears state

**Rule:** R-5

#### Example 5 — Start Over from an intermediate platform page

```
Given the user has navigated from X to LinkedIn via the platform switcher
When the user clicks "Start Over" on the LinkedIn page
Then the article state is cleared
And the user is redirected to the home page
And the URL input is empty
```

### Story: Direct navigation without an article in state

**Rule:** R-7

#### Example 6 — Direct URL access to a platform page with no article

```
Given no article has been extracted (fresh browser session)
When the user navigates directly to "/linkedin"
Then the user is redirected to the home page
And the platform switcher is not shown
```

### Story: Platform switcher absent on home page

**Rule:** R-6

#### Example 7 — Home page never shows the platform switcher

```
Given the user is on the home page "/"
Then no platform switcher is displayed
Regardless of whether an article is in state or not
```

## Acceptance Criteria

- AC-1: Each platform page renders a visual group of controls for switching to the other three platforms on **top of the webpage**.
- AC-2: Activating a platform switch control navigates to the target platform page without triggering a network fetch.
- AC-3: The active platform's control is not included in the switcher list.
- AC-4: After one or more platform switches, the article data displayed on each platform page is identical to the data extracted during the initial fetch.
- AC-5: "Start Over" on any platform page clears the article state and returns the user to `/`.
- AC-6: Navigating directly to a platform route without a loaded article redirects to `/`.
- AC-7: The home page does not display any platform switching controls.

## Out of Scope

- Persisting the article state across browser sessions (**no** localStorage, **use** IndexedDB).
- Allowing the user to switch articles without returning to the home page.
- Changing the platform selection widget on the home page (`/`) — it retains its current radio-button/button behaviour for the initial platform choice.

status: ready
