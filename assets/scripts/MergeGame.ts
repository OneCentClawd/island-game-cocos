import { _decorator, Component, Node, Label, UITransform, Color, Size, Vec3, tween, Graphics, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 合成物品配置
 */
const MERGE_ITEMS = [
    { level: 1, emoji: '🌱', name: '种子', value: 1 },
    { level: 2, emoji: '🌿', name: '嫩芽', value: 3 },
    { level: 3, emoji: '🪴', name: '盆栽', value: 9 },
    { level: 4, emoji: '🌲', name: '小树', value: 27 },
    { level: 5, emoji: '🌳', name: '大树', value: 81 },
    { level: 6, emoji: '🏡', name: '小屋', value: 243 },
    { level: 7, emoji: '🏠', name: '房子', value: 729 },
    { level: 8, emoji: '🏢', name: '大厦', value: 2187 },
    { level: 9, emoji: '🏰', name: '城堡', value: 6561 },
    { level: 10, emoji: '👑', name: '皇冠', value: 19683 },
];

const GRID_COLS = 5;
const GRID_ROWS = 5;
const CELL_SIZE = 80;

interface MergeItem {
    node: Node;
    level: number;
    gridX: number;
    gridY: number;
}

/**
 * 合成游戏
 */
@ccclass('MergeGame')
export class MergeGame extends Component {
    // 游戏状态
    private grid: (MergeItem | null)[][] = [];
    private coins: number = 0;
    private spawnCost: number = 10;
    private selectedItem: MergeItem | null = null;
    private isDragging: boolean = false;

    // UI引用
    private coinsLabel: Label | null = null;
    private gridContainer: Node | null = null;
    private menuContainer: Node | null = null;
    private gameContainer: Node | null = null;

    private gameState: 'menu' | 'playing' = 'menu';

    start() {
        console.log('🔮 合成游戏 start');
        this.loadGame();
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
        const title = this.createLabel('🔮 合成大师', 0, 150, 50);
        this.menuContainer.addChild(title);

        // 说明
        const desc = this.createLabel('拖动相同物品合成更高级的！', 0, 80, 20);
        this.menuContainer.addChild(desc);

        // 开始按钮
        const startBtn = this.createButton('开始游戏', 0, 0, 200, 60, () => {
            this.startGame();
        });
        this.menuContainer.addChild(startBtn);

        // 显示最高等级
        const maxLevel = this.getMaxLevel();
        if (maxLevel > 0) {
            const item = MERGE_ITEMS[maxLevel - 1];
            const maxText = this.createLabel(`最高成就: ${item.emoji} ${item.name}`, 0, -80, 22);
            this.menuContainer.addChild(maxText);
        }
    }

    // =================== 游戏主逻辑 ===================
    startGame() {
        this.clearAll();
        this.gameState = 'playing';

        this.gameContainer = new Node('GameContainer');
        this.gameContainer.layer = this.node.layer;
        this.gameContainer.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(this.gameContainer);

        // 顶部信息
        const topBar = new Node('TopBar');
        topBar.layer = this.node.layer;
        topBar.addComponent(UITransform).setContentSize(600, 60);
        topBar.setPosition(0, 300, 0);
        this.gameContainer.addChild(topBar);

        // 金币
        const coinsNode = this.createLabel(`💰 ${this.coins}`, 0, 0, 32);
        this.coinsLabel = coinsNode.getComponent(Label);
        topBar.addChild(coinsNode);

        // 返回按钮
        const backBtn = this.createButton('返回', -280, 300, 80, 40, () => {
            this.saveGame();
            director.loadScene('MainMenu');
        });
        this.gameContainer.addChild(backBtn);

        // 棋盘容器
        this.gridContainer = new Node('GridContainer');
        this.gridContainer.layer = this.node.layer;
        const gridTransform = this.gridContainer.addComponent(UITransform);
        const gridW = GRID_COLS * CELL_SIZE;
        const gridH = GRID_ROWS * CELL_SIZE;
        gridTransform.setContentSize(gridW, gridH);
        gridTransform.setAnchorPoint(0, 0);
        this.gridContainer.setPosition(-gridW / 2, -gridH / 2 + 30, 0);
        this.gameContainer.addChild(this.gridContainer);

        // 绘制格子背景
        this.drawGridBackground();

        // 初始化格子数据
        this.initGrid();

        // 底部按钮
        const spawnBtn = this.createButton(`生成 (${this.spawnCost}💰)`, 0, -280, 180, 50, () => {
            this.spawnItem();
        });
        this.gameContainer.addChild(spawnBtn);

        // 收集按钮
        const collectBtn = this.createButton('收集金币', 0, -340, 180, 50, () => {
            this.collectCoins();
        });
        this.gameContainer.addChild(collectBtn);

        // 合成提示
        const hintLabel = this.createLabel('拖动相同物品到一起合成', 0, 220, 18);
        this.gameContainer.addChild(hintLabel);

        // 恢复存档的物品
        this.restoreItems();
    }

    drawGridBackground() {
        if (!this.gridContainer) return;

        const bg = new Node('GridBg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);
        
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;
                
                graphics.fillColor = new Color(50, 70, 90, 200);
                graphics.roundRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 8);
                graphics.fill();
            }
        }
        
        this.gridContainer.addChild(bg);
    }

    initGrid() {
        this.grid = [];
        for (let row = 0; row < GRID_ROWS; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                this.grid[row][col] = null;
            }
        }
    }

    spawnItem() {
        if (this.coins < this.spawnCost) {
            console.log('金币不足');
            return;
        }

        // 找空位
        const emptySlots: {x: number, y: number}[] = [];
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (!this.grid[row][col]) {
                    emptySlots.push({x: col, y: row});
                }
            }
        }

        if (emptySlots.length === 0) {
            console.log('没有空位');
            return;
        }

        this.coins -= this.spawnCost;
        this.updateUI();

        const slot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
        this.createItem(slot.x, slot.y, 1);

        this.saveGame();
    }

    createItem(gridX: number, gridY: number, level: number): MergeItem {
        const itemConfig = MERGE_ITEMS[level - 1];
        const node = new Node(`Item_${gridX}_${gridY}`);
        node.layer = this.node.layer;
        
        const transform = node.addComponent(UITransform);
        transform.setContentSize(CELL_SIZE - 10, CELL_SIZE - 10);
        
        // 背景
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(80, 120, 160, 230);
        graphics.roundRect(-(CELL_SIZE-10)/2, -(CELL_SIZE-10)/2, CELL_SIZE - 10, CELL_SIZE - 10, 10);
        graphics.fill();
        
        // emoji
        const label = node.addComponent(Label);
        label.string = itemConfig.emoji;
        label.fontSize = 40;
        label.lineHeight = CELL_SIZE;
        
        const x = gridX * CELL_SIZE + CELL_SIZE / 2;
        const y = gridY * CELL_SIZE + CELL_SIZE / 2;
        node.setPosition(x, y, 0);
        
        this.gridContainer?.addChild(node);
        
        const item: MergeItem = { node, level, gridX, gridY };
        this.grid[gridY][gridX] = item;
        
        // 添加拖拽事件
        node.on(Node.EventType.TOUCH_START, (e: any) => this.onTouchStart(item, e), this);
        node.on(Node.EventType.TOUCH_MOVE, (e: any) => this.onTouchMove(item, e), this);
        node.on(Node.EventType.TOUCH_END, (e: any) => this.onTouchEnd(item, e), this);
        node.on(Node.EventType.TOUCH_CANCEL, (e: any) => this.onTouchEnd(item, e), this);
        
        // 生成动画
        node.setScale(new Vec3(0, 0, 1));
        tween(node).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
        
        return item;
    }

    onTouchStart(item: MergeItem, event: any) {
        this.selectedItem = item;
        this.isDragging = true;
        item.node.setScale(new Vec3(1.1, 1.1, 1));
        item.node.setSiblingIndex(999); // 移到最上层
    }

    onTouchMove(item: MergeItem, event: any) {
        if (!this.isDragging || !this.selectedItem) return;
        
        const delta = event.getDelta();
        const pos = item.node.position;
        item.node.setPosition(pos.x + delta.x, pos.y + delta.y, 0);
    }

    onTouchEnd(item: MergeItem, event: any) {
        if (!this.selectedItem) return;
        
        this.isDragging = false;
        item.node.setScale(new Vec3(1, 1, 1));
        
        // 计算落点格子
        const pos = item.node.position;
        const targetX = Math.floor(pos.x / CELL_SIZE);
        const targetY = Math.floor(pos.y / CELL_SIZE);
        
        // 检查是否有效
        if (targetX >= 0 && targetX < GRID_COLS && targetY >= 0 && targetY < GRID_ROWS) {
            const targetItem = this.grid[targetY][targetX];
            
            if (targetItem && targetItem !== item && targetItem.level === item.level) {
                // 合成！
                this.mergeItems(item, targetItem);
            } else if (!targetItem || targetItem === item) {
                // 移动到新位置
                this.moveItem(item, targetX, targetY);
            } else {
                // 返回原位
                this.returnToOriginal(item);
            }
        } else {
            // 返回原位
            this.returnToOriginal(item);
        }
        
        this.selectedItem = null;
    }

    mergeItems(source: MergeItem, target: MergeItem) {
        const newLevel = source.level + 1;
        
        if (newLevel > MERGE_ITEMS.length) {
            // 已达最高级，返回原位
            this.returnToOriginal(source);
            return;
        }
        
        // 清除原位置
        this.grid[source.gridY][source.gridX] = null;
        this.grid[target.gridY][target.gridX] = null;
        
        // 动画：source移动到target位置
        const targetX = target.gridX * CELL_SIZE + CELL_SIZE / 2;
        const targetY = target.gridY * CELL_SIZE + CELL_SIZE / 2;
        
        tween(source.node)
            .to(0.15, { position: new Vec3(targetX, targetY, 0), scale: new Vec3(0, 0, 1) })
            .call(() => {
                source.node.destroy();
            })
            .start();
        
        tween(target.node)
            .to(0.15, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                target.node.destroy();
                // 创建新物品
                this.createItem(target.gridX, target.gridY, newLevel);
                this.saveGame();
            })
            .start();
    }

    moveItem(item: MergeItem, newX: number, newY: number) {
        // 清除原位置
        this.grid[item.gridY][item.gridX] = null;
        
        // 设置新位置
        item.gridX = newX;
        item.gridY = newY;
        this.grid[newY][newX] = item;
        
        // 动画移动
        const targetX = newX * CELL_SIZE + CELL_SIZE / 2;
        const targetY = newY * CELL_SIZE + CELL_SIZE / 2;
        tween(item.node)
            .to(0.1, { position: new Vec3(targetX, targetY, 0) })
            .start();
        
        this.saveGame();
    }

    returnToOriginal(item: MergeItem) {
        const x = item.gridX * CELL_SIZE + CELL_SIZE / 2;
        const y = item.gridY * CELL_SIZE + CELL_SIZE / 2;
        tween(item.node)
            .to(0.1, { position: new Vec3(x, y, 0) })
            .start();
    }

    collectCoins() {
        let total = 0;
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const item = this.grid[row][col];
                if (item) {
                    const config = MERGE_ITEMS[item.level - 1];
                    total += config.value;
                }
            }
        }
        
        if (total > 0) {
            this.coins += total;
            this.updateUI();
            this.saveGame();
            console.log(`收集了 ${total} 金币！`);
        }
    }

    getMaxLevel(): number {
        let max = 0;
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const item = this.grid[row][col];
                if (item && item.level > max) {
                    max = item.level;
                }
            }
        }
        return max;
    }

    updateUI() {
        if (this.coinsLabel) this.coinsLabel.string = `💰 ${this.coins}`;
    }

    // =================== 存档 ===================
    saveGame() {
        try {
            if (typeof localStorage === 'undefined') return;
            
            const items: {x: number, y: number, level: number}[] = [];
            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLS; col++) {
                    const item = this.grid[row][col];
                    if (item) {
                        items.push({ x: col, y: row, level: item.level });
                    }
                }
            }
            
            localStorage.setItem('merge_coins', this.coins.toString());
            localStorage.setItem('merge_items', JSON.stringify(items));
        } catch (e) {
            console.log('保存失败');
        }
    }

    loadGame() {
        try {
            if (typeof localStorage === 'undefined') return;
            
            this.coins = parseInt(localStorage.getItem('merge_coins') || '100');
        } catch (e) {
            this.coins = 100;
        }
    }

    restoreItems() {
        try {
            if (typeof localStorage === 'undefined') return;
            
            const itemsJson = localStorage.getItem('merge_items');
            if (itemsJson) {
                const items = JSON.parse(itemsJson);
                for (const item of items) {
                    if (item.x >= 0 && item.x < GRID_COLS && item.y >= 0 && item.y < GRID_ROWS) {
                        this.createItem(item.x, item.y, item.level);
                    }
                }
            }
        } catch (e) {
            console.log('恢复存档失败');
        }
    }

    // =================== 工具方法 ===================
    clearAll() {
        this.menuContainer?.destroy();
        this.gameContainer?.destroy();
        this.menuContainer = null;
        this.gameContainer = null;
        this.gridContainer = null;
    }

    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(400, fontSize + 20);
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

        const labelNode = this.createLabel(text, 0, 0, 20);
        node.addChild(labelNode);

        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }
}
