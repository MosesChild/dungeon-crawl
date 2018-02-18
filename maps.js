
export const maps = function () {

        var walls=[], rooms=[] // acts as a buffer while making building...
        console.log("Board", this.boardID, Board);
        var buildings=[];
        var roomCount=0;
        var wallCount=0;
        const xAxis=0,yAxis=1;
        const entranceWidth=6;
        const roomMargin=3; // a minimum distance between a wall and a door.
        
       var Room=function(startX,startY, width, height, entranceCount){
           if (typeof startX==='object'){  //alternate object creation for already defined rooms(used by splitRoom!)
//              this.boardID=Board.boardID;
              this.roomID=roomCount++;
              this.startXY=startX.startXY;
              this.endXY=[startX.startXY[0]+startX.width, startX.startXY[1]+startX.height];
              this.width = startX.width;
              this.height =startX.height;
              this.entrances = startX.entrances;
           } else {
              this.roomID=roomCount++;
              this.startXY=[startX,startY]
              this.width = width;
              this.height = height;
              this.endXY=[this.startXY[0]+this.width, this.startXY[1]+this.height];
              if (typeof entranceCount=='number'){ 
                 this.entrances=_randomEntrancesObject(width,height, entranceCount);
              }
              if (typeof entranceCount=='object'){
                 this.entrances==entranceCount;// ignore name... this is an entrance object!
              }
           }
          rooms.push(this);// rooms buffer always gets latest room.
       }
       var _randomEntrancesObject=function (width,height, entrances){
          var randomEntrances={north:[],south:[],east:[],west:[]};
          for (var i=0; i<entrances; i++){
             var direction=randomDirection();
             var entrance;
             direction=="north" || direction =="south" ?  
                entrance=getRandomInt(roomMargin, (width-roomMargin))
             : entrance=getRandomInt(roomMargin, (height-roomMargin))
             randomEntrances[direction].push(entrance);
          }
          console.log("randomEntrancesObject", randomEntrances)
          return randomEntrances;
       }
       
       var _addWalls=function(building){  // pushes building's exterior walls to wall array.
          var startX=building.startXY[0], startY=building.startXY[1], width=building.width, height=building.height,
              entrances=building.entrances;
          var ids={buildingID: building.buildingID,
//                   boardID: Board.boardID,
                   wallID: "wall"+wallCount
                  };
          building.walls.push(Object.assign({ 
             wall: "north",
             startXY: [startX,startY],
             width: width,
             entrances: entrances["north"],
             id: "exteriorWall"+wallCount++}, ids)  // Board.boardID+
                    );
          building.walls.push(Object.assign({ 
             wall: "south",
             startXY: [startX, startY+height],
             width: width,
             entrances: entrances["south"],
             id: "exteriorWall"+wallCount++}, ids)  // Board.boardID+
                    );
          building.walls.push(Object.assign({ 
             wall: "west",
             startXY: [startX,startY],
             height: height,
             entrances: entrances["west"],
             id: "exteriorWall"+wallCount++}, ids)  // Board.boardID+
                    );
          building.walls.push(Object.assign({ 
             wall: "east",
             startXY: [startX+width, startY],
             height: height,
             entrances: entrances["east"],
             id: "exteriorWall"+wallCount++}, ids)  //Board.boardID+
                    );
         building.walls.map((wall)=>
         this.map.walls.push(wall))
          return building;
       };
        
        var _addEntrance = function(room, wall, entrance){
        if (!room.entrances){room.entrances=={}}
        if (wall==undefined){wall=randomDirection();}
        (wall=="west" || wall== "east") ? 
           entrance=getRandomInt(roomMargin, (room.height-(entranceWidth+roomMargin)))
        :  entrance=getRandomInt(roomMargin, (room.width-(entranceWidth+roomMargin)))
        if (room.entrances[wall]==undefined){
           room.entrances[wall]=new Array
        } 
        var entrances=room.entrances[wall]
       // console.log("addEntrance", room, entrances, wall, entrance);
        if (!entrances.some(x => x <entrance+entranceWidth+roomMargin && x>entrance-(entranceWidth+roomMargin))){
           entrances.push(entrance)
           entrances=entrances.sort(function(a, b) {return a - b;}); 
        //  console.log("entrance added", wall, entrance, entrances)
        } 
        return room;
     }   
     
        var splitRoom = function(room, axis, splitPoint, doorCount){  /* Splits room, adjusting original room object and returning new room. All properties beyond roomCount are optional, and will provide valid random values if left out.
        Strategy : All original 'room' properties are copied as 'source' and used for calculations.*/
           const source = { ...room };
           var newWall={};
          // console.log("source",source)
           var room2={ 
              entrances : {},
              buildingID: source.buildingID
           }  // start with a blank room2.
     
           var east=source.entrances["east"],  
               west=source.entrances["west"],
               north=source.entrances["north"], 
               south=source.entrances["south"],
               avoid;
           room.entrances={};//  delete current entrance data on original room entirely!
           if (axis==undefined){ axis=getRandomInt(0,1); }
               axis==0 ? avoid=joinArrays(north,south)
           : avoid=joinArrays(east,west)
           while (splitPoint==undefined || 
                  avoid.some(entrance => (
              (entrance + entranceWidth + roomMargin) > splitPoint 
              && splitPoint > (entrance - roomMargin)))
                 ){
              axis==0 ? splitPoint=getRandomInt( roomMargin, source.width-roomMargin)
              : splitPoint=getRandomInt( 2*roomMargin, source.height-2*roomMargin)  
           } 
         //  console.log("final splitpoint value =", splitPoint, avoid)
           // now calculate rooms... 
     
           if (axis==0){ // changed object width!
              room.width = splitPoint
     
              if (east){ 
                 room2.entrances.east=east;  //source data!
                 doorCount ? 
                    doIt(doorCount, _addEntrance, room, "east") 
                 : _addEntrance(room,"east")
                 room2.entrances.west = room.entrances.east.slice()  // copying new entrance!        
                 newWall={wall: "east",
                          entrances: room.entrances.east,
                          height: room.height,
                         }
              };
              if (north){
                 room2.entrances.north =arraySubtract(north.filter((value)=>value>=splitPoint) , splitPoint );
                 room.entrances.north = north.filter((value)=>value<splitPoint);
              }
              if (south){
                 room2.entrances.south = arraySubtract(south.filter((value)=>value>=splitPoint) , splitPoint );
                 room.entrances.south = south.filter(value=>value<splitPoint);
              }
              if (west){
                 room.entrances.west = west;
              }
              room2.startXY= [(source.startXY[0] + splitPoint), source.startXY[1]];
              room2.width= source.width - splitPoint;
              room2.height= source.height;
                  
     
           } else { // changed object height...
              if (north){
                 room.entrances.north=north;
              }
              if (south){
                 room2.entrances.south=south;
                 doorCount ? 
                    doIt(doorCount, _addEntrance, room, "south") 
                 : _addEntrance(room,"south")// create new entrance(s) to room!
                 room2.entrances.north=room.entrances.south.slice()// add new entrance to room2
                 newWall={wall: "south",
                          entrances: room.entrances.south,
                          width: room.width,
                         }
              }
              if (west){ 
                 room2.entrances.west = arraySubtract((west.filter((value)=>value>=splitPoint) ), splitPoint );
                 room.entrances.west = west.filter(value=>value<splitPoint);
              };
              if (east){
                 room2.entrances.east = arraySubtract(east.filter((value)=>value>=splitPoint) , splitPoint );
                 room.entrances.east = east.filter(value=>value<splitPoint);
              }
             room.height = splitPoint
             room2.startXY= [source.startXY[0] , (source.startXY[1]+ splitPoint)];
             room2.width=source.width;
             room2.height= source.height-splitPoint;
             
           }
          // console.log("room1", room, "room2",room2)
     
           //newWall.id=room.buildingID+"room"+room.roomID+"wall"+room2.roomID
           newWall.id="interiorWall"+room2.roomID;  //   Board.boardID+
           wallCount++;
           newWall.startXY=room2.startXY;
       //    newWall.boardID=Board.boardID;
       //    newWall.buildingID=room.buildingID
           walls.push(newWall)  // adds newWall to walls array... Useful for drawing because it is the bare minimum needed to describe the building. 
        //   rooms.push(room2)
           return {newRoom: room2, newWall: newWall}
        }   
        
        var createBuilding = function(startX=0,startY=0, width, height, entranceCount=1){
           // Random building size...
           const wallMin=6; 
           if (width==undefined){width=getRandomInt(wallMin, maxWidth-startX);}
           if (height==undefined){height=getRandomInt(wallMin, maxHeight-startY);}
     
           // start by making a Room, which is the 'outline' of the whole building...
           var buildingID= buildings!=undefined ? buildings.length : 0
           var outline=Object.assign({buildingID}, Room(startX,startY,width,height, entranceCount));
       
              
     
           // create building obj to hold all building info, including a rooms array with the first Room.
           var buildingObj={building: outline.buildingID, startXY: outline.startXY, 
                            width: outline.width, height: outline.height,
                            endXY: outline.endXY, rooms: [outline], walls:[], 
                            entrances: outline.entrances
                           }
           // add the current walls to the buildingObj...
           buildingObj=_addWalls(buildingObj);
           
           buildings.push(buildingObj); // add building to buildings array.
        return buildingObj
        }
     
     
     
        var makeBuilding = function(roomCount=1, entranceCount=1, startXY=[0,0], width, height ){
           /* this takes an initial 'Room', and creates rooms by adding walls to split it.*/ 
           /* all parameters are optional... 
           Random and preset Defaults...*/
     
     
           var building=createBuilding(startXY[0],startXY[1], width, height, entranceCount);
           
           var splitBuilding=function (){ // randomly splits building.rooms.
              
           console.log("pick", rooms)
              var pick=getRandomInt(0, building.rooms.length-1) // picks a room at random...
              var currentRoom=building.rooms[pick]
              var axis;  
              // the following lines make it more likely to split a room by its longer axis.
              if (currentRoom.width > 15 && currentRoom.height > 15){  
                 currentRoom.width > currentRoom.height ?
                 axis=doOdds(5,1,0,1):
                 axis=doOdds(1,5,0,1)
     
                 var result=splitRoom(currentRoom, axis);
                 
                 result.newRoom.buildingID=currentRoom.buildingID;
                 building.rooms.push(result.newRoom);
                 building.walls.push(result.newWall)
              } 
              if (building.rooms.length<roomCount){
                 splitBuilding()
              }
           }
     
           splitBuilding();  // split the building into rooms  (buffer).
     
           return building; // here for easy testing only!    
        }
        
        var getRooms = function(){ 
           var targetRooms=[];
           this.map.buildings.map((building)=>{
               targetRooms.push(building.rooms)
           });
           return targetRooms;
         }
     /*
           for (building of Board.map.buildings){
              console.log("getRooms", building.rooms)
              targetRooms.push(building.rooms);
           }
           targetRooms=targetRooms.reduce(
              function(a, b) {
                 return a.concat(b);
              },
              []
           );
           */
     
        
        var placeInRoom = function(room){
           var xMin=room.startXY[0]+1,yMin = room.startXY[1],
               x=getRandomInt(xMin, (xMin+room.width-1)),
               y=getRandomInt(yMin, (yMin+room.height-1));
           return [x,y];
        }
        
        
         
        var reset= function(){
           walls.length=0;
           rooms.length=0;
           buildings.length=0;
        }
     
        /*  Map Module public returns.... */
        var my = {
           entranceWidth: entranceWidth,
           makeRoom: Room,
           splitRoom: splitRoom,
           makeBuilding: makeBuilding,
           createBuilding: createBuilding,
           getRooms: getRooms,
           placeInRoom: placeInRoom,
           reset: reset
        }
        return my;
     };