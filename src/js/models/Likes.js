export default class Likes {
  constructor() {
    this.likes = [];
  }
  addLike(id, title, author, img) {
    const like = { id, title, author, img };
    this.likes.push(like);
    this.persistData(); // перезаписываем по этому ключу в localStorage
    return like;
  }
  deleteLike(id) {
    const index = this.likes.findIndex(el => el.id === id);
    this.likes.splice(index, 1);
    this.persistData(); // перезаписываем по этому ключу в localStorage
  }
  isLiked(id) {
    return ~this.likes.findIndex(el => el.id === id);
  }
  getNumLikes() {
    return this.likes.length;
  }
  persistData() {
    localStorage.setItem('likes', JSON.stringify(this.likes));
    // !!! TESTING !!!
    console.clear();
    console.log(localStorage.likes);
  }
  readStorage() {
    const storage = JSON.parse(localStorage.getItem('likes'));
    if (storage) this.likes = storage;
  }
}
