import { _decorator, Component, Node, Label, UITransform, Color, Size, Vec3, tween, Graphics, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 消消乐元素类型
 */
const MATCH3_TYPES = ['wood', 'stone', 'coin', 'star', 'heart', 'diamond'];
const MATCH3_EMOJIS: {[key: string]: string} = {
    wood: '🌲',
    stone: '⚪',
    coin: '💰',
    star: '⭐',
    heart: '❤️',
    diamond: '💎',
};
const MATCH3_COLORS: {[key: string]: Color} = {
    wood: new Color(139, 69, 19),
    stone: new Color(128, 128, 128),
    coin: new Color(255, 215, 0),
    star: new Color(255, 230, 109),
    heart: new Color(255, 107, 107),
    diamond: new Color(78, 205, 196),
};

/**
 * 关卡配置 (20关)
 */
const MATCH3_LEVELS = [
    // 1-5关：入门，无障碍
    { level: 1, moves: 30, target: { score: 300 }, stars: [300, 500, 800], reward: { coin: 50 } },
    { level: 2, moves: 28, target: { score: 500 }, stars: [500, 800, 1200], reward: { coin: 60 } },
    { level: 3, moves: 26, target: { score: 700 }, stars: [700, 1100, 1500], reward: { coin: 70 } },
    { level: 4, moves: 25, target: { score: 900 }, stars: [900, 1400, 1900], reward: { coin: 80 } },
    { level: 5, moves: 25, target: { score: 1200 }, stars: [1200, 1800, 2500], reward: { coin: 100, diamond: 1 } },
    // 6-10关：引入冰块
    { level: 6, moves: 25, target: { score: 1400, ice: 3 }, stars: [1400, 2100, 2800], reward: { coin: 100 }, obstacles: { ice: [[0,0],[7,7],[3,3]] } },
    { level: 7, moves: 24, target: { score: 1600, ice: 5 }, stars: [1600, 2400, 3200], reward: { coin: 110 }, obstacles: { ice: [[0,0],[0,7],[7,0],[7,7],[3,3]] } },
    { level: 8, moves: 24, target: { score: 1800, ice: 6 }, stars: [1800, 2700, 3600], reward: { coin: 120 }, obstacles: { ice: [[1,1],[1,6],[6,1],[6,6],[3,3],[4,4]] } },
    { level: 9, moves: 23, target: { score: 2000, ice: 8 }, stars: [2000, 3000, 4000], reward: { coin: 130 }, obstacles: { ice: [[0,0],[0,7],[7,0],[7,7],[2,3],[2,4],[5,3],[5,4]] } },
    { level: 10, moves: 20, target: { score: 2600, ice: 10 }, stars: [2600, 3900, 5200], reward: { coin: 150, diamond: 2 }, obstacles: { ice: [[0,3],[0,4],[3,0],[3,7],[4,0],[4,7],[7,3],[7,4],[3,3],[4,4]] } },
    // 11-15关：引入石头
    { level: 11, moves: 20, target: { score: 2800, stone: 4 }, stars: [2800, 4200, 5600], reward: { coin: 150 }, obstacles: { stone: [[3,3],[3,4],[4,3],[4,4]] } },
    { level: 12, moves: 20, target: { score: 3000, stone: 6, ice: 6 }, stars: [3000, 4500, 6000], reward: { coin: 160 }, obstacles: { stone: [[2,2],[2,5],[5,2],[5,5],[3,3],[4,4]], ice: [[1,1],[1,6],[6,1],[6,6],[0,3],[7,4]] } },
    { level: 13, moves: 18, target: { score: 3200, stone: 8 }, stars: [3200, 4800, 6400], reward: { coin: 170 }, obstacles: { stone: [[2,2],[2,3],[2,4],[2,5],[5,2],[5,3],[5,4],[5,5]] } },
    { level: 14, moves: 18, target: { score: 3400, stone: 6, ice: 8 }, stars: [3400, 5100, 6800], reward: { coin: 180 }, obstacles: { stone: [[3,2],[3,5],[4,2],[4,5],[3,3],[4,4]], ice: [[0,0],[0,7],[7,0],[7,7],[1,3],[1,4],[6,3],[6,4]] } },
    { level: 15, moves: 18, target: { score: 3600, stone: 8, ice: 8 }, stars: [3600, 5400, 7200], reward: { coin: 200, diamond: 3 }, obstacles: { stone: [[2,2],[2,5],[5,2],[5,5],[3,3],[3,4],[4,3],[4,4]], ice: [[0,2],[0,5],[2,0],[2,7],[5,0],[5,7],[7,2],[7,5]] } },
    // 16-20关：引入铁链
    { level: 16, moves: 18, target: { score: 3800, chain: 6 }, stars: [3800, 5700, 7600], reward: { coin: 200 }, obstacles: { chain: [[2,2],[2,5],[5,2],[5,5],[3,3],[4,4]] } },
    { level: 17, moves: 16, target: { score: 4000, chain: 8, ice: 6 }, stars: [4000, 6000, 8000], reward: { coin: 220 }, obstacles: { chain: [[1,1],[1,6],[6,1],[6,6],[3,2],[3,5],[4,2],[4,5]], ice: [[0,3],[0,4],[7,3],[7,4],[3,0],[4,7]] } },
    { level: 18, moves: 16, target: { score: 4200, chain: 8, stone: 4 }, stars: [4200, 6300, 8400], reward: { coin: 240 }, obstacles: { chain: [[2,1],[2,6],[5,1],[5,6],[3,2],[3,5],[4,2],[4,5]], stone: [[3,3],[3,4],[4,3],[4,4]] } },
    { level: 19, moves: 15, target: { score: 4400, chain: 10, ice: 8 }, stars: [4400, 6600, 8800], reward: { coin: 260 }, obstacles: { chain: [[1,2],[1,3],[1,4],[1,5],[6,2],[6,3],[6,4],[6,5],[3,1],[4,6]], ice: [[0,0],[0,7],[7,0],[7,7],[2,3],[2,4],[5,3],[5,4]] } },
    { level: 20, moves: 15, target: { score: 5000, chain: 10, stone: 6, ice: 8 }, stars: [5000, 7500, 10000], reward: { coin: 500, diamond: 5 }, obstacles: { chain: [[1,1],[1,6],[6,1],[6,6],[2,3],[2,4],[5,3],[5,4],[3,2],[4,5]], stone: [[3,3],[3,4],[4,3],[4,4],[2,2],[5,5]], ice: [[0,2],[0,5],[2,0],[2,7],[5,0],[5,7],[7,2],[7,5]] } },
];

const GRID_COLS = 8;
const GRID_ROWS = 8;
const TILE_SIZE = 45;

interface Tile {
    node: Node;
    type: string;
    row: number;
    col: number;
    special?: 'stripe_h' | 'stripe_v' | 'rainbow';  // 特殊方块
    ice?: number;   // 冰层数
    chain?: boolean;  // 铁链
    obstacle?: 'stone';  // 障碍物
    hp?: number;  // 石头血量
}

interface LevelConfig {
    level: number;
    moves: number;
    target: {score: number; ice?: number; stone?: number; chain?: number};
    stars: number[];
    reward: {coin: number; diamond?: number};
    obstacles?: {ice?: number[][]; stone?: number[][]; chain?: number[][]};
}

/**
 * 消消乐游戏 - 完整版
 */
@ccclass('Match3Game')
export class Match3Game extends Component {
    // 游戏状态
    private board: (Tile | null)[][] = [];
    private selectedTile: Tile | null = null;
    private score: number = 0;
    private moves: number = 20;
    private level: number = 1;
    private levelConfig: LevelConfig | null = null;
    private isProcessing: boolean = false;
    private gameOver: boolean = false;
    private won: boolean = false;
    private stars: number = 0;
    private combo: number = 0;

    // 障碍物计数
    private iceCleared: number = 0;
    private stoneCleared: number = 0;
    private chainCleared: number = 0;

    // 最高关卡解锁
    private unlockedLevel: number = 1;
    private levelStars: number[] = [];  // 每关获得的星数

    // UI引用
    private gameContainer: Node | null = null;
    private gridContainer: Node | null = null;
    private scoreLabel: Label | null = null;
    private movesLabel: Label | null = null;
    private targetLabel: Label | null = null;
    private infoLabel: Label | null = null;

    // 当前场景
    private currentScene: 'levelSelect' | 'game' = 'levelSelect';

    start() {
        console.log('🧩 消消乐 - 完整版');
        this.loadProgress();
        this.showLevelSelect();
    }

    // =================== 关卡选择 ===================

    showLevelSelect() {
        this.currentScene = 'levelSelect';
        this.clearAll();

        this.gameContainer = new Node('LevelSelect');
        this.gameContainer.layer = this.node.layer;
        this.gameContainer.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(this.gameContainer);

        // 背景
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);
        graphics.fillColor = new Color(78, 205, 196);
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();
        this.gameContainer.addChild(bg);

        // 标题
        const title = this.createLabel('🧩 消消乐', 0, 320, 36);
        this.gameContainer.addChild(title);

        // 关卡网格
        const cols = 5;
        const rows = 4;
        const btnSize = 65;
        const spacing = 75;
        const startX = -(cols - 1) * spacing / 2;
        const startY = 180;

        for (let i = 0; i < 20; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = startX + col * spacing;
            const y = startY - row * spacing;
            const levelNum = i + 1;
            const unlocked = levelNum <= this.unlockedLevel;
            const starCount = this.levelStars[i] || 0;

            const btn = this.createLevelButton(levelNum, x, y, btnSize, unlocked, starCount);
            this.gameContainer.addChild(btn);
        }

        // 返回按钮
        const backBtn = this.createButton('← 返回', 0, -320, 120, 50, () => {
            director.loadScene('MainMenu');
        });
        this.gameContainer.addChild(backBtn);
    }

    createLevelButton(level: number, x: number, y: number, size: number, unlocked: boolean, stars: number): Node {
        const node = new Node(`Level_${level}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(size, size);

        const graphics = node.addComponent(Graphics);
        
        if (unlocked) {
            graphics.fillColor = new Color(255, 230, 109);
        } else {
            graphics.fillColor = new Color(100, 100, 100);
        }
        graphics.roundRect(-size/2, -size/2, size, size, 12);
        graphics.fill();

        // 关卡数字
        const label = this.createLabel(unlocked ? level.toString() : '🔒', 0, 5, 22);
        label.getComponent(Label)!.color = unlocked ? new Color(44, 62, 80) : new Color(150, 150, 150);
        node.addChild(label);

        // 星星
        if (unlocked && stars > 0) {
            const starsText = '⭐'.repeat(stars);
            const starsLabel = this.createLabel(starsText, 0, -20, 10);
            node.addChild(starsLabel);
        }

        node.setPosition(x, y, 0);

        if (unlocked) {
            node.on(Node.EventType.TOUCH_END, () => {
                this.startLevel(level);
            }, this);
        }

        return node;
    }

    // =================== 游戏主逻辑 ===================

    startLevel(level: number) {
        this.level = level;
        this.levelConfig = MATCH3_LEVELS[level - 1];
        this.currentScene = 'game';
        
        this.score = 0;
        this.moves = this.levelConfig.moves;
        this.combo = 0;
        this.iceCleared = 0;
        this.stoneCleared = 0;
        this.chainCleared = 0;
        this.gameOver = false;
        this.won = false;
        this.selectedTile = null;
        this.isProcessing = false;

        this.clearAll();
        this.initGameUI();
        this.initBoard();
    }

    initGameUI() {
        this.gameContainer = new Node('GameContainer');
        this.gameContainer.layer = this.node.layer;
        this.gameContainer.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(this.gameContainer);

        // 背景
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);
        graphics.fillColor = new Color(44, 62, 80);
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();
        this.gameContainer.addChild(bg);

        // 顶部信息栏
        this.drawTopBar();

        // 棋盘容器
        this.drawGridContainer();

        // 底部按钮
        const backBtn = this.createButton('← 退出', -120, -340, 100, 45, () => {
            this.showLevelSelect();
        });
        this.gameContainer.addChild(backBtn);

        const restartBtn = this.createButton('🔄 重玩', 120, -340, 100, 45, () => {
            this.startLevel(this.level);
        });
        this.gameContainer.addChild(restartBtn);
    }

    drawTopBar() {
        const bar = new Node('TopBar');
        bar.layer = this.node.layer;
        const graphics = bar.addComponent(Graphics);
        bar.addComponent(UITransform).setContentSize(380, 80);
        bar.setPosition(0, 330, 0);
        
        graphics.fillColor = new Color(0, 0, 0, 180);
        graphics.roundRect(-190, -40, 380, 80, 12);
        graphics.fill();
        
        this.gameContainer?.addChild(bar);

        // 关卡
        const levelLabel = this.createLabel(`第 ${this.level} 关`, 0, 20, 18);
        bar.addChild(levelLabel);

        // 分数
        const scoreNode = this.createLabel(`分数: ${this.score}`, -100, -15, 16);
        this.scoreLabel = scoreNode.getComponent(Label);
        bar.addChild(scoreNode);

        // 步数
        const movesNode = this.createLabel(`步数: ${this.moves}`, 100, -15, 16);
        this.movesLabel = movesNode.getComponent(Label);
        bar.addChild(movesNode);

        // 目标
        if (this.levelConfig) {
            let targetText = `目标: ${this.levelConfig.target.score}分`;
            if (this.levelConfig.target.ice) targetText += ` ❄️${this.levelConfig.target.ice}`;
            if (this.levelConfig.target.stone) targetText += ` 🪨${this.levelConfig.target.stone}`;
            if (this.levelConfig.target.chain) targetText += ` ⛓️${this.levelConfig.target.chain}`;
            
            const targetNode = this.createLabel(targetText, 0, 260, 14);
            this.targetLabel = targetNode.getComponent(Label);
            this.gameContainer?.addChild(targetNode);
        }
    }

    drawGridContainer() {
        const gridW = GRID_COLS * TILE_SIZE;
        const gridH = GRID_ROWS * TILE_SIZE;

        this.gridContainer = new Node('GridContainer');
        this.gridContainer.layer = this.node.layer;
        const transform = this.gridContainer.addComponent(UITransform);
        transform.setContentSize(gridW, gridH);
        transform.setAnchorPoint(0, 0);
        this.gridContainer.setPosition(-gridW / 2, -gridH / 2 - 20, 0);
        this.gameContainer?.addChild(this.gridContainer);

        // 绘制格子背景
        const bg = new Node('GridBg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(gridW, gridH);

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const x = col * TILE_SIZE;
                const y = row * TILE_SIZE;
                const isLight = (row + col) % 2 === 0;
                
                graphics.fillColor = isLight ? new Color(60, 80, 100) : new Color(50, 70, 90);
                graphics.roundRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2, 6);
                graphics.fill();
            }
        }
        this.gridContainer.addChild(bg);
    }

    initBoard() {
        this.board = [];
        
        // 初始化空棋盘
        for (let row = 0; row < GRID_ROWS; row++) {
            this.board[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                this.board[row][col] = null;
            }
        }

        // 放置障碍物
        if (this.levelConfig?.obstacles) {
            // 石头
            if (this.levelConfig.obstacles.stone) {
                for (const [col, row] of this.levelConfig.obstacles.stone) {
                    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
                        this.board[row][col] = this.createObstacleTile(row, col, 'stone');
                    }
                }
            }
        }

        // 填充方块（避免初始匹配）
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (!this.board[row][col]) {
                    let type: string;
                    do {
                        type = MATCH3_TYPES[Math.floor(Math.random() * MATCH3_TYPES.length)];
                    } while (this.wouldMatch(row, col, type));
                    
                    const tile = this.createTile(row, col, type);
                    this.board[row][col] = tile;

                    // 添加冰块
                    if (this.levelConfig?.obstacles?.ice) {
                        for (const [iceCol, iceRow] of this.levelConfig.obstacles.ice) {
                            if (iceRow === row && iceCol === col) {
                                tile.ice = 1;
                                this.updateTileDisplay(tile);
                            }
                        }
                    }

                    // 添加铁链
                    if (this.levelConfig?.obstacles?.chain) {
                        for (const [chainCol, chainRow] of this.levelConfig.obstacles.chain) {
                            if (chainRow === row && chainCol === col) {
                                tile.chain = true;
                                this.updateTileDisplay(tile);
                            }
                        }
                    }
                }
            }
        }
    }

    wouldMatch(row: number, col: number, type: string): boolean {
        // 检查左边两个
        if (col >= 2) {
            const t1 = this.board[row][col - 1];
            const t2 = this.board[row][col - 2];
            if (t1 && t2 && t1.type === type && t2.type === type) return true;
        }
        // 检查下边两个
        if (row >= 2) {
            const t1 = this.board[row - 1][col];
            const t2 = this.board[row - 2][col];
            if (t1 && t2 && t1.type === type && t2.type === type) return true;
        }
        return false;
    }

    createTile(row: number, col: number, type: string): Tile {
        const node = new Node(`Tile_${row}_${col}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(TILE_SIZE - 4, TILE_SIZE - 4);

        // 背景
        const graphics = node.addComponent(Graphics);
        const color = MATCH3_COLORS[type] || new Color(100, 100, 100);
        graphics.fillColor = color;
        graphics.roundRect(-(TILE_SIZE-4)/2, -(TILE_SIZE-4)/2, TILE_SIZE - 4, TILE_SIZE - 4, 8);
        graphics.fill();

        // emoji
        const label = node.addComponent(Label);
        label.string = MATCH3_EMOJIS[type] || '?';
        label.fontSize = 28;
        label.lineHeight = TILE_SIZE;

        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;
        node.setPosition(x, y, 0);

        this.gridContainer?.addChild(node);

        const tile: Tile = { node, type, row, col };

        // 点击事件
        node.on(Node.EventType.TOUCH_END, () => {
            this.onTileClick(tile);
        }, this);

        // 入场动画
        node.setScale(new Vec3(0, 0, 1));
        tween(node).to(0.2, { scale: new Vec3(1, 1, 1) }).start();

        return tile;
    }

    createObstacleTile(row: number, col: number, obstacle: 'stone'): Tile {
        const node = new Node(`Obstacle_${row}_${col}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(TILE_SIZE - 4, TILE_SIZE - 4);

        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(120, 120, 120);
        graphics.roundRect(-(TILE_SIZE-4)/2, -(TILE_SIZE-4)/2, TILE_SIZE - 4, TILE_SIZE - 4, 8);
        graphics.fill();

        const label = node.addComponent(Label);
        label.string = '🪨';
        label.fontSize = 28;
        label.lineHeight = TILE_SIZE;

        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;
        node.setPosition(x, y, 0);

        this.gridContainer?.addChild(node);

        return { node, type: 'stone', row, col, obstacle: 'stone', hp: 2 };
    }

    updateTileDisplay(tile: Tile) {
        if (!tile.node) return;

        // 冰层效果
        if (tile.ice && tile.ice > 0) {
            const iceNode = tile.node.getChildByName('IceOverlay') || new Node('IceOverlay');
            iceNode.layer = this.node.layer;
            if (!iceNode.parent) {
                iceNode.addComponent(UITransform).setContentSize(TILE_SIZE, TILE_SIZE);
                const label = iceNode.addComponent(Label);
                label.string = '❄️';
                label.fontSize = 14;
                label.color = new Color(200, 230, 255, 180);
                iceNode.setPosition(15, 15, 0);
                tile.node.addChild(iceNode);
            }
        }

        // 铁链效果
        if (tile.chain) {
            const chainNode = tile.node.getChildByName('ChainOverlay') || new Node('ChainOverlay');
            chainNode.layer = this.node.layer;
            if (!chainNode.parent) {
                chainNode.addComponent(UITransform).setContentSize(TILE_SIZE, TILE_SIZE);
                const label = chainNode.addComponent(Label);
                label.string = '⛓️';
                label.fontSize = 14;
                chainNode.setPosition(-15, 15, 0);
                tile.node.addChild(chainNode);
            }
        }
    }

    // =================== 交互逻辑 ===================

    onTileClick(tile: Tile) {
        if (this.isProcessing || this.gameOver) return;
        if (tile.obstacle === 'stone') return;  // 石头不能选中
        if (tile.chain) {
            this.showInfo('需要先消除铁链！');
            return;
        }

        if (this.selectedTile) {
            const dx = Math.abs(this.selectedTile.col - tile.col);
            const dy = Math.abs(this.selectedTile.row - tile.row);

            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                // 相邻，尝试交换
                this.swapTiles(this.selectedTile, tile);
            } else {
                // 不相邻，重新选择
                this.deselectTile();
                this.selectTile(tile);
            }
        } else {
            this.selectTile(tile);
        }
    }

    selectTile(tile: Tile) {
        this.selectedTile = tile;
        // 高亮效果
        tween(tile.node)
            .to(0.1, { scale: new Vec3(1.15, 1.15, 1) })
            .start();
    }

    deselectTile() {
        if (this.selectedTile) {
            tween(this.selectedTile.node)
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
            this.selectedTile = null;
        }
    }

    swapTiles(tile1: Tile, tile2: Tile) {
        this.isProcessing = true;
        this.deselectTile();

        const pos1 = tile1.node.position.clone();
        const pos2 = tile2.node.position.clone();

        // 交换动画
        tween(tile1.node).to(0.15, { position: pos2 }).start();
        tween(tile2.node).to(0.15, { position: pos1 }).call(() => {
            // 交换数据
            const r1 = tile1.row, c1 = tile1.col;
            const r2 = tile2.row, c2 = tile2.col;

            this.board[r1][c1] = tile2;
            this.board[r2][c2] = tile1;
            tile1.row = r2; tile1.col = c2;
            tile2.row = r1; tile2.col = c1;

            // 检查匹配
            const matches = this.findMatches();
            if (matches.length > 0) {
                this.moves--;
                this.updateUI();
                this.combo = 0;
                this.processMatches(matches);
            } else {
                // 换回来
                this.scheduleOnce(() => {
                    tween(tile1.node).to(0.15, { position: pos1 }).start();
                    tween(tile2.node).to(0.15, { position: pos2 }).call(() => {
                        this.board[r1][c1] = tile1;
                        this.board[r2][c2] = tile2;
                        tile1.row = r1; tile1.col = c1;
                        tile2.row = r2; tile2.col = c2;
                        this.isProcessing = false;
                    }).start();
                }, 0.1);
                this.showInfo('无法消除！');
            }
        }).start();
    }

    // =================== 消除逻辑 ===================

    findMatches(): Tile[][] {
        const matches: Tile[][] = [];

        // 横向检测
        for (let row = 0; row < GRID_ROWS; row++) {
            let col = 0;
            while (col < GRID_COLS) {
                const tile = this.board[row][col];
                if (!tile || tile.obstacle || tile.chain) { col++; continue; }

                let count = 1;
                while (col + count < GRID_COLS) {
                    const next = this.board[row][col + count];
                    if (next && next.type === tile.type && !next.obstacle && !next.chain) {
                        count++;
                    } else break;
                }

                if (count >= 3) {
                    const matchTiles: Tile[] = [];
                    for (let i = 0; i < count; i++) {
                        matchTiles.push(this.board[row][col + i]!);
                    }
                    matches.push(matchTiles);
                }
                col += Math.max(1, count);
            }
        }

        // 纵向检测
        for (let col = 0; col < GRID_COLS; col++) {
            let row = 0;
            while (row < GRID_ROWS) {
                const tile = this.board[row][col];
                if (!tile || tile.obstacle || tile.chain) { row++; continue; }

                let count = 1;
                while (row + count < GRID_ROWS) {
                    const next = this.board[row + count][col];
                    if (next && next.type === tile.type && !next.obstacle && !next.chain) {
                        count++;
                    } else break;
                }

                if (count >= 3) {
                    const matchTiles: Tile[] = [];
                    for (let i = 0; i < count; i++) {
                        matchTiles.push(this.board[row + i][col]!);
                    }
                    matches.push(matchTiles);
                }
                row += Math.max(1, count);
            }
        }

        return matches;
    }

    processMatches(matches: Tile[][]) {
        const toRemove = new Set<string>();
        const adjacentPositions = new Set<string>();

        for (const match of matches) {
            for (const tile of match) {
                toRemove.add(`${tile.row},${tile.col}`);
                
                // 记录相邻位置（用于处理障碍物）
                [[tile.row-1, tile.col], [tile.row+1, tile.col], 
                 [tile.row, tile.col-1], [tile.row, tile.col+1]].forEach(([r, c]) => {
                    if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
                        adjacentPositions.add(`${r},${c}`);
                    }
                });
            }
        }

        // 计分
        const baseScore = toRemove.size * 10;
        const comboBonus = this.combo * 5;
        this.score += baseScore + comboBonus;
        this.combo++;

        // 处理相邻的石头
        adjacentPositions.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const tile = this.board[r][c];
            if (tile && tile.obstacle === 'stone' && tile.hp) {
                tile.hp--;
                if (tile.hp <= 0) {
                    this.board[r][c] = null;
                    tile.node.destroy();
                    this.stoneCleared++;
                }
            }
        });

        // 移除方块
        toRemove.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const tile = this.board[r][c];
            if (tile && !tile.obstacle) {
                // 处理冰层
                if (tile.ice && tile.ice > 0) {
                    tile.ice--;
                    this.iceCleared++;
                    if (tile.ice > 0) return;  // 冰没碎完，不消除
                }

                // 处理铁链
                if (tile.chain) {
                    tile.chain = false;
                    this.chainCleared++;
                    const chainNode = tile.node.getChildByName('ChainOverlay');
                    chainNode?.destroy();
                    return;  // 铁链解开，但方块保留
                }

                // 消除动画
                tween(tile.node)
                    .to(0.15, { scale: new Vec3(0, 0, 1) })
                    .call(() => tile.node.destroy())
                    .start();
                this.board[r][c] = null;
            }
        });

        this.updateUI();

        // 掉落和填充
        this.scheduleOnce(() => {
            this.dropTiles();
            this.fillBoard();

            this.scheduleOnce(() => {
                const newMatches = this.findMatches();
                if (newMatches.length > 0) {
                    this.processMatches(newMatches);
                } else {
                    this.isProcessing = false;
                    this.combo = 0;
                    this.checkGameEnd();
                }
            }, 0.25);
        }, 0.2);
    }

    dropTiles() {
        for (let col = 0; col < GRID_COLS; col++) {
            let emptyRow = -1;
            
            for (let row = 0; row < GRID_ROWS; row++) {
                const tile = this.board[row][col];
                
                if (!tile) {
                    if (emptyRow === -1) emptyRow = row;
                } else if (tile.obstacle !== 'stone' && emptyRow !== -1) {
                    // 移动方块下落
                    this.board[emptyRow][col] = tile;
                    this.board[row][col] = null;
                    
                    const newY = emptyRow * TILE_SIZE + TILE_SIZE / 2;
                    tile.row = emptyRow;
                    tween(tile.node).to(0.15, { position: new Vec3(tile.node.position.x, newY, 0) }).start();
                    
                    emptyRow++;
                }
            }
        }
    }

    fillBoard() {
        for (let col = 0; col < GRID_COLS; col++) {
            for (let row = 0; row < GRID_ROWS; row++) {
                if (!this.board[row][col]) {
                    const type = MATCH3_TYPES[Math.floor(Math.random() * MATCH3_TYPES.length)];
                    const tile = this.createTile(row, col, type);
                    
                    // 从上方掉落动画
                    const startY = (GRID_ROWS + 2) * TILE_SIZE;
                    tile.node.setPosition(col * TILE_SIZE + TILE_SIZE / 2, startY, 0);
                    const targetY = row * TILE_SIZE + TILE_SIZE / 2;
                    tween(tile.node).to(0.2, { position: new Vec3(tile.node.position.x, targetY, 0) }).start();
                    
                    this.board[row][col] = tile;
                }
            }
        }
    }

    // =================== 游戏结束 ===================

    checkGameEnd() {
        if (this.gameOver) return;

        const target = this.levelConfig?.target;
        if (!target) return;

        // 检查是否达成目标
        let targetMet = this.score >= target.score;
        if (target.ice && this.iceCleared < target.ice) targetMet = false;
        if (target.stone && this.stoneCleared < target.stone) targetMet = false;
        if (target.chain && this.chainCleared < target.chain) targetMet = false;

        if (targetMet) {
            this.gameOver = true;
            this.won = true;
            this.calculateStars();
            this.showResult();
        } else if (this.moves <= 0) {
            this.gameOver = true;
            this.won = false;
            this.showResult();
        }
    }

    calculateStars() {
        const stars = this.levelConfig?.stars || [0, 0, 0];
        if (this.score >= stars[2]) this.stars = 3;
        else if (this.score >= stars[1]) this.stars = 2;
        else if (this.score >= stars[0]) this.stars = 1;
        else this.stars = 0;
    }

    showResult() {
        const resultContainer = new Node('Result');
        resultContainer.layer = this.node.layer;
        resultContainer.addComponent(UITransform).setContentSize(350, 300);
        this.gameContainer?.addChild(resultContainer);

        // 背景
        const bg = new Node('ResultBg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(350, 300);
        graphics.fillColor = new Color(0, 0, 0, 230);
        graphics.roundRect(-175, -150, 350, 300, 20);
        graphics.fill();
        resultContainer.addChild(bg);

        // 标题
        const title = this.createLabel(this.won ? '🎉 过关！' : '😢 失败', 0, 100, 32);
        resultContainer.addChild(title);

        // 分数
        const scoreLabel = this.createLabel(`分数: ${this.score}`, 0, 50, 22);
        resultContainer.addChild(scoreLabel);

        // 星星
        if (this.won) {
            const starsText = '⭐'.repeat(this.stars) + '☆'.repeat(3 - this.stars);
            const starsLabel = this.createLabel(starsText, 0, 10, 30);
            resultContainer.addChild(starsLabel);

            // 奖励
            if (this.levelConfig?.reward) {
                let rewardText = `奖励: 💰${this.levelConfig.reward.coin}`;
                if (this.levelConfig.reward.diamond) {
                    rewardText += ` 💎${this.levelConfig.reward.diamond}`;
                }
                const rewardLabel = this.createLabel(rewardText, 0, -30, 16);
                resultContainer.addChild(rewardLabel);
            }

            // 更新进度
            if (this.level >= this.unlockedLevel) {
                this.unlockedLevel = Math.min(20, this.level + 1);
            }
            if (!this.levelStars[this.level - 1] || this.levelStars[this.level - 1] < this.stars) {
                this.levelStars[this.level - 1] = this.stars;
            }
            this.saveProgress();
        }

        // 按钮
        const backBtn = this.createButton('返回', -70, -100, 100, 45, () => {
            this.showLevelSelect();
        });
        resultContainer.addChild(backBtn);

        if (this.won && this.level < 20) {
            const nextBtn = this.createButton('下一关', 70, -100, 100, 45, () => {
                this.startLevel(this.level + 1);
            });
            resultContainer.addChild(nextBtn);
        } else {
            const retryBtn = this.createButton('重试', 70, -100, 100, 45, () => {
                this.startLevel(this.level);
            });
            resultContainer.addChild(retryBtn);
        }
    }

    // =================== UI更新 ===================

    updateUI() {
        if (this.scoreLabel) this.scoreLabel.string = `分数: ${this.score}`;
        if (this.movesLabel) this.movesLabel.string = `步数: ${this.moves}`;
    }

    showInfo(text: string) {
        // 简单的信息提示
        console.log(text);
    }

    // =================== 存档 ===================

    saveProgress() {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem('match3_unlocked', this.unlockedLevel.toString());
            localStorage.setItem('match3_stars', JSON.stringify(this.levelStars));
        } catch (e) {}
    }

    loadProgress() {
        try {
            if (typeof localStorage === 'undefined') return;
            this.unlockedLevel = parseInt(localStorage.getItem('match3_unlocked') || '1');
            const starsJson = localStorage.getItem('match3_stars');
            if (starsJson) {
                this.levelStars = JSON.parse(starsJson);
            }
        } catch (e) {
            this.unlockedLevel = 1;
            this.levelStars = [];
        }
    }

    // =================== 工具方法 ===================

    clearAll() {
        this.gameContainer?.destroy();
        this.gameContainer = null;
        this.gridContainer = null;
    }

    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(300, fontSize + 20);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 10;
        label.color = Color.WHITE;
        node.setPosition(x, y, 0);
        return node;
    }

    createButton(text: string, x: number, y: number, width: number, height: number, callback: () => void): Node {
        const node = new Node('Button');
        node.layer = this.node.layer;
        const transform = node.addComponent(UITransform);
        transform.setContentSize(width, height);

        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(255, 230, 109, 230);
        graphics.roundRect(-width/2, -height/2, width, height, 10);
        graphics.fill();

        const labelNode = this.createLabel(text, 0, 0, 16);
        labelNode.getComponent(Label)!.color = new Color(44, 62, 80);
        node.addChild(labelNode);

        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }
}
