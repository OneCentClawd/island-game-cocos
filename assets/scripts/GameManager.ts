import { _decorator, Component, Node, director, game } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 全局游戏管理器
 * 负责场景切换和数据共享
 */
@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager | null = null;

    public static get instance(): GameManager | null {
        return GameManager._instance;
    }

    onLoad() {
        // 单例模式，保证只有一个实例
        if (GameManager._instance) {
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
        // 切换场景时不销毁
        game.addPersistRootNode(this.node);
    }

    // =================== 场景切换 ===================
    
    /**
     * 切换到指定场景
     */
    static goToScene(sceneName: string) {
        console.log(`切换场景: ${sceneName}`);
        director.loadScene(sceneName);
    }

    /**
     * 返回主菜单
     */
    static goToMainMenu() {
        GameManager.goToScene('MainMenu');
    }

    /**
     * 进入消消乐
     */
    static goToMatch3() {
        GameManager.goToScene('Match3');
    }

    /**
     * 进入合成游戏
     */
    static goToMerge() {
        GameManager.goToScene('MergeGame');
    }

    /**
     * 进入小岛
     */
    static goToIsland() {
        GameManager.goToScene('Island');
    }

    /**
     * 进入商店
     */
    static goToShop() {
        GameManager.goToScene('Shop');
    }

    /**
     * 进入成就
     */
    static goToAchievements() {
        GameManager.goToScene('Achievements');
    }

    /**
     * 进入每日任务
     */
    static goToDailyTask() {
        GameManager.goToScene('DailyTask');
    }

    /**
     * 进入排行榜
     */
    static goToLeaderboard() {
        GameManager.goToScene('Leaderboard');
    }

    /**
     * 进入设置
     */
    static goToSettings() {
        GameManager.goToScene('Settings');
    }

    // =================== 全局数据 ===================
    
    /**
     * 获取金币
     */
    static getCoins(): number {
        try {
            return parseInt(localStorage.getItem('island_coins') || '100');
        } catch (e) {
            return 100;
        }
    }

    /**
     * 设置金币
     */
    static setCoins(value: number) {
        try {
            localStorage.setItem('island_coins', value.toString());
        } catch (e) {}
    }

    /**
     * 增加金币
     */
    static addCoins(amount: number) {
        GameManager.setCoins(GameManager.getCoins() + amount);
    }

    /**
     * 获取钻石
     */
    static getDiamonds(): number {
        try {
            return parseInt(localStorage.getItem('island_diamonds') || '5');
        } catch (e) {
            return 5;
        }
    }

    /**
     * 设置钻石
     */
    static setDiamonds(value: number) {
        try {
            localStorage.setItem('island_diamonds', value.toString());
        } catch (e) {}
    }

    /**
     * 增加钻石
     */
    static addDiamonds(amount: number) {
        GameManager.setDiamonds(GameManager.getDiamonds() + amount);
    }
}
