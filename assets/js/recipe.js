(function () {
  const recipeRoot = document.querySelector(".js-recipe");

  if (!recipeRoot) {
    return;
  }

  const list = recipeRoot.querySelector(".js-ingredient-list");
  const dataNode = recipeRoot.querySelector(".js-ingredients-data");
  const servingsInput = recipeRoot.querySelector(".js-servings");
  const toggles = Array.from(recipeRoot.querySelectorAll(".js-diet"));
  const baseServings = Number(recipeRoot.dataset.baseServings || 1);
  const ingredients = JSON.parse(dataNode.textContent || "[]");
  const priority = ["vegan", "gluten_free", "vegetarian"];
  const formatter = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2
  });

  function formatQuantity(quantity, factor) {
    if (typeof quantity !== "number" || Number.isNaN(quantity)) {
      return "";
    }

    return formatter.format(quantity * factor);
  }

  function getSelectedDiets() {
    return toggles
      .filter((toggle) => toggle.checked)
      .map((toggle) => toggle.value);
  }

  function getIngredientName(ingredient, selectedDiets) {
    if (!ingredient.alternatives) {
      return ingredient.name;
    }

    const match = priority.find(
      (key) => selectedDiets.includes(key) && ingredient.alternatives[key]
    );

    return match ? ingredient.alternatives[match] : ingredient.name;
  }

  function ingredientLine(ingredient, factor, selectedDiets) {
    const quantity = formatQuantity(ingredient.quantity, factor);
    const parts = [];

    if (quantity) {
      parts.push(quantity);
    }

    if (ingredient.unit) {
      parts.push(ingredient.unit);
    }

    parts.push(getIngredientName(ingredient, selectedDiets));

    if (ingredient.notes) {
      parts.push(`(${ingredient.notes})`);
    }

    return parts.join(" ");
  }

  function render() {
    const servings = Math.max(Number(servingsInput.value) || baseServings, 1);
    const factor = servings / baseServings;
    const selectedDiets = getSelectedDiets();

    list.innerHTML = ingredients
      .map((ingredient) => `<li>${ingredientLine(ingredient, factor, selectedDiets)}</li>`)
      .join("");
  }

  servingsInput.addEventListener("input", render);
  toggles.forEach((toggle) => {
    if (!toggle.disabled) {
      toggle.addEventListener("change", render);
    }
  });

  render();
})();
