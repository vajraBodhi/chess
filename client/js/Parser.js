import { GLOBAL } from './global';
import { Render } from './render';

export const Parser = {
    click(r, c, btn, cliCamp) {
        let row = Number.parseInt(r, 10),
            col = Number.parseInt(c, 10),
            isSelect = Number.parseInt(btn, 10) === 0;

        GLOBAL.clickCamp = cliCamp;
        Render.drawChess(GLOBAL.canvas.getContext('2d'), row, col, btn, isSelect);

        if (GLOBAL.app) {
            let status = GLOBAL.app.checkVod();
            GLOBAL.app.showBulletin(status);
        }
    },

    setCamp(c) {
        GLOBAL.camp = c;
        GLOBAL.turn = false;
    },

    shuffle(data) {
        GLOBAL.chessSet = data.set;
        let part = data.ptc.split(',');

        if (GLOBAL.userName === part[0]) {
            GLOBAL.rivalName = part[1];
        } else {
            GLOBAL.rivalName = part[0];
        }

        if (GLOBAL.app) {
            GLOBAL.app.drawing();
        }
    }
};