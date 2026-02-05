import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 排行榜类型
 */
type LeaderboardType = 'level' | 'score' | 'coin';

/**
 * 玩家数据
 */
interface PlayerData {
    name: string;
    score: number;
}

/**
 * 模拟排行榜数据
 */
const MOCK_DATA: { [key: string]: PlayerData[] } = {
    level: [
        { name: 'Jack', score: 5 },
        { name: '鱼酷', score: 5 },
        { name: '鱼 🐟', score: 5 },
        { name: '小明', score: 3 },
        { name: '玩家A', score: 2 },
    ],
    score: [
        { name: '鱼酷', score: 12580 },
        { name: 'Jack', score: 9800 },
        { name: '小明', score: 7650 },
        { name: '鱼 🐟', score: 5200 },
    ],
    coin: [
        { name: 'Jack', score: 2500 },
        { name: '小明', score: 1800 },
        { name: '鱼酷', score: 1200 },
    ],
};

/**
 * 排行榜系统 - 复刻 weapp 版
 */
@ccclass('LeaderboardSystem')
export class LeaderboardSystem extends Component {
    private container: Node | null = null;
    private listContainer: Node | null = null;
    private tabButtons: Node[] = [];
    private myRankLabel: Label | null = null;
    
    // 当前选中的排行榜类型
    private currentType: LeaderboardType = 'level';
    
    // 玩家名称
    private playerName: string = 'Jack';
    
    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;

    start() {
        console.log('🏆 排行榜');
        
        const size = view.getDesignResolutionSize();
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        
        this.initUI();
    }

    initUI() {
        this.container = new Node('Container');
        this.container.layer = this.node.layer;
        this.container.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        this.node.addChild(this.container);

        this.drawBackground();
        this.drawTopBar();
        this.drawTabs();
        this.drawListPanel();
        this.drawBottomBar();
        
        // 默认显示关卡进度排行榜
        this.showLeaderboard('level');
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
            const r = Math.round(80 + (140 - 80) * t);
            const g = Math.round(120 + (100 - 120) * t);
            const b = Math.round(200 + (180 - 200) * t);
            
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
        backLabel.getComponent(Label)!.color = new Color(80, 120, 200);
        backBtn.addChild(backLabel);
        
        backBtn.setPosition(-this.screenWidth/2 + 60, topY, 0);
        backBtn.on(Node.EventType.TOUCH_END, () => {
            director.loadScene('MainMenu');
        }, this);
        this.container?.addChild(backBtn);
        
        // 标题
        const title = this.createLabel('🏆 排行榜', 0, topY, 26);
        this.container?.addChild(title);
        
        // 用户名
        const userName = this.createLabel(this.playerName, this.screenWidth/2 - 60, topY, 14);
        userName.getComponent(Label)!.color = new Color(200, 200, 255);
        this.container?.addChild(userName);
    }

    // =================== Tab切换 ===================
    drawTabs() {
        const tabY = this.screenHeight/2 - 150;
        const tabs = [
            { type: 'level' as LeaderboardType, icon: '🎮', name: '关卡进度' },
            { type: 'score' as LeaderboardType, icon: '💎', name: '消消乐分数' },
            { type: 'coin' as LeaderboardType, icon: '💰', name: '合成金币' },
        ];
        
        const tabW = (this.screenWidth - 60) / 3;
        const tabH = 40;
        const startX = -(this.screenWidth - 60) / 2 + tabW / 2 + 10;
        
        tabs.forEach((tab, i) => {
            const x = startX + i * (tabW + 5);
            const btn = this.createTabButton(tab, x, tabY, tabW, tabH);
            this.tabButtons.push(btn);
            this.container?.addChild(btn);
        });
    }

    createTabButton(tab: { type: LeaderboardType, icon: string, name: string }, x: number, y: number, w: number, h: number): Node {
        const btn = new Node(`Tab_${tab.type}`);
        btn.layer = this.node.layer;
        btn.addComponent(UITransform).setContentSize(w, h);
        
        const gfx = btn.addComponent(Graphics);
        const isSelected = tab.type === this.currentType;
        
        if (isSelected) {
            gfx.fillColor = new Color(255, 255, 255, 230);
        } else {
            gfx.fillColor = new Color(100, 120, 180, 200);
        }
        gfx.roundRect(-w/2, -h/2, w, h, 8);
        gfx.fill();
        
        const label = this.createLabel(`${tab.icon} ${tab.name}`, 0, 0, 13);
        label.getComponent(Label)!.color = isSelected ? new Color(100, 120, 200) : Color.WHITE;
        btn.addChild(label);
        
        btn.setPosition(x, y, 0);
        
        // 点击切换
        btn.on(Node.EventType.TOUCH_END, () => {
            this.showLeaderboard(tab.type);
        }, this);
        
        return btn;
    }

    // =================== 列表面板 ===================
    drawListPanel() {
        const panelY = -20;
        const panelW = this.screenWidth - 40;
        const panelH = this.screenHeight - 400;
        
        const panel = new Node('ListPanel');
        panel.layer = this.node.layer;
        panel.addComponent(UITransform).setContentSize(panelW, panelH);
        
        const gfx = panel.addComponent(Graphics);
        gfx.fillColor = new Color(160, 140, 200, 80);
        gfx.roundRect(-panelW/2, -panelH/2, panelW, panelH, 15);
        gfx.fill();
        
        panel.setPosition(0, panelY, 0);
        this.container?.addChild(panel);
        
        // 表头
        const headerY = panelH/2 - 30;
        const rankHeader = this.createLabel('排名', -panelW/2 + 50, headerY, 14);
        rankHeader.getComponent(Label)!.color = new Color(200, 200, 220);
        panel.addChild(rankHeader);
        
        const nameHeader = this.createLabel('玩家', -panelW/2 + 150, headerY, 14);
        nameHeader.getComponent(Label)!.color = new Color(200, 200, 220);
        panel.addChild(nameHeader);
        
        const scoreHeader = this.createLabel('分数', panelW/2 - 50, headerY, 14);
        scoreHeader.getComponent(Label)!.color = new Color(200, 200, 220);
        panel.addChild(scoreHeader);
        
        // 列表容器
        this.listContainer = new Node('ListContent');
        this.listContainer.layer = this.node.layer;
        this.listContainer.addComponent(UITransform).setContentSize(panelW, panelH - 60);
        this.listContainer.setPosition(0, -20, 0);
        panel.addChild(this.listContainer);
    }

    // =================== 底部栏 ===================
    drawBottomBar() {
        const bottomY = -this.screenHeight/2 + 80;
        const barW = this.screenWidth - 40;
        const barH = 50;
        
        const bar = new Node('BottomBar');
        bar.layer = this.node.layer;
        bar.addComponent(UITransform).setContentSize(barW, barH);
        
        const gfx = bar.addComponent(Graphics);
        gfx.fillColor = new Color(180, 140, 100, 200);
        gfx.roundRect(-barW/2, -barH/2, barW, barH, 10);
        gfx.fill();
        
        bar.setPosition(0, bottomY, 0);
        this.container?.addChild(bar);
        
        // 我的排名
        const myRank = this.createLabel('我的排名: 第1名 (5分)', -barW/2 + 150, 0, 16);
        myRank.getComponent(Label)!.color = new Color(255, 230, 150);
        this.myRankLabel = myRank.getComponent(Label);
        bar.addChild(myRank);
        
        // 刷新按钮
        const refreshBtn = new Node('RefreshBtn');
        refreshBtn.layer = this.node.layer;
        refreshBtn.addComponent(UITransform).setContentSize(90, 35);
        
        const refreshGfx = refreshBtn.addComponent(Graphics);
        refreshGfx.fillColor = new Color(50, 180, 200);
        refreshGfx.roundRect(-45, -17, 90, 35, 8);
        refreshGfx.fill();
        
        const refreshLabel = this.createLabel('🔄 刷新', 0, 0, 14);
        refreshBtn.addChild(refreshLabel);
        
        refreshBtn.setPosition(barW/2 - 65, 0, 0);
        refreshBtn.on(Node.EventType.TOUCH_END, () => {
            this.showLeaderboard(this.currentType);
            this.showToast('已刷新');
        }, this);
        bar.addChild(refreshBtn);
    }

    // =================== 显示排行榜 ===================
    showLeaderboard(type: LeaderboardType) {
        this.currentType = type;
        
        // 更新 Tab 样式
        this.updateTabs();
        
        // 清空列表
        this.listContainer?.removeAllChildren();
        
        // 获取数据
        const data = MOCK_DATA[type] || [];
        
        // 渲染列表
        const rowH = 50;
        const startY = (this.listContainer?.getComponent(UITransform)?.height || 0) / 2 - 30;
        
        data.forEach((player, i) => {
            const y = startY - i * rowH;
            const row = this.createPlayerRow(i + 1, player, y);
            this.listContainer?.addChild(row);
        });
        
        // 更新我的排名
        this.updateMyRank(type, data);
    }

    updateTabs() {
        const types: LeaderboardType[] = ['level', 'score', 'coin'];
        
        this.tabButtons.forEach((btn, i) => {
            const gfx = btn.getComponent(Graphics);
            const label = btn.children[0]?.getComponent(Label);
            const isSelected = types[i] === this.currentType;
            
            if (gfx && label) {
                gfx.clear();
                const w = btn.getComponent(UITransform)?.width || 100;
                const h = btn.getComponent(UITransform)?.height || 40;
                
                if (isSelected) {
                    gfx.fillColor = new Color(255, 255, 255, 230);
                    label.color = new Color(100, 120, 200);
                } else {
                    gfx.fillColor = new Color(100, 120, 180, 200);
                    label.color = Color.WHITE;
                }
                gfx.roundRect(-w/2, -h/2, w, h, 8);
                gfx.fill();
            }
        });
    }

    createPlayerRow(rank: number, player: PlayerData, y: number): Node {
        const row = new Node('PlayerRow');
        row.layer = this.node.layer;
        const w = this.listContainer?.getComponent(UITransform)?.width || 600;
        row.addComponent(UITransform).setContentSize(w, 45);
        
        // 排名图标
        let rankIcon = `${rank}`;
        if (rank === 1) rankIcon = '🥇';
        else if (rank === 2) rankIcon = '🥈';
        else if (rank === 3) rankIcon = '🥉';
        
        const rankLabel = this.createLabel(rankIcon, -w/2 + 50, 0, rank <= 3 ? 24 : 18);
        row.addChild(rankLabel);
        
        // 玩家名
        const nameLabel = this.createLabel(player.name, -w/2 + 150, 0, 16);
        const nameTrans = nameLabel.getComponent(UITransform)!;
        nameTrans.setAnchorPoint(0, 0.5);
        row.addChild(nameLabel);
        
        // 分数
        const scoreLabel = this.createLabel(`${player.score}`, w/2 - 50, 0, 18);
        scoreLabel.getComponent(Label)!.color = new Color(100, 200, 255);
        row.addChild(scoreLabel);
        
        row.setPosition(0, y, 0);
        return row;
    }

    updateMyRank(type: LeaderboardType, data: PlayerData[]) {
        const myIndex = data.findIndex(p => p.name === this.playerName);
        if (myIndex >= 0 && this.myRankLabel) {
            const myScore = data[myIndex].score;
            this.myRankLabel.string = `我的排名: 第${myIndex + 1}名 (${myScore}分)`;
        }
    }

    showToast(text: string) {
        const toast = new Node('Toast');
        toast.layer = this.node.layer;
        const gfx = toast.addComponent(Graphics);
        toast.addComponent(UITransform).setContentSize(200, 40);
        
        gfx.fillColor = new Color(0, 0, 0, 200);
        gfx.roundRect(-100, -20, 200, 40, 8);
        gfx.fill();
        
        const label = this.createLabel(text, 0, 0, 14);
        toast.addChild(label);
        
        toast.setPosition(0, 0, 0);
        toast.setScale(new Vec3(0, 0, 1));
        this.container?.addChild(toast);
        
        tween(toast)
            .to(0.15, { scale: new Vec3(1, 1, 1) })
            .delay(1)
            .to(0.15, { scale: new Vec3(0, 0, 1) })
            .call(() => toast.destroy())
            .start();
    }

    // =================== 工具 ===================
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
}
