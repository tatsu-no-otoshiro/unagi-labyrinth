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

        // 敵を左上へ配置
        this.enemy.x = this.maze.offsetX + this.maze.tileSize * 1.5;
        this.enemy.y = this.maze.offsetY + this.maze.tileSize * 1.5;

        this.eel.reset();
        this.input.reset();

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
        const dx = this.eel.head.x - this.enemy.x;
        const dy = this.eel.head.y - this.enemy.y;

        const len = Math.hypot(dx, dy);

        if (len > 0.001) {

            const speed = 0.6;

            this.enemy.x += dx / len * speed;
            this.enemy.y += dy / len * speed;

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

        const enemy = this.enemy;

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
