#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Design Pattern Documentation Generator
Batch create missing design pattern documentation files
"""

import os
from pathlib import Path

# 定义所有需要创建的文件及其基本内容
PATTERN_FILES = {
    # Creational Patterns (remaining files)
    "creational/abstract-factory.md": {
        "title": "抽象工厂模式 (Abstract Factory Pattern)",
        "description": "抽象工厂模式提供一个接口，用于创建相关或依赖对象的家族，而不需要明确指定具体类。",
        "scenarios": ["跨平台应用", "数据库适配", "主题系统", "游戏开发", "文档处理"]
    },
    "creational/builder.md": {
        "title": "建造者模式 (Builder Pattern)", 
        "description": "建造者模式将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。",
        "scenarios": ["复杂对象创建", "参数很多的构造函数", "对象创建步骤固定", "需要创建不同表示", "配置对象"]
    },
    "creational/prototype.md": {
        "title": "原型模式 (Prototype Pattern)",
        "description": "原型模式通过复制现有实例来创建新对象，而不是通过实例化类。这种模式在创建对象的成本较高时特别有用。",
        "scenarios": ["对象创建成本高", "避免子类创建", "运行时确定对象", "对象状态变化少", "配置对象"]
    },
    
    # Structural Patterns
    "structural/bridge.md": {
        "title": "桥接模式 (Bridge Pattern)",
        "description": "桥接模式将抽象部分与它的实现部分分离，使它们都可以独立地变化。",
        "scenarios": ["抽象与实现分离", "多维度变化", "运行时切换实现", "避免永久绑定", "共享实现"]
    },
    "structural/composite.md": {
        "title": "组合模式 (Composite Pattern)",
        "description": "组合模式将对象组合成树形结构以表示'部分-整体'的层次结构，使得用户对单个对象和组合对象的使用具有一致性。",
        "scenarios": ["树形结构", "部分-整体层次", "统一处理", "递归结构", "文件系统"]
    },
    "structural/decorator.md": {
        "title": "装饰器模式 (Decorator Pattern)",
        "description": "装饰器模式动态地给一个对象添加一些额外的职责，就增加功能来说，装饰器模式相比生成子类更为灵活。",
        "scenarios": ["动态添加功能", "避免子类爆炸", "透明装饰", "可撤销装饰", "多重装饰"]
    },
    "structural/facade.md": {
        "title": "外观模式 (Facade Pattern)",
        "description": "外观模式为子系统中的一组接口提供一个一致的界面，定义了一个高层接口，这个接口使得这一子系统更加容易使用。",
        "scenarios": ["简化复杂接口", "子系统解耦", "分层架构", "遗留系统包装", "API简化"]
    },
    "structural/flyweight.md": {
        "title": "享元模式 (Flyweight Pattern)",
        "description": "享元模式运用共享技术有效地支持大量细粒度的对象，减少内存使用。",
        "scenarios": ["大量相似对象", "内存优化", "对象状态分离", "缓存共享", "性能优化"]
    },
    "structural/proxy.md": {
        "title": "代理模式 (Proxy Pattern)",
        "description": "代理模式为其他对象提供一种代理以控制对这个对象的访问。",
        "scenarios": ["远程代理", "虚拟代理", "保护代理", "智能引用", "缓存代理"]
    },
    
    # Behavioral Patterns
    "behavioral/chain-of-responsibility.md": {
        "title": "责任链模式 (Chain of Responsibility Pattern)",
        "description": "责任链模式避免请求发送者与接收者耦合在一起，让多个对象都有可能接收请求，将这些对象连接成一条链，并且沿着这条链传递请求，直到有对象处理它为止。",
        "scenarios": ["多个处理者", "动态处理链", "请求过滤", "审批流程", "事件处理"]
    },
    "behavioral/command.md": {
        "title": "命令模式 (Command Pattern)",
        "description": "命令模式将一个请求封装为一个对象，从而使你可用不同的请求对客户进行参数化；对请求排队或记录请求日志，以及支持可撤销的操作。",
        "scenarios": ["请求封装", "撤销操作", "宏命令", "队列请求", "日志记录"]
    },
    "behavioral/interpreter.md": {
        "title": "解释器模式 (Interpreter Pattern)",
        "description": "解释器模式给定一个语言，定义它的文法的一种表示，并定义一个解释器，这个解释器使用该表示来解释语言中的句子。",
        "scenarios": ["简单语法", "语法解析", "表达式求值", "配置解析", "规则引擎"]
    },
    "behavioral/iterator.md": {
        "title": "迭代器模式 (Iterator Pattern)",
        "description": "迭代器模式提供一种方法顺序访问一个聚合对象中各个元素，而又不需暴露该对象的内部表示。",
        "scenarios": ["集合遍历", "统一访问接口", "多种遍历方式", "延迟加载", "内部结构隐藏"]
    },
    "behavioral/mediator.md": {
        "title": "中介者模式 (Mediator Pattern)",
        "description": "中介者模式用一个中介对象来封装一系列的对象交互，中介者使各对象不需要显式地相互引用，从而使其耦合松散，而且可以独立地改变它们之间的交互。",
        "scenarios": ["复杂交互", "对象解耦", "集中控制", "通信协调", "界面组件"]
    },
    "behavioral/memento.md": {
        "title": "备忘录模式 (Memento Pattern)",
        "description": "备忘录模式在不破坏封装性的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态，这样以后就可将该对象恢复到原先保存的状态。",
        "scenarios": ["状态保存", "撤销操作", "快照功能", "事务回滚", "游戏存档"]
    },
    "behavioral/state.md": {
        "title": "状态模式 (State Pattern)",
        "description": "状态模式允许一个对象在其内部状态改变时改变它的行为，对象看起来似乎修改了它的类。",
        "scenarios": ["状态机", "行为变化", "状态转换", "游戏AI", "工作流"]
    },
    "behavioral/strategy.md": {
        "title": "策略模式 (Strategy Pattern)",
        "description": "策略模式定义一系列的算法，把它们一个个封装起来，并且使它们可相互替换，本模式使得算法可独立于使用它的客户而变化。",
        "scenarios": ["算法选择", "行为切换", "条件分支", "插件系统", "支付方式"]
    },
    "behavioral/template-method.md": {
        "title": "模板方法模式 (Template Method Pattern)",
        "description": "模板方法模式定义一个操作中的算法的骨架，而将一些步骤延迟到子类中，模板方法使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。",
        "scenarios": ["算法框架", "代码复用", "钩子方法", "流程控制", "框架设计"]
    },
    "behavioral/visitor.md": {
        "title": "访问者模式 (Visitor Pattern)",
        "description": "访问者模式表示一个作用于某对象结构中的各元素的操作，它使你可以在不改变各元素的类的前提下定义作用于这些元素的新操作。",
        "scenarios": ["对象结构稳定", "操作经常变化", "数据结构遍历", "编译器设计", "报表生成"]
    },
    
    # Modern Design Patterns
    "modern/mvc-mvp-mvvm.md": {
        "title": "MVC/MVP/MVVM 架构模式",
        "description": "MVC、MVP、MVVM是三种经典的架构模式，用于分离用户界面和业务逻辑。",
        "scenarios": ["前端架构", "界面分离", "数据绑定", "测试友好", "代码组织"]
    },
    "modern/pub-sub.md": {
        "title": "发布订阅模式 (Pub/Sub Pattern)",
        "description": "发布订阅模式是观察者模式的变体，通过消息代理实现发布者和订阅者的完全解耦。",
        "scenarios": ["事件驱动", "消息队列", "微服务通信", "实时通知", "系统解耦"]
    },
    "modern/module.md": {
        "title": "模块模式 (Module Pattern)",
        "description": "模块模式提供了一种将代码组织成独立、可重用单元的方法，支持封装和命名空间。",
        "scenarios": ["代码组织", "命名空间", "私有变量", "API设计", "依赖管理"]
    },
    "modern/dependency-injection.md": {
        "title": "依赖注入模式 (Dependency Injection Pattern)",
        "description": "依赖注入是一种实现控制反转的技术，用于实现对象之间的松耦合。",
        "scenarios": ["控制反转", "松耦合", "测试友好", "配置管理", "框架设计"]
    },
    "modern/repository.md": {
        "title": "仓储模式 (Repository Pattern)",
        "description": "仓储模式封装了数据访问逻辑，提供了一个更面向对象的数据持久化视图。",
        "scenarios": ["数据访问", "业务逻辑分离", "测试隔离", "数据源抽象", "CRUD操作"]
    },
    "modern/unit-of-work.md": {
        "title": "工作单元模式 (Unit of Work Pattern)",
        "description": "工作单元模式维护一个受业务事务影响的对象列表，并协调写出变更和解决并发问题。",
        "scenarios": ["事务管理", "变更跟踪", "批量操作", "数据一致性", "性能优化"]
    },
    "modern/specification.md": {
        "title": "规约模式 (Specification Pattern)",
        "description": "规约模式将业务规则封装在一个可组合和可重用的对象中。",
        "scenarios": ["业务规则", "查询条件", "验证逻辑", "规则组合", "动态查询"]
    },
    "modern/cqrs.md": {
        "title": "CQRS 模式 (Command Query Responsibility Segregation)",
        "description": "CQRS模式将读操作和写操作分离到不同的模型中，以优化性能、可扩展性和安全性。",
        "scenarios": ["读写分离", "性能优化", "复杂查询", "事件溯源", "微服务架构"]
    },
    
    # Microservices Patterns
    "microservices/api-gateway.md": {
        "title": "API 网关模式 (API Gateway Pattern)",
        "description": "API网关作为所有客户端请求的单一入口点，提供路由、认证、限流等功能。",
        "scenarios": ["统一入口", "请求路由", "认证授权", "限流熔断", "协议转换"]
    },
    "microservices/circuit-breaker.md": {
        "title": "断路器模式 (Circuit Breaker Pattern)",
        "description": "断路器模式防止应用程序不断地尝试执行可能会失败的操作，提供故障快速恢复能力。",
        "scenarios": ["故障隔离", "快速失败", "自动恢复", "服务保护", "降级处理"]
    },
    "microservices/service-discovery.md": {
        "title": "服务发现模式 (Service Discovery Pattern)",
        "description": "服务发现模式使服务能够找到并与其他服务通信，而无需硬编码网络位置。",
        "scenarios": ["动态定位", "负载均衡", "健康检查", "服务注册", "配置管理"]
    },
    "microservices/event-sourcing.md": {
        "title": "事件溯源模式 (Event Sourcing Pattern)",
        "description": "事件溯源模式将应用程序状态存储为事件序列，而不是当前状态的快照。",
        "scenarios": ["状态重建", "审计日志", "时间旅行", "事件回放", "数据恢复"]
    }
}

def create_pattern_file(file_path: str, pattern_info: dict):
    """Create a single design pattern documentation file"""
    
    title = pattern_info["title"]
    description = pattern_info["description"]
    scenarios = pattern_info["scenarios"]
    
    content = f"""# {title}

> [!NOTE]
> {description}

## 📖 模式定义

**{title.split(' ')[0]}**是一种设计模式，{description.lower()}

### 核心要素
- **要素1**：描述核心组成部分
- **要素2**：描述核心组成部分
- **要素3**：描述核心组成部分
- **要素4**：描述核心组成部分

## 🎯 使用场景

### 适用情况
{chr(10).join(f'- **{scenario}**：{scenario}相关的应用场景' for scenario in scenarios)}

### 不适用情况
- 场景1：不适用的情况
- 场景2：不适用的情况
- 场景3：不适用的情况

## 💡 实现方式

### TypeScript 实现

```typescript
// 基础接口定义
interface PatternInterface {{
    method(): void;
}}

// 具体实现
class ConcreteImplementation implements PatternInterface {{
    method(): void {{
        console.log('具体实现');
    }}
}}

// 使用示例
const instance = new ConcreteImplementation();
instance.method();
```

### Java 实现

```java
// 基础接口
public interface PatternInterface {{
    void method();
}}

// 具体实现
public class ConcreteImplementation implements PatternInterface {{
    @Override
    public void method() {{
        System.out.println("具体实现");
    }}
}}

// 使用示例
public class PatternExample {{
    public static void main(String[] args) {{
        PatternInterface instance = new ConcreteImplementation();
        instance.method();
    }}
}}
```

### Python 实现

```python
from abc import ABC, abstractmethod

# 基础接口
class PatternInterface(ABC):
    @abstractmethod
    def method(self):
        pass

# 具体实现
class ConcreteImplementation(PatternInterface):
    def method(self):
        print("具体实现")

# 使用示例
if __name__ == "__main__":
    instance = ConcreteImplementation()
    instance.method()
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **优点1**：具体的优点描述
2. **优点2**：具体的优点描述
3. **优点3**：具体的优点描述
4. **优点4**：具体的优点描述

### ❌ 缺点
1. **缺点1**：具体的缺点描述
2. **缺点2**：具体的缺点描述
3. **缺点3**：具体的缺点描述

## 🌟 实际应用案例

### 1. 应用案例1

```typescript
// 实际应用的代码示例
class RealWorldExample {{
    constructor() {{
        console.log('实际应用案例');
    }}
    
    demonstrate(): void {{
        console.log('演示实际应用');
    }}
}}

// 使用示例
const example = new RealWorldExample();
example.demonstrate();
```

### 2. 应用案例2

```typescript
// 另一个实际应用的代码示例
class AnotherExample {{
    process(): void {{
        console.log('另一个应用案例');
    }}
}}
```

## 🔄 相关模式

### 与其他模式的关系
- **相关模式1**：关系描述
- **相关模式2**：关系描述
- **相关模式3**：关系描述

### 模式组合

```typescript
// 与其他模式组合使用的示例
class CombinedPattern {{
    // 组合使用的实现
}}
```

## 🚀 最佳实践

### 1. 实践建议1

```typescript
// 最佳实践的代码示例
class BestPracticeExample {{
    // 实现最佳实践
}}
```

### 2. 实践建议2

```typescript
// 另一个最佳实践示例
class AnotherBestPractice {{
    // 实现细节
}}
```

## ⚠️ 注意事项

1. **注意事项1**：具体的注意事项说明
2. **注意事项2**：具体的注意事项说明
3. **注意事项3**：具体的注意事项说明
4. **注意事项4**：具体的注意事项说明
5. **注意事项5**：具体的注意事项说明

## 📚 总结

{title.split(' ')[0]}是一个[实用/重要/复杂]的设计模式，它[主要作用和价值]。这个模式在[应用场景]中特别有用。

**使用建议**：
- 建议1：具体的使用建议
- 建议2：具体的使用建议
- 建议3：具体的使用建议
- 建议4：具体的使用建议

---

**相关链接**：
- [相关模式1](./related-pattern1.md)
- [相关模式2](./related-pattern2.md)
- [相关模式3](./related-pattern3.md)
"""

    return content

def main():
    """Main function: batch create design pattern documentation files"""
    
    # Get current script directory
    script_dir = Path(__file__).parent
    
    print("🚀 Starting to create design pattern documentation files...")
    print(f"📁 Working directory: {script_dir}")
    
    created_count = 0
    skipped_count = 0
    
    for file_path, pattern_info in PATTERN_FILES.items():
        full_path = script_dir / file_path
        
        # Ensure directory exists
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Check if file already exists
        if full_path.exists():
            print(f"⏭️  Skipping existing file: {file_path}")
            skipped_count += 1
            continue
        
        # Create file content
        content = create_pattern_file(file_path, pattern_info)
        
        # Write file
        try:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Created file: {file_path}")
            created_count += 1
        except Exception as e:
            print(f"❌ Failed to create file {file_path}: {e}")
    
    print(f"\n📊 Creation completed!")
    print(f"✅ New files created: {created_count}")
    print(f"⏭️  Files skipped: {skipped_count}")
    print(f"📝 Total files: {len(PATTERN_FILES)}")
    
    if created_count > 0:
        print(f"\n💡 Tip: New files contain basic templates, you can further improve the content as needed.")
        print(f"🔗 All file links are configured in index.md and can be accessed directly.")

if __name__ == "__main__":
    main() 