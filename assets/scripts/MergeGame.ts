import { _decorator, Component, Node, Label, UITransform, Color, Size, Vec3, tween, Graphics, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 物品配置 - 完整版（使用emoji）
 */
const ITEMS: {[key: string]: ItemConfig} = {
    // 木材线 (8级)
    'wood1': { key: 'wood1', name: '树枝', emoji: '🌿', tier: 1, mergeInto: 'wood2' },
    'wood2': { key: 'wood2', name: '木头', emoji: '🌲', tier: 2, mergeInto: 'wood3' },
    'wood3': { key: 'wood3', name: '木板', emoji: '🪵', tier: 3, mergeInto: 'wood4' },
    'wood4': { key: 'wood4', name: '木箱', emoji: '📦', tier: 4, mergeInto: 'wood5' },
    'wood5': { key: 'wood5', name: '木屋', emoji: '🏠', tier: 5, mergeInto: 'wood6' },
    'wood6': { key: 'wood6', name: '别墅', emoji: '🏡', tier: 6, mergeInto: 'wood7' },
    'wood7': { key: 'wood7', name: '豪宅', emoji: '🏰', tier: 7, mergeInto: 'wood8' },
    'wood8': { key: 'wood8', name: '宫殿', emoji: '🏯', tier: 8 },
    
    // 石材线 (8级)
    'stone1': { key: 'stone1', name: '碎石', emoji: '⚪', tier: 1, mergeInto: 'stone2' },
    'stone2': { key: 'stone2', name: '石块', emoji: '🧱', tier: 2, mergeInto: 'stone3' },
    'stone3': { key: 'stone3', name: '石墙', emoji: '🏗️', tier: 3, mergeInto: 'stone4' },
    'stone4': { key: 'stone4', name: '石塔', emoji: '🗼', tier: 4, mergeInto: 'stone5' },
    'stone5': { key: 'stone5', name: '城堡', emoji: '🏛️', tier: 5, mergeInto: 'stone6' },
    'stone6': { key: 'stone6', name: '要塞', emoji: '🏰', tier: 6, mergeInto: 'stone7' },
    'stone7': { key: 'stone7', name: '神殿', emoji: '⛩️', tier: 7, mergeInto: 'stone8' },
    'stone8': { key: 'stone8', name: '奇迹', emoji: '🗿', tier: 8 },
    
    // 食物线 (8级)
    'food1': { key: 'food1', name: '种子', emoji: '🌱', tier: 1, mergeInto: 'food2' },
    'food2': { key: 'food2', name: '草芽', emoji: '🍀', tier: 2, mergeInto: 'food3' },
    'food3': { key: 'food3', name: '蔬菜', emoji: '🥕', tier: 3, mergeInto: 'food4' },
    'food4': { key: 'food4', name: '水果', emoji: '🍎', tier: 4, mergeInto: 'food5' },
    'food5': { key: 'food5', name: '面包', emoji: '🍞', tier: 5, mergeInto: 'food6' },
    'food6': { key: 'food6', name: '蛋糕', emoji: '🎂', tier: 6, mergeInto: 'food7' },
    'food7': { key: 'food7', name: '盛宴', emoji: '🍱', tier: 7, mergeInto: 'food8' },
    'food8': { key: 'food8', name: '满汉全席', emoji: '🍲', tier: 8 },
    
    // 矿石线 (8级)
    'ore1': { key: 'ore1', name: '煤矿', emoji: '⬛', tier: 1, mergeInto: 'ore2' },
    'ore2': { key: 'ore2', name: '铜矿', emoji: '🟤', tier: 2, mergeInto: 'ore3' },
    'ore3': { key: 'ore3', name: '铁矿', emoji: '⚙️', tier: 3, mergeInto: 'ore4' },
    'ore4': { key: 'ore4', name: '银矿', emoji: '🥈', tier: 4, mergeInto: 'ore5' },
    'ore5': { key: 'ore5', name: '💰矿', emoji: '🥇', tier: 5, mergeInto: 'ore6' },
    'ore6': { key: 'ore6', name: '宝石', emoji: '💎', tier: 6, mergeInto: 'ore7' },
    'ore7': { key: 'ore7', name: '神秘矿', emoji: '🔮', tier: 7, mergeInto: 'ore8' },
    'ore8': { key: 'ore8', name: '永恒石', emoji: '✨', tier: 8 },
    
    // 布料线 (8级)
    'cloth1': { key: 'cloth1', name: '棉花', emoji: '☁️', tier: 1, mergeInto: 'cloth2' },
    'cloth2': { key: 'cloth2', name: '线团', emoji: '🧶', tier: 2, mergeInto: 'cloth3' },
    'cloth3': { key: 'cloth3', name: '布匹', emoji: '🎀', tier: 3, mergeInto: 'cloth4' },
    'cloth4': { key: 'cloth4', name: '衣服', emoji: '👕', tier: 4, mergeInto: 'cloth5' },
    'cloth5': { key: 'cloth5', name: '礼服', emoji: '👗', tier: 5, mergeInto: 'cloth6' },
    'cloth6': { key: 'cloth6', name: '皇袍', emoji: '👘', tier: 6, mergeInto: 'cloth7' },
    'cloth7': { key: 'cloth7', name: '神衣', emoji: '👔', tier: 7, mergeInto: 'cloth8' },
    'cloth8': { key: 'cloth8', name: '传说披风', emoji: '🦸', tier: 8 },
    
    // 工具线 (8级)
    'tool1': { key: 'tool1', name: '木棍', emoji: '🥢', tier: 1, mergeInto: 'tool2' },
    'tool2': { key: 'tool2', name: '石斧', emoji: '🔨', tier: 2, mergeInto: 'tool3' },
    'tool3': { key: 'tool3', name: '铁锤', emoji: '🔧', tier: 3, mergeInto: 'tool4' },
    'tool4': { key: 'tool4', name: '钢剑', emoji: '⚔️', tier: 4, mergeInto: 'tool5' },
    'tool5': { key: 'tool5', name: '魔杖', emoji: '🪄', tier: 5, mergeInto: 'tool6' },
    'tool6': { key: 'tool6', name: '神器', emoji: '🔱', tier: 6, mergeInto: 'tool7' },
    'tool7': { key: 'tool7', name: '圣剑', emoji: '🗡️', tier: 7, mergeInto: 'tool8' },
    'tool8': { key: 'tool8', name: '创世神器', emoji: '⚡', tier: 8 },
    
    // 💰币线 (8级)
    'coin1': { key: 'coin1', name: '1💰币', emoji: '🪙', tier: 1, value: 1, mergeInto: 'coin2' },
    'coin2': { key: 'coin2', name: '5💰币', emoji: '💰', tier: 2, value: 5, mergeInto: 'coin3' },
    'coin3': { key: 'coin3', name: '25💰币', emoji: '💰', tier: 3, value: 25, mergeInto: 'coin4' },
    'coin4': { key: 'coin4', name: '125💰币', emoji: '💎', tier: 4, value: 125, mergeInto: 'coin5' },
    'coin5': { key: 'coin5', name: '625💰币', emoji: '💎', tier: 5, value: 625, mergeInto: 'coin6' },
    'coin6': { key: 'coin6', name: '3125💰币', emoji: '👑', tier: 6, value: 3125, mergeInto: 'coin7' },
    'coin7': { key: 'coin7', name: '15625💰币', emoji: '👑', tier: 7, value: 15625, mergeInto: 'coin8' },
    'coin8': { key: 'coin8', name: '78125💰币', emoji: '🏆', tier: 8, value: 78125 },
    
    // 特殊：仓库
    'warehouse': { key: 'warehouse', name: '仓库', emoji: '📦', tier: 0 },
};

interface ItemConfig {
    key: string;
    name: string;
    emoji: string;
    tier: number;
    mergeInto?: string;
    value?: number;
}

// 仓库掉落表
const WAREHOUSE_DROPS = [
    { key: 'wood1', weight: 22 },
    { key: 'stone1', weight: 22 },
    { key: 'food1', weight: 22 },
    { key: 'ore1', weight: 16 },
    { key: 'cloth1', weight: 12 },
    { key: 'tool1', weight: 10 },
    { key: 'coin1', weight: 1 },
];

// 购物者配置
const SHOPPER_TYPES = [
    { name: '村民', emoji: '👨‍🌾', items: ['wood', 'food'], maxTier: 3 },
    { name: '商人', emoji: '🧑‍💼', items: ['coin', 'ore'], maxTier: 4 },
    { name: '工匠', emoji: '👷', items: ['stone', 'tool'], maxTier: 4 },
    { name: '贵族', emoji: '🤵', items: ['cloth', 'ore'], maxTier: 5 },
    { name: '公主', emoji: '👸', items: ['cloth', 'food'], maxTier: 6 },
    { name: '国王', emoji: '🤴', items: ['wood', 'stone', 'ore'], maxTier: 7 },
];

// 等级颜色
const TIER_COLORS = [
    new Color(96, 125, 139),   // 0 - 灰色
    new Color(141, 110, 99),   // 1 - 棕色
    new Color(102, 187, 106),  // 2 - 绿色
    new Color(66, 165, 245),   // 3 - 蓝色
    new Color(171, 71, 188),   // 4 - 紫色
    new Color(255, 167, 38),   // 5 - 橙色
    new Color(239, 83, 80),    // 6 - 红色
    new Color(236, 64, 122),   // 7 - 粉色
    new Color(255, 238, 88),   // 8 - 💰色
];

const GRID_COLS = 6;
const GRID_ROWS = 6;
const CELL_SIZE = 60;

interface MergeItem {
    id: number;
    node: Node;
    config: ItemConfig;
    gridX: number;
    gridY: number;
}

interface Shopper {
    id: number;
    type: typeof SHOPPER_TYPES[0];
    needs: {key: string, count: number}[];
    reward: {coin: number, diamond: number};
    timeLeft: number;
}

// 获取屏幕尺寸（用于自适应布局）
import { view } from 'cc';

/**
 * 合成游戏 - 完整版
 */
@ccclass('MergeGame')
export class MergeGame extends Component {
    // 游戏状态
    private grid: (MergeItem | null)[][] = [];
    private items: MergeItem[] = [];
    private shoppers: Shopper[] = [];
    private coins: number = 0;
    private diamonds: number = 0;
    private selectedItem: MergeItem | null = null;
    private isDragging: boolean = false;
    private dragOffset: Vec3 = new Vec3();
    private nextItemId: number = 1;
    private nextShopperId: number = 1;

    // UI引用
    private coinsLabel: Label | null = null;
    private diamondsLabel: Label | null = null;
    private gridContainer: Node | null = null;
    private shopperContainer: Node | null = null;
    private infoLabel: Label | null = null;
    private gameContainer: Node | null = null;

    // 屏幕尺寸（使用固定设计尺寸，适配手机）
    private screenWidth: number = 750;
    private screenHeight: number = 1334;

    start() {
        console.log('🔮 合成游戏 - 完整版');
        
        // 使用固定设计分辨率（适配手机竖屏）
        // 不使用 view.getDesignResolutionSize() 因为可能返回不正确的值
        
        this.loadGame();
        this.initGame();
    }

    initGame() {
        this.gameContainer = new Node('GameContainer');
        this.gameContainer.layer = this.node.layer;
        this.gameContainer.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        this.node.addChild(this.gameContainer);

        // 背景
        this.drawBackground();

        // 顶部资源栏
        this.drawResourceBar();

        // 购物者区域
        this.drawShopperArea();

        // 棋盘
        this.drawGrid();

        // 底部按钮
        this.drawBottomButtons();

        // 信息提示
        this.drawInfoBar();

        // 初始化棋盘数据
        this.initGrid();

        // 恢复存档或新游戏
        if (!this.restoreItems()) {
            // 新游戏初始物品
            this.spawnItem('warehouse', 2, 2);
            this.spawnItem('wood1', 0, 0);
            this.spawnItem('wood1', 1, 0);
            this.spawnItem('stone1', 0, 1);
        }

        // 初始化购物者
        this.initShoppers();

        this.showInfo('点击仓库获取物品，完成订单获得奖励！');
    }

    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        // 渐变背景
        graphics.fillColor = new Color(78, 205, 196);
        graphics.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight);
        graphics.fill();
        
        this.gameContainer?.addChild(bg);
    }

    drawResourceBar() {
        // 顶部资源栏 - 放在屏幕顶部（留出安全区）
        const topY = this.screenHeight / 2 - 80;
        
        const bar = new Node('ResourceBar');
        bar.layer = this.node.layer;
        const graphics = bar.addComponent(Graphics);
        bar.addComponent(UITransform).setContentSize(400, 60);
        bar.setPosition(40, topY, 0);
        
        graphics.fillColor = new Color(0, 0, 0, 150);
        graphics.roundRect(-200, -30, 400, 60, 15);
        graphics.fill();
        
        this.gameContainer?.addChild(bar);

        // 💰币
        const coinsNode = this.createLabel(`💰 ${this.coins}`, -80, 0, 26);
        this.coinsLabel = coinsNode.getComponent(Label);
        bar.addChild(coinsNode);

        // 💎石
        const diamondsNode = this.createLabel(`💎 ${this.diamonds}`, 80, 0, 26);
        this.diamondsLabel = diamondsNode.getComponent(Label);
        bar.addChild(diamondsNode);

        // 返回按钮
        const backBtn = this.createButton('←', -this.screenWidth/2 + 60, topY, 60, 50, () => {
            this.saveGame();
            director.loadScene('MainMenu');
        });
        this.gameContainer?.addChild(backBtn);
    }

    drawShopperArea() {
        // 购物者区域 - 在资源栏下方
        const topY = this.screenHeight / 2 - 200;
        
        this.shopperContainer = new Node('ShopperArea');
        this.shopperContainer.layer = this.node.layer;
        this.shopperContainer.addComponent(UITransform).setContentSize(700, 120);
        this.shopperContainer.setPosition(0, topY, 0);
        this.gameContainer?.addChild(this.shopperContainer);

        // 标题
        const title = this.createLabel('📋 订单', 0, 50, 20);
        this.shopperContainer.addChild(title);
    }

    drawGrid() {
        // 棋盘 - 居中（在购物者和底部按钮之间）
        const gridW = GRID_COLS * CELL_SIZE;
        const gridH = GRID_ROWS * CELL_SIZE;
        const gridY = -50;  // 居中稍偏下
        
        this.gridContainer = new Node('GridContainer');
        this.gridContainer.layer = this.node.layer;
        const transform = this.gridContainer.addComponent(UITransform);
        transform.setContentSize(gridW, gridH);
        transform.setAnchorPoint(0, 0);
        this.gridContainer.setPosition(-gridW / 2, gridY - gridH / 2, 0);
        this.gameContainer?.addChild(this.gridContainer);

        // 绘制格子背景
        const bg = new Node('GridBg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(gridW, gridH);
        
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;
                
                graphics.fillColor = new Color(40, 60, 80, 200);
                graphics.roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8);
                graphics.fill();
            }
        }
        
        this.gridContainer.addChild(bg);
    }

    drawBottomButtons() {
        // 底部按钮 - 放在屏幕底部（留出安全区）
        const btnY = -this.screenHeight / 2 + 120;

        // 收集💰币按钮
        const collectBtn = this.createButton('💰 收集', -120, btnY, 140, 60, () => {
            this.collectCoins();
        });
        this.gameContainer?.addChild(collectBtn);

        // 刷新购物者按钮
        const refreshBtn = this.createButton('🔄 刷新订单', 120, btnY, 160, 60, () => {
            this.refreshShoppers();
        });
        this.gameContainer?.addChild(refreshBtn);
    }

    drawInfoBar() {
        // 信息栏 - 在棋盘和购物者之间
        const infoY = this.screenHeight / 2 - 320;
        const infoNode = this.createLabel('', 0, infoY, 18);
        this.infoLabel = infoNode.getComponent(Label);
        this.gameContainer?.addChild(infoNode);
    }

    showInfo(text: string) {
        if (this.infoLabel) {
            this.infoLabel.string = text;
        }
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

    // =================== 物品系统 ===================

    spawnItem(key: string, gridX: number, gridY: number): MergeItem | null {
        const config = ITEMS[key];
        if (!config) return null;
        if (this.grid[gridY]?.[gridX]) return null;

        const node = new Node(`Item_${this.nextItemId}`);
        node.layer = this.node.layer;
        
        const transform = node.addComponent(UITransform);
        transform.setContentSize(CELL_SIZE - 6, CELL_SIZE - 6);
        
        // 背景节点（先添加，在底层）
        const bgNode = new Node('Background');
        bgNode.layer = this.node.layer;
        bgNode.addComponent(UITransform).setContentSize(CELL_SIZE - 6, CELL_SIZE - 6);
        const graphics = bgNode.addComponent(Graphics);
        const tierColor = TIER_COLORS[config.tier] || TIER_COLORS[0];
        graphics.fillColor = tierColor;
        graphics.roundRect(-(CELL_SIZE-6)/2, -(CELL_SIZE-6)/2, CELL_SIZE - 6, CELL_SIZE - 6, 10);
        graphics.fill();
        node.addChild(bgNode);
        
        // emoji 节点（后添加，在上层）
        const labelNode = new Node('Label');
        labelNode.layer = this.node.layer;
        labelNode.addComponent(UITransform).setContentSize(CELL_SIZE - 6, CELL_SIZE - 6);
        const label = labelNode.addComponent(Label);
        label.string = config.emoji;
        label.fontSize = 28;
        label.lineHeight = CELL_SIZE;
        label.color = Color.WHITE;
        node.addChild(labelNode);
        
        const x = gridX * CELL_SIZE + CELL_SIZE / 2;
        const y = gridY * CELL_SIZE + CELL_SIZE / 2;
        node.setPosition(x, y, 0);
        
        this.gridContainer?.addChild(node);
        
        const item: MergeItem = { 
            id: this.nextItemId++,
            node, 
            config,
            gridX, 
            gridY 
        };
        this.grid[gridY][gridX] = item;
        this.items.push(item);
        
        // 添加交互
        node.on(Node.EventType.TOUCH_START, (e: any) => this.onItemTouchStart(item, e), this);
        node.on(Node.EventType.TOUCH_MOVE, (e: any) => this.onItemTouchMove(item, e), this);
        node.on(Node.EventType.TOUCH_END, (e: any) => this.onItemTouchEnd(item, e), this);
        node.on(Node.EventType.TOUCH_CANCEL, (e: any) => this.onItemTouchEnd(item, e), this);
        
        // 生成动画
        node.setScale(new Vec3(0, 0, 1));
        tween(node).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
        
        return item;
    }

    removeItem(item: MergeItem) {
        this.grid[item.gridY][item.gridX] = null;
        const idx = this.items.indexOf(item);
        if (idx >= 0) this.items.splice(idx, 1);
        item.node.destroy();
    }

    onItemTouchStart(item: MergeItem, event: any) {
        // 仓库特殊处理 - 点击出物品
        if (item.config.key === 'warehouse') {
            this.onWarehouseClick(item);
            return;
        }

        this.selectedItem = item;
        this.isDragging = true;
        item.node.setScale(new Vec3(1.1, 1.1, 1));
        item.node.setSiblingIndex(999);
    }

    onItemTouchMove(item: MergeItem, event: any) {
        if (!this.isDragging || !this.selectedItem || this.selectedItem !== item) return;
        
        const delta = event.getDelta();
        const pos = item.node.position;
        item.node.setPosition(pos.x + delta.x, pos.y + delta.y, 0);
    }

    onItemTouchEnd(item: MergeItem, event: any) {
        if (!this.selectedItem || this.selectedItem !== item) return;
        
        this.isDragging = false;
        item.node.setScale(new Vec3(1, 1, 1));
        
        // 计算落点
        const pos = item.node.position;
        const targetX = Math.floor(pos.x / CELL_SIZE);
        const targetY = Math.floor(pos.y / CELL_SIZE);
        
        if (targetX >= 0 && targetX < GRID_COLS && targetY >= 0 && targetY < GRID_ROWS) {
            const targetItem = this.grid[targetY][targetX];
            
            if (targetItem && targetItem !== item && targetItem.config.key === item.config.key) {
                // 合成！
                this.mergeItems(item, targetItem);
            } else if (targetItem && targetItem !== item && targetItem.config.key === 'warehouse') {
                // 拖到仓库上 - 回原位
                this.returnToOriginal(item);
            } else if (!targetItem) {
                // 移动到空位
                this.moveItem(item, targetX, targetY);
            } else {
                // 交换位置
                this.swapItems(item, targetItem);
            }
        } else {
            this.returnToOriginal(item);
        }
        
        this.selectedItem = null;
        this.saveGame();
    }

    onWarehouseClick(warehouse: MergeItem) {
        // 找空位
        const empty = this.findEmptyCell();
        if (!empty) {
            this.showInfo('没有空位了！');
            return;
        }

        // 随机掉落
        const drop = this.randomDrop();
        
        // 创建物品（先在仓库位置）
        const item = this.spawnItemAtPosition(drop, empty.x, empty.y, warehouse.gridX, warehouse.gridY);
        if (item) {
            // 仓库抖动反馈
            this.shakeWarehouse(warehouse);
            
            // 从仓库弹出动画 - 优雅抛物线 + 旋转 + 弹跳
            const warehouseX = warehouse.gridX * CELL_SIZE + CELL_SIZE / 2;
            const warehouseY = warehouse.gridY * CELL_SIZE + CELL_SIZE / 2;
            const targetX = empty.x * CELL_SIZE + CELL_SIZE / 2;
            const targetY = empty.y * CELL_SIZE + CELL_SIZE / 2;
            
            // 先放在仓库位置，缩小状态
            item.node.setPosition(warehouseX, warehouseY, 0);
            item.node.setScale(new Vec3(0.3, 0.3, 1));
            item.node.angle = 0;
            
            // 动画参数
            const flyDuration = 0.45;      // 飞行时间
            const bounceDuration = 0.25;   // 弹跳时间
            const peakHeight = 120;        // 抛物线最高点
            const rotations = 1.5;         // 旋转圈数
            let elapsed = 0;
            let phase = 'fly';             // 'fly' | 'bounce'
            let bounceElapsed = 0;
            
            // 缓动函数 - easeOutQuad
            const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
            
            // 缓动函数 - easeOutElastic (弹跳)
            const easeOutElastic = (t: number) => {
                if (t === 0 || t === 1) return t;
                return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
            };
            
            // 创建拖尾粒子
            const createTrailParticle = (x: number, y: number) => {
                const particle = new Node('Particle');
                particle.layer = this.node.layer;
                const pLabel = particle.addComponent(Label);
                pLabel.string = '✨';
                pLabel.fontSize = 16;
                pLabel.color = new Color(255, 215, 0);
                particle.addComponent(UITransform);
                particle.setPosition(x, y, 0);
                particle.setScale(new Vec3(0.8, 0.8, 1));
                this.gridContainer?.addChild(particle);
                
                // 粒子动画：飘散消失
                tween(particle)
                    .to(0.4, { 
                        scale: new Vec3(0, 0, 1),
                        position: new Vec3(x + (Math.random() - 0.5) * 30, y - 20, 0)
                    })
                    .call(() => particle.destroy())
                    .start();
            };
            
            let lastParticleTime = 0;
            
            // 主动画循环
            const updateAnimation = (dt: number) => {
                if (phase === 'fly') {
                    elapsed += dt;
                    const rawT = Math.min(elapsed / flyDuration, 1);
                    const t = easeOutQuad(rawT);  // 缓动
                    
                    // X 方向移动
                    const x = warehouseX + (targetX - warehouseX) * t;
                    
                    // Y 方向抛物线
                    const parabola = -4 * peakHeight * rawT * (rawT - 1);
                    const baseY = warehouseY + (targetY - warehouseY) * t;
                    const y = baseY + parabola;
                    
                    // 缩放：从0.3渐变到1.1（稍微过冲）
                    const scale = 0.3 + 0.8 * t;
                    
                    // 旋转
                    const angle = rawT * 360 * rotations;
                    
                    item.node.setPosition(x, y, 0);
                    item.node.setScale(new Vec3(scale, scale, 1));
                    item.node.angle = angle;
                    
                    // 拖尾粒子（每0.05秒一个）
                    if (elapsed - lastParticleTime > 0.06 && rawT < 0.9) {
                        createTrailParticle(x, y);
                        lastParticleTime = elapsed;
                    }
                    
                    // 飞行结束，进入弹跳阶段
                    if (rawT >= 1) {
                        phase = 'bounce';
                        bounceElapsed = 0;
                        item.node.angle = 0;  // 重置旋转
                    }
                    
                } else if (phase === 'bounce') {
                    bounceElapsed += dt;
                    const t = Math.min(bounceElapsed / bounceDuration, 1);
                    const bounce = easeOutElastic(t);
                    
                    // 弹跳缩放：从1.1到1，有弹性
                    const scale = 1.1 - 0.1 * bounce;
                    
                    // Y方向微弹
                    const bounceY = targetY + (1 - bounce) * 15;
                    
                    item.node.setPosition(targetX, bounceY, 0);
                    item.node.setScale(new Vec3(scale, scale, 1));
                    
                    // 弹跳结束
                    if (t >= 1) {
                        this.unschedule(updateAnimation);
                        item.node.setPosition(targetX, targetY, 0);
                        item.node.setScale(new Vec3(1, 1, 1));
                        item.node.angle = 0;
                        
                        // 落地星星特效
                        this.createLandingEffect(targetX, targetY);
                    }
                }
            };
            
            this.schedule(updateAnimation, 0);
        }
        
        this.showInfo(`获得了 ${ITEMS[drop].emoji} ${ITEMS[drop].name}！`);
        this.saveGame();
    }
    
    // 仓库抖动效果
    shakeWarehouse(warehouse: MergeItem) {
        const originalX = warehouse.gridX * CELL_SIZE + CELL_SIZE / 2;
        const originalY = warehouse.gridY * CELL_SIZE + CELL_SIZE / 2;
        
        tween(warehouse.node)
            .to(0.05, { position: new Vec3(originalX - 3, originalY + 5, 0), scale: new Vec3(1.1, 0.9, 1) })
            .to(0.05, { position: new Vec3(originalX + 3, originalY - 2, 0), scale: new Vec3(0.95, 1.05, 1) })
            .to(0.05, { position: new Vec3(originalX - 2, originalY + 2, 0), scale: new Vec3(1.05, 0.98, 1) })
            .to(0.05, { position: new Vec3(originalX, originalY, 0), scale: new Vec3(1, 1, 1) })
            .start();
    }
    
    // 落地星星特效
    createLandingEffect(x: number, y: number) {
        const emojis = ['✨', '⭐', '💫'];
        for (let i = 0; i < 6; i++) {
            const particle = new Node('LandEffect');
            particle.layer = this.node.layer;
            const pLabel = particle.addComponent(Label);
            pLabel.string = emojis[i % emojis.length];
            pLabel.fontSize = 14;
            particle.addComponent(UITransform);
            
            const angle = (i / 6) * Math.PI * 2;
            const radius = 8;
            particle.setPosition(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 0);
            particle.setScale(new Vec3(0.5, 0.5, 1));
            this.gridContainer?.addChild(particle);
            
            // 向外扩散消失
            const targetRadius = 35 + Math.random() * 15;
            tween(particle)
                .to(0.35, {
                    position: new Vec3(
                        x + Math.cos(angle) * targetRadius,
                        y + Math.sin(angle) * targetRadius,
                        0
                    ),
                    scale: new Vec3(0, 0, 1)
                })
                .call(() => particle.destroy())
                .start();
        }
    }

    // 在指定位置生成物品（用于动画，初始位置可不同）
    spawnItemAtPosition(key: string, gridX: number, gridY: number, startGridX: number, startGridY: number): MergeItem | null {
        const config = ITEMS[key];
        if (!config) return null;
        if (this.grid[gridY]?.[gridX]) return null;

        const node = new Node(`Item_${this.nextItemId}`);
        node.layer = this.node.layer;
        
        const transform = node.addComponent(UITransform);
        transform.setContentSize(CELL_SIZE - 6, CELL_SIZE - 6);
        
        // 背景节点
        const bgNode = new Node('Background');
        bgNode.layer = this.node.layer;
        bgNode.addComponent(UITransform).setContentSize(CELL_SIZE - 6, CELL_SIZE - 6);
        const graphics = bgNode.addComponent(Graphics);
        const tierColor = TIER_COLORS[config.tier] || TIER_COLORS[0];
        graphics.fillColor = tierColor;
        graphics.roundRect(-(CELL_SIZE-6)/2, -(CELL_SIZE-6)/2, CELL_SIZE - 6, CELL_SIZE - 6, 10);
        graphics.fill();
        node.addChild(bgNode);
        
        // emoji 节点
        const labelNode = new Node('Label');
        labelNode.layer = this.node.layer;
        labelNode.addComponent(UITransform).setContentSize(CELL_SIZE - 6, CELL_SIZE - 6);
        const label = labelNode.addComponent(Label);
        label.string = config.emoji;
        label.fontSize = 28;
        label.lineHeight = CELL_SIZE;
        label.color = Color.WHITE;
        node.addChild(labelNode);
        
        // 初始位置（仓库位置）
        const x = startGridX * CELL_SIZE + CELL_SIZE / 2;
        const y = startGridY * CELL_SIZE + CELL_SIZE / 2;
        node.setPosition(x, y, 0);
        
        this.gridContainer?.addChild(node);
        
        const item: MergeItem = { 
            id: this.nextItemId++,
            node, 
            config,
            gridX, 
            gridY 
        };
        this.grid[gridY][gridX] = item;
        this.items.push(item);
        
        // 添加交互
        node.on(Node.EventType.TOUCH_START, (e: any) => this.onItemTouchStart(item, e), this);
        node.on(Node.EventType.TOUCH_MOVE, (e: any) => this.onItemTouchMove(item, e), this);
        node.on(Node.EventType.TOUCH_END, (e: any) => this.onItemTouchEnd(item, e), this);
        node.on(Node.EventType.TOUCH_CANCEL, (e: any) => this.onItemTouchEnd(item, e), this);
        
        return item;
    }

    randomDrop(): string {
        const totalWeight = WAREHOUSE_DROPS.reduce((sum, d) => sum + d.weight, 0);
        let rand = Math.random() * totalWeight;
        
        for (const drop of WAREHOUSE_DROPS) {
            rand -= drop.weight;
            if (rand <= 0) return drop.key;
        }
        
        return WAREHOUSE_DROPS[0].key;
    }

    findEmptyCell(): {x: number, y: number} | null {
        const emptyCells: {x: number, y: number}[] = [];
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (!this.grid[row][col]) {
                    emptyCells.push({x: col, y: row});
                }
            }
        }
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    mergeItems(source: MergeItem, target: MergeItem) {
        const mergeInto = source.config.mergeInto;
        
        if (!mergeInto) {
            this.showInfo('已达到最高级！');
            this.returnToOriginal(source);
            return;
        }
        
        const targetX = target.gridX;
        const targetY = target.gridY;
        
        // 移除两个物品
        this.removeItem(source);
        this.removeItem(target);
        
        // 生成新物品
        this.spawnItem(mergeInto, targetX, targetY);
        
        const newConfig = ITEMS[mergeInto];
        this.showInfo(`合成了 ${newConfig.emoji} ${newConfig.name}！`);
    }

    moveItem(item: MergeItem, newX: number, newY: number) {
        this.grid[item.gridY][item.gridX] = null;
        item.gridX = newX;
        item.gridY = newY;
        this.grid[newY][newX] = item;
        
        const targetX = newX * CELL_SIZE + CELL_SIZE / 2;
        const targetY = newY * CELL_SIZE + CELL_SIZE / 2;
        tween(item.node).to(0.1, { position: new Vec3(targetX, targetY, 0) }).start();
    }

    swapItems(item1: MergeItem, item2: MergeItem) {
        const x1 = item1.gridX, y1 = item1.gridY;
        const x2 = item2.gridX, y2 = item2.gridY;
        
        this.grid[y1][x1] = item2;
        this.grid[y2][x2] = item1;
        
        item1.gridX = x2; item1.gridY = y2;
        item2.gridX = x1; item2.gridY = y1;
        
        const pos1 = new Vec3(x1 * CELL_SIZE + CELL_SIZE / 2, y1 * CELL_SIZE + CELL_SIZE / 2, 0);
        const pos2 = new Vec3(x2 * CELL_SIZE + CELL_SIZE / 2, y2 * CELL_SIZE + CELL_SIZE / 2, 0);
        
        tween(item1.node).to(0.15, { position: pos2 }).start();
        tween(item2.node).to(0.15, { position: pos1 }).start();
    }

    returnToOriginal(item: MergeItem) {
        const x = item.gridX * CELL_SIZE + CELL_SIZE / 2;
        const y = item.gridY * CELL_SIZE + CELL_SIZE / 2;
        tween(item.node).to(0.1, { position: new Vec3(x, y, 0) }).start();
    }

    collectCoins() {
        let total = 0;
        const toRemove: MergeItem[] = [];
        
        for (const item of this.items) {
            if (item.config.value) {
                total += item.config.value;
                toRemove.push(item);
            }
        }
        
        if (total > 0) {
            for (const item of toRemove) {
                this.removeItem(item);
            }
            this.coins += total;
            this.updateResourceUI();
            this.showInfo(`收集了 💰${total} 💰币！`);
            this.saveGame();
        } else {
            this.showInfo('没有可收集的💰币');
        }
    }

    // =================== 购物者系统 ===================

    initShoppers() {
        if (this.shoppers.length === 0) {
            for (let i = 0; i < 3; i++) {
                this.shoppers.push(this.generateShopper());
            }
        }
        this.drawShoppers();
    }

    generateShopper(): Shopper {
        const type = SHOPPER_TYPES[Math.floor(Math.random() * SHOPPER_TYPES.length)];
        const itemType = type.items[Math.floor(Math.random() * type.items.length)];
        const tier = Math.min(type.maxTier, Math.floor(Math.random() * 3) + 1);
        const key = `${itemType}${tier}`;
        
        const count = Math.floor(Math.random() * 2) + 1;
        const baseReward = tier * tier * 10 * count;
        
        return {
            id: this.nextShopperId++,
            type,
            needs: [{key, count}],
            reward: {
                coin: baseReward,
                diamond: tier >= 5 ? 1 : 0,
            },
            timeLeft: 120,
        };
    }

    drawShoppers() {
        if (!this.shopperContainer) return;
        
        // 清除旧的
        this.shopperContainer.removeAllChildren();
        
        // 标题
        const title = this.createLabel('📋 📋', 0, 40, 18);
        this.shopperContainer.addChild(title);
        
        // 显示购物者
        const spacing = 120;
        const startX = -(this.shoppers.length - 1) * spacing / 2;
        
        this.shoppers.forEach((shopper, i) => {
            const x = startX + i * spacing;
            const shopperNode = this.createShopperNode(shopper, x, -10);
            this.shopperContainer?.addChild(shopperNode);
        });
    }

    createShopperNode(shopper: Shopper, x: number, y: number): Node {
        const node = new Node(`Shopper_${shopper.id}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(110, 80);
        
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(255, 255, 255, 200);
        graphics.roundRect(-55, -40, 110, 80, 10);
        graphics.fill();
        
        // 购物者emoji
        const emoji = this.createLabel(shopper.type.emoji, -30, 15, 28);
        emoji.getComponent(Label)!.color = Color.BLACK;
        node.addChild(emoji);
        
        // 需求
        const need = shopper.needs[0];
        const needConfig = ITEMS[need.key];
        if (needConfig) {
            const needLabel = this.createLabel(`${needConfig.emoji}×${need.count}`, 20, 15, 20);
            needLabel.getComponent(Label)!.color = Color.BLACK;
            node.addChild(needLabel);
        }
        
        // 奖励
        const rewardText = `💰${shopper.reward.coin}${shopper.reward.diamond > 0 ? ` 💎${shopper.reward.diamond}` : ''}`;
        const rewardLabel = this.createLabel(rewardText, 0, -20, 14);
        rewardLabel.getComponent(Label)!.color = new Color(50, 50, 50);
        node.addChild(rewardLabel);
        
        node.setPosition(x, y, 0);
        
        // 点击完成📋
        node.on(Node.EventType.TOUCH_END, () => {
            this.tryFulfillOrder(shopper);
        }, this);
        
        return node;
    }

    tryFulfillOrder(shopper: Shopper) {
        // 检查是否有足够的物品
        for (const need of shopper.needs) {
            const count = this.countItems(need.key);
            if (count < need.count) {
                const config = ITEMS[need.key];
                this.showInfo(`需要 ${config.emoji} ${config.name} ×${need.count}，当前只有 ${count} 个`);
                return;
            }
        }
        
        // 消耗物品
        for (const need of shopper.needs) {
            this.consumeItems(need.key, need.count);
        }
        
        // 发放奖励
        this.coins += shopper.reward.coin;
        this.diamonds += shopper.reward.diamond;
        this.updateResourceUI();
        
        // 替换购物者
        const idx = this.shoppers.findIndex(s => s.id === shopper.id);
        if (idx >= 0) {
            this.shoppers[idx] = this.generateShopper();
        }
        
        this.drawShoppers();
        this.showInfo(` ${shopper.type.emoji} 满意地离开了！+💰${shopper.reward.coin}${shopper.reward.diamond > 0 ? ` +💎${shopper.reward.diamond}` : ''}`);
        this.saveGame();
    }

    countItems(key: string): number {
        return this.items.filter(i => i.config.key === key).length;
    }

    consumeItems(key: string, count: number) {
        let remaining = count;
        const toRemove: MergeItem[] = [];
        
        for (const item of this.items) {
            if (item.config.key === key && remaining > 0) {
                toRemove.push(item);
                remaining--;
            }
        }
        
        for (const item of toRemove) {
            this.removeItem(item);
        }
    }

    refreshShoppers() {
        if (this.coins < 50) {
            this.showInfo('刷新需要 50 💰币');
            return;
        }
        
        this.coins -= 50;
        this.shoppers = [];
        for (let i = 0; i < 3; i++) {
            this.shoppers.push(this.generateShopper());
        }
        this.drawShoppers();
        this.updateResourceUI();
        this.saveGame();
    }

    updateResourceUI() {
        if (this.coinsLabel) this.coinsLabel.string = `💰 ${this.coins}`;
        if (this.diamondsLabel) this.diamondsLabel.string = `💎 ${this.diamonds}`;
    }

    // =================== 存档 ===================
    saveGame() {
        try {
            if (typeof localStorage === 'undefined') return;
            
            const itemsData = this.items.map(i => ({
                key: i.config.key,
                x: i.gridX,
                y: i.gridY,
            }));
            
            localStorage.setItem('merge_coins', this.coins.toString());
            localStorage.setItem('merge_diamonds', this.diamonds.toString());
            localStorage.setItem('merge_items', JSON.stringify(itemsData));
            localStorage.setItem('merge_shoppers', JSON.stringify(this.shoppers));
        } catch (e) {
            console.log('保存失败');
        }
    }

    loadGame() {
        try {
            if (typeof localStorage === 'undefined') return;
            
            this.coins = parseInt(localStorage.getItem('merge_coins') || '100');
            this.diamonds = parseInt(localStorage.getItem('merge_diamonds') || '5');
            
            const shoppersJson = localStorage.getItem('merge_shoppers');
            if (shoppersJson) {
                this.shoppers = JSON.parse(shoppersJson);
            }
        } catch (e) {
            this.coins = 100;
            this.diamonds = 5;
        }
    }

    restoreItems(): boolean {
        try {
            if (typeof localStorage === 'undefined') return false;
            
            const itemsJson = localStorage.getItem('merge_items');
            if (itemsJson) {
                const items = JSON.parse(itemsJson);
                if (items.length > 0) {
                    for (const item of items) {
                        if (item.x >= 0 && item.x < GRID_COLS && item.y >= 0 && item.y < GRID_ROWS) {
                            this.spawnItem(item.key, item.x, item.y);
                        }
                    }
                    return true;
                }
            }
        } catch (e) {
            console.log('恢复存档失败');
        }
        return false;
    }

    // =================== 工具方法 ===================
    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(200, fontSize + 20);
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

        const labelNode = this.createLabel(text, 0, 0, 18);
        labelNode.getComponent(Label)!.color = new Color(44, 62, 80);
        node.addChild(labelNode);

        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }
}
