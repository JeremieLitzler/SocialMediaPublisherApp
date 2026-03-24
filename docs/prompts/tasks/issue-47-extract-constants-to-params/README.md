# Issue 47 — Extract constants to parameters

## Source

GitHub Issue: https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/47

## User Request

There is many constants per language that are snippets of text to use in various settings.

- [ ] List them. for ex: `EN_SUBSTACK_UTM_ANCHOR` controls the anchor element text value in the substack UTM anchor or `EN_WHY_SNIPPET` controls the text to add to the HTML body of the Medium content.
- [ ] Make all constants **available to edit** on a page grouped by platform (one section per platform). Constants common to at least two platforms should go into a shared constant section.
- [ ] Make the values persistent as long as a new application version doesn't remove a constant. Use indexedDb to store data.
- [ ] Make sure the values persisted don't get overwritten by new applications. But clearing persisted values will reset values to defaults.

## Pipeline Info

- Type: feat
- Slug: extract-constants-to-params
- Branch: feat/extract-constants-to-params
- Worktree: /home/user/SocialMediaPublisherApp
- Task folder: docs/prompts/tasks/issue-47-extract-constants-to-params
