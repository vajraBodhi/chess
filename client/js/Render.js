import { GLOBAL } from './global';

export const Render = {
    drawAllChess(context) {
        let gap = GLOBAL.gap;
        for (let i = 1; i <= 4; i++) {
            for (let j = 1; j <= 8; j++) {
                let cy = (i * gap + gap * 5 + (i + 1) * gap + gap * 5) / 2;
                let cx = (j * gap + (j + 1) * gap) / 2;


                this.drawChess(context, i, j);
            }
        }
    },

    flip(context, lx, ty, chess, row, col, btn) {
        let img = GLOBAL.loadedImgs[chess.type + chess.val];
        chess.status = 1;
        context.drawImage(img, lx + 2, ty + 2, GLOBAL.gap - 4, GLOBAL.gap - 4); // 防止出现压盖边缘

        if (!GLOBAL.camp) {
            GLOBAL.camp = chess.type;
            GLOBAL.socket.camp(GLOBAL.userName, GLOBAL.camp);
            GLOBAL.clickCamp = GLOBAL.camp;
        }
        GLOBAL.turn = !GLOBAL.turn;
        if (GLOBAL.camp === GLOBAL.clickCamp) {
            GLOBAL.socket.click(GLOBAL.userName, row, col, btn); // 传递消息
        }
    },

    abandon(context, lx, ty, chess, row, col, btn) {
        let img = GLOBAL.loadedImgs[chess.type + chess.val];
        context.drawImage(img, lx + 2, ty + 2, GLOBAL.gap - 4, GLOBAL.gap - 4);
        GLOBAL.selectedRC = '';
        if (GLOBAL.camp == GLOBAL.clickCamp) {
            GLOBAL.socket.click(GLOBAL.userName, row, col, btn); // 传递消息
        }
    },

    select(context, lx, ty, chess, row, col, btn) {
        let myTurn = GLOBAL.turn && (chess.type == GLOBAL.camp); // 我方行子时只能选择自己阵营
        let opTurn = !GLOBAL.turn && (chess.type != GLOBAL.camp); // 对手行子时只能选择对方阵营
        if (myTurn || opTurn) {
            let selectImage = GLOBAL.loadedImgs['bg_sel'];
            context.drawImage(selectImage, lx + 2, ty + 2, GLOBAL.gap - 4, GLOBAL.gap - 4);
            let img = GLOBAL.loadedImgs[chess.type + chess.val];
            context.drawImage(img, lx + 4, ty + 4, GLOBAL.gap - 8, GLOBAL.gap - 8);

            GLOBAL.selectedRC = row + '_' + col;
            if (GLOBAL.camp == GLOBAL.clickCamp) {
                GLOBAL.socket.click(GLOBAL.userName, row, col, btn); // 传递消息
            }
        }
    },

    fight(context, lx, ty, chess, row, col, btn) {
        let lastChess = GLOBAL.chessSet[GLOBAL.selectedRC];
        let lastRow = parseInt(GLOBAL.selectedRC.split('_')[0], 10);
        let lastCol = parseInt(GLOBAL.selectedRC.split('_')[1], 10);
        let x = GLOBAL.gap * lastCol + GLOBAL.gap / 2;
        let y = canvas.width - GLOBAL.gap * lastRow + GLOBAL.gap / 2;
        // 左上角
        let lastLx = x - GLOBAL.gap / 2;
        let lastTy = y - GLOBAL.gap / 2;
        // 不同阵营的棋子才可以吃子
        if (lastChess.type != chess.type && lastChess.val != 2) { // lastChess不为炮
            if (lastChess.val == 7 && chess.val == 1 ||
                (lastChess.val < chess.val && !(lastChess.val == 1 && chess.val == 7))) { // 将不能吃兵
                return;
            }
            let sameR = lastRow == row && (lastCol - col == 1 || lastCol - col == -1);
            let sameC = lastCol == col && (lastRow - row == 1 || lastRow - row == -1);
            if (!(sameR || sameC)) { // 保证为相邻位置
                return;
            }

            this.trace(context, lastLx, lastTy, lx, ty);

            if (lastChess.val > chess.val || (lastChess.val == 1 && chess.val == 7)) { // 吃子, 兵可以吃将
                let img = GLOBAL.loadedImgs[lastChess.type + lastChess.val]; // 移动
                context.drawImage(img, lx + 4, ty + 4, GLOBAL.gap - 8, GLOBAL.gap - 8);
                // 更新
                GLOBAL.chessSet[GLOBAL.selectedRC] = null;
                GLOBAL.chessSet[row + '_' + col] = lastChess;
            } else if (lastChess.val == chess.val) { // 兑子
                // 更新
                GLOBAL.chessSet[GLOBAL.selectedRC] = null;
                GLOBAL.chessSet[row + '_' + col] = null;
            }
            GLOBAL.movedRC = row + '_' + col;
            GLOBAL.turn = !GLOBAL.turn;
            if (GLOBAL.camp == GLOBAL.clickCamp) {
                let status = GLOBAL.app.checkVod();
                GLOBAL.app.showBulletin(status);

                GLOBAL.socket.click(GLOBAL.userName, row, col, btn); // 传递消息
            }
        } else if (lastChess.val == 2) { // lastChess 为炮
            if (chess.status && lastChess.type == chess.type) { // 已翻棋子必须为不同阵营
                return;
            }
            let sameR = lastRow == row;
            let sameC = lastCol == col;
            if (!(sameR || sameC)) { // 保证为同一条直线
                return;
            }

            let sr = lastRow - row > 0 ? row : lastRow,
                er = lastRow - row > 0 ? lastRow : row,
                sc = lastCol - col > 0 ? col : lastCol,
                ec = lastCol - col > 0 ? lastCol : col;
            let crossCount = 0;
            for (let i = sr + 1; i < er; i++) {
                if (GLOBAL.chessSet[i + '_' + col]) {
                    crossCount++;
                }
            }
            for (let i = sc + 1; i < ec; i++) {
                if (GLOBAL.chessSet[row + '_' + i]) {
                    crossCount++;
                }
            }
            if (crossCount != 1) { // 必须相隔一个子
                return;
            }
            // 吃子
            this.trace(context, lastLx, lastTy, lx, ty);
            let img = GLOBAL.loadedImgs[lastChess.type + lastChess.val]; // 移动
            context.drawImage(img, lx + 4, ty + 4, GLOBAL.gap - 8, GLOBAL.gap - 8);
            // 更新
            GLOBAL.chessSet[GLOBAL.selectedRC] = null;
            GLOBAL.chessSet[row + '_' + col] = lastChess;
            GLOBAL.movedRC = row + '_' + col;
            GLOBAL.turn = !GLOBAL.turn;
            if (GLOBAL.camp == GLOBAL.clickCamp) {
                let status = GLOBAL.app.checkVod();
                GLOBAL.app.showBulletin(status);

                GLOBAL.socket.click(GLOBAL.userName, row, col, btn); // 传递消息
            }
        }
    },

    trace(context, lLx, lTy, lx, ty) {
        this.clear(context, lx, ty);
        this.clear(context, lLx, lTy);
        let selectImage = GLOBAL.loadedImgs['bg_sel']; // 选中符号
        context.drawImage(selectImage, lLx + 2, lTy + 2, GLOBAL.gap - 4, GLOBAL.gap - 4);
        let moveImage = GLOBAL.loadedImgs['bg_over']; // 移动符号
        context.drawImage(moveImage, lx + 2, ty + 2, GLOBAL.gap - 4, GLOBAL.gap - 4);
    },

    move(context, lx, ty, row, col, btn) {
        let lastChess = GLOBAL.chessSet[GLOBAL.selectedRC];
        let lastRow = Number.parseInt(GLOBAL.selectedRC.split('_')[0], 10);
        let lastCol = Number.parseInt(GLOBAL.selectedRC.split('_')[1], 10);
        let x = GLOBAL.gap * lastCol + GLOBAL.gap / 2;
        let y = GLOBAL.canvas.width - GLOBAL.gap * lastRow + GLOBAL.gap / 2;
        // 左上角
        let lastLx = x - GLOBAL.gap / 2;
        let lastTy = y - GLOBAL.gap / 2;

        let sameR = lastRow == row && (lastCol - col == 1 || lastCol - col == -1);
        let sameC = lastCol == col && (lastRow - row == 1 || lastRow - row == -1);
        if (!(sameR || sameC)) { // 保证为相邻位置
            return;
        }

        this.trace(context, lastLx, lastTy, lx, ty);
        // 移动
        let img = GLOBAL.loadedImgs[lastChess.type + lastChess.val];
        context.drawImage(img, lx + 4, ty + 4, GLOBAL.gap - 8, GLOBAL.gap - 8);
        // 更新
        GLOBAL.chessSet[GLOBAL.selectedRC] = null;
        GLOBAL.chessSet[row + '_' + col] = lastChess;
        movedRC = row + '_' + col;
        GLOBAL.turn = !GLOBAL.turn;
        if (GLOBAL.camp == GLOBAL.clickCamp) {
            let status = GLOBAL.app.checkVod();
            GLOBAL.app.showBulletin(status);

            GLOBAL.socket.click(userName, row, col, btn); // 传递消息
        }
    },

    clear(context, lx, ty) {
        let img = GLOBAL.loadedImgs['bg'];
        context.drawImage(img, lx + 2, ty + 2, GLOBAL.gap - 4, GLOBAL.gap - 4); // 防止出现压盖边缘
    },

    scratch(context) {
        let r = 0,
            c = 0,
            x = 0,
            y = 0,
            lx = 0,
            ty = 0;
        if (!GLOBAL.chessSet[GLOBAL.selectedRC]) {
            r = GLOBAL.selectedRC.split('_')[0];
            c = GLOBAL.selectedRC.split('_')[1];
            x = GLOBAL.gap * c + GLOBAL.gap / 2;
            y = GLOBAL.canvas.width - GLOBAL.gap * r + GLOBAL.gap / 2;
            // 左上角
            lx = x - GLOBAL.gap / 2;
            ty = y - GLOBAL.gap / 2;

            this.clear(context, lx, ty);
            GLOBAL.selectedRC = '';
        }
        if (GLOBAL.movedRC) {
            r = GLOBAL.movedRC.split('_')[0];
            c = GLOBAL.movedRC.split('_')[1];
            x = GLOBAL.gap * c + GLOBAL.gap / 2;
            y = GLOBAL.canvas.width - GLOBAL.gap * r + GLOBAL.gap / 2;
            // 左上角
            lx = x - GLOBAL.gap / 2;
            ty = y - GLOBAL.gap / 2;
            GLOBAL.chessSet[GLOBAL.movedRC] ?
                this.abandon(context, lx, ty, GLOBAL.chessSet[GLOBAL.movedRC]) :
                this.clear(context, lx, ty);
            GLOBAL.movedRC = '';
        }
    },

    drawChess(context, row, col, btn, isSelect) {
        // 方格的中心
        let x = GLOBAL.gap * col + GLOBAL.gap / 2;
        let y = GLOBAL.canvas.width - GLOBAL.gap * row + GLOBAL.gap / 2;
        // 左上角
        let lx = x - GLOBAL.gap / 2;
        let ty = y - GLOBAL.gap / 2;

        let lastChess = GLOBAL.chessSet[GLOBAL.selectedRC];
        let chess = GLOBAL.chessSet[row + '_' + col];
        this.scratch(context);
        if (chess) {
            if (isSelect && !chess.status) { // 选中没翻开棋子则翻子
                if (!GLOBAL.selectedRC) { // 选中状态下不能翻子
                    this.flip(context, lx, ty, chess, row, col, btn);
                } else if (GLOBAL.selectedRC && lastChess.val == 2) {
                    this.fight(context, lx, ty, chess, row, col, btn);
                }
            } else if (isSelect && chess.status) { // 选中已翻开棋子
                // 没有以选中棋子则选中，否则判断能否吃子
                GLOBAL.selectedRC ? this.fight(context, lx, ty, chess, row, col, btn) :
                    this.select(context, lx, ty, chess, row, col, btn);
            } else if (!isSelect && chess.status) { // 放弃选中已翻开棋子
                // 放弃选中符号
                if (row + '_' + col == GLOBAL.selectedRC) {
                    this.abandon(context, lx, ty, chess, row, col, btn);
                }
            } else { // 尚未翻开的棋子
                let img = GLOBAL.loadedImgs['chessbg'];
                context.drawImage(img, lx + 2, ty + 2, GLOBAL.gap - 4, GLOBAL.gap - 4);
            }
        } else {
            if (isSelect && GLOBAL.selectedRC) {
                this.move(context, lx, ty, row, col, btn);
            }
        }
    },

    drawChessBoard(canvas, context) {
        context = context || canvas.getContext('2d');
        // 外盘
        context.fillStyle = 'rgba(206, 92, 0, 1)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        // 内盘
        context.fillStyle = 'rgba(210, 182, 154, 1)';
        context.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
        // 格线
        let i, len, dis = 50;
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
}