import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export function clearFields() {
  elements.searchInput.value = '';
  elements.recipeResList.innerHTML = '';
  elements.pageButtons.innerHTML = '';
}

export function highlightSelected(id) {
  const resultArr = Array.from(document.querySelectorAll('.results__link'));
  resultArr.forEach(el => {
    el.classList.remove('results__link--active');
  });
  document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
}

export function limitRecipeTitle(title, limit = 17) {
  if (title.length > limit) {
    const newTitle = [];
    title.split(' ').reduce((sum, el) => {
      if (sum + el.length <= limit) {
        newTitle.push(el);
      }
      return sum + el.length;
    }, 0);
    return `${newTitle.join(' ')} ...`;
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
  elements.recipeResList.insertAdjacentHTML('beforeend', markup);
}

const createButton = (page, type) => `
  <button class="btn-inline results__btn--${type}" data-goto="${type === 'prev' ? page - 1 : page + 1}">
    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
    <svg class="search__icon">
      <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
    </svg>
  </button>
`;

function renderButtons(page, numResults, resPerPage) {
  const pages = Math.ceil(numResults / resPerPage);
  let button;

  if (page === 1 && pages > 1) {
    // Only button to go to next page
    button = createButton(page, 'next');
  } else if (page < pages) {
    // Both buttons
    button = `
      ${createButton(page, 'prev')}
      ${createButton(page, 'next')}
    `;
  } else if (page === pages && pages > 1) {
    // Only button to go to previous page
    button = createButton(page, 'prev');
  }
  elements.pageButtons.insertAdjacentHTML('afterbegin', button);
}

export function renderResults(recipes, page = 1, resPerPage = 10) {
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;
  recipes.slice(start, end).forEach(renderRecipe); // recipes.forEach(el => renderRecipe(el));

  renderButtons(page, recipes.length, resPerPage);
}
