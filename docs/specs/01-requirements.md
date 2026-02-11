# Requirements

## Functional Requirements

### FR-1: Article Input

- **As a user**, I want to input a blog article URL
- **So that** the system can extract all necessary content for a target social media
- **Acceptance Criteria:**
  - System accepts URLs from both English and French blogs
  - System accepts on social media from the list: X, LinkedIn, Medium or Substack (radio button selection)
  - System validates that article has an introduction before first `<h2>`. If no introduction exists, system prompts user to add one to the source article to continue in a texarea input

### FR-2: Content Extraction

- **As a user**, I need the system to extract specific elements from blog articles
- **So that** I don't have to manually copy each piece of information
- **Acceptance Criteria:**
  - Select article body from `<section class="article-content">`
  - Extract introduction (all `<p>` tags before first `<h2>`)
  - Extract featured image from selector `.article-image a img`
  - Extract category from `<header class="article-category">` → `<a>` elements
  - Extract tags from `<section class="article-tags">` → `<a>` elements
  - Extract title (from selector `.article-title a`)
  - Extract description (from selector `article-subtitle`)
  - Extract featured image credits from last `p` in `<section class="article-content">`. Text always start with "Photo by" in English or "Photo de" in French.

### FR-3: UTM Tag Generation

- **As a user**, I need proper UTM tags added to article link in snippet to share on selected social media
- **So that** I can track traffic sources in analytics
- **Acceptance Criteria:**
  - All links include `utm_medium=social`
  - Platform-specific `utm_source` values:
    - X: `utm_source=X`
    - LinkedIn: `utm_source=LinkedIn`
    - Medium: `utm_source=Medium`
    - Substack: `utm_source=Substack`

### FR-4: X (Twitter) Content Generation

- **As a user**, I want X-optimized content
- **So that** I can quickly post to X
- **Acceptance Criteria:**
  - Split introduction into 280-character chunks if needed and add "⬇️" between chunks. For example, take the introduction text. If it is more than 280 chars, split it into chunks of less than 280 chars with a “⬇️” between each chunk. To detect each chunk, measure each sentence and make chunk of several sentences only in they don’t exceed the limit length.
  - Final chunk ends with:

```plaintext
    ⬇️⬇️⬇️
    [link with UTM tags]
```

- Each chunk has individual "Copy to Clipboard" button

### FR-5: LinkedIn Content Generation

- **As a user**, I want LinkedIn-optimized content
- **So that** I can quickly post to LinkedIn
- **Acceptance Criteria:**
  - Provide full introduction text
  - Add formatted link below:

    ```plaintext
        [introduction text]

        ⬇️⬇️⬇️
        [link with UTM tags]
    ```

- Single "Copy to Clipboard" button

### FR-6: Medium Content Generation

- **As a user**, I want all elements needed to create a Medium article
- **So that** I can efficiently cross-post to Medium
- **Acceptance Criteria:**
  - Provide copyable title
  - Provide copyable description (for subtitle)
  - Provide HTML body containing:
    - Featured image with
      - alt text
      - and image credits as caption
    - Divider line (`<hr>`)
    - Introduction text
    - Link with UTM tags formatted as:

    ```plaintext
        ⬇️⬇️⬇️
        [link with UTM tags]
    ```

    - Divider line
    - "Follow me" snippet (extracted from last 2 children of article-content section)
    - Divider line
    - "Why I don't share full article" snippet

- Provide canonical URL (**without UTM tags**) for SEO settings
- Provide category and tags as individual copyable items

### FR-7: Substack Content Generation

- **As a user**, I want all elements needed to create a Substack article
- **So that** I can efficiently cross-post to Substack
- **Acceptance Criteria:**
  - Provide copyable title
  - Provide copyable description (for subtitle)
  - Provide HTML body containing:
    - Featured image with alt text and image credits as caption (if present)
    - Introduction text
    - Link with UTM tags formatted as:

    ```plaintext
        ⬇️⬇️⬇️
        [link with UTM tags]
    ```

    - A text line in italic with the mention where the article was published
      - In English: "Originally published on iamjeremie.me"
      - In French: "Originallement publiée sur jeremielitzler.fr."
    - "Share post" button with caption (French text if article is French)
      - Text in English: "Thanks for reading my publication! This post is public so feel free to share it."
      - Text in French: "Merci pour votre intérêt pour ma publication ! Cet article est public, n'hésitez pas à le partager."

- Provide category and tags as individual copyable items
- Note: Schedule target is noon on publication date

### FR-8: Predefined Snippets

- **As a user**, I need platform-specific snippets included automatically
- **So that** I maintain consistent messaging
- **Acceptance Criteria:**
  - Medium: Add "follow me" snippet from pulling the data from this selector `.jli-notice-tip .jli-notice-title` (for the heading) and the last `.jli-notice-tip p` for the content.
  - Medium: Include "Why I don't share full article" snippet (stored as parameter/config)
    - Heading in English: "Why does this post link to my blog?"
    - Content in English:

      ```plaintext
      I have been on Medium for a while, frankly, the editor isn’t the best:
      - when I copy paste a post content from my blog on Medium, all the code extracts need manual adjustments.
      - Medium doesn’t support WEBP or AVIF…
      - Setting the alternative text on an image bumps the focus back to the top… Not great for a long post!

      Moreover, my analytics shows that very little traffic to my blog comes from Medium.
      ```

    - Heading in French: "Pourquoi ce billet renvoie-t-il à mon blog ?"
    - Content in French:

      ```plaintext
      J’utilise Medium depuis un moment, franchement, l’éditeur manque d’efficacité :
      - Quand je copie-colle le contenu d’un billet de mon blog sur Medium, tous les extraits de code doivent être ajustés manuellement.
      - Medium ne supporte pas le WEBP ou l’AVIF…
      - La définition d'un texte alternatif sur une image ramène le curseur sur le haut de la page... Pas pratique sur un long article avec plusieurs images !

      De plus, SimpleAnalytics me montre que très peu de trafic vers mon blog provient de Medium.
      ```

  - Substack: Include the share block text
    - In English: "Thanks for reading my publication! This post is public so feel free to share it."
    - In French: "Merci pour votre intérêt pour ma publication ! Cet article est public, n'hésitez pas à le partager."

## Non-Functional Requirements

### NFR-1: Performance

- Article content extraction should complete within 3 seconds
- Copy-to-clipboard actions should be instant (<100ms)

### NFR-2: Usability

- Visual indication when content is copied to clipboard
- Mobile-responsive design (optional, but nice to have)

### NFR-3: Reliability

- Handle missing optional elements gracefully (e.g., no caption on image)
- Validate article structure and provide helpful error messages
- Handle both English and French character sets correctly

### NFR-4: Maintainability

- Snippets should be configurable without code changes
- Easy to add new platforms in the future
- Clear separation of extraction logic per platform

## Technical Requirements

### TR-1: Codebase Cleanup

- Remove unused dependencies from the boilerplate before building
- Known removals:
  - `@tanstack/vue-table` (no tables needed)
  - `@faker-js/faker` (no fake data needed)
  - Supabase-related config, stores, and components (auth removed from template)
  - Any Vue Router configuration beyond a single route
- Retain and justify every remaining dependency
