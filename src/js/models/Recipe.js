import axios from 'axios'; // from package.json; instead featch(), whick doesn't work in all browsers
import { key, proxy } from '../config';

export default class Recipe {
  constructor(id) {
    this.id = id;
  }
  async getRecipe() {
    try {
      const res = await axios(`${proxy}http://food2fork.com/api/get?key=${key}&rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (err) {
      console.log(`ERROR! ${err}`);
      alert('Something went wrong ;(');
    }
  }
  calcTime() {
    // Assuming that we need 15min for each 3 ingredients
    const numIng = this.ingredients.length;
    this.time = Math.ceil(numIng / 3) * 15;
  }
  calcServings() {
    this.servings = 4; // 4 порции на каждый рецепт
  }
  parseIngridients() {
    const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
    const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
    const units = [...unitsShort, 'kg', 'g'];
    // Из массива строк создаем массив объектов
    const newIngridients = this.ingredients.map(el => {
      // 1. Uniform units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });
      // 2. Remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, ' '); // [^)]* - кроме указ. в наборе от 0 и более раз
      // 3. Parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(elem => units.includes(elem));
      let objIng, count;

      if (~unitIndex) {
        // There is a unit
        const arrCount = arrIng.slice(0, unitIndex);
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace('-', '+'));
        } else {
          count = eval(arrCount.join('+')); // eval('5+1/2') --> 5.5
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        };
      } else if (parseInt(arrIng[0])) {
        // There is NO a unit, but 1st elem is number
        objIng = {
          count: parseInt(arrIng[0]),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        };
      } else if (unitIndex === -1) {
        // There is NO a unit
        objIng = {
          count: 1,
          unit: '',
          ingredient
        };
      }
      return objIng;
    });
    this.ingredients = newIngridients;
  }
  updateServings(type) {
    // Servings
    const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
    // Ingredients
    this.ingredients.forEach(ingr => {
      ingr.count *= newServings / this.servings; // это вычисление странное
    });
    this.servings = newServings;
  }
}
