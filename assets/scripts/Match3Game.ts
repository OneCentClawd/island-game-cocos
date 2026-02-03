import { _decorator, Component, Node, Label, UITransform, Color, Size, EventTouch, Vec3, tween, Sprite, Graphics } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 消消乐配置
 */
const GEMS = [
    { id: 0, emoji: '🔴', color: new Color(255, 100, 100) },
    { id: 1, emoji: '🟡', color: new Color(255, 220, 100) },
    { id: 2, emoji: '🟢', color: new Color(100, 255, 100) },
    { id: 3, emoji: '🔵', color: new Color(100, 150, 255) },
    { id: 4, emoji: '🟣', color: new Color(200, 100, 255) },
];

const GRID_SIZE = 8;
const CELL_SIZE = 60;
const GRID_OFFSET_X = -210;
const GRID_OFFSET_Y = 100;

interface GemNode {
    node: Node;
    type: number;
    row: number;
    col: number;
}

/**
 * 消消乐游戏
 */
@ccclass('Match3Game')
export class Match3Game extends Component {
    // 游戏状态
    private grid: (GemNode | null)[][] = [];
    private score: number = 0;
    private moves: number = 30;
    private selectedGem: GemNode | null = null;
    private isProcessing: boolean = false;

    // UI引用
    private scoreLabel: Label | null = null;
    private movesLabel: Label | null = null;
    private infoLabel: Label | null = null;
    private gridContainer: Node | null = null;

    onLoad() {
        console.log('🧩 消消乐 onLoad');
        this.createUI();
        this.initGrid();
    }

    start() {
        console.log('🧩 消消乐 start');
        this.updateUI();
    }

    /**
     * 创建UI
     */
    createUI() {
        const canvas = this.node;

        // 清理旧节点
        ['ScorePanel', 'GridContainer', 'InfoLabel'].forEach(name => {
            const old = canvas.getChildByName(name);
            if (old) old.destroy();
        });

        // 顶部分数面板
        const scorePanel = new Node('ScorePanel');
        scorePanel.addComponent(UITransform).setContentSize(new Size(400, 80));
        scorePanel.setPosition(0, 350, 0);
        canvas.addChild(scorePanel);

        // 分数
        const scoreNode = this.createLabel('分数: 0', -100, 0, 32);
        this.scoreLabel = scoreNode.getComponent(Label);
        scorePanel.addChild(scoreNode);

        // 步数
        const movesNode = this.createLabel('步数: 30', 100, 0, 32);
        this.movesLabel = movesNode.getComponent(Label);
        scorePanel.addChild(movesNode);

        // 棋盘容器
        this.gridContainer = new Node('GridContainer');
        this.gridContainer.addComponent(UITransform).setContentSize(new Size(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE));
        this.gridContainer.setPosition(GRID_OFFSET_X, GRID_OFFSET_Y, 0);
        canvas.addChild(this.gridContainer);

        // 绘制棋盘背景
        this.drawGridBackground();

        // 信息提示
        const infoNode = this.createLabel('点击宝石交换消除', 0, -280, 24);
        this.infoLabel = infoNode.getComponent(Label);
        canvas.addChild(infoNode);

        // 重新开始按钮
        const restartBtn = this.createButton('🔄 重新开始', 0, -350, () => {
            this.restartGame();
        });
        canvas.addChild(restartBtn);
    }

    /**
     * 绘制棋盘背景
     */
    drawGridBackground() {
        if (!this.gridContainer) return;

        const bg = new Node('GridBg');
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(new Size(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE));
        
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

    /**
     * 初始化棋盘
     */
    initGrid() {
        // 初始化二维数组
        this.grid = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GRID_SIZE; col++) {
                this.grid[row][col] = null;
            }
        }

        // 填充宝石（避免初始匹配）
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                let type: number;
                do {
                    type = Math.floor(Math.random() * GEMS.length);
                } while (this.wouldMatch(row, col, type));
                
                this.createGem(row, col, type);
            }
        }
    }

    /**
     * 检查放置是否会产生匹配
     */
    wouldMatch(row: number, col: number, type: number): boolean {
        // 检查水平
        if (col >= 2) {
            const left1 = this.grid[row][col - 1];
            const left2 = this.grid[row][col - 2];
            if (left1 && left2 && left1.type === type && left2.type === type) {
                return true;
            }
        }
        // 检查垂直
        if (row >= 2) {
            const up1 = this.grid[row - 1][col];
            const up2 = this.grid[row - 2][col];
            if (up1 && up2 && up1.type === type && up2.type === type) {
                return true;
            }
        }
        return false;
    }

    /**
     * 创建宝石
     */
    createGem(row: number, col: number, type: number): GemNode {
        const gem = GEMS[type];
        const node = new Node(`Gem_${row}_${col}`);
        
        const transform = node.addComponent(UITransform);
        transform.setContentSize(new Size(CELL_SIZE - 8, CELL_SIZE - 8));
        
        // 使用 Label 显示 emoji
        const label = node.addComponent(Label);
        label.string = gem.emoji;
        label.fontSize = 40;
        label.lineHeight = CELL_SIZE;
        
        // 位置
        const x = col * CELL_SIZE + CELL_SIZE / 2;
        const y = (GRID_SIZE - 1 - row) * CELL_SIZE + CELL_SIZE / 2;
        node.setPosition(x, y, 0);
        
        // 添加点击事件
        node.on(Node.EventType.TOUCH_END, () => this.onGemClick(gemNode), this);
        
        this.gridContainer?.addChild(node);
        
        const gemNode: GemNode = { node, type, row, col };
        this.grid[row][col] = gemNode;
        
        return gemNode;
    }

    /**
     * 点击宝石
     */
    onGemClick(gem: GemNode) {
        if (this.isProcessing || this.moves <= 0) return;

        if (!this.selectedGem) {
            // 选中第一个
            this.selectedGem = gem;
            this.highlightGem(gem, true);
        } else if (this.selectedGem === gem) {
            // 取消选中
            this.highlightGem(gem, false);
            this.selectedGem = null;
        } else if (this.isAdjacent(this.selectedGem, gem)) {
            // 相邻，尝试交换
            this.highlightGem(this.selectedGem, false);
            this.trySwap(this.selectedGem, gem);
            this.selectedGem = null;
        } else {
            // 不相邻，切换选中
            this.highlightGem(this.selectedGem, false);
            this.selectedGem = gem;
            this.highlightGem(gem, true);
        }
    }

    /**
     * 高亮宝石
     */
    highlightGem(gem: GemNode, highlight: boolean) {
        const scale = highlight ? 1.2 : 1.0;
        tween(gem.node)
            .to(0.1, { scale: new Vec3(scale, scale, 1) })
            .start();
    }

    /**
     * 检查是否相邻
     */
    isAdjacent(a: GemNode, b: GemNode): boolean {
        const rowDiff = Math.abs(a.row - b.row);
        const colDiff = Math.abs(a.col - b.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * 尝试交换
     */
    async trySwap(a: GemNode, b: GemNode) {
        this.isProcessing = true;

        // 交换动画
        await this.animateSwap(a, b);

        // 更新数据
        this.swapGems(a, b);

        // 检查匹配
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            // 有匹配，扣步数
            this.moves--;
            this.updateUI();
            
            // 消除循环
            await this.processMatches();
        } else {
            // 无匹配，换回去
            await this.animateSwap(a, b);
            this.swapGems(a, b);
            this.showInfo('❌ 无法消除');
        }

        this.isProcessing = false;

        // 检查游戏结束
        if (this.moves <= 0) {
            this.showInfo(`🎮 游戏结束！得分: ${this.score}`);
        }
    }

    /**
     * 交换动画
     */
    animateSwap(a: GemNode, b: GemNode): Promise<void> {
        return new Promise(resolve => {
            const posA = a.node.position.clone();
            const posB = b.node.position.clone();

            tween(a.node).to(0.15, { position: posB }).start();
            tween(b.node).to(0.15, { position: posA }).call(resolve).start();
        });
    }

    /**
     * 交换宝石数据
     */
    swapGems(a: GemNode, b: GemNode) {
        // 交换 grid 引用
        this.grid[a.row][a.col] = b;
        this.grid[b.row][b.col] = a;

        // 交换坐标
        [a.row, b.row] = [b.row, a.row];
        [a.col, b.col] = [b.col, a.col];
    }

    /**
     * 查找所有匹配
     */
    findMatches(): GemNode[] {
        const matched = new Set<GemNode>();

        // 水平匹配
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

        // 垂直匹配
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

    /**
     * 处理消除
     */
    async processMatches() {
        let matches = this.findMatches();
        
        while (matches.length > 0) {
            // 计分
            const points = matches.length * 10;
            this.score += points;
            this.updateUI();
            this.showInfo(`+${points} 分！`);

            // 消除动画
            await this.animateRemove(matches);

            // 移除宝石
            for (const gem of matches) {
                this.grid[gem.row][gem.col] = null;
                gem.node.destroy();
            }

            // 下落
            await this.dropGems();

            // 填充新宝石
            await this.fillGems();

            // 检查新匹配
            matches = this.findMatches();
        }
    }

    /**
     * 消除动画
     */
    animateRemove(gems: GemNode[]): Promise<void> {
        return new Promise(resolve => {
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

    /**
     * 宝石下落
     */
    async dropGems(): Promise<void> {
        const drops: Promise<void>[] = [];

        for (let col = 0; col < GRID_SIZE; col++) {
            let emptyRow = GRID_SIZE - 1;
            
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                const gem = this.grid[row][col];
                if (gem) {
                    if (row !== emptyRow) {
                        // 需要下落
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

    /**
     * 填充新宝石
     */
    async fillGems(): Promise<void> {
        const fills: Promise<void>[] = [];

        for (let col = 0; col < GRID_SIZE; col++) {
            for (let row = 0; row < GRID_SIZE; row++) {
                if (!this.grid[row][col]) {
                    const type = Math.floor(Math.random() * GEMS.length);
                    const gem = this.createGem(row, col, type);
                    
                    // 从上方掉落动画
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

    /**
     * 更新UI
     */
    updateUI() {
        if (this.scoreLabel) this.scoreLabel.string = `分数: ${this.score}`;
        if (this.movesLabel) this.movesLabel.string = `步数: ${this.moves}`;
    }

    /**
     * 显示提示
     */
    showInfo(text: string) {
        if (this.infoLabel) this.infoLabel.string = text;
    }

    /**
     * 重新开始
     */
    restartGame() {
        this.score = 0;
        this.moves = 30;
        this.selectedGem = null;
        this.isProcessing = false;

        // 清除棋盘
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const gem = this.grid[row][col];
                if (gem) gem.node.destroy();
            }
        }

        this.initGrid();
        this.updateUI();
        this.showInfo('🧩 新游戏开始！');
    }

    /**
     * 创建 Label 节点
     */
    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.addComponent(UITransform);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 10;
        label.color = Color.WHITE;
        node.setPosition(x, y, 0);
        return node;
    }

    /**
     * 创建按钮
     */
    createButton(text: string, x: number, y: number, callback: () => void): Node {
        const node = new Node('Button');
        const transform = node.addComponent(UITransform);
        transform.setContentSize(new Size(200, 50));
        
        // 背景
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(80, 150, 255, 230);
        graphics.roundRect(-100, -25, 200, 50, 10);
        graphics.fill();

        // 文字
        const labelNode = this.createLabel(text, 0, 0, 24);
        node.addChild(labelNode);

        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }
}
