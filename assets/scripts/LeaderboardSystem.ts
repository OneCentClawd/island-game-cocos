import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 排行榜类型
 */
const LEADERBOARD_TYPES = [
    { key: 'match3_score', name: '消消乐', icon: '🧩' },
    { key: 'merge_level', name: '合成', icon: '🔮' },
    { key: 'puppy_love', name: '好感度', icon: '❤️' },
];

/**
 * 排行榜系统
 */
@ccclass('LeaderboardSystem')
export class LeaderboardSystem extends Component {
    private container: Node | null = null;
    private currentType: string = 'match3_score';
    private rankings: {name: string, score: number}[] = [];
    
    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;

    start() {
        console.log('🏆 排行榜系统');
        
        const size = view.getDesignResolutionSize();
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        
        this.loadData();
        this.showLeaderboard();
    }

    showLeaderboard() {
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
        graphics.fillColor = new Color(103, 58, 183);
        graphics.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight);
        graphics.fill();
        this.container.addChild(bg);

        // 标题
        const title = this.createLabel('🏆 排行榜', 0, this.screenHeight/2 - 70, 36);
        this.container.addChild(title);

        // Tab 栏
        this.createTabs();

        // 排行列表
        this.createRankingList();

        // 我的排名
        this.showMyRank();

        // 返回按钮
        const backBtn = this.createButton('返回', 0, -this.screenHeight/2 + 80, 120, 50, () => {
            director.loadScene('MainMenu');
        });
        this.container.addChild(backBtn);
    }

    createTabs() {
        const tabWidth = 100;
        const startX = -(LEADERBOARD_TYPES.length - 1) * tabWidth / 2;

        LEADERBOARD_TYPES.forEach((type, i) => {
            const x = startX + i * tabWidth;
            const isActive = type.key === this.currentType;
            
            const tab = this.createTab(type.icon + ' ' + type.name, x, this.screenHeight/2 - 130, isActive, () => {
                this.currentType = type.key;
                this.loadData();
                this.showLeaderboard();
            });
            this.container?.addChild(tab);
        });
    }

    createTab(text: string, x: number, y: number, isActive: boolean, callback: () => void): Node {
        const node = new Node('Tab');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(95, 35);
        
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = isActive ? new Color(255, 255, 255, 80) : new Color(0, 0, 0, 50);
        graphics.roundRect(-47, -17, 95, 35, 8);
        graphics.fill();

        const label = this.createLabel(text, 0, 0, 14);
        node.addChild(label);

        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }

    createRankingList() {
        const listBg = new Node('ListBg');
        listBg.layer = this.node.layer;
        const graphics = listBg.addComponent(Graphics);
        listBg.addComponent(UITransform).setContentSize(360, 400);
        graphics.fillColor = new Color(0, 0, 0, 100);
        graphics.roundRect(-180, -200, 360, 400, 12);
        graphics.fill();
        listBg.setPosition(0, 20, 0);
        this.container?.addChild(listBg);

        // 排名项
        const startY = 160;
        const itemHeight = 45;
        const maxShow = 8;

        const displayRankings = this.rankings.slice(0, maxShow);
        
        if (displayRankings.length === 0) {
            const emptyLabel = this.createLabel('暂无数据', 0, 0, 18);
            emptyLabel.getComponent(Label)!.color = new Color(200, 200, 200);
            listBg.addChild(emptyLabel);
        } else {
            displayRankings.forEach((item, i) => {
                const y = startY - i * itemHeight;
                const rankItem = this.createRankItem(i + 1, item.name, item.score, y);
                listBg.addChild(rankItem);
            });
        }
    }

    createRankItem(rank: number, name: string, score: number, y: number): Node {
        const node = new Node('RankItem');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(320, 40);

        // 排名
        let rankText: string;
        if (rank === 1) rankText = '🥇';
        else if (rank === 2) rankText = '🥈';
        else if (rank === 3) rankText = '🥉';
        else rankText = `${rank}`;
        
        const rankLabel = this.createLabel(rankText, -130, 0, 20);
        node.addChild(rankLabel);

        // 名字
        const nameLabel = this.createLabel(name, -30, 0, 16);
        node.addChild(nameLabel);

        // 分数
        const scoreLabel = this.createLabel(`${score}`, 120, 0, 16);
        scoreLabel.getComponent(Label)!.color = new Color(255, 215, 0);
        node.addChild(scoreLabel);

        node.setPosition(0, y, 0);
        return node;
    }

    showMyRank() {
        const myRank = this.getMyRank();
        const myScore = this.getMyScore();

        const myRankBg = new Node('MyRankBg');
        myRankBg.layer = this.node.layer;
        const graphics = myRankBg.addComponent(Graphics);
        myRankBg.addComponent(UITransform).setContentSize(360, 50);
        graphics.fillColor = new Color(255, 255, 255, 30);
        graphics.roundRect(-180, -25, 360, 50, 10);
        graphics.fill();
        myRankBg.setPosition(0, -250, 0);
        this.container?.addChild(myRankBg);

        const myText = myRank > 0 
            ? `我的排名: 第${myRank}名 (${myScore}分)`
            : '我的排名: 暂未上榜';
        const myLabel = this.createLabel(myText, 0, 0, 16);
        myRankBg.addChild(myLabel);
    }

    getMyRank(): number {
        const myScore = this.getMyScore();
        if (myScore === 0) return 0;
        
        const rank = this.rankings.findIndex(r => r.score <= myScore);
        return rank === -1 ? this.rankings.length + 1 : rank + 1;
    }

    getMyScore(): number {
        try {
            if (typeof localStorage === 'undefined') return 0;
            
            switch (this.currentType) {
                case 'match3_score':
                    return parseInt(localStorage.getItem('match3_high_score') || '0');
                case 'merge_level':
                    return parseInt(localStorage.getItem('merge_max_level') || '0');
                case 'puppy_love':
                    const puppy = JSON.parse(localStorage.getItem('island_puppy') || '{}');
                    return Math.floor(puppy.love || 0);
                default:
                    return 0;
            }
        } catch (e) {
            return 0;
        }
    }

    loadData() {
        // 模拟排行榜数据（实际项目应从服务器获取）
        this.rankings = this.generateMockRankings();
    }

    generateMockRankings(): {name: string, score: number}[] {
        const names = ['小明', '小红', '小刚', '小丽', '小华', '小强', '小芳', '小军', '小英', '小伟'];
        const rankings: {name: string, score: number}[] = [];
        
        let baseScore: number;
        switch (this.currentType) {
            case 'match3_score':
                baseScore = 5000;
                break;
            case 'merge_level':
                baseScore = 8;
                break;
            case 'puppy_love':
                baseScore = 500;
                break;
            default:
                baseScore = 1000;
        }
        
        for (let i = 0; i < 10; i++) {
            rankings.push({
                name: names[i],
                score: Math.floor(baseScore * (1 - i * 0.08) + Math.random() * baseScore * 0.1)
            });
        }
        
        return rankings.sort((a, b) => b.score - a.score);
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
        const labelNode = this.createLabel(text, 0, 0, 18);
        node.addChild(labelNode);
        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);
        return node;
    }
}
