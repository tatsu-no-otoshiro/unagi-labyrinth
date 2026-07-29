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

        // リサイズイベント
        window.addEventListener("resize", () => this.resize());

    }

    start() {

        this.resize();

        this.eel.reset();
        this.input.reset();

        this.loop();

    }

    resize() {

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.maze.build();

        this.eel.reset();
        this.input.reset();

    }

    update() {
        this.eel.update();

        if (this.isGoal()) {
            this.clear();
        }
    }

    isGoal() {
        const goal = this.maze.goal;
        const eel = this.eel;

        return (
            Math.hypot(goal.x - eel.x, goal.y - eel.y) <
            goal.radius + eel.radius
        );
    }

    clear() {
        alert("クリア");

        this.maze.build();
        this.eel.reset();
        this.input.reset();
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
