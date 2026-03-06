# Cuist'Olivier

Refonte Jekyll du site de recettes, compatible GitHub Pages, avec une collection `_recipes` et un thème visuel éditorial personnalisé.

## Lancer le site en local

1. Installer Ruby et Bundler.
2. Installer les dépendances :

```bash
bundle install
```

3. Lancer le serveur Jekyll :

```bash
bundle exec jekyll serve
```

Le site sera ensuite visible sur `http://127.0.0.1:4000/Cuistolivier/`.

## Structure

- `_recipes/` : une recette par fichier Markdown
- `_layouts/` : layouts personnalisés
- `_includes/` : composants Liquid réutilisables
- `assets/css/style.scss` : style principal
- `assets/js/recipe.js` : amélioration progressive des portions et alternatives
