import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 游戏主菜单 - 复刻 weapp 版
 */
@ccclass('MainMenu')
export class MainMenu extends Component {
    private menuContainer: Node | null = null;
    
    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;
    
    // 资源数据
    private energy: number = 9995;
    private coins: number = 515;
    private diamonds: number = 10;

    start() {
        console.log('🏝️ 小岛物语 - 主菜单');
        
        // 获取设计分辨率
        const size = view.getDesignResolutionSize();
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        
        // 加载存档数据
        this.loadData();
        
        this.showMainMenu();
    }

    showMainMenu() {
        this.clearAll();

        this.menuContainer = new Node('MenuContainer');
        this.menuContainer.layer = this.node.layer;
        this.menuContainer.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        this.node.addChild(this.menuContainer);

        // 渐变背景
        this.drawBackground();
        
        // 顶部资源栏
        this.drawResourceBar();
        
        // 标题区域
        this.drawTitle();
        
        // 菜单按钮
        this.drawMenuButtons();
        
        // 底部图标（排行榜、设置）
        this.drawBottomIcons();
        
        // 版本号
        this.drawVersion();
    }
    
    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        // 渐变色：从上到下 #4ecdc4 -> #44a08d
        // Graphics 不支持渐变，用纯色近似
        graphics.fillColor = new Color(78, 205, 196);
        graphics.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight);
        graphics.fill();
        
        // 底部稍深一点的区域模拟渐变
        graphics.fillColor = new Color(68, 160, 141, 120);
        graphics.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight/3);
        graphics.fill();
        
        this.menuContainer?.addChild(bg);
    }
    
    drawResourceBar() {
        // 资源栏背景（可选，weapp版是透明的）
        const resBar = new Node('ResourceBar');
        resBar.layer = this.node.layer;
        resBar.addComponent(UITransform).setContentSize(this.screenWidth, 40);
        resBar.setPosition(0, this.screenHeight/2 - 60, 0);
        this.menuContainer?.addChild(resBar);
        
        // 体力
        const energyLabel = this.createLabel(`⚡${this.energy}`, -this.screenWidth/2 + 80, 0, 18);
        energyLabel.getComponent(Label)!.color = Color.WHITE;
        resBar.addChild(energyLabel);
        
        // 金币
        const coinsLabel = this.createLabel(`💰${this.coins}`, -this.screenWidth/2 + 180, 0, 18);
        coinsLabel.getComponent(Label)!.color = Color.WHITE;
        resBar.addChild(coinsLabel);
        
        // 钻石
        const diamondsLabel = this.createLabel(`💎${this.diamonds}`, -this.screenWidth/2 + 280, 0, 18);
        diamondsLabel.getComponent(Label)!.color = Color.WHITE;
        resBar.addChild(diamondsLabel);
    }
    
    drawTitle() {
        // 小岛图标
        const icon = this.createLabel('🏝️', 0, this.screenHeight/2 - 220, 70);
        this.menuContainer?.addChild(icon);
        
        // 主标题
        const title = this.createLabel('小岛物语', 0, this.screenHeight/2 - 320, 42);
        title.getComponent(Label)!.color = Color.WHITE;
        // 阴影效果（用描边模拟）
        this.menuContainer?.addChild(title);
        
        // 英文副标题
        const subtitle = this.createLabel('Island Story', 0, this.screenHeight/2 - 365, 18);
        subtitle.getComponent(Label)!.color = new Color(255, 230, 109);
        this.menuContainer?.addChild(subtitle);
    }
    
    drawMenuButtons() {
        // 按钮配置 - 按 weapp 顺序
        const buttons = [
            { name: '🎮 消消乐', scene: 'Match3' },
            { name: '🔄 合成模式', scene: 'MergeGame' },
            { name: '🏝️ 我的小岛', scene: 'Island' },
            { name: '📋 每日任务', scene: 'DailyTask' },
            { name: '🏆 成就', scene: 'Achievements' },
            { name: '🛒 商店', scene: 'Shop' },
        ];
        
        const startY = this.screenHeight/2 - 440;
        const btnWidth = 280;
        const btnHeight = 52;
        const spacing = 62;
        
        buttons.forEach((btn, i) => {
            const y = startY - i * spacing;
            const button = this.createMenuButton(btn.name, 0, y, btnWidth, btnHeight, () => {
                this.openScene(btn.scene);
            });
            this.menuContainer?.addChild(button);
        });
    }
    
    drawBottomIcons() {
        const bottomY = -this.screenHeight/2 + 100;
        
        // 排行榜图标 - 左下角
        const leaderboardIcon = this.createIconButton('🏆', -this.screenWidth/2 + 60, bottomY, () => {
            this.openScene('Leaderboard');
        });
        this.menuContainer?.addChild(leaderboardIcon);
        
        // 设置图标 - 右下角
        const settingsIcon = this.createIconButton('⚙️', this.screenWidth/2 - 60, bottomY, () => {
            this.openScene('Settings');
        });
        this.menuContainer?.addChild(settingsIcon);
    }
    
    drawVersion() {
        const version = this.createLabel('v0.3.1 - 开发中', 0, -this.screenHeight/2 + 40, 13);
        version.getComponent(Label)!.color = new Color(255, 255, 255, 180);
        this.menuContainer?.addChild(version);
    }

    createMenuButton(title: string, x: number, y: number, width: number, height: number, callback: () => void): Node {
        const node = new Node('MenuButton');
        node.layer = this.node.layer;
        const transform = node.addComponent(UITransform);
        transform.setContentSize(width, height);
        
        const graphics = node.addComponent(Graphics);
        
        // 黄色背景 - weapp 风格
        graphics.fillColor = new Color(255, 230, 109, 245);
        graphics.roundRect(-width/2, -height/2, width, height, 10);
        graphics.fill();
        
        // 深黄色边框
        graphics.strokeColor = new Color(230, 195, 60);
        graphics.lineWidth = 2;
        graphics.roundRect(-width/2, -height/2, width, height, 10);
        graphics.stroke();

        // 标题文字
        const titleLabel = this.createLabel(title, 0, 0, 22);
        titleLabel.getComponent(Label)!.color = new Color(44, 62, 80);
        node.addChild(titleLabel);

        node.setPosition(x, y, 0);
        
        // 点击效果
        node.on(Node.EventType.TOUCH_START, () => {
            tween(node).to(0.05, { scale: new Vec3(0.95, 0.95, 1) }).start();
        }, this);
        node.on(Node.EventType.TOUCH_END, () => {
            tween(node).to(0.1, { scale: new Vec3(1, 1, 1) }).call(callback).start();
        }, this);
        node.on(Node.EventType.TOUCH_CANCEL, () => {
            tween(node).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
        }, this);

        return node;
    }
    
    createIconButton(emoji: string, x: number, y: number, callback: () => void): Node {
        const node = new Node('IconButton');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(60, 60);
        
        const label = this.createLabel(emoji, 0, 0, 36);
        node.addChild(label);
        
        node.setPosition(x, y, 0);
        
        // 点击效果
        node.on(Node.EventType.TOUCH_START, () => {
            tween(node).to(0.05, { scale: new Vec3(0.9, 0.9, 1) }).start();
        }, this);
        node.on(Node.EventType.TOUCH_END, () => {
            tween(node).to(0.1, { scale: new Vec3(1, 1, 1) }).call(callback).start();
        }, this);
        node.on(Node.EventType.TOUCH_CANCEL, () => {
            tween(node).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
        }, this);
        
        return node;
    }

    openScene(scene: string) {
        console.log(`打开场景: ${scene}`);
        director.loadScene(scene);
    }

    // =================== 数据读取 ===================
    loadData() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('island_game_save');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.energy = data.energy || 9995;
                    this.coins = data.resources?.coin || 515;
                    this.diamonds = data.resources?.diamond || 10;
                }
            }
        } catch (e) {
            console.error('加载存档失败:', e);
        }
    }

    // =================== 工具方法 ===================
    clearAll() {
        this.menuContainer?.destroy();
        this.menuContainer = null;
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
}
