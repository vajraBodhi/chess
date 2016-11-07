/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-12-13
 * Time: 上午2:49
 * To change this template use File | Settings | File Templates.
 */
var SocketIo = function(){
    var wSocket;
    try{
        wSocket = io.connect();
    }catch(err){
        alert("对不起，您所使用的浏览器不支持WebSocket");
        return;
    };

    function clear(){
        var gap = 50;
        var chessSet = {};
        var selectedRC = ''; // 以选中的棋子所在行列：1_2
        var movedRC = ''; //  吃子或兑子所发生行列: 1_3
        var loadedImgs = {};
        var canvas = null;
        var socket = null; // websocket
        var turn = false;
        var users = [];
        var rooms = [];
        var userTree = null;
        var roomTree = null;
        var roomName = '';
    };
    wSocket.on('join', function(data){
        console.log('socket已连接上');
        clear();
        userName = data.cid;
        turn = !turn;

        wSocket.emit('take', {uid: data.cid});
    });
    wSocket.on('shuffle', function(data) {
        //debugger;
        wsParser.shuffle(data);
    });
    wSocket.on('camp', function(data) {
        wsParser.setCamp(data.camp);
    });
    wSocket.on('click', function(data){
        wsParser.click(data.row, data.col, data.btn, data.clickCamp);
    });
    wSocket.on('close', function(data) {
        console.log('Socket 状态：' + wSocket.readyState);
        //alert('对方退出比赛！');
        clear();
        location.reload(true);
    });
    return {
        click: function(uName, row,col, btn) {
            var msg = {
                fid: uName,
                tid: rivalName,
                row: row,
                col: col,
                btn: btn,
                clickCamp: camp
            };
            wSocket.emit('click', msg);
        },
        camp: function(uName, camp) {
            wSocket.emit('camp', {
                camp: camp,
                fid: userName,
                tid: rivalName
            });
        },
        close: function(fid, tid){
            Render.drawChessBoard(canvas);
            wSocket.emit('close', {
                fid: fid,
                tid: tid
            });
        }
    }
};