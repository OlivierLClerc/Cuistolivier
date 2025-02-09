// Utility function to get query parameters
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

const recipeId = getQueryParam('id');

fetch('data/recipes.json')
  .then(response => response.json())
  .then(recipes => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
      document.getElementById('recipe-content').textContent = 'Recette non trouvée';
      return;
    }
    renderRecipe(recipe);
  })
  .catch(error => console.error('Error loading recipe:', error));

function renderRecipe(recipe) {
  const container = document.getElementById('recipe-content');

  // Ajoute le lien si le champ "link" existe dans la recette
  const linkHTML = recipe.link
    ? `<p>Source : <a href="${recipe.link}" target="_blank">${recipe.link}</a></p>`
    : '';

  // Détecter si des alternatives vegan, sans gluten ou végétariennes sont proposées dans les ingrédients
  const hasVeganOptions = recipe.ingredients.some(ing => ing.alternatives && ing.alternatives.vegan);
  const hasGlutenFreeOptions = recipe.ingredients.some(ing => ing.alternatives && ing.alternatives.glutenFree);
  const hasVegetarianOptions = recipe.ingredients.some(ing => ing.alternatives && ing.alternatives.vegetarian);

  // Vérifier les méta‑données (à renseigner dans le JSON)
  // Exemple :
  // "meta": { "inherentlyVegan": true, "adaptableVegan": false, "inherentlyGlutenFree": false, "adaptableGlutenFree": true, "inherentlyVegetarian": true, "adaptableVegetarian": false }
  const isInherentlyVegan = recipe.meta && recipe.meta.inherentlyVegan;
  const isAdaptableVegan = recipe.meta && recipe.meta.adaptableVegan;
  const isInherentlyGlutenFree = recipe.meta && recipe.meta.inherentlyGlutenFree;
  const isAdaptableGlutenFree = recipe.meta && recipe.meta.adaptableGlutenFree;
  const isInherentlyVegetarian = recipe.meta && recipe.meta.inherentlyVegetarian;
  const isAdaptableVegetarian = recipe.meta && recipe.meta.adaptableVegetarian;

  // Préparer la case pour le mode vegan
  let veganCheckboxHTML = '';
  if (hasVeganOptions || isInherentlyVegan || isAdaptableVegan) {
    const veganChecked = isInherentlyVegan ? 'checked' : '';
    const veganDisabled = isInherentlyVegan ? 'disabled' : '';
    const veganLabelExtra = (isAdaptableVegan && !isInherentlyVegan) ? ' (adaptable)' : '';
    veganCheckboxHTML = `<label>
      <input type="checkbox" id="vegan" ${veganChecked} ${veganDisabled}> Vegan${veganLabelExtra}
    </label>`;
  }

  // Préparer la case pour le mode sans gluten
  let glutenFreeCheckboxHTML = '';
  if (hasGlutenFreeOptions || isInherentlyGlutenFree || isAdaptableGlutenFree) {
    const glutenFreeChecked = isInherentlyGlutenFree ? 'checked' : '';
    const glutenFreeDisabled = isInherentlyGlutenFree ? 'disabled' : '';
    const glutenFreeLabelExtra = (isAdaptableGlutenFree && !isInherentlyGlutenFree) ? ' (adaptable)' : '';
    glutenFreeCheckboxHTML = `<label>
      <input type="checkbox" id="glutenFree" ${glutenFreeChecked} ${glutenFreeDisabled}> Sans gluten${glutenFreeLabelExtra}
    </label>`;
  }

  // Préparer la case pour le mode végétarien
  let vegetarianCheckboxHTML = '';
  if ((recipe.meta && (recipe.meta.inherentlyVegetarian || recipe.meta.adaptableVegetarian)) || hasVegetarianOptions) {
    const vegetarianChecked = isInherentlyVegetarian ? 'checked' : '';
    const vegetarianDisabled = isInherentlyVegetarian ? 'disabled' : '';
    const vegetarianLabelExtra = (isAdaptableVegetarian && !isInherentlyVegetarian) ? ' (adaptable)' : '';
    vegetarianCheckboxHTML = `<label>
      <input type="checkbox" id="vegetarian" ${vegetarianChecked} ${vegetarianDisabled}> Végétarien${vegetarianLabelExtra}
    </label>`;
  }

  // Les badges ne seront plus affichés dans l'intitulé de la recette.
  // Vous pouvez les afficher ailleurs si vous le souhaitez, mais ici ils ont été supprimés de la balise <h1>.
  container.innerHTML = `
    <h1>${recipe.title}</h1>
    ${linkHTML}
    <img src="${recipe.image}" alt="${recipe.title}" class="small-image">
    <div>
      <label for="servings">Nombre de portions :</label>
      <input type="number" id="servings" value="${recipe.baseServings}" min="1">
    </div>
    <div id="dietary-options">
      ${veganCheckboxHTML}
      ${glutenFreeCheckboxHTML}
      ${vegetarianCheckboxHTML}
    </div>
    
    <h2>Ingrédients</h2>
    <ul id="ingredient-list"></ul>
    
    <h2>Instructions</h2>
    <p id="recipe-instructions" class="instructions"></p>
  `;

  // Afficher les instructions en préservant les retours à la ligne.
  document.getElementById('recipe-instructions').textContent = recipe.instructions;

  // Fonction pour ajuster les quantités selon le nombre de portions désiré.
  function scaleRecipe(desiredServings) {
    const factor = desiredServings / recipe.baseServings;
    return recipe.ingredients.map(ing => ({
      ...ing,
      scaledQuantity: ing.quantity && typeof ing.quantity === 'number'
        ? ing.quantity * factor
        : ing.quantity
    }));
  }

  // Fonction pour afficher la liste des ingrédients en fonction des options diététiques.
  function renderIngredients() {
    const desiredServings = parseFloat(document.getElementById('servings').value) || recipe.baseServings;
    const isVegan = document.getElementById('vegan') ? document.getElementById('vegan').checked : false;
    const isGlutenFree = document.getElementById('glutenFree') ? document.getElementById('glutenFree').checked : false;
    const isVegetarian = document.getElementById('vegetarian') ? document.getElementById('vegetarian').checked : false;
    const ingredientList = document.getElementById('ingredient-list');
    ingredientList.innerHTML = '';

    const scaledIngredients = scaleRecipe(desiredServings);
    scaledIngredients.forEach(ing => {
      let displayName = ing.name;
      // Si l'option vegan est activée et qu'une alternative existe, l'utiliser.
      if (isVegan && ing.alternatives && ing.alternatives.vegan) {
        displayName = ing.alternatives.vegan;
      }
      // Sinon, si l'option sans gluten est activée et qu'une alternative existe, l'utiliser.
      else if (isGlutenFree && ing.alternatives && ing.alternatives.glutenFree) {
        displayName = ing.alternatives.glutenFree;
      }
      // Sinon, si l'option végétarienne est activée et qu'une alternative existe, l'utiliser.
      else if (isVegetarian && ing.alternatives && ing.alternatives.vegetarian) {
        displayName = ing.alternatives.vegetarian;
      }
      
      let itemText = '';
      if (ing.scaledQuantity !== null) {
        itemText += `${ing.scaledQuantity} `;
      }
      if (ing.unit) {
        itemText += `${ing.unit} `;
      }
      itemText += displayName;
      if (ing.notes) {
        itemText += ` (${ing.notes})`;
      }

      const li = document.createElement('li');
      li.textContent = itemText;
      ingredientList.appendChild(li);
    });
  }

  // Ajoute les écouteurs d'événements pour mettre à jour la liste des ingrédients lorsque les valeurs changent.
  document.getElementById('servings').addEventListener('input', renderIngredients);
  if (document.getElementById('vegan') && !document.getElementById('vegan').disabled) {
    document.getElementById('vegan').addEventListener('change', renderIngredients);
  }
  if (document.getElementById('glutenFree') && !document.getElementById('glutenFree').disabled) {
    document.getElementById('glutenFree').addEventListener('change', renderIngredients);
  }
  if (document.getElementById('vegetarian') && !document.getElementById('vegetarian').disabled) {
    document.getElementById('vegetarian').addEventListener('change', renderIngredients);
  }

  // Affichage initial de la liste des ingrédients.
  renderIngredients();
}
