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

            // 胸びれ
	    this.drawPectoralFins(ctx, drawPoints);

            // 一本線
	    this.drawBodyLine(ctx, drawPoints);

            // 節
	    this.drawBodySegments(ctx, drawPoints);

	    // 尾端
	    this.drawTailTip(ctx, drawPoints);

        }

        // 頭
        this.drawHead(ctx, eel);

    }

    /**
     * ウナギの胴体ラインを描画する
     * @param {CanvasRenderingContext2D} ctx
     * @param {Array} drawPoints
     */
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

    /**
     * ウナギの節を描画する
     * @param {CanvasRenderingContext2D} ctx
     * @param {Array} drawPoints
     */
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

	const prev1 = drawPoints[drawPoints.length - 2];
	const prev2 = drawPoints[drawPoints.length - 3];

        // 最後の2本のベクトル
	const dx1 = tail.x - prev1.x;
	const dy1 = tail.y - prev1.y;

	const dx2 = prev1.x - prev2.x;
	const dy2 = prev1.y - prev2.y;

	// 現在の向きを70%、一つ前を30%採用
	const currentWeight =
    	    CONFIG.TAIL_DIRECTION_CURRENT;

	const previousWeight =
    	    CONFIG.TAIL_DIRECTION_PREVIOUS;

	const dx =
    	    dx1 * currentWeight +
    	    dx2 * previousWeight;

	const dy =
    	    dy1 * currentWeight +
    	    dy2 * previousWeight;

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

	    // 曲線の制御
	    const curveForward = CONFIG.TAIL_CURVE_FORWARD;
	    const curveWidth   = CONFIG.TAIL_CURVE_WIDTH;

	   /*
	    // --------------------
	    // 三角形版
	    // --------------------

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
	   */

	    // --------------------
	    // 涙滴形版（Bezier）
	    // --------------------

	    ctx.beginPath();

	    // 左根元
	    ctx.moveTo(
    	        tail.x + px * tipWidth,
    	        tail.y + py * tipWidth
	    );

	    // 左側の曲線
	    ctx.quadraticCurveTo(
    		tail.x + ux * curveForward + px * curveWidth,
    		tail.y + uy * curveForward + py * curveWidth,
    		tail.x + ux * tipLength,
    		tail.y + uy * tipLength
	    );

	    // 右側の曲線
	    ctx.quadraticCurveTo(
    		tail.x + ux * curveForward - px * curveWidth,
    		tail.y + uy * curveForward - py * curveWidth,
    		tail.x - px * tipWidth,
    		tail.y - py * tipWidth
	    );

	    ctx.closePath();
	    ctx.fill();

        }
    }

    /**
     * ウナギの胸びれを描画する
     * @param {CanvasRenderingContext2D} ctx
     * @param {Array} drawPoints
     */
    drawPectoralFins(ctx, drawPoints) {

	if (drawPoints.length < 4) return;
	
	// 胸びれの付け根（最初の胴体）
	const base = drawPoints[1];

	// 次の節
	const next = drawPoints[2];

	// 頭の向き
	const headUx = Math.cos(this.game.eel.angle);
	const headUy = Math.sin(this.game.eel.angle);

	// 胴体の向き
	const bodyDx = next.x - base.x;
	const bodyDy = next.y - base.y;

	const bodyLen = Math.hypot(bodyDx, bodyDy);

	if (bodyLen < 0.001) return;

	const bodyUx = bodyDx / bodyLen;
	const bodyUy = bodyDy / bodyLen;

	// 頭70%＋胴体30%
	let ux = headUx * 0.7 + bodyUx * 0.3;
	let uy = headUy * 0.7 + bodyUy * 0.3;

	const len = Math.hypot(ux, uy);

	ux /= len;
	uy /= len;

	const px = -uy;
	const py = ux;

	// 左右の付け根
	const leftFinX  = base.x + px * 2;
	const leftFinY  = base.y + py * 2;

	const rightFinX = base.x - px * 2;
	const rightFinY = base.y - py * 2;

	ctx.fillStyle = CONFIG.COLORS.FIN;


	// ===== 左胸びれ =====
	ctx.beginPath();

	ctx.moveTo(leftFinX, leftFinY);

	ctx.lineTo(
    	    leftFinX - ux * 10 + px * 12,
    	    leftFinY - uy * 10 + py * 12
	);

	ctx.quadraticCurveTo(

    	    leftFinX + px * 20 - ux * 2,
    	    leftFinY + py * 20 - uy * 2,

    	    leftFinX,
    	    leftFinY

	);

	ctx.closePath();
	ctx.fill();


	// ===== 右胸びれ =====
	ctx.beginPath();

	ctx.moveTo(rightFinX, rightFinY);

	ctx.lineTo(
    	    rightFinX - ux * 10 - px * 12,
    	    rightFinY - uy * 10 - py * 12
	);

	ctx.quadraticCurveTo(

    	    rightFinX - px * 20 - ux * 2,
    	    rightFinY - py * 20 - uy * 2,

    	    rightFinX,
    	    rightFinY

	);

	ctx.closePath();
	ctx.fill();
    }

    /**
     * ウナギの頭を描画する
     * @param {CanvasRenderingContext2D} ctx
     * @param {Array} drawPoints
     */
    drawHead(ctx, eel) {
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

	// ===== 左右の目 =====

	ctx.fillStyle = "#111";

	// 左目
	ctx.beginPath();
	ctx.arc(
    	    headWidth * 0.48,
    	    -headHeight * 0.70,
    	    CONFIG.EYE_RADIUS,
    	    0,
    	    Math.PI * 2
	);
	ctx.fill();

	// 右目
	ctx.beginPath();
	ctx.arc(
    	    headWidth * 0.48,
    	    headHeight * 0.70,
    	    CONFIG.EYE_RADIUS,
    	    0,
    	    Math.PI * 2
	);
	ctx.fill();

        ctx.restore();
    }

}
