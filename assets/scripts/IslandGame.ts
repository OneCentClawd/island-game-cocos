import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director } from 'cc';
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
    { id: 'cactus', emoji: '🌵', name: '仙人掌', cost: { coin: 120 }, desc: '耐旱小可爱' },
    { id: 'pond', emoji: '🪷', name: '荷花池', cost: { coin: 500 }, desc: '清凉的池塘' },
    { id: 'fountain', emoji: '⛲', name: '喷泉', cost: { coin: 800 }, desc: '哗啦啦~' },
    { id: 'bench', emoji: '🪑', name: '长椅', cost: { coin: 300 }, desc: '休息一下' },
    { id: 'lamp', emoji: '🏮', name: '灯笼', cost: { coin: 200 }, desc: '夜晚会亮哦' },
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
    { id: 'flower_acc', emoji: '🌺', name: '花朵发饰', cost: { coin: 180 }, desc: '花仙子' },
    { id: 'bell', emoji: '🔔', name: '铃铛项圈', cost: { coin: 150 }, desc: '叮铃铃~' },
    { id: 'heart', emoji: '💝', name: '爱心项链', cost: { diamond: 5 }, desc: '满满的爱' },
];

/**
 * 小狗送礼物（高好感度时随机触发）
 */
const PUPPY_GIFTS = [
    { emoji: '💎', name: '钻石', give: { diamond: 1 }, msg: '小狗挖到了一颗钻石！' },
    { emoji: '💰', name: '金币袋', give: { coin: 50 }, msg: '小狗找到了金币！' },
    { emoji: '⭐', name: '幸运星', give: { coin: 30 }, msg: '小狗捡到了星星！' },
    { emoji: '🍀', name: '四叶草', give: { coin: 20 }, msg: '小狗发现了四叶草！' },
    { emoji: '🦴', name: '骨头', give: { coin: 10 }, msg: '小狗叼来了骨头~' },
];

interface PuppyState {
    x: number;  // 相对位置 0-1
    y: number;
    mood: number;  // 心情 0-100
    hunger: number;  // 饱腹度 0-100
    love: number;  // 好感度
    level: number;
    exp: number;
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

interface Particle {
    node: Node;
    type: string;
    vx: number;
    vy: number;
    life: number;
}

/**
 * 小岛养狗游戏 - 完整版
 */
@ccclass('IslandGame')
export class IslandGame extends Component {
    // 小狗状态
    private puppy: PuppyState = {
        x: 0.5,
        y: 0.5,
        mood: 100,
        hunger: 100,
        love: 0,
        level: 1,
        exp: 0,
        state: 'idle',
        targetX: 0.5,
        targetY: 0.5,
        lastFed: Date.now(),
        lastPet: Date.now(),
        accessory: null,
    };

    // 资源
    private coins: number = 100;
    private diamonds: number = 5;

    // 已放置的装饰
    private decorations: Decoration[] = [];
    private ownedDecorations: string[] = [];
    private ownedAccessories: string[] = [];
    
    // 粒子效果
    private particles: Particle[] = [];

    // UI引用
    private gameContainer: Node | null = null;
    private islandContainer: Node | null = null;
    private puppyNode: Node | null = null;
    private puppyLabel: Label | null = null;
    private accessoryNode: Node | null = null;
    private coinsLabel: Label | null = null;
    private diamondsLabel: Label | null = null;
    private moodBar: Node | null = null;
    private hungerBar: Node | null = null;
    private expBar: Node | null = null;
    private levelLabel: Label | null = null;
    private loveLabel: Label | null = null;
    private infoLabel: Label | null = null;

    // 商店状态
    private showShop: boolean = false;
    private shopContainer: Node | null = null;
    private shopTab: 'decor' | 'accessory' = 'decor';

    // 时间
    private timeOfDay: 'day' | 'evening' | 'night' = 'day';
    private lastGiftTime: number = 0;

    // 小岛区域
    private islandCenterX: number = 0;
    private islandCenterY: number = -50;
    private islandRadius: number = 180;

    start() {
        console.log('🏝️ 小岛养狗 - 完整版');
        this.loadGame();
        this.initGame();
        this.updateTimeOfDay();
        
        // 定时更新
        this.schedule(this.updatePuppy, 0.1);
        this.schedule(this.updateParticles, 0.05);
        this.schedule(this.randomWalk, 3);
        this.schedule(this.checkGift, 10);
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    initGame() {
        this.gameContainer = new Node('GameContainer');
        this.gameContainer.layer = this.node.layer;
        this.gameContainer.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(this.gameContainer);

        // 背景（天空）
        this.drawBackground();

        // 资源栏
        this.drawResourceBar();

        // 小岛
        this.drawIsland();

        // 小狗
        this.drawPuppy();

        // 状态栏
        this.drawStatusBars();

        // 底部按钮
        this.drawBottomButtons();

        // 信息栏
        this.drawInfoBar();

        // 恢复装饰
        this.restoreDecorations();
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

    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);

        // 天空渐变
        let skyColor: Color;
        if (this.timeOfDay === 'day') {
            skyColor = new Color(135, 206, 235);  // 天蓝色
        } else if (this.timeOfDay === 'evening') {
            skyColor = new Color(255, 140, 100);  // 橙红色
        } else {
            skyColor = new Color(25, 25, 112);  // 深蓝色夜空
        }
        
        graphics.fillColor = skyColor;
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();

        // 云朵
        if (this.timeOfDay !== 'night') {
            this.drawClouds(bg);
        } else {
            this.drawStars(bg);
        }

        // 太阳/月亮
        if (this.timeOfDay === 'day') {
            const sun = this.createLabel('☀️', 250, 280, 50);
            bg.addChild(sun);
        } else if (this.timeOfDay === 'night') {
            const moon = this.createLabel('🌙', 250, 280, 50);
            bg.addChild(moon);
        }

        this.gameContainer?.addChild(bg);
    }

    drawClouds(parent: Node) {
        const clouds = ['☁️', '☁️', '☁️'];
        const positions = [[-200, 220], [100, 250], [300, 200]];
        
        clouds.forEach((emoji, i) => {
            const cloud = this.createLabel(emoji, positions[i][0], positions[i][1], 40);
            cloud.getComponent(Label)!.color = new Color(255, 255, 255, 180);
            parent.addChild(cloud);
        });
    }

    drawStars(parent: Node) {
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 700;
            const y = 100 + Math.random() * 250;
            const star = this.createLabel('✨', x, y, 12 + Math.random() * 10);
            parent.addChild(star);
        }
    }

    drawIsland() {
        this.islandContainer = new Node('Island');
        this.islandContainer.layer = this.node.layer;
        this.islandContainer.addComponent(UITransform).setContentSize(400, 400);
        this.islandContainer.setPosition(this.islandCenterX, this.islandCenterY, 0);
        this.gameContainer?.addChild(this.islandContainer);

        // 小岛底座
        const island = new Node('IslandBase');
        island.layer = this.node.layer;
        const graphics = island.addComponent(Graphics);
        island.addComponent(UITransform).setContentSize(400, 300);

        // 草地
        graphics.fillColor = new Color(76, 187, 23);
        graphics.ellipse(0, 0, this.islandRadius, this.islandRadius * 0.6);
        graphics.fill();

        // 沙滩边缘
        graphics.fillColor = new Color(238, 214, 175);
        graphics.ellipse(0, -10, this.islandRadius + 15, this.islandRadius * 0.6 + 10);
        graphics.fill();

        // 重新绘制草地在上层
        graphics.fillColor = new Color(76, 187, 23);
        graphics.ellipse(0, 10, this.islandRadius - 5, this.islandRadius * 0.5);
        graphics.fill();

        this.islandContainer.addChild(island);

        // 固定建筑
        const house = this.createLabel('🏠', 0, 80, 45);
        this.islandContainer.addChild(house);

        const tree1 = this.createLabel('🌴', -120, 30, 35);
        this.islandContainer.addChild(tree1);

        const tree2 = this.createLabel('🌳', 120, 0, 35);
        this.islandContainer.addChild(tree2);
    }

    drawPuppy() {
        this.puppyNode = new Node('Puppy');
        this.puppyNode.layer = this.node.layer;
        this.puppyNode.addComponent(UITransform).setContentSize(80, 80);

        // 小狗本体
        const puppyLabel = this.createLabel('🐕', 0, 0, 50);
        this.puppyLabel = puppyLabel.getComponent(Label);
        this.puppyNode.addChild(puppyLabel);

        // 配饰（如果有）
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
        
        const x = (this.puppy.x - 0.5) * this.islandRadius * 2;
        const y = (this.puppy.y - 0.5) * this.islandRadius;
        this.puppyNode.setPosition(x, y, 0);
    }

    updateAccessoryDisplay() {
        if (!this.accessoryNode) return;
        
        this.accessoryNode.removeAllChildren();
        
        if (this.puppy.accessory) {
            const acc = PUPPY_ACCESSORIES.find(a => a.id === this.puppy.accessory);
            if (acc) {
                const accLabel = this.createLabel(acc.emoji, 15, 20, 20);
                this.accessoryNode.addChild(accLabel);
            }
        }
    }

    drawResourceBar() {
        const bar = new Node('ResourceBar');
        bar.layer = this.node.layer;
        const graphics = bar.addComponent(Graphics);
        bar.addComponent(UITransform).setContentSize(380, 50);
        bar.setPosition(0, 350, 0);

        graphics.fillColor = new Color(0, 0, 0, 150);
        graphics.roundRect(-190, -25, 380, 50, 12);
        graphics.fill();

        this.gameContainer?.addChild(bar);

        // 金币
        const coinsNode = this.createLabel(`💰 ${this.coins}`, -80, 0, 22);
        this.coinsLabel = coinsNode.getComponent(Label);
        bar.addChild(coinsNode);

        // 钻石
        const diamondsNode = this.createLabel(`💎 ${this.diamonds}`, 80, 0, 22);
        this.diamondsLabel = diamondsNode.getComponent(Label);
        bar.addChild(diamondsNode);

        // 返回按钮
        const backBtn = this.createButton('←', -350, 350, 50, 40, () => {
            this.saveGame();
            director.loadScene('MainMenu');
        });
        this.gameContainer?.addChild(backBtn);
    }

    drawStatusBars() {
        const statusContainer = new Node('StatusContainer');
        statusContainer.layer = this.node.layer;
        statusContainer.addComponent(UITransform).setContentSize(300, 100);
        statusContainer.setPosition(0, 280, 0);
        this.gameContainer?.addChild(statusContainer);

        // 等级和好感度
        const levelNode = this.createLabel(`Lv.${this.puppy.level}`, -100, 30, 18);
        this.levelLabel = levelNode.getComponent(Label);
        statusContainer.addChild(levelNode);

        const loveNode = this.createLabel(`💕 ${Math.floor(this.puppy.love)}`, 0, 30, 18);
        this.loveLabel = loveNode.getComponent(Label);
        statusContainer.addChild(loveNode);

        // 心情条
        this.moodBar = this.createStatusBar('😊', this.puppy.mood, new Color(255, 183, 197), -50, 0);
        statusContainer.addChild(this.moodBar);

        // 饱腹度条
        this.hungerBar = this.createStatusBar('🍖', this.puppy.hunger, new Color(255, 200, 100), -50, -25);
        statusContainer.addChild(this.hungerBar);

        // 经验条
        const expNeeded = this.puppy.level * 100;
        const expPercent = (this.puppy.exp / expNeeded) * 100;
        this.expBar = this.createStatusBar('⭐', expPercent, new Color(150, 220, 255), -50, -50);
        statusContainer.addChild(this.expBar);
    }

    createStatusBar(icon: string, value: number, color: Color, x: number, y: number): Node {
        const container = new Node('StatusBar');
        container.layer = this.node.layer;
        container.addComponent(UITransform).setContentSize(200, 20);
        container.setPosition(x, y, 0);

        // 图标
        const iconLabel = this.createLabel(icon, -80, 0, 16);
        container.addChild(iconLabel);

        // 背景条
        const bg = new Node('BarBg');
        bg.layer = this.node.layer;
        const bgGraphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(120, 14);
        bg.setPosition(20, 0, 0);
        bgGraphics.fillColor = new Color(50, 50, 50, 200);
        bgGraphics.roundRect(-60, -7, 120, 14, 5);
        bgGraphics.fill();
        container.addChild(bg);

        // 填充条
        const fill = new Node('BarFill');
        fill.layer = this.node.layer;
        const fillGraphics = fill.addComponent(Graphics);
        fill.addComponent(UITransform).setContentSize(120, 14);
        fill.setPosition(20, 0, 0);
        
        const width = Math.max(0, Math.min(116, (value / 100) * 116));
        fillGraphics.fillColor = color;
        fillGraphics.roundRect(-58, -5, width, 10, 4);
        fillGraphics.fill();
        container.addChild(fill);

        return container;
    }

    drawBottomButtons() {
        const btnY = -320;
        const btnSpacing = 90;

        // 喂食
        const feedBtn = this.createButton('🍖 喂食', -btnSpacing * 1.5, btnY, 80, 50, () => {
            this.feedPuppy();
        });
        this.gameContainer?.addChild(feedBtn);

        // 玩耍
        const playBtn = this.createButton('🎾 玩耍', -btnSpacing * 0.5, btnY, 80, 50, () => {
            this.playWithPuppy();
        });
        this.gameContainer?.addChild(playBtn);

        // 商店
        const shopBtn = this.createButton('🛒 商店', btnSpacing * 0.5, btnY, 80, 50, () => {
            this.openShop();
        });
        this.gameContainer?.addChild(shopBtn);

        // 配饰
        const accBtn = this.createButton('👗 配饰', btnSpacing * 1.5, btnY, 80, 50, () => {
            this.openAccessoryMenu();
        });
        this.gameContainer?.addChild(accBtn);
    }

    drawInfoBar() {
        const infoNode = this.createLabel('', 0, -250, 16);
        this.infoLabel = infoNode.getComponent(Label);
        this.gameContainer?.addChild(infoNode);
    }

    showInfo(text: string) {
        if (this.infoLabel) {
            this.infoLabel.string = text;
            // 3秒后清除
            this.scheduleOnce(() => {
                if (this.infoLabel) this.infoLabel.string = '';
            }, 3);
        }
    }

    // =================== 小狗逻辑 ===================

    updatePuppy() {
        const now = Date.now();

        // 饱腹度随时间下降
        const timeSinceFed = (now - this.puppy.lastFed) / 60000;
        this.puppy.hunger = Math.max(0, 100 - timeSinceFed * 0.5);

        // 心情受饱腹度影响
        if (this.puppy.hunger < 30) {
            this.puppy.mood = Math.max(0, this.puppy.mood - 0.05);
        } else if (this.puppy.hunger > 70) {
            this.puppy.mood = Math.min(100, this.puppy.mood + 0.01);
        }

        // 移动
        if (this.puppy.state === 'walking') {
            const dx = this.puppy.targetX - this.puppy.x;
            const dy = this.puppy.targetY - this.puppy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0.01) {
                const speed = 0.003;
                this.puppy.x += (dx / dist) * speed;
                this.puppy.y += (dy / dist) * speed;
                this.updatePuppyPosition();
            } else {
                this.puppy.state = 'idle';
            }
        }

        // 夜间睡觉
        if (this.timeOfDay === 'night' && this.puppy.state === 'idle' && Math.random() < 0.001) {
            this.puppy.state = 'sleeping';
            this.updatePuppyEmoji();
        }
        if (this.timeOfDay === 'day' && this.puppy.state === 'sleeping' && Math.random() < 0.002) {
            this.puppy.state = 'idle';
            this.updatePuppyEmoji();
        }

        // 经验升级
        const expNeeded = this.puppy.level * 100;
        if (this.puppy.exp >= expNeeded) {
            this.puppy.exp -= expNeeded;
            this.puppy.level++;
            this.showInfo(`🎉 小狗升到 ${this.puppy.level} 级啦！`);
            this.createCelebration();
        }

        // 更新UI
        this.updateStatusUI();
    }

    randomWalk() {
        if (this.puppy.state === 'idle' && Math.random() < 0.5) {
            this.puppy.targetX = 0.3 + Math.random() * 0.4;
            this.puppy.targetY = 0.35 + Math.random() * 0.3;
            this.puppy.state = 'walking';
        }
    }

    checkGift() {
        const now = Date.now();
        
        // 好感度>=50时，每10分钟有机会送礼
        if (this.puppy.love >= 50 && now - this.lastGiftTime > 600000) {
            const giftChance = Math.min(0.1, (this.puppy.love - 50) / 500);
            if (Math.random() < giftChance) {
                this.triggerGift();
            }
        }
    }

    triggerGift() {
        const gift = PUPPY_GIFTS[Math.floor(Math.random() * PUPPY_GIFTS.length)];
        
        if (gift.give.coin) this.coins += gift.give.coin;
        if (gift.give.diamond) this.diamonds += gift.give.diamond;
        
        this.lastGiftTime = Date.now();
        this.updateResourceUI();
        this.saveGame();
        
        this.showInfo(`🐕 ${gift.msg}`);
        this.createCelebration();
        this.spawnParticle(gift.emoji, this.puppy.x, this.puppy.y - 0.1, 0, -0.05, 2);
    }

    updatePuppyEmoji() {
        if (!this.puppyLabel) return;
        
        if (this.puppy.state === 'sleeping') {
            this.puppyLabel.string = '😴';
        } else if (this.puppy.hunger < 20) {
            this.puppyLabel.string = '🥺';
        } else if (this.puppy.mood < 30) {
            this.puppyLabel.string = '😢';
        } else if (this.puppy.state === 'happy') {
            this.puppyLabel.string = '🐕';
        } else {
            this.puppyLabel.string = '🐕';
        }
    }

    updateStatusUI() {
        if (this.levelLabel) this.levelLabel.string = `Lv.${this.puppy.level}`;
        if (this.loveLabel) this.loveLabel.string = `💕 ${Math.floor(this.puppy.love)}`;
        
        // 更新进度条（简化处理，实际应重绘）
        this.updateResourceUI();
    }

    updateResourceUI() {
        if (this.coinsLabel) this.coinsLabel.string = `💰 ${this.coins}`;
        if (this.diamondsLabel) this.diamondsLabel.string = `💎 ${this.diamonds}`;
    }

    // =================== 互动 ===================

    feedPuppy() {
        if (this.coins < 10) {
            this.showInfo('💰 金币不足，需要10金币');
            return;
        }

        this.coins -= 10;
        this.puppy.hunger = Math.min(100, this.puppy.hunger + 30);
        this.puppy.mood = Math.min(100, this.puppy.mood + 10);
        this.puppy.love += 0.3;
        this.puppy.exp += 5;
        this.puppy.lastFed = Date.now();
        this.puppy.state = 'eating';

        this.updatePuppyEmoji();
        this.showInfo('🍖 喂食成功！小狗很开心~ +5经验');
        this.spawnParticle('🍖', 0.9, 0.9, -0.05, -0.03, 0.5);

        this.scheduleOnce(() => {
            this.puppy.state = 'happy';
            this.updatePuppyEmoji();
            this.scheduleOnce(() => {
                this.puppy.state = 'idle';
                this.updatePuppyEmoji();
            }, 1);
        }, 1.5);

        this.updateResourceUI();
        this.saveGame();
    }

    petPuppy() {
        this.puppy.mood = Math.min(100, this.puppy.mood + 5);
        this.puppy.love += 0.1;
        this.puppy.exp += 2;
        this.puppy.lastPet = Date.now();
        this.puppy.state = 'happy';

        // 爱心粒子
        for (let i = 0; i < 5; i++) {
            const emoji = ['💕', '❤️', '💖'][Math.floor(Math.random() * 3)];
            this.spawnParticle(emoji, 
                this.puppy.x + (Math.random() - 0.5) * 0.1,
                this.puppy.y - 0.05,
                (Math.random() - 0.5) * 0.05,
                -0.05 - Math.random() * 0.03,
                1.5
            );
        }

        this.updatePuppyEmoji();
        this.showInfo('💕 摸摸小狗~ +2经验');
        
        this.scheduleOnce(() => {
            this.puppy.state = 'idle';
            this.updatePuppyEmoji();
        }, 1.5);

        this.saveGame();
    }

    playWithPuppy() {
        if (this.puppy.hunger < 20) {
            this.showInfo('🐕 小狗太饿了，先喂食吧~');
            return;
        }

        this.puppy.mood = Math.min(100, this.puppy.mood + 15);
        this.puppy.hunger = Math.max(0, this.puppy.hunger - 10);
        this.puppy.love += 0.5;
        this.puppy.exp += 10;
        this.puppy.state = 'playing';

        // 玩耍动画 - 小狗跑来跑去
        let count = 0;
        this.schedule(() => {
            this.puppy.targetX = 0.2 + Math.random() * 0.6;
            this.puppy.targetY = 0.35 + Math.random() * 0.35;
            this.puppy.state = 'walking';
            count++;
            if (count >= 4) {
                this.unschedule(arguments.callee as any);
                this.puppy.state = 'happy';
                this.updatePuppyEmoji();
                this.scheduleOnce(() => {
                    this.puppy.state = 'idle';
                    this.updatePuppyEmoji();
                }, 1);
            }
        }, 0.8, 3);

        this.showInfo('🎾 和小狗玩耍！+10经验');
        this.saveGame();
    }

    // =================== 商店 ===================

    openShop() {
        if (this.showShop) return;
        this.showShop = true;
        this.shopTab = 'decor';
        this.drawShopUI();
    }

    openAccessoryMenu() {
        if (this.showShop) return;
        this.showShop = true;
        this.shopTab = 'accessory';
        this.drawShopUI();
    }

    drawShopUI() {
        this.shopContainer = new Node('ShopContainer');
        this.shopContainer.layer = this.node.layer;
        this.shopContainer.addComponent(UITransform).setContentSize(700, 600);
        this.gameContainer?.addChild(this.shopContainer);

        // 背景
        const bg = new Node('ShopBg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(700, 600);
        graphics.fillColor = new Color(0, 0, 0, 220);
        graphics.roundRect(-350, -300, 700, 600, 20);
        graphics.fill();
        this.shopContainer.addChild(bg);

        // 标题
        const title = this.createLabel(this.shopTab === 'decor' ? '🛒 装饰商店' : '👗 配饰商店', 0, 250, 28);
        this.shopContainer.addChild(title);

        // 物品列表
        const items = this.shopTab === 'decor' ? ISLAND_DECORATIONS : PUPPY_ACCESSORIES;
        const cols = 3;
        const itemWidth = 180;
        const itemHeight = 100;
        const startY = 150;

        items.forEach((item, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = (col - 1) * itemWidth;
            const y = startY - row * itemHeight;

            const owned = this.shopTab === 'decor' 
                ? this.ownedDecorations.includes(item.id)
                : this.ownedAccessories.includes(item.id);

            const itemNode = this.createShopItem(item, x, y, owned);
            this.shopContainer?.addChild(itemNode);
        });

        // 关闭按钮
        const closeBtn = this.createButton('✕', 300, 250, 50, 50, () => {
            this.closeShop();
        });
        this.shopContainer.addChild(closeBtn);
    }

    createShopItem(item: any, x: number, y: number, owned: boolean): Node {
        const node = new Node('ShopItem');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(160, 90);

        const graphics = node.addComponent(Graphics);
        graphics.fillColor = owned ? new Color(100, 150, 100, 200) : new Color(60, 60, 80, 200);
        graphics.roundRect(-80, -45, 160, 90, 10);
        graphics.fill();

        // emoji
        const emoji = this.createLabel(item.emoji, 0, 20, 30);
        node.addChild(emoji);

        // 名称
        const name = this.createLabel(item.name, 0, -10, 14);
        node.addChild(name);

        // 价格或已拥有
        let priceText: string;
        if (owned) {
            priceText = '✓ 已拥有';
        } else {
            priceText = item.cost.diamond ? `💎${item.cost.diamond}` : `💰${item.cost.coin}`;
        }
        const price = this.createLabel(priceText, 0, -30, 12);
        price.getComponent(Label)!.color = owned ? new Color(150, 255, 150) : new Color(255, 230, 109);
        node.addChild(price);

        node.setPosition(x, y, 0);

        // 购买
        if (!owned) {
            node.on(Node.EventType.TOUCH_END, () => {
                this.buyItem(item);
            }, this);
        } else if (this.shopTab === 'accessory') {
            // 已拥有的配饰可以装备/卸下
            node.on(Node.EventType.TOUCH_END, () => {
                this.equipAccessory(item.id);
            }, this);
        }

        return node;
    }

    buyItem(item: any) {
        const cost = item.cost;
        
        if (cost.coin && this.coins < cost.coin) {
            this.showInfo('💰 金币不足！');
            return;
        }
        if (cost.diamond && this.diamonds < cost.diamond) {
            this.showInfo('💎 钻石不足！');
            return;
        }

        // 扣除资源
        if (cost.coin) this.coins -= cost.coin;
        if (cost.diamond) this.diamonds -= cost.diamond;

        if (this.shopTab === 'decor') {
            this.ownedDecorations.push(item.id);
            // 放置装饰（随机位置）
            const x = 0.3 + Math.random() * 0.4;
            const y = 0.3 + Math.random() * 0.4;
            this.placeDecoration(item, x, y);
            this.showInfo(`✅ 购买成功！${item.emoji} 已放置`);
        } else {
            this.ownedAccessories.push(item.id);
            this.puppy.accessory = item.id;
            this.updateAccessoryDisplay();
            this.showInfo(`✅ 购买成功！小狗戴上了 ${item.emoji}`);
        }

        this.updateResourceUI();
        this.closeShop();
        this.saveGame();
    }

    equipAccessory(accId: string) {
        if (this.puppy.accessory === accId) {
            this.puppy.accessory = null;
            this.showInfo('🐕 小狗脱下了配饰');
        } else {
            this.puppy.accessory = accId;
            const acc = PUPPY_ACCESSORIES.find(a => a.id === accId);
            this.showInfo(`🐕 小狗戴上了 ${acc?.emoji || ''}${acc?.name || ''}`);
        }
        this.updateAccessoryDisplay();
        this.closeShop();
        this.saveGame();
    }

    placeDecoration(item: any, x: number, y: number) {
        const decoration: Decoration = {
            id: item.id + '_' + Date.now(),
            type: item.id,
            emoji: item.emoji,
            x,
            y,
        };
        this.decorations.push(decoration);
        this.drawDecoration(decoration);
    }

    drawDecoration(decoration: Decoration) {
        if (!this.islandContainer) return;

        const x = (decoration.x - 0.5) * this.islandRadius * 2;
        const y = (decoration.y - 0.5) * this.islandRadius - 20;
        
        const node = this.createLabel(decoration.emoji, x, y, 28);
        node.name = decoration.id;
        this.islandContainer.addChild(node);
    }

    restoreDecorations() {
        for (const decoration of this.decorations) {
            this.drawDecoration(decoration);
        }
    }

    closeShop() {
        this.showShop = false;
        this.shopContainer?.destroy();
        this.shopContainer = null;
    }

    // =================== 粒子效果 ===================

    spawnParticle(emoji: string, x: number, y: number, vx: number, vy: number, life: number) {
        const node = new Node('Particle');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(30, 30);
        
        const label = node.addComponent(Label);
        label.string = emoji;
        label.fontSize = 24;

        const posX = (x - 0.5) * this.islandRadius * 2 + this.islandCenterX;
        const posY = (y - 0.5) * this.islandRadius + this.islandCenterY;
        node.setPosition(posX, posY, 0);

        this.gameContainer?.addChild(node);
        this.particles.push({ node, type: 'float', vx, vy, life });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= 0.05;
            
            if (p.life <= 0) {
                p.node.destroy();
                this.particles.splice(i, 1);
                continue;
            }

            const pos = p.node.position;
            p.node.setPosition(pos.x + p.vx * 50, pos.y + p.vy * 50, 0);
            p.node.setScale(new Vec3(p.life, p.life, 1));
        }
    }

    createCelebration() {
        for (let i = 0; i < 8; i++) {
            const emoji = ['🎉', '⭐', '💕', '✨'][Math.floor(Math.random() * 4)];
            this.spawnParticle(
                emoji,
                0.5 + (Math.random() - 0.5) * 0.3,
                0.5,
                (Math.random() - 0.5) * 0.15,
                -0.08 - Math.random() * 0.05,
                2
            );
        }
    }

    // =================== 存档 ===================

    saveGame() {
        try {
            if (typeof localStorage === 'undefined') return;
            
            localStorage.setItem('island_coins', this.coins.toString());
            localStorage.setItem('island_diamonds', this.diamonds.toString());
            localStorage.setItem('island_puppy', JSON.stringify(this.puppy));
            localStorage.setItem('island_decorations', JSON.stringify(this.decorations));
            localStorage.setItem('island_owned_decor', JSON.stringify(this.ownedDecorations));
            localStorage.setItem('island_owned_acc', JSON.stringify(this.ownedAccessories));
            localStorage.setItem('island_last_gift', this.lastGiftTime.toString());
        } catch (e) {
            console.log('保存失败');
        }
    }

    loadGame() {
        try {
            if (typeof localStorage === 'undefined') return;
            
            this.coins = parseInt(localStorage.getItem('island_coins') || '100');
            this.diamonds = parseInt(localStorage.getItem('island_diamonds') || '5');
            
            const puppyJson = localStorage.getItem('island_puppy');
            if (puppyJson) {
                this.puppy = { ...this.puppy, ...JSON.parse(puppyJson) };
            }
            
            const decorJson = localStorage.getItem('island_decorations');
            if (decorJson) {
                this.decorations = JSON.parse(decorJson);
            }
            
            const ownedDecorJson = localStorage.getItem('island_owned_decor');
            if (ownedDecorJson) {
                this.ownedDecorations = JSON.parse(ownedDecorJson);
            }
            
            const ownedAccJson = localStorage.getItem('island_owned_acc');
            if (ownedAccJson) {
                this.ownedAccessories = JSON.parse(ownedAccJson);
            }
            
            this.lastGiftTime = parseInt(localStorage.getItem('island_last_gift') || '0');
        } catch (e) {
            console.log('加载存档失败');
        }
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

        const labelNode = this.createLabel(text, 0, 0, 16);
        labelNode.getComponent(Label)!.color = new Color(44, 62, 80);
        node.addChild(labelNode);

        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }
}
