"use strict";
import { GLOBAL } from './global';
import { Render } from './render';


let instance = null;
let chaseCount = 0;

class Game {
    increaseCount() {
        chaseCount++;
    }

    get ChaseCount() {
        return chaseCount;
    }

    preloadImg(chessImgs) {
        let onload_img = 0;
        let imgs = 0;

        for (let p in chessImgs) {
            GLOBAL.loadedImgs[p] = new Image();
            GLOBAL.loadedImgs[p].src = chessImgs[p];

            if (GLOBAL.loadedImgs[p].complete) {
                onload_img++;
            } else {
                GLOBAL.loadedImgs[p].onload = () => {
                    onload_img++;
                }
            }
            imgs++;
        }

        // let et = setInterval(() => {

        // })
    }

    getCampCount(camp) {
        let count = 0;
        for (let p in GLOBAL.chessSet) {
            let chess = GLOBAL.chessSet[p];
            if (camp === chess && chess.type) {
                count++;
            }
        }
        return count;
    }

    checkVod() {
        let redCount = this.getCampCount('a');
        let greenCount = this.getCampCount('b');

        if (redCount === 1 && greenCount === 1) {
            this.increaseCount();
        }

        if (redCount === 0 && greenCount === 0) {
            return 0;
        } else if (greenCount === 0) {
            return 1;
        } else if (redCount === 0) {
            return -1;
        } else if (this.getCampCount() >= 10) {
            return 0;
        }
    }

    drawing() {
        if (GLOBAL.canvas.getContext) {
            let context = GLOBAL.canvas.getContext('2d');
            Render.drawChessBoard(GLOBAL.canvas, context); // 棋盘
            Render.drawAllChess(context); // 32个棋子

            GLOBAL.canvas.addEventListener('mousedown', this.clickChess.bind(this), false);
            GLOBAL.canvas.oncontextmenu = () => {
                return false;
            }
        }
    }

    clickChess(evt) {
        if (GLOBAL.turn) {
            evt = evt || window.event;
            evt.preventDefault();
            let x = evt.offsetX || evt.layerX;
            let y = evt.offsetY || evt.layerY;

            //只使用下半盘
            if (x > GLOBAL.gap && y > 6 * GLOBAL.gap) {
                let row = Number.parseInt((evt.target.height - y) / GLOBAL.gap, 10);
                let col = Number.parseInt(x / GLOBAL.gap, 10);

                console.log(`${row} , ${col}`);
                let context = GLOBAL.canvas.getContext('2d');
                GLOBAL.clickCamp = GLOBAL.camp;
                Render.drawChess(context, row, col, evt.button, evt.button == 0 ? true : false);
            }
        }
        evt.stopPropagation();
    }

    showBulletin(status) {
        let content = '';
        if (status === 0) {
            content = '和棋';
        } else if (status > 0) {
            content = '红旗胜';
        } else if (status < 0) {
            content = '绿棋胜';
        } else {
            return;
        }

        let bulletin = document.getElementById('p');
        bulletin.innerHTML = "<b>比赛结束</b><span>" + content + "</span>";
        let mainBox = document.getElementsByClassName('mainBoxCenter')[0];
        mainBox.appendChild(bulletin);
        GLOBAL.turn = false; // 比赛停止
    }
}

export const GAME = {
    getInstance() {
        if (instance) {
            return instance;
        } else {
            instance = new Game();
            return instance;
        }
    }
};