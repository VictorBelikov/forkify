/** Тут мы получаем значения полей */

import { elements } from './base';

export const getSearchInput = () => elements.searchInput.value;

export const clearInput = () => {
  elements.searchInput.value = '';
};

export const clearResults = () => {
  elements.searchResList.innerHTML = '';
};

function limitRecipeTitle(title, limit = 17) {
  const newTitle = [];
  if (title.length > limit) {
    title.split(' ').reduce((sum, el) => {
      if (sum + el.length <= limit) {
        newTitle.push(el);
      }
      return sum + el.length; // чтобы сумма накапливалась
    }, 0);
    return `${newTitle.join(' ')} ...`; // просто обрезали добавив ... в конце
  }
  return title;
}

function renderRecipe(recipe) {
  const markup = `
    <li>
      <a class="results__link" href="#${recipe.recipe_id}">
        <figure class="results__fig">
          <img src="${recipe.image_url}" alt="${recipe.title}">
        </figure>
        <div class="results__data">
          <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
          <p class="results__author">${recipe.publisher}</p>
        </div>
      </a>
    </li>
  `;
  elements.searchResList.insertAdjacentHTML('beforeend', markup);
}

export function renderResults(recipes) {
  // recipes.forEach(el => renderRecipe(el));
  recipes.forEach(renderRecipe);
}
