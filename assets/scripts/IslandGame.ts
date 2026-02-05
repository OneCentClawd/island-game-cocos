import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 装饰物配置
 */
const ISLAND_DECORATIONS = [
    { id: 'flower1', emoji: '🌸', name: '樱花', cost: { coin: 100 }, desc: '粉粉的樱花~' },
    { id: 'flower2', emoji: '🌻', name: '向日葵', cost: { coin: 100 }, desc: '向着太阳！' },
    { id: 'flower3', emoji: '🌷', name: '郁金香', cost: { coin: 150 }, desc: '优雅的花朵' },
    { id: 'flower4', emoji: '🌹', name: '玫瑰', cost: { coin: 200 }, desc: '爱的象征' },
    { id: 'mushroom', emoji: '🍄', name: '蘑菇', cost: { coin: 80 }, desc: '可爱的小蘑菇' },
    { id: 'tree1', emoji: '🌴', name: '椰子树', cost: { coin: 300 }, desc: '热带风情' },
    { id: 'tree2', emoji: '🌳', name: '大树', cost: { coin: 250 }, desc: '绿树成荫' },
    { id: 'pond', emoji: '🪷', name: '荷花池', cost: { coin: 500 }, desc: '清凉的池塘' },
    { id: 'fountain', emoji: '⛲', name: '喷泉', cost: { coin: 800 }, desc: '哗啦啦~' },
    { id: 'bench', emoji: '🪑', name: '长椅', cost: { coin: 300 }, desc: '休息一下' },
];

/**
 * 小狗配饰
 */
const PUPPY_ACCESSORIES = [
    { id: 'bow', emoji: '🎀', name: '蝴蝶结', cost: { coin: 200 }, desc: '可爱必备！' },
    { id: 'crown', emoji: '👑', name: '小皇冠', cost: { diamond: 10 }, desc: '小狗也是王！' },
    { id: 'glasses', emoji: '🕶️', name: '墨镜', cost: { coin: 300 }, desc: '酷酷的~' },
    { id: 'scarf', emoji: '🧣', name: '围巾', cost: { coin: 250 }, desc: '暖暖的' },
    { id: 'hat', emoji: '🎩', name: '礼帽', cost: { coin: 350 }, desc: '绅士风度' },
    { id: 'bell', emoji: '🔔', name: '铃铛项圈', cost: { coin: 150 }, desc: '叮铃铃~' },
    { id: 'heart', emoji: '💝', name: '爱心项链', cost: { diamond: 5 }, desc: '满满的爱' },
];

/**
 * 小狗送礼物
 */
const PUPPY_GIFTS = [
    { emoji: '💎', name: '钻石', give: { diamond: 1 }, msg: '小狗挖到了一颗钻石！' },
    { emoji: '💰', name: '金币袋', give: { coin: 50 }, msg: '小狗找到了金币！' },
    { emoji: '⭐', name: '幸运星', give: { coin: 30 }, msg: '小狗捡到了星星！' },
    { emoji: '🍀', name: '四叶草', give: { coin: 20 }, msg: '小狗发现了四叶草！' },
];

interface PuppyState {
    x: number;
    y: number;
    mood: number;       // 心情 0-100
    hunger: number;     // 饱食度 0-100
    love: number;       // 好感度/生命值
    level: number;
    exp: number;
    expMax: number;
    state: 'idle' | 'walking' | 'happy' | 'sleeping' | 'eating' | 'playing';
    targetX: number;
    targetY: number;
    lastFed: number;
    lastPet: number;
    accessory: string | null;
}

interface Decoration {
    id: string;
    type: string;
    emoji: string;
    x: number;
    y: number;
}

/**
 * 小岛养狗游戏 - 复刻 weapp 版
 */
@ccclass('IslandGame')
export class IslandGame extends Component {
    // 小狗状态
    private puppy: PuppyState = {
        x: 0.5,
        y: 0.4,
        mood: 100,
        hunger: 100,
        love: 11,
        level: 2,
        exp: 121,
        expMax: 200,
        state: 'idle',
        targetX: 0.5,
        targetY: 0.4,
        lastFed: Date.now(),
        lastPet: Date.now(),
        accessory: 'bow',  // 默认戴蝴蝶结
    };

    // 资源
    private coins: number = 205;
    private diamonds: number = 10;
    private feedCost: number = 10;  // 喂食消耗金币

    // 装饰
    private decorations: Decoration[] = [];
    private ownedDecorations: string[] = [];
    private ownedAccessories: string[] = ['bow'];

    // UI引用
    private gameContainer: Node | null = null;
    private islandContainer: Node | null = null;
    private puppyNode: Node | null = null;
    private accessoryNode: Node | null = null;
    private infoLabel: Label | null = null;
    
    // 状态条引用
    private expBarFill: Node | null = null;
    private hungerBarFill: Node | null = null;
    private moodBarFill: Node | null = null;
    private expLabel: Label | null = null;
    private loveLabel: Label | null = null;
    private coinsLabel: Label | null = null;
    private diamondsLabel: Label | null = null;

    // 小岛配置
    private islandCenterX: number = 0;
    private islandCenterY: number = -80;
    private islandRadiusX: number = 170;
    private islandRadiusY: number = 140;

    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;
    
    // 时间
    private timeOfDay: 'day' | 'evening' | 'night' = 'day';

    start() {
        console.log('🏝️ 我的小岛');
        
        const size = view.getDesignResolutionSize();
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        
        this.loadGame();
        this.updateTimeOfDay();
        this.initGame();
        
        // 定时更新
        this.schedule(this.updatePuppy, 0.1);
        this.schedule(this.randomWalk, 4);
        this.schedule(this.decreaseStats, 30);  // 每30秒降低属性
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    updateTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
            this.timeOfDay = 'day';
        } else if (hour >= 18 && hour < 20) {
            this.timeOfDay = 'evening';
        } else {
            this.timeOfDay = 'night';
        }
    }

    initGame() {
        this.gameContainer = new Node('GameContainer');
        this.gameContainer.layer = this.node.layer;
        this.gameContainer.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        this.node.addChild(this.gameContainer);

        this.drawBackground();
        this.drawTopBar();
        this.drawStatusPanel();
        this.drawIsland();
        this.drawPuppy();
        this.drawBottomButtons();
        
        this.restoreDecorations();
    }

    // =================== 背景 ===================
    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);

        // 天空渐变 - 根据时间
        let skyColor: Color;
        if (this.timeOfDay === 'day') {
            skyColor = new Color(100, 180, 230);
        } else if (this.timeOfDay === 'evening') {
            skyColor = new Color(255, 140, 100);
        } else {
            skyColor = new Color(25, 25, 80);
        }
        
        graphics.fillColor = skyColor;
        graphics.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight);
        graphics.fill();
        
        // 海水
        graphics.fillColor = new Color(65, 145, 200);
        graphics.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight/2 + 100);
        graphics.fill();

        this.gameContainer?.addChild(bg);
        
        // 装饰
        this.drawBackgroundDecorations();
    }
    
    drawBackgroundDecorations() {
        // 太阳/月亮
        if (this.timeOfDay === 'day') {
            const sun = this.createLabel('☀️', this.screenWidth/2 - 80, this.screenHeight/2 - 200, 55);
            this.gameContainer?.addChild(sun);
        } else if (this.timeOfDay === 'night') {
            const moon = this.createLabel('🌙', this.screenWidth/2 - 80, this.screenHeight/2 - 200, 45);
            this.gameContainer?.addChild(moon);
        }
        
        // 蝴蝶
        const butterfly1 = this.createLabel('🦋', this.screenWidth/2 - 50, 50, 28);
        this.gameContainer?.addChild(butterfly1);
        
        const butterfly2 = this.createLabel('🦋', this.screenWidth/2 - 80, -20, 24);
        this.gameContainer?.addChild(butterfly2);
        
        // 星星（装饰）
        const star = this.createLabel('✨', this.screenWidth/2 - 100, -60, 18);
        this.gameContainer?.addChild(star);
    }

    // =================== 顶部栏 ===================
    drawTopBar() {
        const topY = this.screenHeight/2 - 80;
        
        // 返回按钮
        const backBtn = new Node('BackBtn');
        backBtn.layer = this.node.layer;
        backBtn.addComponent(UITransform).setContentSize(80, 40);
        
        const backGfx = backBtn.addComponent(Graphics);
        backGfx.fillColor = new Color(255, 255, 255, 230);
        backGfx.roundRect(-40, -20, 80, 40, 20);
        backGfx.fill();
        
        const backLabel = this.createLabel('返回', 0, 0, 16);
        backLabel.getComponent(Label)!.color = new Color(50, 50, 50);
        backBtn.addChild(backLabel);
        
        backBtn.setPosition(-this.screenWidth/2 + 60, topY, 0);
        backBtn.on(Node.EventType.TOUCH_END, () => {
            this.saveGame();
            director.loadScene('MainMenu');
        }, this);
        this.gameContainer?.addChild(backBtn);
        
        // 标题
        const title = this.createLabel('🏝️ 我的小岛', 0, topY, 22);
        this.gameContainer?.addChild(title);
        
        // 天气图标
        const weather = this.timeOfDay === 'day' ? '☀️' : (this.timeOfDay === 'evening' ? '🌅' : '🌙');
        const weatherLabel = this.createLabel(weather, this.screenWidth/2 - 100, topY, 35);
        this.gameContainer?.addChild(weatherLabel);
    }

    // =================== 状态面板 ===================
    drawStatusPanel() {
        const panelY = this.screenHeight/2 - 180;
        const panelW = this.screenWidth - 40;
        const panelH = 130;
        
        // 面板背景
        const panel = new Node('StatusPanel');
        panel.layer = this.node.layer;
        panel.addComponent(UITransform).setContentSize(panelW, panelH);
        
        const graphics = panel.addComponent(Graphics);
        graphics.fillColor = new Color(60, 70, 90, 220);
        graphics.roundRect(-panelW/2, -panelH/2, panelW, panelH, 12);
        graphics.fill();
        
        panel.setPosition(0, panelY, 0);
        this.gameContainer?.addChild(panel);
        
        // 第一行：小狗信息
        const row1Y = 40;
        
        // 小狗图标 + 等级
        const puppyInfo = this.createLabel(`🐕 小狗 Lv.${this.puppy.level}`, -panelW/2 + 80, row1Y, 16);
        panel.addChild(puppyInfo);
        
        // 经验条
        const expBarBg = new Node('ExpBarBg');
        expBarBg.layer = this.node.layer;
        const expBgGfx = expBarBg.addComponent(Graphics);
        expBarBg.addComponent(UITransform).setContentSize(200, 16);
        expBgGfx.fillColor = new Color(40, 40, 40);
        expBgGfx.roundRect(-100, -8, 200, 16, 8);
        expBgGfx.fill();
        expBarBg.setPosition(30, row1Y, 0);
        panel.addChild(expBarBg);
        
        // 经验条填充
        this.expBarFill = new Node('ExpBarFill');
        this.expBarFill.layer = this.node.layer;
        const expFillGfx = this.expBarFill.addComponent(Graphics);
        this.expBarFill.addComponent(UITransform).setContentSize(200, 16);
        const expPercent = this.puppy.exp / this.puppy.expMax;
        const expWidth = Math.max(4, expPercent * 196);
        expFillGfx.fillColor = new Color(76, 175, 80);
        expFillGfx.roundRect(-98, -6, expWidth, 12, 6);
        expFillGfx.fill();
        this.expBarFill.setPosition(30, row1Y, 0);
        panel.addChild(this.expBarFill);
        
        // 经验文字
        const expText = this.createLabel(`${this.puppy.exp}/${this.puppy.expMax}`, 30, row1Y, 11);
        this.expLabel = expText.getComponent(Label);
        panel.addChild(expText);
        
        // 生命值/好感度
        const loveText = this.createLabel(`❤️ ${this.puppy.love}`, panelW/2 - 50, row1Y, 16);
        this.loveLabel = loveText.getComponent(Label);
        panel.addChild(loveText);
        
        // 第二行：饱食度
        const row2Y = 10;
        const hungerIcon = this.createLabel('🍖', -panelW/2 + 30, row2Y, 18);
        panel.addChild(hungerIcon);
        
        const hungerBarBg = this.createProgressBarBg(-panelW/2 + 80, row2Y, panelW - 100);
        panel.addChild(hungerBarBg);
        
        this.hungerBarFill = this.createProgressBarFill(-panelW/2 + 80, row2Y, panelW - 100, this.puppy.hunger / 100, new Color(255, 200, 50));
        panel.addChild(this.hungerBarFill);
        
        // 第三行：心情
        const row3Y = -20;
        const moodIcon = this.createLabel('😊', -panelW/2 + 30, row3Y, 18);
        panel.addChild(moodIcon);
        
        const moodBarBg = this.createProgressBarBg(-panelW/2 + 80, row3Y, panelW - 100);
        panel.addChild(moodBarBg);
        
        this.moodBarFill = this.createProgressBarFill(-panelW/2 + 80, row3Y, panelW - 100, this.puppy.mood / 100, new Color(100, 180, 255));
        panel.addChild(this.moodBarFill);
        
        // 第四行：金币和钻石
        const row4Y = -50;
        const coinsText = this.createLabel(`💰 ${this.coins}`, -panelW/2 + 60, row4Y, 18);
        this.coinsLabel = coinsText.getComponent(Label);
        panel.addChild(coinsText);
        
        const diamondsText = this.createLabel(`💎 ${this.diamonds}`, panelW/2 - 60, row4Y, 18);
        this.diamondsLabel = diamondsText.getComponent(Label);
        panel.addChild(diamondsText);
    }
    
    createProgressBarBg(x: number, y: number, width: number): Node {
        const bg = new Node('BarBg');
        bg.layer = this.node.layer;
        const gfx = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(width, 14);
        gfx.fillColor = new Color(40, 40, 40);
        gfx.roundRect(0, -7, width, 14, 7);
        gfx.fill();
        bg.setPosition(x, y, 0);
        return bg;
    }
    
    createProgressBarFill(x: number, y: number, width: number, percent: number, color: Color): Node {
        const fill = new Node('BarFill');
        fill.layer = this.node.layer;
        const gfx = fill.addComponent(Graphics);
        fill.addComponent(UITransform).setContentSize(width, 14);
        const fillWidth = Math.max(4, percent * (width - 4));
        gfx.fillColor = color;
        gfx.roundRect(2, -5, fillWidth, 10, 5);
        gfx.fill();
        fill.setPosition(x, y, 0);
        return fill;
    }

    // =================== 小岛 ===================
    drawIsland() {
        this.islandContainer = new Node('Island');
        this.islandContainer.layer = this.node.layer;
        this.islandContainer.addComponent(UITransform).setContentSize(400, 350);
        this.islandContainer.setPosition(this.islandCenterX, this.islandCenterY, 0);
        this.gameContainer?.addChild(this.islandContainer);

        // 沙滩边缘（椭圆）
        const beach = new Node('Beach');
        beach.layer = this.node.layer;
        const beachGfx = beach.addComponent(Graphics);
        beach.addComponent(UITransform).setContentSize(400, 350);
        beachGfx.fillColor = new Color(238, 190, 140);
        beachGfx.ellipse(0, 0, this.islandRadiusX + 20, this.islandRadiusY + 15);
        beachGfx.fill();
        this.islandContainer.addChild(beach);

        // 草地（椭圆）
        const grass = new Node('Grass');
        grass.layer = this.node.layer;
        const grassGfx = grass.addComponent(Graphics);
        grass.addComponent(UITransform).setContentSize(400, 350);
        grassGfx.fillColor = new Color(120, 200, 80);
        grassGfx.ellipse(0, 10, this.islandRadiusX, this.islandRadiusY);
        grassGfx.fill();
        this.islandContainer.addChild(grass);

        // 固定建筑
        const house = this.createLabel('🏠', 20, 70, 50);
        this.islandContainer.addChild(house);

        const palm = this.createLabel('🌴', -100, 40, 45);
        this.islandContainer.addChild(palm);

        const tree = this.createLabel('🌳', 120, -20, 42);
        this.islandContainer.addChild(tree);
        
        const flower = this.createLabel('🌸', -80, -40, 30);
        this.islandContainer.addChild(flower);
    }

    // =================== 小狗 ===================
    drawPuppy() {
        this.puppyNode = new Node('Puppy');
        this.puppyNode.layer = this.node.layer;
        this.puppyNode.addComponent(UITransform).setContentSize(80, 80);

        // 小狗本体
        const puppyLabel = this.createLabel('🐕', 0, 0, 55);
        this.puppyNode.addChild(puppyLabel);

        // 配饰
        this.accessoryNode = new Node('Accessory');
        this.accessoryNode.layer = this.node.layer;
        this.accessoryNode.addComponent(UITransform).setContentSize(30, 30);
        this.updateAccessoryDisplay();
        this.puppyNode.addChild(this.accessoryNode);

        this.updatePuppyPosition();
        this.islandContainer?.addChild(this.puppyNode);

        // 点击小狗
        this.puppyNode.on(Node.EventType.TOUCH_END, () => {
            this.petPuppy();
        }, this);
    }

    updatePuppyPosition() {
        if (!this.puppyNode) return;
        const x = (this.puppy.x - 0.5) * this.islandRadiusX * 1.5;
        const y = (this.puppy.y - 0.5) * this.islandRadiusY * 1.2;
        this.puppyNode.setPosition(x, y, 0);
    }

    updateAccessoryDisplay() {
        if (!this.accessoryNode) return;
        this.accessoryNode.removeAllChildren();
        
        if (this.puppy.accessory) {
            const acc = PUPPY_ACCESSORIES.find(a => a.id === this.puppy.accessory);
            if (acc) {
                const accLabel = this.createLabel(acc.emoji, 20, 25, 22);
                this.accessoryNode.addChild(accLabel);
            }
        }
    }

    // =================== 底部按钮 ===================
    drawBottomButtons() {
        const btnY = -this.screenHeight/2 + 120;
        const btnW = (this.screenWidth - 60) / 3;
        const btnH = 55;
        
        // 喂食按钮（橙色）
        const feedBtn = this.createColorButton(
            `🍖 喂食\n${this.feedCost} 💰`,
            -btnW - 10, btnY,
            btnW, btnH,
            new Color(245, 166, 35),
            () => this.feedPuppy()
        );
        this.gameContainer?.addChild(feedBtn);
        
        // 玩耍按钮（绿色）
        const playBtn = this.createColorButton(
            '🎾 玩耍',
            0, btnY,
            btnW, btnH,
            new Color(126, 211, 33),
            () => this.playWithPuppy()
        );
        this.gameContainer?.addChild(playBtn);
        
        // 装饰按钮（紫色）
        const decorBtn = this.createColorButton(
            '🎨 装饰',
            btnW + 10, btnY,
            btnW, btnH,
            new Color(186, 104, 200),
            () => this.openDecorationMenu()
        );
        this.gameContainer?.addChild(decorBtn);
    }
    
    createColorButton(text: string, x: number, y: number, w: number, h: number, color: Color, callback: () => void): Node {
        const btn = new Node('ColorButton');
        btn.layer = this.node.layer;
        btn.addComponent(UITransform).setContentSize(w, h);
        
        const gfx = btn.addComponent(Graphics);
        gfx.fillColor = color;
        gfx.roundRect(-w/2, -h/2, w, h, 10);
        gfx.fill();
        
        // 边框
        gfx.strokeColor = new Color(color.r * 0.8, color.g * 0.8, color.b * 0.8);
        gfx.lineWidth = 3;
        gfx.roundRect(-w/2, -h/2, w, h, 10);
        gfx.stroke();
        
        const label = this.createLabel(text, 0, 0, 16);
        btn.addChild(label);
        
        btn.setPosition(x, y, 0);
        
        btn.on(Node.EventType.TOUCH_START, () => {
            tween(btn).to(0.05, { scale: new Vec3(0.95, 0.95, 1) }).start();
        }, this);
        btn.on(Node.EventType.TOUCH_END, () => {
            tween(btn).to(0.1, { scale: new Vec3(1, 1, 1) }).call(callback).start();
        }, this);
        btn.on(Node.EventType.TOUCH_CANCEL, () => {
            tween(btn).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
        }, this);
        
        return btn;
    }

    // =================== 交互逻辑 ===================
    feedPuppy() {
        if (this.coins < this.feedCost) {
            this.showInfo('💰 金币不足！');
            return;
        }
        
        if (this.puppy.hunger >= 100) {
            this.showInfo('🐕 小狗已经吃饱啦！');
            return;
        }
        
        this.coins -= this.feedCost;
        this.puppy.hunger = Math.min(100, this.puppy.hunger + 30);
        this.puppy.exp += 10;
        this.puppy.lastFed = Date.now();
        
        this.checkLevelUp();
        this.updateUI();
        this.saveGame();
        
        this.showInfo(`🍖 小狗开心地吃起来！-${this.feedCost}💰`);
        this.showHearts();
    }

    playWithPuppy() {
        if (this.puppy.mood >= 100) {
            this.showInfo('🐕 小狗已经很开心啦！');
            return;
        }
        
        this.puppy.mood = Math.min(100, this.puppy.mood + 25);
        this.puppy.exp += 5;
        this.puppy.love += 1;
        this.puppy.lastPet = Date.now();
        
        this.checkLevelUp();
        this.updateUI();
        this.saveGame();
        
        this.showInfo('🎾 小狗玩得很开心！');
        this.showHearts();
    }

    petPuppy() {
        this.puppy.mood = Math.min(100, this.puppy.mood + 5);
        this.puppy.love += 0.5;
        this.puppy.exp += 2;
        
        this.checkLevelUp();
        this.updateUI();
        this.saveGame();
        
        this.showInfo('❤️ 小狗摇着尾巴~');
        this.showHearts();
    }
    
    showHearts() {
        if (!this.puppyNode) return;
        
        for (let i = 0; i < 3; i++) {
            const heart = new Node('Heart');
            heart.layer = this.node.layer;
            const label = heart.addComponent(Label);
            label.string = '❤️';
            label.fontSize = 20;
            heart.addComponent(UITransform);
            
            const startX = (Math.random() - 0.5) * 40;
            heart.setPosition(startX, 30, 0);
            this.puppyNode.addChild(heart);
            
            tween(heart)
                .to(0.8, { 
                    position: new Vec3(startX + (Math.random() - 0.5) * 30, 80, 0),
                    scale: new Vec3(0, 0, 1)
                })
                .call(() => heart.destroy())
                .start();
        }
    }

    openDecorationMenu() {
        this.showInfo('🎨 装饰功能开发中...');
    }

    checkLevelUp() {
        while (this.puppy.exp >= this.puppy.expMax) {
            this.puppy.exp -= this.puppy.expMax;
            this.puppy.level += 1;
            this.puppy.expMax = this.puppy.level * 100;
            this.puppy.love += 5;
            this.showInfo(`🎉 小狗升级了！Lv.${this.puppy.level}`);
        }
    }

    // =================== 状态更新 ===================
    updatePuppy(dt: number) {
        // 移动
        if (this.puppy.state === 'walking') {
            const dx = this.puppy.targetX - this.puppy.x;
            const dy = this.puppy.targetY - this.puppy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.02) {
                this.puppy.state = 'idle';
            } else {
                const speed = 0.008;
                this.puppy.x += (dx / dist) * speed;
                this.puppy.y += (dy / dist) * speed;
                this.updatePuppyPosition();
            }
        }
    }

    randomWalk() {
        if (this.puppy.state !== 'idle') return;
        if (Math.random() > 0.4) return;
        
        this.puppy.targetX = 0.3 + Math.random() * 0.4;
        this.puppy.targetY = 0.3 + Math.random() * 0.4;
        this.puppy.state = 'walking';
    }

    decreaseStats() {
        // 随时间降低属性
        this.puppy.hunger = Math.max(0, this.puppy.hunger - 2);
        this.puppy.mood = Math.max(0, this.puppy.mood - 1);
        this.updateUI();
        this.saveGame();
    }

    updateUI() {
        // 更新金币钻石
        if (this.coinsLabel) this.coinsLabel.string = `💰 ${this.coins}`;
        if (this.diamondsLabel) this.diamondsLabel.string = `💎 ${this.diamonds}`;
        if (this.loveLabel) this.loveLabel.string = `❤️ ${Math.floor(this.puppy.love)}`;
        if (this.expLabel) this.expLabel.string = `${this.puppy.exp}/${this.puppy.expMax}`;
        
        // 重绘进度条（简化处理）
    }

    showInfo(text: string) {
        // 创建浮动提示
        const info = new Node('Info');
        info.layer = this.node.layer;
        const gfx = info.addComponent(Graphics);
        info.addComponent(UITransform).setContentSize(this.screenWidth - 100, 40);
        
        gfx.fillColor = new Color(0, 50, 30, 200);
        gfx.roundRect(-(this.screenWidth-100)/2, -20, this.screenWidth - 100, 40, 8);
        gfx.fill();
        
        const label = this.createLabel(text, 0, 0, 16);
        info.addChild(label);
        
        info.setPosition(0, -this.screenHeight/2 + 180, 0);
        info.setScale(new Vec3(0, 0, 1));
        this.gameContainer?.addChild(info);
        
        tween(info)
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .delay(2)
            .to(0.2, { scale: new Vec3(0, 0, 1) })
            .call(() => info.destroy())
            .start();
    }

    // =================== 存档 ===================
    saveGame() {
        try {
            const data = {
                puppy: this.puppy,
                coins: this.coins,
                diamonds: this.diamonds,
                decorations: this.decorations,
                ownedDecorations: this.ownedDecorations,
                ownedAccessories: this.ownedAccessories,
            };
            localStorage.setItem('island_game_save', JSON.stringify(data));
        } catch (e) {
            console.error('保存失败:', e);
        }
    }

    loadGame() {
        try {
            const saved = localStorage.getItem('island_game_save');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.puppy) Object.assign(this.puppy, data.puppy);
                this.coins = data.coins ?? 205;
                this.diamonds = data.diamonds ?? 10;
                this.decorations = data.decorations ?? [];
                this.ownedDecorations = data.ownedDecorations ?? [];
                this.ownedAccessories = data.ownedAccessories ?? ['bow'];
            }
        } catch (e) {
            console.error('加载失败:', e);
        }
    }

    restoreDecorations() {
        this.decorations.forEach(dec => {
            const decNode = this.createLabel(dec.emoji, dec.x, dec.y, 30);
            this.islandContainer?.addChild(decNode);
        });
    }

    // =================== 工具 ===================
    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(200, fontSize + 20);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 5;
        label.color = Color.WHITE;
        node.setPosition(x, y, 0);
        return node;
    }
}
