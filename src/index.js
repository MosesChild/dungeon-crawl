import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {ShowMap} from './mapMaker';
import {App} from './game';
import Board from './board.js';


import registerServiceWorker from './registerServiceWorker';
console.log("index has loaded Board...",Board);

ReactDOM.render(<App />, document.getElementById('root'));
//ReactDOM.render(<Crapp />, document.getElementById('root'));
registerServiceWorker();
