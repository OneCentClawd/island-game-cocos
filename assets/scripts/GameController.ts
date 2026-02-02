import { _decorator, Component, Node, Label, UITransform, Widget, Color, Sprite, Size, EventTouch, Vec3, tween, UIOpacity } from 'cc';
import { GameManager } from './managers/GameManager';
const { ccclass, property } = _decorator;

/**
 * 建筑配置
 */
const Buildings = [
    { id: 'house', name: '房屋', emoji: '🏠', cost: { gold: 50, wood: 30 }, population: 2 },
    { id: 'farm', name: '农场', emoji: '🌾', cost: { gold: 80, wood: 50 }, production: { type: 'food', amount: 5, interval: 10 } },
    { id: 'lumber', name: '伐木', emoji: '🪓', cost: { gold: 60, wood: 20 }, production: { type: 'wood', amount: 3, interval: 8 } },
    { id: 'mine', name: '矿场', emoji: '⛏️', cost: { gold: 100, wood: 80 }, production: { type: 'gold', amount: 10, interval: 15 } },
];

interface PlacedBuilding {
    node: Node;
    config: typeof Buildings[0];
    timer: number;
    ready: boolean;
}

/**
 * 游戏主控制器
 * 自动生成UI和处理游戏逻辑
 */
@ccclass('GameController')
export class GameController extends Component {
    
    private _selectedBuilding: typeof Buildings[0] | null = null;
    private _placedBuildings: PlacedBuilding[] = [];
    private _infoLabel: Label | null = null;
    private _buildArea: Node | null = null;
    private _buttons: Node[] = [];

    onLoad() {
        console.log('GameController onLoad!');
        this.createUI();
    }

    start() {
        console.log('GameController start!');
        this.showInfo('🏝️ 欢迎来到小岛物语！选择建筑开始建造');
    }

    /**
     * 自动创建游戏UI
     */
    createUI() {
        const canvas = this.node;
        
        // 1. 创建建造区域（可点击的透明区域）
        this._buildArea = new Node('BuildArea');
        const buildAreaTransform = this._buildArea.addComponent(UITransform);
        buildAreaTransform.setContentSize(new Size(720, 900));
        this._buildArea.setPosition(0, 50, 0);
        canvas.addChild(this._buildArea);
        
        // 监听点击
        this._buildArea.on(Node.EventType.TOUCH_END, this.onBuildAreaClick, this);
        
        // 2. 创建底部菜单背景
        const menuBg = new Node('MenuBg');
        const menuBgTransform = menuBg.addComponent(UITransform);
        menuBgTransform.setContentSize(new Size(720, 150));
        menuBg.setPosition(0, -475, 0);
        canvas.addChild(menuBg);
        
        // 3. 创建4个建筑按钮
        const buttonStartX = -270;
        const buttonSpacing = 180;
        
        for (let i = 0; i < Buildings.length; i++) {
            const building = Buildings[i];
            
            const btnNode = new Node(`Btn_${building.id}`);
            const btnTransform = btnNode.addComponent(UITransform);
            btnTransform.setContentSize(new Size(160, 120));
            btnNode.setPosition(buttonStartX + i * buttonSpacing, -475, 0);
            
            // 按钮文字
            const label = btnNode.addComponent(Label);
            label.string = `${building.emoji}\n${building.name}\n💰${building.cost.gold} 🪵${building.cost.wood}`;
            label.fontSize = 22;
            label.lineHeight = 28;
            label.color = new Color(255, 255, 255, 255);
            
            // 点击事件
            const buildingConfig = building;
            btnNode.on(Node.EventType.TOUCH_END, () => this.selectBuilding(buildingConfig), this);
            
            canvas.addChild(btnNode);
            this._buttons.push(btnNode);
        }
        
        // 4. 创建信息提示标签
        const infoNode = new Node('InfoLabel');
        const infoTransform = infoNode.addComponent(UITransform);
        infoTransform.setContentSize(new Size(600, 50));
        infoNode.setPosition(0, -350, 0);
        
        this._infoLabel = infoNode.addComponent(Label);
        this._infoLabel.string = '';
        this._infoLabel.fontSize = 28;
        this._infoLabel.lineHeight = 35;
        this._infoLabel.color = new Color(255, 255, 200, 255);
        
        canvas.addChild(infoNode);
    }

    /**
     * 选择建筑
     */
    selectBuilding(building: typeof Buildings[0]) {
        const gm = GameManager.instance;
        if (!gm) return;
        
        // 检查资源
        if (gm.gold < building.cost.gold || gm.wood < building.cost.wood) {
            this.showInfo(`❌ 资源不足！需要 💰${building.cost.gold} 🪵${building.cost.wood}`);
            return;
        }
        
        this._selectedBuilding = building;
        this.showInfo(`✅ 选择了 ${building.emoji}${building.name}，点击屏幕放置`);
    }

    /**
     * 点击建造区域放置建筑
     */
    onBuildAreaClick(event: EventTouch) {
        if (!this._selectedBuilding || !this._buildArea) return;
        
        const gm = GameManager.instance;
        if (!gm) return;
        
        const building = this._selectedBuilding;
        
        // 检查资源
        if (gm.gold < building.cost.gold || gm.wood < building.cost.wood) {
            this.showInfo(`❌ 资源不足！`);
            this._selectedBuilding = null;
            return;
        }
        
        // 扣除资源
        gm.gold -= building.cost.gold;
        gm.wood -= building.cost.wood;
        
        // 获取点击位置
        const touchPos = event.getUILocation();
        const transform = this._buildArea.getComponent(UITransform);
        if (!transform) return;
        
        const localPos = transform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        
        // 限制在建造区域内
        localPos.x = Math.max(-300, Math.min(300, localPos.x));
        localPos.y = Math.max(-350, Math.min(350, localPos.y));
        
        // 创建建筑
        const buildingNode = new Node(building.id);
        const label = buildingNode.addComponent(Label);
        label.string = building.emoji;
        label.fontSize = 50;
        label.lineHeight = 60;
        
        buildingNode.addComponent(UITransform).setContentSize(new Size(60, 60));
        buildingNode.setPosition(localPos);
        buildingNode.setScale(0, 0, 1);
        
        this._buildArea.addChild(buildingNode);
        
        // 出现动画
        tween(buildingNode)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
        
        // 房屋增加人口
        if (building.population) {
            gm.population += building.population;
        }
        
        // 添加到已建造列表
        const placed: PlacedBuilding = {
            node: buildingNode,
            config: building,
            timer: 0,
            ready: false
        };
        this._placedBuildings.push(placed);
        
        // 点击收集资源
        buildingNode.on(Node.EventType.TOUCH_END, (e: EventTouch) => {
            e.propagationStopped = true;
            this.collectResource(placed);
        }, this);
        
        this.showInfo(`🎉 ${building.emoji}${building.name} 建造成功！`);
        this._selectedBuilding = null;
        
        gm.saveGame();
    }

    /**
     * 收集资源
     */
    collectResource(placed: PlacedBuilding) {
        const gm = GameManager.instance;
        if (!gm) return;
        
        const config = placed.config;
        
        if (!config.production) {
            this.showInfo(`🏠 这是住宅，提供 ${config.population} 人口`);
            return;
        }
        
        if (!placed.ready) {
            const remaining = config.production.interval - placed.timer;
            this.showInfo(`⏳ ${config.emoji} 还需 ${remaining.toFixed(0)} 秒生产`);
            return;
        }
        
        // 收集资源
        const type = config.production.type as 'gold' | 'wood' | 'food';
        const amount = config.production.amount;
        gm[type] += amount;
        placed.timer = 0;
        placed.ready = false;
        
        const emoji = type === 'gold' ? '💰' : type === 'wood' ? '🪵' : '🍖';
        this.showInfo(`✨ 收集了 ${emoji}+${amount}！`);
        
        // 收集动画
        tween(placed.node)
            .to(0.1, { scale: new Vec3(1.4, 1.4, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
        
        gm.saveGame();
    }

    update(deltaTime: number) {
        // 更新建筑产出计时
        for (const placed of this._placedBuildings) {
            if (placed.config.production && !placed.ready) {
                placed.timer += deltaTime;
                
                if (placed.timer >= placed.config.production.interval) {
                    placed.ready = true;
                }
            }
            
            // 资源准备好了，显示闪烁效果
            if (placed.ready) {
                const pulse = 1 + Math.sin(Date.now() / 150) * 0.15;
                placed.node.setScale(pulse, pulse, 1);
            }
        }
        
        // 更新按钮状态（资源不足时变暗）
        const gm = GameManager.instance;
        if (gm) {
            for (let i = 0; i < this._buttons.length; i++) {
                const btn = this._buttons[i];
                const building = Buildings[i];
                const label = btn.getComponent(Label);
                if (label) {
                    const canAfford = gm.gold >= building.cost.gold && gm.wood >= building.cost.wood;
                    label.color = canAfford 
                        ? new Color(255, 255, 255, 255) 
                        : new Color(128, 128, 128, 255);
                }
            }
        }
    }

    /**
     * 显示提示信息
     */
    showInfo(text: string) {
        if (this._infoLabel) {
            this._infoLabel.string = text;
        }
    }
}
