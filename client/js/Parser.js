/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-12-12
 * Time: 下午11:51
 * To change this template use File | Settings | File Templates.
 */
var wsParser = {
    app: null,

    click: function(r, c, btn, cliCamp){
        var row = parseInt(r, 10),
            col = parseInt(c, 10),
            isSelect = parseInt(btn, 10) == 0 ? true : false;
        clickCamp = cliCamp;
            Render.drawChess(
                canvas.getContext('2d'), row, col, btn, isSelect
            );

        var status = this.app.checkVod();
        this.app.showBulletin(status);
    },

    setCamp: function(c){
        camp = c;
        turn = false;
    },

    shuffle: function(data){
        chessSet = data.set;
        var part = data.ptc.split(',');
        if (userName == part[0]) {
            rivalName = part[1];
        }else {
            rivalName = part[0];
        }
        this.app.drawing();
    }
};