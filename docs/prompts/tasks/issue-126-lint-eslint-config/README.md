Worktree: /e/Git/GitHub/SocialMediaPublisherApp_fix-lint-eslint-config

# Issue #126: Problem with linting and eslintconfig

- Author: @JeremieLitzler
- URL: https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/126

## Feature request (issue body)

First, `rtk lint` doesn't work. Error message: `rtk lint couldn't locate the eslint binary directly. Let me run the project's lint script, and confirm whether the type-check error pre-exists my changes.`

Second, the lint failure is an environment/tooling issue (ESLint 9.39.2 cannot load its flat config under this Node — a SyntaxError before any file is linted), affecting both `rtk lint` and `npm run lint` regardless of code.

```
> eslint . --fix
Oops! Something went wrong! :(
ESLint: 9.39.2
SyntaxError: Unexpected token ':'
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    ...
```
