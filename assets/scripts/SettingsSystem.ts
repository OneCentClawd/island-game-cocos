import { _decorator, Component, Node, Label, UITransform, Color, Vec3, tween, Graphics } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 设置系统
 */
@ccclass('SettingsSystem')
export class SettingsSystem extends Component {
    private container: Node | null = null;
    private nickname: string = '匿名玩家';

    start() {
        console.log('⚙️ 设置系统');
        this.loadSettings();
        this.showSettings();
    }

    showSettings() {
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
        graphics.fillColor = new Color(67, 206, 162);
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();
        this.container.addChild(bg);

        // 标题
        const title = this.createLabel('⚙️ 设置', 0, 300, 36);
        this.container.addChild(title);

        // 当前昵称
        const nicknameLabel = this.createLabel(`当前昵称: ${this.nickname}`, 0, 200, 18);
        nicknameLabel.getComponent(Label)!.color = new Color(255, 255, 255, 200);
        this.container.addChild(nicknameLabel);

        // 修改昵称按钮
        const nicknameBtn = this.createSettingButton('✏️ 修改昵称', 0, 130, () => {
            this.changeNickname();
        });
        this.container.addChild(nicknameBtn);

        // 清除缓存按钮
        const clearBtn = this.createSettingButton('🗑️ 清除缓存', 0, 50, () => {
            this.clearCache();
        });
        this.container.addChild(clearBtn);

        // 重置存档按钮
        const resetBtn = this.createSettingButton('⚠️ 重置存档', 0, -30, () => {
            this.resetSave();
        });
        resetBtn.getComponent(Graphics)!.fillColor = new Color(255, 100, 100, 180);
        this.container.addChild(resetBtn);

        // 关于
        const aboutBtn = this.createSettingButton('ℹ️ 关于游戏', 0, -110, () => {
            this.showAbout();
        });
        this.container.addChild(aboutBtn);

        // 版本号
        const version = this.createLabel('小岛物语 v0.3.1', 0, -250, 14);
        version.getComponent(Label)!.color = new Color(255, 255, 255, 150);
        this.container.addChild(version);

        // 返回按钮
        const backBtn = this.createButton('返回', 0, -320, 120, 50, () => {
            // 返回主菜单
        });
        this.container.addChild(backBtn);
    }

    createSettingButton(text: string, x: number, y: number, callback: () => void): Node {
        const node = new Node('SettingBtn');
        node.layer = this.node.layer;
        const width = 280;
        const height = 55;
        node.addComponent(UITransform).setContentSize(width, height);
        
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = new Color(255, 255, 255, 50);
        graphics.roundRect(-width/2, -height/2, width, height, 12);
        graphics.fill();

        const label = this.createLabel(text, 0, 0, 20);
        node.addChild(label);

        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);

        return node;
    }

    changeNickname() {
        // 在实际项目中，这里应该弹出输入框
        // 临时使用随机昵称演示
        const nicknames = ['小岛主人', '快乐玩家', '消消乐达人', '合成大师', '小狗爱好者'];
        this.nickname = nicknames[Math.floor(Math.random() * nicknames.length)];
        this.saveSettings();
        this.showSettings();
        
        console.log(`昵称已更改为: ${this.nickname}`);
    }

    clearCache() {
        // 确认对话框
        console.log('清除缓存（存档不受影响）');
        // 实际项目中应该弹出确认框
    }

    resetSave() {
        // 确认对话框
        console.log('重置存档');
        
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.clear();
                console.log('存档已重置');
            }
        } catch (e) {}
        
        this.showSettings();
    }

    showAbout() {
        const overlay = new Node('AboutOverlay');
        overlay.layer = this.node.layer;
        overlay.addComponent(UITransform).setContentSize(800, 800);
        this.node.addChild(overlay);

        const bg = new Node('Bg');
        bg.layer = this.node.layer;
        const graphics = bg.addComponent(Graphics);
        bg.addComponent(UITransform).setContentSize(800, 800);
        graphics.fillColor = new Color(0, 0, 0, 220);
        graphics.rect(-400, -400, 800, 800);
        graphics.fill();
        overlay.addChild(bg);

        const title = this.createLabel('🏝️ 小岛物语', 0, 150, 36);
        overlay.addChild(title);

        const version = this.createLabel('版本 0.3.1', 0, 90, 18);
        overlay.addChild(version);

        const desc = this.createLabel('一款休闲经营类小游戏\n包含消消乐、合成、养成等玩法', 0, 30, 16);
        overlay.addChild(desc);

        const engine = this.createLabel('使用 Cocos Creator 3.8 开发', 0, -40, 14);
        engine.getComponent(Label)!.color = new Color(200, 200, 200);
        overlay.addChild(engine);

        const closeBtn = this.createButton('关闭', 0, -150, 120, 50, () => {
            overlay.destroy();
        });
        overlay.addChild(closeBtn);
    }

    saveSettings() {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem('user_nickname', this.nickname);
        } catch (e) {}
    }

    loadSettings() {
        try {
            if (typeof localStorage === 'undefined') return;
            this.nickname = localStorage.getItem('user_nickname') || '匿名玩家';
        } catch (e) {}
    }

    clearAll() {
        this.container?.destroy();
        this.container = null;
    }

    createLabel(text: string, x: number, y: number, fontSize: number): Node {
        const node = new Node('Label');
        node.layer = this.node.layer;
        node.addComponent(UITransform).setContentSize(300, fontSize * 3);
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
        const labelNode = this.createLabel(text, 0, 0, 18);
        node.addChild(labelNode);
        node.setPosition(x, y, 0);
        node.on(Node.EventType.TOUCH_END, callback, this);
        return node;
    }
}
