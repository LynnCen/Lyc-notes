#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

# 定义需要创建的文件
files_to_create = [
    # Behavioral patterns
    ('behavioral/interpreter.md', 'Interpreter Pattern', '解释器模式'),
    ('behavioral/iterator.md', 'Iterator Pattern', '迭代器模式'),
    ('behavioral/mediator.md', 'Mediator Pattern', '中介者模式'),
    ('behavioral/memento.md', 'Memento Pattern', '备忘录模式'),
    ('behavioral/state.md', 'State Pattern', '状态模式'),
    ('behavioral/strategy.md', 'Strategy Pattern', '策略模式'),
    ('behavioral/template-method.md', 'Template Method Pattern', '模板方法模式'),
    ('behavioral/visitor.md', 'Visitor Pattern', '访问者模式'),
    
    # Modern patterns
    ('modern/mvc.md', 'MVC Pattern', 'MVC模式'),
    ('modern/mvp.md', 'MVP Pattern', 'MVP模式'),
    ('modern/mvvm.md', 'MVVM Pattern', 'MVVM模式'),
    ('modern/pub-sub.md', 'Publish-Subscribe Pattern', '发布订阅模式'),
    ('modern/dependency-injection.md', 'Dependency Injection Pattern', '依赖注入模式'),
    
    # Microservices patterns
    ('microservices/cqrs.md', 'CQRS Pattern', 'CQRS模式'),
    ('microservices/api-gateway.md', 'API Gateway Pattern', 'API网关模式'),
    ('microservices/circuit-breaker.md', 'Circuit Breaker Pattern', '断路器模式'),
    ('microservices/service-discovery.md', 'Service Discovery Pattern', '服务发现模式'),
    ('microservices/event-sourcing.md', 'Event Sourcing Pattern', '事件溯源模式'),
]

def create_pattern_file(filepath, english_name, chinese_name):
    """创建设计模式文档文件"""
    
    # 确保目录存在
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # 如果文件已存在，跳过
    if os.path.exists(filepath):
        print(f"文件已存在，跳过: {filepath}")
        return
    
    # 生成基础模板
    content = f"""# {chinese_name} ({english_name})

> [!NOTE]
> {chinese_name}的简要描述。

## 📖 模式定义

**{chinese_name}**是一种设计模式，用于解决特定的设计问题。

### 核心要素
- **要素1**：描述
- **要素2**：描述
- **要素3**：描述

## 🎯 使用场景

### 适用情况
- **场景1**：描述
- **场景2**：描述
- **场景3**：描述

### 不适用情况
- 场景过于简单
- 不需要额外的抽象层

## 💡 实现方式

### TypeScript 实现

```typescript
// 基础接口
interface Pattern {{
    execute(): void;
}}

// 具体实现
class ConcretePattern implements Pattern {{
    execute(): void {{
        console.log('执行{chinese_name}');
    }}
}}

// 使用示例
const pattern = new ConcretePattern();
pattern.execute();
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **优点1**：描述
2. **优点2**：描述
3. **优点3**：描述

### ❌ 缺点
1. **缺点1**：描述
2. **缺点2**：描述

## 🌟 实际应用案例

### 应用场景示例

```typescript
// 实际应用示例
class RealWorldExample {{
    constructor(private name: string) {{}}
    
    process(): void {{
        console.log(`处理 ${{this.name}}`);
    }}
}}

// 使用示例
const example = new RealWorldExample('示例');
example.process();
```

## 🔄 相关模式

- **相关模式1**：关系描述
- **相关模式2**：关系描述

## 🚀 最佳实践

1. **实践1**：描述
2. **实践2**：描述
3. **实践3**：描述

## ⚠️ 注意事项

1. **注意点1**：描述
2. **注意点2**：描述
3. **注意点3**：描述

## 📚 总结

{chinese_name}提供了一种有效的解决方案来处理特定的设计问题。

**使用建议**：
- 当需要解决特定问题时使用
- 当系统需要特定功能时使用
- 当需要提高代码质量时使用

---

**相关链接**：
- [其他模式](../index.md)
"""
    
    # 写入文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"创建文件: {filepath}")

def main():
    print("开始创建剩余的设计模式文档...")
    
    created_count = 0
    for filepath, english_name, chinese_name in files_to_create:
        try:
            create_pattern_file(filepath, english_name, chinese_name)
            created_count += 1
        except Exception as e:
            print(f"创建文件失败 {filepath}: {e}")
    
    print(f"\n完成！共创建了 {created_count} 个文件")

if __name__ == "__main__":
    main() 