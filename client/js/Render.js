var Render = {
    drawAllChess: function (context) {
        for (var i = 1; i <= 4; i++) {
            for (var j = 1; j <= 8; j++) {
                var cy = (i * gap + gap * 5 + (i + 1) * gap + gap * 5) / 2;
                var cx = (j * gap + (j + 1) * gap) / 2;
                this.drawChess(context, i, j);
            }
        }
    },

    flip: function (context, lx, ty, chess, row, col, btn) {
        var img = loadedImgs[chess.type + chess.val];
        chess.status = 1;
        context.drawImage(img, lx + 2, ty + 2, gap - 4, gap - 4); // 防止出现压盖边缘

        if (!camp) {
            camp = chess.type;
            Socket.camp(userName, camp);
            clickCamp = camp;
        }
        turn = !turn; // 交替
        if (camp == clickCamp) {
            Socket.click(userName, row, col, btn); // 传递消息
        }
    },

    abandon: function (context, lx, ty, chess, row, col, btn) {
        var img = loadedImgs[chess.type + chess.val];
        context.drawImage(img, lx + 2, ty + 2, gap - 4, gap - 4);
        selectedRC = '';
        if (camp == clickCamp) {
            Socket.click(userName, row, col, btn); // 传递消息
        }
    },

    select: function (context, lx, ty, chess, row, col, btn) {
        var myTurn = turn && (chess.type == camp); // 我方行子时只能选择自己阵营
        var opTurn = !turn && (chess.type != camp);// 对手行子时只能选择对方阵营
        if (myTurn || opTurn) {
            var selectImage = loadedImgs['bg_sel'];
            context.drawImage(selectImage, lx + 2, ty + 2, gap - 4, gap - 4);
            var img = loadedImgs[chess.type + chess.val];
            context.drawImage(img, lx + 4, ty + 4, gap - 8, gap - 8);

            selectedRC = row + '_' + col;
            if (camp == clickCamp) {
                Socket.click(userName, row, col, btn); // 传递消息
            }
        }
    },

    fight: function (context, lx, ty, chess, row, col, btn) {
        var lastChess = chessSet[selectedRC];
        var lastRow = parseInt(selectedRC.split('_')[0], 10);
        var lastCol = parseInt(selectedRC.split('_')[1], 10);
        var x = gap * lastCol + gap / 2;
        var y = canvas.width - gap * lastRow + gap / 2;
        // 左上角
        var lastLx = x - gap / 2;
        var lastTy = y - gap / 2;
        // 不同阵营的棋子才可以吃子
        if (lastChess.type != chess.type && lastChess.val != 2) {// lastChess不为炮
            if (lastChess.val == 7 && chess.val == 1
                || (lastChess.val < chess.val && !(lastChess.val == 1 && chess.val == 7))) { // 将不能吃兵
                return;
            }
            var sameR = lastRow == row && (lastCol - col == 1 || lastCol - col == -1);
            var sameC = lastCol == col && (lastRow - row == 1 || lastRow - row == -1);
            if (!(sameR || sameC)) {// 保证为相邻位置
                return;
            }

            this.trace(context, lastLx, lastTy, lx, ty);

            if (lastChess.val > chess.val || (lastChess.val == 1 && chess.val == 7)) {// 吃子, 兵可以吃将
                var img = loadedImgs[lastChess.type + lastChess.val];// 移动
                context.drawImage(img, lx + 4, ty + 4, gap - 8, gap - 8);
                // 更新
                chessSet[selectedRC] = null;
                chessSet[row + '_' + col] = lastChess;
            } else if (lastChess.val == chess.val) {// 兑子
                // 更新
                chessSet[selectedRC] = null;
                chessSet[row + '_' + col] = null;
            }
            movedRC = row + '_' + col;
            turn = !turn;
            if (camp == clickCamp) {
                var status = app.checkVod();
                app.showBulletin(status);

                Socket.click(userName, row, col, btn); // 传递消息
            }
        } else if (lastChess.val == 2) { // lastChess 为炮
            if (chess.status && lastChess.type == chess.type){// 已翻棋子必须为不同阵营
                return;
            }
            var sameR = lastRow == row;
            var sameC = lastCol == col;
            if (!(sameR || sameC)) {// 保证为同一条直线
                return;
            }

            var sr = lastRow - row > 0 ? row : lastRow,
                er = lastRow - row > 0 ? lastRow : row,
                sc = lastCol - col > 0 ? col : lastCol,
                ec = lastCol - col > 0 ? lastCol : col;
            var crossCount = 0;
            for (var i = sr + 1; i < er; i++) {
                if (chessSet[i + '_' + col]) {
                    crossCount++;
                }
            }
            for (var i = sc + 1; i < ec; i++) {
                if (chessSet[row + '_' + i]) {
                    crossCount++;
                }
            }
            if (crossCount != 1) {// 必须相隔一个子
                return;
            }
            // 吃子
            this.trace(context, lastLx, lastTy, lx, ty);
            var img = loadedImgs[lastChess.type + lastChess.val];// 移动
            context.drawImage(img, lx + 4, ty + 4, gap - 8, gap - 8);
            // 更新
            chessSet[selectedRC] = null;
            chessSet[row + '_' + col] = lastChess;
            movedRC = row + '_' + col;
            turn = !turn;
            if (camp == clickCamp) {
                var status = app.checkVod();
                app.showBulletin(status);

                Socket.click(userName, row, col, btn); // 传递消息
            }
        }
    },

    trace: function(context, lLx, lTy, lx, ty) {
        this.clear(context, lx, ty);
        this.clear(context, lLx, lTy);
        var selectImage = loadedImgs['bg_sel'];// 选中符号
        context.drawImage(selectImage, lLx + 2, lTy + 2, gap - 4, gap - 4);
        var moveImage = loadedImgs['bg_over'];// 移动符号
        context.drawImage(moveImage, lx + 2, ty + 2, gap - 4, gap - 4);
    },

    move: function (context, lx, ty, row, col, btn) {
        var lastChess = chessSet[selectedRC];
        var lastRow = parseInt(selectedRC.split('_')[0], 10);
        var lastCol = parseInt(selectedRC.split('_')[1], 10);
        var x = gap * lastCol + gap / 2;
        var y = canvas.width - gap * lastRow + gap / 2;
        // 左上角
        var lastLx = x - gap / 2;
        var lastTy = y - gap / 2;

        var sameR = lastRow == row && (lastCol - col == 1 || lastCol - col == -1);
        var sameC = lastCol == col && (lastRow - row == 1 || lastRow - row == -1);
        if (!(sameR || sameC)) {// 保证为相邻位置
            return;
        }

        this.trace(context, lastLx, lastTy, lx, ty);
        // 移动
        var img = loadedImgs[lastChess.type + lastChess.val];
        context.drawImage(img, lx + 4, ty + 4, gap - 8, gap - 8);
        // 更新
        chessSet[selectedRC] = null;
        chessSet[row + '_' + col] = lastChess;
        movedRC = row + '_' + col;
        turn = !turn;
        if (camp == clickCamp) {
            var status = app.checkVod();
            app.showBulletin(status);

            Socket.click(userName, row, col, btn); // 传递消息
        }
    },

    clear: function (context, lx, ty) {
        var img = loadedImgs['bg'];
        context.drawImage(img, lx + 2, ty + 2, gap - 4, gap - 4); // 防止出现压盖边缘
    },

    scratch: function (context) {
        var r = 0, c = 0 , x = 0 , y = 0 , lx = 0 , ty = 0;
        if (!chessSet[selectedRC]) {
            r = selectedRC.split('_')[0];
            c = selectedRC.split('_')[1];
            x = gap * c + gap / 2;
            y = canvas.width - gap * r + gap / 2;
            // 左上角
            lx = x - gap / 2;
            ty = y - gap / 2;

            this.clear(context, lx, ty);
            selectedRC = '';
        }
        if (movedRC) {
            r = movedRC.split('_')[0];
            c = movedRC.split('_')[1];
            x = gap * c + gap / 2;
            y = canvas.width - gap * r + gap / 2;
            // 左上角
            lx = x - gap / 2;
            ty = y - gap / 2;
            chessSet[movedRC]
                ? this.abandon(context, lx, ty, chessSet[movedRC])
                : this.clear(context, lx, ty);
            movedRC = '';
        }
    },

    drawChess: function (context, row, col, btn, isSelect) {
        // 方格的中心
        var x = gap * col + gap / 2;
        var y = canvas.width - gap * row + gap / 2;
        // 左上角
        var lx = x - gap / 2;
        var ty = y - gap / 2;

        var lastChess = chessSet[selectedRC];
        var chess = chessSet[row + '_' + col];
        this.scratch(context);
        if (chess) {
            if (isSelect && !chess.status) { // 选中没翻开棋子则翻子
                if (!selectedRC) { // 选中状态下不能翻子
                    this.flip(context, lx, ty, chess, row, col, btn);
                }else if (selectedRC && lastChess.val == 2) {
                    this.fight(context, lx, ty, chess, row, col, btn);
                }
            } else if (isSelect && chess.status) { // 选中已翻开棋子
                // 没有以选中棋子则选中，否则判断能否吃子
                selectedRC ? this.fight(context, lx, ty, chess, row, col, btn)
                    : this.select(context, lx, ty, chess, row, col, btn);
            } else if (!isSelect && chess.status) { // 放弃选中已翻开棋子
                // 放弃选中符号
                if (row + '_' + col == selectedRC) {
                    this.abandon(context, lx, ty, chess, row, col, btn);
                }
            } else { // 尚未翻开的棋子
                var img = loadedImgs['chessbg'];
                context.drawImage(img, lx + 2, ty + 2, gap - 4, gap - 4);
            }
        } else {
            if (isSelect && selectedRC) {
                this.move(context, lx, ty, row, col, btn);
            }
        }
    },

    drawChessBoard: function (canvas, context) {
        context = context || canvas.getContext('2d');
        // 外盘
        context.fillStyle = 'rgba(206, 92, 0, 1)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        // 内盘
        context.fillStyle = 'rgba(210, 182, 154, 1)';
        context.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
        // 格线
        var i, len, dis = 50;
        context.lineWidth = 1;

        context.beginPath();
        // 横格线
        for (i = 1, len = (canvas.height - 100) / 50; i <= len + 1; i++) {
            context.moveTo(50, i * dis);
            context.lineTo(450, i * dis);
        }
        // 纵格线
        context.moveTo(50, 250);
        context.lineTo(50, 300);
        context.moveTo(450, 250);
        context.lineTo(450, 300);
        for (i = 1, len = (canvas.width - 100) / 50; i <= len + 1; i++) {
            context.moveTo(i * dis, 50);
            context.lineTo(i * dis, 250);

            context.moveTo(i * dis, 300);
            context.lineTo(i * dis, 500);
        }
        // 叉线
        context.moveTo(200, 50);
        context.lineTo(300, 150);
        context.moveTo(300, 50);
        context.lineTo(200, 150);

        context.moveTo(200, 500);
        context.lineTo(300, 400);
        context.moveTo(300, 500);
        context.lineTo(200, 400);
        context.stroke();
        // 楚河 汉界
        context.font = 'bold 40px Arial';
        context.textAlign = 'start';
        context.textBaseline = 'top';
        context.fillStyle = 'black';
        context.fillText('楚 河', 100, 250);
        context.fillText(' 汉 界', 300, 250);
    }
};