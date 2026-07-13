export class Renderer {

    constructor(game) {

        this.game = game;

    }

    draw() {

        const ctx = this.game.ctx;
        const canvas = this.game.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

    }

}
