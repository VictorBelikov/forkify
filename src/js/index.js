import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      console.log(`Error processing recipe! ${error}`);
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

/**
 * LIKE CONTROLLER
 */
function controlLike() {
  if (!state.likes) {
    state.likes = new Likes();
  }
  const currentId = state.recipe.id;
  if (!state.likes.isLiked(currentId)) {
    // User has NOT yet liked current recipe
    // 1. Add like to the state
    const newLike = state.likes.addLike(currentId, state.recipe.title, state.recipe.author, state.recipe.img);
    // 2. Toggle the like button
    likesView.toggleLikeBtn(true);
    // 3. Add like to the UI list
    likesView.renderLike(newLike);
  } else {
    // User HAS liked current recipe
    // 1. Remove like from the state
    state.likes.deleteLike(currentId);
    // 2. Toggle the like button
    likesView.toggleLikeBtn(false);
    // 3. Remove like from the UI list
    likesView.deleteLike(currentId);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore likes on page load from localStorage
window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage(); // from localStorage
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  // Render the existing likes
  state.likes.likes.forEach(el => likesView.renderLike(el));
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
    // Add ingredient to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike();
  }
});
