import { SIZE, MARGIN, SLOWEST, FASTEST, keys } from './constants';
import Piece from './Piece';
import Utils from './Utils';
import Level from './Level';
import Locations from './Locations';
import Directions from './Directions';

// window.Locations = Locations;
export default class Game {
  head: Piece;

  tail: Piece;

  food: Piece | null = null;

  length: number = 0;

  highScore: number = 0;

  score: number = 0;

  currentLevel: Level | null = null;

  private moving: boolean = false;

  private paused: boolean = false;

  private gridVisible: boolean = false;

  private debugSpeed: number = 0;

  private keyHeld: number = 0;

  private noClip: boolean = false;

  constructor (private levels: Level[]) {
    this.head = new Piece({ x: 80, y: 80, type: 'head' });
    this.tail = this.resetHead();
    this.handleFood();
    this.setEvents();
    // this.tail = this.head.next.next;
  }

  getRandomLevel (): Level {
    return this.levels[Math.floor(Math.random() * this.levels.length)];
  }

  // Remove the old chain, put HEAD in the starting position
  resetHead (): Piece {
    if (this.head.next) {
      this.head.next.remove();
      this.head.next = null;
    }
    const LENGTH = 10;
    const x = (SIZE * LENGTH) + SIZE;
    const y = SIZE * 5;

    let curr = this.head;
    this.head.move(x, y);

    for (let i = 1; i <= LENGTH; i += 1) {
      curr.next = new Piece({ x: x - SIZE * i + 2, y, prev: curr });
      curr = curr.next;
    }
    curr.setType('tail');
    return curr;
  }

  /**
   * Reset all values and restart the game
   */
  start (): void {
    // Don"t restart already running game
    if (this.moving === false) {
      this.tail = this.resetHead();
      this.length = 0;
      this.debugSpeed = 0;
      this.keyHeld = 0;
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
  over (): void {
    this.moving = false;
    const el = <HTMLDivElement>document.querySelector('.score');
    el.innerHTML = `
      Game over! Score: ${this.length * 1000}.
      <button id="start">Click here to try again.</button>
    `;
  }

  /**
     * Get a random empty location for food
     */
  getFoodLocation (): number[] {
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

  handleFood (): void {
    // If the there is no food, create a random one.
    if (this.food == null) {
      const [foodX, foodY] = this.getFoodLocation();
      this.food = new Piece({ x: foodX, y: foodY, type: 'food' });
    }

    // if head and food collided, replace head with the food
    // set the correct type for each piece
    if (this.head.x === this.food.x && this.head.y === this.food.y) {
      // this.food.next = this.head; // put food at the top of the chain
      // this.food.direction = this.head.direction; // Needs to go to same direction where head was going
      // this.head.setType('body'); // head is not body
      // this.food.setType('head'); // food is now head
      // this.head = this.food; // Update the Game instance with new head
      // (this.head.next as Piece).prev = this.head;

      this.swallowFood();

      // Do not count baits grabbed while
      // in no clip mode
      if (this.noClip === false) {
        this.length += 1; // Snake got bigger
      }

      this.updateScore(); // Calculate the new score
      this.showScore(); // Update the score
    }
  }

  async swallowFood () {
    if (this.food == null) { return; }

    // this.food.remove();
    this.tail.next = this.food;
    this.tail.setType('body');
    this.food.prev = this.tail;
    this.tail = this.food;
    this.food.setType('tail');
    this.food = null; // food is gone now

    const swallow = (node: Piece) => {
      if (node.next !== null) {
        if (node.prev !== null) {
          node.prev.el.classList.remove('gulp');
        }

        node.el.classList.add('gulp');

        if (this.paused || !this.moving) { return; } // if paused, stop animation

        setTimeout(() => {
          requestAnimationFrame(() => {
            swallow(node.next as Piece);
          });
        }, this.getSpeed() / 2);
      }
    };

    swallow(this.head.next as Piece);
  }

  getSpeed (): number {
    const initialSpeed = 130;
    const calculated = (initialSpeed - this.length * 0.5) + this.debugSpeed + this.keyHeld;

    return Utils.bound(calculated, FASTEST, SLOWEST);
  }

  updateScore (): number {
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

    this.score += leveled;

    return this.score;
  }

  showScore (): void {
    const el = <HTMLDivElement>document.querySelector('.score');
    this.highScore = this.highScore < this.score ? this.score : this.highScore;
    el.innerHTML = `
            Score: ${this.score}, High Score: ${this.highScore}
        `;
  }

  frame (): void {
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
    const direction = Directions.pop();

    // Remove tracking for tails location.
    Locations.remove(this.tail.x, this.tail.y);
    // Record the last location of previous head
    Locations.set(this.head.x, this.head.y);

    // Turn tail into HEAD and move it to where head is supposed to go.
    this.tail.setType('head');
    switch (direction) {
      case keys.RIGHT:
        this.tail.move(this.head.x + SIZE, this.head.y, keys[direction]);
        break;
      case keys.LEFT:
        this.tail.move(this.head.x - SIZE, this.head.y, keys[direction]);
        break;
      case keys.DOWN:
        this.tail.move(this.head.x, this.head.y + SIZE, keys[direction]);
        break;
      case keys.UP:
        this.tail.move(this.head.x, this.head.y - SIZE, keys[direction]);
        break;
      default:
    }

    const prevHead = this.head;

    // Turn the piece before the tail into new tail.
    [this.head, this.tail] = [this.tail, this.tail.prev as Piece];
    this.tail.next = null; // nothing after the tail.
    this.tail.setType('tail');


    // turn previous head into body piece
    prevHead.setType('body');
    prevHead.prev = this.head;
    // if head changed direction, bend this piece accordingly.
    prevHead.bend(this.head.direction);

    this.head.prev = null; // nothing before the head
    this.head.next = prevHead; // previous head follows new head
    this.head.setType('head'); // it is head.

    // Check if we caught caught the food
    // or we need to place a new food
    this.handleFood();
  }

  /**
   * Don"t let snake to go backwards
   */
  // eslint-disable-next-line class-methods-use-this
  notBackwards (key: number): boolean {
    const lastDirection = Directions.peek();

    if ((lastDirection === keys.UP && key === keys.DOWN)
        || (lastDirection === keys.DOWN && key === keys.UP)
        || (lastDirection === keys.LEFT && key === keys.RIGHT)
        || (lastDirection === keys.RIGHT && key === keys.LEFT)) {
      return false;
    }
    return true;
  }

  setEvents (): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
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
          document.body.classList.toggle('noclip');
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
            const num = e.keyCode - 48; // to get the pressed number

            if (num === 0) {
              if (this.currentLevel) {
                this.currentLevel.remove();
                this.currentLevel = null;
              }
            } else if (num - 1 in this.levels) {
              if (this.currentLevel) {
                this.currentLevel.remove();
              }
              this.currentLevel = this.levels[num - 1];
              this.currentLevel.render();
            }
          }

          if (e.keyCode in keys && this.notBackwards(e.keyCode)) {
            if (Directions.peek() !== e.keyCode) {
              Directions.set(e.keyCode);
            } else {
              this.keyHeld -= 50;
            }
            e.preventDefault();
          }
      }
    });

    document.addEventListener('keyup', () => {
      this.keyHeld = 0;
    });

    document.addEventListener('click', (e: MouseEvent) => {
      const el = <HTMLElement>e.target;
      if (el.id === 'start') {
        this.start();
      }
    });

    window.addEventListener('resize', Utils.debounce(() => {
      if (this.currentLevel) {
        this.currentLevel.remove();
        this.currentLevel.render();
      }

      if (this.gridVisible) {
        this.removeGrid();
        this.drawGrid();
      }

      if (this.food !== null) {
        this.food.remove();
        this.food = null;
        this.handleFood();
      }
    }, 100));
  }

  removeGrid (): void {
    const grids = document.querySelectorAll('.vertical-grid, .horizontal-grid');
    Array.from(grids).forEach(div => {
      Utils.removeNode(div);
    });

    this.gridVisible = false;
  }

  drawGrid (): void {
    for (let x = 0; x < document.body.clientWidth; x += SIZE) {
      const div = document.createElement('div');
      div.style.top = '0px';
      div.style.left = `${x}px`;
      div.classList.add('vertical-grid');
      document.body.appendChild(div);
    }

    for (let x = 0; x < document.body.clientHeight; x += SIZE) {
      const div = document.createElement('div');
      div.style.left = '0px';
      div.style.top = `${x}px`;
      div.classList.add('horizontal-grid');
      document.body.appendChild(div);
    }

    this.gridVisible = true;
  }
}
