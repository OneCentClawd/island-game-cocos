import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 小狗状态
 */
interface PuppyState {
    hunger: number;      // 饱腹度 0-100
    mood: number;        // 心情 0-100
    love: number;        // 好感度
    exp: number;         // 经验
    level: number;       // 等级
    state: 'idle' | 'eating' | 'happy' | 'sleeping' | 'walking';
    x: number;
    y: number;
    targetX: number;
    targetY: number;
}

/**
 * 建筑配置
 */
const BUILDINGS = [
    { id: 'house', emoji: '🏠', name: '小屋', cost: 100 },
    { id: 'tree', emoji: '🌳', name: '大树', cost: 50 },
    { id: 'flower', emoji: '🌸', name: '花丛', cost: 30 },
    { id: 'pond', emoji: '💧', name: '小池塘', cost: 150 },
    { id: 'swing', emoji: '🎠', name: '秋千', cost: 200 },
];

const DECORATIONS = [
    { id: 'palm', emoji: '🌴', name: '椰子树' },
    { id: 'bush', emoji: '🌲', name: '灌木' },
    { id: 'rock', emoji: '🪨', name: '石头' },
];

/**
 * 小岛养狗游戏
 */
@ccclass('IslandGame')
export class IslandGame extends Component {
    // 游戏状态
    private coins: number = 100;
    private diamonds: number = 5;
    private puppy: PuppyState = {
        hunger: 80,
        mood: 80,
        love: 0,
        exp: 0,
        level: 1,
        state: 'idle',
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
    };
    private buildings: {id: string, x: number, y: number}[] = [];
    private decorations: {id: string, x: number, y: number}[] = [];
    private timeOfDay: 'day' | 'evening' | 'night' = 'day';

    // UI引用
    private menuContainer: Node | null = null;
    private gameContainer: Node | null = null;
    private islandContainer: Node | null = null;
    private puppyNode: Node | null = null;
    private hungerBar: Node | null = null;
    private moodBar: Node | null = null;
    private coinsLabel: Label | null = null;
    private loveLabel: Label | null = null;

    private gameState: 'menu' | 'island' | 'shop' = 'menu';
    private updateTimer: number = 0;

    start() {
        console.log('🏝️ 小岛物语 start');
        this.loadGame();
        this.showMainMenu();
    }

    update(dt: number) {
        if (this.gameState !== 'island') return;

        this.updateTimer += dt;
        
        // 每秒更新一次
        if (this.updateTimer >= 1) {
            this.updateTimer = 0;
            this.updatePuppy(1);
            this.updateTimeOfDay();
        }

        // 更新小狗动画
        this.updatePuppyAnimation(dt);
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
        const title = this.createLabel('🏝️ 我的小岛', 0, 150, 50);
        this.menuContainer.addChild(title);

        const subtitle = this.createLabel('养一只可爱的小狗吧！', 0, 80, 22);
        this.menuContainer.addChild(subtitle);

        // 开始按钮
        const startBtn = this.createButton('进入小岛', 0, 0, 200, 60, () => {
            this.showIsland();
        });
        this.menuContainer.addChild(startBtn);

        // 显示小狗状态
        const puppyInfo = this.createLabel(`🐕 Lv.${this.puppy.level}  ❤️ ${Math.floor(this.puppy.love)}`, 0, -80, 20);
        this.menuContainer.addChild(puppyInfo);
    }

    // =================== 小岛场景 ===================
    showIsland() {
        this.clearAll();
        this.gameState = 'island';

        this.gameContainer = new Node('GameContainer');
        this.gameContainer.layer = this.node.layer;
        this.gameContainer.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(this.gameContainer);

        // 绘制小岛背景
        this.drawIslandBackground();

        // 创建小岛内容区
        this.islandContainer = new Node('IslandContainer');
        this.islandContainer.layer = this.node.layer;
        this.islandContainer.addComponent(UITransform).setContentSize(500, 400);
        this.islandContainer.setPosition(0, 0, 0);
        this.gameContainer.addChild(this.islandContainer);

        // 绘制草地
        this.drawGrass();

        // 绘制建筑和装饰
        this.drawBuildings();
        this.drawDecorations();

        // 绘制小狗
        this.drawPuppy();

        // 顶部状态栏
        this.drawStatusBar();

        // 底部按钮
        this.drawBottomButtons();

        // 返回按钮
        const backBtn = this.createButton('返回', -280, 330, 80, 40, () => {
            this.saveGame();
            director.loadScene('MainMenu');
        });
        this.gameContainer.addChild(backBtn);
    }

    drawIslandBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);
        
        // 天空
        let skyColor1: Color, skyColor2: Color, seaColor: Color;
        if (this.timeOfDay === 'day') {
            skyColor1 = new Color(135, 206, 235);
            skyColor2 = new Color(79, 195, 247);
            seaColor = new Color(30, 144, 255);
        } else if (this.timeOfDay === 'evening') {
            skyColor1 = new Color(255, 112, 67);
            skyColor2 = new Color(255, 183, 77);
            seaColor = new Color(61, 90, 254);
        } else {
            skyColor1 = new Color(26, 35, 126);
            skyColor2 = new Color(49, 27, 146);
            seaColor = new Color(13, 71, 161);
        }
        
        // 绘制天空
        graphics.fillColor = skyColor1;
        graphics.rect(-400, 0, 800, 400);
        graphics.fill();
        
        // 绘制海洋
        graphics.fillColor = seaColor;
        graphics.rect(-400, -400, 800, 400);
        graphics.fill();
        
        this.gameContainer?.addChild(bg);

        // 太阳/月亮
        const celestial = new Node('Celestial');
        celestial.layer = this.node.layer;
        celestial.addComponent(UITransform).setContentSize(60, 60);
        const celestialLabel = celestial.addComponent(Label);
        celestialLabel.string = this.timeOfDay === 'night' ? '🌙' : (this.timeOfDay === 'evening' ? '🌅' : '🔆');
        celestialLabel.fontSize = 50;
        celestial.setPosition(280, 280, 0);
        this.gameContainer?.addChild(celestial);
    }

    drawGrass() {
        const grass = new Node('Grass');
        grass.layer = this.node.layer;
        const graphics = grass.addComponent(Graphics);
        grass.addComponent(UITransform).setContentSize(400, 300);
        
        // 沙滩
        graphics.fillColor = new Color(244, 164, 96);
        graphics.ellipse(0, 0, 200, 150);
        graphics.fill();
        
        // 草地
        graphics.fillColor = new Color(124, 179, 66);
        graphics.ellipse(0, 0, 170, 120);
        graphics.fill();
        
        this.islandContainer?.addChild(grass);
    }

    drawBuildings() {
        for (const b of this.buildings) {
            const config = BUILDINGS.find(c => c.id === b.id);
            if (!config) continue;

            const node = new Node(`Building_${b.id}`);
            node.layer = this.node.layer;
            node.addComponent(UITransform).setContentSize(50, 50);
            const label = node.addComponent(Label);
            label.string = config.emoji;
            label.fontSize = 40;
            node.setPosition(b.x, b.y, 0);
            this.islandContainer?.addChild(node);
        }
    }

    drawDecorations() {
        // 默认装饰
        const defaultDecos = [
            { emoji: '🌴', x: -100, y: 30 },
            { emoji: '🌲', x: 100, y: -20 },
        ];

        for (const d of defaultDecos) {
            const node = new Node('Deco');
            node.layer = this.node.layer;
            node.addComponent(UITransform).setContentSize(40, 40);
            const label = node.addComponent(Label);
            label.string = d.emoji;
            label.fontSize = 35;
            node.setPosition(d.x, d.y, 0);
            this.islandContainer?.addChild(node);
        }
    }

    drawPuppy() {
        this.puppyNode = new Node('Puppy');
        this.puppyNode.layer = this.node.layer;
        this.puppyNode.addComponent(UITransform).setContentSize(60, 60);
        const label = this.puppyNode.addComponent(Label);
        label.string = this.getPuppyEmoji();
        label.fontSize = 50;
        this.puppyNode.setPosition(this.puppy.x, this.puppy.y, 0);
        this.islandContainer?.addChild(this.puppyNode);

        // 点击小狗
        this.puppyNode.on(Node.EventType.TOUCH_END, () => {
            this.petPuppy();
        }, this);
    }

    getPuppyEmoji(): string {
        if (this.puppy.state === 'sleeping') return '😴';
        if (this.puppy.state === 'eating') return '🐕';
        if (this.puppy.state === 'happy') return '🐶';
        if (this.puppy.hunger < 30) return '😢';
        return '🐕';
    }

    drawStatusBar() {
        const statusBar = new Node('StatusBar');
        statusBar.layer = this.node.layer;
        const graphics = statusBar.addComponent(Graphics);
        statusBar.addComponent(UITransform).setContentSize(350, 100);
        statusBar.setPosition(0, 280, 0);
        
        // 背景
        graphics.fillColor = new Color(0, 0, 0, 150);
        graphics.roundRect(-175, -50, 350, 100, 12);
        graphics.fill();
        
        this.gameContainer?.addChild(statusBar);

        // 小狗等级
        const levelLabel = this.createLabel(`🐕 Lv.${this.puppy.level}`, -120, 25, 16);
        statusBar.addChild(levelLabel);

        // 好感度
        const loveNode = this.createLabel(`❤️ ${Math.floor(this.puppy.love)}`, 80, 25, 16);
        this.loveLabel = loveNode.getComponent(Label);
        statusBar.addChild(loveNode);

        // 饱腹度条
        this.hungerBar = this.createProgressBar(-100, -5, 200, 12, this.puppy.hunger / 100, new Color(76, 175, 80));
        statusBar.addChild(this.hungerBar);
        const hungerIcon = this.createLabel('🍖', -130, -5, 16);
        statusBar.addChild(hungerIcon);

        // 心情条
        this.moodBar = this.createProgressBar(-100, -30, 200, 12, this.puppy.mood / 100, new Color(33, 150, 243));
        statusBar.addChild(this.moodBar);
        const moodIcon = this.createLabel('😊', -130, -30, 16);
        statusBar.addChild(moodIcon);

        // 金币
        const coinsNode = this.createLabel(`💰 ${this.coins}`, -120, 230, 18);
        this.coinsLabel = coinsNode.getComponent(Label);
        this.gameContainer?.addChild(coinsNode);

        // 钻石
        const diamondsLabel = this.createLabel(`💎 ${this.diamonds}`, 50, 230, 18);
        this.gameContainer?.addChild(diamondsLabel);
    }

    createProgressBar(x: number, y: number, width: number, height: number, progress: number, color: Color): Node {
        const node = new Node('ProgressBar');
        node.layer = this.node.layer;
        const graphics = node.addComponent(Graphics);
        node.addComponent(UITransform).setContentSize(width, height);
        
        // 背景
        graphics.fillColor = new Color(255, 255, 255, 80);
        graphics.roundRect(0, -height/2, width, height, height/2);
        graphics.fill();
        
        // 填充
        graphics.fillColor = color;
        graphics.roundRect(0, -height/2, width * Math.max(0, Math.min(1, progress)), height, height/2);
        graphics.fill();
        
        node.setPosition(x, y, 0);
        return node;
    }

    drawBottomButtons() {
        const btnY = -280;
        const btnWidth = 100;
        const btnHeight = 50;
        const spacing = 120;

        // 喂食按钮
        const feedBtn = this.createButton('🍖 喂食\n10💰', -spacing, btnY, btnWidth, btnHeight, () => {
            this.feedPuppy();
        });
        this.gameContainer?.addChild(feedBtn);

        // 玩耍按钮
        const playBtn = this.createButton('🎾 玩耍', 0, btnY, btnWidth, btnHeight, () => {
            this.playWithPuppy();
        });
        this.gameContainer?.addChild(playBtn);

        // 商店按钮
        const shopBtn = this.createButton('🏪 商店', spacing, btnY, btnWidth, btnHeight, () => {
            this.showShop();
        });
        this.gameContainer?.addChild(shopBtn);
    }

    // =================== 小狗互动 ===================
    feedPuppy() {
        if (this.coins < 10) return;
        
        this.coins -= 10;
        this.puppy.hunger = Math.min(100, this.puppy.hunger + 30);
        this.puppy.mood = Math.min(100, this.puppy.mood + 10);
        this.puppy.love += 0.3;
        this.puppy.exp += 5;
        this.puppy.state = 'eating';

        this.checkLevelUp();
        this.updateStatusUI();
        this.updatePuppyEmoji();

        setTimeout(() => {
            this.puppy.state = 'happy';
            this.updatePuppyEmoji();
            setTimeout(() => {
                this.puppy.state = 'idle';
                this.updatePuppyEmoji();
            }, 1000);
        }, 1500);

        this.saveGame();
    }

    petPuppy() {
        this.puppy.mood = Math.min(100, this.puppy.mood + 5);
        this.puppy.love += 0.1;
        this.puppy.exp += 2;
        this.puppy.state = 'happy';

        this.checkLevelUp();
        this.updateStatusUI();
        this.updatePuppyEmoji();

        // 爱心效果
        if (this.puppyNode) {
            tween(this.puppyNode)
                .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
        }

        setTimeout(() => {
            this.puppy.state = 'idle';
            this.updatePuppyEmoji();
        }, 1000);

        this.saveGame();
    }

    playWithPuppy() {
        if (this.puppy.hunger < 20) return;

        this.puppy.mood = Math.min(100, this.puppy.mood + 15);
        this.puppy.hunger = Math.max(0, this.puppy.hunger - 10);
        this.puppy.love += 0.5;
        this.puppy.exp += 10;
        this.puppy.state = 'walking';

        // 让小狗跑动
        this.puppy.targetX = (Math.random() - 0.5) * 200;
        this.puppy.targetY = (Math.random() - 0.5) * 150;

        this.checkLevelUp();
        this.updateStatusUI();
        this.updatePuppyEmoji();

        setTimeout(() => {
            this.puppy.state = 'happy';
            this.updatePuppyEmoji();
            setTimeout(() => {
                this.puppy.state = 'idle';
                this.updatePuppyEmoji();
            }, 1000);
        }, 2000);

        this.saveGame();
    }

    updatePuppy(dt: number) {
        // 饱腹度下降
        this.puppy.hunger = Math.max(0, this.puppy.hunger - 0.05 * dt);
        // 心情下降
        this.puppy.mood = Math.max(0, this.puppy.mood - 0.03 * dt);

        // 如果太饿，心情下降更快
        if (this.puppy.hunger < 20) {
            this.puppy.mood = Math.max(0, this.puppy.mood - 0.1 * dt);
        }

        this.updateStatusUI();
    }

    updatePuppyAnimation(dt: number) {
        if (!this.puppyNode) return;

        if (this.puppy.state === 'walking') {
            // 移动向目标
            const dx = this.puppy.targetX - this.puppy.x;
            const dy = this.puppy.targetY - this.puppy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 5) {
                this.puppy.x += (dx / dist) * 100 * dt;
                this.puppy.y += (dy / dist) * 100 * dt;
                this.puppyNode.setPosition(this.puppy.x, this.puppy.y, 0);
            }
        }
    }

    updatePuppyEmoji() {
        if (!this.puppyNode) return;
        const label = this.puppyNode.getComponent(Label);
        if (label) {
            label.string = this.getPuppyEmoji();
        }
    }

    updateStatusUI() {
        if (this.coinsLabel) this.coinsLabel.string = `💰 ${this.coins}`;
        if (this.loveLabel) this.loveLabel.string = `❤️ ${Math.floor(this.puppy.love)}`;

        // 更新进度条（简单重建）
        // 实际项目中应该只更新填充部分
    }

    checkLevelUp() {
        const expNeeded = this.puppy.level * 100;
        if (this.puppy.exp >= expNeeded) {
            this.puppy.exp -= expNeeded;
            this.puppy.level++;
            console.log(`🎉 小狗升级了！Lv.${this.puppy.level}`);
        }
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

    // =================== 商店 ===================
    showShop() {
        // 简单弹窗
        const overlay = new Node('ShopOverlay');
        overlay.layer = this.node.layer;
        overlay.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(overlay);

        const bg = new Node('Bg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);
        graphics.fillColor = new Color(0, 0, 0, 200);
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();
        overlay.addChild(bg);

        const title = this.createLabel('🏪 商店', 0, 200, 40);
        overlay.addChild(title);

        // 建筑列表
        BUILDINGS.forEach((b, i) => {
            const y = 100 - i * 60;
            const itemLabel = this.createLabel(`${b.emoji} ${b.name} - ${b.cost}💰`, 0, y, 22);
            overlay.addChild(itemLabel);
        });

        // 关闭按钮
        const closeBtn = this.createButton('关闭', 0, -200, 120, 50, () => {
            overlay.destroy();
        });
        overlay.addChild(closeBtn);
    }

    // =================== 存档 ===================
    saveGame() {
        try {
            if (typeof localStorage === 'undefined') return;
            
            localStorage.setItem('island_coins', this.coins.toString());
            localStorage.setItem('island_diamonds', this.diamonds.toString());
            localStorage.setItem('island_puppy', JSON.stringify(this.puppy));
            localStorage.setItem('island_buildings', JSON.stringify(this.buildings));
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
            
            const buildingsJson = localStorage.getItem('island_buildings');
            if (buildingsJson) {
                this.buildings = JSON.parse(buildingsJson);
            }
        } catch (e) {
            console.log('读取存档失败');
        }
    }

    // =================== 工具方法 ===================
    clearAll() {
        this.menuContainer?.destroy();
        this.gameContainer?.destroy();
        this.menuContainer = null;
        this.gameContainer = null;
        this.islandContainer = null;
        this.puppyNode = null;
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

        const labelNode = this.createLabel(text, 0, 0, 16);
        node.addChild(labelNode);

        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }
}
