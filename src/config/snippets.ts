import type { Blog } from '@/types/article'
import type { SnippetKey, SnippetMap } from '@/types/article'

// ─── Hardcoded defaults ───────────────────────────────────────────────────────
//
// These values are used when no IndexedDB-persisted value exists for the key.
// They must never be overwritten by the running application; only a "reset"
// action that clears IndexedDB should cause these to be re-applied.

/**
 * Immutable map of all snippet defaults.
 * Consumers that need a specific constant can read it via SNIPPET_DEFAULTS[key].
 */
export const SNIPPET_DEFAULTS: Readonly<SnippetMap> = {
  EN_SUBSTACK_SHARE_BLOCK:
    'Thanks for reading my publication! This post is public so feel free to share it.',
  FR_SUBSTACK_SHARE_BLOCK:
    "Merci pour votre intérêt pour ma publication ! Cet article est public, n'hésitez pas à le partager.",
  EN_SUBSTACK_UTM_ANCHOR: "Let's review this in the full article",
  FR_SUBSTACK_UTM_ANCHOR: "Allez lire l'article complet",
  EN_WHY_HEADING: 'Why does this post link to my blog?',
  FR_WHY_HEADING: 'Pourquoi ce billet renvoie-t-il à mon blog ?',
  EN_WHY_BODY_HTML:
    `<p>I have been on Medium for a while and, frankly, the editor isn't the best:</p>` +
    `<ul>` +
    `<li>when I copy paste a post content from my blog on Medium, all the code extracts need manual adjustments.</li>` +
    `<li>Medium doesn't support WEBP or AVIF…</li>` +
    `<li>Setting the alternative text on an image bumps the focus back to the top… Not great for a long post!</li>` +
    `</ul>` +
    `<p>Moreover, my analytics shows that very little traffic to my blog comes from Medium.</p>`,
  FR_WHY_BODY_HTML:
    `<p>J'utilise Medium depuis un moment et franchement, l'éditeur manque d'efficacité</p>` +
    `<ul>` +
    `<li>Quand je copie-colle le contenu d'un billet de mon blog sur Medium, tous les extraits de code doivent être ajustés manuellement.</li>` +
    `<li>Medium ne supporte pas le WEBP ou l'AVIF…</li>` +
    `<li>La définition d'un texte alternatif sur une image ramène le curseur sur le haut de la page... Pas pratique sur un long article avec plusieurs images !</li>` +
    `</ul>` +
    `<p>De plus, SimpleAnalytics me montre que très peu de trafic vers mon blog provient de Medium.</p>`,
}

// ─── Substack ────────────────────────────────────────────────────────────────

/**
 * Return the Substack share block text for the given blog language.
 * Reads from the provided snippet map, falling back to hardcoded defaults.
 *
 * @param blog - Blog language identifier
 * @param snippets - Optional live snippet map from useSnippets (defaults to SNIPPET_DEFAULTS)
 */
export function getSubstackShareBlockText(
  blog: Blog,
  snippets: Readonly<SnippetMap> = SNIPPET_DEFAULTS,
): string {
  if (blog === 'french') return snippets.FR_SUBSTACK_SHARE_BLOCK
  return snippets.EN_SUBSTACK_SHARE_BLOCK
}

/**
 * Return the Substack UTM link anchor text for the given blog language.
 * Reads from the provided snippet map, falling back to hardcoded defaults.
 *
 * @param blog - Blog language identifier
 * @param snippets - Optional live snippet map from useSnippets (defaults to SNIPPET_DEFAULTS)
 */
export function getSubstackUtmAnchorText(
  blog: Blog,
  snippets: Readonly<SnippetMap> = SNIPPET_DEFAULTS,
): string {
  if (blog === 'french') return snippets.FR_SUBSTACK_UTM_ANCHOR
  return snippets.EN_SUBSTACK_UTM_ANCHOR
}

// ─── Medium ──────────────────────────────────────────────────────────────────

/**
 * Bilingual "Why does this post link to my blog?" snippet for Medium cross-posts.
 */
export interface WhySnippet {
  /** H2 heading text */
  heading: string
  /** Body content as valid HTML (paragraphs and lists) */
  bodyHtml: string
}

/**
 * Return the correct "Why" snippet for the given blog language.
 * Reads from the provided snippet map, falling back to hardcoded defaults.
 *
 * @param blog - Blog language identifier ('english' | 'french')
 * @param snippets - Optional live snippet map from useSnippets (defaults to SNIPPET_DEFAULTS)
 * @returns Localised WhySnippet object
 */
export function getWhySnippet(
  blog: Blog,
  snippets: Readonly<SnippetMap> = SNIPPET_DEFAULTS,
): WhySnippet {
  if (blog === 'french') {
    return {
      heading: snippets.FR_WHY_HEADING,
      bodyHtml: snippets.FR_WHY_BODY_HTML,
    }
  }
  return {
    heading: snippets.EN_WHY_HEADING,
    bodyHtml: snippets.EN_WHY_BODY_HTML,
  }
}
