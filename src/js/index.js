import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Linked recipes
 */
const state = {};
/**
 * SEARCH CONTROLLER
 */
async function controlSearch() {
  // 1. Get query from the view
  const query = searchView.getSearchInput();
  if (query) {
    // 2. New search object and add to state
    state.search = new Search(query);
    // 3. Prepare UI for the results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      // 4. Search for recipes
      await state.search.getResults();
      // 5. Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert(`Something wrong with the search... ${error}`);
      clearLoader();
    }
  }
}

elements.searchForm.addEventListener('submit', event => {
  event.preventDefault(); // чтобы страница не перезагружалась
  controlSearch();
});

elements.searchResPagesButtons.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * RECIPE CONTROLLER
 */
async function controlRecipe() {
  const id = window.location.hash.replace('#', ''); // get ID from url in browser
  if (id) {
    // Prepare UI from changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    // Highlihgt selected search item
    if (state.search) searchView.highlightSelected(id);
    // Create new recipe object
    state.recipe = new Recipe(id);
    try {
      // Get recipe data and parse ingridients
      await state.recipe.getRecipe();
      state.recipe.parseIngridients();
      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      // Render the recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (error) {
      alert(`Error processing recipe! ${error}`);
    }
  }
}
// hashchange генерируется, когда изменяется идентификатор(#id) фрагмента url
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(el => window.addEventListener(el, controlRecipe));

/**
 * LIST CONTROLLER
 */
function controlList() {
  // Create a new list IF there in none yet
  if (!state.list) {
    state.list = new List();
    window.list = state.list; // !!!TESTING!!!
  }
  // Add each ingridient to the list and UI
  state.recipe.ingredients.forEach(ingredient => {
    const item = state.list.addItem(ingredient.count, ingredient.unit, ingredient.ingredient);
    listView.renderItem(item);
  });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  // берем от e.target ближайший .shopping__item вверх по цепочке, здесь это будет сам (target) --> id у самого себя
  const id = e.target.closest('.shopping__item').dataset.itemid;
  // Handle the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    state.list.deleteItem(id); // Delete from state
    listView.deleteItem(id); // Delete form the UI
    // Handle the count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});
// ===========================================================================================
// Handling recipe buttons
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // Increase button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
  }
});
