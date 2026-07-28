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

            // 胸びれ
	    this.drawPectoralFins(ctx, drawPoints);

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

	    // 基本半径（スマホでは少し細く描く）
	    let radius =
    		this.game.maze.tileSize < 40
        	    ? CONFIG.BODY_RADIUS * 0.88
        	    : CONFIG.BODY_RADIUS;

	    // 尾側だけ徐々に細くする
	    if (i >= tailStart) {

    		radius -= (i - tailStart + 1) * 1.0;

	    }

	    // 最小半径を保証
	    radius = Math.max(radius, 1.2);

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

	// 尾先の基準点を少し内側へ戻す
	const baseX = tail.x * 0.75 + prev1.x * 0.25;
	const baseY = tail.y * 0.75 + prev1.y * 0.25;

	const prev2 = drawPoints[drawPoints.length - 3];

        // 最後の2本のベクトル
	const dx1 = tail.x - prev1.x;
	const dy1 = tail.y - prev1.y;

	const dx2 = prev1.x - prev2.x;
	const dy2 = prev1.y - prev2.y;

	// 基本方向（平均）
	let dx = dx1 + dx2;
	let dy = dy1 + dy2;

	// 正規化
	let len = Math.hypot(dx, dy);

	if (len > 0.001) {

    	    dx /= len;
    	    dy /= len;

    	    // 曲がり方向
    	    const cross = dx1 * dy2 - dy1 * dx2;

    	    // 曲がりが十分ある時だけ補正
    	    if (Math.abs(cross) > 1.0) {

        	// 極小補正
        	const bend = Math.sign(cross) * 0.035;

        	const rx = -dy;
        	const ry = dx;

        	// 以前と逆向きに回す
        	dx -= rx * bend;
        	dy -= ry * bend;

        	// 再正規化
        	len = Math.hypot(dx, dy);
        	dx /= len;
        	dy /= len;
    	    }

    	    const ux = dx;
    	    const uy = dy;

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
                baseX + px * tipWidth,
                baseY + py * tipWidth
            );

            // 尖った先端
            ctx.lineTo(
                baseX + ux * tipLength,
                baseY + uy * tipLength
            );

            // 右根元
            ctx.lineTo(
                baseX - px * tipWidth,
                baseY - py * tipWidth
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
    	        baseX + px * tipWidth,
    	        baseY + py * tipWidth
	    );

	    // 左側の曲線
	    ctx.quadraticCurveTo(
    		baseX + ux * curveForward + px * curveWidth,
    		baseY + uy * curveForward + py * curveWidth,
    		baseX + ux * tipLength,
    		baseY + uy * tipLength
	    );

	    // 右側の曲線
	    ctx.quadraticCurveTo(
    		baseX + ux * curveForward - px * curveWidth,
    		baseY + uy * curveForward - py * curveWidth,
    		baseX - px * tipWidth,
    		baseY - py * tipWidth
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

	// 胴体の向き
	const bodyDx = base.x - next.x;
	const bodyDy = base.y - next.y;

	const bodyLen = Math.hypot(bodyDx, bodyDy);

	if (bodyLen < 0.001) return;

	const bodyUx = bodyDx / bodyLen;
	const bodyUy = bodyDy / bodyLen;

	const ux = bodyUx;
	const uy = bodyUy;

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

	ctx.fillStyle = "#2b261d";

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
