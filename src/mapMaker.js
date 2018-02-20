import React, { Component } from 'react';
import ReactKonva from 'react-konva';
import Board from './board'

const maxWidth=200, maxHeight=200;
const {Layer, Rect, Line, Stage, Group, Text} = ReactKonva; 


// scale... we need to scale player board 200*200 to a canvas
// start by determining viewPort

var w = .98* Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = .92* Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//subtract size of BoardItems & ToggleDarkness
const debug=true;
var biggerSize = w > h ? w : h 
var smallerSize = w < h ? w : h
var scale=smallerSize/maxWidth;

console.log("Mapmaker has loaded Board... ", Board);

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


export class MakeWall extends React.Component {
    constructor(props){
        super(props);
        this.state={dash: null};
    }
    componentWillMount(){
        // create 'dash' array to show wall entrances...
        var end, entranceWidth=Board.map.entranceWidth;
        let startXY=this.props.startXY, endXY;
        var rotation=0, textX, textY;
        var dash;
 
          if (this.props.wall==="north" || this.props.wall==="south"){
            end=this.props.width  
            endXY = [ startXY[0]+ this.props.width, startXY[1] ]
            textX = startXY[0]
            textY = startXY[1]

        } else {
            end=this.props.height
            endXY = [ startXY[0], startXY[1]+this.props.height ]
            textX = startXY[0]
            textY = startXY[1] + .3 * this.props.height;
            rotation = 90;
        }
        dash = [];
        let pointer = 0;
        if (this.props.entrances.length > 0) {
            this.props.entrances.forEach(
                (entrance) => {
                    dash.push(entrance - pointer)
                    dash.push(entranceWidth)
                    pointer = entrance + entranceWidth;
                })
        }
        dash.push(end - pointer);

        let points=[startXY[0], startXY[1], endXY[0], endXY[1]];

        this.setState({
            points: points,
            dash: dash,
            rotation: rotation
        })
        console.log("MakeWall",this.props, "dash", dash, this.props.id)

    }
   //will receive startXY, "wall", and entrance array...
render(){
    let debug=false;
    var color="red", strokeWidth=.5;
    let labels;
    if (debug) {
        labels = (<Text x={this.props.startXY[0]} y={this.props.startXY[1]} text={this.props.id} fill='green'
        fontSize={10} rotation={this.state.rotation} />)
    }
    

      return (<Group>
          <Line points={this.state.points} dash={this.state.dash} stroke={color} strokeWidth={strokeWidth}
         lineCap='round' lineJoin='round' />
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





