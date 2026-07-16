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

        // 背景
        ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

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

        // --------------------
        // 胴体
        // --------------------

        if (eel.body.length > 0) {

            // 波アニメーション
            if (this.waveTime === undefined) {
                this.waveTime = 0;
            }
            this.waveTime += 0.08;

            const drawPoints = [];

            // 中心線の先頭（鼻先）
            drawPoints.push({
                x: eel.x,
                y: eel.y
            });

            // 頭の節
            drawPoints.push({
                x: eel.head.x,
                y: eel.head.y
            });

            // 胴体
            for (let i = 0; i < eel.body.length; i++) {

                const part = eel.body[i];

                // 前の節（0番は頭）
                const prev =
                    (i === 0)
                        ? eel.head
                        : eel.body[i - 1];

                let dx = prev.x - part.x;
                let dy = prev.y - part.y;

                const len = Math.hypot(dx, dy);

                let nx = 0;
                let ny = 0;

                if (len > 0.001) {
                    nx = -dy / len;
                    ny = dx / len;
                }

                // 中央付近だけ大きく揺らす
                const t = (i + 1) / (eel.body.length + 1);

                const amplitude =
                    Math.sin(t * Math.PI) * 3;

                const offset =
                    Math.sin(this.waveTime - i * 0.55)
                    * amplitude;

                drawPoints.push({

                    x: part.x + nx * offset,
                    y: part.y + ny * offset

                });

            }

            // 一本線
            ctx.strokeStyle = CONFIG.COLORS.EEL;
            ctx.lineWidth = CONFIG.BODY_RADIUS * 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.beginPath();

            ctx.moveTo(
                drawPoints[drawPoints.length - 1].x,
                drawPoints[drawPoints.length - 1].y
            );

            for (let i = drawPoints.length - 2; i >= 0; i--) {

                ctx.lineTo(
                    drawPoints[i].x,
                    drawPoints[i].y
                );

            }

            ctx.stroke();

            // 節
            ctx.fillStyle = CONFIG.COLORS.EEL;

            for (let i = 1; i < drawPoints.length; i++) {

                ctx.beginPath();

                ctx.arc(
                    drawPoints[i].x,
                    drawPoints[i].y,
                    CONFIG.BODY_RADIUS,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }

        }

        // --------------------
        // 頭
        // --------------------

        ctx.save();

        // 鼻先から頭の中心までの距離
        const headOffset = maze.tileSize * 0.18;

        // 頭の中心を少し後ろへ下げる
        const headCenterX =
            eel.x - Math.cos(eel.angle) * headOffset;

        const headCenterY =
            eel.y - Math.sin(eel.angle) * headOffset;

        ctx.translate(
            headCenterX,
            headCenterY
        );

        ctx.rotate(
            eel.angle
        );

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
