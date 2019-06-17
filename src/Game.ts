import { SIZE, MARGIN, SLOWEST, FASTEST, LENGTH, keys } from './constants';
import Piece from './Piece';
import Utils from './Utils';
import Level from './Level';
import Locations from './Locations';
import Directions from './Directions';

export default class Game {
  head: Piece;

  tail: Piece;

  food: Piece | null = null;

  goldenApple: Piece | null = null;

  length: number = 0;

  growth: number = 0;

  score: number = 0;

  currentLevel: Level | null = null;

  garden: HTMLDivElement;

  private moving: boolean = false;

  private paused: boolean = false;

  private gridVisible: boolean = false;

  private debugSpeed: number = 0;

  private keyHeld: number = 0;

  private noClip: boolean = false;

  constructor (private levels: Level[]) {
    this.head = new Piece({ x: 80, y: 80, type: 'head' });
    this.tail = this.resetHead();
    this.garden = document.getElementById('garden') as HTMLDivElement;
    this.renderGarden();
    this.handleFood();
    this.setEvents();
  }

  get highScore (): number {
    return parseInt(localStorage.getItem('high-score') || '0', 10) || 0;
  }

  set highScore (value: number) {
    localStorage.setItem('high-score', value.toString());
  }

  renderGarden () {
    const { clientHeight, clientWidth } = document.body;
    const TOP = Math.max(60, Math.floor(clientHeight * 0.10));
    const LEFT = Math.max(60, Math.floor(clientWidth * 0.10));
    let WIDTH = clientWidth - LEFT * 2;
    let HEIGHT = clientHeight - TOP * 2;

    // TOP += SIZE - (TOP % SIZE);
    // LEFT += SIZE - (LEFT % SIZE);
    WIDTH += SIZE - (WIDTH % SIZE);
    HEIGHT += SIZE - (HEIGHT % SIZE);

    this.garden.style.top = `${TOP}px`;
    this.garden.style.left = `${LEFT}px`;
    // this.garden.style.bottom = `${TOP}px`;
    // this.garden.style.right = `${LEFT}px`;
    this.garden.style.width = `${WIDTH}px`;
    this.garden.style.height = `${HEIGHT}px`;


    document.documentElement.style
      .setProperty('--size', `${SIZE}px`);

    this.showTopScore();
    this.showScore();
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

    const x = (SIZE * LENGTH) + SIZE;
    const y = SIZE * 5;
    this.length = LENGTH;
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
      this.debugSpeed = 0;
      this.keyHeld = 0;
      this.score = 0;
      Directions.flush();

      this.showScore();
      this.moving = true;
      this.splashToggle(false);
      requestAnimationFrame(this.frame.bind(this));
    }
  }

  /**
   * GAME OVER
   */
  over (): void {
    this.moving = false;
    // const { score } = this;

    const die = (node: Piece | null) => {
      if (node === null) return;
      node.el.classList.add('vanish');
      setTimeout(() => die(node.prev), 20);
    };

    die(this.tail);
    this.showTopScore();
    this.splashToggle(true);
  }

  showTopScore () {
    const top = document.getElementById('top') as HTMLDivElement;
    this.highScore = this.highScore < this.score ? this.score : this.highScore;
    top.innerHTML = `TOP: ${this.highScore}`;
  }

  // eslint-disable-next-line class-methods-use-this
  splashToggle (show: boolean) {
    const splash = document.querySelector('.splash') as HTMLElement;
    splash.style.display = show ? '' : 'none';
  }

  /**
   * Get a random empty location for food
   */
  getFoodLocation (): number[] {
    let x = Utils.rand(MARGIN, this.garden.clientWidth - MARGIN, SIZE);
    let y = Utils.rand(MARGIN, this.garden.clientHeight - MARGIN, SIZE);

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
    if (this.head.isCollidingWith(this.food) || this.head.isCollidingWith(this.goldenApple)) {
      const type = this.head.isCollidingWith(this.food) ? 'food' : 'golden';

      this.swallowFood(type);

      // Do not count baits grabbed while
      // in no clip mode
      if (this.noClip === false) {
        this.growth += 1; // Snake got bigger
      }

      this.updateScore(type === 'food' ? 10 : 50); // Calculate the new score
      this.showScore(); // Update the score
    }
  }

  // eslint-disable-next-line class-methods-use-this
  mayIHaveGoldenApple () {
    const chance = 5;
    const pick = Math.random() * 100;
    return pick < chance;
  }

  handleGoldenApple () {
    if (this.goldenApple === null) {
      const [foodX, foodY] = this.getFoodLocation();
      this.goldenApple = new Piece({ x: foodX, y: foodY, type: 'golden' });
    }
  }

  async swallowFood (type: string) {
    if (type === 'food') {
      if (this.food == null) { return; }
      this.tail.next = this.food;
      this.food.prev = this.tail;
      this.tail = this.food;
      this.food = null;
    } else if (type === 'golden') {
      if (this.goldenApple == null) { return; }
      this.tail.next = this.goldenApple;
      this.goldenApple.prev = this.tail;
      this.tail = this.goldenApple;
      this.goldenApple = null;
    }

    const swallow = (node: Piece) => {
      if (node === null) return;
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
    if (this.mayIHaveGoldenApple()) {
      this.handleGoldenApple();
    }
  }

  getSpeed (): number {
    const initialSpeed = 200;
    const calculated = (initialSpeed - this.growth * 0.5) + this.debugSpeed + this.keyHeld;

    return Utils.bound(calculated, FASTEST, SLOWEST);
  }

  updateScore (won: number): number {
    if (this.noClip === true) {
      return this.score;
    }

    this.score += won;

    return this.score;
  }

  showScore (): void {
    const points = document.getElementById('points') as HTMLDivElement;

    // Speed: ${Math.floor(1000 / this.getSpeed())}bps
    points.innerHTML = `${this.score}`;
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
    Locations.set(prevHead.x, prevHead.y); // when food is eaten, there is a gap in the locations.
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
          this.garden.classList.toggle('noclip');
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
              // this.keyHeld -= 50;
            }
            e.preventDefault();
          }
      }
    });

    document.addEventListener('keyup', () => {
      this.keyHeld = 0;
    });

    document.addEventListener('click', (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.id === 'start') {
        this.start();
      }
    });

    window.addEventListener('resize', Utils.debounce(() => {
      this.renderGarden();

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

      if (this.goldenApple !== null) {
        this.goldenApple.remove();
        this.goldenApple = null;
        this.handleGoldenApple();
      }
    }, 100));
  }

  removeGrid (): void {
    const grids = document.querySelectorAll('.vertical-grid, .horizontal-grid');
    Array.from(grids).forEach(Utils.removeNode);

    this.gridVisible = false;
  }

  drawGrid (): void {
    for (let x = 0; x < this.garden.clientWidth; x += SIZE) {
      const div = document.createElement('div');
      div.style.top = '0px';
      div.style.left = `${x}px`;
      div.classList.add('vertical-grid');
      this.garden.appendChild(div);
    }

    for (let x = 0; x < this.garden.clientHeight; x += SIZE) {
      const div = document.createElement('div');
      div.style.left = '0px';
      div.style.top = `${x}px`;
      div.classList.add('horizontal-grid');
      this.garden.appendChild(div);
    }

    this.gridVisible = true;
  }

  drawHitboxes () {
    document.querySelectorAll('.hitbox').forEach(Utils.removeNode);

    Locations.getAll().forEach((a, k) => {
      const [x, y] = k.split(':');
      const hitbox = document.createElement('div');
      hitbox.classList.add('hitbox');
      hitbox.style.top = `${y}px`;
      hitbox.style.left = `${x}px`;
      this.garden.append(hitbox);
    });
  }
}
