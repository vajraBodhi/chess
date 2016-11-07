"use strict";
import { loadedImgs } from './config';


let instance = null;
let chaseCount = 0;

export class Game {
    increaseCount() {
        chaseCount++;
    }

    get ChaseCount() {
        return chaseCount;
    }

    preloadImg(chessImgs) {
        let onload_img = 0;
        let imgs = 0;

        for (let p in chessImgs) {
            loadedImgs[p] = new Image();
            loadedImgs[p].src = chessImgs[p];

            if (loadedImgs[p].complete) {
                onload_img++;
            } else {
                loadedImgs[p].onload = () => {
                    onload_img++;
                }
            }
            imgs++;
        }

        let et =
    }
}