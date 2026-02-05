import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 每日任务配置
 */
const DAILY_TASKS = [
    { id: 'login', name: '每日签到', desc: '登录游戏', target: 1, reward: { coin: 20 }, icon: '📅' },
    { id: 'match3_play', name: '消消乐', desc: '玩一局消消乐', target: 1, reward: { coin: 30 }, icon: '🧩' },
    { id: 'match3_score', name: '高分挑战', desc: '消消乐单局500分', target: 500, reward: { coin: 50 }, icon: '🎯' },
    { id: 'merge_create', name: '合成物品', desc: '合成5个物品', target: 5, reward: { coin: 40 }, icon: '🔮' },
    { id: 'feed_puppy', name: '喂养小狗', desc: '喂食3次', target: 3, reward: { coin: 30 }, icon: '🐕' },
    { id: 'pet_puppy', name: '抚摸小狗', desc: '抚摸小狗10次', target: 10, reward: { coin: 20 }, icon: '❤️' },
];

/**
 * 每日任务系统
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
        console.log('🎯 每日任务系统');
        
        const size = view.getDesignResolutionSize();
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        
        this.loadData();
        this.checkReset();
        this.showTasks();
    }

    checkReset() {
        const today = new Date().toDateString();
        if (this.lastResetDate !== today) {
            // 重置任务进度
            this.taskProgress.clear();
            this.taskClaimed.clear();
            this.lastResetDate = today;
            
            // 自动完成签到
            this.updateProgress('login', 1);
            
            this.saveData();
        }
    }

    showTasks() {
        this.clearAll();

        this.container = new Node('Container');
        this.container.layer = this.node.layer;
        this.container.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        this.node.addChild(this.container);

        // 背景
        const bg = new Node('Bg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        graphics.fillColor = new Color(255, 152, 0);
        graphics.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight);
        graphics.fill();
        this.container.addChild(bg);

        // 标题
        const title = this.createLabel('🎯 每日任务', 0, this.screenHeight/2 - 80, 36);
        this.container.addChild(title);

        // 任务列表
        const startY = this.screenHeight/2 - 180;
        const itemHeight = 80;

        DAILY_TASKS.forEach((task, i) => {
            const y = startY - i * itemHeight;
            const progress = this.taskProgress.get(task.id) || 0;
            const claimed = this.taskClaimed.get(task.id) || false;
            
            const item = this.createTaskItem(task, y, progress, claimed);
            this.container?.addChild(item);
        });

        // 返回按钮
        const backBtn = this.createButton('返回', 0, -this.screenHeight/2 + 80, 120, 50, () => {
            director.loadScene('MainMenu');
        });
        this.container.addChild(backBtn);
    }

    createTaskItem(task: typeof DAILY_TASKS[0], y: number, progress: number, claimed: boolean): Node {
        const node = new Node(`Task_${task.id}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(360, 70);
        
        const completed = progress >= task.target;
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = completed ? new Color(100, 200, 100, 200) : new Color(255, 255, 255, 200);
        graphics.roundRect(-180, -35, 360, 70, 10);
        graphics.fill();

        // 图标
        const icon = this.createLabel(task.icon, -140, 0, 30);
        node.addChild(icon);

        // 名称
        const name = this.createLabel(task.name, -40, 15, 18);
        name.getComponent(Label)!.color = new Color(50, 50, 50);
        node.addChild(name);

        // 描述
        const desc = this.createLabel(task.desc, -40, -5, 12);
        desc.getComponent(Label)!.color = new Color(100, 100, 100);
        node.addChild(desc);

        // 进度
        const progressText = `${Math.min(progress, task.target)}/${task.target}`;
        const progressLabel = this.createLabel(progressText, -40, -22, 12);
        progressLabel.getComponent(Label)!.color = new Color(80, 80, 80);
        node.addChild(progressLabel);

        // 奖励/领取按钮
        if (completed && !claimed) {
            const claimBtn = this.createButton(`领取\n${task.reward.coin}💰`, 140, 0, 70, 50, () => {
                this.claimReward(task.id);
            });
            node.addChild(claimBtn);
        } else if (claimed) {
            const claimedLabel = this.createLabel('✓ 已领取', 140, 0, 14);
            claimedLabel.getComponent(Label)!.color = new Color(100, 200, 100);
            node.addChild(claimedLabel);
        } else {
            const rewardLabel = this.createLabel(`${task.reward.coin}💰`, 140, 0, 16);
            rewardLabel.getComponent(Label)!.color = new Color(255, 180, 0);
            node.addChild(rewardLabel);
        }

        node.setPosition(0, y, 0);
        return node;
    }

    updateProgress(taskId: string, amount: number) {
        const current = this.taskProgress.get(taskId) || 0;
        this.taskProgress.set(taskId, current + amount);
        this.saveData();
    }

    claimReward(taskId: string) {
        const task = DAILY_TASKS.find(t => t.id === taskId);
        if (!task) return;

        this.taskClaimed.set(taskId, true);
        
        // 发放奖励
        if (task.reward.coin) this.addCoins(task.reward.coin);

        this.saveData();
        this.showTasks(); // 刷新显示
    }

    addCoins(amount: number) {
        try {
            if (typeof localStorage === 'undefined') return;
            const coins = parseInt(localStorage.getItem('island_coins') || '0') + amount;
            localStorage.setItem('island_coins', coins.toString());
        } catch (e) {}
    }

    saveData() {
        try {
            if (typeof localStorage === 'undefined') return;
            const progressData = Object.fromEntries(this.taskProgress);
            const claimedData = Object.fromEntries(this.taskClaimed);
            localStorage.setItem('daily_progress', JSON.stringify(progressData));
            localStorage.setItem('daily_claimed', JSON.stringify(claimedData));
            localStorage.setItem('daily_reset_date', this.lastResetDate);
        } catch (e) {}
    }

    loadData() {
        try {
            if (typeof localStorage === 'undefined') return;
            const progressJson = localStorage.getItem('daily_progress');
            const claimedJson = localStorage.getItem('daily_claimed');
            this.lastResetDate = localStorage.getItem('daily_reset_date') || '';
            if (progressJson) this.taskProgress = new Map(Object.entries(JSON.parse(progressJson)));
            if (claimedJson) this.taskClaimed = new Map(Object.entries(JSON.parse(claimedJson)));
        } catch (e) {}
    }

    clearAll() {
        this.container?.destroy();
        this.container = null;
    }

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
        node.addComponent(UITransform).setContentSize(width, height);
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(80, 150, 255, 230);
        graphics.roundRect(-width/2, -height/2, width, height, 8);
        graphics.fill();
        const labelNode = this.createLabel(text, 0, 0, 14);
        node.addChild(labelNode);
        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);
        return node;
    }
}
