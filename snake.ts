type coord = [number, number];
type line = [coord];
type LevelMap = [line];

enum keys {
  RETURN = 13,
  SPACE = 32,
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  C = 67,
  G = 71,
  J = 74,
  K = 75
}

const SIZE = 20;
const MARGIN = 60;
const SLOWEST = 250;
const FASTEST = 0;

/**
 * Registry of occupied spaces
 */
namespace Locations {
  let data: { [location: string]: boolean } = {};

  export function set(x: number, y: number): void {
    data[`${x}:${y}`] = true;
  }

  export function remove(x: number, y: number): void {
    delete data[`${x}:${y}`];
  }

  export function has(x: number, y: number): boolean {
    return data[`${x}:${y}`] === true;
  }
}

/**
 * Some Utilities
 */
namespace Utils {
  export function rand(min: number, max: number, reduce: number = SIZE): number {
    let num = Math.floor(Math.random() * (max - min)) + min;
    return num - (num % reduce);
  }

  export function snap(number, point = SIZE) {
    let bottom = number - number % point;
    let top = bottom + point;

    return number - bottom <= top - number ? bottom : top;
  }

  export function removeNode(el: Element) {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  export function bound(num: number, min: number, max: number): number {
    return Math.max(Math.min(num, max), min);
  }
}

class Piece {
  next: Piece;
  el: HTMLDivElement;

  constructor(
    public x: number,
    public y: number,
    public type: string = "body",
    public direction: string = "RIGHT") {

    this.el = document.createElement("div");
    this.next = null;
    // Enable for a neat effect
    // this.el.innerHTML = "&#10096;";
    this.setType(type);
    this.setPos(this.x, this.y);
    document.body.appendChild(this.el);
  }

  setPos(x: number, y: number): void {
    // CSS nove the element
    this.el.style.top = `${y}px`;
    this.el.style.left = `${x}px`;
    
    // this.el.style.transform = `translate(${x}px, ${y}px)`;

    // reset CSS classnames basically
    this.applyClass();

    // Save the location of this piece to occupied spaces
    // But don"t do this, if we are the food or head because;
    // - Head cannot collide with itself
    // - We want to collide with food :)
    if (this.type !== "head" && this.type !== "food") {
      Locations.set(x, y);
    }
  }

  move(x: number, y: number, direction: string = "RIGHT"): void {
    // Transition through walls
    if (x < 0) {
      x = Utils.snap(document.body.clientWidth) - SIZE;
    } else if (y < 0) {
      y = Utils.snap(document.body.clientHeight) - SIZE;
    } else if (x >= Utils.snap(document.body.clientWidth)) {
      x = 0;
    } else if (y >= Utils.snap(document.body.clientHeight)) {
      y = 0;
    }

    // Save the old direction
    let tdirection = this.direction;
    // Set new direction of the piece
    this.direction = direction;
    // Move HTML Element to new spot
    this.setPos(x, y);
    // If there is a next piece move it to old position
    if (this.next !== null) {
      // If this piece is a head piece, immediate piece should receive heads current
      // direction instead of old one this is needed to have a fluid motion
      this.next.move(this.x, this.y, this.type === "head" ? this.direction : tdirection);
    } else {
      // We are the last piece, previous position
      // is now empty, clear it
      Locations.remove(this.x, this.y);
    }

    // if I'm part of body and no one is following me
    // then I must be the tail
    if (this.next === null && this.type === "body") {
      this.el.classList.add("tail");
    }

    // if me and the piece following me are at the same spot
    // then piece following me must be the food we just swallowed
    if (this.next !== null && this.next.x === x && this.next.y === y) {
      this.next.el.classList.add("gulp");
    }

    // Bendy corners
    if (this.next !== null && this.direction !== this.next.direction) {
      this.el.classList.add(`${this.direction}-${this.next.direction}`);
    }

    // store new values
    this.x = x;
    this.y = y;
  }

  setType(type: string): void {
    this.type = type;
    this.applyClass();
  }

  applyClass() {
    this.el.className = '';
    this.el.classList.add('cell', this.type, this.direction);
  }

  remove(): void {
    // Remove the piece, it's location and HTML element
    // This is needed to free up memory
    Utils.removeNode(this.el);
    Locations.remove(this.x, this.y);

    // Do the same for all linked pieces
    if (this.next) {
      this.next.remove();
      this.next = null;
    }
  }
}

namespace Directions {
  let queue: number[] = [];
  let current: number = keys.RIGHT;

  export function set(key: number) {
    queue.push(key);
  }

  export function get() {
    return current;
  }

  export function pop() {
    if (queue.length > 0) {
      current = queue.shift();
    }
    return get();
  }

  export function flush() {
    queue = [];
    current = keys.RIGHT;
  }

  export function peek() {
    return queue.length > 0 ? queue[queue.length - 1] : current;
  }
}

class Game {
  public head: Piece;
  public food: Piece;
  public length: number = 0;
  public highScore: number = 0;
  public score: number = 0;
  public currentLevel: Level = null;

  private moving: boolean = false;
  private paused: boolean = false;
  private gridVisible: boolean = false;
  private debugSpeed: number = 0;
  private noClip: boolean = false;

  constructor(private levels: Level[]) {
    this.head = new Piece(80, 80, "head");

    this.resetHead();
    this.handleFood();
    this.setEvents();
  }

  getRandomLevel(): Level {
    return this.levels[Math.floor(Math.random() * this.levels.length)];
  }

  // Remove the old chain, put HEAD in the starting position
  resetHead(): void {
    if (this.head.next) {
      this.head.next.remove();
      this.head.next = null;
    }

    let x = SIZE * 7;
    let y = SIZE * 5;

    this.head.move(x, y);
    this.head.next = new Piece(x - SIZE, y);
    this.head.next.next = new Piece(x - SIZE * 2, y, "tail");
  }

  /**
   * Reset all values and restart the game
   */
  start(): void {
    // Don"t restart already running game
    if (this.moving === false) {
      this.resetHead();
      this.length = 0;
      this.debugSpeed = 0;
      this.score = 0;
      Directions.flush();

      this.showScore();
      this.moving = true;
      requestAnimationFrame(this.frame.bind(this));
    }
  }

  /**
   * GAME OVER
   */
  over(): void {
    this.moving = false;
    let el = <HTMLDivElement>document.querySelector(".score");
    el.innerHTML = `
      Game over! Score: ${this.length * 1000}.
      <button id="start">Click here to try again.</button>
    `;
  }

  /**
   * Get a random empty location for food
   */
  getFoodLocation(): number[] {
    let x = Utils.rand(MARGIN, document.body.clientWidth - MARGIN, SIZE);
    let y = Utils.rand(MARGIN, document.body.clientHeight - MARGIN, SIZE);

    // If random spot is already filled, pick a new one
    // Pick until you find an empty spot
    // ..... nothing can go wrong with this
    if (Locations.has(x, y)) {
      [x, y] = this.getFoodLocation();
    }

    return [x, y];
  }

  handleFood(): void {
    // If the there is no food, create a random one.
    if (this.food == null) {
      let [foodX, foodY] = this.getFoodLocation();
      this.food = new Piece(foodX, foodY, "food");
    }

    // if head and food collided, replace head with the food
    // set the correct type for each piece
    if (this.head.x === this.food.x && this.head.y === this.food.y) {
      this.food.next = this.head; // put food at the top of the chain
      this.food.direction = this.head.direction; // Needs to go to same direction where head was going
      this.head.setType("body");  // head is not body
      this.food.setType("head");  // food is now head
      this.head = this.food;  // Update the Game instance with new head
      this.food = null;       // food is gone now

      // Do not count baits grabbed while
      // in no clip mode
      if (this.noClip === false) {
        this.length++;        // Snake got bigger 
      }

      this.updateScore();     // Calculate the new score
      this.showScore();       // Update the score
    }
  }

  getSpeed(): number {
    const initialSpeed = 150;
    const calculated = (initialSpeed - this.length * 0.5) + this.debugSpeed;

    return Utils.bound(calculated, FASTEST, SLOWEST);
  }

  updateScore(): number {

    if (this.noClip === true) {
      return this.score;
    }

    const level = 500;
    const speed = this.getSpeed();
    const val = (SLOWEST - speed) * this.length;
    let leveled = Utils.snap(val, level);

    // You should not get zero points
    if (leveled < level) {
      leveled = level;
    }

    return this.score += leveled;
  }

  showScore(): void {
    let el = <HTMLDivElement>document.querySelector(".score");
    this.highScore = this.highScore < this.score ? this.score : this.highScore;
    el.innerHTML = `
      Score: ${this.score}, High Score: ${this.highScore}
    `;
  }

  frame(): void {
    if (this.moving) {
      setTimeout(() => {
        requestAnimationFrame(this.frame.bind(this));
      }, this.getSpeed()); // higher the score, faster the snake
    }

    if (this.paused) {
      return; // just pause
    }

    // If head hits an occupied space, GAME OVER
    if (Locations.has(this.head.x, this.head.y) && this.noClip === false) {
      return this.over();
    }

    // If Game is not over, then move the snake to requested direction
    let direction = Directions.pop();

    if (direction === keys.RIGHT) {
      this.head.move(this.head.x + SIZE, this.head.y, keys[direction]);
    }

    if (direction === keys.LEFT) {
      this.head.move(this.head.x - SIZE, this.head.y, keys[direction]);
    }

    if (direction === keys.DOWN) {
      this.head.move(this.head.x, this.head.y + SIZE, keys[direction]);
    }

    if (direction === keys.UP) {
      this.head.move(this.head.x, this.head.y - SIZE, keys[direction]);
    }

    // Check if we caught caught the food
    // or we need to place a new food
    this.handleFood();
  }

  /**
   * Don"t let snake to go backwards
   */
  notBackwards(key: number): boolean {
    let lastDirection = Directions.peek();

    if (lastDirection === keys.UP && key === keys.DOWN
      || lastDirection === keys.DOWN && key === keys.UP
      || lastDirection === keys.LEFT && key === keys.RIGHT
      || lastDirection === keys.RIGHT && key === keys.LEFT) {
      return false;
    }
    return true;
  }

  setEvents(): void {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      switch (e.keyCode) {
        // Toggle Grid
        case keys.G:
          if (this.gridVisible) {
            this.removeGrid();
          } else {
            this.drawGrid();
          }
          break;
        // Enable No Clip mode.
        case keys.C:
          this.noClip = !this.noClip;
          document.body.classList.toggle("noclip");
          break;
        // Slowdown the snake
        case keys.J:
          this.debugSpeed += 10;
          break;
        // Speed up the snake
        case keys.K:
          this.debugSpeed -= 10;
          break;
        // Pause or restart the game
        case keys.SPACE:
          if (this.moving) {
            this.paused = !this.paused;
          } else {
            this.start();
          }
          e.preventDefault();
          break;
        // Restart the game
        case keys.RETURN:
          this.start();
          break;
        // Arrow keys or nothing
        default:
          // Select levels
          // 0 = remove level
          // 1-9 = render level if exists
          if (e.keyCode >= 48 && e.keyCode <= 57) {
            let number = e.keyCode - 48; // to get the pressed number

            if (number === 0) {
              if (this.currentLevel) {
                this.currentLevel.remove();
                this.currentLevel = null;
              }
            } else if (number - 1 in this.levels) {
              if (this.currentLevel) {
                this.currentLevel.remove();
              }
              this.currentLevel = this.levels[number - 1];
              this.currentLevel.render();
            }
          }

          if (e.keyCode in keys && this.notBackwards(e.keyCode)) {
            Directions.set(e.keyCode);
            e.preventDefault();
          }
      }
    });

    document.addEventListener("click", (e: MouseEvent) => {
      let el = <HTMLElement>e.target;
      if (el.id == "start") {
        this.start();
      }
    });

    window.addEventListener("resize", () => {
      if (this.currentLevel) {
        this.currentLevel.remove();
        this.currentLevel.render();
      }

      if (this.gridVisible) {
        this.removeGrid();
        this.drawGrid();
      }
    })
  }

  removeGrid(): void {
    let grids = document.querySelectorAll(".vertical-grid, .horizontal-grid");
    [].forEach.call(grids, (div) => {
      Utils.removeNode(div);
    });
    this.gridVisible = false;
  }

  drawGrid(): void {
    for (let x = 0; x < document.body.clientWidth; x += SIZE) {
      let div = document.createElement("div");
      div.style.top = "0px";
      div.style.left = `${x}px`;
      div.classList.add("vertical-grid");
      document.body.appendChild(div);
    }

    for (let x = 0; x < document.body.clientHeight; x += SIZE) {
      let div = document.createElement("div");
      div.style.left = "0px";
      div.style.top = `${x}px`;
      div.classList.add("horizontal-grid");
      document.body.appendChild(div);
    }

    this.gridVisible = true;
  }
}

class Level {

  private pieces: Piece[] = [];

  constructor(private generatorFunction: (rows: number, cols: number) => LevelMap) { }

  private translate(x: number, y: number): coord {
    return [Math.floor(x) * SIZE, Math.floor(y) * SIZE];
  }

  remove() {
    this.pieces.forEach((piece) => {
      piece.remove();
    });
  }

  line(x0, y0, x1, y1) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      // Waiting for proposal
      // https://github.com/Microsoft/TypeScript/issues/5296
      // this.pieces.push(new Piece(...this.translate(x0, y0), 'wall'));
      let [tx0, ty0] = this.translate(x0, y0);
      this.pieces.push(new Piece(tx0, ty0, 'wall'));
      
      // break when line is done
      if (Math.abs(x0 - x1) <= 0.5 && Math.abs(y0 - y1) <= 0.5) break;
      
      let e2 = 2 * err;
      
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  render() {
    let cols = Math.floor(document.body.clientHeight / SIZE);
    let rows = Math.floor(document.body.clientWidth / SIZE);
    let level = this.generatorFunction(rows, cols);

    level.forEach((line) => {
      let [x0, y0]: coord = line[0];
      let [x1, y1]: coord = line[1];

      this.line(x0, y0, x1, y1);
    });
  }
}

let level1 = new Level((rows, cols): LevelMap => {
  let [halfCols, halfRows] = [cols / 2, rows / 2];
  return [
    // top walls
    [[3, 3], [halfRows - 3, 3]],
    [[halfRows + 3, 3], [rows - 3, 3]],

    // right walls
    [[rows - 3, 3], [rows - 3, halfCols - 3]],
    [[rows - 3, halfCols + 3], [rows - 3, cols - 3]],

    // bottom walls
    [[rows - 3, cols - 3], [halfRows + 3, cols - 3]],
    [[halfRows - 3, cols - 3], [3, cols - 3]],

    // Left walls
    [[3, cols - 3], [3, halfCols + 3]],
    [[3, halfCols - 3], [3, 3]],
  ]
});

let level2 = new Level((rows, cols): LevelMap => {
  let [halfRows, halfCols] = [rows / 2, cols / 2];
  return [
    [[halfRows - 2, halfCols], [halfRows + 2, halfCols]],
    [[halfRows, halfCols - 2], [halfRows, halfCols + 2]],

    [[halfRows - 8, halfCols - 8], [halfRows - 3, halfCols - 3]],
    [[halfRows + 3, halfCols + 3], [halfRows + 8, halfCols + 8]],

    [[halfRows + 8, halfCols - 8], [halfRows + 3, halfCols - 3]],
    [[halfRows - 3, halfCols + 3], [halfRows - 8, halfCols + 8]],
  ];
});

let level3 = new Level((rows, cols): LevelMap => {
  let [halfRows, halfCols] = [rows / 2, cols / 2];
  return [
    // top walls
    [[3, 3], [halfRows - 3, 3]],
    [[halfRows + 3, 3], [rows - 3, 3]],

    // right walls
    [[rows - 3, 3], [rows - 3, halfCols - 3]],
    [[rows - 3, halfCols + 3], [rows - 3, cols - 3]],

    // bottom walls
    [[rows - 3, cols - 3], [halfRows + 3, cols - 3]],
    [[halfRows - 3, cols - 3], [3, cols - 3]],

    // Left walls
    [[3, cols - 3], [3, halfCols + 3]],
    [[3, halfCols - 3], [3, 3]],

    // inner walls
    // top walls
    [[9, 9], [halfRows - 6, 9]],
    [[halfRows + 6, 9], [rows - 9, 9]],

    // right walls
    [[rows - 9, 9], [rows - 9, halfCols - 6]],
    [[rows - 9, halfCols + 6], [rows - 9, cols - 9]],

    // bottom walls
    [[rows - 9, cols - 9], [halfRows + 6, cols - 9]],
    [[halfRows - 6, cols - 9], [9, cols - 9]],

    // Left walls
    [[9, cols - 9], [9, halfCols + 6]],
    [[9, halfCols - 6], [9, 9]],
  ]
})

let level4 = new Level((rows, cols): LevelMap => {
  let [halfRows, halfCols] = [rows / 2, cols / 2];
  return [
    [[3, 3], [rows - 3, cols - 3]],
    [[rows - 3, 3], [3, cols - 3]]
  ];
});

let g = new Game([
  level1,
  level2,
  level3,
  level4
]);

