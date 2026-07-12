export class Game {

    constructor(){

        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");

    }

    start(){

        console.log("Game Start");

    }

}
