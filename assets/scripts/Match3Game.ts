import { _decorator, Component, Node, Label, UITransform, Color, Size, Vec3, tween, Graphics, Sprite, SpriteFrame, UIOpacity } from 'cc';
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
const CELL_SIZE = 70;

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
    private gridContainer: Node | null = null;

    start() {
        console.log('🧩 消消乐 start');
        this.createUI();
        this.initGrid();
    }

    /**
     * 创建UI
     */
    createUI() {
        console.log('创建UI开始');
        
        // 分数标签
        const scoreNode = new Node('ScoreLabel');
        scoreNode.layer = this.node.layer;
        const scoreTransform = scoreNode.addComponent(UITransform);
        scoreTransform.setContentSize(200, 50);
        this.scoreLabel = scoreNode.addComponent(Label);
        this.scoreLabel.string = `分数: ${this.score}`;
        this.scoreLabel.fontSize = 36;
        this.scoreLabel.color = Color.WHITE;
        scoreNode.setPosition(-150, 300, 0);
        this.node.addChild(scoreNode);
        console.log('分数标签创建完成');

        // 步数标签
        const movesNode = new Node('MovesLabel');
        movesNode.layer = this.node.layer;
        const movesTransform = movesNode.addComponent(UITransform);
        movesTransform.setContentSize(200, 50);
        this.movesLabel = movesNode.addComponent(Label);
        this.movesLabel.string = `步数: ${this.moves}`;
        this.movesLabel.fontSize = 36;
        this.movesLabel.color = Color.WHITE;
        movesNode.setPosition(150, 300, 0);
        this.node.addChild(movesNode);
        console.log('步数标签创建完成');

        // 棋盘容器
        this.gridContainer = new Node('GridContainer');
        this.gridContainer.layer = this.node.layer;
        const gridTransform = this.gridContainer.addComponent(UITransform);
        gridTransform.setContentSize(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
        gridTransform.setAnchorPoint(0, 0);
        this.gridContainer.setPosition(-GRID_SIZE * CELL_SIZE / 2, -GRID_SIZE * CELL_SIZE / 2 + 20, 0);
        this.node.addChild(this.gridContainer);
        console.log('棋盘容器创建完成');
    }

    /**
     * 初始化棋盘
     */
    initGrid() {
        console.log('初始化棋盘');
        
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
        console.log('棋盘初始化完成');
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
        node.layer = this.node.layer;
        
        const transform = node.addComponent(UITransform);
        transform.setContentSize(CELL_SIZE - 4, CELL_SIZE - 4);
        
        // 使用 Label 显示 emoji
        const label = node.addComponent(Label);
        label.string = gem.emoji;
        label.fontSize = 45;
        label.lineHeight = CELL_SIZE;
        
        // 位置（左下角为原点）
        const x = col * CELL_SIZE + CELL_SIZE / 2;
        const y = (GRID_SIZE - 1 - row) * CELL_SIZE + CELL_SIZE / 2;
        node.setPosition(x, y, 0);
        
        this.gridContainer?.addChild(node);
        
        const gemNode: GemNode = { node, type, row, col };
        this.grid[row][col] = gemNode;
        
        // 添加点击事件
        node.on(Node.EventType.TOUCH_END, () => this.onGemClick(gemNode), this);
        
        return gemNode;
    }

    /**
     * 点击宝石
     */
    onGemClick(gem: GemNode) {
        if (this.isProcessing || this.moves <= 0) return;

        console.log(`点击宝石 [${gem.row}, ${gem.col}] 类型:${gem.type}`);

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
        }

        this.isProcessing = false;

        // 检查游戏结束
        if (this.moves <= 0) {
            console.log(`游戏结束！得分: ${this.score}`);
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
}
