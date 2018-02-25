import React from "react";
import ReactKonva from "react-konva";
import Board from "./board";

const maxWidth=200, maxHeight=200;
const { Line, Group, Text} = ReactKonva; 



// scale... we need to scale player board 200*200 to a canvas
// start by determining viewPort

var w = .98* Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = .92* Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//subtract size of BoardItems & ToggleDarkness
const debug=true;

var smallerSize = w < h ? w : h;
var scale=smallerSize/maxWidth;
                                

export function MakeRoom(props) {
    //console.log("MakeRoom", props);
    const fontSize= props.width > props.height ? props.height : props.width;
    const text = props.roomID.toString(10);
    const yAxis = props.width > props.height ?props.startXY[1] + ( props.height - fontSize ) / 2 
        : props.startXY[1];
    if (debug) {
        return (<Text x={props.startXY[0]} y={yAxis} width={props.width} text={text} fill='blue' align='center'
            fontSize={fontSize} fontStyle="bold" opacity={0.1}/>);
    }
    return null;
}

export class MakeWall extends React.Component {
    constructor(props){
        super(props);
        this.state={dash: null,
            points: null,
            rotation: null};
    }
    componentWillMount(){
        // create 'dash' array to show wall entrances...
        var end, entranceWidth=Board.map.entranceWidth;
        let startXY=this.props.startXY, endXY;
        var rotation=0, textX, textY;
        var dash;
 
        if (this.props.wall==="north" || this.props.wall==="south"){
            end=this.props.width;  
            endXY = [ startXY[0]+ this.props.width, startXY[1] ];
            textX = startXY[0];
            textY = startXY[1];

        } else {
            end=this.props.height;
            endXY = [ startXY[0], startXY[1]+this.props.height ];
            textX = startXY[0];
            textY = startXY[1] + .3 * this.props.height;
            rotation = 90;
        }
        dash = [];
        let pointer = 0;
        if (this.props.entrances.length > 0) {
            this.props.entrances.forEach(
                (entrance) => {
                    dash.push(entrance - pointer);
                    dash.push(entranceWidth);
                    pointer = entrance + entranceWidth;
                });
        }
        dash.push(end - pointer);

        let points=[startXY[0], startXY[1], endXY[0], endXY[1]];

        this.setState({
            points: points,
            dash: dash,
            rotation: rotation
        });
    }
    shouldComponentUpdate(nextProps,nextState){
        return !nextState.points!=null;
    }

    //will receive startXY, "wall", and entrance array...
    render(){
        let debug=false;
        var color="red", strokeWidth=.5;
        let labels;
        if (debug) {
            labels = (<Text x={this.props.startXY[0]} y={this.props.startXY[1]} text={this.props.id} fill='green'
                fontSize={10} rotation={this.state.rotation} />);
        }
    

        return (<Group>
            <Line points={this.state.points} dash={this.state.dash} stroke={color} strokeWidth={strokeWidth}
                lineCap='round' lineJoin='round' />
            {labels}
        </Group>);
    }
}
