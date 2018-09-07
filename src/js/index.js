import { elements, renderLoader, clearLoader } from './views/base';
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import Likes from './models/Likes';

/**
 * GLOBAL STATE OF THE APPLICATION
 */
const state = {};

/**
 * SEARCH CONTROLLER
 */
async function controlSearch() {
  // 1. Get query from the view
  const query = searchView.getInput();
  if (query) {
    // 2. New search object and add to state
    state.search = new Search(query);
    // 3. Prepare UI for results
    searchView.clearFields();
    renderLoader(elements.recipeResDiv);
    try {
      // 4. Search for recipes; await --> Задерживаем код здесь до получения результата
      await state.search.getResults();
      // 5. Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      console.log(`!!ERROR in the Search!!`);
      clearLoader();
    }
  }
}
// Инициируется по нажатию кнопки SEARCH
elements.searchButton.addEventListener('submit', e => {
  e.preventDefault(); // отменяем перезагрузку страницы
  controlSearch();
});
// Кнопки перелистывания страниц
elements.pageButtons.addEventListener('click', e => {
  // closest() возвр. ближайший родительский эл-т (или сам эл-т), кот. соответствует заданному CSS-селектору или null
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto);
    searchView.clearFields();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * RECIPE CONTROLLER
 */
async function controlRecipe() {
  const id = window.location.hash.replace('#', ''); // get ID from browser URL
  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    // Highlight selected item
    if (state.search) searchView.highlightSelected(id);
    // Create new recipe object
    state.recipe = new Recipe(id);
    try {
      // Get recipe data
      await state.recipe.getRecipe();
      // Calculate servings, time and parse ingredients
      state.recipe.parseIngredients();
      state.recipe.calcTime();
      state.recipe.calcServings();
      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (err) {
      console.log(`!!ERROR processing recipe!!`);
    }
  }
}
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */
function controlList() {
  // Create a new List IF there in none yet
  if (!state.list) state.list = new List();
  // Add each ingredient to the List and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;
  // Handle the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from state
    state.list.deleteItem(id);
    // Delete from UI
    listView.deleteItem(id);
    // Count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});

/**
 * LIKE CONTROLLER
 */
function controlLike() {
  if (!state.likes) state.likes = new Likes();
  // User has NOT yet liked current recipe
  const currId = state.recipe.id;
  if (!state.likes.isLiked(currId)) {
    // Add like to the data
    const newLike = state.likes.addLike(currId, state.recipe.title, state.recipe.author, state.recipe.img);
    // Toggle the like button
    likesView.toggleLikeBtn(true);
    // Add like to the UI list
    likesView.renderLike(newLike);
    // User HAS liked current recipe
  } else {
    // Remove like from the data
    state.likes.deleteLike(currId);
    // Toggle the like button
    likesView.toggleLikeBtn(false);
    // Remove like from the UI list
    likesView.deleteLike(currId);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore likes from the localStorage when page load
window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readLocalStorage(); // restore likes
  likesView.toggleLikeMenu(state.likes.getNumLikes()); // toggle like menu button
  // Render existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

/**
 * Handling Recipe button clicks
 */
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to shopping list
    listView.clearlist();
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    controlLike();
  }
});
