/*jshint esversion: 6 */
import {
    getRandomInt,
    randomDirection,
    joinArrays,
    // arraySubtract,
    doOdds
    //  doIt
} from "./firstModule";

var Board = {
    // all the functions  (ReactApp) Dungeon-Crawl requires to build State arrays for a map with creatures and items.
    wallCheck: {}, // object stores wall coordinates by row...
    Level: 0, // counter to generate ID's Boards.
    //var player1=new Board.stuff.MakePlayer();

    reset: function() {
        this.wallCheck = {};
        Board.map.walls.length = 0;
        Board.map.rooms.length = 0;
        console.log("resetRun");
        Board.stuff.reset();
    },

    placeThing: function() {
        // random location, random room [x,y] generator.
        var pickRandomRoom = function() {
            return Board.map.rooms[getRandomInt(0, Board.map.rooms.length - 1)];
        };

        var randomRoom = pickRandomRoom();
        //  console.log("randomRoom", randomRoom)
        var x = randomRoom.startXY[0],
            y = randomRoom.startXY[1];

        x = x + getRandomInt(1, randomRoom.width - 2);
        y = y + getRandomInt(1, randomRoom.height - 2);

        return [x, y];
    },

    initialize: function(level = 0) {
        this.reset(); // reset enemies, items, walls, and wallCheck.
        // currently makes (square) building...
        // BoardLevel Equations...

        var Building = {};

        // make appropriate size for level...
        var size = Board.map.maxWidth / 2 + level * 10;
        // increase rooms per level...
        Building.roomCount = level;

        Building.width =
            size < Board.map.maxWidth - 2 ? size : Board.map.maxWidth - 2;
        Building.height = Building.width;

        // create a map, (Board.map)
        Board.map.createBuilding(Building);

        // push all walls to wallCheck array.
        Board.map.walls.forEach(wall => Board.map._mapWall(wall));
        // Initialize items and enemies...
        // Distribute  health across potions in different locations.
        Board.stuff.distributeItems("health", level * 5);

        Board.stuff.addRandomItem(); // awareness, random weapon or nothing!

        // Enemies generated based on next level.
        Board.stuff.makeEnemies(this.Level, "ant"); // 1 ant per new Board.
        Board.stuff.makeEnemies(level, "orc"); // two orcs per Player level...

        Board.Level++;
    }
};

Board.map = {
    maxWidth: 200,
    maxHeight: 200,
    walls: [],
    rooms: [], // used to place things...
    entrances: [], // absolute position for positioning walls!
    // console.log("Board", Board.Level, Board);
    buildings: [],
    roomMargin: 3,
    entranceWidth: 3,

    createRoom: function(startX, startY, width, height, entranceCount) {
        var room = {roomID: this.rooms.length};
        room.startXY = [startX, startY];
        room.width = width;
        room.height = height;
        room.entrances= typeof entranceCount === "number" 
            ? this._randomEntrancesObject( width, height, entranceCount) :
            entranceCount; // ignore name... this is an entrance object!           
        this.rooms.push(room); // rooms buffer always gets latest room.
        return room;
    },
    _randomEntrancesObject: function(width, height, entrances) {
        var randomEntrances = {
            north: [],
            south: [],
            east: [],
            west: []
        };
        for (var i = 1; i <= entrances; i++) {
            var direction = randomDirection();
            var entrance;
            if (direction === "north" || direction === "south") {
                entrance = getRandomInt(
                    Board.map.roomMargin,
                    width - Board.map.roomMargin
                );
            } else {
                entrance = getRandomInt(
                    Board.map.roomMargin,
                    height - Board.map.roomMargin
                );
                randomEntrances[direction].push(entrance);
            }
        }
        return randomEntrances;
    },
    findLargestRoom() {
        var sizes = [],
            max,
            largest;
        Board.map.rooms.forEach(room => {
            let size = room.width * room.height;
            sizes.push(size);
            if (size > max || max === undefined) {
                max = size;
                largest = room;
            }
        });
        //console.log("LargestRoom=", max, largest, sizes)
        return largest;
    },
    createBuilding(building) {
        const width = building.width ? building.width : this.maxWidth - 2;
        const height = building.height ? building.height : this.maxHeight - 2;
        //
        const x = building.x ? building.x : 0.5 * (this.maxHeight - height);
        const y = building.y ? building.y : 0.5 * (this.maxWidth - width);

        const entranceCount = building.entranceCount
            ? building.entranceCount
            : width === this.maxWidth - 2 ? 0 : getRandomInt(1, 8);

        const room = this.createRoom(x, y, width, height, entranceCount);

        this._pushWalls(room);
        for (let i = 0; i < building.roomCount; i++) {
            let largest = this.findLargestRoom();
            Board.map.splitRoom(largest);

            //      console.log("Create Dungeon,", i, " largest room", largest);
        }
    },
    _pushWalls: function(room) {
        // pushes room's exterior walls to wall array. (Only used on "createBuilding")
        var startX = room.startXY[0],
            startY = room.startXY[1],
            width = room.width,
            height = room.height,
            entrances = room.entrances;

        // console.log("_pushWalls", room);
        var ids = {
            roomID: room.roomID,
            Level: Board.Level
        };
        Board.map.walls.push(
            Object.assign(
                {
                    wall: "north",
                    startXY: [startX, startY],
                    width: width,
                    entrances: entrances.north,
                    id: Board.Level + "exteriorWall" + this.walls.length
                },  ids
            )
        );
        Board.map.walls.push(
            Object.assign(
                {
                    wall: "south",
                    startXY: [startX, startY + height],
                    width: width,
                    entrances: entrances.south,
                    id: Board.Level + "exteriorWall" + this.walls.length
                },
                ids
            )
        );
        Board.map.walls.push(
            Object.assign(
                {
                    wall: "west",
                    startXY: [startX, startY],
                    height: height,
                    entrances: entrances.west,
                    id: Board.Level + "exteriorWall" + this.walls.length
                },
                ids
            )
        );
        Board.map.walls.push(
            Object.assign(
                {
                    wall: "east",
                    startXY: [startX + width, startY],
                    height: height,
                    entrances: entrances.east,
                    id: Board.Level + "exteriorWall" + this.walls.length
                },
                ids
            )
        );
    },

    _splitEntrances(array, splitPoint) {
        const entrances = {};
        entrances.room1 = array.filter(value => value < splitPoint);
        entrances.room2 = array.filter(value => value > splitPoint);
        return entrances;
    },
    _makeEntrances: function(length, entranceCount) {
        // if entranceCount left out as many as 1 entrance per 20 spaces.
        const maxEntrances = Math.max(Math.floor(length / 20), 1);
        const count = entranceCount? entranceCount : getRandomInt(1, maxEntrances);
        var entrances = [];
        for (let i = 0; i < count; i++) {
            let entrance= Math.floor( length / count ) * i + getRandomInt(Board.map.roomMargin, 20-Board.map.roomMargin);
            entrances.push(entrance);
        }
        console.log("makeEntrances", entrances);
        return entrances;
    },
    findSplitPoint: function(source, axis) {
        const entranceWidth = Board.map.entranceWidth,
            roomMargin = Board.map.roomMargin;
        let avoid, splitPoint;

        avoid =
            axis === 0
                ? joinArrays(source.entrances.north, source.entrances.south)
                : joinArrays(source.entrances.east, source.entrances.west);
        console.log("splitPoint avoid", avoid, source.entrances);

        let splitWall = [source.width, source.height][axis];
        splitPoint = getRandomInt(entranceWidth, splitWall - entranceWidth);

        function badLine(entrance) {
            return (
                entrance + entranceWidth + roomMargin > splitPoint &&
                splitPoint > entrance - roomMargin
            );
        }

        //  console.log("final splitpoint value =", splitPoint, avoid)
        while (avoid.filter(badLine) > 0) {
            splitPoint = getRandomInt(entranceWidth, splitWall - entranceWidth);
        }

        // console.log("splitPoint Successful", splitPoint);
        return splitPoint;
    },
    splitRoom: function(room, axis, splitPoint) {
        /* All arguments are optional, and will provide valid random values if left out.
           Splits a room, modifying 'room' and adding 'room2' to 'rooms' array.  
           Adds 'newWall' to walls array.   */

        const source = { ...room }; // source obj created so 'room' can be edited in place.

        var room2 = { roomID: Board.map.rooms.length, entrances: {} };
        const newWall = {
            id: Board.Level + "interiorWall" + room2.roomID
        };

        //  Create random arguments (room, axis, splitpoint) if necessary...
        if (room === undefined) {
            room = Board.map.rooms[getRandomInt(0, Board.map.rooms.length - 1)];
        }

        if (axis === undefined) {
            // the following line makes it more likely to split a room by its longer axis.
            axis =  source.width > source.height ? doOdds(5, 1, 0, 1) : axis = doOdds(1, 5, 0, 1);
        }
        if (splitPoint === undefined) {
            splitPoint = this.findSplitPoint(source, axis);
        }
                
        /***************   split room by axis *********************/
        if (axis === 0) {
            newWall.startXY = [
                source.startXY[0] + splitPoint,
                source.startXY[1]
            ];
            newWall.wall="west";
            newWall.height = source.height;

            newWall.entrances = this._makeEntrances(newWall.height);

            let splitEntrancesNorth = this._splitEntrances(
                source.entrances.north,
                splitPoint
            );
            let splitEntrancesSouth = this._splitEntrances(
                source.entrances.south,
                splitPoint
            );

            room.width = splitPoint;
            room.entrances.north = splitEntrancesNorth.room1;
            room.entrances.south = splitEntrancesSouth.room1;
            room.entrances.east = newWall.entrances;

            room2.width = source.width - splitPoint;
            room2.height = source.height;
            room2.startXY = newWall.startXY;
            room2.entrances.north = splitEntrancesNorth.room2;
            room2.entrances.south = splitEntrancesSouth.room2;
            room2.entrances.east = source.entrances.east;
            room2.entrances.west = newWall.entrances;
        } else {
            newWall.startXY = [
                source.startXY[0],
                source.startXY[1] + splitPoint
            ];
            newWall.width = source.width;
            newWall.wall = "north";
            newWall.entrances = this._makeEntrances(newWall.width);
            let splitEntrancesWest = this._splitEntrances(
                source.entrances.west,
                splitPoint
            );
            let splitEntrancesEast = this._splitEntrances(
                source.entrances.east,
                splitPoint
            );

            room.height = splitPoint;
            room.entrances.west = splitEntrancesWest.room1;
            room.entrances.east = splitEntrancesEast.room1;
            room.entrances.south = newWall.entrances;

            room2.height = source.height - splitPoint;
            room2.width = source.width;
            room2.startXY = newWall.startXY;
            room2.entrances.west = splitEntrancesWest.room2;
            room2.entrances.east = splitEntrancesEast.room2;
            room2.entrances.south = source.entrances.south;
            room2.entrances.north = newWall.entrances;
        }
        /**************** Push room and wall to arrays  
        console.log("Splitwall", newWall, room, room2);*/
        Board.map.rooms.push(room2);
        this.walls.push(newWall);
        return {
            newRoom: room2,
            newWall: newWall
        };
    },
    _mapWall: function(wall) {
        /*  Takes wall objects from (Board.map.walls) , 
        and stores all wall coordinates for game logic in 'Board.wallCheck' ( used by App.checkspot ) */
        const entranceWidth = Board.map.entranceWidth;
        const x = wall.startXY[0],
            y = wall.startXY[1];
        const start = wall.width ? x : y;
        const end = wall.height ? y + wall.height : x + wall.width;
        const entrances = wall.entrances;
        const axis = wall.width ? 0 : 1;
        // Set by axis...

        var makeWall = function(x, y) {
            try {
                Board.wallCheck["row" + y].push(x);
            } catch (e) {
                Board.wallCheck["row" + y] = [x];
            }
        };
        var removeEntrance = function(axis, entrance) {
            if (axis === 0) {
                let index = Board.wallCheck["row" + y].indexOf(x + entrance);
                Board.wallCheck["row" + y].splice(index, entranceWidth);
            } else {
                for (
                    let row = y + entrance;
                    row <= y + entranceWidth + entrance;
                    row++
                ) {
                    let index = Board.wallCheck["row" + row].indexOf(
                        x + entrance
                    );
                    Board.wallCheck["row" + row].splice(index, 1);
                }
            }
        };
        // makeWall....
        for (let brick = start; brick <= end; brick++) {
            if (axis === 0) {
                makeWall(brick, y);
            } else {
                makeWall(x, brick);
            }
        }
        // removeEntrances...
        entrances.forEach(entrance => removeEntrance(axis, entrance));
    },
    assignBuildingID: function() {
        return Board.map.buildingID++;
    }
};

Board.stuff = (function() {
    var my = {};
    my.reset = function(){
        Board.stuff.enemyCount = 0;
        Board.stuff.enemies.length = 0;
        Board.stuff.mapItems.length = 0;
    };
    my.mapItems = []; // current items get stored here during initialize.
    my.enemies = []; // current enemies get stored here during initialize.
    my.direction = ["north", "south", "east", "west", "none"];
    my.enemyCount = 0; // Used to make enemies (ids/keys), reset by Board.initialize!
    my.enemyType = {
        orc: {
            name: "orc",
            health: 8,
            damage: 4,
            speed: 5,
            awareness: 12,
            attackSpeed: 3
        },
        ant: {
            name: "ant",
            health: 4,
            damage: 2,
            speed: 3,
            awareness: 5,
            attackSpeed: 3
        }
    };
    my.levelData = {
        1: { xp: 0, health: 10 },
        2: { xp: 10, health: 15 },
        3: { xp: 20, health: 20 },
        4: { xp: 30, health: 25 },
        5: { xp: 40, health: 30 }
    };

    my.weapons = { dagger: 3, axe: 5, sword: 7 };

    my.player = {
        frame: 0,
        health: 10,
        xp: 0,
        speed: 2,
        weapon: "dagger",
        attackSpeed: 2,
        awareness: 10,
        level: 1,
        items: []
    };
    my.awardXP = function(type) {
        // provides reactApp proper XP for killed enemies.
        var enemy = my.enemyType[type];
        return (enemy.health + enemy.damage + enemy.awareness) / enemy.speed;
    };
    my.randomWeapon = function() {
        // used by 'my.addRandomItem'
        var weapons = Object.keys(Board.stuff.weapons);
        return weapons[getRandomInt(0, weapons.length - 1)];
    };
    my.makeEnemies = function(count, type) {
        // used by initialize...
        var enemyCount = Board.stuff.enemyCount;
        for (var i = enemyCount; i < count + enemyCount; i++) {
            console.log("enemyCount", enemyCount, i);
            var location = Board.placeThing();
            var stuff = my.enemyType[type];
            console.log(
                "count",
                count,
                "type",
                type,
                "i",
                i,
                "location",
                location,
                stuff
            );
            my.enemies.push(
                Object.assign(
                    {
                        frame: 0,
                        id: Board.Level + "enemy" + i,
                        x: location[0],
                        y: location[1],
                        direction: randomDirection()
                    },
                    stuff
                )
            );
        }
        Board.stuff.enemyCount += count;
    };
    my.addItem = function(type, value) {
        var item = {},
            location = Board.placeThing();
        console.log(my.mapItems, "mapItems", my.mapItems.length);
        item.id =
            my.mapItems.length !== 0
                ? Board.Level + "item" + my.mapItems.length
                : Board.Level + "item0";
        item.value = value;
        item.type = type;
        item.x = location[0];
        item.y = location[1];
        my.mapItems.push(item);
    };

    my.distributeItems = function(type, totalValue, min = 3, max = 6) {
        // distribute items of random value (min to max) up to a total value...
        var count = 0,
            value;
        while (count < totalValue - max) {
            value = getRandomInt(min, max);
            Board.stuff.addItem(type, value);
            count += value;
        }
        my.addItem(type, totalValue - count);
    };

    my.addRandomItem = function() {
        var selection = getRandomInt(0, 2);
        if (selection === 1) {
            // awareness item.
            Board.stuff.addItem("awareness", getRandomInt(1, 20));
        } else if (selection === 2) {
            // weapon..
            Board.stuff.addItem("weapon", my.randomWeapon());
        }
    };

    return my;
})();
export default Board;
