import { _decorator, Component, Node, Label, UITransform, Color, Size, Vec3, tween, Graphics, director, view } from 'cc';
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
    'ore5': { key: 'ore5', name: '金矿', emoji: '🥇', tier: 5, mergeInto: 'ore6' },
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
    
    // 金币线 (8级)
    'coin1': { key: 'coin1', name: '1金币', emoji: '🪙', tier: 1, value: 1, mergeInto: 'coin2' },
    'coin2': { key: 'coin2', name: '5金币', emoji: '💰', tier: 2, value: 5, mergeInto: 'coin3' },
    'coin3': { key: 'coin3', name: '25金币', emoji: '💰', tier: 3, value: 25, mergeInto: 'coin4' },
    'coin4': { key: 'coin4', name: '125金币', emoji: '💎', tier: 4, value: 125, mergeInto: 'coin5' },
    'coin5': { key: 'coin5', name: '625金币', emoji: '💎', tier: 5, value: 625, mergeInto: 'coin6' },
    'coin6': { key: 'coin6', name: '3125金币', emoji: '👑', tier: 6, value: 3125, mergeInto: 'coin7' },
    'coin7': { key: 'coin7', name: '15625金币', emoji: '👑', tier: 7, value: 15625, mergeInto: 'coin8' },
    'coin8': { key: 'coin8', name: '78125金币', emoji: '🏆', tier: 8, value: 78125 },
    
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

// 购物者类型
const SHOPPER_TYPES = [
    { name: '农夫', emoji: '👨‍🌾' },
    { name: '村民', emoji: '👧' },
    { name: '老爷爷', emoji: '👴' },
    { name: '商人', emoji: '🧔' },
    { name: '工匠', emoji: '👷' },
    { name: '贵族', emoji: '🎅' },
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
    new Color(255, 238, 88),   // 8 - 金色
];

// 网格配置 - 6列8行
const GRID_COLS = 6;
const GRID_ROWS = 8;
const CELL_SIZE = 55;

interface MergeItem {
    id: number;
    node: Node;
    config: ItemConfig;
    gridX: number;
    gridY: number;
}

interface Shopper {
    id: number;
    emoji: string;
    name: string;
    needs: {key: string, count: number}[];
    reward: {coin: number, diamond: number};
}

/**
 * 合成游戏 - 复刻 weapp 版
 */
@ccclass('MergeGame')
export class MergeGame extends Component {
    // 游戏状态
    private grid: (MergeItem | null)[][] = [];
    private items: MergeItem[] = [];
    private shoppers: Shopper[] = [];
    private selectedItem: MergeItem | null = null;
    private isDragging: boolean = false;
    private nextItemId: number = 1;
    private nextShopperId: number = 1;
    
    // 资源
    private energy: number = 9995;
    private coins: number = 515;
    private diamonds: number = 10;
    private wood: number = 100;
    private stone: number = 50;

    // UI引用
    private gameContainer: Node | null = null;
    private gridContainer: Node | null = null;
    private shopperContainer: Node | null = null;
    private infoLabel: Label | null = null;
    private resourceLabels: {[key: string]: Label} = {};

    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;
    
    // 网格位置
    private gridOffsetX: number = 0;
    private gridOffsetY: number = 0;

    start() {
        console.log('🔮 合成游戏');
        
        const size = view.getDesignResolutionSize();
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        
        this.loadGame();
        this.initGame();
    }

    initGame() {
        this.gameContainer = new Node('GameContainer');
        this.gameContainer.layer = this.node.layer;
        this.gameContainer.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        this.node.addChild(this.gameContainer);

        // 绘制各部分
        this.drawBackground();
        this.drawTopBar();
        this.drawShopperArea();
        this.drawGrid();
        this.drawBottomBar();
        
        // 初始化数据
        this.initGridData();
        
        // 恢复存档或新游戏
        if (!this.restoreItems()) {
            this.spawnItem('warehouse', 2, 4);
            this.spawnItem('wood1', 0, 0);
            this.spawnItem('wood1', 1, 0);
            this.spawnItem('stone1', 0, 1);
        }
        
        // 初始化购物者
        this.initShoppers();
        
        this.showInfo('点击仓库获取物品！');
    }

    // =================== 背景绘制 ===================
    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        // 天空部分（上半）
        graphics.fillColor = new Color(135, 206, 235);  // 天蓝色
        graphics.rect(-this.screenWidth/2, 0, this.screenWidth, this.screenHeight/2);
        graphics.fill();
        
        // 草地部分（下半）
        graphics.fillColor = new Color(76, 140, 80);  // 绿色
        graphics.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight/2);
        graphics.fill();
        
        this.gameContainer?.addChild(bg);
        
        // 装饰元素
        this.drawDecorations();
    }
    
    drawDecorations() {
        // 云朵
        const cloud1 = this.createLabel('☁️', -this.screenWidth/2 + 80, this.screenHeight/2 - 200, 40);
        cloud1.getComponent(Label)!.color = new Color(255, 255, 255, 180);
        this.gameContainer?.addChild(cloud1);
        
        const cloud2 = this.createLabel('☁️', this.screenWidth/2 - 100, this.screenHeight/2 - 250, 50);
        cloud2.getComponent(Label)!.color = new Color(255, 255, 255, 180);
        this.gameContainer?.addChild(cloud2);
        
        // 树木
        const tree1 = this.createLabel('🌳', -this.screenWidth/2 + 40, -100, 45);
        this.gameContainer?.addChild(tree1);
        
        const tree2 = this.createLabel('🌴', this.screenWidth/2 - 40, -150, 45);
        this.gameContainer?.addChild(tree2);
        
        // 花朵
        const flower1 = this.createLabel('🌸', -this.screenWidth/2 + 80, -this.screenHeight/2 + 180, 24);
        this.gameContainer?.addChild(flower1);
        
        const flower2 = this.createLabel('🌷', this.screenWidth/2 - 70, -this.screenHeight/2 + 160, 24);
        this.gameContainer?.addChild(flower2);
        
        // 蝴蝶
        const butterfly = this.createLabel('🦋', 0, -this.screenHeight/2 + 100, 28);
        this.gameContainer?.addChild(butterfly);
    }

    // =================== 顶部栏 ===================
    drawTopBar() {
        const topY = this.screenHeight/2 - 80;
        
        // 背景面板
        const bar = new Node('TopBar');
        bar.layer = this.node.layer;
        const graphics = bar.addComponent(Graphics);
        bar.addComponent(UITransform).setContentSize(this.screenWidth - 20, 70);
        bar.setPosition(0, topY, 0);
        
        graphics.fillColor = new Color(0, 0, 0, 180);
        graphics.roundRect(-(this.screenWidth-20)/2, -35, this.screenWidth - 20, 70, 15);
        graphics.fill();
        
        this.gameContainer?.addChild(bar);
        
        // 标题
        const title = this.createLabel('🏝️ 小岛物语', 0, 12, 20);
        bar.addChild(title);
        
        // 资源栏
        const resY = -15;
        
        // 体力
        const energyLabel = this.createLabel(`⚡${this.energy}`, -140, resY, 15);
        this.resourceLabels['energy'] = energyLabel.getComponent(Label)!;
        bar.addChild(energyLabel);
        
        // 金币
        const coinsLabel = this.createLabel(`💰${this.coins}`, -50, resY, 15);
        this.resourceLabels['coins'] = coinsLabel.getComponent(Label)!;
        bar.addChild(coinsLabel);
        
        // 木材
        const woodLabel = this.createLabel(`🌲${this.wood}`, 40, resY, 15);
        this.resourceLabels['wood'] = woodLabel.getComponent(Label)!;
        bar.addChild(woodLabel);
        
        // 石头
        const stoneLabel = this.createLabel(`⚪${this.stone}`, 120, resY, 15);
        this.resourceLabels['stone'] = stoneLabel.getComponent(Label)!;
        bar.addChild(stoneLabel);
    }

    // =================== 购物者区域 ===================
    drawShopperArea() {
        const topY = this.screenHeight/2 - 170;
        
        this.shopperContainer = new Node('ShopperArea');
        this.shopperContainer.layer = this.node.layer;
        this.shopperContainer.addComponent(UITransform).setContentSize(this.screenWidth - 20, 90);
        this.shopperContainer.setPosition(0, topY, 0);
        
        // 背景
        const graphics = this.shopperContainer.addComponent(Graphics);
        graphics.fillColor = new Color(139, 90, 43, 220);
        graphics.roundRect(-(this.screenWidth-20)/2, -45, this.screenWidth - 20, 90, 10);
        graphics.fill();
        
        this.gameContainer?.addChild(this.shopperContainer);
        
        // 标题
        const title = this.createLabel('🛒 购物者', -(this.screenWidth-20)/2 + 60, 30, 14);
        this.shopperContainer.addChild(title);
    }

    // =================== 网格绘制 ===================
    drawGrid() {
        const gridW = GRID_COLS * CELL_SIZE;
        const gridH = GRID_ROWS * CELL_SIZE;
        
        // 网格居中，在购物者区域下方
        const gridY = this.screenHeight/2 - 230 - gridH/2 - 30;
        
        this.gridOffsetX = -gridW/2;
        this.gridOffsetY = gridY - gridH/2;
        
        this.gridContainer = new Node('GridContainer');
        this.gridContainer.layer = this.node.layer;
        const transform = this.gridContainer.addComponent(UITransform);
        transform.setContentSize(gridW, gridH);
        transform.setAnchorPoint(0, 0);
        this.gridContainer.setPosition(this.gridOffsetX, this.gridOffsetY, 0);
        this.gameContainer?.addChild(this.gridContainer);
        
        // 网格背景
        const bg = new Node('GridBg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(gridW, gridH);
        
        // 绘制格子
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;
                
                // 交替颜色（棋盘效果）
                const isLight = (row + col) % 2 === 0;
                graphics.fillColor = isLight ? new Color(100, 140, 160, 180) : new Color(80, 120, 140, 180);
                graphics.roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6);
                graphics.fill();
            }
        }
        
        this.gridContainer.addChild(bg);
    }

    // =================== 底部栏 ===================
    drawBottomBar() {
        const bottomY = -this.screenHeight/2 + 80;
        
        // 返回按钮
        const backBtn = this.createButton('返回', -this.screenWidth/2 + 60, bottomY, 80, 40, () => {
            this.saveGame();
            director.loadScene('MainMenu');
        });
        this.gameContainer?.addChild(backBtn);
        
        // 信息栏
        const infoBar = new Node('InfoBar');
        infoBar.layer = this.node.layer;
        const graphics = infoBar.addComponent(Graphics);
        infoBar.addComponent(UITransform).setContentSize(this.screenWidth - 180, 40);
        infoBar.setPosition(40, bottomY, 0);
        
        graphics.fillColor = new Color(0, 60, 40, 200);
        graphics.roundRect(-(this.screenWidth-180)/2, -20, this.screenWidth - 180, 40, 8);
        graphics.fill();
        
        this.gameContainer?.addChild(infoBar);
        
        // 信息文字
        const infoNode = this.createLabel('', 0, 0, 16);
        this.infoLabel = infoNode.getComponent(Label);
        infoBar.addChild(infoNode);
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
        
        // 随机需求 1-2 种物品
        const needCount = Math.floor(Math.random() * 2) + 1;
        const needs: {key: string, count: number}[] = [];
        const usedKeys = new Set<string>();
        
        const possibleItems = ['wood1', 'stone1', 'food1', 'ore1', 'cloth1', 'coin1'];
        
        for (let i = 0; i < needCount; i++) {
            const pool = possibleItems.filter(k => !usedKeys.has(k));
            if (pool.length === 0) break;
            const key = pool[Math.floor(Math.random() * pool.length)];
            usedKeys.add(key);
            needs.push({ key, count: Math.floor(Math.random() * 2) + 1 });
        }
        
        // 计算奖励
        let coinReward = 0;
        needs.forEach(n => {
            const item = ITEMS[n.key];
            coinReward += (item.tier || 1) * 15 * n.count;
        });
        
        return {
            id: this.nextShopperId++,
            emoji: type.emoji,
            name: type.name,
            needs,
            reward: { coin: coinReward, diamond: coinReward >= 60 ? 1 : 0 },
        };
    }
    
    drawShoppers() {
        if (!this.shopperContainer) return;
        
        // 清除旧的卡片（保留背景和标题）
        const children = this.shopperContainer.children.slice();
        children.forEach(child => {
            if (child.name.startsWith('Shopper_')) {
                child.destroy();
            }
        });
        
        // 绘制购物者卡片
        const cardW = (this.screenWidth - 60) / 3;
        const startX = -(this.screenWidth - 60) / 2 + cardW / 2 + 10;
        
        this.shoppers.forEach((shopper, i) => {
            const x = startX + i * (cardW + 5);
            const card = this.createShopperCard(shopper, x, -10);
            this.shopperContainer?.addChild(card);
        });
    }
    
    createShopperCard(shopper: Shopper, x: number, y: number): Node {
        const cardW = (this.screenWidth - 80) / 3;
        const node = new Node(`Shopper_${shopper.id}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(cardW, 55);
        
        // 检查是否可完成
        const canFulfill = this.canFulfillOrder(shopper);
        
        // 背景
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = canFulfill ? new Color(76, 175, 80, 230) : new Color(50, 50, 50, 200);
        graphics.roundRect(-cardW/2, -27, cardW, 55, 8);
        graphics.fill();
        
        if (canFulfill) {
            graphics.strokeColor = new Color(76, 175, 80);
            graphics.lineWidth = 2;
            graphics.roundRect(-cardW/2, -27, cardW, 55, 8);
            graphics.stroke();
        }
        
        // 购物者头像
        const emoji = this.createLabel(shopper.emoji, -cardW/2 + 20, 10, 22);
        node.addChild(emoji);
        
        // 需求物品
        let needX = -cardW/2 + 45;
        shopper.needs.forEach(need => {
            const item = ITEMS[need.key];
            if (item) {
                const needLabel = this.createLabel(`${item.emoji}x${need.count}`, needX, 10, 14);
                node.addChild(needLabel);
                needX += 45;
            }
        });
        
        // 奖励
        const rewardText = `💰${shopper.reward.coin}`;
        const rewardLabel = this.createLabel(rewardText, -cardW/2 + 30, -15, 12);
        rewardLabel.getComponent(Label)!.color = new Color(255, 215, 0);
        node.addChild(rewardLabel);
        
        node.setPosition(x, y, 0);
        
        // 点击事件
        node.on(Node.EventType.TOUCH_END, () => {
            this.tryFulfillOrder(shopper);
        }, this);
        
        return node;
    }
    
    canFulfillOrder(shopper: Shopper): boolean {
        for (const need of shopper.needs) {
            if (this.countItems(need.key) < need.count) return false;
        }
        return true;
    }
    
    tryFulfillOrder(shopper: Shopper) {
        if (!this.canFulfillOrder(shopper)) {
            const missing: string[] = [];
            for (const need of shopper.needs) {
                const has = this.countItems(need.key);
                if (has < need.count) {
                    const item = ITEMS[need.key];
                    missing.push(`${item.emoji}x${need.count - has}`);
                }
            }
            this.showInfo(`还需要: ${missing.join(' ')}`);
            return;
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
        this.showInfo(`🎉 ${shopper.emoji} 满意离开！+💰${shopper.reward.coin}`);
        this.saveGame();
    }

    // =================== 物品系统 ===================
    initGridData() {
        this.grid = [];
        for (let row = 0; row < GRID_ROWS; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                this.grid[row][col] = null;
            }
        }
    }
    
    spawnItem(key: string, gridX: number, gridY: number): MergeItem | null {
        const config = ITEMS[key];
        if (!config) return null;
        if (this.grid[gridY]?.[gridX]) return null;

        const node = new Node(`Item_${this.nextItemId}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(CELL_SIZE - 6, CELL_SIZE - 6);
        
        // 背景
        const bgNode = new Node('Background');
        bgNode.layer = this.node.layer;
        bgNode.addComponent(UITransform).setContentSize(CELL_SIZE - 6, CELL_SIZE - 6);
        const graphics = bgNode.addComponent(Graphics);
        const tierColor = TIER_COLORS[config.tier] || TIER_COLORS[0];
        graphics.fillColor = tierColor;
        graphics.roundRect(-(CELL_SIZE-6)/2, -(CELL_SIZE-6)/2, CELL_SIZE - 6, CELL_SIZE - 6, 8);
        graphics.fill();
        node.addChild(bgNode);
        
        // Emoji
        const labelNode = this.createLabel(config.emoji, 0, 0, 26);
        node.addChild(labelNode);
        
        // 等级角标（右上角）
        if (config.tier > 0) {
            const badge = new Node('Badge');
            badge.layer = this.node.layer;
            badge.addComponent(UITransform).setContentSize(18, 18);
            
            const badgeGfx = badge.addComponent(Graphics);
            badgeGfx.fillColor = new Color(60, 40, 30, 230);
            badgeGfx.circle(0, 0, 9);
            badgeGfx.fill();
            
            const badgeLabel = this.createLabel(`${config.tier}`, 0, 0, 11);
            badge.addChild(badgeLabel);
            
            badge.setPosition((CELL_SIZE-6)/2 - 8, (CELL_SIZE-6)/2 - 8, 0);
            node.addChild(badge);
        }
        
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
        
        // 交互事件
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
    
    // =================== 触摸交互 ===================
    onItemTouchStart(item: MergeItem, event: any) {
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
        if (!this.isDragging || this.selectedItem !== item) return;
        
        const delta = event.getDelta();
        const pos = item.node.position;
        item.node.setPosition(pos.x + delta.x, pos.y + delta.y, 0);
    }

    onItemTouchEnd(item: MergeItem, event: any) {
        if (!this.selectedItem || this.selectedItem !== item) return;
        
        this.isDragging = false;
        item.node.setScale(new Vec3(1, 1, 1));
        
        const pos = item.node.position;
        const targetX = Math.floor(pos.x / CELL_SIZE);
        const targetY = Math.floor(pos.y / CELL_SIZE);
        
        if (targetX >= 0 && targetX < GRID_COLS && targetY >= 0 && targetY < GRID_ROWS) {
            const targetItem = this.grid[targetY][targetX];
            
            if (targetItem && targetItem !== item && targetItem.config.key === item.config.key) {
                this.mergeItems(item, targetItem);
            } else if (!targetItem) {
                this.moveItem(item, targetX, targetY);
            } else if (targetItem && targetItem !== item) {
                this.swapItems(item, targetItem);
            } else {
                this.returnToOriginal(item);
            }
        } else {
            this.returnToOriginal(item);
        }
        
        this.selectedItem = null;
        this.saveGame();
    }

    // =================== 仓库系统 ===================
    onWarehouseClick(warehouse: MergeItem) {
        const empty = this.findEmptyCell();
        if (!empty) {
            this.showInfo('没有空位了！');
            return;
        }

        const drop = this.randomDrop();
        const item = this.spawnItemWithAnimation(drop, empty.x, empty.y, warehouse.gridX, warehouse.gridY);
        
        // 仓库抖动
        this.shakeWarehouse(warehouse);
        
        if (item) {
            this.showInfo(`获得 ${ITEMS[drop].emoji} ${ITEMS[drop].name}！`);
        }
        this.saveGame();
    }
    
    shakeWarehouse(warehouse: MergeItem) {
        const originalX = warehouse.gridX * CELL_SIZE + CELL_SIZE / 2;
        const originalY = warehouse.gridY * CELL_SIZE + CELL_SIZE / 2;
        
        tween(warehouse.node)
            .to(0.05, { position: new Vec3(originalX - 3, originalY + 5, 0), scale: new Vec3(1.1, 0.9, 1) })
            .to(0.05, { position: new Vec3(originalX + 3, originalY - 2, 0), scale: new Vec3(0.95, 1.05, 1) })
            .to(0.05, { position: new Vec3(originalX, originalY, 0), scale: new Vec3(1, 1, 1) })
            .start();
    }
    
    spawnItemWithAnimation(key: string, gridX: number, gridY: number, startGridX: number, startGridY: number): MergeItem | null {
        const item = this.spawnItem(key, gridX, gridY);
        if (!item) return null;
        
        const startX = startGridX * CELL_SIZE + CELL_SIZE / 2;
        const startY = startGridY * CELL_SIZE + CELL_SIZE / 2;
        const targetX = gridX * CELL_SIZE + CELL_SIZE / 2;
        const targetY = gridY * CELL_SIZE + CELL_SIZE / 2;
        
        item.node.setPosition(startX, startY, 0);
        item.node.setScale(new Vec3(0.3, 0.3, 1));
        item.node.angle = 0;
        
        const flyDuration = 0.45;
        const peakHeight = 100;
        let elapsed = 0;
        
        const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
        
        const updateAnimation = (dt: number) => {
            elapsed += dt;
            const rawT = Math.min(elapsed / flyDuration, 1);
            const t = easeOutQuad(rawT);
            
            const x = startX + (targetX - startX) * t;
            const parabola = -4 * peakHeight * rawT * (rawT - 1);
            const baseY = startY + (targetY - startY) * t;
            const y = baseY + parabola;
            
            const scale = 0.3 + 0.7 * t;
            const angle = rawT * 360 * 1.5;
            
            item.node.setPosition(x, y, 0);
            item.node.setScale(new Vec3(scale, scale, 1));
            item.node.angle = angle;
            
            if (rawT >= 1) {
                this.unschedule(updateAnimation);
                item.node.setPosition(targetX, targetY, 0);
                item.node.setScale(new Vec3(1, 1, 1));
                item.node.angle = 0;
                this.createLandingEffect(targetX, targetY);
            }
        };
        
        this.schedule(updateAnimation, 0);
        return item;
    }
    
    createLandingEffect(x: number, y: number) {
        const emojis = ['✨', '⭐', '💫'];
        for (let i = 0; i < 6; i++) {
            const particle = new Node('Effect');
            particle.layer = this.node.layer;
            const label = particle.addComponent(Label);
            label.string = emojis[i % 3];
            label.fontSize = 14;
            particle.addComponent(UITransform);
            
            const angle = (i / 6) * Math.PI * 2;
            particle.setPosition(x, y, 0);
            this.gridContainer?.addChild(particle);
            
            const targetR = 30 + Math.random() * 15;
            tween(particle)
                .to(0.35, {
                    position: new Vec3(x + Math.cos(angle) * targetR, y + Math.sin(angle) * targetR, 0),
                    scale: new Vec3(0, 0, 1)
                })
                .call(() => particle.destroy())
                .start();
        }
    }

    // =================== 合成与移动 ===================
    mergeItems(item1: MergeItem, item2: MergeItem) {
        const mergeInto = item1.config.mergeInto;
        if (!mergeInto) return;
        
        const targetX = item2.gridX;
        const targetY = item2.gridY;
        
        this.removeItem(item1);
        this.removeItem(item2);
        
        this.spawnItem(mergeInto, targetX, targetY);
        this.showInfo(`✨ 合成了 ${ITEMS[mergeInto].emoji} ${ITEMS[mergeInto].name}！`);
        this.drawShoppers();
    }
    
    moveItem(item: MergeItem, targetX: number, targetY: number) {
        this.grid[item.gridY][item.gridX] = null;
        item.gridX = targetX;
        item.gridY = targetY;
        this.grid[targetY][targetX] = item;
        
        const x = targetX * CELL_SIZE + CELL_SIZE / 2;
        const y = targetY * CELL_SIZE + CELL_SIZE / 2;
        tween(item.node).to(0.1, { position: new Vec3(x, y, 0) }).start();
    }
    
    swapItems(item1: MergeItem, item2: MergeItem) {
        const x1 = item1.gridX, y1 = item1.gridY;
        const x2 = item2.gridX, y2 = item2.gridY;
        
        this.grid[y1][x1] = item2;
        this.grid[y2][x2] = item1;
        item1.gridX = x2; item1.gridY = y2;
        item2.gridX = x1; item2.gridY = y1;
        
        const pos1 = new Vec3(x1 * CELL_SIZE + CELL_SIZE/2, y1 * CELL_SIZE + CELL_SIZE/2, 0);
        const pos2 = new Vec3(x2 * CELL_SIZE + CELL_SIZE/2, y2 * CELL_SIZE + CELL_SIZE/2, 0);
        
        tween(item1.node).to(0.15, { position: pos2 }).start();
        tween(item2.node).to(0.15, { position: pos1 }).start();
    }
    
    returnToOriginal(item: MergeItem) {
        const x = item.gridX * CELL_SIZE + CELL_SIZE / 2;
        const y = item.gridY * CELL_SIZE + CELL_SIZE / 2;
        tween(item.node).to(0.1, { position: new Vec3(x, y, 0) }).start();
    }

    // =================== 工具方法 ===================
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
    
    randomDrop(): string {
        const total = WAREHOUSE_DROPS.reduce((sum, d) => sum + d.weight, 0);
        let rand = Math.random() * total;
        for (const drop of WAREHOUSE_DROPS) {
            rand -= drop.weight;
            if (rand <= 0) return drop.key;
        }
        return WAREHOUSE_DROPS[0].key;
    }
    
    countItems(key: string): number {
        return this.items.filter(i => i.config.key === key).length;
    }
    
    consumeItems(key: string, count: number) {
        let remaining = count;
        for (let i = this.items.length - 1; i >= 0 && remaining > 0; i--) {
            if (this.items[i].config.key === key) {
                this.removeItem(this.items[i]);
                remaining--;
            }
        }
    }
    
    updateResourceUI() {
        if (this.resourceLabels['coins']) {
            this.resourceLabels['coins'].string = `💰${this.coins}`;
        }
        if (this.resourceLabels['energy']) {
            this.resourceLabels['energy'].string = `⚡${this.energy}`;
        }
    }
    
    showInfo(text: string) {
        if (this.infoLabel) {
            this.infoLabel.string = text;
        }
    }

    // =================== 存档系统 ===================
    saveGame() {
        try {
            const data = {
                items: this.items.map(i => ({ key: i.config.key, x: i.gridX, y: i.gridY })),
                shoppers: this.shoppers,
                coins: this.coins,
                diamonds: this.diamonds,
                energy: this.energy,
                wood: this.wood,
                stone: this.stone,
                nextItemId: this.nextItemId,
                nextShopperId: this.nextShopperId,
            };
            localStorage.setItem('island_merge_save', JSON.stringify(data));
        } catch (e) {
            console.error('保存失败:', e);
        }
    }
    
    loadGame() {
        try {
            const saved = localStorage.getItem('island_merge_save');
            if (saved) {
                const data = JSON.parse(saved);
                this.coins = data.coins || 515;
                this.diamonds = data.diamonds || 10;
                this.energy = data.energy || 9995;
                this.wood = data.wood || 100;
                this.stone = data.stone || 50;
                this.shoppers = data.shoppers || [];
                this.nextItemId = data.nextItemId || 1;
                this.nextShopperId = data.nextShopperId || 1;
            }
        } catch (e) {
            console.error('加载失败:', e);
        }
    }
    
    restoreItems(): boolean {
        try {
            const saved = localStorage.getItem('island_merge_save');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.items && data.items.length > 0) {
                    data.items.forEach((item: any) => {
                        this.spawnItem(item.key, item.x, item.y);
                    });
                    return true;
                }
            }
        } catch (e) {}
        return false;
    }

    // =================== UI工具 ===================
    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(200, fontSize + 10);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 5;
        label.color = Color.WHITE;
        node.setPosition(x, y, 0);
        return node;
    }
    
    createButton(text: string, x: number, y: number, width: number, height: number, callback: () => void): Node {
        const node = new Node('Button');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(width, height);
        
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(255, 255, 255, 200);
        graphics.roundRect(-width/2, -height/2, width, height, 8);
        graphics.fill();
        
        const label = this.createLabel(text, 0, 0, 16);
        label.getComponent(Label)!.color = new Color(44, 62, 80);
        node.addChild(label);
        
        node.setPosition(x, y, 0);
        
        node.on(Node.EventType.TOUCH_END, callback, this);
        
        return node;
    }
}
