import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 商店物品配置
 */
const SHOP_ITEMS = [
    // 道具
    { id: 'bomb', category: 'tool', name: '炸弹', emoji: '💣', desc: '消除周围3x3范围', price: { coin: 100 } },
    { id: 'rainbow', category: 'tool', name: '彩虹球', emoji: '🌈', desc: '消除所有同类宝石', price: { coin: 150 } },
    { id: 'hammer', category: 'tool', name: '锤子', emoji: '🔨', desc: '消除单个宝石', price: { coin: 50 } },
    // 食物
    { id: 'bone', category: 'food', name: '骨头', emoji: '🦴', desc: '喂食小狗+50饱腹', price: { coin: 80 } },
    { id: 'meat', category: 'food', name: '肉肉', emoji: '🥩', desc: '喂食小狗+80饱腹', price: { coin: 120 } },
    { id: 'cake', category: 'food', name: '蛋糕', emoji: '🎂', desc: '小狗最爱！', price: { coin: 200 } },
    // 装饰
    { id: 'tree', category: 'deco', name: '大树', emoji: '🌳', desc: '小岛装饰', price: { coin: 150 } },
    { id: 'flower', category: 'deco', name: '花丛', emoji: '🌸', desc: '小岛装饰', price: { coin: 100 } },
    { id: 'fountain', category: 'deco', name: '喷泉', emoji: '⛲', desc: '小岛装饰', price: { diamond: 5 } },
    // 礼包
    { id: 'starter_pack', category: 'pack', name: '新手礼包', emoji: '🎁', desc: '500金币+3钻石', price: { diamond: 1 } },
    { id: 'coin_pack', category: 'pack', name: '金币礼包', emoji: '💰', desc: '1000金币', price: { diamond: 5 } },
];

const CATEGORIES = [
    { key: 'tool', name: '道具' },
    { key: 'food', name: '食物' },
    { key: 'deco', name: '装饰' },
    { key: 'pack', name: '礼包' },
];

/**
 * 商店系统
 */
@ccclass('ShopSystem')
export class ShopSystem extends Component {
    private container: Node | null = null;
    private currentCategory: string = 'tool';
    private coins: number = 0;
    private diamonds: number = 0;

    start() {
        console.log('🏪 商店系统');
        this.loadData();
        this.showShop();
    }

    showShop() {
        this.clearAll();

        this.container = new Node('Container');
        this.container.layer = this.node.layer;
        this.container.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(this.container);

        // 背景
        const bg = new Node('Bg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);
        graphics.fillColor = new Color(233, 30, 99);
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();
        this.container.addChild(bg);

        // 标题
        const title = this.createLabel('🏪 商店', 0, 330, 36);
        this.container.addChild(title);

        // 资源显示
        const resBar = new Node('ResBar');
        resBar.layer = this.node.layer;
        resBar.addComponent(UITransform).setContentSize(300, 40);
        resBar.setPosition(0, 280, 0);
        this.container.addChild(resBar);

        const coinsLabel = this.createLabel(`💰 ${this.coins}`, -60, 0, 20);
        resBar.addChild(coinsLabel);

        const diamondsLabel = this.createLabel(`💎 ${this.diamonds}`, 60, 0, 20);
        resBar.addChild(diamondsLabel);

        // 分类Tab
        this.createCategoryTabs();

        // 商品列表
        this.createItemList();

        // 返回按钮
        const backBtn = this.createButton('返回', 0, -350, 120, 50, () => {
            // 返回主菜单或小岛
        });
        this.container.addChild(backBtn);
    }

    createCategoryTabs() {
        const tabWidth = 80;
        const startX = -(CATEGORIES.length - 1) * tabWidth / 2;

        CATEGORIES.forEach((cat, i) => {
            const x = startX + i * tabWidth;
            const isActive = cat.key === this.currentCategory;
            
            const tab = new Node('Tab');
            tab.layer = this.node.layer;
            tab.addComponent(UITransform).setContentSize(75, 35);
            
            const graphics = tab.addComponent(Graphics);
            graphics.fillColor = isActive ? new Color(255, 255, 255, 100) : new Color(0, 0, 0, 50);
            graphics.roundRect(-37, -17, 75, 35, 8);
            graphics.fill();

            const label = this.createLabel(cat.name, 0, 0, 16);
            tab.addChild(label);

            tab.setPosition(x, 230, 0);
            tab.on(Node.EventType.TOUCH_END, () => {
                this.currentCategory = cat.key;
                this.showShop();
            }, this);

            this.container?.addChild(tab);
        });
    }

    createItemList() {
        const items = SHOP_ITEMS.filter(item => item.category === this.currentCategory);
        
        const listBg = new Node('ListBg');
        listBg.layer = this.node.layer;
        const graphics = listBg.addComponent(Graphics);
        listBg.addComponent(UITransform).setContentSize(360, 380);
        graphics.fillColor = new Color(0, 0, 0, 100);
        graphics.roundRect(-180, -190, 360, 380, 12);
        graphics.fill();
        listBg.setPosition(0, -20, 0);
        this.container?.addChild(listBg);

        const startY = 150;
        const itemHeight = 75;

        items.forEach((item, i) => {
            const y = startY - i * itemHeight;
            const shopItem = this.createShopItem(item, y);
            listBg.addChild(shopItem);
        });
    }

    createShopItem(item: typeof SHOP_ITEMS[0], y: number): Node {
        const node = new Node(`Item_${item.id}`);
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(340, 65);
        
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(255, 255, 255, 30);
        graphics.roundRect(-170, -32, 340, 65, 10);
        graphics.fill();

        // 图标
        const icon = this.createLabel(item.emoji, -130, 0, 35);
        node.addChild(icon);

        // 名称
        const name = this.createLabel(item.name, -50, 12, 18);
        node.addChild(name);

        // 描述
        const desc = this.createLabel(item.desc, -50, -12, 12);
        desc.getComponent(Label)!.color = new Color(200, 200, 200);
        node.addChild(desc);

        // 价格和购买按钮
        const priceText = item.price.coin ? `${item.price.coin}💰` : `${item.price.diamond}💎`;
        const canAfford = item.price.coin ? this.coins >= item.price.coin : this.diamonds >= (item.price.diamond || 0);
        
        const buyBtn = this.createButton(priceText, 130, 0, 70, 40, () => {
            this.buyItem(item);
        });
        if (!canAfford) {
            buyBtn.getComponent(Graphics)!.fillColor = new Color(100, 100, 100, 200);
        }
        node.addChild(buyBtn);

        node.setPosition(0, y, 0);
        return node;
    }

    buyItem(item: typeof SHOP_ITEMS[0]) {
        // 检查是否买得起
        if (item.price.coin && this.coins < item.price.coin) {
            console.log('金币不足');
            return;
        }
        if (item.price.diamond && this.diamonds < (item.price.diamond || 0)) {
            console.log('钻石不足');
            return;
        }

        // 扣钱
        if (item.price.coin) this.coins -= item.price.coin;
        if (item.price.diamond) this.diamonds -= (item.price.diamond || 0);

        // 发放物品
        this.giveItem(item);

        this.saveData();
        this.showShop(); // 刷新

        console.log(`购买成功: ${item.name}`);
    }

    giveItem(item: typeof SHOP_ITEMS[0]) {
        try {
            if (typeof localStorage === 'undefined') return;

            switch (item.category) {
                case 'tool':
                    // 增加道具数量
                    const toolCount = parseInt(localStorage.getItem(`tool_${item.id}`) || '0') + 1;
                    localStorage.setItem(`tool_${item.id}`, toolCount.toString());
                    break;
                case 'food':
                    // 增加食物数量
                    const foodCount = parseInt(localStorage.getItem(`food_${item.id}`) || '0') + 1;
                    localStorage.setItem(`food_${item.id}`, foodCount.toString());
                    break;
                case 'deco':
                    // 解锁装饰
                    localStorage.setItem(`deco_${item.id}`, 'true');
                    break;
                case 'pack':
                    // 礼包内容
                    if (item.id === 'starter_pack') {
                        this.coins += 500;
                        this.diamonds += 3;
                    } else if (item.id === 'coin_pack') {
                        this.coins += 1000;
                    }
                    break;
            }
        } catch (e) {}
    }

    saveData() {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem('island_coins', this.coins.toString());
            localStorage.setItem('island_diamonds', this.diamonds.toString());
        } catch (e) {}
    }

    loadData() {
        try {
            if (typeof localStorage === 'undefined') return;
            this.coins = parseInt(localStorage.getItem('island_coins') || '100');
            this.diamonds = parseInt(localStorage.getItem('island_diamonds') || '5');
        } catch (e) {}
    }

    clearAll() {
        this.container?.destroy();
        this.container = null;
    }

    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(200, fontSize + 20);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 10;
        label.color = Color.WHITE;
        node.setPosition(x, y, 0);
        return node;
    }

    createButton(text: string, x: number, y: number, width: number, height: number, callback: () => void): Node {
        const node = new Node('Button');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(width, height);
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(80, 150, 255, 230);
        graphics.roundRect(-width/2, -height/2, width, height, 8);
        graphics.fill();
        const labelNode = this.createLabel(text, 0, 0, 14);
        node.addChild(labelNode);
        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);
        return node;
    }
}
