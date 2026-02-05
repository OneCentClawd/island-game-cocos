import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics, director, view, EditBox } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 设置系统 - 复刻 weapp 版
 */
@ccclass('SettingsSystem')
export class SettingsSystem extends Component {
    private container: Node | null = null;
    private nicknameLabel: Label | null = null;
    
    // 玩家昵称
    private nickname: string = 'Jack';
    
    // 版本号
    private version: string = 'v0.3.1';
    
    // 屏幕尺寸
    private screenWidth: number = 750;
    private screenHeight: number = 1334;

    start() {
        console.log('⚙️ 设置');
        
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
        this.drawSettingButtons();
        this.drawVersionInfo();
    }

    // =================== 背景 ===================
    drawBackground() {
        const bg = new Node('Background');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        // 渐变：青绿 → 深蓝
        const segments = 10;
        const segmentH = this.screenHeight / segments;
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const r = Math.round(80 + (30 - 80) * t);
            const g = Math.round(180 + (100 - 180) * t);
            const b = Math.round(160 + (150 - 160) * t);
            
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
        backLabel.getComponent(Label)!.color = new Color(80, 160, 150);
        backBtn.addChild(backLabel);
        
        backBtn.setPosition(-this.screenWidth/2 + 60, topY, 0);
        backBtn.on(Node.EventType.TOUCH_END, () => {
            this.saveData();
            director.loadScene('MainMenu');
        }, this);
        this.container?.addChild(backBtn);
        
        // 标题
        const title = this.createLabel('⚙️ 设置', 0, topY, 26);
        this.container?.addChild(title);
        
        // 当前昵称
        const nicknameText = this.createLabel(`当前昵称: ${this.nickname}`, 0, topY - 35, 15);
        nicknameText.getComponent(Label)!.color = new Color(200, 220, 210);
        this.nicknameLabel = nicknameText.getComponent(Label);
        this.container?.addChild(nicknameText);
    }

    // =================== 设置按钮 ===================
    drawSettingButtons() {
        const startY = this.screenHeight/2 - 220;
        const btnW = this.screenWidth - 80;
        const btnH = 60;
        const gap = 20;
        
        // 修改昵称按钮
        const editBtn = this.createSettingButton(
            '✏️ 修改昵称',
            0, startY,
            btnW, btnH,
            new Color(140, 200, 180),  // 浅绿色
            () => this.showEditNicknameDialog()
        );
        this.container?.addChild(editBtn);
        
        // 清除缓存按钮
        const clearBtn = this.createSettingButton(
            '🗑️ 清除缓存',
            0, startY - (btnH + gap),
            btnW, btnH,
            new Color(140, 190, 175),  // 浅绿色
            () => this.clearCache()
        );
        this.container?.addChild(clearBtn);
        
        // 重置存档按钮
        const resetBtn = this.createSettingButton(
            '⚠️ 重置存档',
            0, startY - 2 * (btnH + gap),
            btnW, btnH,
            new Color(130, 140, 150),  // 灰色（危险操作）
            () => this.showResetConfirm()
        );
        this.container?.addChild(resetBtn);
    }

    createSettingButton(text: string, x: number, y: number, w: number, h: number, color: Color, callback: () => void): Node {
        const btn = new Node('SettingButton');
        btn.layer = this.node.layer;
        btn.addComponent(UITransform).setContentSize(w, h);
        
        const gfx = btn.addComponent(Graphics);
        gfx.fillColor = color;
        gfx.roundRect(-w/2, -h/2, w, h, 12);
        gfx.fill();
        
        const label = this.createLabel(text, 0, 0, 18);
        btn.addChild(label);
        
        btn.setPosition(x, y, 0);
        
        // 点击效果
        btn.on(Node.EventType.TOUCH_START, () => {
            tween(btn).to(0.05, { scale: new Vec3(0.98, 0.98, 1) }).start();
        }, this);
        btn.on(Node.EventType.TOUCH_END, () => {
            tween(btn).to(0.1, { scale: new Vec3(1, 1, 1) }).call(callback).start();
        }, this);
        btn.on(Node.EventType.TOUCH_CANCEL, () => {
            tween(btn).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
        }, this);
        
        return btn;
    }

    // =================== 版本信息 ===================
    drawVersionInfo() {
        const versionLabel = this.createLabel(`小岛物语 ${this.version}`, 0, -this.screenHeight/2 + 80, 14);
        versionLabel.getComponent(Label)!.color = new Color(150, 180, 180);
        this.container?.addChild(versionLabel);
    }

    // =================== 功能实现 ===================
    
    showEditNicknameDialog() {
        // 创建弹窗
        const overlay = new Node('Overlay');
        overlay.layer = this.node.layer;
        overlay.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        // 半透明背景
        const overlayGfx = overlay.addComponent(Graphics);
        overlayGfx.fillColor = new Color(0, 0, 0, 150);
        overlayGfx.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight);
        overlayGfx.fill();
        
        this.container?.addChild(overlay);
        
        // 弹窗
        const dialogW = 350;
        const dialogH = 200;
        
        const dialog = new Node('Dialog');
        dialog.layer = this.node.layer;
        dialog.addComponent(UITransform).setContentSize(dialogW, dialogH);
        
        const dialogGfx = dialog.addComponent(Graphics);
        dialogGfx.fillColor = new Color(255, 255, 255);
        dialogGfx.roundRect(-dialogW/2, -dialogH/2, dialogW, dialogH, 15);
        dialogGfx.fill();
        
        overlay.addChild(dialog);
        
        // 标题
        const titleLabel = this.createLabel('修改昵称', 0, 60, 20);
        titleLabel.getComponent(Label)!.color = new Color(50, 50, 50);
        dialog.addChild(titleLabel);
        
        // 输入提示
        const inputBg = new Node('InputBg');
        inputBg.layer = this.node.layer;
        inputBg.addComponent(UITransform).setContentSize(280, 45);
        const inputGfx = inputBg.addComponent(Graphics);
        inputGfx.fillColor = new Color(240, 240, 240);
        inputGfx.roundRect(-140, -22, 280, 45, 8);
        inputGfx.fill();
        inputBg.setPosition(0, 10, 0);
        dialog.addChild(inputBg);
        
        // 当前昵称显示
        const currentLabel = this.createLabel(this.nickname, 0, 10, 18);
        currentLabel.getComponent(Label)!.color = new Color(80, 80, 80);
        dialog.addChild(currentLabel);
        
        // 随机生成按钮
        const randomBtn = new Node('RandomBtn');
        randomBtn.layer = this.node.layer;
        randomBtn.addComponent(UITransform).setContentSize(120, 40);
        const randomGfx = randomBtn.addComponent(Graphics);
        randomGfx.fillColor = new Color(100, 180, 160);
        randomGfx.roundRect(-60, -20, 120, 40, 8);
        randomGfx.fill();
        const randomLabel = this.createLabel('随机', 0, 0, 15);
        randomBtn.addChild(randomLabel);
        randomBtn.setPosition(-70, -55, 0);
        randomBtn.on(Node.EventType.TOUCH_END, () => {
            const names = ['小可爱', '大冒险', '星之子', '月光侠', '风行者', '云追梦', '海之心'];
            const randomName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
            this.nickname = randomName;
            currentLabel.getComponent(Label)!.string = randomName;
        }, this);
        dialog.addChild(randomBtn);
        
        // 确定按钮
        const confirmBtn = new Node('ConfirmBtn');
        confirmBtn.layer = this.node.layer;
        confirmBtn.addComponent(UITransform).setContentSize(120, 40);
        const confirmGfx = confirmBtn.addComponent(Graphics);
        confirmGfx.fillColor = new Color(80, 160, 140);
        confirmGfx.roundRect(-60, -20, 120, 40, 8);
        confirmGfx.fill();
        const confirmLabel = this.createLabel('确定', 0, 0, 15);
        confirmBtn.addChild(confirmLabel);
        confirmBtn.setPosition(70, -55, 0);
        confirmBtn.on(Node.EventType.TOUCH_END, () => {
            if (this.nicknameLabel) {
                this.nicknameLabel.string = `当前昵称: ${this.nickname}`;
            }
            this.saveData();
            overlay.destroy();
            this.showToast('✅ 昵称已修改');
        }, this);
        dialog.addChild(confirmBtn);
        
        // 点击背景关闭
        overlay.on(Node.EventType.TOUCH_END, (e: any) => {
            if (e.target === overlay) {
                overlay.destroy();
            }
        }, this);
    }

    clearCache() {
        // 清除临时数据
        try {
            localStorage.removeItem('island_daily_tasks');
            this.showToast('✅ 缓存已清除');
        } catch (e) {
            this.showToast('❌ 清除失败');
        }
    }

    showResetConfirm() {
        // 创建确认弹窗
        const overlay = new Node('Overlay');
        overlay.layer = this.node.layer;
        overlay.addComponent(UITransform).setContentSize(this.screenWidth, this.screenHeight);
        
        const overlayGfx = overlay.addComponent(Graphics);
        overlayGfx.fillColor = new Color(0, 0, 0, 150);
        overlayGfx.rect(-this.screenWidth/2, -this.screenHeight/2, this.screenWidth, this.screenHeight);
        overlayGfx.fill();
        
        this.container?.addChild(overlay);
        
        // 弹窗
        const dialogW = 320;
        const dialogH = 180;
        
        const dialog = new Node('Dialog');
        dialog.layer = this.node.layer;
        dialog.addComponent(UITransform).setContentSize(dialogW, dialogH);
        
        const dialogGfx = dialog.addComponent(Graphics);
        dialogGfx.fillColor = new Color(255, 255, 255);
        dialogGfx.roundRect(-dialogW/2, -dialogH/2, dialogW, dialogH, 15);
        dialogGfx.fill();
        
        overlay.addChild(dialog);
        
        // 警告图标和标题
        const warnLabel = this.createLabel('⚠️ 确认重置存档？', 0, 45, 18);
        warnLabel.getComponent(Label)!.color = new Color(200, 100, 50);
        dialog.addChild(warnLabel);
        
        // 提示文字
        const tipLabel = this.createLabel('此操作不可恢复！', 0, 10, 14);
        tipLabel.getComponent(Label)!.color = new Color(100, 100, 100);
        dialog.addChild(tipLabel);
        
        // 取消按钮
        const cancelBtn = new Node('CancelBtn');
        cancelBtn.layer = this.node.layer;
        cancelBtn.addComponent(UITransform).setContentSize(110, 40);
        const cancelGfx = cancelBtn.addComponent(Graphics);
        cancelGfx.fillColor = new Color(180, 180, 180);
        cancelGfx.roundRect(-55, -20, 110, 40, 8);
        cancelGfx.fill();
        const cancelLabel = this.createLabel('取消', 0, 0, 15);
        cancelBtn.addChild(cancelLabel);
        cancelBtn.setPosition(-70, -45, 0);
        cancelBtn.on(Node.EventType.TOUCH_END, () => {
            overlay.destroy();
        }, this);
        dialog.addChild(cancelBtn);
        
        // 确认按钮
        const confirmBtn = new Node('ConfirmBtn');
        confirmBtn.layer = this.node.layer;
        confirmBtn.addComponent(UITransform).setContentSize(110, 40);
        const confirmGfx = confirmBtn.addComponent(Graphics);
        confirmGfx.fillColor = new Color(220, 80, 80);
        confirmGfx.roundRect(-55, -20, 110, 40, 8);
        confirmGfx.fill();
        const confirmLabel = this.createLabel('确认重置', 0, 0, 15);
        confirmBtn.addChild(confirmLabel);
        confirmBtn.setPosition(70, -45, 0);
        confirmBtn.on(Node.EventType.TOUCH_END, () => {
            this.resetAllData();
            overlay.destroy();
        }, this);
        dialog.addChild(confirmBtn);
    }

    resetAllData() {
        try {
            // 清除所有存档
            localStorage.removeItem('island_merge_save');
            localStorage.removeItem('island_game_save');
            localStorage.removeItem('island_daily_tasks');
            localStorage.removeItem('island_achievements');
            localStorage.removeItem('island_settings');
            
            this.showToast('✅ 存档已重置，即将重启...');
            
            // 延迟后重新加载
            this.scheduleOnce(() => {
                director.loadScene('MainMenu');
            }, 1.5);
        } catch (e) {
            this.showToast('❌ 重置失败');
        }
    }

    showToast(text: string) {
        const toast = new Node('Toast');
        toast.layer = this.node.layer;
        const gfx = toast.addComponent(Graphics);
        toast.addComponent(UITransform).setContentSize(250, 45);
        
        gfx.fillColor = new Color(0, 0, 0, 200);
        gfx.roundRect(-125, -22, 250, 45, 10);
        gfx.fill();
        
        const label = this.createLabel(text, 0, 0, 15);
        toast.addChild(label);
        
        toast.setPosition(0, 0, 0);
        toast.setScale(new Vec3(0, 0, 1));
        this.container?.addChild(toast);
        
        tween(toast)
            .to(0.15, { scale: new Vec3(1, 1, 1) })
            .delay(1.5)
            .to(0.15, { scale: new Vec3(0, 0, 1) })
            .call(() => toast.destroy())
            .start();
    }

    // =================== 存档 ===================
    saveData() {
        try {
            const data = {
                nickname: this.nickname,
            };
            localStorage.setItem('island_settings', JSON.stringify(data));
        } catch (e) {
            console.error('保存失败:', e);
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('island_settings');
            if (saved) {
                const data = JSON.parse(saved);
                this.nickname = data.nickname || 'Jack';
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
