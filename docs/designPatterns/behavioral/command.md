# 命令模式 (Command Pattern)

> [!NOTE]
> 命令模式将请求封装成对象，以便使用不同的请求、队列或者日志来参数化其他对象，同时支持可撤销的操作。

## 📖 模式定义

**命令模式**是一种行为设计模式，它将请求转换为一个包含与请求相关的所有信息的独立对象。该转换让你能根据不同的请求将方法参数化、延迟请求执行或将其放入队列中，且能实现可撤销操作。

### 核心要素
- **命令接口**：声明执行操作的接口
- **具体命令**：实现命令接口，定义接收者和行为之间的弱耦合
- **接收者**：知道如何实施与执行一个请求相关的操作
- **调用者**：要求该命令执行这个请求
- **客户端**：创建具体命令对象并设置接收者

## 🎯 使用场景

### 适用情况
- **参数化对象**：需要将对象参数化为要执行的动作
- **队列操作**：需要将操作排队、调度或远程执行
- **撤销操作**：需要支持撤销操作
- **日志记录**：需要记录操作以便重做或回滚
- **宏命令**：需要支持事务性行为

## 💡 实现方式

### TypeScript 实现

```typescript
// 命令接口
interface Command {
    execute(): void;
    undo(): void;
    getDescription(): string;
}

// 接收者 - 文本编辑器
class TextEditor {
    private content: string = '';
    private cursorPosition: number = 0;
    
    insertText(text: string, position: number): void {
        this.content = this.content.slice(0, position) + text + this.content.slice(position);
        this.cursorPosition = position + text.length;
        console.log(`Inserted "${text}" at position ${position}`);
    }
    
    deleteText(startPosition: number, length: number): string {
        const deletedText = this.content.slice(startPosition, startPosition + length);
        this.content = this.content.slice(0, startPosition) + this.content.slice(startPosition + length);
        this.cursorPosition = startPosition;
        console.log(`Deleted "${deletedText}" from position ${startPosition}`);
        return deletedText;
    }
    
    getContent(): string {
        return this.content;
    }
    
    getCursorPosition(): number {
        return this.cursorPosition;
    }
    
    setCursorPosition(position: number): void {
        this.cursorPosition = Math.max(0, Math.min(position, this.content.length));
    }
}

// 具体命令 - 插入文本
class InsertTextCommand implements Command {
    private editor: TextEditor;
    private text: string;
    private position: number;
    
    constructor(editor: TextEditor, text: string, position: number) {
        this.editor = editor;
        this.text = text;
        this.position = position;
    }
    
    execute(): void {
        this.editor.insertText(this.text, this.position);
    }
    
    undo(): void {
        this.editor.deleteText(this.position, this.text.length);
    }
    
    getDescription(): string {
        return `Insert "${this.text}" at position ${this.position}`;
    }
}

// 具体命令 - 删除文本
class DeleteTextCommand implements Command {
    private editor: TextEditor;
    private startPosition: number;
    private length: number;
    private deletedText: string = '';
    
    constructor(editor: TextEditor, startPosition: number, length: number) {
        this.editor = editor;
        this.startPosition = startPosition;
        this.length = length;
    }
    
    execute(): void {
        this.deletedText = this.editor.deleteText(this.startPosition, this.length);
    }
    
    undo(): void {
        this.editor.insertText(this.deletedText, this.startPosition);
    }
    
    getDescription(): string {
        return `Delete ${this.length} characters from position ${this.startPosition}`;
    }
}

// 宏命令 - 组合多个命令
class MacroCommand implements Command {
    private commands: Command[] = [];
    private description: string;
    
    constructor(description: string) {
        this.description = description;
    }
    
    addCommand(command: Command): void {
        this.commands.push(command);
    }
    
    execute(): void {
        console.log(`Executing macro: ${this.description}`);
        this.commands.forEach(command => command.execute());
    }
    
    undo(): void {
        console.log(`Undoing macro: ${this.description}`);
        // 逆序撤销
        for (let i = this.commands.length - 1; i >= 0; i--) {
            this.commands[i].undo();
        }
    }
    
    getDescription(): string {
        return `Macro: ${this.description} (${this.commands.length} commands)`;
    }
}

// 调用者 - 编辑器控制器
class EditorController {
    private editor: TextEditor;
    private history: Command[] = [];
    private currentPosition: number = -1;
    
    constructor(editor: TextEditor) {
        this.editor = editor;
    }
    
    executeCommand(command: Command): void {
        // 如果当前位置不在历史末尾，清除后面的命令
        if (this.currentPosition < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentPosition + 1);
        }
        
        command.execute();
        this.history.push(command);
        this.currentPosition++;
        
        console.log(`Command executed: ${command.getDescription()}`);
        this.showStatus();
    }
    
    undo(): boolean {
        if (this.currentPosition >= 0) {
            const command = this.history[this.currentPosition];
            command.undo();
            this.currentPosition--;
            console.log(`Undid: ${command.getDescription()}`);
            this.showStatus();
            return true;
        }
        console.log('Nothing to undo');
        return false;
    }
    
    redo(): boolean {
        if (this.currentPosition < this.history.length - 1) {
            this.currentPosition++;
            const command = this.history[this.currentPosition];
            command.execute();
            console.log(`Redid: ${command.getDescription()}`);
            this.showStatus();
            return true;
        }
        console.log('Nothing to redo');
        return false;
    }
    
    getHistory(): string[] {
        return this.history.map((cmd, index) => {
            const marker = index === this.currentPosition ? '→ ' : '  ';
            return `${marker}${index + 1}. ${cmd.getDescription()}`;
        });
    }
    
    private showStatus(): void {
        console.log(`Content: "${this.editor.getContent()}"`);
        console.log(`Cursor: ${this.editor.getCursorPosition()}`);
        console.log(`History position: ${this.currentPosition + 1}/${this.history.length}`);
    }
}

// 使用示例
console.log('=== Command Pattern Demo ===');

const editor = new TextEditor();
const controller = new EditorController(editor);

// 执行一系列命令
controller.executeCommand(new InsertTextCommand(editor, 'Hello', 0));
controller.executeCommand(new InsertTextCommand(editor, ' World', 5));
controller.executeCommand(new InsertTextCommand(editor, '!', 11));

console.log('\n--- Undo operations ---');
controller.undo();
controller.undo();

console.log('\n--- Redo operations ---');
controller.redo();

console.log('\n--- Delete operation ---');
controller.executeCommand(new DeleteTextCommand(editor, 5, 6)); // 删除 " World"

console.log('\n--- Macro command ---');
const macro = new MacroCommand('Add greeting');
macro.addCommand(new InsertTextCommand(editor, ' there', 5));
macro.addCommand(new InsertTextCommand(editor, ', friend', 11));
controller.executeCommand(macro);

console.log('\n--- Command History ---');
controller.getHistory().forEach(line => console.log(line));

console.log('\n--- Undo macro ---');
controller.undo();
```

### 远程控制器示例

```typescript
// 接收者 - 电器设备
class Light {
    private isOn: boolean = false;
    private brightness: number = 0;
    
    constructor(private location: string) {}
    
    turnOn(): void {
        this.isOn = true;
        this.brightness = 100;
        console.log(`${this.location} light is ON (brightness: ${this.brightness}%)`);
    }
    
    turnOff(): void {
        this.isOn = false;
        this.brightness = 0;
        console.log(`${this.location} light is OFF`);
    }
    
    setBrightness(level: number): void {
        if (this.isOn) {
            this.brightness = Math.max(0, Math.min(100, level));
            console.log(`${this.location} light brightness set to ${this.brightness}%`);
        }
    }
    
    getStatus(): string {
        return `${this.location} light: ${this.isOn ? 'ON' : 'OFF'} (${this.brightness}%)`;
    }
}

class Fan {
    private speed: number = 0; // 0-3
    
    constructor(private location: string) {}
    
    turnOn(): void {
        this.speed = 1;
        console.log(`${this.location} fan is ON (speed: ${this.speed})`);
    }
    
    turnOff(): void {
        this.speed = 0;
        console.log(`${this.location} fan is OFF`);
    }
    
    setSpeed(speed: number): void {
        this.speed = Math.max(0, Math.min(3, speed));
        console.log(`${this.location} fan speed set to ${this.speed}`);
    }
    
    getStatus(): string {
        return `${this.location} fan: ${this.speed === 0 ? 'OFF' : 'ON'} (speed: ${this.speed})`;
    }
}

// 空命令 - 用于初始化
class NoCommand implements Command {
    execute(): void {}
    undo(): void {}
    getDescription(): string {
        return 'No command';
    }
}

// 灯光命令
class LightOnCommand implements Command {
    constructor(private light: Light) {}
    
    execute(): void {
        this.light.turnOn();
    }
    
    undo(): void {
        this.light.turnOff();
    }
    
    getDescription(): string {
        return 'Turn light on';
    }
}

class LightOffCommand implements Command {
    constructor(private light: Light) {}
    
    execute(): void {
        this.light.turnOff();
    }
    
    undo(): void {
        this.light.turnOn();
    }
    
    getDescription(): string {
        return 'Turn light off';
    }
}

// 风扇命令
class FanOnCommand implements Command {
    constructor(private fan: Fan) {}
    
    execute(): void {
        this.fan.turnOn();
    }
    
    undo(): void {
        this.fan.turnOff();
    }
    
    getDescription(): string {
        return 'Turn fan on';
    }
}

class FanOffCommand implements Command {
    constructor(private fan: Fan) {}
    
    execute(): void {
        this.fan.turnOff();
    }
    
    undo(): void {
        this.fan.turnOn();
    }
    
    getDescription(): string {
        return 'Turn fan off';
    }
}

// 调用者 - 遥控器
class RemoteControl {
    private onCommands: Command[] = [];
    private offCommands: Command[] = [];
    private undoCommand: Command = new NoCommand();
    
    constructor(slots: number = 7) {
        for (let i = 0; i < slots; i++) {
            this.onCommands[i] = new NoCommand();
            this.offCommands[i] = new NoCommand();
        }
    }
    
    setCommand(slot: number, onCommand: Command, offCommand: Command): void {
        this.onCommands[slot] = onCommand;
        this.offCommands[slot] = offCommand;
    }
    
    onButtonPressed(slot: number): void {
        if (this.onCommands[slot]) {
            this.onCommands[slot].execute();
            this.undoCommand = this.onCommands[slot];
        }
    }
    
    offButtonPressed(slot: number): void {
        if (this.offCommands[slot]) {
            this.offCommands[slot].execute();
            this.undoCommand = this.offCommands[slot];
        }
    }
    
    undoButtonPressed(): void {
        this.undoCommand.undo();
    }
    
    toString(): string {
        let result = '\n------ Remote Control ------\n';
        for (let i = 0; i < this.onCommands.length; i++) {
            result += `[slot ${i}] ${this.onCommands[i].getDescription().padEnd(20)} | ${this.offCommands[i].getDescription()}\n`;
        }
        result += `[undo] ${this.undoCommand.getDescription()}\n`;
        return result;
    }
}

// 使用示例
console.log('\n=== Remote Control Demo ===');

const remote = new RemoteControl();

// 创建设备
const livingRoomLight = new Light('Living Room');
const kitchenLight = new Light('Kitchen');
const bedroomFan = new Fan('Bedroom');

// 创建命令
const livingRoomLightOn = new LightOnCommand(livingRoomLight);
const livingRoomLightOff = new LightOffCommand(livingRoomLight);
const kitchenLightOn = new LightOnCommand(kitchenLight);
const kitchenLightOff = new LightOffCommand(kitchenLight);
const bedroomFanOn = new FanOnCommand(bedroomFan);
const bedroomFanOff = new FanOffCommand(bedroomFan);

// 设置遥控器
remote.setCommand(0, livingRoomLightOn, livingRoomLightOff);
remote.setCommand(1, kitchenLightOn, kitchenLightOff);
remote.setCommand(2, bedroomFanOn, bedroomFanOff);

console.log(remote.toString());

// 测试遥控器
console.log('\n--- Testing Remote Control ---');
remote.onButtonPressed(0);  // 客厅灯开
remote.offButtonPressed(0); // 客厅灯关
remote.onButtonPressed(1);  // 厨房灯开
remote.onButtonPressed(2);  // 卧室风扇开

console.log('\n--- Undo last command ---');
remote.undoButtonPressed(); // 撤销最后一个命令

console.log('\n--- Device Status ---');
console.log(livingRoomLight.getStatus());
console.log(kitchenLight.getStatus());
console.log(bedroomFan.getStatus());
```

### 任务队列示例

```typescript
// 任务接口
interface Task extends Command {
    getId(): string;
    getPriority(): number;
    getEstimatedTime(): number;
}

// 具体任务
class EmailTask implements Task {
    constructor(
        private id: string,
        private recipient: string,
        private subject: string,
        private priority: number = 1
    ) {}
    
    execute(): void {
        console.log(`📧 Sending email to ${this.recipient}: "${this.subject}"`);
        // 模拟发送时间
        setTimeout(() => {
            console.log(`✅ Email sent to ${this.recipient}`);
        }, this.getEstimatedTime());
    }
    
    undo(): void {
        console.log(`🔄 Cannot undo email send to ${this.recipient}`);
    }
    
    getId(): string {
        return this.id;
    }
    
    getPriority(): number {
        return this.priority;
    }
    
    getEstimatedTime(): number {
        return 1000; // 1秒
    }
    
    getDescription(): string {
        return `Email to ${this.recipient}: ${this.subject}`;
    }
}

class DataProcessingTask implements Task {
    constructor(
        private id: string,
        private dataSize: number,
        private priority: number = 2
    ) {}
    
    execute(): void {
        console.log(`🔄 Processing ${this.dataSize}MB of data...`);
        setTimeout(() => {
            console.log(`✅ Data processing completed (${this.dataSize}MB)`);
        }, this.getEstimatedTime());
    }
    
    undo(): void {
        console.log(`🔄 Reverting data processing for ${this.dataSize}MB`);
    }
    
    getId(): string {
        return this.id;
    }
    
    getPriority(): number {
        return this.priority;
    }
    
    getEstimatedTime(): number {
        return this.dataSize * 100; // 100ms per MB
    }
    
    getDescription(): string {
        return `Process ${this.dataSize}MB data`;
    }
}

class BackupTask implements Task {
    constructor(
        private id: string,
        private source: string,
        private destination: string,
        private priority: number = 3
    ) {}
    
    execute(): void {
        console.log(`💾 Backing up ${this.source} to ${this.destination}...`);
        setTimeout(() => {
            console.log(`✅ Backup completed: ${this.source} → ${this.destination}`);
        }, this.getEstimatedTime());
    }
    
    undo(): void {
        console.log(`🗑️ Removing backup from ${this.destination}`);
    }
    
    getId(): string {
        return this.id;
    }
    
    getPriority(): number {
        return this.priority;
    }
    
    getEstimatedTime(): number {
        return 3000; // 3秒
    }
    
    getDescription(): string {
        return `Backup ${this.source} to ${this.destination}`;
    }
}

// 任务队列管理器
class TaskQueue {
    private tasks: Task[] = [];
    private running: boolean = false;
    private completedTasks: Task[] = [];
    
    addTask(task: Task): void {
        this.tasks.push(task);
        this.tasks.sort((a, b) => a.getPriority() - b.getPriority()); // 按优先级排序
        console.log(`➕ Added task: ${task.getDescription()} (Priority: ${task.getPriority()})`);
    }
    
    async start(): Promise<void> {
        if (this.running) {
            console.log('⚠️ Task queue is already running');
            return;
        }
        
        this.running = true;
        console.log('🚀 Starting task queue...');
        
        while (this.tasks.length > 0 && this.running) {
            const task = this.tasks.shift()!;
            console.log(`\n▶️ Executing: ${task.getDescription()}`);
            
            try {
                task.execute();
                this.completedTasks.push(task);
                
                // 等待任务完成
                await new Promise(resolve => setTimeout(resolve, task.getEstimatedTime()));
                
            } catch (error) {
                console.log(`❌ Task failed: ${task.getDescription()}`);
                console.log(`Error: ${error}`);
            }
        }
        
        this.running = false;
        console.log('\n🏁 Task queue completed');
        this.showSummary();
    }
    
    stop(): void {
        this.running = false;
        console.log('⏹️ Task queue stopped');
    }
    
    undoLastTask(): void {
        if (this.completedTasks.length > 0) {
            const lastTask = this.completedTasks.pop()!;
            console.log(`↩️ Undoing: ${lastTask.getDescription()}`);
            lastTask.undo();
        } else {
            console.log('⚠️ No tasks to undo');
        }
    }
    
    getQueueStatus(): void {
        console.log('\n📊 Queue Status:');
        console.log(`Pending tasks: ${this.tasks.length}`);
        console.log(`Completed tasks: ${this.completedTasks.length}`);
        console.log(`Running: ${this.running}`);
        
        if (this.tasks.length > 0) {
            console.log('\nPending tasks:');
            this.tasks.forEach((task, index) => {
                console.log(`  ${index + 1}. ${task.getDescription()} (Priority: ${task.getPriority()})`);
            });
        }
    }
    
    private showSummary(): void {
        console.log('\n📈 Execution Summary:');
        console.log(`Total tasks completed: ${this.completedTasks.length}`);
        const totalTime = this.completedTasks.reduce((sum, task) => sum + task.getEstimatedTime(), 0);
        console.log(`Total estimated time: ${totalTime}ms`);
    }
}

// 使用示例
async function demonstrateTaskQueue() {
    console.log('\n=== Task Queue Demo ===');
    
    const queue = new TaskQueue();
    
    // 添加各种任务
    queue.addTask(new EmailTask('email-1', 'john@example.com', 'Meeting reminder', 1));
    queue.addTask(new DataProcessingTask('data-1', 50, 2));
    queue.addTask(new BackupTask('backup-1', '/home/user', '/backup/user', 3));
    queue.addTask(new EmailTask('email-2', 'jane@example.com', 'Project update', 1));
    queue.addTask(new DataProcessingTask('data-2', 20, 2));
    
    queue.getQueueStatus();
    
    // 启动队列
    await queue.start();
    
    // 撤销最后一个任务
    queue.undoLastTask();
}

// demonstrateTaskQueue();
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **解耦合**：调用者与接收者解耦
2. **可扩展性**：容易添加新命令
3. **可撤销性**：支持撤销和重做操作
4. **可组合性**：可以将命令组合成复合命令
5. **可记录性**：可以记录命令用于日志和重放

### ❌ 缺点
1. **类数量增加**：每个命令都需要一个类
2. **复杂性增加**：增加了系统的复杂性
3. **内存开销**：需要存储命令对象

## 🔄 相关模式

- **备忘录模式**：可以与命令模式结合实现撤销功能
- **组合模式**：可以用来实现宏命令
- **原型模式**：可以用来复制命令
- **策略模式**：命令模式可以看作是策略模式的扩展

## 🚀 最佳实践

1. **命令接口设计**：保持命令接口简单一致
2. **撤销操作**：为需要撤销的命令实现undo方法
3. **状态保存**：在执行前保存必要的状态信息
4. **异常处理**：妥善处理命令执行中的异常
5. **内存管理**：合理管理命令历史的大小

## ⚠️ 注意事项

1. **状态一致性**：确保撤销操作能正确恢复状态
2. **命令有效性**：检查命令执行的前置条件
3. **资源管理**：注意命令对象的生命周期管理
4. **线程安全**：在多线程环境中确保命令的线程安全

## 📚 总结

命令模式通过将请求封装为对象，提供了一种灵活的请求处理机制。它支持撤销操作、队列操作和日志记录，特别适用于需要解耦调用者和接收者的场景。

**使用建议**：
- 当需要将请求参数化时使用
- 当需要支持撤销操作时使用
- 当需要将操作排队或记录日志时使用
- 当需要支持宏操作时使用

---

**相关链接**：
- [备忘录模式](./memento.md)
- [组合模式](../structural/composite.md)
- [策略模式](./strategy.md) 