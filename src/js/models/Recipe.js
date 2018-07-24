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
}