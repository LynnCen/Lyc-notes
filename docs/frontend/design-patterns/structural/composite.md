# 组合模式 (Composite Pattern)

> [!NOTE]
> 组合模式将对象组合成树形结构以表示"部分-整体"的层次结构，使得用户对单个对象和组合对象的使用具有一致性。

## 📖 模式定义

**组合模式**是一种结构型设计模式，它将对象组合成树形结构来表现"整体/部分"层次结构。组合模式使得用户对单个对象和组合对象的使用具有一致性。

### 核心要素
- **组件接口**：定义叶子和容器对象的公共接口
- **叶子节点**：树形结构中的叶子节点，没有子节点
- **容器节点**：有子节点的节点，实现与子节点相关的操作
- **客户端**：通过组件接口操作组合结构中的对象

## 🎯 使用场景

### 适用情况
- **树形结构**：需要表示对象的部分-整体层次结构
- **统一处理**：希望用户忽略组合对象与单个对象的不同
- **递归结构**：结构中的对象有相似的操作
- **层次遍历**：需要遍历整个层次结构

### 不适用情况
- 对象结构过于简单
- 不需要统一处理单个对象和组合对象
- 性能要求极高的场景

## 💡 实现方式

### TypeScript 实现

```typescript
// 组件接口
interface FileSystemComponent {
    getName(): string;
    getSize(): number;
    display(indent?: string): void;
    add?(component: FileSystemComponent): void;
    remove?(component: FileSystemComponent): void;
    getChild?(index: number): FileSystemComponent | null;
}

// 叶子节点 - 文件
class File implements FileSystemComponent {
    private name: string;
    private size: number;
    
    constructor(name: string, size: number) {
        this.name = name;
        this.size = size;
    }
    
    getName(): string {
        return this.name;
    }
    
    getSize(): number {
        return this.size;
    }
    
    display(indent: string = ''): void {
        console.log(`${indent}📄 ${this.name} (${this.size} bytes)`);
    }
}

// 容器节点 - 文件夹
class Directory implements FileSystemComponent {
    private name: string;
    private children: FileSystemComponent[] = [];
    
    constructor(name: string) {
        this.name = name;
    }
    
    getName(): string {
        return this.name;
    }
    
    getSize(): number {
        return this.children.reduce((total, child) => total + child.getSize(), 0);
    }
    
    display(indent: string = ''): void {
        console.log(`${indent}📁 ${this.name}/ (${this.getSize()} bytes)`);
        this.children.forEach(child => {
            child.display(indent + '  ');
        });
    }
    
    add(component: FileSystemComponent): void {
        this.children.push(component);
    }
    
    remove(component: FileSystemComponent): void {
        const index = this.children.indexOf(component);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }
    
    getChild(index: number): FileSystemComponent | null {
        return this.children[index] || null;
    }
    
    getChildren(): FileSystemComponent[] {
        return [...this.children];
    }
    
    find(name: string): FileSystemComponent | null {
        if (this.name === name) {
            return this;
        }
        
        for (const child of this.children) {
            if (child.getName() === name) {
                return child;
            }
            
            if (child instanceof Directory) {
                const found = child.find(name);
                if (found) {
                    return found;
                }
            }
        }
        
        return null;
    }
}

// 使用示例
console.log('=== Composite Pattern Demo ===');

// 创建文件系统结构
const root = new Directory('root');
const documents = new Directory('Documents');
const pictures = new Directory('Pictures');
const music = new Directory('Music');

// 添加文件
const resume = new File('resume.pdf', 1024);
const photo1 = new File('vacation.jpg', 2048);
const photo2 = new File('family.png', 1536);
const song1 = new File('favorite.mp3', 4096);
const song2 = new File('classical.wav', 8192);

// 构建目录结构
documents.add(resume);
pictures.add(photo1);
pictures.add(photo2);
music.add(song1);
music.add(song2);

root.add(documents);
root.add(pictures);
root.add(music);

// 显示整个文件系统
console.log('\n--- File System Structure ---');
root.display();

// 查找文件
console.log('\n--- Finding Files ---');
const foundFile = root.find('vacation.jpg');
if (foundFile) {
    console.log(`Found: ${foundFile.getName()}`);
}

const foundDir = root.find('Music');
if (foundDir) {
    console.log(`Found directory: ${foundDir.getName()}`);
    foundDir.display();
}
```

### 高级组合模式示例

```typescript
// 图形组件接口
interface GraphicComponent {
    draw(): void;
    move(x: number, y: number): void;
    getBounds(): { x: number; y: number; width: number; height: number };
    clone(): GraphicComponent;
}

// 基础图形类
abstract class BaseGraphic implements GraphicComponent {
    protected x: number;
    protected y: number;
    protected width: number;
    protected height: number;
    
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    move(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
    
    getBounds(): { x: number; y: number; width: number; height: number } {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    
    abstract draw(): void;
    abstract clone(): GraphicComponent;
}

// 叶子节点 - 圆形
class Circle extends BaseGraphic {
    private radius: number;
    
    constructor(x: number, y: number, radius: number) {
        super(x, y, radius * 2, radius * 2);
        this.radius = radius;
    }
    
    draw(): void {
        console.log(`🔵 Drawing circle at (${this.x}, ${this.y}) with radius ${this.radius}`);
    }
    
    clone(): Circle {
        return new Circle(this.x, this.y, this.radius);
    }
}

// 叶子节点 - 矩形
class Rectangle extends BaseGraphic {
    draw(): void {
        console.log(`🟦 Drawing rectangle at (${this.x}, ${this.y}) with size ${this.width}x${this.height}`);
    }
    
    clone(): Rectangle {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }
}

// 叶子节点 - 文本
class Text extends BaseGraphic {
    private content: string;
    
    constructor(x: number, y: number, content: string) {
        super(x, y, content.length * 8, 16); // 假设字符宽度
        this.content = content;
    }
    
    draw(): void {
        console.log(`📝 Drawing text "${this.content}" at (${this.x}, ${this.y})`);
    }
    
    clone(): Text {
        return new Text(this.x, this.y, this.content);
    }
    
    getContent(): string {
        return this.content;
    }
    
    setContent(content: string): void {
        this.content = content;
        this.width = content.length * 8;
    }
}

// 容器节点 - 图形组
class GraphicGroup implements GraphicComponent {
    private children: GraphicComponent[] = [];
    private name: string;
    
    constructor(name: string = 'Group') {
        this.name = name;
    }
    
    add(component: GraphicComponent): void {
        this.children.push(component);
    }
    
    remove(component: GraphicComponent): void {
        const index = this.children.indexOf(component);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }
    
    draw(): void {
        console.log(`📦 Drawing group: ${this.name}`);
        this.children.forEach((child, index) => {
            console.log(`  [${index + 1}]`);
            child.draw();
        });
    }
    
    move(x: number, y: number): void {
        const bounds = this.getBounds();
        const deltaX = x - bounds.x;
        const deltaY = y - bounds.y;
        
        this.children.forEach(child => {
            const childBounds = child.getBounds();
            child.move(childBounds.x + deltaX, childBounds.y + deltaY);
        });
    }
    
    getBounds(): { x: number; y: number; width: number; height: number } {
        if (this.children.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        this.children.forEach(child => {
            const bounds = child.getBounds();
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    clone(): GraphicGroup {
        const clonedGroup = new GraphicGroup(this.name + ' (Copy)');
        this.children.forEach(child => {
            clonedGroup.add(child.clone());
        });
        return clonedGroup;
    }
    
    getChildren(): GraphicComponent[] {
        return [...this.children];
    }
    
    getName(): string {
        return this.name;
    }
    
    setName(name: string): void {
        this.name = name;
    }
}

// 图形编辑器
class GraphicEditor {
    private canvas: GraphicComponent[] = [];
    private selectedComponents: GraphicComponent[] = [];
    
    addComponent(component: GraphicComponent): void {
        this.canvas.push(component);
        console.log(`➕ Added component to canvas`);
    }
    
    removeComponent(component: GraphicComponent): void {
        const index = this.canvas.indexOf(component);
        if (index !== -1) {
            this.canvas.splice(index, 1);
            console.log(`➖ Removed component from canvas`);
        }
    }
    
    selectComponent(component: GraphicComponent): void {
        if (!this.selectedComponents.includes(component)) {
            this.selectedComponents.push(component);
            console.log(`✅ Selected component`);
        }
    }
    
    deselectAll(): void {
        this.selectedComponents = [];
        console.log(`❌ Deselected all components`);
    }
    
    groupSelected(groupName: string = 'New Group'): GraphicGroup | null {
        if (this.selectedComponents.length < 2) {
            console.log(`⚠️ Need at least 2 components to create a group`);
            return null;
        }
        
        const group = new GraphicGroup(groupName);
        
        // 将选中的组件添加到组中，并从画布中移除
        this.selectedComponents.forEach(component => {
            group.add(component);
            this.removeComponent(component);
        });
        
        // 将组添加到画布
        this.addComponent(group);
        
        // 清空选择
        this.deselectAll();
        
        console.log(`🔗 Created group: ${groupName}`);
        return group;
    }
    
    ungroupSelected(): void {
        const groupsToUngroup = this.selectedComponents.filter(
            component => component instanceof GraphicGroup
        ) as GraphicGroup[];
        
        groupsToUngroup.forEach(group => {
            // 将组中的子组件添加到画布
            group.getChildren().forEach(child => {
                this.addComponent(child);
            });
            
            // 从画布中移除组
            this.removeComponent(group);
        });
        
        this.deselectAll();
        console.log(`🔓 Ungrouped ${groupsToUngroup.length} groups`);
    }
    
    drawCanvas(): void {
        console.log('\n🎨 Drawing Canvas:');
        console.log('==================');
        this.canvas.forEach((component, index) => {
            console.log(`[${index + 1}]`);
            component.draw();
            console.log('');
        });
    }
    
    getCanvasComponents(): GraphicComponent[] {
        return [...this.canvas];
    }
}

// 使用示例
async function demonstrateGraphicComposite() {
    console.log('\n=== Advanced Composite Pattern Demo ===');
    
    const editor = new GraphicEditor();
    
    // 创建基础图形
    const circle1 = new Circle(10, 10, 5);
    const circle2 = new Circle(30, 30, 8);
    const rect1 = new Rectangle(50, 50, 20, 15);
    const rect2 = new Rectangle(80, 80, 25, 10);
    const text1 = new Text(100, 100, 'Hello World');
    
    // 添加到画布
    editor.addComponent(circle1);
    editor.addComponent(circle2);
    editor.addComponent(rect1);
    editor.addComponent(rect2);
    editor.addComponent(text1);
    
    console.log('\n--- Initial Canvas ---');
    editor.drawCanvas();
    
    // 选择一些组件并创建组
    editor.selectComponent(circle1);
    editor.selectComponent(rect1);
    const group1 = editor.groupSelected('Shapes Group');
    
    editor.selectComponent(circle2);
    editor.selectComponent(text1);
    const group2 = editor.groupSelected('Mixed Group');
    
    console.log('\n--- After Grouping ---');
    editor.drawCanvas();
    
    // 创建嵌套组
    if (group1 && group2) {
        editor.selectComponent(group1);
        editor.selectComponent(group2);
        editor.selectComponent(rect2);
        const masterGroup = editor.groupSelected('Master Group');
        
        console.log('\n--- After Creating Master Group ---');
        editor.drawCanvas();
        
        // 移动整个组
        if (masterGroup) {
            console.log('\n--- Moving Master Group ---');
            masterGroup.move(200, 200);
            editor.drawCanvas();
            
            // 克隆组
            console.log('\n--- Cloning Master Group ---');
            const clonedGroup = masterGroup.clone();
            clonedGroup.move(400, 400);
            editor.addComponent(clonedGroup);
            editor.drawCanvas();
        }
    }
}

demonstrateGraphicComposite();
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **统一接口**：客户端可以一致地处理单个对象和组合对象
2. **简化客户端**：客户端不需要区分叶子和容器对象
3. **易于扩展**：容易增加新的组件类型
4. **递归结构**：天然支持树形结构的递归操作

### ❌ 缺点
1. **设计复杂**：使设计变得更加抽象
2. **类型安全**：难以限制组合中组件的类型
3. **性能开销**：递归调用可能带来性能问题

## 🌟 实际应用案例

### 1. UI组件系统

```typescript
// UI组件接口
interface UIComponent {
    render(): string;
    getSize(): { width: number; height: number };
    setVisible(visible: boolean): void;
    isVisible(): boolean;
    addEventListener(event: string, handler: Function): void;
}

// 基础UI组件
abstract class BaseUIComponent implements UIComponent {
    protected visible: boolean = true;
    protected eventListeners: Map<string, Function[]> = new Map();
    
    setVisible(visible: boolean): void {
        this.visible = visible;
    }
    
    isVisible(): boolean {
        return this.visible;
    }
    
    addEventListener(event: string, handler: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(handler);
    }
    
    protected triggerEvent(event: string, data?: any): void {
        const handlers = this.eventListeners.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
    
    abstract render(): string;
    abstract getSize(): { width: number; height: number };
}

// 叶子组件 - 按钮
class Button extends BaseUIComponent {
    private text: string;
    private width: number;
    private height: number;
    
    constructor(text: string, width: number = 100, height: number = 30) {
        super();
        this.text = text;
        this.width = width;
        this.height = height;
    }
    
    render(): string {
        if (!this.visible) return '';
        return `<button style="width:${this.width}px;height:${this.height}px">${this.text}</button>`;
    }
    
    getSize(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }
    
    setText(text: string): void {
        this.text = text;
    }
    
    click(): void {
        this.triggerEvent('click', { text: this.text });
    }
}

// 叶子组件 - 输入框
class Input extends BaseUIComponent {
    private placeholder: string;
    private value: string = '';
    private width: number;
    private height: number;
    
    constructor(placeholder: string, width: number = 200, height: number = 30) {
        super();
        this.placeholder = placeholder;
        this.width = width;
        this.height = height;
    }
    
    render(): string {
        if (!this.visible) return '';
        return `<input placeholder="${this.placeholder}" value="${this.value}" style="width:${this.width}px;height:${this.height}px">`;
    }
    
    getSize(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }
    
    setValue(value: string): void {
        this.value = value;
        this.triggerEvent('change', { value });
    }
    
    getValue(): string {
        return this.value;
    }
}

// 叶子组件 - 标签
class Label extends BaseUIComponent {
    private text: string;
    private fontSize: number;
    
    constructor(text: string, fontSize: number = 14) {
        super();
        this.text = text;
        this.fontSize = fontSize;
    }
    
    render(): string {
        if (!this.visible) return '';
        return `<label style="font-size:${this.fontSize}px">${this.text}</label>`;
    }
    
    getSize(): { width: number; height: number } {
        return { 
            width: this.text.length * this.fontSize * 0.6, 
            height: this.fontSize + 4 
        };
    }
    
    setText(text: string): void {
        this.text = text;
    }
}

// 容器组件 - 面板
class Panel extends BaseUIComponent {
    private children: UIComponent[] = [];
    private layout: 'vertical' | 'horizontal' = 'vertical';
    private padding: number = 10;
    private title?: string;
    
    constructor(title?: string, layout: 'vertical' | 'horizontal' = 'vertical') {
        super();
        this.title = title;
        this.layout = layout;
    }
    
    addComponent(component: UIComponent): void {
        this.children.push(component);
    }
    
    removeComponent(component: UIComponent): void {
        const index = this.children.indexOf(component);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }
    
    render(): string {
        if (!this.visible) return '';
        
        const childrenHtml = this.children
            .filter(child => child.isVisible())
            .map(child => child.render())
            .join('');
        
        const flexDirection = this.layout === 'vertical' ? 'column' : 'row';
        const titleHtml = this.title ? `<h3>${this.title}</h3>` : '';
        
        return `
            <div style="display:flex;flex-direction:${flexDirection};padding:${this.padding}px;border:1px solid #ccc;">
                ${titleHtml}
                ${childrenHtml}
            </div>
        `;
    }
    
    getSize(): { width: number; height: number } {
        if (this.children.length === 0) {
            return { width: this.padding * 2, height: this.padding * 2 };
        }
        
        const visibleChildren = this.children.filter(child => child.isVisible());
        
        if (this.layout === 'vertical') {
            const maxWidth = Math.max(...visibleChildren.map(child => child.getSize().width));
            const totalHeight = visibleChildren.reduce((sum, child) => sum + child.getSize().height, 0);
            return { 
                width: maxWidth + this.padding * 2, 
                height: totalHeight + this.padding * 2 
            };
        } else {
            const totalWidth = visibleChildren.reduce((sum, child) => sum + child.getSize().width, 0);
            const maxHeight = Math.max(...visibleChildren.map(child => child.getSize().height));
            return { 
                width: totalWidth + this.padding * 2, 
                height: maxHeight + this.padding * 2 
            };
        }
    }
    
    getChildren(): UIComponent[] {
        return [...this.children];
    }
    
    setLayout(layout: 'vertical' | 'horizontal'): void {
        this.layout = layout;
    }
}

// 表单组件
class Form extends Panel {
    private formData: Map<string, any> = new Map();
    
    constructor(title: string = 'Form') {
        super(title, 'vertical');
    }
    
    addField(label: string, input: Input): void {
        const fieldPanel = new Panel(undefined, 'horizontal');
        const labelComponent = new Label(label);
        
        fieldPanel.addComponent(labelComponent);
        fieldPanel.addComponent(input);
        
        // 监听输入变化
        input.addEventListener('change', (data) => {
            this.formData.set(label, data.value);
            this.triggerEvent('fieldChange', { field: label, value: data.value });
        });
        
        this.addComponent(fieldPanel);
    }
    
    addButton(button: Button): void {
        button.addEventListener('click', () => {
            this.triggerEvent('buttonClick', { 
                button: button, 
                formData: Object.fromEntries(this.formData) 
            });
        });
        this.addComponent(button);
    }
    
    getFormData(): Record<string, any> {
        return Object.fromEntries(this.formData);
    }
    
    reset(): void {
        this.formData.clear();
        // 重置所有输入框
        this.resetInputs(this);
    }
    
    private resetInputs(component: UIComponent): void {
        if (component instanceof Input) {
            component.setValue('');
        } else if (component instanceof Panel) {
            component.getChildren().forEach(child => this.resetInputs(child));
        }
    }
}

// 使用示例
function demonstrateUIComposite() {
    console.log('\n=== UI Composite Pattern Demo ===');
    
    // 创建登录表单
    const loginForm = new Form('Login Form');
    
    const usernameInput = new Input('Enter username');
    const passwordInput = new Input('Enter password');
    const loginButton = new Button('Login');
    const cancelButton = new Button('Cancel');
    
    loginForm.addField('Username', usernameInput);
    loginForm.addField('Password', passwordInput);
    
    // 创建按钮面板
    const buttonPanel = new Panel(undefined, 'horizontal');
    buttonPanel.addComponent(loginButton);
    buttonPanel.addComponent(cancelButton);
    loginForm.addComponent(buttonPanel);
    
    // 添加事件监听
    loginForm.addEventListener('fieldChange', (data) => {
        console.log(`Field changed: ${data.field} = ${data.value}`);
    });
    
    loginForm.addEventListener('buttonClick', (data) => {
        if (data.button === loginButton) {
            console.log('Login clicked with data:', data.formData);
        } else if (data.button === cancelButton) {
            console.log('Cancel clicked');
            loginForm.reset();
        }
    });
    
    // 渲染表单
    console.log('\n--- Rendered Form ---');
    console.log(loginForm.render());
    
    // 模拟用户交互
    console.log('\n--- User Interactions ---');
    usernameInput.setValue('john_doe');
    passwordInput.setValue('secret123');
    loginButton.click();
    
    console.log('\n--- Form Size ---');
    const size = loginForm.getSize();
    console.log(`Form size: ${size.width}x${size.height}`);
}

demonstrateUIComposite();
```

## 🔄 相关模式

### 与其他模式的关系
- **装饰器模式**：都使用递归组合，但装饰器添加职责，组合表示层次结构
- **享元模式**：可以与组合模式结合，共享叶子节点
- **迭代器模式**：可以用来遍历组合结构
- **访问者模式**：可以在组合结构上执行操作

## 🚀 最佳实践

1. **接口设计**：保持组件接口简单一致
2. **类型安全**：使用泛型或类型检查确保组件类型正确
3. **性能优化**：对于大型树结构，考虑缓存和懒加载
4. **错误处理**：处理循环引用和无效操作
5. **内存管理**：及时清理不需要的组件引用

## ⚠️ 注意事项

1. **循环引用**：避免在组合结构中创建循环引用
2. **类型限制**：考虑是否需要限制容器中的组件类型
3. **性能考虑**：深层嵌套可能影响性能
4. **内存泄漏**：注意清理事件监听器和引用

## 📚 总结

组合模式是处理树形结构的强大工具，它让客户端能够统一处理单个对象和对象组合。这个模式在UI系统、文件系统、组织结构等场景中非常有用。

**使用建议**：
- 当需要表示对象的部分-整体层次结构时使用
- 当希望用户忽略组合对象与单个对象的不同时使用
- 当结构中的对象有相似操作时使用
- 优先考虑接口的一致性和简洁性

---

**相关链接**：
- [装饰器模式](./decorator.md)
- [享元模式](./flyweight.md)
- [迭代器模式](../behavioral/iterator.md) 