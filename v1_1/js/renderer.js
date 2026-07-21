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

	    // --------------------
	    // 描画用データ生成
	    // --------------------

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

	    // --------------------
	    // 描画
	    // --------------------

            // 一本線
	    this.drawBodyLine(ctx, drawPoints);

            // 節
	    this.drawBodySegments(ctx, drawPoints);

	    // 尾端
	    this.drawTailTip(ctx, drawPoints);

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

    drawBodyLine(ctx, drawPoints) {

        ctx.strokeStyle = CONFIG.COLORS.EEL;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = drawPoints.length - 1; i > 1; i--) {

            const p0 = drawPoints[i];
            const p1 = drawPoints[i - 1];

            // 尻尾=0、頭=1 の割合
            const t = 1 - (i - 1) / (drawPoints.length - 2);

            // 首は少し細く、中央が最大、尻尾へ向かって細く
            let widthScale =
                0.92 +
                Math.sin(t * Math.PI) * 0.33;

            if (t < 0.25) {

                const k = t / 0.25;

                widthScale *=
                    0.6 + 0.4 * k;

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

    }

    drawBodySegments(ctx, drawPoints) {

	ctx.fillStyle = CONFIG.COLORS.EEL;

        for (let i = 1; i < drawPoints.length; i++) {

	    const tailStart = drawPoints.length - 4;

	    let radius = CONFIG.BODY_RADIUS;

	    if (i >= tailStart) {

    		radius -= (i - tailStart + 1) * 1.0;

	    }

            ctx.beginPath();

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

    /**
     * ウナギの尾端を描画する
     * @param {CanvasRenderingContext2D} ctx
     * @param {Array} drawPoints
     */
    drawTailTip(ctx, drawPoints) {

        const tail = drawPoints[drawPoints.length - 1];
        const prev = drawPoints[drawPoints.length - 2];

        const dx = tail.x - prev.x;
        const dy = tail.y - prev.y;

        const len = Math.hypot(dx, dy);

        if (len > 0.001) {

            const ux = dx / len;
            const uy = dy / len;

            ctx.fillStyle = CONFIG.COLORS.EEL;

            // 方向ベクトルに対して垂直方向
            const px = -uy;
            const py = ux;

            // 尾先の長さ
            const tipLength = CONFIG.TAIL_TIP_LENGTH;

            // 尾先の幅
            const tipWidth  = CONFIG.TAIL_TIP_WIDTH;

            ctx.beginPath();

            // 左根元
            ctx.moveTo(
                tail.x + px * tipWidth,
                tail.y + py * tipWidth
            );

            // 尖った先端
            ctx.lineTo(
                tail.x + ux * tipLength,
                tail.y + uy * tipLength
            );

            // 右根元
            ctx.lineTo(
                tail.x - px * tipWidth,
                tail.y - py * tipWidth
            );

            ctx.closePath();
            ctx.fill();

        }

    }

}
