export class Eel {

    constructor(game) {

        this.game = game;

        this.x = 0;
        this.y = 0;

        this.angle = 0;

        this.speed = 2.5;
        this.radius = 8;

    }

    reset() {

        const start = this.game.maze.start;

        this.x = start.x;
        this.y = start.y;

        this.angle = 0;

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
