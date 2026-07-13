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

        for (let i = 0; i < CONFIG.BODY_COUNT; i++) {

            this.body.push({
                x: this.x,
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

        for (let i = 0; i < this.body.length; i++) {

            let target;

            if (i === 0) {

                target = this;

            } else {

                target = this.body[i - 1];

            }

            const dx = target.x - this.body[i].x;
            const dy = target.y - this.body[i].y;

            const dist = Math.hypot(dx, dy);

            const spacing = CONFIG.BODY_RADIUS * 1.8;

            if (dist > spacing) {

                this.body[i].x =
                    target.x - dx / dist * spacing;

                this.body[i].y =
                    target.y - dy / dist * spacing;

            }

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
