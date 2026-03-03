import type { Blog } from '@/types/article'

/**
 * Bilingual "Why does this post link to my blog?" snippet for Medium cross-posts.
 * See FR-8 in requirements for the full text.
 */
export interface WhySnippet {
  /** H2 heading text */
  heading: string
  /** Body content as valid HTML (paragraphs and lists) */
  bodyHtml: string
}

const EN_WHY_SNIPPET: WhySnippet = {
  heading: 'Why does this post link to my blog?',
  bodyHtml:
    `<p>I have been on Medium for a while and, frankly, the editor isn't the best:</p>` +
    `<ul>` +
    `<li>when I copy paste a post content from my blog on Medium, all the code extracts need manual adjustments.</li>` +
    `<li>Medium doesn't support WEBP or AVIF…</li>` +
    `<li>Setting the alternative text on an image bumps the focus back to the top… Not great for a long post!</li>` +
    `</ul>` +
    `<p>Moreover, my analytics shows that very little traffic to my blog comes from Medium.</p>`,
}

const FR_WHY_SNIPPET: WhySnippet = {
  heading: 'Pourquoi ce billet renvoie-t-il à mon blog ?',
  bodyHtml:
    `<p>J'utilise Medium depuis un moment et franchement, l'éditeur manque d'efficacité</p>` +
    `<ul>` +
    `<li>Quand je copie-colle le contenu d'un billet de mon blog sur Medium, tous les extraits de code doivent être ajustés manuellement.</li>` +
    `<li>Medium ne supporte pas le WEBP ou l'AVIF…</li>` +
    `<li>La définition d'un texte alternatif sur une image ramène le curseur sur le haut de la page... Pas pratique sur un long article avec plusieurs images !</li>` +
    `</ul>` +
    `<p>De plus, SimpleAnalytics me montre que très peu de trafic vers mon blog provient de Medium.</p>`,
}

/**
 * Return the correct "Why" snippet for the given blog language.
 *
 * @param blog - Blog language identifier ('english' | 'french')
 * @returns Localised WhySnippet object
 */
export function getWhySnippet(blog: Blog): WhySnippet {
  if (blog === 'french') return FR_WHY_SNIPPET
  return EN_WHY_SNIPPET
}
