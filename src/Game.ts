import {SIZE, MARGIN, SLOWEST, FASTEST, keys} from "./constants";
import Piece from "./Piece";
import Utils from "./Utils";
import Level from "./Level";
import Locations from "./Locations";
import Directions from "./Directions";

export default class Game {
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
                        let num = e.keyCode - 48; // to get the pressed number

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
                        Directions.set(e.keyCode);
                        e.preventDefault();
                    }
            }
        });

        document.addEventListener("click", (e: MouseEvent) => {
            let el = <HTMLElement>e.target;
            if (el.id === "start") {
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
        });
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
