import { Maze } from "./maze.js";
import { Eel } from "./eel.js";
import { Input } from "./input.js";
import { Renderer } from "./renderer.js";

export class Game {

    constructor() {

        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");

        // 各クラス生成
        this.maze = new Maze(this);
        this.eel = new Eel(this);
        this.input = new Input(this);
        this.renderer = new Renderer(this);

        // 敵一覧
        this.enemies = [];

        // ゲーム状態
        this.isCleared = false;
        this.isGameOver = false;

        // タイマー
        this.startTime = 0;
        this.clearTime = 0;

        // GAME OVER 時点の経過時間
        this.gameOverElapsed = 0;

        // requestAnimationFrame 管理
        this.animationId = null;

        // サバイバル設定
        this.survivalLimit = 20; // 秒

        // 敵増殖設定
        this.maxEnemies = 4;
        this.spawnInterval = 5; // 秒
        this.spawnCount = 1;    // 初期1体

        // リサイズイベント
        window.addEventListener("resize", () => this.resize());

        // 一時停止管理
        this.pauseStart = 0;

        // タブ非表示中は一時停止
        document.addEventListener("visibilitychange", () => {

            if (document.hidden) {

                this.pauseStart = performance.now();

            } else {

                if (this.pauseStart) {

                    const paused =
                        performance.now() - this.pauseStart;

                    this.startTime += paused;
                    this.pauseStart = 0;

                }

             }

        });

        // クリア画面タップ／クリックでリトライ
        const retry = () => {
            if (this.isCleared || this.isGameOver) {
                this.restart();
            }
        };

        this.canvas.addEventListener("click", retry);
        this.canvas.addEventListener("touchstart", retry);

    }

    start() {

        this.startTime = performance.now();
        this.clearTime = 0;

        this.isCleared = false;
        this.isGameOver = false;

        this.resize();

        // Stage2 テスト
        this.maze.setStage(2);

        // 敵を初期化（1体）
        this.enemies = [
            {
                x: this.maze.offsetX + this.maze.tileSize * 1.5,
                y: this.maze.offsetY + this.maze.tileSize * 1.5,
                radius: 12
            }
        ];

        this.eel.reset();
        this.input.reset();

        // 増殖状態リセット
        this.spawnCount = 1;

        // 古いループを停止
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.loop();

    }

    resize() {

        this.startTime = performance.now();
        this.clearTime = 0;

        this.isCleared = false;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.maze.build();

        this.eel.reset();
        this.input.reset();

    }

    update() {

        // クリア中・ゲームオーバー中は停止
        if (this.isCleared || this.isGameOver) return;

        this.eel.update();

        // 敵をゆっくり追尾
        for (const virus of this.enemies) {

            if (!virus) continue;

            const dx = this.eel.head.x - virus.x;
            const dy = this.eel.head.y - virus.y;

            const len = Math.hypot(dx, dy);

            if (len > 0.001) {

                // PC は少し速く
                const isWide =
                    this.canvas.width >= 700;

                const speed = isWide ? 0.80 : 0.60;

                virus.x += dx / len * speed;
                virus.y += dy / len * speed;

            }

        }

        // ウイルス接触判定
        if (this.isHitVirus()) {

            this.gameOver();
            return;

        }

        // Stage1: ゴール判定
        if (this.maze.stage === 1 && this.isGoal()) {

            this.clearTime =
                (performance.now() - this.startTime) / 1000;

            this.clear();
            return;

        }

        // 敵増殖
        if (this.maze.stage === 2) {

            const elapsed =
                (performance.now() - this.startTime) / 1000;

            const targetCount =
                Math.min(
                    this.maxEnemies,
                    1 + Math.floor(elapsed / this.spawnInterval)
                );

            while (this.spawnCount < targetCount) {

                this.spawnEnemy(this.spawnCount);
                this.spawnCount++;

            }

        }

        // Stage2: サバイバル判定
        if (this.maze.stage === 2) {

            const elapsed =
                (performance.now() - this.startTime) / 1000;

            if (elapsed >= this.survivalLimit) {

                this.clearTime = this.survivalLimit;
                this.clear();
                return;

            }

        }

    }

    goalDisabled() {
        return this.maze.goal.x < 0;
    }

    isGoal() {

        // ゴールが存在しないステージ
        if (this.goalDisabled()) return false;

        const goal = this.maze.goal;
        const eel = this.eel;

        return (
            Math.hypot(goal.x - eel.x, goal.y - eel.y) <
            goal.radius + eel.radius
        );
    }

    isHitVirus() {

        for (const enemy of this.enemies) {

            if (!enemy) continue;

            // 頭判定
            {
                const dx = this.eel.head.x - enemy.x;
                const dy = this.eel.head.y - enemy.y;

                if (
                    Math.hypot(dx, dy) <
                    this.eel.radius + enemy.radius
                ) {
                    return true;
                }
            }

            // 胴体判定
            for (const p of this.eel.body) {

                const dx = p.x - enemy.x;
                const dy = p.y - enemy.y;

                if (
                    Math.hypot(dx, dy) <
                    p.radius + enemy.radius
                ) {
                    return true;
                }

            }

        }

        return false;

    }

    clear() {

        this.isCleared = true;

        // clearTime は呼び出し側で設定する

        this.isGameOver = false;

    }

    gameOver() {

        this.gameOverElapsed =
            (performance.now() - this.startTime) / 1000;

        this.isGameOver = true;
        this.isCleared = false;

    }

    spawnEnemy(index) {

        const ts = this.maze.tileSize;
        const ox = this.maze.offsetX;
        const oy = this.maze.offsetY;

        const positions = [

            // 左上
            { x: ox + ts * 1.5,  y: oy + ts * 1.5 },

            // 右上
            { x: ox + ts * 13.5, y: oy + ts * 1.5 },

            // 左下
            { x: ox + ts * 1.5,  y: oy + ts * 13.5 },

            // 右下
            { x: ox + ts * 13.5, y: oy + ts * 13.5 }

        ];

        const p = positions[index];

        this.enemies.push({
            x: p.x,
            y: p.y,
            radius: 12
        });

    }

    restart() {

        this.start();

    }

    draw() {

        this.renderer.draw();

    }

    loop() {

        this.update();

        this.draw();

        this.animationId =
            requestAnimationFrame(() => this.loop());

    }

}
