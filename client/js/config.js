"use strict";

export const gap = 50;
export const chessSet = {}; // 棋盘
export let selectedRC = ''; // 以选中的棋子所在行列：1_2
export let movedRC = ''; //  吃子或兑子所发生行列: 1_3
export const loadedImgs = {}; // 已加载图片
export let canvas = null;
export let turn = false; // 保证交替执行
export let userName = 'lzz';
export let rivalName = ''; // 对手
export let camp = ''; // a 红, b 绿
export let clickCamp = ''; // 当前执行方
export let Socket = null;
export let app = null;
//var chaseCount = 0; // 如果双方各剩一子，没有办法吃掉对方，相互追逐次数超过5次系统判定为和棋