import { CONFIG } from "./config.js";

export class Eel {

    constructor(game) {

        this.game = game;

        this.x = 0;
        this.y = 0;

        this.angle = 0;

        this.speed = CONFIG.EEL_SPEED;
        this.radius = CONFIG.EEL_RADIUS;

        this.history = [];

        this.body = [];

    }

    reset() {

        const start = this.game.maze.start;

        this.x = start.x;
        this.y = start.y;

        this.angle = 0;

        this.history = [];

        this.body = [];

        // 胴体を初期配置
        const spacing = CONFIG.BODY_DELAY * this.speed;

        for (let i = 0; i < CONFIG.BODY_COUNT; i++) {

            this.body.push({
                x: this.x - (i + 1) * spacing,
                y: this.y
            });

        }

        // 履歴を初期化
        const maxHistory =
            CONFIG.BODY_COUNT * CONFIG.BODY_DELAY + 10;

        for (let i = maxHistory; i >= 0; i--) {

            this.history.push({
                x: this.x - i * this.speed,
                y: this.y
            });

        }

    }

    update() {

        const target = this.game.input.target;

        const dx = target.x - this.x;
        const dy = target.y - this.y;

        const distance = Math.hypot(dx, dy);

        if (distance <= 1) {
            return;
        }

        this.angle = Math.atan2(dy, dx);

        const oldX = this.x;

        this.x += dx / distance * this.speed;

        if (this.hitWall()) {
            this.x = oldX;
        }

        const oldY = this.y;

        this.y += dy / distance * this.speed;

        if (this.hitWall()) {
            this.y = oldY;
        }

        this.history.unshift({
            x: this.x,
            y: this.y
        });

        for (let i = 0; i < this.body.length; i++) {

            const index =
                (i + 1) * CONFIG.BODY_DELAY;

            if (this.history.length > index) {

                this.body[i].x =
                    this.history[index].x;

                this.body[i].y =
                    this.history[index].y;

            }

        }

        const maxHistory =
            CONFIG.BODY_COUNT * CONFIG.BODY_DELAY + 10;

        if (this.history.length > maxHistory) {
            this.history.pop();
        }

    }

    hitWall() {

        const maze = this.game.maze;

        for (const wall of maze.walls) {

            if (
                this.x + this.radius > wall.x &&
                this.x - this.radius < wall.x + maze.tileSize &&
                this.y + this.radius > wall.y &&
                this.y - this.radius < wall.y + maze.tileSize
            ) {
                return true;
            }

        }

        return false;

    }

}
