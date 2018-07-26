import { elements } from './base';

export const getSearchInput = () => elements.searchInput.value;

export const clearInput = () => {
  elements.searchInput.value = '';
};

export const clearResults = () => {
  elements.searchResList.innerHTML = '';
  elements.searchResPagesButtons.innerHTML = '';
};

export function highlightSelected(id) {
  const resultsArr = Array.from(document.querySelectorAll('.results__link'));
  resultsArr.forEach(el => {
    el.classList.remove('results__link--active');
  });
  document.querySelector(`a[href="#${id}"`).classList.add('results__link--active');
}

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

function createButton(page, type) {
  return `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
      <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
      <svg class="search__icon">
        <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
      </svg>
    </button>
  `;
}

function renderPageButtons(page, numResults, resPerPage) {
  const pages = Math.ceil(numResults / resPerPage);
  let button;

  if (page === 1 && pages > 1) {
    // only button to go to next page
    button = createButton(page, 'next');
  } else if (page < pages) {
    // both buttons
    button = `
      ${createButton(page, 'prev')}
      ${createButton(page, 'next')}
    `;
  } else if (page === pages && pages > 1) {
    // only button to go to previous page
    button = createButton(page, 'prev');
  }
  elements.searchResPagesButtons.insertAdjacentHTML('afterbegin', button);
}

export function renderResults(recipes, page = 1, resPerPage = 10) {
  // render results of current page
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;
  recipes.slice(start, end).forEach(renderRecipe);
  // render pagination
  renderPageButtons(page, recipes.length, resPerPage);
}
