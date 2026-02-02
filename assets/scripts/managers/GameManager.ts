import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 游戏主管理器
 * 负责全局状态和游戏流程控制
 */
@ccclass('GameManager')
export class GameManager extends Component {
    
    private static _instance: GameManager | null = null;
    
    public static get instance(): GameManager {
        return this._instance!;
    }

    // 游戏数据
    @property
    public gold: number = 100;      // 金币
    
    @property
    public wood: number = 50;       // 木材
    
    @property
    public food: number = 30;       // 食物
    
    @property
    public population: number = 0;  // 人口

    onLoad() {
        if (GameManager._instance) {
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
        // 保持跨场景不销毁
        // director.addPersistRootNode(this.node);
        
        this.loadGame();
    }

    start() {
        console.log('🏝️ 小岛物语启动！');
        console.log(`金币: ${this.gold}, 木材: ${this.wood}, 食物: ${this.food}`);
    }

    /**
     * 加载存档
     */
    loadGame() {
        const saveData = localStorage.getItem('island_save');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.gold = data.gold ?? 100;
                this.wood = data.wood ?? 50;
                this.food = data.food ?? 30;
                this.population = data.population ?? 0;
                console.log('📂 存档加载成功');
            } catch (e) {
                console.warn('存档损坏，使用默认值');
            }
        }
    }

    /**
     * 保存游戏
     */
    saveGame() {
        const data = {
            gold: this.gold,
            wood: this.wood,
            food: this.food,
            population: this.population,
            timestamp: Date.now()
        };
        localStorage.setItem('island_save', JSON.stringify(data));
        console.log('💾 游戏已保存');
    }

    /**
     * 增加资源
     */
    addResource(type: 'gold' | 'wood' | 'food', amount: number) {
        this[type] += amount;
        this.saveGame();
    }

    /**
     * 消耗资源
     */
    spendResource(type: 'gold' | 'wood' | 'food', amount: number): boolean {
        if (this[type] >= amount) {
            this[type] -= amount;
            this.saveGame();
            return true;
        }
        return false;
    }

    /**
     * 检查资源是否足够
     */
    hasResource(type: 'gold' | 'wood' | 'food', amount: number): boolean {
        return this[type] >= amount;
    }
}
