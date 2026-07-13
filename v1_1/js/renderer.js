import { CONFIG } from "./config.js";

export class Renderer {

    constructor(game) {

        this.game = game;

    }

    draw() {

        const ctx = this.game.ctx;
        const canvas = this.game.canvas;

        const maze = this.game.maze;
        const eel = this.game.eel;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 壁
        ctx.fillStyle = CONFIG.COLORS.WALL;

        for (const wall of maze.walls) {

            ctx.fillRect(
                wall.x,
                wall.y,
                maze.tileSize,
                maze.tileSize
            );

        }

        // ゴール
        ctx.fillStyle = CONFIG.COLORS.GOAL;

        ctx.beginPath();

        ctx.arc(
            maze.goal.x,
            maze.goal.y,
            maze.goal.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // ウナギ 胴体
        ctx.save();

        ctx.translate(eel.body.x, eel.body.y);

        ctx.fillStyle = CONFIG.COLORS.EEL;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            CONFIG.BODY_RADIUS,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

        // ウナギ 頭
        ctx.save();

        ctx.translate(eel.x, eel.y);

        ctx.rotate(eel.angle);

        ctx.fillStyle = CONFIG.COLORS.EEL;

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            maze.tileSize * 0.45,
            maze.tileSize * 0.18,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

}
