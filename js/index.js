// Fetch the recipes from the JSON file and display them in a list
fetch('data/recipes.json')
  .then(response => response.json())
  .then(recipes => {
    const list = document.getElementById('recipe-list');
    recipes.forEach(recipe => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      // Link to recipe.html with a query parameter for the recipe id
      link.href = `recipe.html?id=${recipe.id}`;
      link.textContent = recipe.title;
      li.appendChild(link);
      list.appendChild(li);
    });
  })
  .catch(error => console.error('Error loading recipes:', error));
