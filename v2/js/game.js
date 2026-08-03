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

        // 敵（試作）
        this.enemy = {

            x: 0,
            y: 0,
            radius: 12

        };

        // ゲーム状態
        this.isCleared = false;

        // タイマー
        this.startTime = 0;
        this.clearTime = 0;

        // サバイバル設定
        this.survivalLimit = 20; // 秒

        // リサイズイベント
        window.addEventListener("resize", () => this.resize());

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

        // 一時停止管理
        this.pauseStart = 0;

        // クリア画面タップ／クリックでリトライ
        const retry = () => {
            if (this.isCleared) {
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

        this.resize();

        // Stage2 テスト
        this.maze.setStage(2);

        // 敵を左上へ配置
        this.enemy.x = this.maze.offsetX + this.maze.tileSize * 1.5;
        this.enemy.y = this.maze.offsetY + this.maze.tileSize * 1.5;

        this.eel.reset();
        this.input.reset();

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

        // クリア中は移動停止
        if (this.isCleared) return;

        this.eel.update();

        // 敵をゆっくり追尾
        const dx = this.eel.head.x - this.enemy.x;
        const dy = this.eel.head.y - this.enemy.y;

        const len = Math.hypot(dx, dy);

        if (len > 0.001) {

            const speed = 0.6; // まずはかなり遅く

            this.enemy.x += dx / len * speed;
            this.enemy.y += dy / len * speed;

        }

        // サバイバルクリア判定
        const elapsed =
            (performance.now() - this.startTime) / 1000;

        if (elapsed >= this.survivalLimit) {

            this.clearTime = this.survivalLimit;
            this.clear();

        }

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

    goalDisabled() {
        return this.maze.goal.x < 0;
    }

    clear() {

        this.isCleared = true;

        this.clearTime =
            (performance.now() - this.startTime) / 1000;

        console.log(`CLEAR ${this.clearTime.toFixed(2)} sec`);

    }

    restart() {

        this.isCleared = false;

        // 同じ迷路で再スタート
        this.eel.reset();
        this.input.reset();

        this.startTime = performance.now();
        this.clearTime = 0;
    }

    draw() {

        this.renderer.draw();

    }

    loop() {

        this.update();

        this.draw();

        requestAnimationFrame(() => this.loop());

    }

}
