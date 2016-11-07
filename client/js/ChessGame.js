/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-12-10
 * Time: 下午8:57
 * To change this template use File | Settings | File Templates.
 */
var ChessGame = function() {
    if (!canvas) {
        canvas = document.getElementById('chessBoard');
    }
    var chaseCount = 0; // 如果双方各剩一子，没有办法吃掉对方，相互追逐次数超过5次系统判定为和棋
    this.increaseCount = function(){
        chaseCount++;
        console.log(chaseCount);
    }
    this.getChaseCount = function(){
        return chaseCount;
    }
};
ChessGame.prototype.preloadImg = function (chessImgs) {
    var onload_img = 0;
    var imgs = 0;
    var that = this;
    for (var p in chessImgs) {
        loadedImgs[p] = new Image();
        loadedImgs[p].src = chessImgs[p];
        if (loadedImgs[p].complete) {
            onload_img++;
        } else {
            loadedImgs[p].onload = function () {
                onload_img++;
            }
        }
        imgs++;
    }
    var et = setInterval(
        function () {
            if (onload_img == imgs) {	// 定时器,判断图片完全加载后调用callback
                clearInterval(et);
            }
        }, 200);
};
ChessGame.prototype.getCampCount = function (camp) {
    var count = 0;
    for (var p in chessSet) {
        var chess = chessSet[p];
        if (chess  && chess.type && chess.type == camp) {
            count++;
        }
    }
    return count;
};
ChessGame.prototype.checkVod = function () {
    var redCount = this.getCampCount('a');
    var greenCount = this.getCampCount('b');
    if (redCount == 1 && greenCount == 1) {
        this.increaseCount();
    }

    if(redCount == 0 && greenCount == 0){
        return 0;
    }else if (greenCount == 0) {
        return 1;
    }else if (redCount == 0) {
        return -1;
    }else if (this.getChaseCount() >= 10) {
        return 0;
    }
};
ChessGame.prototype.drawing = function () {
    if (canvas.getContext) {
        var context = canvas.getContext('2d');
        Render.drawChessBoard(canvas, context);// 棋盘
        Render.drawAllChess(context);// 32 个棋子

        canvas.addEventListener('mousedown', this.clickChess.bind(this), false);
        canvas.oncontextmenu = function (e) {
            return false;
        }
    }
};

ChessGame.prototype.clickChess = function (evt) {
    if (turn) { // 保证双方交替进行
        evt = evt || window.event;
        evt.preventDefault();
        var x = evt.offsetX || evt.layerX;
        var y = evt.offsetY || evt.layerY;
        // 只是用下半盘
        if (x > gap && y > 6 * gap) {
            row = parseInt((evt.target.height - y) / gap, 10);
            col = parseInt(x / gap, 10);

            console.log(row + ' , ' + col);
            var context = canvas.getContext('2d');
            clickCamp = camp;
            Render.drawChess(context, row, col, evt.button, evt.button == 0 ? true : false);
        }
    }
    evt.stopPropagation();
};

ChessGame.prototype.showBulletin = function (status) {
    var content = '';
    if (status == 0){
        content = '和棋';
    }else if (status > 0) {
        content = '红棋胜';
    }else if (status < 0) {
        content = '绿棋胜';
    }else {
        return;
    }
    var bulletin = document.createElement('p');
    bulletin.innerHTML = "<b>比赛结束</b><span>" + content + "</span>";
    var mainBox = document.getElementsByClassName('mainBoxCenter')[0];
    mainBox.appendChild(bulletin);
    turn = false;// 比赛停止
};
