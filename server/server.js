/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var socket = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

var server = http.createServer(app);
var io = socket.listen(server).set('log level', 1);
io.set('transports', [
    'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
]);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

var conns = {};
var users = [];
io.sockets.on('connection', function (socket) {
    var cid = socket.id;
    console.log('connection');
    conns[cid] = socket;
    for (var ccid in conns) {
        if (cid == ccid) {
            var soc = conns[ccid];
            if (soc){
                soc.emit('join', {cid: socket.id});
            }
        }
    }

    socket.on('take', function (data) {
        users.push(data.uid);
        var count = users.length;
        if (count % 2 == 0) {
            var ptc = users[count - 2].toString() +','+ users[count - 1].toString();
            console.log('users: ' + users);
            // 32 chesses
            var chesses = [
                'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a1', 'b1', 'a1',
                'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b1', 'b1', 'a1'
            ];
            var chessSet = {};
            while (chesses.length > 0) {
                var rnd = Math.floor(Math.random() * chesses.length);
                var tmpchess = chesses.splice(rnd, 1).toString();

                var row = parseInt(chesses.length / 8, 10) + 1;
                var col = parseInt(chesses.length % 8, 10) + 1;
                chessSet[row + '_' + col] = {
                    'chess': tmpchess,
                    'type': tmpchess.substr(0, 1),
                    'val': tmpchess.substr(1, 1),
                    'status': 0
                };
            }
            for (var ccid in conns) {
                if (ccid == users[count - 1] || ccid == users[count - 2]) {
                    var soc = conns[ccid];
                    if (soc) {
                        console.log('shuffle: ' + ccid);
                        soc.emit('shuffle', {
                            set: chessSet,
                            ptc: ptc
                        });
                    }
                }
            }
        }
    });


    socket.on('close', function (data) {
        console.log('clost: ', users);
        delete conns[data.fid];

        if (users.length >= 1) {
            var soc = conns[data.tid];
            if (soc) {
                soc.emit('close', {fid: data.fid});
            }
            // 有一方强行退出则竞争对手也退出
        }
        delete conns[data.tid];

        for (var i = 0; i < users.length; i++) {
            if (users[i] == data.fid || users[i] == data.tid) {
                users.splice(i, 1);
            }
        }
    });

    socket.on('camp', function (data) {
        var soc = conns[data.tid];
        console.log('users: ' + users);
        if (soc) {
            console.log(data.fid);
            var oCamp = '';
            if (data.camp == 'a') {
                oCamp = 'b';
            } else {
                oCamp = 'a';
            }
            soc.emit('camp', {camp: oCamp});
        }
    });

    socket.on('click', function (data) {
        console.log('users: ' + users);
        var soc = conns[data.tid];
        if (soc) {
            soc.emit('click', data);
        }
    });
});
