import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 商店商品配置
 */
const SHOP_ITEMS = [
    // 体力
    { 
        id: 'energy_50', 
        name: '体力 x50', 
        desc: '恢复50点体力', 
        icon: '⚡', 
        give: { energy: 50 },
        cost: { diamond: 5 }
    },
    { 
        id: 'energy_200', 
        name: '体力 x200', 
        desc: '恢复200点体力', 
        icon: '⚡', 
        give: { energy: 200 },
        cost: { diamond: 15 }
    },
    
    // 金币
    { 
        id: 'coin_500', 
        name: '金币 x500', 
        desc: '获得500金币', 
        icon: '💰', 
        give: { coin: 500 },
        cost: { diamond: 10 }
    },
    { 
        id: 'coin_2000', 
        name: '金币 x2000', 
        desc: '获得2000金币', 
        icon: '💰', 
        give: { coin: 2000 },
        cost: { diamond: 35 }
    },
    
    // 礼包
    { 
        id: 'dog_food', 
        name: '狗粮大礼包', 
        desc: '喂食10次的量', 
        icon: '🍖', 
        give: { dogFood: 10 },
        cost: { coin: 80 }
    },
    { 
        id: 'starter_pack', 
        name: '新手礼包', 
        desc: '💎50 💰1000', 
        icon: '🎁', 
        give: { diamond: 50, coin: 1000 },
        cost: { rmb: 1 }  // 人民币
    },
];

interface ShopCost {
    diamond?: number;
    coin?: number;
    rmb?: number;
}

interface ShopGive {
    energy?: number;
    coin?: number;
    diamond?: number;
    dogFood?: number;
}

/**
 * 商店系统 - 复刻 weapp 版（无遮罩，清晰卡片）
 */
@ccclass('ShopSystem')
export class ShopSystem extends Component {
    private container: Node | null = null;
    
    // 玩家资源
    private diamonds: number = 10;
    private coins: number = 405;
    private energy: number = 9994;
    
    // UI引用
    private diamondsLabel: Label | null = null;
    private coinsLabel: Label | null = null;
    private energyLabel: Label | null = null;
    
    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;

    start() {
        console.log('🛒 商店');
        
        const size = view.getDesignResolutionSize();
        this.screenWidth = size.width;
        this.screenHeight = size.height;
        
        this.loadData();
        this.initUI();
    }

    initUI() {
        this.container = new Node('Container');
        this.container.layer = this.node.layer;
        this.container.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        this.node.addChild(this.container);

        this.drawBackground();
        this.drawTopBar();
        this.drawShopItems();
    }

    // =================== 背景 ===================
    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        // 渐变：粉色 → 红色
        const segments = 10;
        const segmentH = this.screenHeight / segments;
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const r = Math.round(230 + (220 - 230) * t);
            const g = Math.round(100 + (80 - 100) * t);
            const b = Math.round(150 + (120 - 150) * t);
            
            graphics.fillColor = new Color(r, g, b);
            graphics.rect(
                -this.screenWidth/2, 
                this.screenHeight/2 - (i + 1) * segmentH, 
                this.screenWidth, 
                segmentH
            );
            graphics.fill();
        }
        
        this.container?.addChild(bg);
    }

    // =================== 顶部栏 ===================
    drawTopBar() {
        const topY = this.screenHeight/2 - 80;
        
        // 返回按钮
        const backBtn = new Node('BackBtn');
        backBtn.layer = this.node.layer;
        backBtn.addComponent(UITransform).setContentSize(80, 40);
        
        const backGfx = backBtn.addComponent(Graphics);
        backGfx.fillColor = new Color(255, 255, 255, 230);
        backGfx.roundRect(-40, -20, 80, 40, 20);
        backGfx.fill();
        
        const backLabel = this.createLabel('返回', 0, 0, 16);
        backLabel.getComponent(Label)!.color = new Color(200, 100, 150);
        backBtn.addChild(backLabel);
        
        backBtn.setPosition(-this.screenWidth/2 + 60, topY, 0);
        backBtn.on(Node.EventType.TOUCH_END, () => {
            this.saveData();
            director.loadScene('MainMenu');
        }, this);
        this.container?.addChild(backBtn);
        
        // 标题
        const title = this.createLabel('🛒 商店', 0, topY, 26);
        this.container?.addChild(title);
        
        // 资源显示
        const resY = topY - 35;
        
        const diamondText = this.createLabel(`💎 ${this.diamonds}`, -100, resY, 16);
        this.diamondsLabel = diamondText.getComponent(Label);
        this.container?.addChild(diamondText);
        
        const coinText = this.createLabel(`💰 ${this.coins}`, 0, resY, 16);
        this.coinsLabel = coinText.getComponent(Label);
        this.container?.addChild(coinText);
        
        const energyText = this.createLabel(`⚡ ${this.energy}`, 100, resY, 16);
        this.energyLabel = energyText.getComponent(Label);
        this.container?.addChild(energyText);
    }

    // =================== 商品列表 ===================
    drawShopItems() {
        const startY = this.screenHeight/2 - 180;
        const cardW = (this.screenWidth - 50) / 2;
        const cardH = 130;
        const gapX = 10;
        const gapY = 15;
        
        SHOP_ITEMS.forEach((item, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            
            const x = -cardW/2 - gapX/2 + col * (cardW + gapX);
            const y = startY - row * (cardH + gapY);
            
            const card = this.createShopCard(item, x, y, cardW, cardH);
            this.container?.addChild(card);
        });
    }

    createShopCard(item: typeof SHOP_ITEMS[0], x: number, y: number, w: number, h: number): Node {
        const card = new Node(`Shop_${item.id}`);
        card.layer = this.node.layer;
        card.addComponent(UITransform).setContentSize(w, h);
        
        // 卡片背景 - 浅粉色，不透明
        const gfx = card.addComponent(Graphics);
        gfx.fillColor = new Color(255, 200, 220);  // 浅粉色，完全不透明
        gfx.roundRect(-w/2, -h/2, w, h, 12);
        gfx.fill();
        
        // 边框
        gfx.strokeColor = new Color(255, 150, 180);
        gfx.lineWidth = 2;
        gfx.roundRect(-w/2, -h/2, w, h, 12);
        gfx.stroke();
        
        // 图标
        const icon = this.createLabel(item.icon, -w/2 + 40, 25, 32);
        card.addChild(icon);
        
        // 商品名称
        const nameLabel = this.createLabel(item.name, 20, 30, 18);
        nameLabel.getComponent(Label)!.color = new Color(80, 50, 70);
        card.addChild(nameLabel);
        
        // 描述
        const descLabel = this.createLabel(item.desc, 20, 5, 12);
        descLabel.getComponent(Label)!.color = new Color(120, 90, 100);
        card.addChild(descLabel);
        
        // 价格
        const priceText = this.formatCost(item.cost);
        const priceLabel = this.createLabel(priceText, 0, -35, 16);
        priceLabel.getComponent(Label)!.color = new Color(50, 150, 200);
        card.addChild(priceLabel);
        
        card.setPosition(x, y, 0);
        
        // 点击购买
        card.on(Node.EventType.TOUCH_START, () => {
            tween(card).to(0.05, { scale: new Vec3(0.95, 0.95, 1) }).start();
        }, this);
        card.on(Node.EventType.TOUCH_END, () => {
            tween(card).to(0.1, { scale: new Vec3(1, 1, 1) }).call(() => {
                this.buyItem(item);
            }).start();
        }, this);
        card.on(Node.EventType.TOUCH_CANCEL, () => {
            tween(card).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
        }, this);
        
        return card;
    }

    formatCost(cost: ShopCost): string {
        if (cost.diamond) return `💎 ${cost.diamond}`;
        if (cost.coin) return `💰 ${cost.coin}`;
        if (cost.rmb) return `¥${cost.rmb}`;
        return '';
    }

    buyItem(item: typeof SHOP_ITEMS[0]) {
        // 检查是否能购买
        if (item.cost.diamond && this.diamonds < item.cost.diamond) {
            this.showToast('💎 钻石不足！');
            return;
        }
        if (item.cost.coin && this.coins < item.cost.coin) {
            this.showToast('💰 金币不足！');
            return;
        }
        if (item.cost.rmb) {
            this.showToast('💳 支付功能开发中...');
            return;
        }
        
        // 扣除费用
        if (item.cost.diamond) this.diamonds -= item.cost.diamond;
        if (item.cost.coin) this.coins -= item.cost.coin;
        
        // 发放奖励
        let rewardText = '';
        if (item.give.energy) {
            this.energy += item.give.energy;
            rewardText += `+${item.give.energy}⚡ `;
        }
        if (item.give.coin) {
            this.coins += item.give.coin;
            rewardText += `+${item.give.coin}💰 `;
        }
        if (item.give.diamond) {
            this.diamonds += item.give.diamond;
            rewardText += `+${item.give.diamond}💎 `;
        }
        if (item.give.dogFood) {
            rewardText += `+${item.give.dogFood}🍖 `;
        }
        
        this.updateResourceUI();
        this.saveData();
        this.showToast(`🎉 购买成功！${rewardText}`);
    }

    updateResourceUI() {
        if (this.diamondsLabel) this.diamondsLabel.string = `💎 ${this.diamonds}`;
        if (this.coinsLabel) this.coinsLabel.string = `💰 ${this.coins}`;
        if (this.energyLabel) this.energyLabel.string = `⚡ ${this.energy}`;
    }

    showToast(text: string) {
        const toast = new Node('Toast');
        toast.layer = this.node.layer;
        const gfx = toast.addComponent(Graphics);
        toast.addComponent(UITransform).setContentSize(300, 50);
        
        gfx.fillColor = new Color(0, 0, 0, 220);
        gfx.roundRect(-150, -25, 300, 50, 10);
        gfx.fill();
        
        const label = this.createLabel(text, 0, 0, 15);
        toast.addChild(label);
        
        toast.setPosition(0, 0, 0);
        toast.setScale(new Vec3(0, 0, 1));
        this.container?.addChild(toast);
        
        tween(toast)
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .delay(1.5)
            .to(0.2, { scale: new Vec3(0, 0, 1) })
            .call(() => toast.destroy())
            .start();
    }

    // =================== 存档 ===================
    saveData() {
        try {
            // 保存到全局存档
            const saved = localStorage.getItem('island_merge_save');
            const data = saved ? JSON.parse(saved) : {};
            data.diamonds = this.diamonds;
            data.coins = this.coins;
            data.energy = this.energy;
            localStorage.setItem('island_merge_save', JSON.stringify(data));
        } catch (e) {
            console.error('保存失败:', e);
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('island_merge_save');
            if (saved) {
                const data = JSON.parse(saved);
                this.diamonds = data.diamonds ?? 10;
                this.coins = data.coins ?? 405;
                this.energy = data.energy ?? 100;
            }
        } catch (e) {
            console.error('加载失败:', e);
        }
    }

    // =================== 工具 ===================
    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(200, fontSize + 10);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 5;
        label.color = Color.WHITE;
        node.setPosition(x, y, 0);
        return node;
    }
}
