import { GLOBAL } from './global';
import { GAME } from './game';
import { Parser } from './parser';
import { Render } from './render';
import { Socket } from './socket';

// export const Main = {
//     start() {
// document.addEventListener('DOMContentLoaded', () => {
let chessImgs = {
    'a1': './images/a1.gif',
    'a2': './images/a2.gif',
    'a3': './images/a3.gif',
    'a4': './images/a4.gif',
    'a5': './images/a5.gif',
    'a6': './images/a6.gif',
    'a7': './images/a7.gif',
    'b1': './images/b1.gif',
    'b2': './images/b2.gif',
    'b3': './images/b3.gif',
    'b4': './images/b4.gif',
    'b5': './images/b5.gif',
    'b6': './images/b6.gif',
    'b7': './images/b7.gif',
    'bg': './images/bg.gif',
    'chessbg': './images/chessbg.gif',
    'bg_sel': './images/bg_sel.gif',
    'bg_over': './images/bg_over.gif'
};

GLOBAL.canvas = document.getElementById('chessBoard');
GLOBAL.app = GAME.getInstance();
Render.drawChessBoard(GLOBAL.canvas);
GLOBAL.app.preloadImg(chessImgs);
Socket.init();
GLOBAL.socket = Socket;

var w = (screen.width - 506) / 2;
var left = document.getElementsByClassName('left')[0];
var right = document.getElementsByClassName('right')[0];
var rw = screen.width - 506 - w;
left.style.width = w + 'px';
right.style.width = rw + 'px';
// }, false);


window.onbeforeunload = function(evt) {
        GLOBAL.socket.close(GLOBAL.userName, GLOBAL.rivalName);

        // 延迟三秒，以便socket传送数据
        var start = Date.now();
        var end = Date.now();
        while (end - start < 3000) {
            end = Date.now();
        }
    }
    //     }
    // }