import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 成就配置
 */
const ACHIEVEMENTS = [
    { id: 'first_match', name: '初次消除', desc: '完成第一次消除', reward: { coin: 50 }, icon: '🎯' },
    { id: 'score_1000', name: '千分达人', desc: '单局得分超过1000', reward: { coin: 100 }, icon: '🏅' },
    { id: 'level_5', name: '闯关新手', desc: '通过第5关', reward: { coin: 150, diamond: 1 }, icon: '⭐' },
    { id: 'level_10', name: '闯关高手', desc: '通过第10关', reward: { coin: 300, diamond: 3 }, icon: '🌟' },
    { id: 'merge_5', name: '合成入门', desc: '合成出5级物品', reward: { coin: 200 }, icon: '🔮' },
    { id: 'merge_8', name: '合成大师', desc: '合成出8级物品', reward: { coin: 500, diamond: 5 }, icon: '👑' },
    { id: 'puppy_level_5', name: '小狗成长', desc: '小狗达到5级', reward: { coin: 200 }, icon: '🐕' },
    { id: 'puppy_love_100', name: '深厚情谊', desc: '小狗好感度达到100', reward: { diamond: 5 }, icon: '❤️' },
    { id: 'play_7_days', name: '坚持不懈', desc: '连续登录7天', reward: { coin: 500, diamond: 10 }, icon: '📅' },
];

/**
 * 成就系统
 */
@ccclass('AchievementSystem')
export class AchievementSystem extends Component {
    private container: Node | null = null;
    private achievements: Map<string, boolean> = new Map();
    private claimed: Map<string, boolean> = new Map();

    start() {
        console.log('🏆 成就系统');
        this.loadData();
        this.showAchievements();
    }

    showAchievements() {
        this.clearAll();

        this.container = new Node('Container');
        this.container.layer = this.node.layer;
        this.container.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(this.container);

        // 背景
        const bg = new Node('Bg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);
        graphics.fillColor = new Color(102, 126, 234);
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();
        this.container.addChild(bg);

        // 标题
        const title = this.createLabel('🏆 成就', 0, 320, 36);
        this.container.addChild(title);

        // 成就列表
        const startY = 240;
        const itemHeight = 70;

        ACHIEVEMENTS.forEach((ach, i) => {
            const y = startY - i * itemHeight;
            const unlocked = this.achievements.get(ach.id) || false;
            const claimed = this.claimed.get(ach.id) || false;
            
            const item = this.createAchievementItem(ach, y, unlocked, claimed);
            this.container?.addChild(item);
        });

        // 返回按钮
        const backBtn = this.createButton('返回', 0, -350, 120, 50, () => {
            director.loadScene('MainMenu');
        });
        this.container.addChild(backBtn);
    }

    createAchievementItem(ach: typeof ACHIEVEMENTS[0], y: number, unlocked: boolean, claimed: boolean): Node {
        const node = new Node(`Ach_${ach.id}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(360, 60);
        
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = unlocked ? new Color(100, 200, 100, 200) : new Color(100, 100, 100, 200);
        graphics.roundRect(-180, -30, 360, 60, 10);
        graphics.fill();

        // 图标
        const icon = this.createLabel(ach.icon, -140, 0, 30);
        node.addChild(icon);

        // 名称
        const name = this.createLabel(ach.name, -50, 10, 18);
        name.getComponent(Label)!.color = unlocked ? Color.WHITE : new Color(180, 180, 180);
        node.addChild(name);

        // 描述
        const desc = this.createLabel(ach.desc, -50, -12, 12);
        desc.getComponent(Label)!.color = new Color(200, 200, 200);
        node.addChild(desc);

        // 奖励/领取按钮
        if (unlocked && !claimed) {
            const claimBtn = this.createButton('领取', 140, 0, 60, 35, () => {
                this.claimReward(ach.id);
            });
            node.addChild(claimBtn);
        } else if (claimed) {
            const claimedLabel = this.createLabel('✓', 140, 0, 24);
            claimedLabel.getComponent(Label)!.color = new Color(150, 255, 150);
            node.addChild(claimedLabel);
        } else {
            const rewardText = this.getRewardText(ach.reward);
            const rewardLabel = this.createLabel(rewardText, 140, 0, 14);
            rewardLabel.getComponent(Label)!.color = new Color(255, 215, 0);
            node.addChild(rewardLabel);
        }

        node.setPosition(0, y, 0);
        return node;
    }

    getRewardText(reward: {coin?: number, diamond?: number}): string {
        const parts: string[] = [];
        if (reward.coin) parts.push(`${reward.coin}💰`);
        if (reward.diamond) parts.push(`${reward.diamond}💎`);
        return parts.join(' ');
    }

    claimReward(achId: string) {
        const ach = ACHIEVEMENTS.find(a => a.id === achId);
        if (!ach) return;

        this.claimed.set(achId, true);
        
        // 发放奖励
        if (ach.reward.coin) this.addCoins(ach.reward.coin);
        if (ach.reward.diamond) this.addDiamonds(ach.reward.diamond);

        this.saveData();
        this.showAchievements(); // 刷新显示
    }

    // 解锁成就
    unlock(achId: string) {
        if (!this.achievements.get(achId)) {
            this.achievements.set(achId, true);
            this.saveData();
            console.log(`🏆 解锁成就: ${achId}`);
        }
    }

    addCoins(amount: number) {
        try {
            if (typeof localStorage === 'undefined') return;
            const coins = parseInt(localStorage.getItem('island_coins') || '0') + amount;
            localStorage.setItem('island_coins', coins.toString());
        } catch (e) {}
    }

    addDiamonds(amount: number) {
        try {
            if (typeof localStorage === 'undefined') return;
            const diamonds = parseInt(localStorage.getItem('island_diamonds') || '0') + amount;
            localStorage.setItem('island_diamonds', diamonds.toString());
        } catch (e) {}
    }

    saveData() {
        try {
            if (typeof localStorage === 'undefined') return;
            const achData = Object.fromEntries(this.achievements);
            const claimedData = Object.fromEntries(this.claimed);
            localStorage.setItem('achievements', JSON.stringify(achData));
            localStorage.setItem('achievements_claimed', JSON.stringify(claimedData));
        } catch (e) {}
    }

    loadData() {
        try {
            if (typeof localStorage === 'undefined') return;
            const achJson = localStorage.getItem('achievements');
            const claimedJson = localStorage.getItem('achievements_claimed');
            if (achJson) this.achievements = new Map(Object.entries(JSON.parse(achJson)));
            if (claimedJson) this.claimed = new Map(Object.entries(JSON.parse(claimedJson)));
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
        const labelNode = this.createLabel(text, 0, 0, 16);
        node.addChild(labelNode);
        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);
        return node;
    }
}
