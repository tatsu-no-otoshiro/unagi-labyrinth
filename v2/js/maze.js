import { CONFIG } from "./config.js";

export class Maze {

    constructor(game) {

        this.game = game;

        // ステージ一覧
        this.stages = {

        1: [
            "###############",
            "#        S    #",
            "# ### ####### #",
            "#   #     #   #",
            "### ##### # ###",
            "#   #     #   #",
            "# # # # ##### #",
            "# # # #     # #",
            "# # # ##### # #",
            "# #   #   # # #",
            "# ##### # # # #",
            "# #   # # #   #",
            "# # # # # #####",
            "#   #   #    G#",
            "###############"
        ]

        2: [
            "###############",
            "#             #",
            "#   ### ###   #",
            "#             #",
            "# ###     ### #",
            "#             #",
            "#   ### ###   #",
            "#      S      #",
            "#   ### ###   #",
            "#             #",
            "# ###     ### #",
            "#             #",
            "#   ### ###   #",
            "#             #",
            "###############"
        ]

         };

        // 現在のステージ番号
        this.stage = 1;

        // 現在読み込まれているマップ
        this.map = this.stages[this.stage];

        this.tileSize = CONFIG.TILE_SIZE_MIN;
        this.offsetX = 0;
        this.offsetY = 0;

        this.walls = [];

        this.start = {
            x: 0,
            y: 0
        };

        this.goal = {
            x: 0,
            y: 0,
            radius: CONFIG.GOAL_RADIUS
        };

    }

    build() {

        this.walls = [];

        const canvas = this.game.canvas;

        this.tileSize = Math.floor(
            Math.min(
                (canvas.width - CONFIG.MAP_MARGIN) / CONFIG.MAP_SIZE,
                (canvas.height - CONFIG.MAP_MARGIN) / CONFIG.MAP_SIZE
            )
        );

        this.offsetX =
            (canvas.width - this.tileSize * CONFIG.MAP_SIZE) / 2;

        this.offsetY =
            (canvas.height - this.tileSize * CONFIG.MAP_SIZE) / 2;

        const rows = this.map.length;
        const cols = this.map[0].length;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {

                const ch = this.map[y][x];

                const px = this.offsetX + x * this.tileSize;
                const py = this.offsetY + y * this.tileSize;

                if (ch === "#") {

                    this.walls.push({
                        x: px,
                        y: py
                    });

                } else if (ch === "S") {

                    this.start.x = px + this.tileSize / 2;
                    this.start.y = py + this.tileSize / 2;

                } else if (ch === "G") {

                    this.goal.x = px + this.tileSize / 2;
                    this.goal.y = py + this.tileSize / 2;

                }

            }

        }

    }

    /**
     * ステージを切り替える
     * @param {number} stageNumber
     */
    setStage(stageNumber) {

        if (this.stages[stageNumber]) {

            this.stage = stageNumber;
            this.map = this.stages[stageNumber];

            this.build();

        }

    }

}
