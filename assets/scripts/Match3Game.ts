import { _decorator, Component, Node, Label, UITransform, Color, Size, Vec3, tween, Graphics, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 关卡配置
 */
const LEVELS = [
    { id: 1, moves: 20, target: { type: 'score', value: 500 }, gems: 4 },
    { id: 2, moves: 18, target: { type: 'score', value: 800 }, gems: 4 },
    { id: 3, moves: 20, target: { type: 'gem', gemType: 0, value: 15 }, gems: 4 },
    { id: 4, moves: 18, target: { type: 'score', value: 1200 }, gems: 5 },
    { id: 5, moves: 22, target: { type: 'gem', gemType: 1, value: 20 }, gems: 5 },
    { id: 6, moves: 20, target: { type: 'score', value: 1500 }, gems: 5 },
    { id: 7, moves: 18, target: { type: 'gem', gemType: 2, value: 18 }, gems: 5 },
    { id: 8, moves: 25, target: { type: 'score', value: 2000 }, gems: 5 },
    { id: 9, moves: 20, target: { type: 'gem', gemType: 3, value: 22 }, gems: 5 },
    { id: 10, moves: 22, target: { type: 'score', value: 2500 }, gems: 5 },
    { id: 11, moves: 18, target: { type: 'score', value: 3000 }, gems: 6 },
    { id: 12, moves: 20, target: { type: 'gem', gemType: 4, value: 25 }, gems: 6 },
];

/**
 * 宝石配置
 */
const GEMS = [
    { id: 0, emoji: '🔴', name: '红宝石' },
    { id: 1, emoji: '🟡', name: '黄宝石' },
    { id: 2, emoji: '🟢', name: '绿宝石' },
    { id: 3, emoji: '🔵', name: '蓝宝石' },
    { id: 4, emoji: '🟣', name: '紫宝石' },
    { id: 5, emoji: '🟠', name: '橙宝石' },
];

const GRID_SIZE = 8;
const CELL_SIZE = 65;

interface GemNode {
    node: Node;
    type: number;
    row: number;
    col: number;
    isSpecial?: 'bomb' | 'rainbow';
}

/**
 * 消消乐游戏 - 完整版
 */
@ccclass('Match3Game')
export class Match3Game extends Component {
    // 游戏状态
    private grid: (GemNode | null)[][] = [];
    private score: number = 0;
    private moves: number = 30;
    private currentLevel: number = 1;
    private levelConfig: typeof LEVELS[0] | null = null;
    private gemCount: number[] = [0, 0, 0, 0, 0, 0];
    private selectedGem: GemNode | null = null;
    private isProcessing: boolean = false;
    private gameState: 'menu' | 'levelSelect' | 'playing' | 'win' | 'lose' = 'menu';

    // 道具
    private bombs: number = 3;
    private rainbows: number = 2;
    private selectedTool: 'none' | 'bomb' | 'rainbow' = 'none';

    // UI引用
    private scoreLabel: Label | null = null;
    private movesLabel: Label | null = null;
    private targetLabel: Label | null = null;
    private gridContainer: Node | null = null;
    private menuContainer: Node | null = null;
    private levelSelectContainer: Node | null = null;
    private gameContainer: Node | null = null;
    private toolsContainer: Node | null = null;

    start() {
        console.log('🧩 消消乐 start');
        this.showMainMenu();
    }

    // =================== 主菜单 ===================
    showMainMenu() {
        this.clearAll();
        this.gameState = 'menu';

        this.menuContainer = new Node('MenuContainer');
        this.menuContainer.layer = this.node.layer;
        this.menuContainer.addComponent(UITransform).setContentSize(800, 600);
        this.node.addChild(this.menuContainer);

        // 标题
        const title = this.createLabel('🧩 消消乐', 0, 150, 60);
        this.menuContainer.addChild(title);

        // 开始按钮
        const startBtn = this.createButton('开始游戏', 0, 0, 200, 60, () => {
            this.showLevelSelect();
        });
        this.menuContainer.addChild(startBtn);

        // 继续按钮（如果有存档）
        const savedLevel = this.loadProgress();
        if (savedLevel > 1) {
            const continueBtn = this.createButton(`继续 (第${savedLevel}关)`, 0, -80, 200, 60, () => {
                this.currentLevel = savedLevel;
                this.startLevel(savedLevel);
            });
            this.menuContainer.addChild(continueBtn);
        }
    }

    // =================== 关卡选择 ===================
    showLevelSelect() {
        this.clearAll();
        this.gameState = 'levelSelect';

        this.levelSelectContainer = new Node('LevelSelectContainer');
        this.levelSelectContainer.layer = this.node.layer;
        this.levelSelectContainer.addComponent(UITransform).setContentSize(800, 700);
        this.node.addChild(this.levelSelectContainer);

        // 标题
        const title = this.createLabel('选择关卡', 0, 280, 40);
        this.levelSelectContainer.addChild(title);

        // 关卡按钮
        const unlockedLevel = this.loadProgress();
        const cols = 4;
        const btnSize = 80;
        const spacing = 100;
        const startX = -(cols - 1) * spacing / 2;
        const startY = 150;

        for (let i = 0; i < LEVELS.length; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = startX + col * spacing;
            const y = startY - row * spacing;
            const levelNum = i + 1;
            const isUnlocked = levelNum <= unlockedLevel;

            const btn = this.createLevelButton(levelNum, x, y, btnSize, isUnlocked, () => {
                if (isUnlocked) {
                    this.startLevel(levelNum);
                }
            });
            this.levelSelectContainer.addChild(btn);
        }

        // 返回按钮
        const backBtn = this.createButton('返回', 0, -250, 120, 50, () => {
            director.loadScene('MainMenu');
        });
        this.levelSelectContainer.addChild(backBtn);
    }

    createLevelButton(level: number, x: number, y: number, size: number, unlocked: boolean, callback: () => void): Node {
        const node = new Node(`Level_${level}`);
        node.layer = this.node.layer;
        const transform = node.addComponent(UITransform);
        transform.setContentSize(size, size);

        const graphics = node.addComponent(Graphics);
        if (unlocked) {
            graphics.fillColor = new Color(100, 200, 100, 230);
        } else {
            graphics.fillColor = new Color(100, 100, 100, 200);
        }
        graphics.roundRect(-size/2, -size/2, size, size, 10);
        graphics.fill();

        const label = this.createLabel(unlocked ? `${level}` : '🔒', 0, 0, 28);
        node.addChild(label);

        node.setPosition(x, y, 0);
        if (unlocked) {
            node.on(Node.EventType.TOUCH_END, callback, this);
        }

        return node;
    }

    // =================== 游戏主逻辑 ===================
    startLevel(level: number) {
        this.clearAll();
        this.gameState = 'playing';
        this.currentLevel = level;
        this.levelConfig = LEVELS[level - 1] || LEVELS[0];
        this.score = 0;
        this.moves = this.levelConfig.moves;
        this.gemCount = [0, 0, 0, 0, 0, 0];
        this.selectedGem = null;
        this.selectedTool = 'none';

        this.createGameUI();
        this.initGrid();
    }

    createGameUI() {
        this.gameContainer = new Node('GameContainer');
        this.gameContainer.layer = this.node.layer;
        this.gameContainer.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(this.gameContainer);

        // 顶部信息栏
        const topBar = new Node('TopBar');
        topBar.layer = this.node.layer;
        topBar.addComponent(UITransform).setContentSize(600, 80);
        topBar.setPosition(0, 320, 0);
        this.gameContainer.addChild(topBar);

        // 关卡
        const levelLabel = this.createLabel(`第 ${this.currentLevel} 关`, -200, 0, 28);
        topBar.addChild(levelLabel);

        // 分数
        const scoreNode = this.createLabel(`分数: ${this.score}`, 0, 0, 28);
        this.scoreLabel = scoreNode.getComponent(Label);
        topBar.addChild(scoreNode);

        // 步数
        const movesNode = this.createLabel(`步数: ${this.moves}`, 200, 0, 28);
        this.movesLabel = movesNode.getComponent(Label);
        topBar.addChild(movesNode);

        // 目标
        const targetText = this.getTargetText();
        const targetNode = this.createLabel(targetText, 0, 270, 22);
        this.targetLabel = targetNode.getComponent(Label);
        this.gameContainer.addChild(targetNode);

        // 棋盘容器
        this.gridContainer = new Node('GridContainer');
        this.gridContainer.layer = this.node.layer;
        const gridTransform = this.gridContainer.addComponent(UITransform);
        gridTransform.setContentSize(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
        gridTransform.setAnchorPoint(0, 0);
        this.gridContainer.setPosition(-GRID_SIZE * CELL_SIZE / 2, -GRID_SIZE * CELL_SIZE / 2 + 20, 0);
        this.gameContainer.addChild(this.gridContainer);

        // 绘制棋盘背景
        this.drawGridBackground();

        // 道具栏
        this.createToolsBar();

        // 返回按钮
        const backBtn = this.createButton('退出', -280, 320, 80, 40, () => {
            this.showLevelSelect();
        });
        this.gameContainer.addChild(backBtn);
    }

    createToolsBar() {
        this.toolsContainer = new Node('ToolsContainer');
        this.toolsContainer.layer = this.node.layer;
        this.toolsContainer.addComponent(UITransform).setContentSize(400, 60);
        this.toolsContainer.setPosition(0, -320, 0);
        this.gameContainer?.addChild(this.toolsContainer);

        // 炸弹道具
        const bombBtn = this.createToolButton('💣', this.bombs, -80, () => {
            if (this.bombs > 0 && !this.isProcessing) {
                this.selectedTool = this.selectedTool === 'bomb' ? 'none' : 'bomb';
                this.updateToolsUI();
            }
        });
        this.toolsContainer.addChild(bombBtn);

        // 彩虹道具
        const rainbowBtn = this.createToolButton('🌈', this.rainbows, 80, () => {
            if (this.rainbows > 0 && !this.isProcessing) {
                this.selectedTool = this.selectedTool === 'rainbow' ? 'none' : 'rainbow';
                this.updateToolsUI();
            }
        });
        this.toolsContainer.addChild(rainbowBtn);
    }

    createToolButton(emoji: string, count: number, x: number, callback: () => void): Node {
        const node = new Node(`Tool_${emoji}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(70, 50);

        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(80, 80, 120, 230);
        graphics.roundRect(-35, -25, 70, 50, 8);
        graphics.fill();

        const label = this.createLabel(`${emoji}×${count}`, 0, 0, 20);
        node.addChild(label);

        node.setPosition(x, 0, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }

    updateToolsUI() {
        // 简单实现：重建道具栏
        if (this.toolsContainer) {
            this.toolsContainer.destroyAllChildren();
            
            const bombBtn = this.createToolButton('💣', this.bombs, -80, () => {
                if (this.bombs > 0 && !this.isProcessing) {
                    this.selectedTool = this.selectedTool === 'bomb' ? 'none' : 'bomb';
                    this.updateToolsUI();
                }
            });
            if (this.selectedTool === 'bomb') {
                bombBtn.getComponent(Graphics)!.fillColor = new Color(255, 150, 50, 230);
            }
            this.toolsContainer.addChild(bombBtn);

            const rainbowBtn = this.createToolButton('🌈', this.rainbows, 80, () => {
                if (this.rainbows > 0 && !this.isProcessing) {
                    this.selectedTool = this.selectedTool === 'rainbow' ? 'none' : 'rainbow';
                    this.updateToolsUI();
                }
            });
            if (this.selectedTool === 'rainbow') {
                rainbowBtn.getComponent(Graphics)!.fillColor = new Color(255, 150, 50, 230);
            }
            this.toolsContainer.addChild(rainbowBtn);
        }
    }

    getTargetText(): string {
        if (!this.levelConfig) return '';
        const target = this.levelConfig.target;
        if (target.type === 'score') {
            return `目标: 得分 ${this.score}/${target.value}`;
        } else {
            const gem = GEMS[target.gemType!];
            return `目标: 消除 ${gem.emoji} ${this.gemCount[target.gemType!]}/${target.value}`;
        }
    }

    drawGridBackground() {
        if (!this.gridContainer) return;

        const bg = new Node('GridBg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
        
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const x = col * CELL_SIZE;
                const y = (GRID_SIZE - 1 - row) * CELL_SIZE;
                const isLight = (row + col) % 2 === 0;
                
                graphics.fillColor = isLight ? new Color(60, 80, 100, 200) : new Color(40, 60, 80, 200);
                graphics.roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8);
                graphics.fill();
            }
        }
        
        this.gridContainer.addChild(bg);
    }

    initGrid() {
        this.grid = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GRID_SIZE; col++) {
                this.grid[row][col] = null;
            }
        }

        const gemTypes = this.levelConfig?.gems || 5;
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                let type: number;
                do {
                    type = Math.floor(Math.random() * gemTypes);
                } while (this.wouldMatch(row, col, type));
                
                this.createGem(row, col, type);
            }
        }
    }

    wouldMatch(row: number, col: number, type: number): boolean {
        if (col >= 2) {
            const left1 = this.grid[row][col - 1];
            const left2 = this.grid[row][col - 2];
            if (left1 && left2 && left1.type === type && left2.type === type) {
                return true;
            }
        }
        if (row >= 2) {
            const up1 = this.grid[row - 1][col];
            const up2 = this.grid[row - 2][col];
            if (up1 && up2 && up1.type === type && up2.type === type) {
                return true;
            }
        }
        return false;
    }

    createGem(row: number, col: number, type: number, isSpecial?: 'bomb' | 'rainbow'): GemNode {
        const gem = GEMS[type];
        const node = new Node(`Gem_${row}_${col}`);
        node.layer = this.node.layer;
        
        const transform = node.addComponent(UITransform);
        transform.setContentSize(CELL_SIZE - 4, CELL_SIZE - 4);
        
        let displayEmoji = gem.emoji;
        if (isSpecial === 'bomb') displayEmoji = '💣';
        if (isSpecial === 'rainbow') displayEmoji = '🌈';
        
        const label = node.addComponent(Label);
        label.string = displayEmoji;
        label.fontSize = 40;
        label.lineHeight = CELL_SIZE;
        
        const x = col * CELL_SIZE + CELL_SIZE / 2;
        const y = (GRID_SIZE - 1 - row) * CELL_SIZE + CELL_SIZE / 2;
        node.setPosition(x, y, 0);
        
        this.gridContainer?.addChild(node);
        
        const gemNode: GemNode = { node, type, row, col, isSpecial };
        this.grid[row][col] = gemNode;
        
        node.on(Node.EventType.TOUCH_END, () => this.onGemClick(gemNode), this);
        
        return gemNode;
    }

    onGemClick(gem: GemNode) {
        if (this.isProcessing || this.gameState !== 'playing') return;

        // 使用道具
        if (this.selectedTool === 'bomb' && this.bombs > 0) {
            this.useBomb(gem.row, gem.col);
            return;
        }
        if (this.selectedTool === 'rainbow' && this.rainbows > 0) {
            this.useRainbow(gem.type);
            return;
        }

        if (!this.selectedGem) {
            this.selectedGem = gem;
            this.highlightGem(gem, true);
        } else if (this.selectedGem === gem) {
            this.highlightGem(gem, false);
            this.selectedGem = null;
        } else if (this.isAdjacent(this.selectedGem, gem)) {
            this.highlightGem(this.selectedGem, false);
            this.trySwap(this.selectedGem, gem);
            this.selectedGem = null;
        } else {
            this.highlightGem(this.selectedGem, false);
            this.selectedGem = gem;
            this.highlightGem(gem, true);
        }
    }

    async useBomb(row: number, col: number) {
        this.bombs--;
        this.selectedTool = 'none';
        this.isProcessing = true;

        const toRemove: GemNode[] = [];
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                    const g = this.grid[r][c];
                    if (g) toRemove.push(g);
                }
            }
        }

        this.score += toRemove.length * 15;
        for (const g of toRemove) {
            this.gemCount[g.type]++;
        }
        this.updateUI();

        await this.animateRemove(toRemove);
        for (const g of toRemove) {
            this.grid[g.row][g.col] = null;
            g.node.destroy();
        }

        await this.dropGems();
        await this.fillGems();
        await this.processMatches();

        this.updateToolsUI();
        this.checkWinLose();
        this.isProcessing = false;
    }

    async useRainbow(type: number) {
        this.rainbows--;
        this.selectedTool = 'none';
        this.isProcessing = true;

        const toRemove: GemNode[] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const g = this.grid[r][c];
                if (g && g.type === type) {
                    toRemove.push(g);
                }
            }
        }

        this.score += toRemove.length * 20;
        for (const g of toRemove) {
            this.gemCount[g.type]++;
        }
        this.updateUI();

        await this.animateRemove(toRemove);
        for (const g of toRemove) {
            this.grid[g.row][g.col] = null;
            g.node.destroy();
        }

        await this.dropGems();
        await this.fillGems();
        await this.processMatches();

        this.updateToolsUI();
        this.checkWinLose();
        this.isProcessing = false;
    }

    highlightGem(gem: GemNode, highlight: boolean) {
        const scale = highlight ? 1.2 : 1.0;
        tween(gem.node)
            .to(0.1, { scale: new Vec3(scale, scale, 1) })
            .start();
    }

    isAdjacent(a: GemNode, b: GemNode): boolean {
        const rowDiff = Math.abs(a.row - b.row);
        const colDiff = Math.abs(a.col - b.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    async trySwap(a: GemNode, b: GemNode) {
        this.isProcessing = true;

        await this.animateSwap(a, b);
        this.swapGems(a, b);

        const matches = this.findMatches();
        
        if (matches.length > 0) {
            this.moves--;
            this.updateUI();
            await this.processMatches();
            this.checkWinLose();
        } else {
            await this.animateSwap(a, b);
            this.swapGems(a, b);
        }

        this.isProcessing = false;
    }

    animateSwap(a: GemNode, b: GemNode): Promise<void> {
        return new Promise(resolve => {
            const posA = a.node.position.clone();
            const posB = b.node.position.clone();

            tween(a.node).to(0.15, { position: posB }).start();
            tween(b.node).to(0.15, { position: posA }).call(resolve).start();
        });
    }

    swapGems(a: GemNode, b: GemNode) {
        this.grid[a.row][a.col] = b;
        this.grid[b.row][b.col] = a;
        [a.row, b.row] = [b.row, a.row];
        [a.col, b.col] = [b.col, a.col];
    }

    findMatches(): GemNode[] {
        const matched = new Set<GemNode>();

        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 2; col++) {
                const a = this.grid[row][col];
                const b = this.grid[row][col + 1];
                const c = this.grid[row][col + 2];
                if (a && b && c && a.type === b.type && b.type === c.type) {
                    matched.add(a);
                    matched.add(b);
                    matched.add(c);
                }
            }
        }

        for (let row = 0; row < GRID_SIZE - 2; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const a = this.grid[row][col];
                const b = this.grid[row + 1][col];
                const c = this.grid[row + 2][col];
                if (a && b && c && a.type === b.type && b.type === c.type) {
                    matched.add(a);
                    matched.add(b);
                    matched.add(c);
                }
            }
        }

        return Array.from(matched);
    }

    async processMatches() {
        let matches = this.findMatches();
        
        while (matches.length > 0) {
            const points = matches.length * 10;
            this.score += points;
            
            for (const gem of matches) {
                this.gemCount[gem.type]++;
            }
            
            this.updateUI();

            await this.animateRemove(matches);

            for (const gem of matches) {
                this.grid[gem.row][gem.col] = null;
                gem.node.destroy();
            }

            await this.dropGems();
            await this.fillGems();

            matches = this.findMatches();
        }
    }

    animateRemove(gems: GemNode[]): Promise<void> {
        return new Promise(resolve => {
            if (gems.length === 0) {
                resolve();
                return;
            }
            let completed = 0;
            for (const gem of gems) {
                tween(gem.node)
                    .to(0.2, { scale: new Vec3(0, 0, 1) })
                    .call(() => {
                        completed++;
                        if (completed === gems.length) resolve();
                    })
                    .start();
            }
        });
    }

    async dropGems(): Promise<void> {
        const drops: Promise<void>[] = [];

        for (let col = 0; col < GRID_SIZE; col++) {
            let emptyRow = GRID_SIZE - 1;
            
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                const gem = this.grid[row][col];
                if (gem) {
                    if (row !== emptyRow) {
                        this.grid[row][col] = null;
                        this.grid[emptyRow][col] = gem;
                        gem.row = emptyRow;

                        const newY = (GRID_SIZE - 1 - emptyRow) * CELL_SIZE + CELL_SIZE / 2;
                        drops.push(new Promise(resolve => {
                            tween(gem.node)
                                .to(0.2, { position: new Vec3(gem.node.position.x, newY, 0) })
                                .call(resolve)
                                .start();
                        }));
                    }
                    emptyRow--;
                }
            }
        }

        await Promise.all(drops);
    }

    async fillGems(): Promise<void> {
        const fills: Promise<void>[] = [];
        const gemTypes = this.levelConfig?.gems || 5;

        for (let col = 0; col < GRID_SIZE; col++) {
            for (let row = 0; row < GRID_SIZE; row++) {
                if (!this.grid[row][col]) {
                    const type = Math.floor(Math.random() * gemTypes);
                    const gem = this.createGem(row, col, type);
                    
                    const targetY = gem.node.position.y;
                    gem.node.setPosition(gem.node.position.x, targetY + GRID_SIZE * CELL_SIZE, 0);
                    gem.node.setScale(new Vec3(1, 1, 1));
                    
                    fills.push(new Promise(resolve => {
                        tween(gem.node)
                            .to(0.3, { position: new Vec3(gem.node.position.x, targetY, 0) })
                            .call(resolve)
                            .start();
                    }));
                }
            }
        }

        await Promise.all(fills);
    }

    updateUI() {
        if (this.scoreLabel) this.scoreLabel.string = `分数: ${this.score}`;
        if (this.movesLabel) this.movesLabel.string = `步数: ${this.moves}`;
        if (this.targetLabel) this.targetLabel.string = this.getTargetText();
    }

    checkWinLose() {
        if (!this.levelConfig) return;

        const target = this.levelConfig.target;
        let achieved = false;

        if (target.type === 'score') {
            achieved = this.score >= target.value;
        } else {
            achieved = this.gemCount[target.gemType!] >= target.value;
        }

        if (achieved) {
            this.gameState = 'win';
            this.saveProgress(this.currentLevel + 1);
            this.showResultScreen(true);
        } else if (this.moves <= 0) {
            this.gameState = 'lose';
            this.showResultScreen(false);
        }
    }

    showResultScreen(win: boolean) {
        const overlay = new Node('ResultOverlay');
        overlay.layer = this.node.layer;
        overlay.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(overlay);

        // 半透明背景
        const bg = new Node('Bg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);
        graphics.fillColor = new Color(0, 0, 0, 180);
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();
        overlay.addChild(bg);

        // 结果文字
        const title = this.createLabel(win ? '🎉 过关！' : '😢 失败', 0, 100, 50);
        overlay.addChild(title);

        const scoreText = this.createLabel(`得分: ${this.score}`, 0, 20, 30);
        overlay.addChild(scoreText);

        if (win) {
            const nextBtn = this.createButton('下一关', 0, -80, 150, 50, () => {
                overlay.destroy();
                if (this.currentLevel < LEVELS.length) {
                    this.startLevel(this.currentLevel + 1);
                } else {
                    this.showMainMenu();
                }
            });
            overlay.addChild(nextBtn);
        }

        const retryBtn = this.createButton('重试', win ? -100 : 0, win ? -150 : -80, 120, 50, () => {
            overlay.destroy();
            this.startLevel(this.currentLevel);
        });
        overlay.addChild(retryBtn);

        const menuBtn = this.createButton('菜单', win ? 100 : 0, win ? -150 : -150, 120, 50, () => {
            overlay.destroy();
            this.showMainMenu();
        });
        overlay.addChild(menuBtn);
    }

    // =================== 存档 ===================
    saveProgress(level: number) {
        try {
            if (typeof localStorage !== 'undefined') {
                const current = parseInt(localStorage.getItem('match3_level') || '1');
                if (level > current) {
                    localStorage.setItem('match3_level', level.toString());
                }
            }
        } catch (e) {
            console.log('保存失败');
        }
    }

    loadProgress(): number {
        try {
            if (typeof localStorage !== 'undefined') {
                return parseInt(localStorage.getItem('match3_level') || '1');
            }
        } catch (e) {}
        return 1;
    }

    // =================== 工具方法 ===================
    clearAll() {
        this.menuContainer?.destroy();
        this.levelSelectContainer?.destroy();
        this.gameContainer?.destroy();
        this.menuContainer = null;
        this.levelSelectContainer = null;
        this.gameContainer = null;
        this.gridContainer = null;
        this.toolsContainer = null;
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
        graphics.fillColor = new Color(80, 150, 255, 230);
        graphics.roundRect(-width/2, -height/2, width, height, 10);
        graphics.fill();

        const labelNode = this.createLabel(text, 0, 0, 22);
        node.addChild(labelNode);

        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }
}
