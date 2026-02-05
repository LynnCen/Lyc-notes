# Kernel-X 架构详解

## 一、架构总览

### 1.1 核心设计理念

Kernel-X 借鉴了 **VSCode 扩展系统** 和 **依赖注入框架** 的设计思想，实现了一套可插拔、可组装的编辑器架构：

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Kernel-X 核心架构                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                     KernelBuilder                           │    │
│   │                   （内核构建器）                             │    │
│   └──────────────────────────┬─────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                    KernelContext                            │    │
│   │                    （内核上下文）                           │    │
│   │                                                              │    │
│   │  ┌──────────────┬──────────────┬──────────────┬─────────┐  │    │
│   │  │  extensions  │  components  │   services   │  events │  │    │
│   │  │   Registry   │   Registry   │   Registry   │ Registry│  │    │
│   │  └──────────────┴──────────────┴──────────────┴─────────┘  │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                      Token 系统                             │    │
│   │                                                              │    │
│   │  ServiceToken<T>  ComponentToken<T>  ExtensionToken<T>      │    │
│   │                                                              │    │
│   │  作用：唯一标识 + 类型推断 + 依赖声明                        │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 三层架构

Kernel-X 采用**严格的三层架构**，每层有明确的访问权限：

```
┌─────────────────────────────────────────────────────────────────────┐
│                          三层架构设计                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Extensions 层（应用层）                                       │   │
│  │                                                                │   │
│  │  职责：场景化整合，聚合多层能力实现特定业务功能                │   │
│  │  可访问：extensions ✓  components ✓  services ✓  events ✓    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│                              ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Components 层（UI层）                                         │   │
│  │                                                                │   │
│  │  职责：业务专属UI组件，可视化渲染 + 轻量交互                   │   │
│  │  可访问：extensions ✗  components ✓  services ✓  events ✓    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│                              ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Services 层（逻辑层）                                         │   │
│  │                                                                │   │
│  │  职责：纯业务逻辑处理，无UI代码，支持SSR                       │   │
│  │  可访问：extensions ✗  components ✗  services ✓  events ✓    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  关键规则：上层可以依赖下层，下层禁止依赖上层                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 二、Token 系统：类型安全的身份标识

### 2.1 Token 的本质

Token 是扩展的**唯一身份标识 + 类型载体**，它解决了传统字符串 ID 的类型不安全问题：

```typescript
// Token 的类型定义
interface ServiceToken<T = any> {
    readonly id: string;           // 唯一标识符
    readonly __brand: 'service';   // 品牌标记，确保类型安全
}

// 创建 Token 的工厂函数
function createServiceToken<T>(id: string): ServiceToken<T> {
    return { id, __brand: 'service' } as ServiceToken<T>;
}
```

### 2.2 Token 的三重作用

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Token 的三重作用                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  1. 唯一标识                                                │     │
│  │                                                              │     │
│  │  // 不同服务有不同的 Token                                   │     │
│  │  const UserServiceToken = createServiceToken('user');        │     │
│  │  const VipServiceToken = createServiceToken('vip');          │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  2. 类型推断                                                │     │
│  │                                                              │     │
│  │  // 泛型参数 T 携带 API 类型信息                             │     │
│  │  const UserServiceToken = createServiceToken<UserServiceAPI>│     │
│  │      ('user');                                               │     │
│  │                                                              │     │
│  │  // 获取时自动推断类型                                       │     │
│  │  const userService = await context.services.get(             │     │
│  │      UserServiceToken                                        │     │
│  │  );                                                          │     │
│  │  userService.login();  // ✓ 有类型提示                       │     │
│  │  userService.xxx();    // ✗ 编译错误                         │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  3. 依赖声明                                                │     │
│  │                                                              │     │
│  │  // Token 用于声明扩展依赖                                   │     │
│  │  defineServiceExtension({                                    │     │
│  │      id: VipServiceToken.id,                                 │     │
│  │      dependencies: [UserServiceToken],  // 声明依赖          │     │
│  │      async activate(context) { ... }                         │     │
│  │  });                                                         │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 品牌类型的作用

`__brand` 字段实现了**编译期层级隔离**：

```typescript
// ServiceToken 和 ComponentToken 是不同类型
interface ServiceToken<T> {
    readonly __brand: 'service';
}

interface ComponentToken<T> {
    readonly __brand: 'component';
}

// 注册表只接受对应类型的 Token
interface ServiceRegistry {
    get<T>(token: ServiceToken<T>): Promise<T | undefined>;  // 只接受 ServiceToken
}

interface ComponentRegistry {
    get<T>(token: ComponentToken<T>): Promise<T | undefined>;  // 只接受 ComponentToken
}

// 使用错误的 Token 会编译报错
const componentToken = createComponentToken<API>('layout');
context.services.get(componentToken);  // ❌ 类型错误：不能把 ComponentToken 传给 ServiceRegistry
```

### 2.4 实际的 Token 定义示例

```typescript
// kernel-x-services/src/services/user/token.ts
import { createServiceToken } from '@design/kernel-x';
import type { UserServiceAPI } from './type';

/** 用户服务 Token */
export const UserServiceToken: ServiceToken<UserServiceAPI> =
    createServiceToken<UserServiceAPI>('user');

// kernel-x-services/src/services/user/type.ts
import type { useUserService } from '@design/services';

/**
 * 用户服务 API 类型
 * 直接复用原有 Pinia Store 的返回类型
 */
export type UserServiceAPI = ReturnType<typeof useUserService>;
```

---

## 三、扩展定义：Manifest + Activate

### 3.1 扩展的完整结构

每个扩展包含 **4 个文件**，形成清晰的代码组织：

```
user/
├── token.ts      # Token 定义
├── type.ts       # API 类型定义
├── manifest.ts   # 元数据（依赖声明）
└── index.ts      # 扩展实现
```

### 3.2 Manifest：元数据声明

Manifest 是扩展的**静态元数据**，声明了扩展的身份和依赖：

```typescript
// kernel-x-services/src/services/init-design/manifest.ts
import type { ServiceToken } from '@design/kernel-x';
import { UserServiceToken } from '../user/token';
import { CollabServiceToken } from '../collab/token';
import { VipServiceToken } from '../vip/token';
import { InitDesignServiceToken } from './token';

export const manifest: {
    id: string;
    dependencies: Array<ServiceToken<any>>;
} = {
    id: InitDesignServiceToken.id,            // 扩展标识
    dependencies: [                            // 依赖列表
        UserServiceToken,
        CollabServiceToken,
        VipServiceToken,
        // ... 更多依赖
    ],
};
```

**Manifest 的解析时机**：
- 注册时：系统读取 `id` 和 `dependencies` 进行依赖检查
- 激活时：系统根据依赖限制 Context 的访问权限

### 3.3 Activate：运行时初始化

`activate` 函数是扩展的核心，负责：
1. 获取依赖
2. 执行初始化逻辑
3. 返回对外 API

```typescript
// kernel-x-services/src/services/init-design/index.ts
import { defineServiceExtension } from '@design/kernel-x';
import { manifest } from './manifest';
import type { InitDesignServiceAPI } from './type';

function createInitDesignExtension(options: InitDesignExtensionOptions) {
    return defineServiceExtension<InitDesignServiceAPI>({
        ...manifest,                           // 展开元数据
        autoActivate: true,                    // 注册时立即激活
        
        async activate(context) {              // 激活函数
            // 1. 获取依赖（通过 context 而非 import）
            const getUserApi = async () => 
                (await context.services.get(UserServiceToken))!;
            const getVipApi = async () => 
                await context.services.get(VipServiceToken);
            
            // 2. 执行初始化逻辑
            initEnv(options.env);
            await initAPI(options.apis);
            initPermission(options.permissions);
            
            // 3. 返回对外 API
            return {
                getEditorConfigService() {
                    return editorConfigService;
                },
                async createApp(createOptions) {
                    // 创建 Vue 应用逻辑
                    return { app, vm, router };
                }
            };
        }
    });
}
```

### 3.4 defineXxxExtension 辅助函数

框架提供辅助函数，自动注入层级标记：

```typescript
// kernel-x/core/src/types.ts
export function defineServiceExtension<T>(
    extension: Omit<IExtension<T, ServiceContext, 'service'>, '__layer'>,
): ServiceExtension<T> {
    return { ...extension, __layer: 'service' as const };
}

export function defineComponentExtension<T>(
    extension: Omit<IExtension<T, ComponentContext, 'component'>, '__layer'>,
): ComponentExtension<T> {
    return { ...extension, __layer: 'component' as const };
}

export function defineExtension<T>(
    extension: Omit<IExtension<T, ExtensionContext, 'extension'>, '__layer'>,
): Extension<T> {
    return { ...extension, __layer: 'extension' as const };
}
```

---

## 四、注册流程详解

### 4.1 注册入口

所有扩展通过 `KernelBuilder.initialize()` 或直接调用 `context.xxx.register()` 注册：

```typescript
// foundations/design/src/install.ts
export async function installDesign(selector: string, options: Options) {
    // 1. 创建内核构建器
    const builder = new KernelBuilder();
    const context = builder.getContext();
    
    // 2. 注册所有扩展
    builder.initialize({
        services: [
            createInitDesignExtension(options),
            createUserExtension(),
            createVipExtension(),
            // ... 50+ 服务扩展
        ],
        components: [
            createLazyDesignLayoutExtension(),
            createLazyAgentLayoutExtension(),
        ],
    });
    
    // 3. 获取服务并使用
    const initDesignApi = await context.services.get(InitDesignServiceToken);
    const { app } = await initDesignApi.createApp({ ... });
    
    return { app, builder };
}
```

### 4.2 KernelBuilder 实现

```typescript
// kernel-x/core/src/builder/kernel-builder.ts
export class KernelBuilder {
    private context: KernelContextImpl;
    
    constructor() {
        this.context = new KernelContextImpl();
    }
    
    initialize(config: KernelConfig) {
        // 按层级顺序注册（从底层到顶层）
        if (config.services) {
            this.context.services.register(config.services);
        }
        
        if (config.components) {
            this.context.components.register(config.components);
        }
        
        if (config.extensions) {
            this.context.extensions.register(config.extensions);
        }
    }
    
    getContext(): KernelContext {
        return this.context;
    }
}
```

### 4.3 KernelContext 实现

```typescript
// kernel-x/core/src/context/context.ts
export class KernelContextImpl implements KernelContext {
    readonly extensions: ExtensionRegistry;
    readonly components: ComponentRegistry;
    readonly services: ServiceRegistry;
    readonly events: EventRegistry;
    
    constructor() {
        // 事件注册表独立于分层架构
        this.events = new EventRegistryImpl();
        
        // 按照依赖顺序初始化注册表（从底层到顶层）
        this.services = new ServiceRegistryImpl(this);
        this.components = new ComponentRegistryImpl(this);
        this.extensions = new ExtensionRegistryImpl(this);
    }
}
```

### 4.4 注册表的 register 方法

这是最核心的注册逻辑：

```typescript
// kernel-x/core/src/registry/base-registry.ts
async register(extensions: IExtension | IExtension[]) {
    const extensionsList = Array.isArray(extensions) ? extensions : [extensions];
    
    // Step 1: 依赖检查
    const allExtensions = this.collectAccessibleExtensions();
    checkMissingDependencies(extensionsList, allExtensions);
    
    // Step 2: 逐个处理扩展
    for (const extension of extensionsList) {
        // 2.1 创建扩展（包装 activate/deactivate）
        const result = this.createExtension(extension);
        
        if (result) {
            // 2.2 根据 autoActivate 配置决定激活时机
            const { autoActivate } = extension;
            
            if (typeof autoActivate === 'function') {
                // 条件化自启动
                this.checkAutoActivatePromise(extension);
            } else if (autoActivate === true) {
                // 立即激活
                extension.activate(this.createContextForExtension(extension));
            }
            // autoActivate === false: 延迟加载，get 时激活
        }
    }
}
```

### 4.5 依赖检查详解

```typescript
// kernel-x/core/src/utils/dependency-graph.ts
export function checkMissingDependencies<T extends DependencyNode>(
    nodes: T[],
    existingNodes?: Map<string, T>,
): void {
    // 1. 构建所有可用节点的 ID 集合
    const allNodeIds = new Set<string>(existingNodes?.keys());
    for (const node of nodes) {
        allNodeIds.add(node.id);
    }
    
    // 2. 检查每个节点的依赖是否都存在
    for (const node of nodes) {
        if (node.dependencies && node.dependencies.length > 0) {
            const missing = node.dependencies
                .filter(dep => !allNodeIds.has(dep.id))
                .map(dep => dep.id);
            
            if (missing.length > 0) {
                throw new MissingDependencyError(node.id, missing);
            }
        }
    }
}
```

**依赖检查流程图**：

```
┌─────────────────────────────────────────────────────────────────────┐
│                      依赖检查流程                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  输入：                                                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  待注册扩展列表                                               │    │
│  │  [InitDesign, User, Vip, Collab, ...]                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Step 1: 收集所有可访问层级的已注册扩展                       │    │
│  │                                                               │    │
│  │  collectAccessibleExtensions()                                │    │
│  │  → Services 层可访问: [services]                              │    │
│  │  → Components 层可访问: [services, components]                │    │
│  │  → Extensions 层可访问: [services, components, extensions]    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Step 2: 构建 allNodeIds 集合                                 │    │
│  │                                                               │    │
│  │  已存在 + 待注册 = 所有可用的扩展 ID                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Step 3: 逐一检查每个扩展的依赖                               │    │
│  │                                                               │    │
│  │  for each extension:                                          │    │
│  │    for each dependency in extension.dependencies:             │    │
│  │      if dependency.id NOT in allNodeIds:                      │    │
│  │        throw MissingDependencyError                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│                         检查通过，继续注册                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 五、激活机制详解

### 5.1 三种激活模式

```typescript
// 模式 1: 立即激活（autoActivate: true）
defineServiceExtension({
    id: 'immediate-service',
    autoActivate: true,  // 注册时立即激活
    async activate(context) { ... }
});

// 模式 2: 延迟加载（autoActivate: false）
defineServiceExtension({
    id: 'lazy-service',
    autoActivate: false,  // 不自启动，get() 时才激活
    async activate(context) {
        // 首次 get() 时才执行
        const heavyModule = await import('./heavy-module');
        return heavyModule;
    }
});

// 模式 3: 条件化自启动（autoActivate: async () => {}）
defineServiceExtension({
    id: 'conditional-service',
    autoActivate: async (context) => {
        // 等待某个条件满足
        const dep = await context.services.get(SomeToken);
        if (!dep) {
            throw new Error('依赖未就绪');  // 阻止激活
        }
        // Promise resolve 后扩展会被激活
    },
    async activate(context) { ... }
});
```

### 5.2 激活包装器

`createActivateWrapper` 确保扩展只激活一次，并处理并发请求：

```typescript
// kernel-x/core/src/registry/base-registry.ts
private createActivateWrapper(extension: IExtension): IExtension['activate'] {
    const originalActivate = extension.activate;
    
    return async (context) => {
        const extensionId = extension.id;
        
        // 1. 幂等性检查：已激活直接返回结果
        if (this.activationResults.has(extensionId)) {
            return this.activationResults.get(extensionId);
        }
        
        // 2. 并发安全：正在激活中，等待完成
        const existingPromise = this.activatingPromises.get(extensionId);
        if (existingPromise) {
            return existingPromise;
        }
        
        // 3. 创建激活 Promise
        const activatePromise = (async () => {
            // 等待微任务队列清空，确保所有扩展都已注册
            await Promise.resolve();
            
            try {
                // 调用原始 activate
                const result = await originalActivate.call(extension, context);
                
                // 保存结果
                this.activationResults.set(extensionId, result);
                return result;
            } catch (error) {
                // 激活失败，允许重试
                this.activationResults.delete(extensionId);
                throw error;
            } finally {
                this.activatingPromises.delete(extensionId);
            }
        })();
        
        // 保存 Promise 供并发请求共享
        this.activatingPromises.set(extensionId, activatePromise);
        return activatePromise;
    };
}
```

**激活流程图**：

```
┌─────────────────────────────────────────────────────────────────────┐
│                         激活流程                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  context.services.get(UserServiceToken)                              │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  activationResults.has(id)?                                   │    │
│  │  ├─ Yes → 直接返回缓存结果                                   │    │
│  │  └─ No  → 继续                                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  activatingPromises.has(id)?                                  │    │
│  │  ├─ Yes → 等待正在进行的激活完成                             │    │
│  │  └─ No  → 继续                                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  extensions.has(id)?                                          │    │
│  │  ├─ Yes → 创建 Context 并激活                                │    │
│  │  └─ No  → 返回 undefined（未注册）                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  createContextForExtension(extension)                         │    │
│  │  → 创建带依赖检查的受限 Context                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  extension.activate(context)                                  │    │
│  │  → 执行用户定义的激活逻辑                                     │    │
│  │  → 返回扩展 API                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  保存结果到 activationResults                                 │    │
│  │  返回 API 给调用者                                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Context 创建与依赖检查

每次激活时，系统为扩展创建**受限的 Context**：

```typescript
// kernel-x/core/src/registry/service-registry.ts
protected createContext(
    extension: IExtension<any, ServiceContext>,
    eventSubscriptions: Unsubscribe[],
): ServiceContext {
    return {
        services: {
            // 带依赖检查的 get 方法
            get: this.createDependencyCheckedGet(extension, this.get.bind(this)),
        },
        // 带自动清理的事件注册表
        events: this.createTrackedEventRegistry(eventSubscriptions),
    };
}

// 依赖检查的 get 方法
protected createDependencyCheckedGet<T extends AnyToken>(
    extension: IExtension<any, TContext>,
    registryGet: (token: T) => Promise<any>,
): (token: T) => Promise<any> {
    return (token: T) => {
        // 检查 token 是否在 extension.dependencies 中声明
        const hasDependency = extension.dependencies?.some(
            dep => dep.id === token.id
        );
        
        if (!hasDependency) {
            throw new Error(
                `扩展 ${extension.id} 未声明依赖 ${token.id}，无法访问`
            );
        }
        
        return registryGet(token);
    };
}
```

**关键点**：如果扩展尝试获取未声明的依赖，会立即抛出错误！

---

## 六、组件扩展与渲染

### 6.1 组件扩展定义

组件扩展返回 **Vue 组件** 作为 API：

```typescript
// kernel-x-components/src/extensions/design-layout/index.ts
export function createDesignLayoutExtension() {
    return defineComponentExtension<DesignLayoutAPI>({
        ...manifest,
        dependencies: [InitDesignServiceToken],
        
        async activate(context) {
            // 1. 获取依赖的服务
            const initDesignApi = await context.services.get(InitDesignServiceToken);
            
            if (initDesignApi) {
                // 2. 从服务获取配置
                const editorConfigService = initDesignApi.getEditorConfigService();
                
                // 3. 同步配置到本地
                setConfig({
                    editorConfigService,
                    extensionConfigService,
                });
            }
            
            // 4. 返回 Vue 组件
            return {
                component: DesignLayoutComponent,  // Vue SFC
            };
        },
    });
}

// API 类型定义
export interface DesignLayoutAPI {
    component: DefineComponent<{}, {}, any>;
}
```

### 6.2 懒加载组件

使用 `autoActivate: false` + 动态 import 实现代码分割：

```typescript
// kernel-x-components/src/extensions/design-layout/lazy.ts
export function createLazyDesignLayoutExtension() {
    return defineComponentExtension<DesignLayoutAPI>({
        ...manifest,
        autoActivate: false,  // 关键：延迟加载
        
        async activate(context) {
            // 动态导入实际的扩展代码
            const { createDesignLayoutExtension } = await import(
                /* vitePreload: true */  // Vite 预加载提示
                './index'
            );
            
            // 创建实际扩展并激活
            const extension = createDesignLayoutExtension();
            return extension.activate(context);
        },
    });
}
```

### 6.3 路由集成

组件通过 `defineAsyncComponent` 集成到 Vue Router：

```typescript
// foundations/design/src/init/init-router.ts
export async function getRoutes(
    builder: KernelBuilder,
    layoutMode: 'design' | 'agent',
): Promise<RouterOptions['routes']> {
    const context = builder.getContext();
    
    return [
        {
            path: '/*',
            name: 'design',
            // 使用 defineAsyncComponent 包装
            component: defineAsyncComponent(async () => {
                if (layoutMode === 'agent') {
                    // 获取组件扩展的 API
                    const api = await context.components.get(AgentLayoutToken);
                    return api!.component;  // 返回 Vue 组件
                } else {
                    const api = await context.components.get(DesignLayoutToken);
                    return api!.component;
                }
            }),
        },
    ];
}
```

**渲染流程**：

```
┌─────────────────────────────────────────────────────────────────────┐
│                      组件渲染流程                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. 路由导航触发                                                      │
│     router.push('/design/xxx')                                       │
│                              │                                        │
│                              ▼                                        │
│  2. Vue Router 解析路由配置                                          │
│     component: defineAsyncComponent(async () => {...})               │
│                              │                                        │
│                              ▼                                        │
│  3. 执行异步组件函数                                                  │
│     context.components.get(DesignLayoutToken)                        │
│                              │                                        │
│                              ▼                                        │
│  4. 触发组件扩展激活（如果未激活）                                   │
│     ├─ 动态 import('./index')                                        │
│     ├─ 创建 Context                                                  │
│     └─ 执行 activate(context)                                        │
│                              │                                        │
│                              ▼                                        │
│  5. 返回 Vue 组件                                                     │
│     return api.component  // DesignLayoutComponent                   │
│                              │                                        │
│                              ▼                                        │
│  6. Vue 渲染组件                                                      │
│     <DesignLayoutComponent />                                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 七、事件系统

### 7.1 类型安全的事件 Token

```typescript
// 事件 Token 定义
interface EventToken<TData = void> {
    readonly key: string;
    readonly _phantom?: TData;  // 幻影类型，保留泛型信息
}

// 创建事件 Token
function createEventToken<TData = void>(key: string): EventToken<TData> {
    return { key } as EventToken<TData>;
}

// 使用示例
const TemplateLoadedEvent = createEventToken<{ template: Template }>(
    'template-loaded'
);

// 发送事件（类型安全）
context.events.emit(TemplateLoadedEvent, { template: loadedTemplate });

// 订阅事件（自动推断类型）
context.events.on(TemplateLoadedEvent, (data) => {
    console.log(data.template);  // ✓ 有类型提示
    console.log(data.xxx);       // ✗ 编译错误
});
```

### 7.2 事件自动清理

通过 Proxy 拦截订阅，在扩展卸载时自动清理：

```typescript
// kernel-x/core/src/registry/base-registry.ts
protected createTrackedEventRegistry(eventSubscriptions: Unsubscribe[]): EventRegistry {
    return new Proxy(this.kernelContext.events, {
        get(target, prop: keyof EventRegistry) {
            if (prop === 'on' || prop === 'once') {
                return <TData>(eventToken: EventToken<TData>, handler: EventHandler<TData>) => {
                    const unsubscribe = target[prop](eventToken, handler);
                    
                    // 包装取消函数，确保从追踪列表中移除
                    const wrappedUnsubscribe = () => {
                        unsubscribe();
                        const index = eventSubscriptions.indexOf(wrappedUnsubscribe);
                        if (index !== -1) {
                            eventSubscriptions.splice(index, 1);
                        }
                    };
                    
                    // 追踪订阅
                    eventSubscriptions.push(wrappedUnsubscribe);
                    return wrappedUnsubscribe;
                };
            }
            
            // 其他方法直接透传
            const value = target[prop];
            return typeof value === 'function' ? value.bind(target) : value;
        },
    });
}
```

### 7.3 事件兼容层

为了平滑迁移，提供旧事件系统的兼容层：

```typescript
// foundations/design/src/event-compat.ts
export function initEventCompatibility(context: KernelContext) {
    // 将旧的 mitt 事件桥接到新的 Token 事件
    Object.entries(lifecycleEventName).forEach(([key, value]) => {
        const token = DesignLifecycleEventTokens[key];
        
        // 旧系统发事件 → 新系统也发
        lifecycleEvent.on(value, (...args: any[]) => {
            context.events.emit(token, ...args);
        });
    });
    
    // 类似处理 editorOutsideEvent、userStatusEvent 等
}
```

---

## 八、完整流程示例

### 8.1 从启动到渲染

```typescript
// apps/design/src/main.ts
import { installDesign } from '@design/design-foundation';

// 1. 调用 installDesign 启动应用
const { app, builder } = await installDesign('#app', 'design', {
    env: { ... },
    apis: { ... },
    editorConfig: { ... },
});
```

完整流程：

```
┌─────────────────────────────────────────────────────────────────────┐
│                      应用启动完整流程                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  installDesign('#app', options)                                      │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  1. 创建 KernelBuilder                                       │    │
│  │     const builder = new KernelBuilder();                     │    │
│  │     const context = builder.getContext();                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  2. 初始化事件兼容层                                         │    │
│  │     initEventCompatibility(context);                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  3. 注册所有扩展                                             │    │
│  │     builder.initialize({                                     │    │
│  │       services: [50+ 服务扩展],                              │    │
│  │       components: [2 组件扩展],                              │    │
│  │     });                                                      │    │
│  │                                                               │    │
│  │     内部流程：                                                │    │
│  │     ├─ 依赖检查                                              │    │
│  │     ├─ 创建扩展（包装 activate/deactivate）                  │    │
│  │     └─ autoActivate: true 的立即激活                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  4. 获取 InitDesign 服务                                     │    │
│  │     const initDesignApi = await context.services.get(        │    │
│  │       InitDesignServiceToken                                 │    │
│  │     );                                                       │    │
│  │                                                               │    │
│  │     此时 InitDesign 已激活（autoActivate: true）             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  5. 获取路由配置                                             │    │
│  │     const routes = await getRoutes(builder, 'design');       │    │
│  │                                                               │    │
│  │     路由中使用 defineAsyncComponent 包装组件                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  6. 创建并挂载 Vue 应用                                      │    │
│  │     const { app, vm, router } = await initDesignApi.createApp│    │
│  │       ({                                                     │    │
│  │         selector: '#app',                                    │    │
│  │         routes,                                              │    │
│  │         rootComponent: App,                                  │    │
│  │       });                                                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  7. 路由导航触发组件加载                                     │    │
│  │     router 匹配 '/*' → 执行 defineAsyncComponent             │    │
│  │     → context.components.get(DesignLayoutToken)              │    │
│  │     → 激活组件扩展                                           │    │
│  │     → 返回 Vue 组件                                          │    │
│  │     → 渲染到页面                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 九、与第一代方案对比

| 维度 | 第一代方案 | Kernel-X |
|-----|-----------|----------|
| **依赖管理** | 隐式 import，运行时确定 | 显式声明，静态检查 |
| **初始化顺序** | 手动编排，靠约定 | 自动解析，按依赖排序 |
| **服务替换** | 修改核心代码，if-else | Token 替换，不改源码 |
| **事件系统** | 字符串事件名，any 类型 | Token + 泛型，类型安全 |
| **内存管理** | 手动清理订阅 | 自动追踪，自动清理 |
| **代码分割** | 无原生支持 | 懒加载扩展，动态 import |
| **层级隔离** | 无限制 | 三层架构，编译期检查 |

---

## 十、小结

本章详细介绍了 Kernel-X 的核心实现：

**Token 系统**：
- 唯一标识 + 类型推断 + 依赖声明
- 品牌类型实现层级隔离

**扩展定义**：
- Manifest 声明元数据
- Activate 执行初始化并返回 API

**注册流程**：
- 依赖检查 → 创建扩展 → 决定激活时机

**激活机制**：
- 三种模式：立即 / 延迟 / 条件化
- 幂等性 + 并发安全

**组件渲染**：
- 组件扩展返回 Vue 组件
- 通过 defineAsyncComponent 集成路由

**事件系统**：
- 类型安全的 EventToken
- 自动追踪和清理订阅

---

> 📖 **系列文档导航**
> 
> - [x] 第一篇：业务现状与基座化需求
> - [x] 第二篇：第一代基座方案实现
> - [x] **第三篇：Kernel-X 架构详解**（本文）
> - [ ] 第四篇：架构演进总结
