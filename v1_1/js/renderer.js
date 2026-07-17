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
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            for (let i = drawPoints.length - 1; i > 1; i--) {

                const p0 = drawPoints[i];
                const p1 = drawPoints[i - 1];

                // 頭=0、尻尾=1 の割合
                const t = 1 - (i - 1) / (drawPoints.length - 2);

                // 首は少し細く、中央が最大、尻尾へ向かって細く
                let widthScale =
    		    0.92 +
    		    Math.sin(t * Math.PI) * 0.33;

		// 尾柄・尾先だけ細くする
		if (t > 0.75) {

    		    const k = (t - 0.75) / 0.25;

    		    widthScale *=
        		1 - 0.45 * k;

		}

                ctx.lineWidth =
                    CONFIG.BODY_RADIUS * 2 * widthScale;

                ctx.beginPath();

                ctx.moveTo(
                    p0.x,
                    p0.y
                );

                const mx = (p0.x + p1.x) * 0.5;
                const my = (p0.y + p1.y) * 0.5;

                ctx.quadraticCurveTo(
                    p0.x,
                    p0.y,
                    mx,
                    my
                );

                ctx.stroke();

            }

            // 節
            ctx.fillStyle = CONFIG.COLORS.EEL;

            for (let i = 1; i < drawPoints.length; i++) {

                ctx.beginPath();

                // 後半ほど細くする
		const t = (i - 1) / (drawPoints.length - 2);

		let radius = CONFIG.BODY_RADIUS;

		if (t > 0.75) {

    		    const k = (t - 0.75) / 0.25;

    		    radius =
        		CONFIG.BODY_RADIUS * (1 - 0.45 * k);

		}

		ctx.arc(
    		    drawPoints[i].x,
    		    drawPoints[i].y,
    		    radius,
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

        const headCenterX = (eel.x + eel.head.x) * 0.5;
        const headCenterY = (eel.y + eel.head.y) * 0.5;

        ctx.translate(
            headCenterX,
            headCenterY
        );

        ctx.rotate(
            eel.angle
        );

        ctx.fillStyle = CONFIG.COLORS.EEL;

        ctx.beginPath();

        const headWidth =
            CONFIG.BODY_RADIUS * 2.5;

        const headHeight =
            CONFIG.BODY_RADIUS * 1.25;

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            headWidth,
            headHeight,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

}
