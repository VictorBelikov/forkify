import axios from 'axios'; // from package.json; instead featch(), whick doesn't work in all browsers

export default class Search {
  constructor(query) {
    this.query = query;
  }
  async getResults() {
    const proxy = 'https://cors.io/?';
    const key = '4153deb9f970fb3a7767f8182e1c39c0';
    try {
      const res = await axios(`${proxy}http://food2fork.com/api/search?key=${key}&q=${this.query}`);
      this.result = res.data.recipes;
    } catch (error) {
      alert(error);
    }
  }
}
