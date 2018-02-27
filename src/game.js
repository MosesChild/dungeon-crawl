import React, {Component} from "react";
import ReactKonva from "react-konva";
import environmentVars from "./environmentVars"

import {MakeWall, MakeRoom} from "./mapMaker"

const { Layer, Rect, Line, Circle, Star, Stage, Group } = ReactKonva;


export class GameMessage extends Component {
    state = { reminder: "" };

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.text !== this.props.text || nextState !== this.state;
    }
    componentWillReceiveProps() {
        const reminder =
            this.props.text === "GAME OVER"
                ? "Press any key to Restart"
                : "Press any key to continue";
        if (this.props.text !== null) {
            setTimeout(() => this.setState({ reminder: reminder }), 3000);
        } else {
            this.setState({ reminder: "" });
        }
    }
    render() {
        if (this.props.text) {
            return (
                <div className="GameMessage">
                    <h1>{this.props.text}</h1>
                    <p> {this.state.reminder} </p>
                </div>
            );
        }
        return null;
    }
}

function Weapon(props) {
    var x = props.x,
        y = props.y;
    var points = [
        x,
        y,
        x + 3.5,
        y + 3.5,
        x + 1,
        y + 1,
        x + 0.5,
        y + 1.5,
        x + 1.5,
        y + 0.5
    ];
    return (
        <Group>
            <Line
                points={points}
                stroke={"orange"}
                strokeWidth={1}
                offsetX={1}
                offsetY={1}
            />
            <Line
                points={points}
                stroke={"black"}
                strokeWidth={0.2}
                offsetX={1}
                offsetY={1}
            />
        </Group>
    );
}

export function BoardItem(props) {
    return (
        <div className="boardItem">
            <p>{props.title}</p>
            <p>{props.children}</p>
        </div>
    );
}

export function ScoreBoard(props) {
    return (
        <div id="board">
            <BoardItem title="Experience">{props.xp}</BoardItem>
            <BoardItem title="Health">{props.health}</BoardItem>
            <BoardItem title="Level">{props.level}</BoardItem>
            <BoardItem title="Weapon">{props.weapon}</BoardItem>
        </div>
    );
}

export function Enemy(props) {
    const opacity = props.health > 0 ? 1 : 0.5;
    // console.log("Enemy", props)
    const orc = (
        <Circle
            x={props.x}
            y={props.y}
            radius={1}
            fill="red"
            stroke="black"
            strokeWidth={1}
            opacity={opacity}
        />
    );
    const ant = (
        <Star
            x={props.x}
            y={props.y}
            fill="red"
            stroke="black"
            strokeWidth={1}
            opacity={opacity}
            numPoints={6}
            innerRadius={0.5}
            outerRadius={1.5}
            scale={{ x: 0.5, y: 0.5 }}
        />
    );

    if (props.name === "orc") {
        return orc;
    } else if (props.name === "ant") {
        return <Group>{ant}</Group>;
    }
}

class Player extends Component {
    state = { facing: "north" };

    componentWillReceiveProps(nextProps) {
        //console.log("Player receives props", nextProps)
        if (
            nextProps.direction !== this.state.facing &&
            nextProps.direction !== "none"
        ) {
            this.setState({ facing: nextProps.direction });
        }
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.direction !== "none";
    }
    render() {
        var x = this.props.XY[0],
            y = this.props.XY[1];
        var points,
            way = this.state.facing;

        points =
            way === "north"
                ? [x, y, x - 1, y, x, y - 1, x + 1, y]
                : way === "south"
                  ? [x, y, x - 1, y, x, y + 1, x + 1, y]
                  : way === "west"
                    ? [x, y, x, y - 1, x - 1, y, x, y + 1]
                    : [x, y, x, y - 1, x + 1, y, x, y + 1]; /* way === "east" */

        return (
            <Group>
                <Line
                    points={points}
                    stroke="blue"
                    strokeWidth={1}
                    lineCap="round"
                    lineJoin="round"
                    dash={[0, 1, 5]}
                />
            </Group>
        );
    } //       <CrossHairs x={this.props.XY[0]} y={this.props.XY[1]}/>
}

function CrossHairs(props) {
    var x = props.x,
        y = props.y;
    var crossHairs = [x, y, x - 2, y, x + 2, y, x, y, x, y - 2, x, y + 2];
    return <Line stroke="black" strokeWidth={0.5} points={crossHairs} />;
}

function Item(props) {
    if (props.type === "weapon") {
        return <Weapon x={props.x} y={props.y} type={props.value} />;
    } else {
        var color;
        if (props.type === "health") {
            color = "green";
        }
        if (props.type === "awareness") {
            color = "red";
        }
        return (
            <Line
                x={props.x}
                y={props.y}
                points={[0, 0, 0, -1, 1, -1, 1, 0, 2, 1, -1, 1, 0, 0]}
                strokeWidth={0.5}
                scaleX={0.7}
                stroke={color}
            />
        );
    }
}
class ItemContainer extends Component {
    render() {
        var items = this.props.items.map(item => (
            <Item key={item.id} {...item} />
        ));

        return <Group>{items}</Group>;
    }
}

export class PlayMap extends Component {
    state = { opacity: 0}
    componentWillMount() {
        console.log("PlayMap Mount", this.props);
    }
    fade(direction){
      var opacity;
      for (let i=0; i<1000; i++){
        this.setState({ opacity : direction==="in" ? i : 1000-i })
      }
    }

    makeWindow() {
        var x = this.props.playerXY[0],
            y = this.props.playerXY[1],
            awareness = this.props.awareness;
        if (this.props.dark === "true") {
            return {
                x: x - awareness,
                y: y - awareness,
                width: awareness * 2,
                height: awareness * 2
            };
        } else {
            return { x: 0, y: 0, width: environmentVars.smallerSize, height: environmentVars.smallerSize };
        }
    }
    render() {
        var walls = this.props.walls.map((wall, index) => (
            <MakeWall key={wall.id} {...wall} />
        ));
        var rooms = this.props.rooms.map((room, index) => (
            <MakeRoom key={room.roomID} {...room} />
        ));
        var enemies = this.props.enemies.map(enemy => (
            <Enemy key={enemy.id} {...enemy} />
        ));

        /* Darkness is toggleable layer to hide map beyond player 'awareness' */

        const Darkness = () => (
            <Rect x={0} y={0} width={environmentVars.smallerSize} fill="black" height={environmentVars.smallerSize} />
        );

        /* PlayerView provides 'clip' variables to layer to prevent rendering outside of player 'awareness' */
        const playerView = this.makeWindow();

        return (
            <Stage
                className="canvas"
                width={environmentVars.smallerSize}
                height={environmentVars.smallerSize}
                scale={{ x: environmentVars.scale, y: environmentVars.scale }}
                opacity={this.state.opacity}
            >
                <Layer>
                    <Darkness />
                </Layer>
                <Layer
                    clipX={playerView.x}
                    clipY={playerView.y}
                    clipWidth={playerView.width}
                    clipHeight={playerView.height}
                >
                    <Rect
                        x={playerView.x}
                        y={playerView.y}
                        width={playerView.width}
                        fill="white"
                        height={playerView.height}
                    />
                    <Player
                        XY={this.props.playerXY}
                        direction={this.props.direction}
                    />
                    <Group>
                        {walls}
                        {rooms}
                        <ItemContainer items={this.props.items} />
                        {enemies}
                    </Group>
                </Layer>
            </Stage>
        );
    }
}
