import React from 'react';
import ReactDOM from 'react-dom';
import './dungeon.css';
//import {ShowMap} from './mapMaker';
import {App} from './game';



import registerServiceWorker from './registerServiceWorker';
//console.log("index has loaded Board...",Board);

ReactDOM.render(<App />, document.getElementById('root'));
//ReactDOM.render(<Crapp />, document.getElementById('root'));
registerServiceWorker();

