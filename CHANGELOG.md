## 1.0.0 (2026-03-04)

### Features

* finalize naming, description and <head> ([924ac82](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/924ac824f9ab0410d0472149ca7bc0b3435d2922))
* implement article extraction composable and UI components (Task-008) ([05ab74a](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/05ab74aa399d0d794b2f9ca5dc598cce2f11e865))
* implement article state composable (Task-003) ([599620a](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/599620a445d91441d94eba671f99d880dc91645a))
* implement article type definitions (Task-002) ([009c0eb](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/009c0eba2408f8d863577d6875a135d56bdbbd46))
* implement HTML extractor utility (Task-006) ([512929e](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/512929ec759e7132b32f2188c68b815633abf238))
* implement Netlify Functions backend proxy for CORS-free article fetching (Task-009) ([2f37678](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/2f376787d33088f4b4d9e21d362299152e67d78a))
* implement UTM tag generator utility (Task-007) ([9546933](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/9546933c45511e239245c5328e9e50ab77b8c7a9))
* initialize project ([#1](https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/1)) ([ff9ad0b](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/ff9ad0b19c011869d169dc382810ca55f610761b))
* **linkedin:** implement LinkedIn content generation ([4adfd2f](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/4adfd2fc61e3d520b272a2ef3b864945945041ff))
* **medium:** add DOMPurify-sanitized live HTML preview with HTML clipboard copy ([2236021](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/2236021dbbdb6335cd9305e2aa1cf108526f46bf))
* **medium:** display actual field values in each row ([b07e479](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/b07e479a67f21655380c91ef2b206feb668240d6))
* **medium:** implement Medium content generation ([b80fed1](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/b80fed1cad23c70984d3408ee8bfe1c5131ba7a4))
* **platform-switcher:** add one-click platform switching without re-fetch ([#41](https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/41)) ([863098c](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/863098c79fa212202856ba27a894cd860f660ee3))
* **substack:** implement Substack content generation ([f216474](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/f21647454b4859e124bc3742b44df4b4f9d756f1))
* **substack:** make UTM block anchor text bilingual ([019e339](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/019e339242219224c86b7eb91ae9e86cf2c0bd2a))
* **substack:** tweak EN_SUBSTACK_UTM_ANCHOR value ([2aa335a](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/2aa335a68ea12925549dc3c034a4241eadb24cbe))
* **x platform:** implement X content generation and shared infrastructure ([cc43276](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/cc4327627fef0b0dbe26278a5488040a92b155d7))

### Bug Fixes

* **deploy:** add Netlify _redirects for SPA client-side routing ([b10a767](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/b10a7672ea99e42b021da3079897b0e7fd6addbf))
* **extractor:** replace div with h2 for jli-notice-tip follow-me snippet ([0274a7d](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/0274a7d84d055d590223b9bfbbe07dc57a543279))
* **extractor:** replace jli-notice-title <p> with <h2> in follow-me snippet ([a7b203a](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/a7b203a0758548bf37a1ab00dad95a19d45990c8))
* **extractor:** use precise selector for image alt text ([2a66d5c](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/2a66d5cabc73160c77c00f1646151fe6acf10dc1))
* **extractor:** use twitter:image meta for absolute image URL ([c002e83](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/c002e835c4b7b7d5ff8a9adfad5f28e53a589367))
* **layout:** widen the layout ([e5f10b8](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/e5f10b8b5e7042ceee78cf368692066424ab1780))
* **medium:** address PR review comments ([b0d2a2e](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/b0d2a2e59efe28d6a9b05bda5f9e3a8eda3eb3b4))
* **medium:** address PR review comments ([8fd3d5c](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/8fd3d5caf7dce0af3727793773ff6e53c68fd3b7))
* **medium:** display visually list of tags ([88083bf](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/88083bf027c8c1ca80a99a9bb8333c3e96bc2f28))
* **platform-switcher:** redirect to home when no article in state (AC-6) ([950b6b8](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/950b6b804e2c0d59dc68bbd79582b4cc2ad5b23a)), closes [#41](https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/41)
* **substack:** save auto components and router updates ([b16e8bd](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/b16e8bda96f90c1d48fc32b637a100f56e69bb69))
* **substack:** update EN UTM anchor text and align test ([af2afca](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/af2afca7f978eb058154bda895971cbd4065b395))
* **test:** add resetState to useArticleState mock in component tests ([b88cdd5](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/b88cdd55806b9641691775015e5dde5fc093a160))

### Others

* add ADR-005 for testing strategy and task-004 plan ([52367ba](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/52367ba82a19e17fafcac3bc38a365df386600c5))
* add ADR-006 for Netlify Functions backend proxy decision ([f4d2aa8](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/f4d2aa8ae192f79d70b6806acaf5b6d0d7e9fffa))
* add CLAUDE.md with repo guidance for Claude Code ([f535b51](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/f535b51a272c805552b78d9be9370a7e85d21ad8))
* add comprehensive tests for Article components (Task-008 follow-up) ([6b475bc](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/6b475bc31a7d71fd68498f8a0152f0a1dfe68dbd))
* add Netlify-specific backend proxy task plan (Task-009) ([28b8708](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/28b87081f2b81a35fbcc88385fd449dffc8bcd11))
* add prompts file and adjust requirements/data models ([5853d97](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/5853d97d8fbd15dc4c2e1e685a460d34ccc9b442))
* add rules to system prompts ([872b794](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/872b794fa8292a5540fb19739756cb1b8ab91a0d))
* add task plans for platform content generation (010-013) ([288544e](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/288544e13cc29165f074203a78acb9da26afe516))
* add template task ([f733693](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/f73369310f169532b526d93baa7d6b7eb32de00b))
* add template task prompt ([b4d7a11](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/b4d7a11f5b6d4f38e3d3bafd112b905c29d74698))
* add test execution to task completion checklist ([c3c4feb](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/c3c4febd09015c640b993532e19b45e0623bdf27))
* add unit tests for X content generation (task-010) ([c3a9206](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/c3a9206f5960b127ca3776aed23ca3fb736520b0))
* **adr:** add ADR-007 — HTML sanitization strategy for v-html rendering ([a09ed16](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/a09ed164b248e8560c7085dcd2c1343664806cf3))
* define overview, requirements, architecture, ADRs and data models ([9e2c8e9](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/9e2c8e9bd002a7e5efca85f4d13f9422c6c87296))
* fix test after button text update ([820894a](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/820894a9123c4cdcffb6e8ff3cb8dece9976597a))
* **linkedin:** add PlatformLinkedIn component tests ([addec36](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/addec363e8e1d8c9e1a32afa88b713291e29d936))
* **linkedin:** add unit tests for linkedInContentGenerator ([e73d725](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/e73d725af9d5ed2642315ac921239b509b2f2330))
* **medium:** add unit tests for Medium content generation ([4db9992](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/4db99924bfdc21242ebdf7adf3a9ee7d3374b948))
* **platform-switcher:** add unit tests for PlatformSwitcher (18 tests, all passing) ([#41](https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/41)) ([59affc6](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/59affc6c0308aa0c7c75c9e5a9564a320be963ab))
* point to ADR index instead of duplicating it ([aa1a94a](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/aa1a94a1eb570a2029c1c99538ab88367dac1b10))
* proofread tasks 10 to 13 ([de30496](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/de30496b53a39e5ca30279cf5097ef4d0578e6a9))
* remove unused boilerplate dependencies and files (TR-1) ([4100ef2](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/4100ef2e833df27b3b58349ccc53348dd0c3c475))
* reorganize files in ([673abe3](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/673abe346fa5dde3b09422597948a2479770e95e))
* setup Vitest and add tests for useArticleState (Task-004) ([c587b64](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/c587b646cbb2e7ed7cc566f30a2f9dbe16078b26))
* **specs:** define specs for platform switcher ([#41](https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/41)) ([e64df2e](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/e64df2e14e80dd3e5196669b9138ff36050c203d))
* **substack:** add unit tests for substackContentGenerator and PlatformSubstack ([b59213d](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/b59213dc38b5c0fe3fece193ed76e47ec4c2cb72))
* **task-012:** update spec to remove readonly from bodyHtml textarea ([1f313f7](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/1f313f7f1d82d31bcf43a336f6e5ed2c3c977784))
* update ADR index with ADR-005 and add index update rule ([963d217](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/963d217850e6cdd2f5879fc3bb83b9aacbfb945f))
* update task template with cleanup example ([8eedce2](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/8eedce223b89550664e6a66cc6bd330168b03bac))
* **x:** add unit tests for htmlToText and xContentGenerator ([ecd1c41](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/ecd1c41a43967441ca2c3ced5bb2b4e2f1d8406b))

## 1.0.0 (2025-12-18)

### Features

* initialize project ([#1](https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/1)) ([ff9ad0b](https://github.com/JeremieLitzler/SocialMediaPublisherApp/commit/ff9ad0b19c011869d169dc382810ca55f610761b))

## [2.3.0](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.2.0...v2.3.0) (2025-04-08)

### Features

* finish awesome tooltip! ([ff67c24](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/ff67c24e0c6818f012c3f79e2f342df76e910ad9))
* improve the tooltip ([aba73f7](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/aba73f724ea82dba0894ced18ab41fd4923572e1))
* upgrade to tailwindcss 4 ([f1f2164](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/f1f216446901de21144b10520798a6cdf7a79337))

## [2.2.0](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.1.5...v2.2.0) (2025-03-03)

### Features

* updat CRON to run Netlify supabase seeding function ([f67d73a](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/f67d73a4eda00a8877baabc0469c4aaa2e00d91a))

## [2.1.5](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.1.4...v2.1.5) (2025-02-18)

### Bug Fixes

* update function schedule ([#56](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/56)) ([fd8d74f](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/fd8d74f21b4f0248d382f81e8c300126039a5a07))

## [2.1.4](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.1.3...v2.1.4) (2025-02-18)

### Bug Fixes

* add missing import... ([#56](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/56)) ([68603f1](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/68603f1b273f2ba7da44d646ccc933c47535f026))

## [2.1.3](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.1.2...v2.1.3) (2025-02-18)

### Bug Fixes

* add trace function catch ([#56](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/56)) ([e2e499a](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/e2e499ab1a99f3abb658a4a84ea72dc15efbc673))
* update function schedule ([#56](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/56)) ([0e9984c](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/0e9984cdbf52943c2efaf20f78456beca1368e25))

## [2.1.2](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.1.1...v2.1.2) (2025-02-18)

### Bug Fixes

* adjust function schedule ([#56](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/56)) ([93e8d07](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/93e8d07fbfc7b4b72ced70660e6d7f68b719fe5e))

## [2.1.1](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.1.0...v2.1.1) (2025-02-18)

### Bug Fixes

* adjust netlify function script ([#56](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/56)) ([9420dc7](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/9420dc7c69bfaef37e1dcbc7ec53d0f4c2043a4c))

## [2.1.0](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.0.6...v2.1.0) (2025-02-18)

### Features

* enable call to seeding method and run function at 9AM UTC ([#56](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/56)) ([744d5e8](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/744d5e854bc25ba4769de42cb9f1895623b62b18))

## [2.0.6](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.0.5...v2.0.6) (2025-02-18)

### Dependencies

* **deps:** bump pinia from 2.3.1 to 3.0.1 ([3805860](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/3805860d886611f4947996fd569107d57180ead3))

## [2.0.5](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.0.4...v2.0.5) (2025-02-18)

## [2.0.4](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.0.3...v2.0.4) (2025-02-18)

## [2.0.3](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.0.2...v2.0.3) (2025-02-18)

## [2.0.2](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.0.1...v2.0.2) (2025-02-18)

### Others

* update README ([#24](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/24)) ([5053985](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/505398546dbe97aae80aa1752fbe3c41b716b348))

## [2.0.1](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/compare/v2.0.0...v2.0.1) (2025-02-12)


### Bug Fixes

* remove tailconfig file ([#39](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/39)) ([428056c](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/428056c2613dfa02686f02e8d874705b1131ebd7))
* rename some tailwind utility classes ([#39](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/39)) ([9f37e65](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/9f37e651d3eed5e5281b7aff675aa45fe2080ad6))
* revert back to tailwindcss 3 as the upgrade may be too early ([#39](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/issues/39)) ([9e4dadb](https://github.com/JeremieLitzler/VueSupabaseBoilerplate/commit/9e4dadb28b100cbbdf09de05f1a2a16d2b7feb9b))
