import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {ShowMap} from './mapMaker';
import Board from './board.js';
//import Crapp from './Crapp';
import registerServiceWorker from './registerServiceWorker';
console.log("index has loaded Board...",Board);

ReactDOM.render(<ShowMap  />, document.getElementById('root'));
//ReactDOM.render(<Crapp />, document.getElementById('root'));
registerServiceWorker();
