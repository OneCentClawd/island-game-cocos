import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 游戏主菜单
 * 整合所有小游戏入口
 */
@ccclass('MainMenu')
export class MainMenu extends Component {
    private menuContainer: Node | null = null;
    private currentGame: string = '';

    start() {
        console.log('🏝️ 小岛物语 - 主菜单');
        this.showMainMenu();
    }

    showMainMenu() {
        this.clearAll();
        this.currentGame = '';

        this.menuContainer = new Node('MenuContainer');
        this.menuContainer.layer = this.node.layer;
        this.menuContainer.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(this.menuContainer);

        // 背景渐变
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);
        graphics.fillColor = new Color(76, 205, 196);
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();
        this.menuContainer.addChild(bg);

        // 标题图标
        const icon = this.createLabel('🏝️', 0, 200, 80);
        this.menuContainer.addChild(icon);

        // 标题
        const title = this.createLabel('小岛物语', 0, 100, 48);
        this.menuContainer.addChild(title);

        // 副标题
        const subtitle = this.createLabel('Island Story', 0, 50, 20);
        subtitle.getComponent(Label)!.color = new Color(255, 230, 109);
        this.menuContainer.addChild(subtitle);

        // 游戏按钮
        const games = [
            { name: '🏝️ 我的小岛', scene: 'Island', desc: '养一只可爱的小狗' },
            { name: '🧩 消消乐', scene: 'Match3', desc: '三消益智游戏' },
            { name: '🔮 合成大师', scene: 'Merge', desc: '合成进化游戏' },
            { name: '🏆 排行榜', scene: 'Leaderboard', desc: '查看排名' },
            { name: '🎯 每日任务', scene: 'DailyTask', desc: '完成任务领奖励' },
            { name: '⚙️ 设置', scene: 'Settings', desc: '游戏设置' },
        ];

        const startY = -30;
        const btnHeight = 55;
        const spacing = 65;

        games.forEach((game, i) => {
            const y = startY - i * spacing;
            const btn = this.createMenuButton(game.name, game.desc, 0, y, 280, btnHeight, () => {
                this.openGame(game.scene);
            });
            this.menuContainer?.addChild(btn);
        });

        // 底部版本号
        const version = this.createLabel('v0.3.1', 0, -380, 14);
        version.getComponent(Label)!.color = new Color(255, 255, 255, 150);
        this.menuContainer.addChild(version);

        // 资源显示
        this.showResources();
    }

    showResources() {
        const coins = this.getCoins();
        const diamonds = this.getDiamonds();

        const resBar = new Node('ResourceBar');
        resBar.layer = this.node.layer;
        resBar.addComponent(UITransform).setContentSize(300, 40);
        resBar.setPosition(0, 280, 0);
        this.menuContainer?.addChild(resBar);

        const coinsLabel = this.createLabel(`💰 ${coins}`, -60, 0, 18);
        resBar.addChild(coinsLabel);

        const diamondsLabel = this.createLabel(`💎 ${diamonds}`, 60, 0, 18);
        resBar.addChild(diamondsLabel);
    }

    createMenuButton(title: string, desc: string, x: number, y: number, width: number, height: number, callback: () => void): Node {
        const node = new Node('MenuButton');
        node.layer = this.node.layer;
        const transform = node.addComponent(UITransform);
        transform.setContentSize(width, height);
        
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(255, 230, 109, 240);
        graphics.roundRect(-width/2, -height/2, width, height, 12);
        graphics.fill();
        
        // 边框
        graphics.strokeColor = new Color(230, 200, 74);
        graphics.lineWidth = 3;
        graphics.roundRect(-width/2, -height/2, width, height, 12);
        graphics.stroke();

        // 标题
        const titleLabel = this.createLabel(title, 0, 8, 22);
        titleLabel.getComponent(Label)!.color = new Color(44, 62, 80);
        node.addChild(titleLabel);

        // 描述
        const descLabel = this.createLabel(desc, 0, -15, 12);
        descLabel.getComponent(Label)!.color = new Color(100, 100, 100);
        node.addChild(descLabel);

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

    openGame(scene: string) {
        console.log(`打开游戏: ${scene}`);
        
        // 在实际项目中，这里应该切换场景
        // director.loadScene(scene);
        
        // 临时：显示提示
        this.showNotice(`正在打开 ${scene}...`);
    }

    showNotice(text: string) {
        const notice = new Node('Notice');
        notice.layer = this.node.layer;
        notice.addComponent(UITransform).setContentSize(300, 50);
        
        const graphics = notice.addComponent(Graphics);
        graphics.fillColor = new Color(0, 0, 0, 200);
        graphics.roundRect(-150, -25, 300, 50, 10);
        graphics.fill();

        const label = this.createLabel(text, 0, 0, 18);
        notice.addChild(label);

        notice.setPosition(0, -320, 0);
        notice.setScale(new Vec3(0, 0, 1));
        this.menuContainer?.addChild(notice);

        tween(notice)
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .delay(1.5)
            .to(0.2, { scale: new Vec3(0, 0, 1) })
            .call(() => notice.destroy())
            .start();
    }

    // =================== 数据读取 ===================
    getCoins(): number {
        try {
            if (typeof localStorage !== 'undefined') {
                return parseInt(localStorage.getItem('island_coins') || '100');
            }
        } catch (e) {}
        return 100;
    }

    getDiamonds(): number {
        try {
            if (typeof localStorage !== 'undefined') {
                return parseInt(localStorage.getItem('island_diamonds') || '5');
            }
        } catch (e) {}
        return 5;
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
