import React, { Component } from 'react';
import ReactKonva from 'react-konva';
import Board from './board'
const debug=true;
const maxWidth=200, maxHeight=200;
const {Layer, Rect, Line, Circle, Star, Stage, Group, Text} = ReactKonva; 


// scale... we need to scale player board 200*200 to a canvas
// start by determining viewPort

var w = .98* Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = .92* Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//subtract size of BoardItems & ToggleDarkness

var biggerSize = w > h ? w : h 
var smallerSize = w < h ? w : h
var scale=smallerSize/maxWidth;

console.log("Mapmaker has loaded Board... ", Board);

export function ArbitraryLine(props){ // takes startXY and endXY coordinate pairs([x,y])
   // and entrances (xy referenced.) which utilizes dash function to present 'open' entrances.)
   var color, strokeWidth;
   props.color ? color=props.color : color="red"
   props.strokeWidth ? strokeWidth=props.strokeWidth : strokeWidth="1"
   var points=[props.startXY[0],props.startXY[1],props.endXY[0],props.endXY[1]]
   //console.log(points)
   return (
      <Line points={points} stroke={color} strokeWidth={strokeWidth}
         lineCap='round' lineJoin='round' dash={props.dash} />
         
   );
}
export function MakeRoom(props) {
  //  console.log("MakeRoom", props);
    let textX = props.startXY[0], labels, fontSize, textY;
    props.width > props.height ? fontSize=props.height : fontSize=props.width
    fontSize<props.height ?
        textY = props.startXY[1] + ( props.height - fontSize ) / 2 
      : textY = props.startXY[1]
    if (debug === true) {
        labels = (<Text x={textX} y={textY} width={props.width} 
            text={props.roomID.toString(10)} fill='blue' align='center'
            fontSize={fontSize} fontStyle="bold" opacity={.1}/>);
    }
    return (<Group>
        {labels}
    </Group>);

}
export function MakeRect(props){  //draws wall with entrance... 
   //requires startXY and (height or width)  
   var endXY;
  //  console.log("makeRect",props)
   props.height ? endXY=[props.startXY[0],props.startXY[1]+props.height] 
   : endXY=[props.startXY[0]+props.width, props.startXY[1]]

   return (
       <ArbitraryLine startXY={props.startXY} endXY={endXY} dash={props.dash} />
   );
}


export class MakeWall extends React.Component {

   //will receive startXY, "wall", and entrance array...

   render(){
      var end, entranceWidth=Board.map.entranceWidth;
      let startXY=this.props.startXY, labels;
      var rotation=0, textX, textY;

      if (this.props.wall==="north" || this.props.wall==="south"){
        end=this.props.width;
        textX=startXY[0]
        textY=startXY[1]
        
      } else {
        end= this.props.height
        textX=startXY[0]
        textY=startXY[1]+.3*this.props.height;
        rotation=90;
      }
  
       var dash = [], pointer = 0;
       if (this.props.entrances.length > 0) {
           this.props.entrances.forEach(
               (entrance) => {
                   dash.push(entrance - pointer)
                   dash.push(entranceWidth)
                   pointer = entrance + entranceWidth;
               })
       }
       dash.push(end - pointer);
       //console.log(this.props, "dash", dash, this.props.id)


       if (debug === true) {
           labels = (<Text x={textX} y={textY} text={this.props.id} fill='green'
               fontSize={10} rotation={rotation} />)
       }
    

      return (<Group>
          <MakeRect startXY={this.props.startXY} wall={this.props.wall} 
        width={this.props.width} height={this.props.height} dash={dash} />
            {labels}
        </Group>);
   }
}


                             
export class ShowMap extends Component{
   constructor(props){
      super(props);   
      this.state={walls: [], rooms: []}
      this.handleClick=this.handleClick.bind(this);
   }
   handleClick(e){   
      console.log("updated")
      Board.initialize(1);
      this.setState({walls: Board.map.walls,
                     rooms: Board.map.rooms})
      console.log(e.evt.offsetX, e.evt.offsetY, e.evt.offsetX/scale, e.evt.offsetY/scale);
   }
   render (){ 
      var walls=this.state.walls.map((wall,index)=><MakeWall key={wall.id} {...wall}/>);
      var rooms=this.state.rooms.map((room,index)=><MakeRoom key={room.id} {...room}/>);                   
      return (       
         <Stage width={w} height={h} scale={{x: scale, y: scale}} onClick={this.handleClick}>
            <Layer>
               <Rect width={maxWidth} height={maxHeight} fill="gray"/>
            {walls}
            {rooms}
            </Layer>
         </Stage>  );
   } //
}





