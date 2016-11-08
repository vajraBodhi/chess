"use strict";

export const GLOBAL = {
    gap: 50,
    chessSet: {}, // 棋盘
    selectedRC: "", // 以选中的棋子所在行列：1_2
    movedRC: "", //  吃子或兑子所发生行列: 1_3
    loadedImgs: {}, // 已加载图片
    canvas: null,
    turn: false, // 保证交替执行
    userName: 'lzz',
    rivalName: '', // 对手
    camp: '', // a 红, b 绿
    clickCamp: '', // 当前执行方
    socket: null,
    app: null
        //var chaseCount = 0; // 如果双方各剩一子，没有办法吃掉对方，相互追逐次数超过5次系统判定为和棋
};