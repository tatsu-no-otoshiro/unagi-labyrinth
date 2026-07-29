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

            this.updateTarget(
                event.clientX,
                event.clientY
            );

        });

        // タッチ
        canvas.addEventListener("touchmove", (event) => {

            event.preventDefault();

            this.updateTarget(
                event.touches[0].clientX,
                event.touches[0].clientY
            );

        }, { passive: false });

    }

    updateTarget(x, y) {

        this.target.x = x;
        this.target.y = y;

    }

    reset() {

        this.updateTarget(
            this.game.eel.x,
            this.game.eel.y
        );

    }

}
