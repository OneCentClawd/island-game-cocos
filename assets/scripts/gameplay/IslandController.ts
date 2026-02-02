import { _decorator, Component, Node, Prefab, instantiate, Vec3, UITransform, view } from 'cc';
import { Building, BuildingType } from './Building';
import { GameManager } from '../managers/GameManager';
const { ccclass, property } = _decorator;

/**
 * 小岛控制器
 * 管理建筑放置和岛屿交互
 */
@ccclass('IslandController')
export class IslandController extends Component {
    
    @property(Prefab)
    public buildingPrefab: Prefab | null = null;
    
    @property(Node)
    public buildingsContainer: Node | null = null;

    // 已建造的建筑
    private _buildings: Building[] = [];
    
    // 当前选择要建造的建筑类型
    private _selectedBuildingType: BuildingType | null = null;

    start() {
        // 监听触摸事件
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    /**
     * 选择要建造的建筑类型
     */
    selectBuilding(type: BuildingType) {
        if (Building.canBuild(type)) {
            this._selectedBuildingType = type;
            console.log(`选择建造: ${Building.getConfig(type)?.name}`);
        } else {
            console.log('资源不足！');
        }
    }

    /**
     * 取消选择
     */
    cancelSelection() {
        this._selectedBuildingType = null;
    }

    /**
     * 触摸放置建筑
     */
    onTouchEnd(event: any) {
        if (!this._selectedBuildingType || !this.buildingPrefab || !this.buildingsContainer) {
            return;
        }

        const gm = GameManager.instance;
        if (!gm) return;

        const config = Building.getConfig(this._selectedBuildingType);
        if (!config) return;

        // 扣除资源
        if (!gm.spendResource('gold', config.cost.gold)) return;
        if (!gm.spendResource('wood', config.cost.wood)) {
            // 退还金币
            gm.addResource('gold', config.cost.gold);
            return;
        }

        // 获取触摸位置
        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
        
        // 转换到容器本地坐标
        const uiTransform = this.buildingsContainer.getComponent(UITransform);
        if (uiTransform) {
            const localPos = uiTransform.convertToNodeSpaceAR(worldPos);
            
            // 创建建筑
            const buildingNode = instantiate(this.buildingPrefab);
            buildingNode.setPosition(localPos);
            this.buildingsContainer.addChild(buildingNode);
            
            // 设置建筑组件
            const building = buildingNode.getComponent(Building);
            if (building) {
                building.buildingType = this._selectedBuildingType;
                this._buildings.push(building);
                
                // 如果是房屋，增加人口
                if (config.population) {
                    gm.population += config.population;
                }
            }
        }

        // 清除选择
        this._selectedBuildingType = null;
        
        console.log('建筑建造成功！');
    }

    /**
     * 获取所有建筑
     */
    getBuildings(): Building[] {
        return this._buildings;
    }

    /**
     * 获取建筑数量
     */
    getBuildingCount(type?: BuildingType): number {
        if (type) {
            return this._buildings.filter(b => b.buildingType === type).length;
        }
        return this._buildings.length;
    }
}
