Worktree: E:/Git/GitHub/fix_intro-list-extraction

# Issue #113: Introduction contains a list but is not extracted

Source URL: https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/113
Author: @JeremieLitzler

## Feature request (full issue body)

https://jeremielitzler.fr/post/2025-09/strategie-de-balisage-des-images-docker-pr-vs-ci/

### Current output (ex for LinkedIn)

Supposons que vous disposiez :

Ensuite, vous disposez d’une politique de branche DevOps pour déclencher un pipeline de création d’images sur :

Avec ce qui précède, DevOps crée une image taguée latest sur les deux déclencheurs.

Ne serait-il pas préférable de distinguer les deux builds et de pouvoir tester l’image générée suite au déclencheur PR sur l’environnement QA ?

Oui, ce serait préférable.

Voici comment modifier le pipeline.

⬇️⬇️⬇️
https://jeremielitzler.fr/post/2025-09/strategie-de-balisage-des-images-docker-pr-vs-ci/?utm_medium=social&utm_source=LinkedIn

### Expected output (ex for LinkedIn)

Supposons que vous disposiez :

- d’une API REST Python et que vous utilisiez Docker pour la conteneuriser.
- de deux environnements (production et assurance qualité) sur le nuage Azure Services.
- d’un pipeline DevOps qui crée et transfère l’image Docker vers un registre de conteneurs sur Azure et marque la dernière image avec la balise latest.

Ensuite, vous disposez d’une politique de branche DevOps pour déclencher un pipeline de création d’images sur :

- un déclencheur sur CI individuel lorsque quelque chose est poussé vers main.
- un déclencheur Requête de tirage (PR dans la suite de l’article pour Pull Request) lorsque vous souhaitez fusionner une branche vers main.

Avec ce qui précède, DevOps crée une image taguée latest sur les deux déclencheurs.

Ne serait-il pas préférable de distinguer les deux builds et de pouvoir tester l’image générée suite au déclencheur PR sur l’environnement QA ?

Oui, ce serait préférable.

Voici comment modifier le pipeline.

⬇️⬇️⬇️
https://jeremielitzler.fr/post/2025-09/strategie-de-balisage-des-images-docker-pr-vs-ci/?utm_medium=social&utm_source=LinkedIn

## Notes

The introduction extraction drops `<ul>` list items: bullet lists that appear before
the first `<h2>` in `.article-content` are not included in the generated platform
content. Per the CLAUDE.md spec, the introduction should preserve all `<p>`, `<pre>`,
`<ul>`, and `<blockquote>` tags before the first `<h2>`, in source order.
