// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"constants.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var keys;

(function (keys) {
  keys[keys["RETURN"] = 13] = "RETURN";
  keys[keys["SPACE"] = 32] = "SPACE";
  keys[keys["LEFT"] = 37] = "LEFT";
  keys[keys["UP"] = 38] = "UP";
  keys[keys["RIGHT"] = 39] = "RIGHT";
  keys[keys["DOWN"] = 40] = "DOWN";
  keys[keys["C"] = 67] = "C";
  keys[keys["G"] = 71] = "G";
  keys[keys["J"] = 74] = "J";
  keys[keys["K"] = 75] = "K";
})(keys = exports.keys || (exports.keys = {}));

exports.SIZE = 20;
exports.MARGIN = 60;
exports.SLOWEST = 250;
exports.FASTEST = 0;
},{}],"Utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = require("./constants");

var Utils;

(function (Utils) {
  Utils.rand = function (min, max, reduce) {
    if (reduce === void 0) {
      reduce = constants_1.SIZE;
    }

    var num = Math.floor(Math.random() * (max - min)) + min;
    return num - num % reduce;
  };

  Utils.snap = function (num, point) {
    if (point === void 0) {
      point = constants_1.SIZE;
    }

    var bottom = num - num % point;
    var top = bottom + point;
    return num - bottom <= top - num ? bottom : top;
  };

  Utils.removeNode = function (el) {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  };

  Utils.bound = function (num, min, max) {
    return Math.max(Math.min(num, max), min);
  };

  Utils.debounce = function (fun, wait) {
    var id;
    return function () {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      clearTimeout(id);
      id = setTimeout(function () {
        return fun.apply(void 0, args);
      }, wait);
    };
  };
})(Utils || (Utils = {}));

exports.default = Utils;
},{"./constants":"constants.ts"}],"Locations.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Locations;

(function (Locations) {
  var data = {};

  Locations.set = function (x, y) {
    data[x + ":" + y] = true;
  };

  Locations.remove = function (x, y) {
    delete data[x + ":" + y];
  };

  Locations.has = function (x, y) {
    return data[x + ":" + y] === true;
  };

  Locations.get = function () {
    return data;
  };
})(Locations || (Locations = {}));

exports.default = Locations;
},{}],"Piece.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = require("./constants");

var Utils_1 = __importDefault(require("./Utils"));

var Locations_1 = __importDefault(require("./Locations"));

var Piece =
/** @class */
function () {
  function Piece(_a) {
    var x = _a.x,
        y = _a.y,
        _b = _a.type,
        type = _b === void 0 ? 'body' : _b,
        _c = _a.direction,
        direction = _c === void 0 ? 'RIGHT' : _c,
        _d = _a.next,
        next = _d === void 0 ? null : _d,
        _e = _a.prev,
        prev = _e === void 0 ? null : _e;
    this.direction = direction;
    this.type = type;
    this.x = x;
    this.y = y;
    this.el = document.createElement('div');
    this.next = next;
    this.prev = prev; // Enable for a neat effect
    // this.el.innerHTML = "&#10096;";

    this.setType(type);
    this.setPos(this.x, this.y); // this.applyClass();

    document.body.appendChild(this.el);
  }

  Piece.prototype.bend = function (headDirection) {
    if (this.direction !== headDirection) {
      this.el.className = '';
      this.el.classList.add('cell', this.type, headDirection, headDirection + "-" + this.direction);
      this.direction = headDirection;
    }
  };

  Piece.prototype.setPos = function (x, y) {
    // CSS move the element
    this.el.style.top = y + "px";
    this.el.style.left = x + "px"; // this.el.style.transform = `translate(${x}px, ${y}px)`;
    // reset CSS classnames basically

    this.applyClass(); // Save the location of this piece to occupied spaces
    // But don't do this, if we are the food or head because;
    // - Head cannot collide with itself
    // - We want to collide with food :)

    if (this.type !== 'head' && this.type !== 'food') {
      Locations_1.default.set(x, y);
    }
  };

  Piece.prototype.move = function (x, y, direction) {
    if (direction === void 0) {
      direction = 'RIGHT';
    }

    var X = x;
    var Y = y; // Transition through walls

    if (x < 0) {
      X = Utils_1.default.snap(document.body.clientWidth) - constants_1.SIZE;
    } else if (y < 0) {
      Y = Utils_1.default.snap(document.body.clientHeight) - constants_1.SIZE;
    } else if (x >= Utils_1.default.snap(document.body.clientWidth)) {
      X = 0;
    } else if (y >= Utils_1.default.snap(document.body.clientHeight)) {
      Y = 0;
    } // Save the old direction


    var tDirection = this.direction; // Set new direction of the piece

    this.direction = direction; // Move HTML Element to new spot

    this.setPos(X, Y); // If there is a next piece move it to old position

    if (this.next !== null) {
      // If this piece is a head piece, immediate piece should receive heads current
      // direction instead of old one this is needed to have a fluid motion
      this.next.move(this.x, this.y, this.type === 'head' ? this.direction : tDirection);
    } else {
      // We are the last piece, previous position
      // is now empty, clear it
      Locations_1.default.remove(this.x, this.y);
    } // if I"m part of body and no one is following me
    // then I must be the tail


    if (this.next === null && this.type === 'body') {
      this.el.classList.add('tail');
    } // if me and the piece following me are at the same spot
    // then piece following me must be the food we just swallowed


    if (this.next !== null && this.next.x === X && this.next.y === Y) {
      this.next.el.classList.add('gulp');
    } // Bendy corners


    if (this.next !== null && this.direction !== this.next.direction) {
      this.el.classList.add(this.direction + "-" + this.next.direction);
    } // store new values


    this.x = X;
    this.y = Y;
  };

  Piece.prototype.setType = function (type) {
    this.type = type;
    this.applyClass();
  };

  Piece.prototype.applyClass = function () {
    this.el.className = '';
    this.el.classList.add('cell', this.type, this.direction);
  };

  Piece.prototype.remove = function () {
    // Remove the piece, it"s location and HTML element
    // This is needed to free up memory
    Utils_1.default.removeNode(this.el);
    Locations_1.default.remove(this.x, this.y); // Do the same for all linked pieces

    if (this.next) {
      this.next.remove();
      this.next = null;
    }
  };

  return Piece;
}();

exports.default = Piece;
},{"./constants":"constants.ts","./Utils":"Utils.ts","./Locations":"Locations.ts"}],"Directions.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = require("./constants");

var Directions;

(function (Directions) {
  var queue = [];
  var current = constants_1.keys.RIGHT;

  Directions.set = function (key) {
    queue.push(key);
  };

  Directions.get = function () {
    return current;
  };

  Directions.pop = function () {
    if (queue.length > 0) {
      current = queue.shift();
    }

    return Directions.get();
  };

  Directions.flush = function () {
    queue = [];
    current = constants_1.keys.RIGHT;
  };

  Directions.peek = function () {
    return queue.length > 0 ? queue[queue.length - 1] : current;
  };
})(Directions || (Directions = {}));

exports.default = Directions;
},{"./constants":"constants.ts"}],"Game.ts":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = require("./constants");

var Piece_1 = __importDefault(require("./Piece"));

var Utils_1 = __importDefault(require("./Utils"));

var Locations_1 = __importDefault(require("./Locations"));

var Directions_1 = __importDefault(require("./Directions")); // window.Locations = Locations;


var Game =
/** @class */
function () {
  function Game(levels) {
    this.levels = levels;
    this.food = null;
    this.length = 0;
    this.highScore = 0;
    this.score = 0;
    this.currentLevel = null;
    this.moving = false;
    this.paused = false;
    this.gridVisible = false;
    this.debugSpeed = 0;
    this.keyHeld = 0;
    this.noClip = false;
    this.head = new Piece_1.default({
      x: 80,
      y: 80,
      type: 'head'
    });
    this.tail = this.resetHead();
    this.handleFood();
    this.setEvents(); // this.tail = this.head.next.next;
  }

  Game.prototype.getRandomLevel = function () {
    return this.levels[Math.floor(Math.random() * this.levels.length)];
  }; // Remove the old chain, put HEAD in the starting position


  Game.prototype.resetHead = function () {
    if (this.head.next) {
      this.head.next.remove();
      this.head.next = null;
    }

    var LENGTH = 10;
    var x = constants_1.SIZE * LENGTH + constants_1.SIZE;
    var y = constants_1.SIZE * 5;
    var curr = this.head;
    this.head.move(x, y);

    for (var i = 1; i <= LENGTH; i += 1) {
      curr.next = new Piece_1.default({
        x: x - constants_1.SIZE * i + 2,
        y: y,
        prev: curr
      });
      curr = curr.next;
    }

    curr.setType('tail');
    return curr;
  };
  /**
   * Reset all values and restart the game
   */


  Game.prototype.start = function () {
    // Don"t restart already running game
    if (this.moving === false) {
      this.tail = this.resetHead();
      this.length = 0;
      this.debugSpeed = 0;
      this.keyHeld = 0;
      this.score = 0;
      Directions_1.default.flush();
      this.showScore();
      this.moving = true;
      requestAnimationFrame(this.frame.bind(this));
    }
  };
  /**
     * GAME OVER
     */


  Game.prototype.over = function () {
    this.moving = false;
    var el = document.querySelector('.score');
    el.innerHTML = "\n      Game over! Score: " + this.length * 1000 + ".\n      <button id=\"start\">Click here to try again.</button>\n    ";
  };
  /**
     * Get a random empty location for food
     */


  Game.prototype.getFoodLocation = function () {
    var _a;

    var x = Utils_1.default.rand(constants_1.MARGIN, document.body.clientWidth - constants_1.MARGIN, constants_1.SIZE);
    var y = Utils_1.default.rand(constants_1.MARGIN, document.body.clientHeight - constants_1.MARGIN, constants_1.SIZE); // If random spot is already filled, pick a new one
    // Pick until you find an empty spot
    // ..... nothing can go wrong with this

    if (Locations_1.default.has(x, y)) {
      _a = this.getFoodLocation(), x = _a[0], y = _a[1];
    }

    return [x, y];
  };

  Game.prototype.handleFood = function () {
    // If the there is no food, create a random one.
    if (this.food == null) {
      var _a = this.getFoodLocation(),
          foodX = _a[0],
          foodY = _a[1];

      this.food = new Piece_1.default({
        x: foodX,
        y: foodY,
        type: 'food'
      });
    } // if head and food collided, replace head with the food
    // set the correct type for each piece


    if (this.head.x === this.food.x && this.head.y === this.food.y) {
      // this.food.next = this.head; // put food at the top of the chain
      // this.food.direction = this.head.direction; // Needs to go to same direction where head was going
      // this.head.setType('body'); // head is not body
      // this.food.setType('head'); // food is now head
      // this.head = this.food; // Update the Game instance with new head
      // (this.head.next as Piece).prev = this.head;
      this.swallowFood(); // Do not count baits grabbed while
      // in no clip mode

      if (this.noClip === false) {
        this.length += 1; // Snake got bigger
      }

      this.updateScore(); // Calculate the new score

      this.showScore(); // Update the score
    }
  };

  Game.prototype.swallowFood = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _swallow;

      var _this = this;

      return __generator(this, function (_a) {
        if (this.food == null) {
          return [2
          /*return*/
          ];
        } // this.food.remove();


        this.tail.next = this.food;
        this.tail.setType('body');
        this.food.prev = this.tail;
        this.tail = this.food;
        this.food.setType('tail');
        this.food = null; // food is gone now

        _swallow = function swallow(node) {
          if (node.next !== null) {
            if (node.prev !== null) {
              node.prev.el.classList.remove('gulp');
            }

            node.el.classList.add('gulp');

            if (_this.paused || !_this.moving) {
              return;
            } // if paused, stop animation


            setTimeout(function () {
              requestAnimationFrame(function () {
                _swallow(node.next);
              });
            }, _this.getSpeed() / 2);
          }
        };

        _swallow(this.head.next);

        return [2
        /*return*/
        ];
      });
    });
  };

  Game.prototype.getSpeed = function () {
    var initialSpeed = 130;
    var calculated = initialSpeed - this.length * 0.5 + this.debugSpeed + this.keyHeld;
    return Utils_1.default.bound(calculated, constants_1.FASTEST, constants_1.SLOWEST);
  };

  Game.prototype.updateScore = function () {
    if (this.noClip === true) {
      return this.score;
    }

    var level = 500;
    var speed = this.getSpeed();
    var val = (constants_1.SLOWEST - speed) * this.length;
    var leveled = Utils_1.default.snap(val, level); // You should not get zero points

    if (leveled < level) {
      leveled = level;
    }

    this.score += leveled;
    return this.score;
  };

  Game.prototype.showScore = function () {
    var el = document.querySelector('.score');
    this.highScore = this.highScore < this.score ? this.score : this.highScore;
    el.innerHTML = "\n            Score: " + this.score + ", High Score: " + this.highScore + "\n        ";
  };

  Game.prototype.frame = function () {
    var _a;

    var _this = this;

    if (this.moving) {
      setTimeout(function () {
        requestAnimationFrame(_this.frame.bind(_this));
      }, this.getSpeed()); // higher the score, faster the snake
    }

    if (this.paused) {
      return; // just pause
    } // If head hits an occupied space, GAME OVER


    if (Locations_1.default.has(this.head.x, this.head.y) && this.noClip === false) {
      return this.over();
    } // If Game is not over, then move the snake to requested direction


    var direction = Directions_1.default.pop(); // Remove tracking for tails location.

    Locations_1.default.remove(this.tail.x, this.tail.y); // Record the last location of previous head

    Locations_1.default.set(this.head.x, this.head.y); // Turn tail into HEAD and move it to where head is supposed to go.

    this.tail.setType('head');

    switch (direction) {
      case constants_1.keys.RIGHT:
        this.tail.move(this.head.x + constants_1.SIZE, this.head.y, constants_1.keys[direction]);
        break;

      case constants_1.keys.LEFT:
        this.tail.move(this.head.x - constants_1.SIZE, this.head.y, constants_1.keys[direction]);
        break;

      case constants_1.keys.DOWN:
        this.tail.move(this.head.x, this.head.y + constants_1.SIZE, constants_1.keys[direction]);
        break;

      case constants_1.keys.UP:
        this.tail.move(this.head.x, this.head.y - constants_1.SIZE, constants_1.keys[direction]);
        break;

      default:
    }

    var prevHead = this.head; // Turn the piece before the tail into new tail.

    _a = [this.tail, this.tail.prev], this.head = _a[0], this.tail = _a[1];
    this.tail.next = null; // nothing after the tail.

    this.tail.setType('tail'); // turn previous head into body piece

    prevHead.setType('body');
    prevHead.prev = this.head; // if head changed direction, bend this piece accordingly.

    prevHead.bend(this.head.direction);
    this.head.prev = null; // nothing before the head

    this.head.next = prevHead; // previous head follows new head

    this.head.setType('head'); // it is head.
    // Check if we caught caught the food
    // or we need to place a new food

    this.handleFood();
  };
  /**
   * Don"t let snake to go backwards
   */
  // eslint-disable-next-line class-methods-use-this


  Game.prototype.notBackwards = function (key) {
    var lastDirection = Directions_1.default.peek();

    if (lastDirection === constants_1.keys.UP && key === constants_1.keys.DOWN || lastDirection === constants_1.keys.DOWN && key === constants_1.keys.UP || lastDirection === constants_1.keys.LEFT && key === constants_1.keys.RIGHT || lastDirection === constants_1.keys.RIGHT && key === constants_1.keys.LEFT) {
      return false;
    }

    return true;
  };

  Game.prototype.setEvents = function () {
    var _this = this;

    document.addEventListener('keydown', function (e) {
      switch (e.keyCode) {
        // Toggle Grid
        case constants_1.keys.G:
          if (_this.gridVisible) {
            _this.removeGrid();
          } else {
            _this.drawGrid();
          }

          break;
        // Enable No Clip mode.

        case constants_1.keys.C:
          _this.noClip = !_this.noClip;
          document.body.classList.toggle('noclip');
          break;
        // Slowdown the snake

        case constants_1.keys.J:
          _this.debugSpeed += 10;
          break;
        // Speed up the snake

        case constants_1.keys.K:
          _this.debugSpeed -= 10;
          break;
        // Pause or restart the game

        case constants_1.keys.SPACE:
          if (_this.moving) {
            _this.paused = !_this.paused;
          } else {
            _this.start();
          }

          e.preventDefault();
          break;
        // Restart the game

        case constants_1.keys.RETURN:
          _this.start();

          break;
        // Arrow keys or nothing

        default:
          // Select levels
          // 0 = remove level
          // 1-9 = render level if exists
          if (e.keyCode >= 48 && e.keyCode <= 57) {
            var num = e.keyCode - 48; // to get the pressed number

            if (num === 0) {
              if (_this.currentLevel) {
                _this.currentLevel.remove();

                _this.currentLevel = null;
              }
            } else if (num - 1 in _this.levels) {
              if (_this.currentLevel) {
                _this.currentLevel.remove();
              }

              _this.currentLevel = _this.levels[num - 1];

              _this.currentLevel.render();
            }
          }

          if (e.keyCode in constants_1.keys && _this.notBackwards(e.keyCode)) {
            if (Directions_1.default.peek() !== e.keyCode) {
              Directions_1.default.set(e.keyCode);
            } else {
              _this.keyHeld -= 50;
            }

            e.preventDefault();
          }

      }
    });
    document.addEventListener('keyup', function () {
      _this.keyHeld = 0;
    });
    document.addEventListener('click', function (e) {
      var el = e.target;

      if (el.id === 'start') {
        _this.start();
      }
    });
    window.addEventListener('resize', Utils_1.default.debounce(function () {
      if (_this.currentLevel) {
        _this.currentLevel.remove();

        _this.currentLevel.render();
      }

      if (_this.gridVisible) {
        _this.removeGrid();

        _this.drawGrid();
      }

      if (_this.food !== null) {
        _this.food.remove();

        _this.food = null;

        _this.handleFood();
      }
    }, 100));
  };

  Game.prototype.removeGrid = function () {
    var grids = document.querySelectorAll('.vertical-grid, .horizontal-grid');
    Array.from(grids).forEach(function (div) {
      Utils_1.default.removeNode(div);
    });
    this.gridVisible = false;
  };

  Game.prototype.drawGrid = function () {
    for (var x = 0; x < document.body.clientWidth; x += constants_1.SIZE) {
      var div = document.createElement('div');
      div.style.top = '0px';
      div.style.left = x + "px";
      div.classList.add('vertical-grid');
      document.body.appendChild(div);
    }

    for (var x = 0; x < document.body.clientHeight; x += constants_1.SIZE) {
      var div = document.createElement('div');
      div.style.left = '0px';
      div.style.top = x + "px";
      div.classList.add('horizontal-grid');
      document.body.appendChild(div);
    }

    this.gridVisible = true;
  };

  return Game;
}();

exports.default = Game;
},{"./constants":"constants.ts","./Piece":"Piece.ts","./Utils":"Utils.ts","./Locations":"Locations.ts","./Directions":"Directions.ts"}],"Level.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Piece_1 = __importDefault(require("./Piece"));

var constants_1 = require("./constants");

var Level =
/** @class */
function () {
  function Level(generatorFunction) {
    this.generatorFunction = generatorFunction;
    this.pieces = [];
    this.generatorFunction = generatorFunction;
  } // eslint-disable-next-line class-methods-use-this


  Level.prototype.translate = function (x, y) {
    return [Math.floor(x) * constants_1.SIZE, Math.floor(y) * constants_1.SIZE];
  };

  Level.prototype.remove = function () {
    this.pieces.forEach(function (piece) {
      piece.remove();
    });
  };

  Level.prototype.line = function (x0, y0, x1, y1) {
    var dx = Math.abs(x1 - x0);
    var dy = Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1;
    var sy = y0 < y1 ? 1 : -1;
    var err = dx - dy; // eslint-disable-next-line no-constant-condition

    while (true) {
      // Waiting for proposal
      // https://github.com/Microsoft/TypeScript/issues/5296
      // this.pieces.push(new Piece(...this.translate(x0, y0), "wall"));
      var _a = this.translate(x0, y0),
          tx0 = _a[0],
          ty0 = _a[1];

      this.pieces.push(new Piece_1.default({
        x: tx0,
        y: ty0,
        type: 'wall'
      })); // break when line is done

      if (Math.abs(x0 - x1) <= 0.5 && Math.abs(y0 - y1) <= 0.5) break;
      var e2 = 2 * err;

      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }

      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  };

  Level.prototype.render = function () {
    var _this = this;

    var cols = Math.floor(document.body.clientHeight / constants_1.SIZE);
    var rows = Math.floor(document.body.clientWidth / constants_1.SIZE);
    var level = this.generatorFunction(rows, cols);
    level.forEach(function (line) {
      var _a = line[0],
          x0 = _a[0],
          y0 = _a[1];
      var _b = line[1],
          x1 = _b[0],
          y1 = _b[1];

      _this.line(x0, y0, x1, y1);
    });
  };

  return Level;
}();

exports.default = Level;
},{"./Piece":"Piece.ts","./constants":"constants.ts"}],"levels/level-1.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Level_1 = __importDefault(require("../Level"));

exports.default = new Level_1.default(function (rows, cols) {
  var _a = [cols / 2, rows / 2],
      halfCols = _a[0],
      halfRows = _a[1];
  return [// top walls
  [[3, 3], [halfRows - 3, 3]], [[halfRows + 3, 3], [rows - 3, 3]], // right walls
  [[rows - 3, 3], [rows - 3, halfCols - 3]], [[rows - 3, halfCols + 3], [rows - 3, cols - 3]], // bottom walls
  [[rows - 3, cols - 3], [halfRows + 3, cols - 3]], [[halfRows - 3, cols - 3], [3, cols - 3]], // Left walls
  [[3, cols - 3], [3, halfCols + 3]], [[3, halfCols - 3], [3, 3]]];
});
},{"../Level":"Level.ts"}],"levels/level-2.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Level_1 = __importDefault(require("../Level"));

exports.default = new Level_1.default(function (rows, cols) {
  var _a = [rows / 2, cols / 2],
      halfRows = _a[0],
      halfCols = _a[1];
  return [[[halfRows - 2, halfCols], [halfRows + 2, halfCols]], [[halfRows, halfCols - 2], [halfRows, halfCols + 2]], [[halfRows - 8, halfCols - 8], [halfRows - 3, halfCols - 3]], [[halfRows + 3, halfCols + 3], [halfRows + 8, halfCols + 8]], [[halfRows + 8, halfCols - 8], [halfRows + 3, halfCols - 3]], [[halfRows - 3, halfCols + 3], [halfRows - 8, halfCols + 8]]];
});
},{"../Level":"Level.ts"}],"levels/level-3.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Level_1 = __importDefault(require("../Level"));

exports.default = new Level_1.default(function (rows, cols) {
  var _a = [rows / 2, cols / 2],
      halfRows = _a[0],
      halfCols = _a[1];
  return [// top walls
  [[3, 3], [halfRows - 3, 3]], [[halfRows + 3, 3], [rows - 3, 3]], // right walls
  [[rows - 3, 3], [rows - 3, halfCols - 3]], [[rows - 3, halfCols + 3], [rows - 3, cols - 3]], // bottom walls
  [[rows - 3, cols - 3], [halfRows + 3, cols - 3]], [[halfRows - 3, cols - 3], [3, cols - 3]], // Left walls
  [[3, cols - 3], [3, halfCols + 3]], [[3, halfCols - 3], [3, 3]], // inner walls
  // top walls
  [[9, 9], [halfRows - 6, 9]], [[halfRows + 6, 9], [rows - 9, 9]], // right walls
  [[rows - 9, 9], [rows - 9, halfCols - 6]], [[rows - 9, halfCols + 6], [rows - 9, cols - 9]], // bottom walls
  [[rows - 9, cols - 9], [halfRows + 6, cols - 9]], [[halfRows - 6, cols - 9], [9, cols - 9]], // Left walls
  [[9, cols - 9], [9, halfCols + 6]], [[9, halfCols - 6], [9, 9]]];
});
},{"../Level":"Level.ts"}],"levels/level-4.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Level_1 = __importDefault(require("../Level"));

exports.default = new Level_1.default(function (rows, cols) {
  // const [halfRows, halfCols] = [rows / 2, cols / 2];
  return [[[3, 3], [rows - 3, cols - 3]], [[rows - 3, 3], [3, cols - 3]]];
});
},{"../Level":"Level.ts"}],"index.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Game_1 = __importDefault(require("./Game"));

var level_1_1 = __importDefault(require("./levels/level-1"));

var level_2_1 = __importDefault(require("./levels/level-2"));

var level_3_1 = __importDefault(require("./levels/level-3"));

var level_4_1 = __importDefault(require("./levels/level-4"));

exports.default = new Game_1.default([level_1_1.default, level_2_1.default, level_3_1.default, level_4_1.default]);
},{"./Game":"Game.ts","./levels/level-1":"levels/level-1.ts","./levels/level-2":"levels/level-2.ts","./levels/level-3":"levels/level-3.ts","./levels/level-4":"levels/level-4.ts"}],"../node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51277" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/src.77de5100.js.map