import { CONFIG } from "./config.js";

export class Eel {

    constructor(game) {

        this.game = game;

        this.x = 0;
        this.y = 0;

        this.angle = 0;

        this.headBackX = 0;
        this.headBackY = 0;

        this.head = {
            x: 0,
            y: 0
        };

        this.speed = CONFIG.EEL_SPEED;
        this.radius = CONFIG.EEL_RADIUS;

        // 互換性維持（今回は使用しない）
        this.history = [];

        this.body = [];

    }

    reset() {

        const start = this.game.maze.start;

        this.x = start.x;
        this.y = start.y;

        this.angle = 0;

        const headLength =
    	    this.game.maze.tileSize * CONFIG.HEAD_LENGTH_RATIO;

        this.headBackX = this.x - headLength;
        this.headBackY = this.y;

        this.head.x = this.headBackX;
        this.head.y = this.headBackY;

        this.history = [];

        this.body = [];

        // 頭の後ろへ一定間隔で並べる
        const spacing =
            CONFIG.BODY_DELAY * this.speed;

        for (let i = 0; i < CONFIG.BODY_COUNT; i++) {

    	    this.body.push({

        	x:
            	    this.head.x -
            	    spacing * (i + 1),

        	y:
            	    this.head.y

    	    });

	}

    }

    update() {

        const target = this.game.input.target;

        const dx = target.x - this.x;
        const dy = target.y - this.y;

        const distance = Math.hypot(dx, dy);

        if (distance > 1) {

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

        // 頭の後端座標
        const headLength =
            this.game.maze.tileSize * CONFIG.HEAD_LENGTH_RATIO;

        this.headBackX =
            this.x -
            Math.cos(this.angle) * headLength;

        this.headBackY =
            this.y -
            Math.sin(this.angle) * headLength;

        // Head節を頭の後端へ滑らかに追従させる
        const headFollow = 0.35;

        this.head.x +=
            (this.headBackX - this.head.x) * headFollow;

        this.head.y +=
            (this.headBackY - this.head.y) * headFollow;

        // ---------- 胴体追従 ----------
        const spacing =
            CONFIG.BODY_DELAY * this.speed;

        // body[0] は鼻先ではなく頭の後端を追従する
        let leader = this.head;

	const maze = this.game.maze;

        for (const part of this.body) {

            const vx = part.x - leader.x;
            const vy = part.y - leader.y;

            const d = Math.hypot(vx, vy);

            if (d > spacing) {

                const ratio = spacing / d;

                part.x =
                    leader.x + vx * ratio;

                part.y =
                    leader.y + vy * ratio;

            }

	    // 壁から軽く押し戻す
	    for (const wall of maze.walls) {

    		const nearestX = Math.max(
        	    wall.x,
        	    Math.min(part.x, wall.x + maze.tileSize)
    		);

    		const nearestY = Math.max(
        	    wall.y,
        	    Math.min(part.y, wall.y + maze.tileSize)
    		);

    		const dxw = part.x - nearestX;
    		const dyw = part.y - nearestY;

    		const dist = Math.hypot(dxw, dyw);

    		// 少しだけ余裕を残す
    		const limit = this.radius * 0.9;

    		if (dist > 0 && dist < limit) {

        	    const push = limit - dist;

        	    part.x += dxw / dist * push;
        	    part.y += dyw / dist * push;

    		}
	    }

            leader = part;

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
