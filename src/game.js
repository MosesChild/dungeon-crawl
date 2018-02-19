import React from 'react'
import ReactKonva from 'react-konva';
import Board from './board'
import {MakeWall} from './mapMaker'
import {randomDirection, doOdds} from './firstModule';

var framesPerSecond=30, frameLength=1000/framesPerSecond;
const {Layer, Rect, Line, Circle, Star, Stage, Group} = ReactKonva; 

const maxWidth=200, maxHeight=200;
var warning=[]


// scale... we need to scale player board 200*200 to a canvas
// start by determining viewPort

var w = .98* Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = .92* Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//subtract size of BoardItems & ToggleDarkness

var biggerSize = w > h ? w : h 
var smallerSize = w < h ? w : h
var scale=smallerSize/maxWidth;


var directionCoordinates=function(x,y,direction, optionalDistance){
    if (optionalDistance===undefined){ optionalDistance = 1;  } 
  //  console.log("optionalDistance",optionalDistance)
 //  console.log("directionCoordinates received,",arguments) 
    direction==="north" ? y = Math.max((y-optionalDistance),0)
    : direction==="south" ? y = Math.min((y+optionalDistance), maxHeight)
    : direction==="west" ? x = Math.max((x-optionalDistance),0)
    :                     x = Math.min((x+optionalDistance),maxWidth)
  //console.log("directionCoordinate update", x,y)
    return [x,y,direction]
 }

export function GameMessage(props){
   
   if (props.text==null){
      return (<div></div>);
   } else {
      return (<div className="GameMessage">
         <h1>{props.text}</h1>
            </div>);
   }
}
function Darkness(props){
   var fill, dark=props.dark;
   dark=="true"? fill="black" : fill="white"
      return <Rect width={props.side} height={props.side} fill={"black"}/>
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
      <div>  
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
   
   if (props.name=="orc"){
      return orc;
   } else if (props.name=="ant"){
      return (<Group>{ant}</Group>);
   }
}
 
//<CrossHairs x={props.x} y={props.y}/>

class Player extends React.Component {
   constructor(props){
      super(props);
   }
   componentDidUpdate(){
   }
   render(){
      var x=this.props.XY[0], y=this.props.XY[1];
      var points, offsetX, offsetY;
      offsetX=offsetY=0;   
      const way=this.props.direction;  

      way=="north" ? (points=[x,y,(x-1),y,x,(y-1),(x+1),y], offsetY=0)
      : way=="south" ? (points=[x,y,(x-1),y,x,y+1,(x+1),(y)], offsetY=0)
      : way=="west" ? (points=[x,y,x,(y-1),x-1,(y), x,(y+1)], offsetX=0)
      : (points=[x,y,x,(y-1),x+1,y, x,(y+1)], offsetX=0)

      return (<Group>
            <Line points={points}  stroke='blue' offsetX={offsetX} offsetY={offsetY}
                strokeWidth={1} lineCap='round' lineJoin='round' dash={[0 ,1,5]} />
             
            </Group>);
   }
}
function CrossHairs(props){
   var x=props.x, y=props.y;
   var crossHairs=[x,y,x-2,y,x+2,y,x,y,x,y-2,x,y+2];
   return (<Line stroke='black' strokeWidth={.5} points={crossHairs}/>)
}

function Item(props){
   if (props.type=="weapon"){
      return (<Weapon x={props.x} y={props.y} type={props.value}/>);
   } else {
      if (props.type=="health"){var stroke="green"}
      if (props.type=="awareness"){var stroke="red"}
      return (<Line x={props.x} y={props.y} points={[0,0,0,-1,1,-1,1,0,2,1,-1,1,0,0]} strokeWidth={.5} scaleX={.7} stroke={stroke} />)
   }
}
class ItemContainer extends React.Component{
   constructor(props){
      super(props);
   }
   render(){
      var items=this.props.items.map(item=><Item key={item.id} {...item} />);
   
      return  (<Group>{items}</Group>);
   }
}


class PlayMap extends React.Component{
   constructor(props){
      super(props);   
      this.state={
         side: 1078,
         scale: 1
      };
      this.handleClick=this.handleClick.bind(this);
   }

   /**
   * Calculate & Update state of new dimensions
   */
   updateDimensions() {
      let update_width  =Math.round(.98* Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
      let update_height =Math.round(.92* Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
      let side = update_width < update_height ? update_width : update_height 
      let scale=side/Board.maxWidth;
      this.setState({ side: side, scale: scale});
   }
     /**
   * Add event listener
   */
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  /**
   * Remove event listener
   */
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }
   handleClick(e){
      console.log("handleClick",e);
      this.props.startBoard();
   }
   makeWindow(){
      var x=this.props.playerXY[0], y=this.props.playerXY[1], awareness=this.props.awareness;
      if (this.props.dark=="true"){
         return {
            x : (x-awareness),
            y : (y-awareness),
            width : awareness * 2,
            height : awareness * 2
         }
      } else {
         return {x: 0, y: 0, width: this.state.side, height: this.state.side}
      }
   }

      render (){ 

         var items=this.props.items.map(item=><Item key={item.id} {...item} />);
         var reactWalls=this.props.walls.map(wall=><MakeWall key={wall.id} wall={wall.wall} startXY={wall.startXY} width={wall.width} height={wall.height} entrances={wall.entrances}/>);   

         return (       
            <Stage className="canvas" width={this.state.side} height={this.state.side} onClick={this.handleClick}>
               <Layer>
                  <Darkness dark={this.props.dark} side={this.state.side}  />
               </Layer>
               <Layer scaleX={this.state.scale} scaleY={this.state.scale} clip={this.makeWindow()} >
               <Rect x={0} y={0} width={this.state.side} fill="white" height={this.state.side}  />
                  <Player XY={this.props.playerXY} direction={this.props.direction}/>
                  <Group>
                     {reactWalls}
                     {items}
                   {this.props.enemies.map((enemy)=><Enemy key={enemy.id} {...enemy}/>)}
                  </Group>
               </Layer>
            </Stage>);
      };
   }
  

export class App extends React.Component{
   constructor(props){
      super(props);
      this.state=({
         direction: "south",
         player: Board.stuff.player,
         x: 100,
         y: 100,
         walls: Board.map.walls,
         wallCheck: Board.wallCheck,
         enemies: Board.stuff.enemies,
         items: Board.stuff.mapItems,
         goFrame: "true",
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
      Board.initialize();
   }
   componentDidMount(){
      console.log("APP didMount",this.state);
      var c=this.state;
      localStorage.setItem("direction", c.direction);
      localStorage.setItem("move", "false");
      this.setState({wallCheck: Board.wallCheck})
      this.doFrame(100, 100, "north", c.player, c.enemies, c.items, "true")
   }
   
   startBoard(){ //to trigger on tap...
      this.nameInput.focus();
      if (this.state.goFrame=="false"){
         Board.initialize(this.state.player.level);
      this.setState({
         gameMessage: null,
         walls: Board.map.walls,
         enemies: Board.stuff.enemies,
         items: Board.stuff.mapItems,
         wallCheck: Board.wallCheck,
         goFrame: "true"
      })
      var c=this.state; 
      this.doFrame(100, 100, "north", c.player, c.enemies, c.items, "true");
      }
   }
 
   componentDidUpdate(){
      this.nameInput.focus();      
   }
   
   boardComplete(player,enemies){
    var calculateXP = function(){
         var boardXP=0;  //calculate XP for level...

         enemies.forEach(enemy=> boardXP+=Board.stuff.awardXP(enemy.name) );  
                 
         return Math.round(boardXP);       
      }
      
      var levelUp = function(xp){
         var nextLevelXP= Board.stuff.levelData[player.level+1]['xp'];
         var nextLevelHealth = Board.stuff.levelData[player.level+1]['health'];
         
         if (player.xp+xp>nextLevelXP){ 
            player.level=(player.level+1);
            player.health=(nextLevelHealth);
            return true; 
         } else {
            return false}; 
      } 
      
      var newXP=calculateXP();
      
      player.xp+=newXP
      
      var message="Board complete, "+ newXP +"xp awarded.";  
      levelUp(newXP) ? message+="You have acheived level "+ player.level+"!"
         : message=message

      console.log("boardComplete...")
      this.setState({
         gameMessage: message,
         player: player,
         goFrame: "false"
      });
   }
   checkSpot(x,y){  // returns wall, items and location of x,y coordinates...
      var wallCheck=this.state.wallCheck;
      if (Array.isArray(x)){y=x[1] ; x=x[0]} //works with directionCoordinates too!
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
         return e.x == x && e.y==y})
      item = this.state.items.filter(function(e){ return e.x==x && e.y==y})
      return {wall: wall, enemy: enemy, item: item[0]};
   }

   togglePlay(){
      var toggle=this.state.goFrame;
      toggle=="true" ? toggle="false" : toggle="true" 
      this.setState({goFrame: toggle})
      console.log("toggle", toggle)
      if (toggle=="true"){
         var obj=this.state;
          setTimeout(() => {this.doFrame(obj.x, obj.y, obj.direction, obj.player, obj.enemies,"true")}, frameLength)
      }
   }
   
   toggleDark(){
      var toggle=this.state.dark;
      toggle=="true" ? toggle="false" : toggle="true" 
      this.setState({dark: toggle});
   }
   onKeyDown(e){
      var keyCode=e.keyCode, command, direction, move="true";
      console.log("onKeyDown", e.keyCode)
      keyCode=="40"|| keyCode=="98"  ? direction = "south"
      : keyCode=="38"|| keyCode=="104" ? direction = "north"
      : keyCode=="37"|| keyCode=="100" ? direction = "west"
      : keyCode=="39"|| keyCode=="102" ? direction = "east" 
      : keyCode=="80" ? command="pause" // the "p" key
      : (direction=localStorage.getItem("direction"), move="false")
      
      if (command!=undefined){
         if (command=="pause"){
            this.togglePlay()
         }
      } else {
         localStorage.setItem("direction",direction);
         localStorage.setItem("move", move);
         this.setState({direction: direction, move: move})
      }
   }
   
   doFrame(x,y, direction, player, enemies, items, start){
      // this function triggers all gameplay calculations.
      //...It gets called by this.startBoard(), and also by this.togglePlay();  
      // and of course calls itself every frameLength (until end of board or togglePlay.)  
      //  It  passes the most current data through calculatePlayer and calculateEnemies 
      // until the end of doFrame where it does one setState and re-calls itself.
      
      // calculate player(including updating enemy health);
      var obj=this.calculatePlayer(x, y, direction,player,enemies, items)
 
      // calculate enemy moves... calculateEnemies(position) calculate player Health
      var eObj=this.calculateEnemies(obj.x, obj.y, obj.player, obj.enemies)
      
      if (eObj.player.health<1){
         this.setState({gameMessage: "GAME OVER"})
         
      } else { 
         // Passed to setState at each frame (so that react components update.)
         this.setState({x: obj.x, y: obj.y, direction: direction, move: obj.move,
                        player: eObj.player, enemies: eObj.enemies, items: obj.items})

         //finally,the doFrame recursively calls itself, passing the variables to the next frame...
         if (this.state.goFrame=="true" || start=="true"){
            setTimeout(() => {this.doFrame(obj.x, obj.y, obj.direction,
                                           eObj.player, eObj.enemies,obj.items)}, frameLength)
         }
      }
   }
   enemyMove(x,y,direction){ //ensures no collisions!
     // console.log("enemyMove", direction)
      var here=directionCoordinates(x, y, direction);
      var lastCheck=this.checkSpot(here);
      while(lastCheck.wall=="wall" || lastCheck.enemy.length>0){
         direction=randomDirection();
         here=directionCoordinates(x, y, direction);
         lastCheck=this.checkSpot(here);
      }  // return final coordinates to calculateEnemies.
      return {x: here[0], y: here[1], direction: direction}
   }
      
      
   calculateEnemies(playerX,playerY, player, enemies){ //enemy move and attack calculations.  
      var deadEnemies=0;

      enemies.map(enemy=>{
         var health=enemy.health, frame=enemy.frame, damage=enemy.damage, x=enemy.x, y=enemy.y, direction=enemy.direction, speed=enemy.speed, attackSpeed=enemy.attackSpeed;
         
         if (health<1){  // check for life! 
            deadEnemies++;
            if (deadEnemies==enemies.length){ // check for all dead enemies!
               this.boardComplete(player, enemies);
            } 
         } else {
            frame++;
            
            var checkAhead, newDirection, newLocation;
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
                  if (xDistance==0){directionX=directionY}// close in...
                  if (yDistance==0){directionY=directionX}
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
   
   calculatePlayer(x,y,direction,player,enemies,items){
      var checkAhead, enemy;
      var playerDamage=Board.stuff.weapons[player.weapon];
      var move=localStorage.getItem("move");
      var attack=function(enemy){
         enemy.health-=playerDamage;
         console.log("Enemy hit!, new health", enemy.health, player.health)
         return enemy;
      } 

      var getItem = function(item){
         x=ahead[0]; y=ahead[1];
         if (item.type=="awareness"){
            player.awareness+=item.value;       
         }
         if (item.type=="weapon"){
            player.weapon=item.value;           
         }
         if (item.type=="health"){  //consume it only (if needed.)
            var maxHealth=Board.stuff.levelData[player.level]['health']
            if (player.health==maxHealth){
               return items;
            } else {      
               player.health=Math.min(maxHealth, (player.health+item.value))
            }
         }
         // all other cases remove item and update items...
         items=items.filter((e)=>e.id!=item.id); 
         console.log("item removed", item.id, "items remain,",items);
         return items;
      }

      // start!
      player.frame++;
      if (player.frame>=player.speed && move=="true"){ //only attack(or move) if moving...
         var ahead = directionCoordinates(x,y,direction);
         checkAhead=this.checkSpot(ahead);
         // console.log(ahead, checkAhead, x, y, direction,player.frame);

         if (checkAhead.item!=undefined){  // encounter object
            console.log("encounterItem");
            items=getItem(checkAhead.item);// returns updated items

         } else if (checkAhead.enemy.length===1 ){ // if hit enemy...
            enemy=attack(checkAhead.enemy[0])
            //console.log("encounter Enemy",  checkAhead.enemy[0].id, enemies);

         } else if (checkAhead.wall!="wall"){// if not a wall
            x=ahead[0];
            y=ahead[1];
         }
         ahead=directionCoordinates(x,y,direction);  //2nd attack check after move!
         checkAhead=this.checkSpot(ahead);
         if (checkAhead.enemy.length===1 ){
            enemy=attack(checkAhead.enemy[0])
         }
         player.frame=0;
      }
      //   console.log("Player Calculated", x,y,direction,move,player,enemies)
      return {x: x, y: y, direction: direction, move: move, player: player, enemies: enemies, items: items}
   }

   render(){


         return (
            <div onKeyDown={this.onKeyDown} style={{width: smallerSize, height: smallerSize}}>
               <GameMessage text={this.state.gameMessage} />
               <ScoreBoard xp={this.state.player.xp} level={this.state.player.level} health={this.state.player.health} weapon={this.state.player.weapon}/>
               <PlayMap enemies={this.state.enemies} items={this.state.items} walls={this.state.walls} wallCheck={this.state.wallCheck} dark={this.state.dark} playerXY={[this.state.x,this.state.y]} direction={this.state.direction} awareness={this.state.player.awareness} startBoard={this.startBoard}/>
               <input type="text" ref={(input) => {this.nameInput = input; }} 
                  value="" />
               <input type="button" value="toggle Darkness" onClick={this.toggleDark}/>
            </div>
         );
   };
}
