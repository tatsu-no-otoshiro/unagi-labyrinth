export class Input {

    constructor(game) {

        this.game = game;

        // 最初はウナギの位置を目標にする
        this.target = {
            x: 0,
            y: 0
        };

        const canvas = this.game.canvas;

        // マウス
        canvas.addEventListener("mousemove", (event) => {

            this.target.x = event.clientX;
            this.target.y = event.clientY;

        });

        // タッチ
        canvas.addEventListener("touchmove", (event) => {

            event.preventDefault();

            this.target.x = event.touches[0].clientX;
            this.target.y = event.touches[0].clientY;

        }, { passive: false });

    }

    reset() {

        this.target.x = this.game.eel.x;
        this.target.y = this.game.eel.y;

    }

}
