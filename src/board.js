import {
    getRandomInt,
    randomDirection,
    joinArrays,
    arraySubtract,
    doOdds,
    doIt
} from './firstModule'

var Board = {
    // all the functions  (ReactApp) Dungeon-Crawl requires to build State arrays for a map with creatures and items.
    wallCheck: {}, // object stores wall coordinates by row...
    Level: 0, // counter to generate ID's Boards.
    //var player1=new Board.stuff.MakePlayer();

    reset: function () {
        this.wallCheck = {};
        Board.stuff.enemyCount = 0;
        Board.stuff.enemies.length = 0;
        Board.stuff.mapItems.length = 0;
        Board.map.reset();
    },

    placeThing: function () { // random location, random room [x,y] generator.
        // 
        var pickRandomRoom = function () {
            return Board.map.rooms[getRandomInt(0, Board.map.rooms.length - 1)]
        }

        var randomRoom = pickRandomRoom();
      //  console.log("randomRoom", randomRoom)
        var x = randomRoom.startXY[0],
            y = randomRoom.startXY[1];

        x = x + getRandomInt(1, randomRoom.width - 2);
        y = y + getRandomInt(1, randomRoom.height - 2);

        return [x, y];


    },

    initialize: function (level = 1) {
        this.reset(); // reset enemies, items, walls, and wallCheck.
        // currently makes (square) building...
        // BoardLevel Equations... level+1 can be the roomCount...
        var roomCount = (level + 5);

        // center the building, make appropriate size for level...
        //var offset = (200 - side) / 2;

        // create a map, (Board.map)
        Board.map.createDungeon(roomCount);
        console.log(Board)

        // Initialize items and enemies...
        // Distribute  health across potions in different locations.
        Board.stuff.distributeItems("health", (level * 5));

        Board.stuff.addRandomItem() // awareness, random weapon or nothing!


        // Enemies generated based on next level.
        Board.stuff.makeEnemies(this.Level, "ant"); // 1 ant per new Board.
        Board.stuff.makeEnemies(level, "orc") // two orcs per Player level...

        Board.Level++;

        console.log("Board.initialize complete! Board maps, items,", Board.stuff.mapItems, " and enemies", Board.stuff.enemies);
    }

};


Board.map = {
    walls: [],
    rooms: [], // acts as a buffer while making building...
    entrances: [], // absolute position for positioning walls!
    // console.log("Board", Board.Level, Board);
    buildings: [],
    roomMargin: 3,  
    entranceWidth: 3,

    createRoom: function (startX, startY, width, height, entranceCount) {
        var room = {};
        room.roomID = this.rooms.length;
        if (typeof startX === 'object') { //alternate object creation for already defined rooms(used by splitRoom!)
            room.Level = Board.Level;
            room.startXY = startX.startXY;
            room.endXY = [startX.startXY[0] + startX.width, startX.startXY[1] + startX.height];
            room.width = startX.width;
            room.height = startX.height;
            room.entrances = startX.entrances;
        } else {
            room.startXY = [startX, startY]
            room.width = width;
            room.height = height;
            room.endXY = [room.startXY[0] + room.width, room.startXY[1] + room.height];
            if (typeof entranceCount === 'number') {

                room.entrances = this._randomEntrancesObject(width, height, entranceCount);
            }
            if (typeof entranceCount === 'object') {
                room.entrances = entranceCount; // ignore name... this is an entrance object!
            }
        }
        console.log("createRoom run!", room, arguments)
        this.rooms.push(room); // rooms buffer always gets latest room.
        return room;
    },
    _randomEntrancesObject: function (width, height, entrances) {
        var randomEntrances = {
            north: [],
            south: [],
            east: [],
            west: []
        };
        for (var i = 1; i <= entrances; i++) {
            var direction = randomDirection();
            var entrance;
            console.log("_randomEntrancesObject", direction)
            if (direction === "north" || direction === "south"){
                entrance = getRandomInt(Board.map.roomMargin, (width - Board.map.roomMargin))
                    
            } else {
                
                entrance = getRandomInt(Board.map.roomMargin, (height - Board.map.roomMargin))
            randomEntrances[direction].push(entrance);
            }
        }
        console.log("randomEntrancesObject", randomEntrances)
        return randomEntrances;
    },
    findLargestRoom() {
        var sizes = [],
            max, largest;
        Board.map.rooms.forEach(room => {
            let size = room.width * room.height
            sizes.push(size);
            if (size > max || max === undefined) {
                max = size
                largest = room;
            }
        })
        //console.log("LargestRoom=", max, largest, sizes)
        return largest

    },
    createDungeon(roomCount) {
        const room = this.createRoom(0, 0, 200, 199, 1);
        this._pushWalls(room);
        for (let i = 0; i < roomCount; i++) {
            let largest = this.findLargestRoom();
            Board.map.splitRoom(largest);

            console.log("Create Dungeon,", i, " largest room", largest)
        };
    },
    _pushWalls: function (room) { // pushes room's exterior walls to wall array.
        var startX = room.startXY[0],
            startY = room.startXY[1],
            width = room.width,
            height = room.height,
            entrances = room.entrances;
        console.log("_pushWalls", room)
        var ids = {
            roomID: room.roomID,
            Level: Board.Level,
        };
        Board.map.walls.push(Object.assign({
            wall: "north",
            startXY: [startX, startY],
            width: width,
            entrances: entrances["north"],
            id: Board.Level + "exteriorWall" + this.walls.length
        }, ids));
        Board.map.walls.push(Object.assign({
            wall: "south",
            startXY: [startX, startY + height],
            width: width,
            entrances: entrances["south"],
            id: Board.Level + "exteriorWall" + this.walls.length
        }, ids));
        Board.map.walls.push(Object.assign({
            wall: "west",
            startXY: [startX, startY],
            height: height,
            entrances: entrances["west"],
            id: Board.Level + "exteriorWall" + this.walls.length
        }, ids));
        Board.map.walls.push(Object.assign({
            wall: "east",
            startXY: [startX + width, startY],
            height: height,
            entrances: entrances["east"],
            id: Board.Level + "exteriorWall" + this.walls.length
        }, ids));
    },
    _addEntrance: function (room, wall, entrance) {
        const entranceWidth=Board.map.entranceWidth, roomMargin = Board.map.roomMargin
        if (!room.entrances) {
            room.entrances = {}
        }
        if (wall === undefined) {
            wall = randomDirection();
        }
        (wall === "west" || wall === "east") ?
        entrance = getRandomInt(Board.map.roomMargin, (room.height - (entranceWidth + roomMargin)))
        : entrance = getRandomInt(Board.map.roomMargin, (room.width - (entranceWidth + roomMargin)))
        if (room.entrances[wall] === undefined) {
            room.entrances[wall] = [];
        }
        var entrances = room.entrances[wall]
        // console.log("addEntrance", room, entrances, wall, entrance);
        if (!entrances.some(x => x < entrance + entranceWidth + 
            Board.map.roomMargin && x > entrance - (entranceWidth + roomMargin))) {
            entrances.push(entrance)
            entrances = entrances.sort(function (a, b) {
                return a - b;
            });
            //  console.log("entrance added", wall, entrance, entrances)
        } else {
            this._addEntrance(room, wall)
        }
        return room;
    },
    findSplitPoint: function (source, axis) {
        const entranceWidth=Board.map.entranceWidth, roomMargin = Board.map.roomMargin
        let avoid, splitPoint;

        axis === 0 ? avoid = joinArrays(source.entrances.north, source.entrances.south) :
            avoid = joinArrays(source.entrances.east, source.entrances.west)
        console.log("splitPoint avoid",avoid, source.entrances)

        let splitWall = [source.width, source.height][axis]
        splitPoint = getRandomInt(entranceWidth, splitWall - entranceWidth);

        function badLine(entrance) {
            return entrance + entranceWidth + roomMargin > splitPoint &&
                splitPoint > (entrance - roomMargin);
        };

        //  console.log("final splitpoint value =", splitPoint, avoid)
        while (avoid.filter(badLine) > 0) {
            splitPoint = getRandomInt(entranceWidth, splitWall - entranceWidth);
        }

       // console.log("splitPoint Successful", splitPoint);
        return splitPoint;
    },
    splitRoom: function (room, axis, splitPoint, doorCount) {
        // Splits room, adjusting original room object on array and returning new room. 
        // All properties are optional, and will provide valid random values if left out.
        // must modifies original room and adds new room, and wall to walls array.
        if (room === undefined) {
            room = Board.map.rooms[getRandomInt(0, Board.map.rooms.length - 1)]
        }
        const source = Object.assign({}, room);
        var east = source.entrances["east"],
            west = source.entrances["west"],
            north = source.entrances["north"],
            south = source.entrances["south"];

        var newWall;
        var room2 = { // start with a blank room2 to put entrances in....
            entrances: {},
         //   buildingID: source.buildingID
        };
        //  Create random arguments (axis, splitpoint) if necessary...
        if (axis === undefined) {
            // the following lines make it more likely to split a room by its longer axis.
            if (source.width > 15 && source.height > 15) {
                source.width > source.height ?
                    axis = doOdds(5, 1, 0, 1) :
                    axis = doOdds(1, 5, 0, 1)
            };
        }
        if (splitPoint === undefined) {
            splitPoint = this.findSplitPoint(source, axis);
        }


        room.entrances = {}; //  delete current entrance data on original room entirely!
        console.log("source", source);

        // now calculate rooms... 

        if (axis === 0) { // changed object width!
            room.width = splitPoint

            if (east) {
                room2.entrances.east = east; //source data!
                doorCount ?
                    doIt(doorCount, this._addEntrance, room, "east") :
                    this._addEntrance(room, "east")
                room2.entrances.west = room.entrances.east.slice() // copying new entrance!        
                newWall = {
                    wall: "east",
                    startXY: [],
                    entrances: room.entrances.east,
                    height: room.height,
                    Level: Board.Level,
                //    buildingID: room.buildingID,
                    id: null
                }
            };
            if (north) {
                room2.entrances.north = arraySubtract(north.filter((value) => value >= splitPoint), splitPoint);
                room.entrances.north = north.filter((value) => value < splitPoint);
            }
            if (south) {
                room2.entrances.south = arraySubtract(south.filter((value) => value >= splitPoint), splitPoint);
                room.entrances.south = south.filter(value => value < splitPoint);
            }
            if (west) {
                room.entrances.west = west;
            }
            room2 = {
                startXY: [(source.startXY[0] + splitPoint), source.startXY[1]],
                width: source.width - splitPoint,
                height: source.height,
                entrances: room2.entrances
            };

        } else {
            // changed height
            if (north) {
                room.entrances.north = north;
            }
            if (south) {
                room2.entrances.south = south;
                doorCount ?
                    doIt(doorCount, this._addEntrance, room, "south") :
                    this._addEntrance(room, "south") // create new entrance(s) to room!
                room2.entrances.north = room.entrances.south.slice() // add new entrance to room2
                newWall = {
                    wall: "south",
                    entrances: room.entrances.south,
                    width: room.width,
                    Level: Board.Level,
                  //  buildingID: room.buildingID
                }
            }
            if (west) {
                room2.entrances.west = arraySubtract((west.filter((value) => value >= splitPoint)), splitPoint);
                room.entrances.west = west.filter(value => value < splitPoint);
            };
            if (east) {
                room2.entrances.east = arraySubtract(east.filter((value) => value >= splitPoint), splitPoint);
                room.entrances.east = east.filter(value => value < splitPoint);
            }
            room.height = splitPoint
            room2 = {
                startXY: [source.startXY[0], (source.startXY[1] + splitPoint)],
                width: source.width,
                height: source.height - splitPoint,
                entrances: room2.entrances
            };
        }
        console.log("room1", room, "room2", room2)
        room2 = this.createRoom(room2)

        //newWall.id=room.buildingID+"room"+room.roomID+"wall"+room2.roomID
        newWall.id = Board.Level + "interiorWall" + room2.roomID;
        newWall.startXY = room2.startXY;

        // push to wallCheck array...
        this._mapWall(newWall);
        // and walls array...
        this.walls.push(newWall) // adds newWall to walls array... Useful for drawing because it is the bare minimum needed to describe the building. 
        //   rooms.push(room2)
        return {
            newRoom: room2,
            newWall: newWall
        }
    },
    _mapWall: function (wall) { /*  Takes wall objects from (Board.map.walls) , 
        and stores all wall coordinates for game logic in 'Board.wallCheck' ( used by App.checkspot ) */
        const entranceWidth=Board.map.entranceWidth;
        const x = wall.startXY[0], y = wall.startXY[1];
        const start = wall.width ? x : y
        const end = wall.height ? y + wall.height : x + wall.width
        const entrances = wall.entrances;
        const axis = wall.width ? 0 : 1
        // Set by axis...

        var makeWall = function (x,y) {
            try {
                Board.wallCheck["row" + y].push(x)
            } catch (e) {
                Board.wallCheck["row" + y] = [x];
            }
        }
        var removeEntrance = function (axis, entrance){
            if (axis===0){
                let index=Board.wallCheck['row'+y].indexOf(x+entrance)
                Board.wallCheck['row' + y].splice(index, entranceWidth)
            } else {
                for (let row=y+entrance; row <= y + entranceWidth + entrance; row++ ){
                    let index=Board.wallCheck["row"+row].indexOf( x  +entrance );
                    Board.wallCheck["row"+row].splice(index,1);
                }
            }
        }
        // makeWall....
        for (let brick = start; brick <= end; brick++) {
            if (axis === 0) {
                makeWall(brick, y);
            } else {
                makeWall(x, brick);
            }
        }
        // removeEntrances...
        entrances.forEach(entrance=>removeEntrance(axis, entrance))

    },
    assignBuildingID: function () {
        return Board.map.buildingID++;
    },
/********* currently not implemented-  this can distribute (place) enemies and items in specific rooms ******** */
    placeInRoom: function (room) {
        var xMin = room.startXY[0] + 1,
            yMin = room.startXY[1],
            x = getRandomInt(xMin, (xMin + room.width - 1)),
            y = getRandomInt(yMin, (yMin + room.height - 1));
        return [x, y];
    },

    reset: function () {

        this.walls.length = 0;
        this.rooms.length = 0;
        this.buildings.length = 0;
        console.log("maps.reset run!", this)
    }

};



Board.stuff = (function () {
    var my = {}
    my.mapItems = []; // current items get stored here during initialize.
    my.enemies = [];  // current enemies get stored here during initialize.
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
    }
    my.levelData = {
        1: {  xp: 0,  health: 10 },
        2: {  xp: 10, health: 15 },
        3: {  xp: 20,  health: 20 },
        4: {  xp: 30,  health: 25 },
        5: { xp: 40, health: 30 }
    };

    my.weapons = { dagger: 3, axe: 5, sword: 7 }

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
    }
    my.awardXP = function (type) {   // provides reactApp proper XP for killed enemies.
        var enemy = my.enemyType[type]
        return (enemy.health + enemy.damage + enemy.awareness) / enemy.speed
    }
    my.randomWeapon = function () {  // used by 'my.addRandomItem' 
        var weapons = Object.keys(Board.stuff.weapons);
        return weapons[getRandomInt(0, (weapons.length - 1))]
    }
    my.makeEnemies = function (count, type) {  // used by initialize...
        var enemyCount = Board.stuff.enemyCount;
        for (var i = enemyCount; i < (count + enemyCount); i++) {
            console.log("enemyCount", enemyCount, i)
            var location = Board.placeThing();
            var stuff = my.enemyType[type];
            console.log("count", count, "type", type, "i", i, "location", location, stuff)
            my.enemies.push(Object.assign({
                frame: 0,
                id: Board.Level + "enemy" + i,
                x: location[0],
                y: location[1],
                direction: randomDirection()
            }, stuff))
        }
        Board.stuff.enemyCount += count;
    }
    my.addItem = function (type, value) {
        var item = {},
            location = Board.placeThing();
        console.log(my.mapItems, "mapItems", my.mapItems.length);
        my.mapItems.length !== 0 ? item.id = Board.Level + "item" + my.mapItems.length : item.id = Board.Level + "item" + 0;
        item.value = value;
        item.type = type;
        item.x = location[0];
        item.y = location[1];
        my.mapItems.push(item);
    }

    my.distributeItems = function (type, totalValue, min = 3, max = 6) {
        // distribute items of random value (min to max) up to a total value...
        var count = 0,
            value;
        while (count < totalValue - max) {
            value = getRandomInt(min, max);
            Board.stuff.addItem(type, value);
            count += value;
        }
        my.addItem(type, (totalValue - count))
    }

    my.addRandomItem = function () {
        var selection = getRandomInt(0, 2);
        if (selection === 1) { // awareness item.
            Board.stuff.addItem("awareness", getRandomInt(1, 20));
        } else if (selection === 2) { // weapon..
            Board.stuff.addItem("weapon", my.randomWeapon());
        }
    }

    return my;

})();
export default Board;