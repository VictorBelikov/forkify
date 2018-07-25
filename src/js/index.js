import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
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
