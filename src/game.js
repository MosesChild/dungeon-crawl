import React from 'react'
import ReactKonva from 'react-konva';
import Board from './board'
import {MakeWall, MakeRoom} from './mapMaker'
import {randomDirection, doOdds} from './firstModule';

var framesPerSecond=30, frameLength=1000/framesPerSecond;
const {Layer, Rect, Line, Circle, Star, Stage, Group} = ReactKonva; 
const debug=true;
const maxWidth=Board.map.maxWidth;
const maxHeight=Board.map.maxHeight;

var warning=[]


// scale... we need to scale player board 200*200 to a canvas
// start by determining viewPort

var w = .98* Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = .92* Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var smallerSize = w < h ? w : h
var scale=smallerSize/maxWidth;



var directionCoordinates=function(x,y,direction, optionalDistance){
    if (optionalDistance===undefined){ optionalDistance = 1;  } 
  //  console.log("optionalDistance",optionalDistance)
 //  console.log("directionCoordinates received,",arguments) 
    direction==="north" ? y = Math.max((y-optionalDistance),0)
    : direction==="south" ? y = Math.min((y+optionalDistance), maxHeight)
    : direction==="west" ? x = Math.max((x-optionalDistance),0)
    : direction==="east" ? x = Math.min((x+optionalDistance),maxWidth)
    : direction="none"
  //console.log("directionCoordinate update", x,y)
    return [x,y,direction]
 }

export function GameMessage(props){  
   if (props.text==null){
      return (<div></div>);
   } else {
     if (props.text==="GAME OVER"){
      const nextText="Press any key to Restart"
      Board.reset();
     }
     const nextText="Press any key to continue"
      return (<div className="GameMessage">
         <h1>{props.text}</h1>
         <p> { nextText } </p>
            </div>);
   }
}


function Weapon(props){
   var x=props.x, y=props.y;
 var points=[x,y,(x+3.5),(y+3.5), (x+1),(y+1),(x+.5),(y+1.5),(x+1.5),(y+.5)];
//   var points=[x,y,(x+2),y,(x+2),(y+5),(x+2),(y+1.5),x,(y+1.5),(x+4),(y+1.5)];
   return (<Group >
         <Line points={points} stroke={"orange"} strokeWidth={1} offsetX={1} offsetY={1}/>
         <Line points={points} stroke={"black"}  strokeWidth={.2} offsetX={1} offsetY={1}/>
     
      </Group>
   
   );
   // <CrossHairs x={x} y={y} />
}

export function BoardItem(props){
   return (
   <div className="boardItem">
         <p>{props.title}</p>
         <p>{props.children}</p>
      </div>
   );
}




export function ScoreBoard(props){
   return (
      <div id="board">  
         <BoardItem title="Experience">{props.xp}</BoardItem>
         <BoardItem title="Health">{props.health}</BoardItem>
         <BoardItem title="Level">{props.level}</BoardItem>
         <BoardItem title="Weapon">{props.weapon}</BoardItem>
      </div>
   );
}



export function Enemy(props){
   const opacity=props.health>0 ? 1 : .5
  // console.log("Enemy", props)
   const orc= (<Circle x={props.x} y={props.y} radius={1} fill='red' stroke='black' strokeWidth={1} opacity={opacity}/>);
   const ant=(<Star x={props.x} y={props.y} fill='red' stroke='black' strokeWidth={1} opacity={opacity} numPoints={6} innerRadius={.5} outerRadius={1.5} scale={{x: .5, y: .5}}  />);
   
   if (props.name==="orc"){
      return orc;
   } else if (props.name==="ant"){
      return (<Group>{ant}</Group>);
   }
}


class Player extends React.Component {
   constructor(props){
      super(props);
      this.state={
        facing: "north"
      }
   }
   componentWillReceiveProps(nextProps){
     //console.log("Player receives props", nextProps)
     if (nextProps.direction!==this.state.facing && nextProps.direction!=="none"){
       this.setState({facing: nextProps.direction})
     }
   }
   shouldComponentUpdate(nextProps){
     return nextProps.direction!=="none"
   }
  render() {
    var x = this.props.XY[0], y = this.props.XY[1];
    var points, way=this.state.facing;

    points = (way === "north") ? [x, y, (x - 1), y, x, (y - 1), (x + 1), y] : 
    (way === "south") ? [x, y, (x - 1), y, x, y + 1, (x + 1), (y)] : 
    (way === "west") ? [x, y, x, (y - 1), x - 1, (y), x, (y + 1)] : 
    (way === "east" )? [x, y, x, (y - 1), x + 1, y, x, (y + 1)] :
     "error"
    
    return (<Group>
      <Line points={points} stroke='blue'
        strokeWidth={1} lineCap='round' lineJoin='round' dash={[0, 1, 5]} />
    </Group>);
  }//       <CrossHairs x={this.props.XY[0]} y={this.props.XY[1]}/>
}


function CrossHairs(props){
   var x=props.x, y=props.y;
   var crossHairs=[x,y,x-2,y,x+2,y,x,y,x,y-2,x,y+2];
   return (<Line stroke='black' strokeWidth={.5} points={crossHairs}/>)
}

function Item(props){
   if (props.type==="weapon"){
      return (<Weapon x={props.x} y={props.y} type={props.value}/>);
   } else {
    var color;
      if (props.type==="health"){color="green"}
      if (props.type==="awareness"){color="red"}
      return (<Line x={props.x} y={props.y} points={[0,0,0,-1,1,-1,1,0,2,1,-1,1,0,0]} strokeWidth={.5} scaleX={.7} stroke={color} />)
   }
}
class ItemContainer extends React.Component{
   render(){
      var items=this.props.items.map(item=><Item key={item.id} {...item} />);
   
      return  (<Group>{items}</Group>);
   }
}

class PlayMap extends React.Component{

   componentWillMount(){
    console.log("PlayMap Mount", this.props)
   }

   handleClick(e){
      //console.log("handleClick",e);
      //this.props.startBoard();
   }
   makeWindow(){
      var x=this.props.playerXY[0], y=this.props.playerXY[1], awareness=this.props.awareness;
      if (this.props.dark==="true"){
         return {
            x : (x-awareness),
            y : (y-awareness),
            width : awareness * 2,
            height : awareness * 2
         }
      } else {
         return {x: 0, y: 0, width: w, height: h}
      }
   }
      render (){ 
// must find a way to not render walls after first making them...
       const walls=this.props.walls.map((wall,index)=><MakeWall key={wall.id} {...wall}/>);
       const rooms=this.props.rooms.map((room,index)=><MakeRoom key={room.id} {...room}/>);
       var enemies = this.props.enemies.map((enemy) => <Enemy key={enemy.id} {...enemy} />);        

        /* Darkness is a constant layer for map beyond player 'awareness' */

        const Darkness = ()=> <Rect x={0} y={0} width={smallerSize} fill="black" height={h}/>

        /* PlayerVisionWindow component clips map and objects outside of player 'awareness' */
        const window=this.makeWindow();

   //     console.log("PlayMap renders", this.props)
        return (
          <Stage className="canvas" width={smallerSize} height={smallerSize} scale={{ x: scale, y: scale }} onClick={this.handleClick}>
            <Layer >
              <Darkness />
            </Layer>
              <Layer clipX={window.x} clipY={window.y} clipWidth={window.width} clipHeight={window.height}>
              <Rect x={window.x} y={window.y} width={window.width} fill="white" height={window.height} />
                <Player XY={this.props.playerXY} direction={this.props.direction} />
                <Group>
                  {walls}
                  {rooms}
                  <ItemContainer items={this.props.items}/>
                  {enemies} 
                </Group>
              </Layer>
          </Stage>);
      };
    }


export class App extends React.Component{
   constructor(props){
      super(props);
      this.state=({
         direction: "none",
         player: Board.stuff.player,
         x: 100,
         y: 100,
         gameMessage: "Welcome to the Dungeon!",
         walls: [],
         rooms: [],
         wallCheck: null,
         enemies: [],
         items: [],
         intervalID: null,
         dark: "true"
      })
      this.checkSpot=this.checkSpot.bind(this);
      this.onKeyDown=this.onKeyDown.bind(this);
      this.doFrame=this.doFrame.bind(this);
      this.togglePlay=this.togglePlay.bind(this);
      this.toggleDark=this.toggleDark.bind(this);
      this.startBoard=this.startBoard.bind(this);
   }
   componentWillMount(){
     this.newGame();
   }
   componentDidMount(){
      this.textInput.focus()
      console.log("APP didMount",this.state);
   }
   
   startBoard(){ //to trigger on tap...
      if (this.state.intervalID===null){
         Board.initialize(this.state.player.level);
      this.setState({
         gameMessage: null,
         walls: Board.map.walls,
         rooms: Board.map.rooms,
         enemies: Board.stuff.enemies,
         items: Board.stuff.mapItems,
         wallCheck: Board.wallCheck,
      });
      this.togglePlay();
      }
   }
   newGame(){
     Board.reset();
     this.setState({
       player: Board.stuff.player,
      x: 100,
      y: 100
    })
     this.startBoard();
   }
   togglePlay(e){
    //      console.log("togglePlay")
    if (this.state.intervalID===null){
      var intervalID=setInterval(() => this.doFrame()
      , frameLength)
      this.setState({  intervalID: intervalID  } );

      } else {
          clearInterval(this.state.intervalID);
       this.setState({intervalID: null});
    }
 }
   
   boardComplete(player,enemies){
    var calculateXP = function(){
         var boardXP=0;  //calculate XP for level...
         enemies.forEach(enemy=> boardXP+=Board.stuff.awardXP(enemy.name) );  
         return Math.round(boardXP);       
      }
      
      var checkLevel = function(xp){
         var nextLevelXP= Board.stuff.levelData[player.level+1]['xp'];
         var nextLevelHealth = Board.stuff.levelData[player.level+1]['health'];
         
         if (player.xp+xp>nextLevelXP){ 
            player.level=(player.level+1);
            player.health=(nextLevelHealth);
            return true; 
         }
          return false;
      } 

      var newXP=calculateXP();
      let newLevel=checkLevel(newXP);
      player.xp+=newXP;

     var message = "Board complete, " + newXP + "xp awarded.";

      message+= newLevel ? "You have acheived level " + player.level + "!" : ""

      console.log("boardComplete...")
      this.setState({
         gameMessage: message,
         player: player,
      });
   }
   checkSpot(x,y){  // returns wall, items and location of x,y coordinates...
      var wallCheck=this.state.wallCheck;
      if (Array.isArray( x ) )   {y=x[1] ; x=x[0]} //works with directionCoordinates array ([x,y])too!
      var wall, enemy, item; 
      if (wallCheck['row'+y]>maxHeight-1 || x>maxWidth){ // make sure things can't go out of range!
         return {wall: "wall"}
      }
      
      try {
         if (wallCheck['row'+y]){
            wallCheck['row'+y].indexOf(x)>-1 ?
               wall="wall":
            wall=""
         } else {
            wall="";
         } 
      }
      catch (e){console.log( x,y,e)}
      enemy = this.state.enemies.filter(function(e){
         return e.x === x && e.y === y })
      item = this.state.items.filter(function(e){ return e.x===x && e.y===y})
      return {wall: wall, enemy: enemy, item: item[0]};
   }

   
   toggleDark(){
      var toggle=this.state.dark;
      toggle==="true" ? toggle="false" : toggle="true" 
      this.setState({dark: toggle});
   }
  onKeyDown(e) {
    var keyCode = e.keyCode, command, direction;
    // console.log("onKeyDown keyCode", e.keyCode)
    if (this.state.intervalID === null) {
      if (this.state.gameMessage !==null) {
        this.startBoard();
      } else {
        this.togglePlay();
      }
    } else {

      keyCode === 40 || keyCode === 98 ? direction = "south" : 
      keyCode === 38 || keyCode === 104 ? direction = "north" : 
      keyCode === 37 || keyCode === 100 ? direction = "west" : 
      keyCode === 39 || keyCode === 102 ? direction = "east" : 
      keyCode === 80 ? command = "pause" // the "p" key
                  : direction="none" ;

      if (command) {
        if (command === "pause") {
          this.togglePlay()
        }
      } else {
        this.setState({ direction: direction })
      }
    }
   }
   
  doFrame() {
    // this function triggers all gameplay calculations.
    //...It gets called by this.startBoard(), and also by this.togglePlay();
    //  It calculates one frame by passing current data to  calculatePlayer and calculateEnemies 
    let x = this.state.x, y = this.state.y,
      player = this.state.player,
      enemies = this.state.enemies,
      items = this.state.items;

    // calculate player(including updating enemy health);

    var obj = this.calculatePlayer(x, y, player, enemies, items)

    // calculate enemy position, attack and total dead enemies, plus player health... 

    var eObj = this.calculateEnemies(obj.x, obj.y, obj.player, obj.enemies)

    if (eObj.player.health < 1) {                   // If player is dead! 
      this.togglePlay();
      this.setState({ gameMessage: "GAME OVER" })

    } else {                                        // otherwise update state.
      this.setState({
        x: obj.x, y: obj.y,
        player: eObj.player, enemies: eObj.enemies, items: obj.items
      })
    }
  }

   enemyMove(x,y,direction){ //ensures no collisions!
     // console.log("enemyMove", direction)
      var here=directionCoordinates(x, y, direction);
      var lastCheck=this.checkSpot(here);
      while(lastCheck.wall==="wall" || lastCheck.enemy.length>0){
         direction=randomDirection();
         here=directionCoordinates(x, y, direction);
         lastCheck=this.checkSpot(here);
      }  // return final coordinates to calculateEnemies.
      return {x: here[0], y: here[1], direction: direction}
   } 

   calculateEnemies(playerX,playerY, player, enemies){ //enemy move and attack calculations.  
      var deadEnemies=0;

      enemies.forEach(enemy=>{
         var health=enemy.health, frame=enemy.frame, damage=enemy.damage, x=enemy.x, y=enemy.y, direction=enemy.direction, speed=enemy.speed, attackSpeed=enemy.attackSpeed;
         
         if (health<1){  // check for life! 
            deadEnemies++;
            if (deadEnemies===enemies.length){ // if all dead enemies, boardComplete!
               this.togglePlay();
               this.boardComplete(player, enemies);
               return;
            } 
         } else {
            frame++;
            
            var newDirection;
            var xDistance=playerX-x, yDistance=playerY-y;
            var furtherDistance=Math.max(
               Math.abs(xDistance),Math.abs(yDistance));
            
            if (furtherDistance <= 1 && frame>attackSpeed){// attack if possible.
               player.health-=damage;
                  frame=0;
            }
           
            if (frame>=speed){             /// move if possible.
               var move;
               var aware=(enemy.awareness>=furtherDistance);
               
               if (aware){    
                  var directionX, directionY;
                  xDistance>0 ? directionX = "east" : directionX =  "west"
                  yDistance>0 ? directionY = "south" : directionY =  "north"
                  if (xDistance===0){directionX=directionY}// close in...
                  if (yDistance===0){directionY=directionX}
                  newDirection=doOdds(1,1, directionX, directionY)
                  move=this.enemyMove(x,y,newDirection);
                  
               } else {   // wander, favor current direction;
                  newDirection=doOdds(4,1, direction, randomDirection());
                  move=this.enemyMove(x,y,newDirection);
               }     
               frame=0;
               enemy.direction=move.direction;
               enemy.x=move.x;
               enemy.y=move.y;
            }
         }
         enemy.frame=frame;    
      }) 
      return({enemies: enemies, player: player})
   }
   
   calculatePlayer(x,y,player,enemies,items){
      var playerDamage=Board.stuff.weapons[player.weapon];
      var direction=this.state.direction;
      var attack=function(enemy){
         enemy.health-=playerDamage;
         console.log("Enemy hit!, new health", enemy.health, player.health)
         return enemy;
      } 

      var getItem = function(item){
         x=ahead[0]; y=ahead[1];
         if (item.type==="awareness"){
            player.awareness+=item.value;       
         }
         if (item.type==="weapon"){
            player.weapon=item.value;           
         }
         if (item.type==="health"){  //consume it only (if needed.)
            var maxHealth=Board.stuff.levelData[player.level]['health']
            if (player.health===maxHealth){
               return items;
            } else {      
               player.health=Math.min(maxHealth, (player.health+item.value))
            }
         }
         // all other cases remove item and update items...
         items=items.filter((e)=>e.id!==item.id); 
         console.log("item removed", item.id, "items remain,",items);
         return items;
      }

      // start!
      player.frame++;
      if (player.frame>=player.speed && direction!=="none"){ //only attack(or move) if moving...
         var ahead = directionCoordinates(x,y,direction);
         var checkAhead=this.checkSpot(ahead);
         
         // console.log(ahead, checkAhead, x, y, direction,player.frame);

         if (checkAhead.item!==undefined){  // encounter object
            console.log("encounterItem");
            items=getItem(checkAhead.item);// returns updated items

         } else if (checkAhead.enemy.length===1 ){ // if hit enemy...
            attack(checkAhead.enemy[0])
            //console.log("encounter Enemy",  checkAhead.enemy[0].id, enemies);

         } else if (checkAhead.wall!=="wall"){// if not a wall
            x=ahead[0];
            y=ahead[1];
         }

         ahead=directionCoordinates(x,y,direction);  //2nd attack check after move!
         checkAhead=this.checkSpot(ahead);
         if (checkAhead.enemy.length===1 ){
            attack(checkAhead.enemy[0]);
         }
         player.frame=0;
      }
      //   console.log("Player Calculated", x,y,direction,player,enemies)
      return {x: x, y: y, direction: direction, player: player, enemies: enemies, items: items}
   }

   render(){


         return (
            <div id="game" tabIndex="1" ref={(input) => { this.textInput = input; }} onKeyDown={this.onKeyDown}
              style={{width: smallerSize, height: smallerSize}}>

               <GameMessage text={this.state.gameMessage} />

               <ScoreBoard xp={this.state.player.xp} level={this.state.player.level} health={this.state.player.health} weapon={this.state.player.weapon}/>
               
               <PlayMap enemies={this.state.enemies} items={this.state.items} walls={this.state.walls} dark={this.state.dark} playerXY={[this.state.x,this.state.y]} 
               rooms={this.state.rooms} direction={this.state.direction} awareness={this.state.player.awareness} />
               <input type="button" value="toggle Darkness" onClick={this.toggleDark}/>
            </div>
         );
   };
}
