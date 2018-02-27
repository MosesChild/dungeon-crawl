import React from "react";
import Board from "./board";

import environmentVars from "./environmentVars";
import { GameMessage, ScoreBoard, PlayMap } from "./game";

import { randomDirection, getRandomInt, doOdds } from "./firstModule";

const maxHeight = Board.map.maxHeight;
const maxWidth = Board.map.maxWidth;
const debug = true;
// game should be styled to square...

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            direction: "none",
            fade: null,
            player: Board.stuff.player, // level, xp, weapon, speed, attackspeed, frame...
            x: 100,
            y: 100,
            gameMessage: null,
            messagePause: null,
            walls: [],
            rooms: [],
            wallCheck: null,
            enemies: [],
            items: [],
            intervalID: null,
            dark: "true"
        };
        this.checkSpot = this.checkSpot.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.doFrame = this.doFrame.bind(this);
        this.togglePlay = this.togglePlay.bind(this);
        this.toggleDark = this.toggleDark.bind(this);
        this.initializeBoard = this.initializeBoard.bind(this);
    }
    componentWillMount() {
        this.newGame();
    }
    componentDidMount() {
        this.textInput.focus();
        console.log("APP didMount", this.state);
    }

    initializeBoard() {
        //  shows new Board... triggered by boardComplete or newGame
        //to trigger on tap...
        Board.initialize();
        this.setState({
            //    direction: "none",
            walls: Board.map.walls,
            rooms: Board.map.rooms,
            enemies: Board.stuff.enemies,
            items: Board.stuff.mapItems,
            wallCheck: Board.wallCheck
        });
    }

    newGame() {
        //Board init, Game Message, Player init,  board start...
        this.messagePause();
        Board.boardID = 0;
        this.setState({
            gameMessage: "Welcome to the Dungeon!",
            player: { ...Board.stuff.player },
            direction: "none",
            x: 100,
            y: 100
        });
        this.initializeBoard();
        // show.level
    }

    togglePlay(e) {
        if (this.state.intervalID === null) {
            var intervalID = setInterval(
                () => this.doFrame(),
                environmentVars.frameLength
            );
            this.setState({
                intervalID: intervalID,
                gameMessage: ""
            });
        } else {
            clearInterval(this.state.intervalID);
            this.setState({ intervalID: null });
        }
    }
    gameOver() {
        this.setState({ gameMessage: "GAME OVER" });
        this.messagePause();
    }

    messagePause(millis = 3000) {
        this.setState({
            messagePause: setTimeout(
                () => this.setState({ messagePause: null }),
                millis
            )
        });
    }

    boardComplete(player, enemies) {
        this.togglePlay();

        const calculateXP = () => {
            var awardXP = 0; //calculate XP for level...
            enemies.forEach(
                enemy => (awardXP += Board.stuff.awardXP(enemy.name))
            );
            return Math.round(awardXP);
        };

        var checkLevel = xp => {
            var nextLevelXP = Board.stuff.levelData[player.level + 1]["xp"];
            var nextLevelHealth =
                Board.stuff.levelData[player.level + 1]["health"];

            if (player.xp + xp > nextLevelXP) {
                player.level = player.level + 1;
                player.health = nextLevelHealth;
                return true;
            }
            return false;
        };

        const newXP = calculateXP();
        const playerAttainsNewLevel = checkLevel(newXP);
        player.xp += newXP;

        var message = "Board complete, " + newXP + "xp awarded.";

        message += playerAttainsNewLevel
            ? "You have acheived level " + player.level + "!"
            : "";
        console.log("boardComplete...");

        this.setState({
            player: player,
            gameMessage: message
        });
        this.messagePause();
    }
    checkSpot(x, y) {
        // returns wall, items and location of x,y coordinates...
        var wallCheck = this.state.wallCheck;
        if (Array.isArray(x)) {
            y = x[1];
            x = x[0];
        } //works with directionCoordinates array ([x,y])too!
        var wall, enemy, item;
        if (wallCheck["row" + y] > maxHeight - 1 || x > maxWidth) {
            // make sure things can't go out of range!
            return { wall: "wall" };
        }

        try {
            if (wallCheck["row" + y]) {
                wallCheck["row" + y].indexOf(x) > -1
                    ? (wall = "wall")
                    : (wall = "");
            } else {
                wall = "";
            }
        } catch (e) {
            console.log(x, y, e);
        }
        enemy = this.state.enemies.filter(function(e) {
            return e.x === x && e.y === y;
        });
        item = this.state.items.filter(function(e) {
            return e.x === x && e.y === y;
        });
        return { wall: wall, enemy: enemy, item: item[0] };
    }
    directionCoordinates = function(x, y, direction, optionalDistance) {
        if (optionalDistance === undefined) {
            optionalDistance = 1;
        }
        if (direction === "north") {
            y = Math.max(y - optionalDistance, 0);
        } else if (direction === "south") {
            y = Math.min(y + optionalDistance, maxHeight);
        } else if (direction === "west") {
            x = Math.max(x - optionalDistance, 0);
        } else if (direction === "east") {
            x = Math.min(x + optionalDistance, maxWidth);
        } else direction = "none";
        //console.log("directionCoordinate update", x,y)
        return [x, y, direction];
    };    

    toggleDark() {
        var toggle = this.state.dark;
        toggle === "true" ? (toggle = "false") : (toggle = "true");
        this.setState({ dark: toggle });
    }
    onKeyDown(e) {
        var keyCode = e.keyCode,
            command,
            direction;

        if (
            this.state.intervalID !== null &&
            this.state.messagePause === null
        ) {
            keyCode === 40 || keyCode === 98
                ? (direction = "south")
                : keyCode === 38 || keyCode === 104
                    ? (direction = "north")
                    : keyCode === 37 || keyCode === 100
                        ? (direction = "west")
                        : keyCode === 39 || keyCode === 102
                            ? (direction = "east")
                            : keyCode === 80
                                ? (command = "pause") // the "p" key
                                : (direction = "none");

            this.setState({ direction: direction });

            if (command) {
                if (command === "pause") {
                    this.togglePlay();
                }
            }
        } else if (this.state.gameMessage) {
            this.setState({ gameMessage: "" });
        }
    }

    doFrame() {
        // this function triggers all gameplay calculations.
        //...It gets called by this.togglePlay();

        let x = this.state.x,
            y = this.state.y,
            player = this.state.player,
            enemies = this.state.enemies,
            items = this.state.items;

        // calculate player(including updating enemy health);

        var obj = this.calculatePlayer(x, y, player, enemies, items);

        // calculate enemy position, attack and total dead enemies, plus player health...

        var eObj = this.calculateEnemies(obj.x, obj.y, obj.player, obj.enemies);

        if (eObj.player.health < 1) {
            // If player is dead!
            this.gameOver();
        } else {
            // otherwise update state.
            this.setState({
                x: obj.x,
                y: obj.y,
                player: eObj.player,
                enemies: eObj.enemies,
                items: obj.items
            });
        }
    }

    enemyMove(x, y, direction) {
        var here = this.directionCoordinates(x, y, direction);
        var lastCheck = this.checkSpot(here);
        while (lastCheck.wall === "wall" || lastCheck.enemy.length > 0) {
            direction = randomDirection();
            here = this.directionCoordinates(x, y, direction);
            lastCheck = this.checkSpot(here);
        } // return final coordinates to calculateEnemies.
        return { x: here[0], y: here[1], direction: direction };
    }

    calculateEnemies(playerX, playerY, player, enemies) {
        //enemy move and attack calculations.
        var deadEnemies = 0;

        enemies.forEach(enemy => {
            var frame = enemy.frame,
                health = enemy.health;

            if (health < 1) {
                // check for life!
                deadEnemies++;
                if (deadEnemies === enemies.length) {
                    // if all dead enemies, boardComplete!
                    this.boardComplete(player, enemies);
                    return;
                }
            } else {
                frame++;
                const xDistance = playerX - enemy.x;
                const yDistance = playerY - enemy.y;
                const furtherDistance = Math.max(
                    Math.abs(xDistance),
                    Math.abs(yDistance)
                );

                const enemyCanAttack =
                    furtherDistance <= 1 && frame >= enemy.attackSpeed;

                const enemyCanMove = frame >= enemy.speed;

                if (enemyCanAttack) {
                    player.health -= enemy.damage;
                    frame = 0;
                }

                if (enemyCanMove) {
                    const wander = enemy => {
                        // wander, favor current direction;
                        var newDirection = doOdds(
                            4,
                            1,
                            enemy.direction,
                            randomDirection()
                        );
                        return this.enemyMove(enemy.x, enemy.y, newDirection);
                    };

                    const pursuePlayer = enemy => {
                        var directionX, directionY, newDirection;
                        xDistance > 0
                            ? (directionX = "east")
                            : (directionX = "west");
                        yDistance > 0
                            ? (directionY = "south")
                            : (directionY = "north");
                        if (xDistance === 0) {
                            directionX = directionY;
                        } // close in...
                        if (yDistance === 0) {
                            directionY = directionX;
                        }
                        newDirection = [directionX, directionY][
                            getRandomInt(0, 1)
                        ];
                        return this.enemyMove(enemy.x, enemy.y, newDirection);
                    };

                    const enemyIsAwareOfPlayer =
                        enemy.awareness >= furtherDistance;

                    var move = enemyIsAwareOfPlayer
                        ? pursuePlayer(enemy)
                        : wander(enemy);
                    frame = 0;
                    enemy.direction = move.direction;
                    enemy.x = move.x;
                    enemy.y = move.y;
                }
            }
            enemy.frame = frame;
        });
        return { enemies: enemies, player: player };
    };

    calculatePlayer(x, y, player, enemies, items) {
        var playerDamage = Board.stuff.weapons[player.weapon];
        var direction = this.state.direction;
        var attack = function(enemy) {
            enemy.health -= playerDamage;
            console.log("Enemy hit!, new health", enemy.health, player.health);
            return enemy;
        };

        var getItem = function(item) {
            x = ahead[0];
            y = ahead[1];
            if (item.type === "awareness") {
                player.awareness += item.value;
            }
            if (item.type === "weapon") {
                player.weapon = item.value;
            }
            if (item.type === "health") {
                //consume it only (if needed.)
                var maxHealth = Board.stuff.levelData[player.level]["health"];
                if (player.health === maxHealth) {
                    return items;
                } else {
                    player.health = Math.min(
                        maxHealth,
                        player.health + item.value
                    );
                }
            }
            // all other cases remove item and update items...
            items = items.filter(e => e.id !== item.id);
            console.log("item removed", item.id, "items remain,", items);
            return items;
        };

        // start!
        player.frame++;
        if (player.frame >= player.speed && direction !== "none") {
            //only attack(or move) if moving...
            var ahead = this.directionCoordinates(x, y, direction);
            var checkAhead = this.checkSpot(ahead);

            // console.log(ahead, checkAhead, x, y, direction,player.frame);

            if (checkAhead.item !== undefined) {
                // encounter object
                console.log("encounterItem");
                items = getItem(checkAhead.item); // returns updated items
            } else if (checkAhead.enemy.length === 1) {
                // if hit enemy...
                attack(checkAhead.enemy[0]);
                //console.log("encounter Enemy",  checkAhead.enemy[0].id, enemies);
            } else if (checkAhead.wall !== "wall") {
                // if not a wall
                x = ahead[0];
                y = ahead[1];
            }

            ahead = this.directionCoordinates(x, y, direction); //2nd attack check after move!
            checkAhead = this.checkSpot(ahead);
            if (checkAhead.enemy.length === 1) {
                attack(checkAhead.enemy[0]);
            }
            player.frame = 0;
        }
        //   console.log("Player Calculated", x,y,direction,player,enemies)
        return {
            x: x,
            y: y,
            direction: direction,
            player: player,
            enemies: enemies,
            items: items
        };
    }

    render() {
        console.log("Environment", environmentVars);
        return (
            <div
                id="game"
                tabIndex={1}
                ref={input => {
                    this.textInput = input;
                }}
                onKeyDown={this.onKeyDown}
                style={{ width: environmentVars.smallerSize }}
            >
                <GameMessage text={this.state.gameMessage} />

                <ScoreBoard
                    xp={this.state.player.xp}
                    level={this.state.player.level}
                    health={this.state.player.health}
                    weapon={this.state.player.weapon}
                    style={{ width: environmentVars.smallerSize }}
                />

                <PlayMap
                    fade={this.state.fade}
                    enemies={this.state.enemies}
                    items={this.state.items}
                    walls={this.state.walls}
                    dark={this.state.dark}
                    playerXY={[this.state.x, this.state.y]}
                    rooms={this.state.rooms}
                    direction={this.state.direction}
                    awareness={this.state.player.awareness}
                    style={{
                        width: environmentVars.maxWidth,
                        height: environmentVars.maxHeight
                    }}
                />
                <input
                    type="button"
                    value="toggle Darkness"
                    onClick={this.toggleDark}
                />
            </div>
        );
    }
}
