# TS 高级用法

## 概述

TypeScript 作为现代 JavaScript 开发的基石，其高级特性为企业级应用开发提供了强大的类型安全保障和开发效率提升。本文档深入探讨 TypeScript 的高级用法，涵盖最新的 TypeScript 5.x 特性、企业级最佳实践以及在 2025 年的发展趋势。

### 为什么掌握 TypeScript 高级特性至关重要

根据 **2024 Stack Overflow Developer Survey**，TypeScript 已连续四年被评为最受欢迎的编程语言之一，86.1% 的开发者表示愿意继续使用 TypeScript。在企业级开发中：

- **类型安全**：减少 40% 的运行时错误
- **开发效率**：提升 60% 的代码重构效率  
- **团队协作**：改善 50% 的代码可维护性
- **AI 代码生成**：47% 的代码库使用 AI 工具，TypeScript 是防范 AI 生成代码错误的第一道防线

## 目录

1. [类型操作和类型编程](#1-类型操作和类型编程)
2. [高级泛型模式](#2-高级泛型模式)
3. [条件类型深度应用](#3-条件类型深度应用)
4. [映射类型和模板字面量类型](#4-映射类型和模板字面量类型)
5. [实用工具类型](#5-实用工具类型)
6. [类型守卫和类型谓词](#6-类型守卫和类型谓词)
7. [模块增强和声明合并](#7-模块增强和声明合并)
8. [装饰器与元编程](#8-装饰器与元编程)
9. [性能优化和编译器配置](#9-性能优化和编译器配置)
10. [企业级最佳实践](#10-企业级最佳实践)
11. [与现代框架的集成](#11-与现代框架的集成)
12. [未来发展和新特性](#12-未来发展和新特性)

---

## 1. 类型操作和类型编程

TypeScript 的类型系统不仅仅是静态类型检查工具，更是一个强大的编程语言。通过类型操作，我们可以在编译时构建复杂的类型逻辑，实现类型级别的编程。

### 1.1 keyof 操作符：类型键提取

`keyof` 操作符提取对象类型的所有键，创建一个联合类型。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// 提取 User 的所有键
type UserKeys = keyof User; // "id" | "name" | "email" | "isActive"

// 实际应用：类型安全的属性访问器
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  isActive: true
};

const userName = getProperty(user, "name"); // 类型：string
const userId = getProperty(user, "id");     // 类型：number
// const invalid = getProperty(user, "invalid"); // ❌ 编译错误
```

### 1.2 索引访问类型：深度类型提取

索引访问类型允许我们提取嵌套对象的类型，支持深度访问和数组元素类型提取。

```typescript
interface ApiResponse {
  data: {
    users: Array<{
      id: number;
      profile: {
        name: string;
        avatar: string;
      };
    }>;
    meta: {
      total: number;
      page: number;
    };
  };
  status: 'success' | 'error';
}

// 提取嵌套类型
type UserData = ApiResponse['data']['users']; // Array<{id: number; profile: {...}}>
type UserItem = ApiResponse['data']['users'][number]; // 数组元素类型
type UserProfile = UserItem['profile']; // {name: string; avatar: string}
type UserName = UserProfile['name']; // string

// 实际应用：类型安全的 API 响应处理
async function fetchUsers(): Promise<ApiResponse['data']['users']> {
  const response = await fetch('/api/users');
  const data: ApiResponse = await response.json();
  return data.data.users;
}

// 提取函数返回类型
type UsersReturnType = Awaited<ReturnType<typeof fetchUsers>>;
```

### 1.3 typeof 操作符：值到类型转换

`typeof` 操作符将 JavaScript 值转换为对应的 TypeScript 类型，在类型编程中极其有用。

```typescript
// 从配置对象推断类型
const appConfig = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  },
  features: {
    darkMode: true,
    notifications: false
  }
} as const; // 使用 as const 保持字面量类型

type AppConfig = typeof appConfig;
type ApiConfig = typeof appConfig.api;
type FeatureFlags = typeof appConfig.features;

// 从函数推断类型
function createUser(data: { name: string; email: string }) {
  return {
    ...data,
    id: Math.random().toString(36),
    createdAt: new Date()
  };
}

type CreateUserParams = Parameters<typeof createUser>[0];
type CreateUserReturn = ReturnType<typeof createUser>;

// 实际应用：从现有对象创建类型
const validationRules = {
  email: (value: string) => /\S+@\S+\.\S+/.test(value),
  password: (value: string) => value.length >= 8,
  name: (value: string) => value.length >= 2
} as const;

type ValidationRules = typeof validationRules;
type ValidationKey = keyof ValidationRules;
type ValidatorFunction = ValidationRules[ValidationKey];

// 类型安全的验证器使用
function validateField<K extends ValidationKey>(
  field: K,
  value: string
): boolean {
  return validationRules[field](value);
}
```

### 1.4 in 操作符：类型收窄

`in` 操作符不仅可以在运行时检查属性，还能在类型层面进行类型收窄。

```typescript
interface Bird {
  type: 'bird';
  fly(): void;
  layEggs(): void;
}

interface Fish {
  type: 'fish';
  swim(): void;
  layEggs(): void;
}

type Animal = Bird | Fish;

// 使用 in 操作符进行类型守卫
function moveAnimal(animal: Animal) {
  if ('fly' in animal) {
    // TypeScript 知道这里 animal 是 Bird 类型
    animal.fly();
  } else {
    // TypeScript 知道这里 animal 是 Fish 类型
    animal.swim();
  }
}

// 高级应用：动态属性检查
function hasProperty<T, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

function processData(data: unknown) {
  if (hasProperty(data, 'users') && Array.isArray(data.users)) {
    // TypeScript 现在知道 data 有 users 属性且是数组
    data.users.forEach(user => {
      console.log(user);
    });
  }
}
```

### 1.5 类型编程实战：构建类型安全的事件系统

结合多种类型操作，我们可以构建复杂的类型安全系统：

```typescript
// 事件定义
interface EventMap {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string };
  'order:created': { orderId: string; amount: number; userId: string };
  'order:paid': { orderId: string; paymentMethod: string };
}

// 事件发射器类型
class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: {
    [K in keyof T]?: Array<(payload: T[K]) => void>;
  } = {};

  // 类型安全的事件监听
  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  // 类型安全的事件发射
  emit<K extends keyof T>(event: K, payload: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(payload));
    }
  }

  // 类型安全的事件移除
  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
}

// 使用示例
const eventBus = new TypedEventEmitter<EventMap>();

// ✅ 类型安全：正确的事件名和载荷类型
eventBus.on('user:login', (payload) => {
  console.log(`User ${payload.userId} logged in at ${payload.timestamp}`);
});

eventBus.emit('user:login', {
  userId: '123',
  timestamp: new Date()
});

// ❌ 编译错误：错误的事件名
// eventBus.on('invalid:event', (payload) => {});

// ❌ 编译错误：错误的载荷类型
// eventBus.emit('user:login', { userId: '123' }); // 缺少 timestamp
```

---

## 2. 高级泛型模式

泛型是 TypeScript 中最强大的特性之一，它允许我们创建可重用、类型安全的代码。掌握高级泛型模式是构建复杂类型系统的关键。

### 2.1 泛型约束与条件泛型

泛型约束使用 `extends` 关键字限制泛型参数的类型范围，提供更精确的类型控制。

```typescript
// 基础泛型约束
interface Identifiable {
  id: string | number;
}

function updateEntity<T extends Identifiable>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates };
}

// 高级约束：keyof 约束
function pluck<T, K extends keyof T>(obj: T, keys: K[]): T[K][] {
  return keys.map(key => obj[key]);
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const user: User = { id: 1, name: "Alice", email: "alice@example.com", age: 30 };
const values = pluck(user, ["name", "email"]); // string[]
// const invalid = pluck(user, ["invalid"]); // ❌ 编译错误

// 条件泛型约束
type NonNullable<T> = T extends null | undefined ? never : T;
type StringOrNumber<T> = T extends string ? string : T extends number ? number : never;

// 实际应用：数据库查询构建器
interface QueryBuilder<T> {
  where<K extends keyof T>(field: K, value: T[K]): QueryBuilder<T>;
  select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>>;
  limit(count: number): QueryBuilder<T>;
  execute(): Promise<T[]>;
}

class DatabaseQuery<T> implements QueryBuilder<T> {
  private conditions: Array<{ field: keyof T; value: any }> = [];
  private selectedFields?: (keyof T)[];
  private limitCount?: number;

  where<K extends keyof T>(field: K, value: T[K]): QueryBuilder<T> {
    this.conditions.push({ field, value });
    return this;
  }

  select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>> {
    this.selectedFields = fields;
    return this as any;
  }

  limit(count: number): QueryBuilder<T> {
    this.limitCount = count;
    return this;
  }

  async execute(): Promise<T[]> {
    // 模拟数据库查询逻辑
    console.log('Executing query with conditions:', this.conditions);
    return [] as T[];
  }
}

// 使用示例
const userQuery = new DatabaseQuery<User>()
  .where('age', 25)
  .where('name', 'Alice')
  .select('id', 'name')
  .limit(10);
```

### 2.2 高阶泛型和泛型推导

利用高阶泛型可以创建更抽象、更通用的类型工具。

```typescript
// 高阶泛型：函数工厂类型
type FunctionFactory<TArgs extends readonly any[], TReturn> = 
  (...args: TArgs) => TReturn;

type AsyncFunctionFactory<TArgs extends readonly any[], TReturn> = 
  (...args: TArgs) => Promise<TReturn>;

// 泛型推导：从函数参数推导返回类型
type InferArgs<T> = T extends (...args: infer A) => any ? A : never;
type InferReturn<T> = T extends (...args: any[]) => infer R ? R : never;

// 实际应用：API 客户端生成器
interface ApiEndpoints {
  getUser: (id: string) => Promise<User>;
  createUser: (data: Omit<User, 'id'>) => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}

type ApiClient<T extends Record<string, (...args: any[]) => any>> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => R
    : never;
};

class HttpApiClient<T extends Record<string, (...args: any[]) => any>> 
  implements ApiClient<T> {
  constructor(private baseUrl: string) {}

  // 动态代理方法生成
  [K in keyof T]: T[K] = new Proxy({} as any, {
    get: (target, prop: string) => {
      return async (...args: any[]) => {
        const response = await fetch(`${this.baseUrl}/${prop}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        });
        return response.json();
      };
    }
  }) as any;
}

// 类型安全的使用
const apiClient = new HttpApiClient<ApiEndpoints>('https://api.example.com');
// apiClient.getUser('123').then(user => console.log(user.name)); // 类型安全
```

### 2.3 递归泛型和深度类型操作

递归泛型允许我们处理任意深度的嵌套结构。

```typescript
// 深度只读类型
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 深度可选类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深度必需类型
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 路径类型：获取嵌套对象的所有可能路径
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends readonly [
  infer F,
  ...infer R
]
  ? F extends string
    ? R extends readonly string[]
      ? R["length"] extends 0
        ? F
        : `${F}${D}${Join<R, D>}`
      : never
    : never
  : never;

type DottedPaths<T> = Join<PathsToStringProps<T>, ".">;

interface NestedConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  cache: {
    redis: {
      host: string;
      port: number;
    };
  };
}

// 生成类型安全的配置路径
type ConfigPaths = DottedPaths<NestedConfig>;
// "database.host" | "database.port" | "database.credentials.username" | 
// "database.credentials.password" | "cache.redis.host" | "cache.redis.port"

// 实际应用：类型安全的配置访问器
function getConfigValue<T, P extends DottedPaths<T>>(
  config: T,
  path: P
): any {
  return path.split('.').reduce((obj: any, key) => obj?.[key], config);
}

const config: NestedConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    credentials: {
      username: 'admin',
      password: 'secret'
    }
  },
  cache: {
    redis: {
      host: 'localhost',
      port: 6379
    }
  }
};

const dbHost = getConfigValue(config, 'database.host'); // string
const redisPort = getConfigValue(config, 'cache.redis.port'); // number
// const invalid = getConfigValue(config, 'invalid.path'); // ❌ 编译错误
```

### 2.4 泛型工厂模式

使用泛型工厂模式可以创建灵活的对象构造系统。

```typescript
// 抽象工厂接口
interface Factory<T> {
  create(...args: any[]): T;
}

// 具体工厂实现
class UserFactory implements Factory<User> {
  create(name: string, email: string): User {
    return {
      id: Math.random(),
      name,
      email,
      age: 0
    };
  }
}

// 泛型工厂注册器
class FactoryRegistry {
  private factories = new Map<string, Factory<any>>();

  register<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
  }

  create<T>(key: string, ...args: any[]): T {
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Factory for key "${key}" not found`);
    }
    return factory.create(...args);
  }
}

// 类型安全的工厂映射
interface FactoryMap {
  user: UserFactory;
  // 可以继续添加其他工厂类型
}

class TypedFactoryRegistry<T extends Record<string, Factory<any>>> {
  private factories: Partial<T> = {};

  register<K extends keyof T>(key: K, factory: T[K]): void {
    this.factories[key] = factory;
  }

  create<K extends keyof T>(
    key: K,
    ...args: T[K] extends Factory<infer U> 
      ? Parameters<T[K]['create']> 
      : never
  ): T[K] extends Factory<infer U> ? U : never {
    const factory = this.factories[key];
    if (!factory) {
      throw new Error(`Factory for key "${String(key)}" not found`);
    }
    return factory.create(...args);
  }
}

// 使用示例
const registry = new TypedFactoryRegistry<FactoryMap>();
registry.register('user', new UserFactory());

const user = registry.create('user', 'Alice', 'alice@example.com'); // 类型安全
```

---

## 3. 条件类型深度应用

条件类型是 TypeScript 类型系统中的控制流语句，它允许我们根据类型关系做出决策。掌握条件类型是构建高级类型工具的关键。

### 3.1 条件类型基础与语法

条件类型使用 `T extends U ? X : Y` 的语法结构，类似于三元运算符。

```typescript
// 基础条件类型
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>;  // true
type Test2 = IsString<number>;  // false

// 嵌套条件类型
type TypeName<T> = 
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type T0 = TypeName<string>;     // "string"
type T1 = TypeName<number>;     // "number"
type T2 = TypeName<() => void>; // "function"

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;
type StrArrOrNumArr = ToArray<string | number>; // string[] | number[]

// 非分布式条件类型（使用元组包装）
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;
type StrOrNumArr = ToArrayNonDistributive<string | number>; // (string | number)[]
```

### 3.2 infer 关键字：类型推断

`infer` 关键字允许我们在条件类型中推断和捕获类型。

```typescript
// 基础推断
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 数组元素类型推断
type ArrayElementType<T> = T extends (infer U)[] ? U : never;
type StringArray = ArrayElementType<string[]>; // string

// Promise 内容类型推断
type Awaited<T> = T extends Promise<infer U> ? U : T;
type PromiseContent = Awaited<Promise<string>>; // string

// 深层嵌套推断
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;
type NestedPromise = DeepAwaited<Promise<Promise<string>>>; // string

// 函数参数和返回值推断
type FunctionInfo<T> = T extends (...args: infer P) => infer R
  ? { parameters: P; returnType: R }
  : never;

function exampleFunction(a: string, b: number): boolean {
  return true;
}

type ExampleInfo = FunctionInfo<typeof exampleFunction>;
// { parameters: [string, number]; returnType: boolean }
```

### 3.3 高级条件类型模式

#### 3.3.1 类型过滤和提取

```typescript
// 提取对象中特定类型的属性
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

interface Example {
  name: string;
  age: number;
  greet(): void;
  calculate(x: number): number;
}

type ExampleFunctionProps = FunctionProperties<Example>;
// { greet(): void; calculate(x: number): number; }

// 过滤可选属性
type OptionalPropertyNames<T> = {
  [K in keyof T]: T extends Record<K, T[K]> ? never : K;
}[keyof T];

type RequiredPropertyNames<T> = {
  [K in keyof T]: T extends Record<K, T[K]> ? K : never;
}[keyof T];

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

type OptionalUserProps = OptionalPropertyNames<User>; // "email" | "phone"
type RequiredUserProps = RequiredPropertyNames<User>; // "id" | "name"
```

#### 3.3.2 类型转换和映射

```typescript
// 条件类型与映射类型结合
type Nullify<T> = {
  [K in keyof T]: T[K] | null;
};

type Stringify<T> = {
  [K in keyof T]: T[K] extends string ? T[K] : string;
};

// 智能类型转换
type SmartPartial<T> = {
  [K in keyof T]: T[K] extends Function ? T[K] : T[K] | undefined;
};

interface ApiService {
  endpoint: string;
  timeout: number;
  request(data: any): Promise<any>;
  retry(): void;
}

type PartialApiService = SmartPartial<ApiService>;
// {
//   endpoint: string | undefined;
//   timeout: number | undefined;
//   request(data: any): Promise<any>;  // 函数保持不变
//   retry(): void;                     // 函数保持不变
// }
```

### 3.4 实际应用案例

#### 3.4.1 类型安全的 API 客户端

```typescript
// API 响应类型定义
interface ApiResponseMap {
  '/users': User[];
  '/users/:id': User;
  '/posts': Post[];
  '/posts/:id': Post;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

// 路径参数提取
type ExtractPathParams<T extends string> = 
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractPathParams<`/${Rest}`>
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

// API 客户端类型
type ApiClient = {
  [K in keyof ApiResponseMap]: 
    ExtractPathParams<K> extends Record<string, never>
      ? () => Promise<ApiResponseMap[K]>
      : (params: ExtractPathParams<K>) => Promise<ApiResponseMap[K]>;
};

// 实现
class TypedApiClient implements ApiClient {
  async '/users'(): Promise<User[]> {
    const response = await fetch('/api/users');
    return response.json();
  }

  async '/users/:id'(params: { id: string }): Promise<User> {
    const response = await fetch(`/api/users/${params.id}`);
    return response.json();
  }

  async '/posts'(): Promise<Post[]> {
    const response = await fetch('/api/posts');
    return response.json();
  }

  async '/posts/:id'(params: { id: string }): Promise<Post> {
    const response = await fetch(`/api/posts/${params.id}`);
    return response.json();
  }
}

// 使用示例
const client = new TypedApiClient();
// const users = await client['/users']();           // User[]
// const user = await client['/users/:id']({ id: '1' }); // User
```

#### 3.4.2 表单验证器类型系统

```typescript
// 验证规则定义
interface ValidationRule<T> {
  required?: boolean;
  min?: T extends number ? number : T extends string ? number : never;
  max?: T extends number ? number : T extends string ? number : never;
  pattern?: T extends string ? RegExp : never;
  custom?: (value: T) => boolean | string;
}

// 从验证规则推断错误类型
type ValidationErrors<T> = {
  [K in keyof T]?: string[];
};

// 智能验证器类型
type FormValidator<T> = {
  [K in keyof T]: ValidationRule<T[K]>;
};

// 验证结果类型
type ValidationResult<T> = {
  isValid: boolean;
  errors: ValidationErrors<T>;
  values: T;
};

// 类型安全的表单验证器
class TypedFormValidator<T> {
  constructor(private rules: FormValidator<T>) {}

  validate(data: Partial<T>): ValidationResult<T> {
    const errors: ValidationErrors<T> = {};
    let isValid = true;

    for (const [field, rule] of Object.entries(this.rules)) {
      const fieldErrors: string[] = [];
      const value = data[field as keyof T];

      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${field} is required`);
        isValid = false;
      }

      if (value !== undefined && rule.min !== undefined) {
        if (typeof value === 'string' && value.length < rule.min) {
          fieldErrors.push(`${field} must be at least ${rule.min} characters`);
          isValid = false;
        } else if (typeof value === 'number' && value < rule.min) {
          fieldErrors.push(`${field} must be at least ${rule.min}`);
          isValid = false;
        }
      }

      if (value !== undefined && rule.custom) {
        const customResult = rule.custom(value);
        if (typeof customResult === 'string') {
          fieldErrors.push(customResult);
          isValid = false;
        } else if (!customResult) {
          fieldErrors.push(`${field} is invalid`);
          isValid = false;
        }
      }

      if (fieldErrors.length > 0) {
        errors[field as keyof T] = fieldErrors;
      }
    }

    return {
      isValid,
      errors,
      values: data as T
    };
  }
}

// 使用示例
interface UserForm {
  name: string;
  email: string;
  age: number;
  website?: string;
}

const userValidator = new TypedFormValidator<UserForm>({
  name: {
    required: true,
    min: 2,
    max: 50
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (email) => email.includes('@') || 'Invalid email format'
  },
  age: {
    required: true,
    min: 18,
    max: 120
  },
  website: {
    pattern: /^https?:\/\/.+/
  }
});

const result = userValidator.validate({
  name: 'Alice',
  email: 'alice@example.com',
  age: 25
});

// result.isValid: boolean
// result.errors: ValidationErrors<UserForm>
// result.values: UserForm
```

---

## 4. 映射类型和模板字面量类型

映射类型和模板字面量类型是 TypeScript 4.1+ 引入的强大特性，它们允许我们基于现有类型创建新类型，并进行字符串操作。

### 4.1 映射类型基础

映射类型允许我们遍历一个类型的所有属性，并对每个属性应用转换。

```typescript
// 基础映射类型语法
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 自定义映射类型
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type Stringify<T> = {
  [P in keyof T]: string;
};

interface User {
  id: number;
  name: string;
  email: string;
}

type NullableUser = Nullable<User>;
// { id: number | null; name: string | null; email: string | null; }

type StringifyUser = Stringify<User>;
// { id: string; name: string; email: string; }
```

### 4.2 高级映射类型模式

#### 4.2.1 键重映射（Key Remapping）

TypeScript 4.1 引入了键重映射功能，使用 `as` 子句重新映射键名。

```typescript
// 基础键重映射
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

type UserGetters = Getters<User>;
// {
//   getId: () => number;
//   getName: () => string;
//   getEmail: () => string;
// }

// 条件键重映射
type EventHandlers<T> = {
  [P in keyof T as T[P] extends Function ? never : `on${Capitalize<string & P>}Change`]: 
    (value: T[P]) => void;
};

interface FormState {
  name: string;
  age: number;
  validate(): boolean;
}

type FormEventHandlers = EventHandlers<FormState>;
// {
//   onNameChange: (value: string) => void;
//   onAgeChange: (value: number) => void;
//   // validate 被过滤掉了
// }

// 复杂键变换
type ApiEndpoints<T> = {
  [P in keyof T as `/${string & P}`]: (data: T[P]) => Promise<T[P]>;
};

interface UserOperations {
  create: User;
  update: Partial<User>;
  delete: { id: number };
}

type UserApiEndpoints = ApiEndpoints<UserOperations>;
// {
//   "/create": (data: User) => Promise<User>;
//   "/update": (data: Partial<User>) => Promise<Partial<User>>;
//   "/delete": (data: { id: number }) => Promise<{ id: number }>;
// }
```

#### 4.2.2 高级映射模式

```typescript
// 深度映射
type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

type DeepNonNullable<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepNonNullable<T[P]> : NonNullable<T[P]>;
};

// 类型转换映射
type SerializeObject<T> = {
  [P in keyof T]: T[P] extends Date
    ? string
    : T[P] extends object
    ? SerializeObject<T[P]>
    : T[P];
};

interface UserWithDate {
  id: number;
  name: string;
  createdAt: Date;
  profile: {
    birthDate: Date;
    preferences: {
      theme: string;
    };
  };
}

type SerializedUser = SerializeObject<UserWithDate>;
// {
//   id: number;
//   name: string;
//   createdAt: string;  // Date -> string
//   profile: {
//     birthDate: string;  // Date -> string
//     preferences: {
//       theme: string;
//     };
//   };
// }
```

### 4.3 模板字面量类型

模板字面量类型允许我们在类型级别进行字符串操作和生成。

```typescript
// 基础模板字面量类型
type Greeting = `Hello, ${string}!`;
type WelcomeMessage = `Welcome, ${string}`;

// 字面量联合类型
type EventNames = 'click' | 'hover' | 'focus';
type HandlerNames = `on${Capitalize<EventNames>}`;
// "onClick" | "onHover" | "onFocus"

// 模板字面量与映射类型结合
type EventHandlerMap = {
  [K in EventNames as `on${Capitalize<K>}`]: (event: Event) => void;
};
// {
//   onClick: (event: Event) => void;
//   onHover: (event: Event) => void;
//   onFocus: (event: Event) => void;
// }
```

### 4.4 内置字符串操作类型

TypeScript 提供了四个内置的字符串操作类型。

```typescript
// Uppercase<T> - 转换为大写
type UppercaseExample = Uppercase<'hello world'>; // "HELLO WORLD"

// Lowercase<T> - 转换为小写
type LowercaseExample = Lowercase<'HELLO WORLD'>; // "hello world"

// Capitalize<T> - 首字母大写
type CapitalizeExample = Capitalize<'hello world'>; // "Hello world"

// Uncapitalize<T> - 首字母小写
type UncapitalizeExample = Uncapitalize<'Hello World'>; // "hello World"

// 实际应用：HTTP 方法类型
type HttpMethods = 'get' | 'post' | 'put' | 'delete';
type HttpMethodsUppercase = Uppercase<HttpMethods>; // "GET" | "POST" | "PUT" | "DELETE"

// REST API 路径生成
type RestApiPaths<T extends string> = {
  [K in HttpMethods]: `${Uppercase<K>} /api/${T}`;
}[HttpMethods];

type UserApiPaths = RestApiPaths<'users'>;
// "GET /api/users" | "POST /api/users" | "PUT /api/users" | "DELETE /api/users"
```

### 4.5 实际应用案例

#### 4.5.1 类型安全的CSS-in-JS

```typescript
// CSS 属性类型
type CSSProperties = {
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
};

// CSS 属性缩写生成
type CSSShorthandProperties = {
  margin?: string;
  padding?: string;
} & CSSProperties;

// 生成 CSS 变量类型
type CSSVariables<T extends string> = `--${T}`;

type ThemeVariables = CSSVariables<'primary-color' | 'secondary-color' | 'background-color'>;
// "--primary-color" | "--secondary-color" | "--background-color"

// 响应式断点类型
type Breakpoints = 'sm' | 'md' | 'lg' | 'xl';
type ResponsiveProperty<T> = T | { [K in Breakpoints]?: T };

interface StyledComponentProps {
  color?: ResponsiveProperty<string>;
  fontSize?: ResponsiveProperty<string>;
  margin?: ResponsiveProperty<string>;
}

// 使用示例
const responsiveStyles: StyledComponentProps = {
  color: {
    sm: 'blue',
    md: 'red',
    lg: 'green'
  },
  fontSize: '16px',
  margin: {
    sm: '10px',
    lg: '20px'
  }
};
```

#### 4.5.2 类型安全的路由系统

```typescript
// 路由定义
interface RouteDefinitions {
  '/': {};
  '/users': {};
  '/users/:id': { id: string };
  '/users/:id/posts': { id: string };
  '/users/:id/posts/:postId': { id: string; postId: string };
  '/admin/settings': {};
}

// 提取路径参数类型
type ExtractRouteParams<T extends string> = 
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

// 类型安全的路由器
class TypedRouter<T extends Record<string, any>> {
  private routes = new Map<string, any>();

  // 注册路由
  register<K extends keyof T>(
    path: K,
    handler: (params: ExtractRouteParams<K & string>) => void
  ): void {
    this.routes.set(path as string, handler);
  }

  // 导航到路由
  navigate<K extends keyof T>(
    path: K,
    ...args: ExtractRouteParams<K & string> extends Record<string, never>
      ? []
      : [params: ExtractRouteParams<K & string>]
  ): void {
    const handler = this.routes.get(path as string);
    if (handler) {
      handler(args[0] || {});
    }
  }

  // 生成路径
  generatePath<K extends keyof T>(
    path: K,
    ...args: ExtractRouteParams<K & string> extends Record<string, never>
      ? []
      : [params: ExtractRouteParams<K & string>]
  ): string {
    let result = path as string;
    const params = args[0] as Record<string, string>;
    
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        result = result.replace(`:${key}`, value);
      }
    }
    
    return result;
  }
}

// 使用示例
const router = new TypedRouter<RouteDefinitions>();

// 注册路由
router.register('/', () => console.log('Home page'));
router.register('/users/:id', (params) => {
  console.log(`User page for ${params.id}`);
});

// 类型安全的导航
router.navigate('/');                                    // ✅ 正确
router.navigate('/users/:id', { id: '123' });          // ✅ 正确
// router.navigate('/users/:id');                       // ❌ 编译错误：缺少参数
// router.navigate('/users/:id', { userId: '123' });    // ❌ 编译错误：错误的参数名

// 类型安全的路径生成
const userPath = router.generatePath('/users/:id', { id: '123' }); // "/users/123"
const homePath = router.generatePath('/');                         // "/"
```

#### 4.5.3 数据库查询构建器

```typescript
// 数据库表定义
interface Tables {
  users: {
    id: number;
    name: string;
    email: string;
    age: number;
  };
  posts: {
    id: number;
    title: string;
    content: string;
    authorId: number;
  };
}

// SQL 操作类型
type SQLOperators = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in';

// 查询条件类型
type WhereCondition<T> = {
  [K in keyof T]?: T[K] | { [Op in SQLOperators]?: T[K] };
};

// 查询构建器
class QueryBuilder<TTable extends keyof Tables> {
  constructor(private tableName: TTable) {}

  select<TFields extends keyof Tables[TTable]>(
    ...fields: TFields[]
  ): SelectQueryBuilder<TTable, Pick<Tables[TTable], TFields>> {
    return new SelectQueryBuilder(this.tableName, fields);
  }

  where(conditions: WhereCondition<Tables[TTable]>): WhereQueryBuilder<TTable> {
    return new WhereQueryBuilder(this.tableName, conditions);
  }
}

class SelectQueryBuilder<
  TTable extends keyof Tables,
  TResult = Tables[TTable]
> {
  constructor(
    private tableName: TTable,
    private fields: (keyof Tables[TTable])[]
  ) {}

  where(conditions: WhereCondition<Tables[TTable]>): this {
    // 实现查询条件逻辑
    return this;
  }

  orderBy<TField extends keyof Tables[TTable]>(
    field: TField,
    direction: 'ASC' | 'DESC' = 'ASC'
  ): this {
    // 实现排序逻辑
    return this;
  }

  limit(count: number): this {
    // 实现限制逻辑
    return this;
  }

  async execute(): Promise<TResult[]> {
    // 模拟数据库查询
    console.log(`Executing query on ${this.tableName.toString()}`);
    return [] as TResult[];
  }
}

class WhereQueryBuilder<TTable extends keyof Tables> {
  constructor(
    private tableName: TTable,
    private conditions: WhereCondition<Tables[TTable]>
  ) {}

  async delete(): Promise<void> {
    // 实现删除逻辑
    console.log(`Deleting from ${this.tableName.toString()}`);
  }

  async update(data: Partial<Tables[TTable]>): Promise<void> {
    // 实现更新逻辑
    console.log(`Updating ${this.tableName.toString()}`);
  }
}

// 使用示例
const usersQuery = new QueryBuilder('users');

// 类型安全的查询
const users = await usersQuery
  .select('id', 'name', 'email')  // 只选择指定字段
  .where({ age: { gte: 18 } })
  .orderBy('name', 'ASC')
  .limit(10)
  .execute();

// users 的类型是 Pick<Tables['users'], 'id' | 'name' | 'email'>[]

// 条件查询
await usersQuery
  .where({ email: { like: '%@example.com' } })
  .delete();

// 更新
await usersQuery
  .where({ id: 1 })
  .update({ name: 'Updated Name' });
```

---

## 5. 实用工具类型

TypeScript 提供了丰富的内置工具类型，同时我们也可以创建自定义工具类型来简化复杂的类型操作。

### 5.1 内置工具类型详解

```typescript
// 基础工具类型
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
}

// Partial<T> - 所有属性变为可选
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; password?: string; isActive?: boolean; }

// Required<T> - 所有属性变为必需
interface OptionalUser {
  id?: number;
  name?: string;
  email?: string;
}
type RequiredUser = Required<OptionalUser>;
// { id: number; name: string; email: string; }

// Pick<T, K> - 选择指定属性
type UserPublicInfo = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string; }

// Omit<T, K> - 排除指定属性
type UserWithoutPassword = Omit<User, 'password'>;
// { id: number; name: string; email: string; isActive: boolean; }

// Record<K, T> - 创建记录类型
type UserRoles = Record<'admin' | 'user' | 'guest', boolean>;
// { admin: boolean; user: boolean; guest: boolean; }

// Exclude<T, U> - 从联合类型中排除
type StringOrNumber = string | number | boolean;
type OnlyStringOrNumber = Exclude<StringOrNumber, boolean>; // string | number

// Extract<T, U> - 从联合类型中提取
type OnlyString = Extract<StringOrNumber, string>; // string

// NonNullable<T> - 排除 null 和 undefined
type MaybeString = string | null | undefined;
type DefinitelyString = NonNullable<MaybeString>; // string
```

### 5.2 自定义工具类型

```typescript
// 深度部分类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深度只读类型
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 可空类型工具
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Maybe<T> = T | null | undefined;

// 函数参数和返回值提取
type FunctionArguments<T> = T extends (...args: infer A) => any ? A : never;
type FunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never;

// 数组元素类型提取
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

// Promise 解包
type Awaited<T> = T extends Promise<infer U> 
  ? U extends Promise<any> 
    ? Awaited<U> 
    : U 
  : T;

// 实际应用示例
interface NestedConfig {
  api: {
    endpoints: {
      users: string;
      posts: string;
    };
    auth: {
      token: string;
      refreshToken: string;
    };
  };
  ui: {
    theme: string;
    language: string;
  };
}

type PartialConfig = DeepPartial<NestedConfig>;
// 所有嵌套属性都变为可选

type ReadonlyConfig = DeepReadonly<NestedConfig>;
// 所有嵌套属性都变为只读
```

### 5.3 高级工具类型模式

```typescript
// 类型约束工具
type Ensure<T, K> = T & K;
type EnsureArray<T> = T extends any[] ? T : T[];
type EnsurePromise<T> = T extends Promise<any> ? T : Promise<T>;

// 联合类型工具
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends 
  (k: infer I) => void ? I : never;

type UnionToTuple<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R ? [R] : never;

// 对象操作工具
type PickByValue<T, ValueType> = Pick<T, {
  [Key in keyof T]: T[Key] extends ValueType ? Key : never;
}[keyof T]>;

type OmitByValue<T, ValueType> = Pick<T, {
  [Key in keyof T]: T[Key] extends ValueType ? never : Key;
}[keyof T]>;

// 示例使用
interface MixedInterface {
  id: number;
  name: string;
  isActive: boolean;
  callback: () => void;
  data: object;
}

type NumberProps = PickByValue<MixedInterface, number>; // { id: number }
type NonFunctionProps = OmitByValue<MixedInterface, Function>; 
// { id: number; name: string; isActive: boolean; data: object }
```

---

## 6. 类型守卫和类型谓词

类型守卫是 TypeScript 中用于在运行时检查类型并缩小类型范围的机制。

### 6.1 内置类型守卫

```typescript
// typeof 类型守卫
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript 知道这里 value 是 string
    return value.toUpperCase();
  } else {
    // TypeScript 知道这里 value 是 number
    return value.toFixed(2);
  }
}

// instanceof 类型守卫
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function handleError(error: Error | ApiError) {
  if (error instanceof ApiError) {
    // TypeScript 知道这里 error 是 ApiError
    console.log(`API Error: ${error.status} - ${error.message}`);
  } else {
    // TypeScript 知道这里 error 是 Error
    console.log(`Generic Error: ${error.message}`);
  }
}

// in 操作符类型守卫
interface Bird {
  type: 'bird';
  fly(): void;
}

interface Fish {
  type: 'fish';
  swim(): void;
}

function moveAnimal(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly(); // TypeScript 知道这是 Bird
  } else {
    animal.swim(); // TypeScript 知道这是 Fish
  }
}
```

### 6.2 自定义类型谓词

```typescript
// 基础类型谓词
function isString(value: any): value is string {
  return typeof value === 'string';
}

function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// 对象类型谓词
interface User {
  id: number;
  name: string;
  email: string;
}

function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string'
  );
}

// 数组类型谓词
function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// 使用示例
function processApiResponse(data: unknown) {
  if (isUser(data)) {
    // TypeScript 现在知道 data 是 User 类型
    console.log(`User: ${data.name} (${data.email})`);
  } else if (isStringArray(data)) {
    // TypeScript 现在知道 data 是 string[] 类型
    data.forEach(item => console.log(item.toUpperCase()));
  }
}
```

### 6.3 高级类型守卫模式

```typescript
// 泛型类型谓词
function hasProperty<T, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return obj !== null && obj !== undefined && key in (obj as any);
}

// 类型安全的属性访问
function getProperty<T, K extends string>(
  obj: T,
  key: K
): (T & Record<K, unknown>)[K] | undefined {
  if (hasProperty(obj, key)) {
    return obj[key];
  }
  return undefined;
}

// 可区分联合类型守卫
interface LoadingState {
  status: 'loading';
}

interface SuccessState {
  status: 'success';
  data: any;
}

interface ErrorState {
  status: 'error';
  error: string;
}

type AsyncState = LoadingState | SuccessState | ErrorState;

function isLoading(state: AsyncState): state is LoadingState {
  return state.status === 'loading';
}

function isSuccess(state: AsyncState): state is SuccessState {
  return state.status === 'success';
}

function isError(state: AsyncState): state is ErrorState {
  return state.status === 'error';
}

// 使用示例
function handleAsyncState(state: AsyncState) {
  if (isLoading(state)) {
    console.log('Loading...');
  } else if (isSuccess(state)) {
    console.log('Data:', state.data); // TypeScript 知道有 data 属性
  } else if (isError(state)) {
    console.log('Error:', state.error); // TypeScript 知道有 error 属性
  }
}
```

### 6.4 断言函数（Assertion Functions）

```typescript
// 断言函数 - TypeScript 3.7+
function assertIsNumber(value: any): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error('Expected number');
  }
}

function assertIsString(value: any): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Expected string');
  }
}

// 通用断言函数
function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

// 使用示例
function processUserInput(input: unknown) {
  assertIsString(input);
  // 从这里开始，TypeScript 知道 input 是 string 类型
  const trimmed = input.trim();
  
  assert(trimmed.length > 0, 'Input cannot be empty');
  // 从这里开始，TypeScript 知道 trimmed 不是空字符串
  
  return trimmed.toUpperCase();
}

// 对象属性断言
function assertHasProperty<T, K extends string>(
  obj: T,
  key: K,
  message?: string
): asserts obj is T & Record<K, unknown> {
  if (!(key in (obj as any))) {
    throw new Error(message || `Property ${key} is required`);
  }
}

function processConfig(config: unknown) {
  assertHasProperty(config, 'apiUrl', 'API URL is required');
  assertHasProperty(config, 'timeout', 'Timeout is required');
  
  // TypeScript 现在知道 config 有 apiUrl 和 timeout 属性
  console.log(`API: ${config.apiUrl}, Timeout: ${config.timeout}`);
}
```

---

