import { _decorator, Component, Label } from 'cc';
import { GameManager } from '../managers/GameManager';
const { ccclass, property } = _decorator;

/**
 * 资源显示UI
 */
@ccclass('ResourceUI')
export class ResourceUI extends Component {
    
    @property(Label)
    public goldLabel: Label | null = null;
    
    @property(Label)
    public woodLabel: Label | null = null;
    
    @property(Label)
    public foodLabel: Label | null = null;
    
    @property(Label)
    public populationLabel: Label | null = null;

    update(deltaTime: number) {
        this.updateDisplay();
    }

    updateDisplay() {
        const gm = GameManager.instance;
        if (!gm) return;
        
        if (this.goldLabel) {
            this.goldLabel.string = `💰 ${gm.gold}`;
        }
        if (this.woodLabel) {
            this.woodLabel.string = `🪵 ${gm.wood}`;
        }
        if (this.foodLabel) {
            this.foodLabel.string = `🍖 ${gm.food}`;
        }
        if (this.populationLabel) {
            this.populationLabel.string = `👥 ${gm.population}`;
        }
    }
}
