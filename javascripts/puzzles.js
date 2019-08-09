import Puzzle from "./brick_by_brick.js";

const PUZZLES = {
  2018: [55, 56, 67, 68, 81, 82, 89, 90]
};

class Puzzles {
  constructor() {
    this.namespace = "Puzzles";
    this.render();
    this.bindEvents();
  }

  renderPuzzles(year) {
    const { [year]: ids } = PUZZLES;

    return ids.map((puzzle) => `
      <li>
        <a href="./puzzles/${year}_${puzzle}.json">${year}: ${puzzle}</a>
      </li>`).join("");
  }

  loadPuzzle(e) {
    const puzzle_id = e.target.href.split("/").pop().replace(/\..+$/, "");

    e.preventDefault();
    this.unbindEvents();
    new Puzzle(e.target.href);
    history.pushState({
      puzzle: e.target.href
    }, `Start puzzle ${e.target.innerText}`, `/puzzles/${puzzle_id}`);
  }

  unbindEvents() {
    $(document.body).off(`.${this.namespace}`);
  }

  bindEvents() {
    $(document.body).on(`click.${this.namespace}`, "a", this.loadPuzzle.bind(this));
    window.onpopstate = () => {
      new Puzzles();
    };
  }

  render() {
    $(document.body).empty().append(`
      <h1>Choose a puzzle</h1>
      <ul>
        ${this.renderPuzzles(2018)}
      </ul>
    `);
  }
}

export default Puzzles;
