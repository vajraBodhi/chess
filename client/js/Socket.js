import { GLOBAL } from './global';
import { Parser } from './parser';
import { Render } from './render';

let wSocket = null;

export const Socket = {
    init() {
        if (!wSocket) {
            wSocket = io(GLOBAL.socketServer); // Socket.io的全局变量
            wSocket.on('join', (data) => {
                console.log('socket已连接上');
                GLOBAL.userName = data.cid;
                GLOBAL.turn = !GLOBAL.turn;

                wSocket.emit('take', { uid: data.cid });
            });
            wSocket.on('shuffle', (data) => {
                //debugger;
                Parser.shuffle(data);
            });
            wSocket.on('camp', (data) => {
                Parser.setCamp(data.camp);
            });
            wSocket.on('click', (data) => {
                Parser.click(data.row, data.col, data.btn, data.clickCamp);
            });
            wSocket.on('close', (data) => {
                console.log('Socket 状态：' + wSocket.readyState);
                //alert('对方退出比赛！');
                location.reload(true);
            });
        }
    },

    click(uName, row, col, btn) {
        let msg = {
            fid: uName,
            tid: GLOBAL.rivalName,
            row: row,
            col: col,
            btn: btn,
            clickCamp: GLOBAL.camp
        };

        wSocket.emit('click', GLOBAL.camp);
    },

    camp(uName, camp) {
        wSocket.emit('camp', {
            camp: GLOBAL.camp,
            fid: GLOBAL.userName,
            tid: GLOBAL.rivalName
        });
    },

    close(fid, tid) {
        Render.drawChessBoard(GLOBAL.canvas);

        wSocket.emit('close', {
            fid: fid,
            tid: tid
        });
    }
}