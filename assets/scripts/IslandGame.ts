import { _decorator, Component, Node, Label, UITransform, Color, Size, EventTouch, Vec3, tween, find } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 建筑配置
 */
const BUILDINGS = [
    { id: 'house', name: '房屋', emoji: '🏠', cost: { gold: 50, wood: 30 }, population: 2 },
    { id: 'farm', name: '农场', emoji: '🌾', cost: { gold: 80, wood: 50 }, production: { type: 'food', amount: 5, interval: 10 } },
    { id: 'lumber', name: '伐木', emoji: '🪓', cost: { gold: 60, wood: 20 }, production: { type: 'wood', amount: 3, interval: 8 } },
    { id: 'mine', name: '矿场', emoji: '⛏️', cost: { gold: 100, wood: 80 }, production: { type: 'gold', amount: 10, interval: 15 } },
];

interface PlacedBuilding {
    node: Node;
    config: typeof BUILDINGS[0];
    timer: number;
    ready: boolean;
}

/**
 * 小岛物语 - 完整游戏（自动创建所有UI）
 */
@ccclass('IslandGame')
export class IslandGame extends Component {
    // 资源
    private gold: number = 100;
    private wood: number = 50;
    private food: number = 30;
    private population: number = 0;

    // UI 引用（自动创建）
    private goldLabel: Label | null = null;
    private woodLabel: Label | null = null;
    private foodLabel: Label | null = null;
    private popLabel: Label | null = null;
    private infoLabel: Label | null = null;
    private buildArea: Node | null = null;
    private buttons: Node[] = [];

    // 游戏状态
    private _selectedBuilding: typeof BUILDINGS[0] | null = null;
    private _placedBuildings: PlacedBuilding[] = [];

    onLoad() {
        console.log('🏝️ 小岛物语 onLoad');
        this.loadGame();
        this.createAllUI();
    }

    start() {
        console.log('🏝️ 小岛物语 start');
        this.updateResourceUI();
        this.showInfo('🏝️ 欢迎！点击下方按钮选择建筑');
    }

    /**
     * 创建所有UI元素
     */
    createAllUI() {
        const canvas = this.node;
        
        // 清理旧的动态创建节点（如果有）
        const oldNodes = ['ResourcePanel', 'BuildArea', 'ButtonPanel', 'InfoLabel'];
        oldNodes.forEach(name => {
            const old = canvas.getChildByName(name);
            if (old) old.destroy();
        });

        // 1. 资源面板（左上角）
        this.createResourcePanel(canvas);
        
        // 2. 建造区域（中间大区域）
        this.createBuildArea(canvas);
        
        // 3. 按钮面板（底部）
        this.createButtonPanel(canvas);
        
        // 4. 信息提示（按钮上方）
        this.createInfoLabel(canvas);
        
        console.log('UI 创建完成');
    }

    /**
     * 创建资源面板
     */
    createResourcePanel(parent: Node) {
        const panel = new Node('ResourcePanel');
        panel.addComponent(UITransform).setContentSize(new Size(200, 200));
        panel.setPosition(-450, 250, 0);
        parent.addChild(panel);

        // 金币
        const goldNode = this.createLabel('💰 100', 0, 60, 28);
        this.goldLabel = goldNode.getComponent(Label);
        panel.addChild(goldNode);

        // 木材
        const woodNode = this.createLabel('🪵 50', 0, 20, 28);
        this.woodLabel = woodNode.getComponent(Label);
        panel.addChild(woodNode);

        // 食物
        const foodNode = this.createLabel('🍖 30', 0, -20, 28);
        this.foodLabel = foodNode.getComponent(Label);
        panel.addChild(foodNode);

        // 人口
        const popNode = this.createLabel('👥 0', 0, -60, 28);
        this.popLabel = popNode.getComponent(Label);
        panel.addChild(popNode);
    }

    /**
     * 创建建造区域
     */
    createBuildArea(parent: Node) {
        this.buildArea = new Node('BuildArea');
        const transform = this.buildArea.addComponent(UITransform);
        transform.setContentSize(new Size(1000, 500));
        this.buildArea.setPosition(0, 50, 0);
        parent.addChild(this.buildArea);

        // 点击事件
        this.buildArea.on(Node.EventType.TOUCH_END, this.onBuildAreaClick, this);
    }

    /**
     * 创建按钮面板
     */
    createButtonPanel(parent: Node) {
        const panel = new Node('ButtonPanel');
        panel.addComponent(UITransform).setContentSize(new Size(700, 100));
        panel.setPosition(0, -280, 0);
        parent.addChild(panel);

        // 4个建筑按钮
        const startX = -270;
        const spacing = 180;

        BUILDINGS.forEach((building, i) => {
            const btn = this.createButton(building, startX + i * spacing, 0);
            panel.addChild(btn);
            this.buttons.push(btn);
        });
    }

    /**
     * 创建单个按钮
     */
    createButton(building: typeof BUILDINGS[0], x: number, y: number): Node {
        const btn = new Node(`Btn_${building.id}`);
        const transform = btn.addComponent(UITransform);
        transform.setContentSize(new Size(160, 90));
        btn.setPosition(x, y, 0);

        const label = btn.addComponent(Label);
        label.string = `${building.emoji}\n${building.name}\n💰${building.cost.gold} 🪵${building.cost.wood}`;
        label.fontSize = 20;
        label.lineHeight = 26;
        label.color = new Color(255, 255, 255, 255);
        label.useSystemFont = true;
        label.horizontalAlign = 1; // 居中

        // 点击事件
        btn.on(Node.EventType.TOUCH_END, () => {
            this.selectBuilding(building);
        }, this);

        return btn;
    }

    /**
     * 创建信息标签
     */
    createInfoLabel(parent: Node) {
        const node = new Node('InfoLabel');
        node.addComponent(UITransform).setContentSize(new Size(600, 40));
        node.setPosition(0, -200, 0);

        this.infoLabel = node.addComponent(Label);
        this.infoLabel.string = '';
        this.infoLabel.fontSize = 24;
        this.infoLabel.lineHeight = 30;
        this.infoLabel.color = new Color(255, 255, 200, 255);
        this.infoLabel.useSystemFont = true;
        this.infoLabel.horizontalAlign = 1;

        parent.addChild(node);
    }

    /**
     * 辅助：创建Label节点
     */
    createLabel(text: string, x: number, y: number, fontSize: number = 24): Node {
        const node = new Node('Label');
        node.addComponent(UITransform).setContentSize(new Size(180, 40));
        node.setPosition(x, y, 0);

        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = new Color(255, 255, 255, 255);
        label.useSystemFont = true;

        return node;
    }

    /**
     * 选择建筑
     */
    selectBuilding(building: typeof BUILDINGS[0]) {
        if (this.gold < building.cost.gold || this.wood < building.cost.wood) {
            this.showInfo(`❌ 资源不足！需要 💰${building.cost.gold} 🪵${building.cost.wood}`);
            return;
        }
        
        this._selectedBuilding = building;
        this.showInfo(`✅ 选择了 ${building.emoji}${building.name}，点击上方空地放置`);
    }

    /**
     * 点击建造区域
     */
    onBuildAreaClick(event: EventTouch) {
        if (!this._selectedBuilding || !this.buildArea) return;
        
        const building = this._selectedBuilding;
        
        if (this.gold < building.cost.gold || this.wood < building.cost.wood) {
            this.showInfo(`❌ 资源不足！`);
            this._selectedBuilding = null;
            return;
        }
        
        // 扣除资源
        this.gold -= building.cost.gold;
        this.wood -= building.cost.wood;
        
        // 获取点击位置
        const touchPos = event.getUILocation();
        const transform = this.buildArea.getComponent(UITransform);
        if (!transform) return;
        
        const localPos = transform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        
        // 创建建筑
        const buildingNode = new Node(building.id);
        const label = buildingNode.addComponent(Label);
        label.string = building.emoji;
        label.fontSize = 50;
        label.lineHeight = 60;
        label.useSystemFont = true;
        
        buildingNode.addComponent(UITransform).setContentSize(new Size(60, 60));
        buildingNode.setPosition(localPos);
        buildingNode.setScale(0, 0, 1);
        
        this.buildArea.addChild(buildingNode);
        
        // 弹出动画
        tween(buildingNode)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
        
        // 房屋增加人口
        if (building.population) {
            this.population += building.population;
        }
        
        // 添加到列表
        const placed: PlacedBuilding = {
            node: buildingNode,
            config: building,
            timer: 0,
            ready: false
        };
        this._placedBuildings.push(placed);
        
        // 点击收集
        buildingNode.on(Node.EventType.TOUCH_END, (e: EventTouch) => {
            e.propagationStopped = true;
            this.collectResource(placed);
        }, this);
        
        this.showInfo(`🎉 ${building.emoji}${building.name} 建造成功！`);
        this._selectedBuilding = null;
        
        this.updateResourceUI();
        this.saveGame();
    }

    /**
     * 收集资源
     */
    collectResource(placed: PlacedBuilding) {
        const config = placed.config;
        
        if (!config.production) {
            this.showInfo(`🏠 住宅提供了 ${config.population} 人口`);
            return;
        }
        
        if (!placed.ready) {
            const remaining = config.production.interval - placed.timer;
            this.showInfo(`⏳ ${config.emoji} 还需 ${remaining.toFixed(0)} 秒`);
            return;
        }
        
        const type = config.production.type as 'gold' | 'wood' | 'food';
        const amount = config.production.amount;
        this[type] += amount;
        placed.timer = 0;
        placed.ready = false;
        
        const emoji = type === 'gold' ? '💰' : type === 'wood' ? '🪵' : '🍖';
        this.showInfo(`✨ 收集了 ${emoji}+${amount}！`);
        
        tween(placed.node)
            .to(0.1, { scale: new Vec3(1.3, 1.3, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
        
        this.updateResourceUI();
        this.saveGame();
    }

    update(deltaTime: number) {
        for (const placed of this._placedBuildings) {
            if (placed.config.production && !placed.ready) {
                placed.timer += deltaTime;
                if (placed.timer >= placed.config.production.interval) {
                    placed.ready = true;
                }
            }
            
            if (placed.ready) {
                const pulse = 1 + Math.sin(Date.now() / 150) * 0.15;
                placed.node.setScale(pulse, pulse, 1);
            }
        }
        
        // 更新按钮颜色
        this.buttons.forEach((btn, i) => {
            const building = BUILDINGS[i];
            const label = btn.getComponent(Label);
            if (label) {
                const canAfford = this.gold >= building.cost.gold && this.wood >= building.cost.wood;
                label.color = canAfford 
                    ? new Color(255, 255, 255, 255)
                    : new Color(128, 128, 128, 255);
            }
        });
    }

    updateResourceUI() {
        if (this.goldLabel) this.goldLabel.string = `💰 ${this.gold}`;
        if (this.woodLabel) this.woodLabel.string = `🪵 ${this.wood}`;
        if (this.foodLabel) this.foodLabel.string = `🍖 ${this.food}`;
        if (this.popLabel) this.popLabel.string = `👥 ${this.population}`;
    }

    showInfo(text: string) {
        if (this.infoLabel) this.infoLabel.string = text;
        console.log(text);
    }

    saveGame() {
        const data = { gold: this.gold, wood: this.wood, food: this.food, population: this.population };
        localStorage.setItem('island_save', JSON.stringify(data));
    }

    loadGame() {
        const saved = localStorage.getItem('island_save');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.gold = data.gold ?? 100;
                this.wood = data.wood ?? 50;
                this.food = data.food ?? 30;
                this.population = data.population ?? 0;
            } catch (e) {
                console.error('加载存档失败', e);
            }
        }
    }
}
