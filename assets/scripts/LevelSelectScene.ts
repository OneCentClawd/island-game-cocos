import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view, ScrollView } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 关卡选择界面 - 复刻 weapp 版
 */
@ccclass('LevelSelectScene')
export class LevelSelectScene extends Component {
    private container: Node | null = null;
    private scrollContent: Node | null = null;
    
    // 关卡数据
    private totalLevels: number = 50;
    private unlockedLevel: number = 5;  // 已解锁到第几关
    private levelStars: number[] = [];  // 每关获得的星星数
    
    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;
    
    // 网格配置
    private columns: number = 4;
    private cellSize: number = 80;
    private cellGap: number = 30;

    start() {
        console.log('🎮 选择关卡');
        
        const size = view.getDesignResolutionSize();
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        
        this.loadData();
        this.initUI();
    }

    initUI() {
        this.container = new Node('Container');
        this.container.layer = this.node.layer;
        this.container.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        this.node.addChild(this.container);

        this.drawBackground();
        this.drawTopBar();
        this.drawLevelGrid();
    }

    // =================== 背景 ===================
    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        // 渐变：蓝色 → 紫色
        const segments = 10;
        const segmentH = this.screenHeight / segments;
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const r = Math.round(80 + (130 - 80) * t);
            const g = Math.round(120 + (100 - 120) * t);
            const b = Math.round(220 + (180 - 220) * t);
            
            graphics.fillColor = new Color(r, g, b);
            graphics.rect(
                -this.screenWidth/2, 
                this.screenHeight/2 - (i + 1) * segmentH, 
                this.screenWidth, 
                segmentH
            );
            graphics.fill();
        }
        
        this.container?.addChild(bg);
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
        backLabel.getComponent(Label)!.color = new Color(100, 120, 200);
        backBtn.addChild(backLabel);
        
        backBtn.setPosition(-this.screenWidth/2 + 60, topY, 0);
        backBtn.on(Node.EventType.TOUCH_END, () => {
            this.saveData();
            director.loadScene('MainMenu');
        }, this);
        this.container?.addChild(backBtn);
        
        // 标题
        const title = this.createLabel('🎮 选择关卡', 0, topY, 26);
        this.container?.addChild(title);
        
        // 解锁进度
        const progress = this.createLabel(`已解锁 ${this.unlockedLevel}/${this.totalLevels} 关`, 0, topY - 35, 15);
        progress.getComponent(Label)!.color = new Color(200, 200, 230);
        this.container?.addChild(progress);
    }

    // =================== 关卡网格 ===================
    drawLevelGrid() {
        const startY = this.screenHeight/2 - 170;
        const rows = Math.ceil(this.totalLevels / this.columns);
        const gridHeight = rows * (this.cellSize + this.cellGap) + 50;
        
        // 滚动区域
        const scrollView = new Node('ScrollView');
        scrollView.layer = this.node.layer;
        const scrollTransform = scrollView.addComponent(UITransform);
        scrollTransform.setContentSize(this.screenWidth, this.screenHeight - 200);
        scrollView.setPosition(0, -50, 0);
        this.container?.addChild(scrollView);
        
        // 内容容器
        this.scrollContent = new Node('Content');
        this.scrollContent.layer = this.node.layer;
        this.scrollContent.addComponent(UITransform).setContentSize(this.screenWidth, gridHeight);
        this.scrollContent.setPosition(0, 0, 0);
        scrollView.addChild(this.scrollContent);
        
        // 计算起始位置
        const totalWidth = this.columns * this.cellSize + (this.columns - 1) * this.cellGap;
        const startX = -totalWidth / 2 + this.cellSize / 2;
        const contentStartY = gridHeight / 2 - this.cellSize / 2 - 20;
        
        // 绘制关卡按钮
        for (let i = 0; i < this.totalLevels; i++) {
            const level = i + 1;
            const col = i % this.columns;
            const row = Math.floor(i / this.columns);
            
            const x = startX + col * (this.cellSize + this.cellGap);
            const y = contentStartY - row * (this.cellSize + this.cellGap);
            
            const isUnlocked = level <= this.unlockedLevel;
            const stars = this.levelStars[i] || 0;
            
            const levelBtn = this.createLevelButton(level, x, y, isUnlocked, stars);
            this.scrollContent.addChild(levelBtn);
        }
    }

    createLevelButton(level: number, x: number, y: number, isUnlocked: boolean, stars: number): Node {
        const btn = new Node(`Level_${level}`);
        btn.layer = this.node.layer;
        btn.addComponent(UITransform).setContentSize(this.cellSize, this.cellSize + 20);
        
        // 圆形背景
        const circle = new Node('Circle');
        circle.layer = this.node.layer;
        const gfx = circle.addComponent(Graphics);
        circle.addComponent(UITransform).setContentSize(this.cellSize, this.cellSize);
        
        if (isUnlocked) {
            // 青绿色
            gfx.fillColor = new Color(80, 200, 180);
        } else {
            // 灰色
            gfx.fillColor = new Color(100, 110, 120);
        }
        gfx.circle(0, 0, this.cellSize / 2);
        gfx.fill();
        
        btn.addChild(circle);
        
        if (isUnlocked) {
            // 关卡数字
            const numLabel = this.createLabel(`${level}`, 0, 5, 28);
            numLabel.getComponent(Label)!.color = Color.WHITE;
            btn.addChild(numLabel);
            
            // 星星
            const starsText = this.getStarsDisplay(stars);
            const starsLabel = this.createLabel(starsText, 0, -25, 14);
            btn.addChild(starsLabel);
            
            // 点击进入关卡
            btn.on(Node.EventType.TOUCH_START, () => {
                tween(btn).to(0.05, { scale: new Vec3(0.9, 0.9, 1) }).start();
            }, this);
            btn.on(Node.EventType.TOUCH_END, () => {
                tween(btn).to(0.1, { scale: new Vec3(1, 1, 1) }).call(() => {
                    this.enterLevel(level);
                }).start();
            }, this);
            btn.on(Node.EventType.TOUCH_CANCEL, () => {
                tween(btn).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
            }, this);
        } else {
            // 锁图标
            const lockLabel = this.createLabel('🔒', 0, 0, 28);
            btn.addChild(lockLabel);
        }
        
        btn.setPosition(x, y, 0);
        return btn;
    }

    getStarsDisplay(stars: number): string {
        // 用不同颜色表示星星
        let display = '';
        for (let i = 0; i < 3; i++) {
            display += i < stars ? '⭐' : '☆';
        }
        return display;
    }

    enterLevel(level: number) {
        console.log(`进入关卡 ${level}`);
        
        // 保存当前选择的关卡
        try {
            const saved = localStorage.getItem('island_merge_save');
            const data = saved ? JSON.parse(saved) : {};
            data.currentLevel = level;
            localStorage.setItem('island_merge_save', JSON.stringify(data));
        } catch (e) {
            console.error('保存关卡失败:', e);
        }
        
        // 跳转到消消乐游戏
        director.loadScene('Match3Game');
    }

    // =================== 存档 ===================
    saveData() {
        try {
            const data = {
                unlockedLevel: this.unlockedLevel,
                levelStars: this.levelStars,
            };
            localStorage.setItem('island_level_progress', JSON.stringify(data));
        } catch (e) {
            console.error('保存失败:', e);
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('island_level_progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedLevel = data.unlockedLevel || 5;
                this.levelStars = data.levelStars || [];
            } else {
                // 默认数据
                this.unlockedLevel = 5;
                this.levelStars = [3, 3, 2, 3, 1];  // 前5关有星星
            }
        } catch (e) {
            console.error('加载失败:', e);
            this.unlockedLevel = 5;
            this.levelStars = [3, 3, 2, 3, 1];
        }
    }

    // =================== 工具 ===================
    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(100, fontSize + 10);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 5;
        label.color = Color.WHITE;
        node.setPosition(x, y, 0);
        return node;
    }
}
