import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Linked recipes
 */
const state = {};

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
    // 4. Search for recipes
    await state.search.getResults();
    // 5. Render results on UI
    clearLoader();
    searchView.renderResults(state.search.result);
  }
}

elements.searchForm.addEventListener('submit', event => {
  event.preventDefault(); // чтобы страница не перезагружалась
  controlSearch();
});