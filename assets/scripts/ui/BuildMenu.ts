import { _decorator, Component, Node, Button, Label, instantiate, Prefab, Vec3, UITransform, EventTouch, Sprite, Color } from 'cc';
import { GameManager } from '../managers/GameManager';
const { ccclass, property } = _decorator;

/**
 * 建筑类型配置
 */
const Buildings = [
    { id: 'house', name: '房屋', emoji: '🏠', cost: { gold: 50, wood: 30 }, desc: '增加人口' },
    { id: 'farm', name: '农场', emoji: '🌾', cost: { gold: 80, wood: 50 }, desc: '产出食物', production: { type: 'food', amount: 5, interval: 10 } },
    { id: 'lumber', name: '伐木场', emoji: '🪓', cost: { gold: 60, wood: 20 }, desc: '产出木材', production: { type: 'wood', amount: 3, interval: 8 } },
    { id: 'mine', name: '矿场', emoji: '⛏️', cost: { gold: 100, wood: 80 }, desc: '产出金币', production: { type: 'gold', amount: 10, interval: 15 } },
];

/**
 * 建筑菜单UI
 */
@ccclass('BuildMenu')
export class BuildMenu extends Component {
    
    @property(Node)
    public buildArea: Node | null = null;  // 可建造区域
    
    @property(Node)
    public menuPanel: Node | null = null;  // 菜单面板
    
    @property(Label)
    public infoLabel: Label | null = null; // 信息提示
    
    // 当前选中的建筑类型
    private _selectedBuilding: typeof Buildings[0] | null = null;
    
    // 已建造的建筑列表
    private _placedBuildings: { node: Node, config: typeof Buildings[0], timer: number }[] = [];

    start() {
        // 监听建造区域的点击
        if (this.buildArea) {
            this.buildArea.on(Node.EventType.TOUCH_END, this.onBuildAreaClick, this);
        }
        
        this.showInfo('选择一个建筑开始建造！');
    }

    /**
     * 选择建筑（由按钮调用）
     */
    selectBuilding(event: Event, buildingId: string) {
        const building = Buildings.find(b => b.id === buildingId);
        if (!building) return;
        
        const gm = GameManager.instance;
        if (!gm) return;
        
        // 检查资源
        if (gm.gold < building.cost.gold || gm.wood < building.cost.wood) {
            this.showInfo(`❌ 资源不足！需要 💰${building.cost.gold} 🪵${building.cost.wood}`);
            return;
        }
        
        this._selectedBuilding = building;
        this.showInfo(`✅ 已选择 ${building.emoji}${building.name}，点击空地建造`);
    }
    
    /**
     * 点击建造区域
     */
    onBuildAreaClick(event: EventTouch) {
        if (!this._selectedBuilding || !this.buildArea) return;
        
        const gm = GameManager.instance;
        if (!gm) return;
        
        const building = this._selectedBuilding;
        
        // 再次检查资源
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
        const uiTransform = this.buildArea.getComponent(UITransform);
        if (!uiTransform) return;
        
        const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        
        // 创建建筑节点
        const buildingNode = new Node(building.id);
        const label = buildingNode.addComponent(Label);
        label.string = building.emoji;
        label.fontSize = 60;
        label.lineHeight = 70;
        
        buildingNode.setPosition(localPos);
        this.buildArea.addChild(buildingNode);
        
        // 如果是房屋，增加人口
        if (building.id === 'house') {
            gm.population += 2;
        }
        
        // 添加到列表
        this._placedBuildings.push({
            node: buildingNode,
            config: building,
            timer: 0
        });
        
        // 点击建筑收集资源
        buildingNode.on(Node.EventType.TOUCH_END, () => this.onBuildingClick(buildingNode, building), this);
        
        this.showInfo(`🎉 ${building.emoji}${building.name} 建造成功！`);
        this._selectedBuilding = null;
        
        gm.saveGame();
    }
    
    /**
     * 点击建筑收集资源
     */
    onBuildingClick(node: Node, config: typeof Buildings[0]) {
        const gm = GameManager.instance;
        if (!gm || !config.production) return;
        
        const placed = this._placedBuildings.find(b => b.node === node);
        if (!placed || placed.timer < config.production.interval) {
            const remaining = config.production.interval - (placed?.timer || 0);
            this.showInfo(`⏳ ${config.emoji} 还需 ${remaining.toFixed(0)} 秒`);
            return;
        }
        
        // 收集资源
        const type = config.production.type as 'gold' | 'wood' | 'food';
        const amount = config.production.amount;
        gm[type] += amount;
        placed.timer = 0;
        
        const emoji = type === 'gold' ? '💰' : type === 'wood' ? '🪵' : '🍖';
        this.showInfo(`✨ 收集了 ${emoji}+${amount}！`);
        
        // 跳动动画
        node.setScale(1.3, 1.3, 1);
        this.scheduleOnce(() => {
            node.setScale(1, 1, 1);
        }, 0.1);
        
        gm.saveGame();
    }
    
    update(deltaTime: number) {
        // 更新所有建筑的计时器
        for (const placed of this._placedBuildings) {
            if (placed.config.production) {
                placed.timer += deltaTime;
                
                // 如果资源满了，显示提示（闪烁效果）
                if (placed.timer >= placed.config.production.interval) {
                    const scale = 1 + Math.sin(Date.now() / 200) * 0.1;
                    placed.node.setScale(scale, scale, 1);
                }
            }
        }
    }
    
    /**
     * 显示提示信息
     */
    showInfo(text: string) {
        if (this.infoLabel) {
            this.infoLabel.string = text;
        }
        console.log(text);
    }
    
    /**
     * 获取建筑配置（供按钮使用）
     */
    static getBuildings() {
        return Buildings;
    }
}
