import { _decorator, Component, Node, Vec3, tween } from 'cc';
import { GameManager } from '../managers/GameManager';
const { ccclass, property } = _decorator;

/**
 * 建筑类型
 */
export enum BuildingType {
    HOUSE = 'house',        // 房屋 - 增加人口
    FARM = 'farm',          // 农场 - 产出食物
    LUMBER = 'lumber',      // 伐木场 - 产出木材
    MINE = 'mine',          // 矿场 - 产出金币
    SHOP = 'shop'           // 商店
}

/**
 * 建筑配置
 */
const BuildingConfig: Record<BuildingType, {
    name: string;
    cost: { gold: number; wood: number };
    production?: { type: 'gold' | 'wood' | 'food'; amount: number; interval: number };
    population?: number;
}> = {
    [BuildingType.HOUSE]: {
        name: '房屋',
        cost: { gold: 50, wood: 30 },
        population: 2
    },
    [BuildingType.FARM]: {
        name: '农场',
        cost: { gold: 80, wood: 50 },
        production: { type: 'food', amount: 5, interval: 10 }
    },
    [BuildingType.LUMBER]: {
        name: '伐木场',
        cost: { gold: 60, wood: 20 },
        production: { type: 'wood', amount: 3, interval: 8 }
    },
    [BuildingType.MINE]: {
        name: '矿场',
        cost: { gold: 100, wood: 80 },
        production: { type: 'gold', amount: 10, interval: 15 }
    },
    [BuildingType.SHOP]: {
        name: '商店',
        cost: { gold: 200, wood: 100 }
    }
};

/**
 * 建筑组件
 */
@ccclass('Building')
export class Building extends Component {
    
    @property
    public buildingType: string = BuildingType.HOUSE;
    
    @property
    public level: number = 1;

    private _timer: number = 0;
    private _config: typeof BuildingConfig[BuildingType.HOUSE] | null = null;

    onLoad() {
        this._config = BuildingConfig[this.buildingType as BuildingType];
    }

    start() {
        // 建造动画
        this.node.setScale(0, 0, 0);
        tween(this.node)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }

    update(deltaTime: number) {
        if (!this._config?.production) return;
        
        this._timer += deltaTime;
        if (this._timer >= this._config.production.interval) {
            this._timer = 0;
            this.produce();
        }
    }

    /**
     * 产出资源
     */
    produce() {
        if (!this._config?.production) return;
        
        const gm = GameManager.instance;
        if (!gm) return;
        
        const { type, amount } = this._config.production;
        gm.addResource(type, amount * this.level);
        
        // 产出动画效果（跳一下）
        tween(this.node)
            .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    /**
     * 升级建筑
     */
    upgrade(): boolean {
        const gm = GameManager.instance;
        if (!gm || !this._config) return false;
        
        const upgradeCost = {
            gold: this._config.cost.gold * this.level,
            wood: this._config.cost.wood * this.level
        };
        
        if (gm.hasResource('gold', upgradeCost.gold) && 
            gm.hasResource('wood', upgradeCost.wood)) {
            gm.spendResource('gold', upgradeCost.gold);
            gm.spendResource('wood', upgradeCost.wood);
            this.level++;
            
            // 升级动画
            tween(this.node)
                .to(0.2, { scale: new Vec3(1.5, 1.5, 1) })
                .to(0.2, { scale: new Vec3(1, 1, 1) })
                .start();
            
            return true;
        }
        return false;
    }

    /**
     * 获取建筑信息
     */
    getInfo(): string {
        if (!this._config) return '';
        return `${this._config.name} Lv.${this.level}`;
    }

    /**
     * 静态方法：获取建筑配置
     */
    static getConfig(type: BuildingType) {
        return BuildingConfig[type];
    }

    /**
     * 静态方法：检查是否能建造
     */
    static canBuild(type: BuildingType): boolean {
        const gm = GameManager.instance;
        if (!gm) return false;
        
        const config = BuildingConfig[type];
        return gm.hasResource('gold', config.cost.gold) && 
               gm.hasResource('wood', config.cost.wood);
    }
}
