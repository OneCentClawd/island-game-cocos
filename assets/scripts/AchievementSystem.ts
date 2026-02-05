import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view, ScrollView, Mask } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 成就配置 - 复刻 weapp 版
 */
const ACHIEVEMENTS = [
    // 消消乐成就
    { id: 'first_level', name: '初来乍到', desc: '完成第一关', icon: '⭐', target: 1, type: 'level', reward: { diamond: 5 } },
    { id: 'level_5', name: '小试牛刀', desc: '通关5个关卡', icon: '🎮', target: 5, type: 'level', reward: { diamond: 10 } },
    { id: 'level_10', name: '游戏达人', desc: '通关10个关卡', icon: '🎯', target: 10, type: 'level', reward: { diamond: 20 } },
    { id: 'level_20', name: '通关大师', desc: '通关第20关', icon: '👑', target: 20, type: 'level', reward: { diamond: 50 } },
    { id: 'level_50', name: '传奇玩家', desc: '通关全部50关', icon: '🏆', target: 50, type: 'level', reward: { diamond: 100 } },
    
    // 合成成就
    { id: 'merge_10', name: '合成新手', desc: '合成10次', icon: '🔄', target: 10, type: 'merge', reward: { coin: 100 } },
    { id: 'merge_100', name: '合成专家', desc: '合成100次', icon: '🛸', target: 100, type: 'merge', reward: { coin: 500 } },
    { id: 'merge_500', name: '合成大师', desc: '合成500次', icon: '🌟', target: 500, type: 'merge', reward: { coin: 1000 } },
    
    // 金币成就
    { id: 'coin_1000', name: '小富翁', desc: '累计获得1000金币', icon: '💰', target: 1000, type: 'coin', reward: { diamond: 10 } },
    { id: 'coin_10000', name: '大富翁', desc: '累计获得10000金币', icon: '💎', target: 10000, type: 'coin', reward: { diamond: 50 } },
    
    // 小岛成就
    { id: 'feed_10', name: '爱心主人', desc: '喂食小狗10次', icon: '🍖', target: 10, type: 'feed', reward: { coin: 50 } },
    { id: 'puppy_lv5', name: '好朋友', desc: '小狗达到5级', icon: '🐕', target: 5, type: 'puppy_level', reward: { diamond: 20 } },
];

interface AchievementReward {
    coin?: number;
    diamond?: number;
}

/**
 * 成就系统 - 复刻 weapp 版
 */
@ccclass('AchievementSystem')
export class AchievementSystem extends Component {
    private container: Node | null = null;
    private scrollContent: Node | null = null;
    
    // 成就进度
    private progress: Map<string, number> = new Map();
    private claimed: Map<string, boolean> = new Map();
    
    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;

    start() {
        console.log('🏆 成就系统');
        
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
        this.drawAchievementList();
    }

    // =================== 背景 ===================
    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        // 渐变：浅黄 → 粉色
        const segments = 10;
        const segmentH = this.screenHeight / segments;
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const r = Math.round(255 + (255 - 255) * t);
            const g = Math.round(245 + (200 - 245) * t);
            const b = Math.round(200 + (210 - 200) * t);
            
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
        backLabel.getComponent(Label)!.color = new Color(200, 150, 100);
        backBtn.addChild(backLabel);
        
        backBtn.setPosition(-this.screenWidth/2 + 60, topY, 0);
        backBtn.on(Node.EventType.TOUCH_END, () => {
            this.saveData();
            director.loadScene('MainMenu');
        }, this);
        this.container?.addChild(backBtn);
        
        // 标题
        const title = this.createLabel('🏆 成就', 0, topY, 26);
        this.container?.addChild(title);
        
        // 完成进度
        const completed = this.getCompletedCount();
        const total = ACHIEVEMENTS.length;
        const subtitle = this.createLabel(`已完成 ${completed}/${total}`, 0, topY - 32, 14);
        subtitle.getComponent(Label)!.color = new Color(120, 120, 120);
        this.container?.addChild(subtitle);
    }

    getCompletedCount(): number {
        let count = 0;
        ACHIEVEMENTS.forEach(ach => {
            const prog = this.progress.get(ach.id) || 0;
            if (prog >= ach.target) count++;
        });
        return count;
    }

    // =================== 成就列表 ===================
    drawAchievementList() {
        const startY = this.screenHeight/2 - 170;
        const cardH = 85;
        const spacing = 10;
        
        // 滚动容器
        const scrollView = new Node('ScrollView');
        scrollView.layer = this.node.layer;
        const scrollTransform = scrollView.addComponent(UITransform);
        scrollTransform.setContentSize(this.screenWidth, this.screenHeight - 200);
        scrollView.setPosition(0, -50, 0);
        this.container?.addChild(scrollView);
        
        // 内容容器
        this.scrollContent = new Node('Content');
        this.scrollContent.layer = this.node.layer;
        const contentHeight = ACHIEVEMENTS.length * (cardH + spacing) + 50;
        this.scrollContent.addComponent(UITransform).setContentSize(this.screenWidth, contentHeight);
        this.scrollContent.setPosition(0, 0, 0);
        scrollView.addChild(this.scrollContent);
        
        // 绘制成就卡片
        ACHIEVEMENTS.forEach((ach, i) => {
            const y = contentHeight/2 - 40 - i * (cardH + spacing);
            const prog = this.progress.get(ach.id) || 0;
            const isClaimed = this.claimed.get(ach.id) || false;
            
            const card = this.createAchievementCard(ach, y, prog, isClaimed);
            this.scrollContent?.addChild(card);
        });
    }

    createAchievementCard(ach: typeof ACHIEVEMENTS[0], y: number, progress: number, claimed: boolean): Node {
        const cardW = this.screenWidth - 40;
        const cardH = 80;
        const isComplete = progress >= ach.target;
        
        const card = new Node(`Achievement_${ach.id}`);
        card.layer = this.node.layer;
        card.addComponent(UITransform).setContentSize(cardW, cardH);
        
        // 背景颜色：完成待领取用浅绿，其他用白色
        const gfx = card.addComponent(Graphics);
        if (isComplete && !claimed) {
            gfx.fillColor = new Color(230, 245, 230);  // 浅绿
        } else {
            gfx.fillColor = new Color(255, 255, 255, 240);
        }
        gfx.roundRect(-cardW/2, -cardH/2, cardW, cardH, 12);
        gfx.fill();
        
        // 边框
        gfx.strokeColor = new Color(220, 220, 220);
        gfx.lineWidth = 1;
        gfx.roundRect(-cardW/2, -cardH/2, cardW, cardH, 12);
        gfx.stroke();
        
        // 左侧图标
        const icon = this.createLabel(ach.icon, -cardW/2 + 45, 0, 32);
        card.addChild(icon);
        
        // 名称
        const nameLabel = this.createLabel(ach.name, -cardW/2 + 100, 18, 18);
        nameLabel.getComponent(Label)!.color = new Color(50, 50, 50);
        const nameTransform = nameLabel.getComponent(UITransform)!;
        nameTransform.setAnchorPoint(0, 0.5);
        card.addChild(nameLabel);
        
        // 描述
        const descLabel = this.createLabel(ach.desc, -cardW/2 + 100, -2, 13);
        descLabel.getComponent(Label)!.color = new Color(130, 130, 130);
        const descTransform = descLabel.getComponent(UITransform)!;
        descTransform.setAnchorPoint(0, 0.5);
        card.addChild(descLabel);
        
        // 奖励
        const rewardText = this.formatReward(ach.reward);
        const rewardLabel = this.createLabel(rewardText, -cardW/2 + 100, -22, 14);
        rewardLabel.getComponent(Label)!.color = new Color(50, 150, 200);
        const rewardTransform = rewardLabel.getComponent(UITransform)!;
        rewardTransform.setAnchorPoint(0, 0.5);
        card.addChild(rewardLabel);
        
        // 右侧按钮
        const btnW = 70;
        const btnH = 35;
        
        const btn = new Node('ClaimBtn');
        btn.layer = this.node.layer;
        btn.addComponent(UITransform).setContentSize(btnW, btnH);
        
        const btnGfx = btn.addComponent(Graphics);
        if (claimed) {
            btnGfx.fillColor = new Color(200, 200, 200);
        } else if (isComplete) {
            btnGfx.fillColor = new Color(76, 175, 80);  // 绿色
        } else {
            btnGfx.fillColor = new Color(180, 180, 180);  // 灰色
        }
        btnGfx.roundRect(-btnW/2, -btnH/2, btnW, btnH, 6);
        btnGfx.fill();
        
        const btnText = claimed ? '已领取' : (isComplete ? '领取' : '未达成');
        const btnLabel = this.createLabel(btnText, 0, 0, 13);
        btn.addChild(btnLabel);
        
        btn.setPosition(cardW/2 - 55, 0, 0);
        
        // 点击领取
        if (isComplete && !claimed) {
            btn.on(Node.EventType.TOUCH_END, () => {
                this.claimReward(ach);
            }, this);
        }
        
        card.addChild(btn);
        card.setPosition(0, y, 0);
        
        return card;
    }

    formatReward(reward: AchievementReward): string {
        const parts: string[] = [];
        if (reward.diamond) parts.push(`💎 ${reward.diamond}`);
        if (reward.coin) parts.push(`💰 ${reward.coin}`);
        return parts.join('  ');
    }

    claimReward(ach: typeof ACHIEVEMENTS[0]) {
        this.claimed.set(ach.id, true);
        
        // 保存奖励到全局存档
        this.saveRewardToGlobal(ach.reward);
        
        let rewardText = '';
        if (ach.reward.diamond) rewardText += `+${ach.reward.diamond}💎 `;
        if (ach.reward.coin) rewardText += `+${ach.reward.coin}💰 `;
        
        this.saveData();
        this.showToast(`🎉 ${ach.name} 达成！${rewardText}`);
        
        // 刷新界面
        this.container?.destroy();
        this.initUI();
    }
    
    saveRewardToGlobal(reward: AchievementReward) {
        try {
            const saved = localStorage.getItem('island_merge_save');
            if (saved) {
                const data = JSON.parse(saved);
                if (reward.coin) data.coins = (data.coins || 0) + reward.coin;
                if (reward.diamond) data.diamonds = (data.diamonds || 0) + reward.diamond;
                localStorage.setItem('island_merge_save', JSON.stringify(data));
            }
        } catch (e) {
            console.error('保存奖励失败:', e);
        }
    }

    showToast(text: string) {
        const toast = new Node('Toast');
        toast.layer = this.node.layer;
        const gfx = toast.addComponent(Graphics);
        toast.addComponent(UITransform).setContentSize(320, 50);
        
        gfx.fillColor = new Color(0, 0, 0, 200);
        gfx.roundRect(-160, -25, 320, 50, 10);
        gfx.fill();
        
        const label = this.createLabel(text, 0, 0, 15);
        toast.addChild(label);
        
        toast.setPosition(0, 0, 0);
        toast.setScale(new Vec3(0, 0, 1));
        this.container?.addChild(toast);
        
        tween(toast)
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .delay(1.5)
            .to(0.2, { scale: new Vec3(0, 0, 1) })
            .call(() => toast.destroy())
            .start();
    }

    // =================== 存档 ===================
    saveData() {
        try {
            const data = {
                progress: Object.fromEntries(this.progress),
                claimed: Object.fromEntries(this.claimed),
            };
            localStorage.setItem('island_achievements', JSON.stringify(data));
        } catch (e) {
            console.error('保存失败:', e);
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('island_achievements');
            if (saved) {
                const data = JSON.parse(saved);
                this.progress = new Map(Object.entries(data.progress || {}));
                this.claimed = new Map(Object.entries(data.claimed || {}));
            }
        } catch (e) {
            console.error('加载失败:', e);
        }
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
