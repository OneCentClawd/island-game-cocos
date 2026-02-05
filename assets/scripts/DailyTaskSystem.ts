import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 每日任务配置 - 复刻 weapp 版
 */
const DAILY_TASKS = [
    { 
        id: 'match3_star', 
        name: '完成1关三星', 
        icon: '⭐', 
        target: 1, 
        reward: { diamond: 3 },
        type: 'match3'
    },
    { 
        id: 'merge_20', 
        name: '合成20次', 
        icon: '🔄', 
        target: 20, 
        reward: { coin: 50, energy: 10 },
        type: 'merge'
    },
    { 
        id: 'match3_3levels', 
        name: '完成3关消消乐', 
        icon: '🎮', 
        target: 3, 
        reward: { coin: 100 },
        type: 'match3'
    },
    { 
        id: 'feed_puppy', 
        name: '喂食小狗3次', 
        icon: '🍖', 
        target: 3, 
        reward: { coin: 30 },
        type: 'island'
    },
    { 
        id: 'login', 
        name: '每日登录', 
        icon: '📅', 
        target: 1, 
        reward: { coin: 20, energy: 5 },
        type: 'daily'
    },
];

interface TaskReward {
    coin?: number;
    diamond?: number;
    energy?: number;
}

/**
 * 每日任务系统 - 复刻 weapp 版
 */
@ccclass('DailyTaskSystem')
export class DailyTaskSystem extends Component {
    private container: Node | null = null;
    private taskProgress: Map<string, number> = new Map();
    private taskClaimed: Map<string, boolean> = new Map();
    private lastResetDate: string = '';
    
    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;

    start() {
        console.log('📋 每日任务');
        
        const size = view.getDesignResolutionSize();
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        
        this.loadData();
        this.checkReset();
        this.initUI();
    }

    checkReset() {
        const today = new Date().toDateString();
        if (this.lastResetDate !== today) {
            // 重置所有任务
            this.taskProgress.clear();
            this.taskClaimed.clear();
            this.lastResetDate = today;
            
            // 自动完成登录任务
            this.updateProgress('login', 1);
            
            this.saveData();
        }
    }

    initUI() {
        this.container = new Node('Container');
        this.container.layer = this.node.layer;
        this.container.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        this.node.addChild(this.container);

        this.drawBackground();
        this.drawTopBar();
        this.drawTaskList();
    }

    // =================== 背景 ===================
    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        // 渐变：青绿 → 粉色
        // Graphics 不支持渐变，用分段模拟
        const segments = 10;
        const segmentH = this.screenHeight / segments;
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const r = Math.round(120 + (255 - 120) * t);
            const g = Math.round(200 + (200 - 200) * t);
            const b = Math.round(190 + (220 - 190) * t);
            
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
        backLabel.getComponent(Label)!.color = new Color(80, 180, 170);
        backBtn.addChild(backLabel);
        
        backBtn.setPosition(-this.screenWidth/2 + 60, topY, 0);
        backBtn.on(Node.EventType.TOUCH_END, () => {
            this.saveData();
            director.loadScene('MainMenu');
        }, this);
        this.container?.addChild(backBtn);
        
        // 标题
        const title = this.createLabel('📋 每日任务', 0, topY, 24);
        this.container?.addChild(title);
        
        // 副标题
        const subtitle = this.createLabel('每日0点刷新', 0, topY - 30, 14);
        subtitle.getComponent(Label)!.color = new Color(100, 100, 100);
        this.container?.addChild(subtitle);
    }

    // =================== 任务列表 ===================
    drawTaskList() {
        const startY = this.screenHeight/2 - 180;
        const cardH = 100;
        const spacing = 15;
        
        DAILY_TASKS.forEach((task, i) => {
            const y = startY - i * (cardH + spacing);
            const progress = this.taskProgress.get(task.id) || 0;
            const claimed = this.taskClaimed.get(task.id) || false;
            
            const card = this.createTaskCard(task, y, progress, claimed);
            this.container?.addChild(card);
        });
    }

    createTaskCard(task: typeof DAILY_TASKS[0], y: number, progress: number, claimed: boolean): Node {
        const cardW = this.screenWidth - 40;
        const cardH = 95;
        
        const card = new Node(`Task_${task.id}`);
        card.layer = this.node.layer;
        card.addComponent(UITransform).setContentSize(cardW, cardH);
        
        // 白色背景
        const gfx = card.addComponent(Graphics);
        gfx.fillColor = new Color(255, 255, 255, 245);
        gfx.roundRect(-cardW/2, -cardH/2, cardW, cardH, 12);
        gfx.fill();
        
        // 左侧图标（带背景）
        const iconBg = new Node('IconBg');
        iconBg.layer = this.node.layer;
        const iconGfx = iconBg.addComponent(Graphics);
        iconBg.addComponent(UITransform).setContentSize(50, 50);
        iconGfx.fillColor = new Color(230, 240, 250);
        iconGfx.roundRect(-25, -25, 50, 50, 10);
        iconGfx.fill();
        iconBg.setPosition(-cardW/2 + 45, 5, 0);
        card.addChild(iconBg);
        
        const icon = this.createLabel(task.icon, -cardW/2 + 45, 5, 28);
        card.addChild(icon);
        
        // 任务名称
        const nameLabel = this.createLabel(task.name, -cardW/2 + 130, 22, 18);
        nameLabel.getComponent(Label)!.color = new Color(50, 50, 50);
        const nameTransform = nameLabel.getComponent(UITransform)!;
        nameTransform.setAnchorPoint(0, 0.5);
        card.addChild(nameLabel);
        
        // 奖励
        const rewardText = this.formatReward(task.reward);
        const rewardLabel = this.createLabel(`奖励: ${rewardText}`, -cardW/2 + 130, 0, 14);
        rewardLabel.getComponent(Label)!.color = new Color(100, 100, 100);
        const rewardTransform = rewardLabel.getComponent(UITransform)!;
        rewardTransform.setAnchorPoint(0, 0.5);
        card.addChild(rewardLabel);
        
        // 进度条背景
        const barW = 180;
        const barH = 16;
        const barX = -cardW/2 + 130;
        const barY = -25;
        
        const barBg = new Node('BarBg');
        barBg.layer = this.node.layer;
        const barBgGfx = barBg.addComponent(Graphics);
        barBg.addComponent(UITransform).setContentSize(barW, barH);
        barBgGfx.fillColor = new Color(220, 220, 220);
        barBgGfx.roundRect(0, -barH/2, barW, barH, barH/2);
        barBgGfx.fill();
        barBg.setPosition(barX, barY, 0);
        card.addChild(barBg);
        
        // 进度条填充
        const percent = Math.min(1, progress / task.target);
        if (percent > 0) {
            const barFill = new Node('BarFill');
            barFill.layer = this.node.layer;
            const barFillGfx = barFill.addComponent(Graphics);
            barFill.addComponent(UITransform).setContentSize(barW, barH);
            barFillGfx.fillColor = new Color(100, 180, 255);
            const fillW = Math.max(barH, percent * barW);
            barFillGfx.roundRect(0, -barH/2, fillW, barH, barH/2);
            barFillGfx.fill();
            barFill.setPosition(barX, barY, 0);
            card.addChild(barFill);
        }
        
        // 进度文字
        const progressText = this.createLabel(`${progress}/${task.target}`, barX + barW/2, barY, 11);
        progressText.getComponent(Label)!.color = new Color(255, 255, 255);
        card.addChild(progressText);
        
        // 右侧按钮
        const btnW = 70;
        const btnH = 35;
        const isComplete = progress >= task.target;
        
        const btn = new Node('ClaimBtn');
        btn.layer = this.node.layer;
        btn.addComponent(UITransform).setContentSize(btnW, btnH);
        
        const btnGfx = btn.addComponent(Graphics);
        if (claimed) {
            btnGfx.fillColor = new Color(200, 200, 200);
        } else if (isComplete) {
            btnGfx.fillColor = new Color(76, 175, 80);
        } else {
            btnGfx.fillColor = new Color(180, 180, 180);
        }
        btnGfx.roundRect(-btnW/2, -btnH/2, btnW, btnH, 6);
        btnGfx.fill();
        
        const btnText = claimed ? '已领取' : (isComplete ? '领取' : '未完成');
        const btnLabel = this.createLabel(btnText, 0, 0, 13);
        btn.addChild(btnLabel);
        
        btn.setPosition(cardW/2 - 55, 0, 0);
        
        // 点击领取
        if (isComplete && !claimed) {
            btn.on(Node.EventType.TOUCH_END, () => {
                this.claimReward(task);
            }, this);
        }
        
        card.addChild(btn);
        card.setPosition(0, y, 0);
        
        return card;
    }

    formatReward(reward: TaskReward): string {
        const parts: string[] = [];
        if (reward.diamond) parts.push(`💎${reward.diamond}`);
        if (reward.coin) parts.push(`💰${reward.coin}`);
        if (reward.energy) parts.push(`⚡${reward.energy}`);
        return parts.join(' ');
    }

    claimReward(task: typeof DAILY_TASKS[0]) {
        // 标记已领取
        this.taskClaimed.set(task.id, true);
        
        // 发放奖励（这里只是示意，实际需要写入全局存档）
        let rewardText = '';
        if (task.reward.diamond) rewardText += `+${task.reward.diamond}💎 `;
        if (task.reward.coin) rewardText += `+${task.reward.coin}💰 `;
        if (task.reward.energy) rewardText += `+${task.reward.energy}⚡ `;
        
        // 保存奖励到全局存档
        this.saveRewardToGlobal(task.reward);
        
        this.saveData();
        this.showToast(`🎉 领取成功！${rewardText}`);
        
        // 刷新界面
        this.container?.destroy();
        this.initUI();
    }
    
    saveRewardToGlobal(reward: TaskReward) {
        try {
            // 读取全局存档
            const saved = localStorage.getItem('island_merge_save');
            if (saved) {
                const data = JSON.parse(saved);
                if (reward.coin) data.coins = (data.coins || 0) + reward.coin;
                if (reward.diamond) data.diamonds = (data.diamonds || 0) + reward.diamond;
                if (reward.energy) data.energy = (data.energy || 0) + reward.energy;
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
        toast.addComponent(UITransform).setContentSize(300, 50);
        
        gfx.fillColor = new Color(0, 0, 0, 200);
        gfx.roundRect(-150, -25, 300, 50, 10);
        gfx.fill();
        
        const label = this.createLabel(text, 0, 0, 16);
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

    // =================== 进度更新（供外部调用） ===================
    updateProgress(taskId: string, amount: number = 1) {
        const current = this.taskProgress.get(taskId) || 0;
        this.taskProgress.set(taskId, current + amount);
        this.saveData();
    }

    // =================== 存档 ===================
    saveData() {
        try {
            const data = {
                taskProgress: Object.fromEntries(this.taskProgress),
                taskClaimed: Object.fromEntries(this.taskClaimed),
                lastResetDate: this.lastResetDate,
            };
            localStorage.setItem('island_daily_tasks', JSON.stringify(data));
        } catch (e) {
            console.error('保存失败:', e);
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('island_daily_tasks');
            if (saved) {
                const data = JSON.parse(saved);
                this.taskProgress = new Map(Object.entries(data.taskProgress || {}));
                this.taskClaimed = new Map(Object.entries(data.taskClaimed || {}));
                this.lastResetDate = data.lastResetDate || '';
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
