# 消息中心改造技术方案

## 快速概览（5 分钟了解）

### 📁 核心文件位置

```
components/Header/NotificationCenter/
├── index.jsx              # 主入口，包含 NotificationCenter 和 NotifyDrop
├── index.module.less     # 样式文件
└── REFACTOR_PLAN.md      # 本文档

components/Notify/
├── index.jsx             # Notify、MessageList、MessageItem 组件
└── index.module.less

services/notify.js        # 所有消息接口

context/store.js          # Zustand 状态管理（包含消息相关状态）
```

### 🎯 组件职责一览

| 组件                 | 位置                         | 核心职责                     | 关键方法/状态            |
| -------------------- | ---------------------------- | ---------------------------- | ------------------------ |
| `NotificationCenter` | NotificationCenter/index.jsx | 头部通知图标 + Dropdown 容器 | `unreadNum`, `dmUnread`  |
| `NotifyDrop`         | NotificationCenter/index.jsx | Dropdown 面板，管理 Tab      | `getConversationList()`  |
| `Notify`             | Notify/index.jsx             | 二级 Tab（消息/动态）        | `getMessage()`           |
| `MessageList`        | Notify/index.jsx             | 消息列表 + 无限滚动          | `page`, `hasMore`        |
| `MessageItem`        | Notify/index.jsx             | 单条消息渲染（13 种类型）    | switch-case 处理消息类型 |

### 🔄 数据流向

```
1. 初始化
   useInitStore()
   → refreshDmUnread() → getDmUnread() → Store.dmUnread
   → refreshUnreadMsg() → getUnreadNum() → Store.unreadNum
   → NotificationCenter 订阅 Store → 显示 Badge

2. 打开 Dropdown
   点击通知图标
   → NotifyDrop 挂载
   → 私信 Tab: getConversationList()
   → 动态 Tab: getMessage({ type: 'all' })
   → Notify 二级 Tab: getMessage({ type: 'mentions' | 'activities' })

3. 标记已读
   私信: setDMAllReaded() + setSystemDMReaded() → 更新 Store
   动态: onLoad 回调 → 更新 Store
```

### 📊 当前 Tab 结构 vs 改造后

**当前结构（2 个 Tab）：**

```
NotificationCenter Dropdown
├── 私信 Tab (key="dm")
│   ├── 会话列表（系统消息 + 用户私信）
│   └── 底部：全部已读 | 查看所有私信
└── 动态 Tab (key="message")
    ├── Notify 二级 Tab
    │   ├── 消息（mentions）  - @提及
    │   └── 动态（activities） - 互动（关注、转采、喜欢等）
    └── 底部：查看所有动态
```

**改造后结构（3 个 Tab）：**

```
NotificationCenter Dropdown
├── 头部区域
│   ├── Tab 切换：官方消息 | 互动消息 | 私信
│   └── 右侧：一键已读按钮（只标记当前 Tab 为已读）
│
├── 官方消息 Tab (key="official")
│   ├── 二级筛选：未读 | 全部
│   ├── 系统消息列表（原 conversationList 中 without with_user 的）
│   └── 底部：查看更多
│
├── 互动消息 Tab (key="interaction")
│   ├── 二级筛选：未读 | 全部
│   ├── 互动消息列表（原 activities 类型消息）
│   └── 底部：查看更多
│
└── 私信 Tab (key="dm")
    ├── 二级筛选：未读 | 全部
    ├── 用户私信列表（原 conversationList 中 with with_user 的）
    └── 底部：查看所有私信
```

### 🔍 快速定位指南

**想要修改...**

- **未读数显示逻辑** → `NotificationCenter` 组件（第 24-29 行）
- **Tab 切换逻辑** → `NotifyDrop` 组件（第 62-64 行）
- **会话列表** → `NotifyDrop` 组件（第 90-98 行）
- **消息类型处理** → `MessageItem` 组件（Notify/index.jsx 第 226-377 行）
- **消息接口** → `services/notify.js`
- **全局状态** → `context/store.js`（搜索 `unreadNum`, `dmUnread`）
- **样式** → `index.module.less`（400px × 400px 固定尺寸）

**关键常量**

- 当前 Tab 数量: **2 个**（私信、动态）→ 改造后: **3 个**（官方消息、互动消息、私信）
- Dropdown 尺寸: **400px × 400px** → 改造后可能需要调整
- 消息列表高度: **283px**
- 支持消息类型: **13 种**
- 轮询间隔: **5 分钟**

**数据获取方式（基于后端新方案）**

- 官方消息：`GET /system_dm` - 系统消息（含 extend 扩展字段）
- 互动消息：`GET /message?type=activities` - 用户互动
- 私信：`GET /dm/list` ⭐ 推荐 - 纯私信会话（支持分页、未读筛选）
- 未读数统计：`GET /messages/unreads` - 一次获取三个 Tab 未读数

---

## 一、当前消息中心现状分析

### 1.1 技术栈和基础架构

#### 前端框架与核心库

- **React**: v17.0.2 - 核心 UI 框架
- **Next.js**: v12.3.1 - SSR 框架，提供路由和服务端渲染能力
- **Ant Design**: v4.17.2 - UI 组件库
  - 使用组件：`Dropdown`、`Tabs`、`Badge`、`Button`
- **状态管理**: Zustand v4.3.8
  - 使用`create`创建 store
  - 使用`devtools`中间件支持开发调试
  - 自定义`storeSetHookMiddire`中间件

#### 常用工具库

- **ahooks**: v3.5.2 - React Hooks 工具库
  - `useAsyncEffect` - 异步副作用处理
  - `useSafeState` - 安全的状态管理
  - `useSetState` - 对象状态管理
  - `useMemoizedFn` - 记忆化函数
  - `useRequest` - 数据请求 Hook
- **lodash**: v4.17.21 - 工具函数库
- **classnames**: v2.3.1 - 类名拼接
- **react-if**: v4.1.1 - 条件渲染组件

#### 样式方案

- **Less**: v4.1.2 - CSS 预处理器
- **CSS Modules** - 样式模块化方案
- 使用`next-plugin-antd-less`支持 Ant Design 主题定制

### 1.2 文件结构分析

#### 当前目录结构

```
components/Header/NotificationCenter/
├── index.jsx              # 主入口组件（265行）
├── index.module.less     # 样式文件（194行）
└── REFACTOR_PLAN.md      # 本技术方案文档

components/Notify/         # 消息列表组件
├── index.jsx             # 导出Notify和MessageList（548行）
└── index.module.less     # 样式文件

services/
└── notify.js             # 消息相关接口服务（189行）
```

#### 组件层级关系

```
NotificationCenter (入口组件)
  └── Dropdown (Ant Design)
       └── NotifyDrop (下拉面板)
            └── Tabs (Ant Design)
                 ├── TabPane[key="dm"] (私信Tab)
                 │    ├── conversationList (会话列表)
                 │    │    └── conversationItem × N (单个会话)
                 │    │         ├── HBAvatar (头像组件)
                 │    │         └── info (消息信息)
                 │    └── bottom (底部操作区)
                 │
                 └── TabPane[key="message"] (动态Tab)
                      ├── MessageList (消息列表组件)
                      │    └── HBList (无限滚动列表)
                      │         └── MessageItem × N (单条消息)
                      │              ├── Avatar (用户头像)
                      │              ├── Info (文本信息)
                      │              ├── HBIcon (举报按钮)
                      │              └── Image (缩略图)
                      └── bottom (底部操作区)
```

### 1.3 组件功能详细说明

#### NotificationCenter 组件（主入口）

**位置**: `components/Header/NotificationCenter/index.jsx` (23-58 行)

**职责**:

- 渲染头部通知图标按钮
- 聚合未读数量显示（动态消息 + 私信）
- 控制 Dropdown 的展开和收起

**核心功能**:

- 从 Zustand Store 获取未读数：`unreadNum`（动态消息）+ `dmUnread`（私信）
- 使用 Ant Design `Dropdown` + `Badge` 组件
- 配置：右下对齐、隐藏时销毁 DOM、0.3s 延迟交互
- 集成埋点追踪（曝光、点击）

#### NotifyDrop 组件（下拉面板）

**位置**: `components/Header/NotificationCenter/index.jsx` (60-264 行)

**职责**:

- 管理 Tab 切换逻辑
- 渲染私信列表和动态消息列表
- 处理已读/未读状态
- 打开聊天对话框

**核心功能**:

- **Tab 默认选中**: 有动态未读且无私信未读时默认"动态"Tab，否则"私信"Tab
- **会话列表**: 调用 `getConversationList({ limit: 100 })`，未读排前、已读排后
- **聊天对话框**: 懒加载 `ChatDialog` 组件，点击会话项打开
- **已读列表**: 前端临时记录已打开的会话，避免重复标记未读
- **全部已读**: 并行调用 `setSystemDMReaded()` + `setDMAllReaded()`，更新 Store

#### Notify & MessageList 组件

**位置**: `components/Notify/index.jsx`

**Notify 组件** (26-118 行):

- 提供"消息"（mentions）和"动态"（activities）二级 Tab
- 使用 `HBTabButton` 组件实现 Tab 切换
- 根据当前消息未读状态，动态管理未读红点显示
- 封装 MessageList 组件

**MessageList 组件** (120-207 行):

- 调用 `getMessage({ type, per_page, page })` 获取数据
- 使用 `HBList` 实现无限滚动（禁用瀑布流模式）
- 分页加载：`page++`，数据追加到现有列表
- 如果返回数量 < limit，设置 `hasMore = false`

#### MessageItem 组件（消息项）

**位置**: `components/Notify/index.jsx` (209-466 行)

**核心功能**:

- 通过 switch-case 处理 13 种消息类型（见下表）
- 文本拼接：将用户名、操作、对象等组合成可点击的链接文本
- 文本省略：根据 `maxLength` 智能省略，优先保留操作词
- 缩略图：显示 55×55px 的采集图（如有）
- 举报功能：仅对 `comment` 和 `repin` 类型显示举报按钮

### 1.4 数据接口详细说明

#### 接口文件位置

`services/notify.js` - 所有消息相关接口

#### 核心接口清单

| 接口名                  | API 路径                | 说明             | 关键参数                        |
| ----------------------- | ----------------------- | ---------------- | ------------------------------- |
| `getUnreadNum()`        | GET /message/unreads    | 获取未读消息数量 | -                               |
| `getMessage()`          | GET /message            | 获取消息列表     | type, per_page, page            |
| `getDmUnread()`         | GET /dm/unreads         | 获取未读私信数   | -                               |
| `getConversationList()` | GET /dm                 | 获取会话列表     | limit, max                      |
| `setDMAllReaded()`      | GET /dm/read_all        | 设置所有私信已读 | -                               |
| `setSystemDMReaded()`   | GET /system_dm/read_all | 设置系统消息已读 | -                               |
| `getSystemDMList()`     | GET /system_dm          | 获取系统通知列表 | -                               |
| `getMessageList()`      | GET /dm/messages/:id    | 获取聊天消息列表 | with_user_id, since, max, limit |

#### 接口数据结构

**Message（消息对象）**:

```typescript
interface Message {
  message_id: string;
  type: MessageType; // 消息类型
  extra: {
    by_user?: User; // 触发用户
    board?: Board; // 相关画板
    pin?: Pin; // 相关采集
    comment?: Comment; // 评论内容
    through_pin?: Pin; // 二次转采的中间采集
    by_pin?: Pin; // 评论/转采的源采集
  };
  created_at: number; // 创建时间戳(秒)
  unread: boolean; // 是否未读
}
```

**Conversation（会话对象）**:

```typescript
interface Conversation {
  conversation_id: number;
  with_user_id: number;
  with_user: User; // 对话用户信息
  last_message: {
    from_user_id: number;
    to_user_id: number;
    text: string;
    created_at: number;
    type: "sent" | "received";
  };
  unread: boolean; // 是否有未读消息
  blocked?: 0 | 1; // 是否被屏蔽
  hidden?: 0 | 1; // 是否隐藏
  updated_at?: number;
}

// 系统消息会话（没有with_user字段）
interface SystemConversation {
  to_user_id: number;
  system_dm_id: number;
  text: string; // HTML格式内容
  created_at: number;
  unread: boolean;
}
```

### 1.5 状态管理架构

#### Zustand Store 结构

**位置**: `context/store.js`

**核心机制**:

- **模块化设计**: 聚合 user、vip、app、board 等模块，使用 devtools 中间件
- **消息状态**: `unreadNum`（动态消息）、`dmUnread`（私信对象：unread_dm + unread_system_dm）
- **刷新方法**: `refreshDmUnread()`、`refreshUnreadMsg()`
- **轮询机制**: 每 5 分钟自动刷新未读数（仅页面可见时）
- **跨 Tab 共享**: 使用 localStorage 实现多标签页数据共享，避免重复请求

### 1.6 主要业务流程

#### 流程 1：消息中心初始化

```
1. 页面加载 → useInitStore()
2. 检查用户登录状态
3. 从localStorage获取跨Tab共享数据
4. 如果没有缓存数据，调用接口：
   - refreshDmUnread() → 获取私信未读数
   - refreshUnreadMsg() → 获取动态消息未读数
5. 更新store状态
6. NotificationCenter组件订阅状态变化
7. 渲染Badge未读数
```

#### 流程 2：打开消息 Dropdown

```
1. 用户点击/悬停通知图标
2. Dropdown展开
3. NotifyDrop组件挂载
4. 判断Tab默认选中：
   - 如果有动态未读且无私信未读 → 默认"动态"Tab
   - 否则 → 默认"私信"Tab
5. 渲染对应Tab内容：
   - 私信Tab：调用getConversationList()获取会话
   - 动态Tab：调用getMessage()获取消息
```

#### 流程 3：查看私信

```
1. 用户点击某个会话项
2. 记录到hasReadList（前端临时）
3. 触发懒加载：import("@/components/Chat")
4. 打开ChatDialog对话框
5. 调用getMessageList()获取历史消息
6. 用户可以发送新消息
```

#### 流程 4：标记已读

```
【私信全部已读】
1. 用户点击"全部已读"
2. 并行调用：
   - setSystemDMReaded()  // 系统消息已读
   - setDMAllReaded()     // 用户私信已读
3. refreshConversationList()  // 刷新列表
4. 更新store: dmUnread = { unread_dm: 0, unread_system_dm: 0 }
5. Badge数字更新

【动态消息已读】
1. MessageList的onLoad回调触发
2. 直接更新store: unreadNum = 0
3. Badge数字更新
```

#### 流程 5：无限滚动加载

```
1. 用户滚动到列表底部
2. HBList组件检测到滚动位置
3. 触发onLoadMore回调
4. page++
5. 调用getMessage({ type, per_page, page })
6. 追加新数据到现有列表
7. 如果返回数量 < limit → hasMore = false
8. 重新渲染列表
```

### 1.7 UI 规格说明

- **Dropdown 尺寸**: 400px × 400px
- **消息列表高度**: 283px（固定高度，支持滚动）
- **头像尺寸**: 32px（列表项）、40px（详情）
- **缩略图尺寸**: 55px × 55px
- **未读标记**: 9px 红点（左上角）

### 1.8 消息类型和格式详解

#### 当前支持的 13 种消息类型

| 类型                   | 说明        | 文本模板                                                                    | 是否有缩略图 | 是否可举报 |
| ---------------------- | ----------- | --------------------------------------------------------------------------- | ------------ | ---------- |
| `follow_user`          | 关注了你    | {用户名}关注了你                                                            | ❌           | ❌         |
| `follow_board`         | 关注了画板  | {用户名}关注了你的画板{画板名}                                              | ❌           | ❌         |
| `repin`                | 转采了采集  | {用户名}转采了你的采集{描述}                                                | ✅           | ✅         |
| `like_pin`             | 喜欢了采集  | {用户名}喜欢了你的采集{描述}                                                | ✅           | ❌         |
| `like_board`           | 喜欢了画板  | {用户名}喜欢了你的画板{画板名}                                              | ❌           | ❌         |
| `repin_2nd`            | 二次转采    | {用户名}通过{用户名}转采了{描述}                                            | ✅           | ❌         |
| `comment`              | 评论了采集  | {用户名}评论了采集{评论内容}                                                | ✅           | ✅         |
| `pin_text`             | 采集中@提到 | {用户名}在采集{名称}时提到了你                                              | ✅           | ❌         |
| `board_member_join`    | 加入画板    | {用户名}已加入多人画板{画板名}，快来一起采集灵感吧！                        | ❌           | ❌         |
| `board_member_leave`   | 退出画板    | {用户名}已退出多人画板{画板名}                                              | ❌           | ❌         |
| `board_member_remove`  | 被移出画板  | 你已被移出多人画板{画板名}，你的采集可在「我的灵感空间-采集」中查看及编辑。 | ❌           | ❌         |
| `collab_board_remove`  | 画板被删除  | 多人画板{画板名}已被删除，相关采集也将一并移除。如有疑问请联系画板创建者。  | ❌           | ❌         |
| `collab_board_recover` | 画板被恢复  | 多人画板{画板名}已被恢复，相关采集也将一并恢复。如有疑问请联系画板创建者。  | ❌           | ❌         |

#### 消息分类逻辑

**当前分类**（Notify 组件）:

- **消息(mentions)**: `pin_text` - @提及类消息
- **动态(activities)**: 其他所有类型

**NotificationCenter 的分类**:

- **动态 Tab**: 调用`getMessage({ type: "all" })` - 获取所有类型
- **私信 Tab**: 调用`getConversationList()` - 获取会话列表

> ⚠️ 注意：当前"动态 Tab"使用`type="all"`，实际获取的是所有类型的消息，然后通过 Notify 组件内部的二级 Tab 再细分为"消息"和"动态"。

### 1.9 现有问题和局限性

#### 功能层面

1. **消息分类不够清晰**: 当前只有"私信"和"动态"两个一级 Tab，动态内容太杂
2. **缺少筛选功能**: 无法按未读/全部筛选
3. **已读操作不统一**: 私信有"全部已读"按钮，动态消息只能通过打开 Dropdown 自动标记已读
4. **缺少官方消息类型**: 无法区分系统通知和用户互动消息

#### 交互层面

1. **嵌套 Tab 过深**: 动态 Tab 下还有二级 Tab（消息/动态），增加认知负担
2. **底部操作不一致**: 私信 Tab 的底部有两个操作，动态 Tab 只有一个
3. **无强提醒机制**: 重要消息无法突出展示

#### 技术层面

1. **组件职责不清**: NotificationCenter 既管理私信又管理动态消息，代码耦合
2. **状态管理分散**: 未读数存在 store，已读列表存在组件 state
3. **缺少类型定义**: 使用 JavaScript，没有 TypeScript 类型约束
4. **接口不支持筛选**: getMessage 接口不支持按已读/未读筛选

#### 样式层面

1. **固定尺寸限制**: 400x400px 可能无法适应更多内容
2. **内边距不统一**: 左右 padding 不一致（24px vs 20px）
3. **底部绝对定位**: 可能导致内容被遮挡

### 1.10 依赖的其他组件

| 组件名        | 路径                     | 用途                 |
| ------------- | ------------------------ | -------------------- |
| `HBAvatar`    | `components/Avatar`      | 用户头像组件         |
| `HBIcon`      | `components/HBIcon`      | 图标组件             |
| `HBList`      | `components/HBList`      | 无限滚动列表         |
| `HBMessage`   | `components/HBMessage`   | 消息提示组件         |
| `HBTabButton` | `components/HBTabButton` | Tab 按钮组件         |
| `Image`       | `components/Image`       | 图片组件（优化加载） |
| `ReportModal` | `components/ReportModal` | 举报弹窗             |
| `TrackerDiv`  | `components/Tracker`     | 埋点追踪容器         |
| `ChatDialog`  | `components/Chat`        | 聊天对话框（懒加载） |

---

## 二、需要改造的核心点

### 2.1 结构层面改造

#### ✅ 改造点 1：Tab 结构重构

**当前**: 2 个 Tab（私信、动态）  
**目标**: 3 个 Tab（官方消息、互动消息、私信）

**数据映射关系（基于后端新方案）：**

| 新 Tab   | 数据来源                             | 接口地址               | 说明                                        |
| -------- | ------------------------------------ | ---------------------- | ------------------------------------------- |
| 官方消息 | 系统消息列表（含 MC 扩展字段）       | `GET /system_dm`       | 包含公开/私有/MC 系统消息，支持 extend 扩展 |
| 互动消息 | 动态消息列表                         | `GET /message`         | 包含 mentions（@提及）和 activities（互动） |
| 私信     | 私信会话列表（纯私信，不含系统消息） | `GET /dm/list` ⭐ 推荐 | 支持分页、未读过滤，自动过滤空会话          |

**重要变化：**

1. ✅ **系统消息和私信完全分离**：不再从 `getConversationList()` 中筛选，使用独立接口
2. ✅ **统一未读数接口**：`GET /messages/unreads` 一次获取三个 Tab 的未读数
3. ✅ **系统消息支持富内容**：MC 消息包含 `extend` 字段（封面图、标题、模板图等）
4. ✅ **强提醒消息**：根据 `extend.need_strong_remind` 字段判断是否弹窗
5. ✅ **独立的一键已读接口**：每个 Tab 都有对应的 POST 接口

**具体调整：**

1. **官方消息 Tab**：调用 `GET /system_dm`，根据 `extend` 字段动态渲染样式
2. **互动消息 Tab**：调用 `GET /message`，保持原有逻辑
3. **私信 Tab**：调用新接口 `GET /dm/list`（推荐游标分页）
4. **未读数统计**：统一使用 `GET /messages/unreads`
5. 每个 Tab 下都增加"未读/全部"二级筛选

#### ✅ 改造点 2：头部增加一键已读按钮

**当前**: 私信 Tab 底部有"全部已读"按钮  
**目标**: 头部右侧增加"一键已读"按钮

**功能说明：**

- 位于 Dropdown 头部的最右侧（Tab 切换右边）
- **只标记当前激活的 Tab 中的消息为已读**
- 根据当前 Tab 调用对应的已读接口：
  - 官方消息：`setSystemDMReaded()`
  - 互动消息：需要新接口或批量标记
  - 私信：`setDMAllReaded()`

#### ✅ 改造点 3：每个 Tab 下增加未读/全部二级切换

**当前**: Tab 下直接展示消息列表  
**目标**: 每个 Tab 下有"未读"和"全部"两个按钮

**实现方式：**

- 在 Tab 内容顶部增加类似`HBTabButton`的二级切换按钮
- 根据未读状态筛选消息列表
- 需要调整当前的`getMessage`接口，支持未读筛选参数

### 2.2 UI 展示层面改造

#### ✅ 改造点 4：官方消息卡片样式

**新增内容结构：**

```
- 顶部图片（Banner图）
- 标题 + 描述
- 中间素材模板图（多张，支持点击跳转）
- 底部：左侧时间 | 右侧按钮
```

**需要实现：**

- 新增`OfficialMessageItem`组件
- 支持多图展示和跳转逻辑
- 自定义按钮交互（如"立即查看"等）

#### ✅ 改造点 5：互动消息卡片样式

**新增内容结构：**

```
- 左侧头像
- 右侧：
  - 顶部标题
  - 描述文本
  - 图片（可能多张）
  - 底部：左侧时间 | 右侧按钮
```

**需要实现：**

- 改造现有`MessageItem`组件
- 增加标题字段支持
- 增加按钮位置（目前只有举报图标）

#### ✅ 改造点 6：私信消息卡片样式

**调整内容结构：**

```
- 左侧头像
- 右侧顶部：左侧昵称 | 右侧时间
- 右侧底部：消息内容
```

**需要实现：**

- 调整现有`conversationItem`布局
- 将时间从内联移到右上角

### 2.3 新增功能

#### ✅ 改造点 7：强提醒消息功能

**展示方式：**

- 与消息中心 Dropdown 互斥展示
- 全局浮层形式，可能固定在页面某个位置

**内容结构：**

```
- 顶部封面图（右上角X关闭按钮）
- 标题 + 描述
- 中间素材模板图（多张，支持跳转）
- 底部：左侧时间 | 右侧按钮
```

**需要实现：**

- 新增`StrongNotification`组件
- 增加关闭状态管理（可能需要本地存储）
- 增加接口获取强提醒消息
- 实现与 Dropdown 的互斥逻辑

---

## 三、详细技术实施方案

### 3.1 接口层改造

#### 核心接口清单（基于后端方案）

| 功能             | 接口地址              | 方法 | 说明                                  | 优先级      |
| ---------------- | --------------------- | ---- | ------------------------------------- | ----------- |
| **统一未读数**   | `/messages/unreads`   | GET  | 一次获取三个 Tab 的未读数             | ⭐⭐⭐ 必须 |
| **官方消息列表** | `/system_dm`          | GET  | 获取系统消息（含 extend 扩展字段）    | ⭐⭐⭐ 必须 |
| **互动消息列表** | `/message`            | GET  | 获取动态消息（mentions + activities） | ⭐⭐⭐ 必须 |
| **私信列表**     | `/dm/list`            | GET  | 获取私信会话（纯私信，支持分页）      | ⭐⭐⭐ 推荐 |
| **官方消息已读** | `/system_dm/read_all` | POST | 标记所有系统消息为已读                | ⭐⭐⭐ 必须 |
| **互动消息已读** | `/message/read_all`   | POST | 标记所有动态消息为已读                | ⭐⭐⭐ 必须 |
| **私信已读**     | `/dm/read_all`        | POST | 标记所有私信为已读                    | ⭐⭐⭐ 推荐 |
| 私信每对方未读   | `/dm/unreads/by_user` | GET  | 获取每个私信对方的未读数              | ⭐⭐ 可选   |

#### 详细接口说明

**1. 统一未读数统计（新增）**

```typescript
// GET /messages/unreads
interface UnreadCountsResponse {
  system: {
    total: number; // 系统消息总未读数
    public_unread: number; // 公开系统消息未读数
    private_unread: number; // 私有系统消息未读数
    mc_unread: number; // MC系统消息未读数
  };
  dynamic: {
    total: number; // 动态消息总未读数
    mentions: number; // @提及未读数
    activities: number; // 互动未读数
  };
  dm: {
    total: number; // 私信总未读数
    by_user?: Array<{
      // 可选：每个对方的未读数（需要 include_dm_detail=1）
      user_id: number;
      unread_count: number;
    }>;
  };
}

// 使用示例
const unreads = await request("/messages/unreads");
// 可选：包含每个私信对方的未读详情
const unreadsWithDetail = await request(
  "/messages/unreads?include_dm_detail=1"
);
```

**2. 官方消息列表（功能增强）**

```typescript
// GET /system_dm?limit=20
interface SystemMessage {
  system_dm_id: number;
  text: string; // 消息文本内容
  to_user_id: number | null; // 接收者ID（null表示公开消息）
  created_at: number; // 创建时间戳
  source: "mc" | "local"; // 消息来源
  extend: {
    // MC消息的扩展字段（本地消息为null）
    title?: string; // 消息标题
    template_id?: string; // 模板ID
    cover_url?: string; // 封面图URL（已签名）
    icon_url?: string; // 图标URL（已签名）
    contents?: string; // 内容列表（JSON字符串）
    need_strong_remind?: "true" | "false"; // 是否强提醒（字符串布尔值）
  } | null;
}

// contents 字段解析
interface Content {
  content_id: number;
  content_url: string; // 内容URL（已签名）
  content_cover_url: string; // 内容封面URL（已签名）
}

// 使用示例
const messages = await request("/system_dm?limit=20");
messages.forEach((msg) => {
  if (msg.extend?.need_strong_remind === "true") {
    // 展示强提醒浮窗
    showStrongNotification(msg);
  }
  if (msg.extend?.contents) {
    const contents = JSON.parse(msg.extend.contents);
    // 渲染素材模板图列表
  }
});
```

**3. 私信列表（新增，推荐）**

```typescript
// GET /dm/list?page=1&limit=20&unread_only=1&include_unread_count=1
interface DirectMessageListResponse {
  conversations: Array<{
    conversation_id: number;
    user_id: number; // 当前用户ID
    with_user_id: number; // 对方用户ID
    updated_at: number; // 最后更新时间
    blocked: 0 | 1; // 是否屏蔽
    hidden: 0 | 1; // 是否隐藏
    unread: boolean; // 是否有未读
    unread_count?: number; // 未读数量（需要 include_unread_count=1）
    last_message: {
      direct_message_id: number;
      from_user_id: number;
      to_user_id: number;
      text: string;
      created_at: number;
    };
    with_user: {
      user_id: number;
      username: string;
      urlname: string;
      avatar: AvatarInfo;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    has_more: boolean;
    next_max: number; // 游标值，用于下一页请求
  };
}

// 推荐：游标分页
const page1 = await request("/dm/list?limit=20");
const page2 = await request(
  `/dm/list?max=${page1.pagination.next_max}&limit=20`
);

// 筛选未读
const unreadOnly = await request("/dm/list?unread_only=1&limit=20");
```

**4. 一键已读接口**

```typescript
// POST /system_dm/read_all - 官方消息已读
await request("/system_dm/read_all", { method: "POST" });

// POST /message/read_all - 互动消息已读（支持类型筛选）
await request("/message/read_all", { method: "POST" });
await request("/message/read_all?type=mentions", { method: "POST" }); // 只标记@提及

// POST /dm/read_all - 私信已读
await request("/dm/read_all", { method: "POST" });
```

#### services/notify.js 改造

需要在 `services/notify.js` 中新增以下接口封装：

```javascript
// 1. 统一未读数统计（新增）
export async function getUnreadCounts(includeDetail = false) {
  const params = includeDetail ? { include_dm_detail: 1 } : {};
  return request("/messages/unreads", { params });
}

// 2. 获取系统消息列表（已有，保持不变）
export async function getSystemDMList(limit = 20) {
  return request("/system_dm", { params: { limit } });
}

// 3. 获取私信列表（新增，推荐使用）
export async function getDMList({
  page,
  limit = 20,
  max,
  unreadOnly,
  includeUnreadCount,
}) {
  const params = {
    ...(page && { page }),
    limit,
    ...(max && { max }),
    ...(unreadOnly && { unread_only: 1 }),
    ...(includeUnreadCount && { include_unread_count: 1 }),
  };
  return request("/dm/list", { params });
}

// 4. 系统消息一键已读（新增）
export async function setSystemDMReadAll() {
  return request("/system_dm/read_all", { method: "POST" });
}

// 5. 动态消息一键已读（新增）
export async function setMessageReadAll(type = "all") {
  const params = type !== "all" ? { type } : {};
  return request("/message/read_all", { method: "POST", params });
}

// 6. 私信一键已读（改用 POST，推荐）
export async function setDMReadAll() {
  return request("/dm/read_all", { method: "POST" });
}

// 7. 获取每个对方的未读数（可选）
export async function getDMUnreadsByUser() {
  return request("/dm/unreads/by_user");
}
```

### 3.2 组件架构重构

#### 3.2.1 组件层级结构

```
NotificationCenter/
├── index.jsx                    // 主入口（通知图标）
├── index.module.less           // 样式文件
├── REFACTOR_PLAN.md            // 本改造方案文档
├── NotifyDropdown/             // 下拉面板（重构）
│   ├── index.jsx
│   ├── index.module.less
│   ├── TabHeader.jsx           // Tab头部（包含Tab切换和一键已读按钮）
│   └── TabFilter.jsx           // 未读/全部切换按钮
├── MessageItems/               // 消息项组件
│   ├── OfficialMessageItem.jsx      // 官方消息卡片
│   ├── InteractionMessageItem.jsx   // 互动消息卡片
│   ├── DirectMessageItem.jsx        // 私信消息卡片
│   └── index.module.less
└── StrongNotification/         // 强提醒消息
    ├── index.jsx
    └── index.module.less
```

#### 3.2.2 核心组件实现要点

**NotifyDropdown 组件**:

- 3 个 Tab：官方消息、互动消息、私信
- 每个 Tab 独立的二级筛选：未读/全部
- 头部右侧"一键已读"按钮：根据当前激活的 Tab 调用对应接口

**TabHeader 组件**:

- 使用 Ant Design `Tabs` + `Badge` 显示未读数
- 右侧增加"一键已读"按钮（只标记当前 Tab 的消息为已读）

**TabFilter 组件**:

- 两个按钮：未读/全部
- 切换时更新筛选状态，触发列表刷新

**OfficialMessageItem 组件**（官方消息卡片）:

**基础版（复用系统消息样式）：**

- 系统头像（32px）
- 消息内容（HTML 格式，使用 `cleanHtmlTag` 处理）
- 时间显示

**增强版（如果后端支持富内容）：**

- 顶部 Banner 图（可选）
- 标题 + 描述
- 素材模板图（多张，可点击跳转）
- 底部：时间 + 操作按钮

**InteractionMessageItem 组件**（互动消息卡片）:

- 左侧：用户头像（40px）
- 右侧：标题 + 描述 + 图片（可选）+ 底部（时间 + 按钮）

**DirectMessageItem 组件**（私信卡片）:

- 左侧：用户头像（40px）
- 右侧顶部：昵称（左）+ 时间（右）
- 右侧底部：消息内容

**StrongNotification 组件**（强提醒）:

- 固定定位浮层，右上角关闭按钮
- 结构：封面图 + 标题描述 + 素材图 + 时间按钮
- 关闭状态存储在 localStorage
- 与 Dropdown 互斥展示

### 3.3 样式设计要点

- **Dropdown**: 尺寸调整为 440px × 480px
- **Tab 头部**: flex 布局，Tab 切换在左，"一键已读"按钮在右侧
- **二级筛选**: 浅灰背景（#f8f9fa），12px 间距，每个 Tab 独立显示
- **消息卡片**: 16px 内边距，底部边框分隔
- **素材图**: 80px × 80px，悬停放大效果
- **强提醒**: 固定定位（top: 80px, right: 20px），360px 宽，slideIn 动画

### 3.4 状态管理调整

在 `useAppStore` 中新增：

- `officialUnread: number` - 官方消息未读数
- `interactionUnread: number` - 互动消息未读数
- `strongNotification: any | null` - 强提醒消息对象
- `dismissedNotifications: string[]` - 已关闭的强提醒 ID 列表

对应方法：

- `updateOfficialUnread(count)` - 更新官方消息未读数
- `updateInteractionUnread(count)` - 更新互动消息未读数
- `setStrongNotification(notification)` - 设置强提醒
- `dismissNotification(id)` - 标记强提醒已关闭

### 3.5 互斥展示逻辑

- 强提醒存在时，优先显示 `StrongNotification` 组件
- Dropdown 的 `visible` 属性需判断：`dropdownVisible && !strongNotification`
- 关闭强提醒时，更新 Store：`strongNotification: null`

---

## 四、实施步骤建议

### 阶段一：接口对接与数据准备（约 2-3 天）

✅ **后端方案已明确**，直接开始实施：

1. 更新 `services/notify.js`，新增接口封装：

   - `getUnreadCounts()` - 统一未读数统计
   - `getSystemDMList()` - 系统消息列表（已有，保持）
   - `getDMList()` - 私信列表（新增）
   - `setSystemDMReadAll()` - 系统消息已读（新增）
   - `setMessageReadAll()` - 动态消息已读（新增）
   - `setDMReadAll()` - 私信已读（改用 POST）

2. 编写 TypeScript 类型定义：

   - `SystemMessage` - 系统消息（含 extend 扩展字段）
   - `UnreadCountsResponse` - 未读数统计
   - `DirectMessageListResponse` - 私信列表

3. 更新 Zustand Store，新增状态字段：
   - `officialUnread` - 官方消息未读数
   - `interactionUnread` - 互动消息未读数
   - `dmUnread` - 私信未读数

### 阶段二：组件结构重构（约 3-4 天）

1. 重构 `NotifyDropdown` 组件，实现 3 个 Tab

   ```javascript
   // 关键实现：使用新接口获取数据

   // 1. 统一未读数
   const { data: unreadCounts } = useRequest(() => getUnreadCounts());

   // 2. 官方消息列表
   const { data: officialMessages } = useRequest(
     () => getSystemDMList(20), // GET /system_dm
     { ready: activeTab === "official" }
   );

   // 3. 互动消息列表
   const { data: interactionMessages } = useRequest(
     () => getMessage({ type: "activities", per_page: 20 }),
     { ready: activeTab === "interaction" }
   );

   // 4. 私信列表（使用新接口）
   const { data: dmData } = useRequest(
     () => getDMList({ limit: 20, unreadOnly: filterType === "unread" }), // GET /dm/list
     { ready: activeTab === "dm", refreshDeps: [filterType] }
   );
   ```

2. 开发 `TabHeader` 组件，实现"一键已读"功能（仅针对当前 Tab）
3. 开发 `TabFilter` 组件，实现未读/全部切换
4. 调整消息列表容器，支持新的数据结构

### 阶段三：消息卡片组件开发（约 4-5 天）

1. 开发 `OfficialMessageItem` 组件（支持 extend 扩展字段）

   ```javascript
   // 根据 extend 字段判断渲染方式
   {
     message.extend ? (
       // MC 消息（富内容）
       <div className={styles.mcMessage}>
         {message.extend.cover_url && <img src={message.extend.cover_url} />}
         <h4>{message.extend.title}</h4>
         {message.extend.contents &&
           parseContents(message.extend.contents).map((content) => (
             <a href={content.content_url} key={content.content_id}>
               <img src={content.content_cover_url} />
             </a>
           ))}
         <div className={styles.footer}>
           <time>{formatTime(message.created_at)}</time>
         </div>
       </div>
     ) : (
       // 本地消息（纯文本）
       <div className={styles.localMessage}>
         <div
           dangerouslySetInnerHTML={{ __html: cleanHtmlTag(message.text) }}
         />
         <time>{formatTime(message.created_at)}</time>
       </div>
     );
   }
   ```

2. 改造 `InteractionMessageItem` 组件（保持原有样式）
3. 调整 `DirectMessageItem` 组件（使用新的数据结构）
4. 完善各卡片的交互逻辑

### 阶段四：强提醒功能开发（约 2-3 天）

1. 开发 `StrongNotification` 组件（基于系统消息的 extend 字段）

   ```javascript
   // 判断是否展示强提醒
   if (
     message.source === "mc" &&
     message.extend?.need_strong_remind === "true"
   ) {
     const dismissedKey = `dismissed_notification_${message.system_dm_id}`;
     if (!localStorage.getItem(dismissedKey)) {
       showStrongNotification(message);
     }
   }
   ```

2. 实现关闭和存储逻辑（localStorage）
3. 实现与 Dropdown 的互斥逻辑
4. 复用 extend 字段渲染富内容（封面图、标题、模板图）

### 阶段五：样式优化与测试（约 2-3 天）

1. 调整整体样式，确保视觉统一
2. 响应式适配
3. 交互动画优化
4. 功能测试和 Bug 修复

**总预计工期：13-18 个工作日**

### 关键实施要点

#### 1. 数据获取实现（基于新接口）

```javascript
// NotifyDrop 组件中的数据处理
const [activeTab, setActiveTab] = useState("official");
const [filterType, setFilterType] = useState("all"); // 'unread' | 'all'

// 1. 获取统一未读数（初始化时调用一次）
const { data: unreadCounts, refresh: refreshUnreadCounts } =
  useRequest(async () => {
    return getUnreadCounts(); // GET /messages/unreads
  }, []);

// 2. 官方消息列表
const { data: officialMessages, refresh: refreshOfficialMessages } = useRequest(
  async () => {
    const res = await getSystemDMList(20); // GET /system_dm
    return res.messages || [];
  },
  { ready: activeTab === "official" }
);

// 3. 互动消息列表
const { data: interactionMessages, refresh: refreshInteractionMessages } =
  useRequest(
    async () => {
      const res = await getMessage({
        type: "activities",
        per_page: 20,
        page: 1,
      });
      return res.messages || [];
    },
    { ready: activeTab === "interaction" }
  );

// 4. 私信列表（使用新接口）
const { data: dmData, refresh: refreshDMList } = useRequest(
  async () => {
    return getDMList({
      limit: 20,
      unreadOnly: filterType === "unread",
      includeUnreadCount: true,
    }); // GET /dm/list
  },
  { ready: activeTab === "dm", refreshDeps: [filterType] }
);

// 处理强提醒消息
useEffect(() => {
  if (officialMessages?.length > 0) {
    officialMessages.forEach((msg) => {
      if (msg.extend?.need_strong_remind === "true") {
        // 检查是否已关闭过
        const dismissed = localStorage.getItem(
          `dismissed_notification_${msg.system_dm_id}`
        );
        if (!dismissed) {
          showStrongNotification(msg);
        }
      }
    });
  }
}, [officialMessages]);
```

#### 2. 未读数统计（使用统一接口）

```javascript
// 使用统一未读数接口，一次获取所有未读数
const { data: unreadCounts, refresh: refreshUnreadCounts } =
  useRequest(async () => {
    return getUnreadCounts(); // GET /messages/unreads
  }, []);

// 解构未读数
const {
  system = { total: 0 },
  dynamic = { total: 0 },
  dm = { total: 0 },
} = unreadCounts || {};

// 更新到 Store（在应用初始化时）
useEffect(() => {
  if (unreadCounts) {
    useAppStore.setState({
      officialUnread: system.total, // 官方消息未读数
      interactionUnread: dynamic.total, // 互动消息未读数
      dmUnread: dm.total, // 私信未读数
      unreadNum: system.total + dynamic.total + dm.total, // 总未读数
    });
  }
}, [unreadCounts]);

// 轮询刷新未读数（每30秒）
useEffect(() => {
  const timer = setInterval(() => {
    refreshUnreadCounts();
  }, 30000);
  return () => clearInterval(timer);
}, []);
```

#### 3. 一键已读实现（仅针对当前 Tab）

```javascript
const [activeTab, setActiveTab] = useState("official"); // 当前激活的 Tab

const handleMarkCurrentTabRead = async () => {
  try {
    // 根据当前激活的 Tab 调用对应的 POST 接口
    switch (activeTab) {
      case "official":
        // 官方消息已读
        await setSystemDMReadAll(); // POST /system_dm/read_all
        break;

      case "interaction":
        // 互动消息已读
        await setMessageReadAll("all"); // POST /message/read_all
        break;

      case "dm":
        // 私信已读
        await setDMReadAll(); // POST /dm/read_all（改用POST方法）
        break;
    }

    // 刷新当前 Tab 的数据
    switch (activeTab) {
      case "official":
        refreshOfficialMessages();
        break;
      case "interaction":
        refreshInteractionMessages();
        break;
      case "dm":
        refreshDMList();
        break;
    }

    // 重新获取未读数统计
    await refreshUnreadCounts(); // GET /messages/unreads

    message.success("已标记为已读");
  } catch (error) {
    console.error("标记已读失败:", error);
    message.error("操作失败，请重试");
  }
};
```

#### 4. 强提醒消息处理

```javascript
// 强提醒消息状态
const [strongNotification, setStrongNotification] = useState(null);

// 检查并展示强提醒消息
const showStrongNotification = (message) => {
  // 检查是否已关闭过
  const dismissedKey = `dismissed_notification_${message.system_dm_id}`;
  const isDismissed = localStorage.getItem(dismissedKey);

  if (!isDismissed && message.extend?.need_strong_remind === "true") {
    setStrongNotification(message);
  }
};

// 关闭强提醒
const handleDismissStrongNotification = (messageId) => {
  // 记录到 localStorage
  localStorage.setItem(`dismissed_notification_${messageId}`, "true");
  setStrongNotification(null);
};

// 解析 contents 字段
const parseContents = (contentsStr) => {
  try {
    return JSON.parse(contentsStr);
  } catch (error) {
    console.error("解析 contents 失败:", error);
    return [];
  }
};

// 渲染强提醒组件
{
  strongNotification && (
    <StrongNotification
      message={strongNotification}
      onDismiss={() =>
        handleDismissStrongNotification(strongNotification.system_dm_id)
      }
    />
  );
}
```

---

## 五、风险点和注意事项

### 5.1 接口兼容性

**✅ 已解决：后端已提供完整方案**

- ✅ 统一未读数接口：`GET /messages/unreads`（新增）
- ✅ 系统消息增强：`GET /system_dm`（extend 字段支持）
- ✅ 私信列表接口：`GET /dm/list`（新增，推荐使用）
- ✅ 一键已读接口：POST 方法（新增）
- ✅ 强提醒：通过 `extend.need_strong_remind` 字段判断

**注意事项：**

- ⚠️ `extend` 字段仅在 MC 消息时存在，本地消息为 `null`，需做判空处理
- ⚠️ `contents` 字段是 JSON 字符串，需要 `JSON.parse()` 解析
- ⚠️ `need_strong_remind` 是字符串 `'true'` 或 `'false'`，不是布尔值

### 5.2 性能优化建议

**未读数统计：**

- ✅ 使用统一接口 `/messages/unreads` 减少请求次数（3 个请求 → 1 个请求）
- ⚠️ `include_dm_detail` 参数会增加查询时间，按需使用
- 💡 建议定期轮询（30 秒），避免频繁请求

**私信列表：**

- ✅ 推荐使用游标分页（`max` 参数）而不是页码分页
- ⚠️ `include_unread_count` 会增加数据库查询，按需使用
- 💡 深度分页性能差，可能出现数据重复或遗漏

**一键已读操作：**

- ⚠️ 执行后建议重新获取未读数统计
- ⚠️ 避免短时间内重复调用

### 5.3 数据一致性

**未读数可能存在延迟：**

- ⚠️ Redis 和数据库之间可能有短暂不一致
- 💡 建议使用乐观更新策略

**系统消息 extend 字段：**

- ⚠️ 需要判空处理，避免前端报错
- ⚠️ 本地消息的 `extend` 字段为 `null`
- 💡 使用可选链操作符：`msg.extend?.title`

### 5.4 用户体验

- ⚠️ Dropdown 尺寸可能需要调整以适应新内容（官方消息有封面图、模板图）
- ⚠️ 强提醒消息的展示频率需要控制，通过 localStorage 记录已关闭状态
- ⚠️ 多图展示可能影响加载性能，需要懒加载
- 💡 图片 URL 已签名，可以直接使用
- ⚠️ 消息列表滚动加载需要优化

### 5.5 兼容性

- ⚠️ 需要保证现有功能不受影响
- ⚠️ 数据结构变化需要做好向下兼容
- ✅ 旧接口保持向后兼容，前端可继续使用

---

## 六、后端接口对照表

### 6.1 新旧接口对比

| 功能           | 旧方案（当前）                                                              | 新方案（推荐）                     | 优势                             |
| -------------- | --------------------------------------------------------------------------- | ---------------------------------- | -------------------------------- |
| 获取所有未读数 | 调用 3 个接口：<br>• `/dm/unread`<br>• `/message/unreads`<br>• `/system_dm` | `/messages/unreads`                | 1 个请求替代 3 个，性能提升      |
| 获取系统消息   | `/system_dm`                                                                | `/system_dm`（功能增强）           | 新增 extend 扩展字段，支持富内容 |
| 获取私信列表   | `/dm`（混合系统消息）                                                       | `/dm/list` ⭐ 推荐                 | 纯私信，支持分页和未读筛选       |
| 获取动态消息   | `/message`                                                                  | `/message`（保持不变）             | 无变化                           |
| 系统消息已读   | 无                                                                          | `POST /system_dm/read_all` ⭐ 新增 | 独立的已读接口                   |
| 动态消息已读   | 无                                                                          | `POST /message/read_all` ⭐ 新增   | 独立的已读接口                   |
| 私信已读       | `GET /dm/read_all`                                                          | `POST /dm/read_all` ⭐ 推荐        | POST 方法更符合 RESTful 规范     |

### 6.2 强提醒消息判断逻辑

```javascript
// 根据后端返回的 extend 字段判断
if (message.source === "mc" && message.extend?.need_strong_remind === "true") {
  // 展示强提醒浮窗
  showStrongNotification(message);
}
```

**关键字段：**

- `source`: `'mc'` 表示来自 MC 服务，`'local'` 表示本地消息
- `extend.need_strong_remind`: 字符串 `'true'` 或 `'false'`
- `extend.cover_url`: 封面图 URL（已签名）
- `extend.contents`: 内容列表（JSON 字符串，需解析）

### 6.3 实施建议

**阶段 1：基础改造（必须）**

1. ✅ 更新 `services/notify.js`，新增接口封装
2. ✅ 使用统一未读数接口 `/messages/unreads`
3. ✅ 官方消息使用 `/system_dm`（处理 extend 字段）
4. ✅ 私信使用新接口 `/dm/list`
5. ✅ 一键已读使用 POST 方法

**阶段 2：功能增强（推荐）**

1. 💡 实现强提醒消息浮窗
2. 💡 游标分页优化私信列表
3. 💡 官方消息富内容渲染（封面图、模板图）
4. 💡 未读数轮询优化（30 秒间隔）

**阶段 3：性能优化（可选）**

1. 💡 图片懒加载
2. 💡 虚拟滚动（长列表）
3. 💡 乐观更新策略
4. 💡 缓存策略优化

---

## 七、总结

本次改造主要涉及：

**核心改造点：**

1. Tab 从 2 个扩展到 3 个（官方、互动、私信）
2. 增加头部"一键已读"功能（仅针对当前 Tab）
3. 每个 Tab 增加二级筛选（未读/全部）
4. 重新设计 3 种消息卡片样式
5. 新增强提醒消息功能

**技术难点：**

1. 组件结构重构，保持代码可维护性
2. 多种消息类型的统一管理
3. 强提醒与 Dropdown 的互斥逻辑
4. 样式适配和交互优化

**建议优先级：**

- P0: Tab 结构调整、接口对接
- P1: 三种消息卡片样式实现
- P2: 强提醒功能
- P3: 样式和交互优化

---

## 八、功能测试用例

### 8.1 测试用例说明

**测试环境要求：**

- 浏览器：Chrome 最新版、Safari 最新版、Firefox 最新版
- 网络：正常网络环境、弱网环境
- 设备：桌面端（1920×1080、1366×768）
- 测试账号：已登录用户

**测试数据准备：**

- 官方消息：含 MC 富内容消息、本地文本消息
- 互动消息：含未读消息、已读消息
- 私信：含未读会话、已读会话
- 强提醒消息：含需要弹窗的系统消息

### 8.2 基础功能测试用例

#### TC-001：通知中心入口展示

| 项目     | 内容                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证通知图标和未读数显示                                                                                  |
| 前置条件 | 用户已登录，存在未读消息                                                                                  |
| 测试步骤 | 1. 登录系统<br>2. 查看头部通知图标                                                                        |
| 预期结果 | 1. 通知图标正常显示<br>2. 未读数红点显示正确（官方+互动+私信未读数之和）<br>3. 未读数大于 99 时显示 "99+" |
| 测试数据 | 官方消息未读 5 条，互动消息未读 3 条，私信未读 2 条                                                       |
| 优先级   | P0                                                                                                        |

#### TC-002：Dropdown 打开和关闭

| 项目     | 内容                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证消息中心下拉面板的打开和关闭                                                                                        |
| 前置条件 | 用户已登录                                                                                                              |
| 测试步骤 | 1. 点击通知图标<br>2. 观察下拉面板<br>3. 点击页面其他区域<br>4. 再次点击通知图标                                        |
| 预期结果 | 1. 首次点击，下拉面板展开<br>2. 面板尺寸正常（440px × 480px）<br>3. 点击外部区域，面板关闭<br>4. 再次点击，面板重新打开 |
| 优先级   | P0                                                                                                                      |

### 8.3 Tab 切换功能测试

#### TC-003：三个 Tab 切换

| 项目     | 内容                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证官方消息、互动消息、私信三个 Tab 的切换                                                                                  |
| 前置条件 | 打开消息中心下拉面板                                                                                                         |
| 测试步骤 | 1. 默认停留在官方消息 Tab<br>2. 点击"互动消息"Tab<br>3. 点击"私信"Tab<br>4. 再次点击"官方消息"Tab                            |
| 预期结果 | 1. 默认激活官方消息 Tab<br>2. 点击后 Tab 切换正常，内容对应更新<br>3. 激活 Tab 有高亮样式<br>4. Tab 上显示对应的未读数 Badge |
| 测试数据 | 每个 Tab 都有未读消息                                                                                                        |
| 优先级   | P0                                                                                                                           |

#### TC-004：Tab 未读数显示

| 项目     | 内容                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证每个 Tab 上的未读数 Badge 显示                                                                                                     |
| 前置条件 | 三个 Tab 都有未读消息                                                                                                                  |
| 测试步骤 | 1. 打开消息中心<br>2. 观察三个 Tab 的未读数 Badge                                                                                      |
| 预期结果 | 1. 官方消息 Tab 显示系统消息未读数<br>2. 互动消息 Tab 显示动态消息未读数<br>3. 私信 Tab 显示私信未读数<br>4. 未读数为 0 时不显示 Badge |
| 测试数据 | 官方 5 条，互动 3 条，私信 0 条                                                                                                        |
| 优先级   | P0                                                                                                                                     |

### 8.4 二级筛选功能测试

#### TC-005：未读/全部筛选切换

| 项目     | 内容                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| 测试场景 | 验证每个 Tab 下的"未读"和"全部"筛选功能                                                                            |
| 前置条件 | 打开消息中心，当前 Tab 有已读和未读消息                                                                            |
| 测试步骤 | 1. 默认选中"全部"<br>2. 点击"未读"按钮<br>3. 点击"全部"按钮                                                        |
| 预期结果 | 1. 默认显示全部消息<br>2. 点击"未读"后只显示未读消息<br>3. 点击"全部"后显示所有消息<br>4. 当前选中的按钮有高亮样式 |
| 测试数据 | 未读消息 5 条，已读消息 10 条                                                                                      |
| 优先级   | P0                                                                                                                 |

#### TC-006：私信 Tab 未读筛选

| 项目     | 内容                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证私信 Tab 使用新接口的未读筛选功能                                                                                                  |
| 前置条件 | 打开消息中心，切换到私信 Tab                                                                                                           |
| 测试步骤 | 1. 点击"未读"按钮<br>2. 观察请求接口和参数<br>3. 点击"全部"按钮                                                                        |
| 预期结果 | 1. 点击"未读"时，调用 `/dm/list?unread_only=1`<br>2. 只显示有未读消息的会话<br>3. 点击"全部"时，调用 `/dm/list`（无 unread_only 参数） |
| 测试数据 | 未读会话 3 个，已读会话 7 个                                                                                                           |
| 优先级   | P1                                                                                                                                     |

### 8.5 一键已读功能测试

#### TC-007：官方消息一键已读

| 项目     | 内容                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证官方消息 Tab 的一键已读功能                                                                                                                         |
| 前置条件 | 打开消息中心，官方消息 Tab 有未读消息                                                                                                                   |
| 测试步骤 | 1. 切换到官方消息 Tab<br>2. 点击右上角"一键已读"按钮<br>3. 观察消息状态和未读数变化                                                                     |
| 预期结果 | 1. 调用 `POST /system_dm/read_all` 接口<br>2. 所有官方消息标记为已读<br>3. 官方消息未读数变为 0<br>4. 总未读数相应减少<br>5. 显示成功提示"已标记为已读" |
| 测试数据 | 官方消息未读 5 条                                                                                                                                       |
| 优先级   | P0                                                                                                                                                      |

#### TC-008：互动消息一键已读

| 项目     | 内容                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证互动消息 Tab 的一键已读功能                                                                                      |
| 前置条件 | 打开消息中心，互动消息 Tab 有未读消息                                                                                |
| 测试步骤 | 1. 切换到互动消息 Tab<br>2. 点击右上角"一键已读"按钮<br>3. 观察消息状态和未读数变化                                  |
| 预期结果 | 1. 调用 `POST /message/read_all` 接口<br>2. 所有互动消息标记为已读<br>3. 互动消息未读数变为 0<br>4. 总未读数相应减少 |
| 测试数据 | 互动消息未读 8 条                                                                                                    |
| 优先级   | P0                                                                                                                   |

#### TC-009：私信一键已读

| 项目     | 内容                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| 测试场景 | 验证私信 Tab 的一键已读功能                                                                                              |
| 前置条件 | 打开消息中心，私信 Tab 有未读消息                                                                                        |
| 测试步骤 | 1. 切换到私信 Tab<br>2. 点击右上角"一键已读"按钮<br>3. 观察消息状态和未读数变化                                          |
| 预期结果 | 1. 调用 `POST /dm/read_all` 接口（POST 方法）<br>2. 所有私信会话标记为已读<br>3. 私信未读数变为 0<br>4. 总未读数相应减少 |
| 测试数据 | 私信未读会话 4 个                                                                                                        |
| 优先级   | P0                                                                                                                       |

#### TC-010：一键已读按钮状态

| 项目     | 内容                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证一键已读按钮在不同状态下的显示                                                                                              |
| 前置条件 | 打开消息中心                                                                                                                    |
| 测试步骤 | 1. 当前 Tab 有未读消息时观察按钮<br>2. 当前 Tab 无未读消息时观察按钮<br>3. 点击一键已读后观察按钮状态                           |
| 预期结果 | 1. 有未读时按钮正常显示，可点击<br>2. 无未读时按钮可以显示但置灰/禁用（根据设计）<br>3. 点击后按钮在请求过程中显示 loading 状态 |
| 优先级   | P1                                                                                                                              |

### 8.6 消息卡片展示测试

#### TC-011：官方消息 - MC 富内容展示

| 项目     | 内容                                                                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证 MC 系统消息（含 extend 扩展字段）的富内容展示                                                                                                                                                                   |
| 前置条件 | 官方消息 Tab 有 MC 消息（`source='mc'` 且 `extend` 不为 null）                                                                                                                                                       |
| 测试步骤 | 1. 切换到官方消息 Tab<br>2. 观察 MC 消息的展示                                                                                                                                                                       |
| 预期结果 | 1. 显示封面图（`extend.cover_url`）<br>2. 显示标题（`extend.title`）<br>3. 显示素材模板图列表（解析 `extend.contents` JSON）<br>4. 模板图可点击，跳转到对应链接<br>5. 底部显示时间<br>6. 图片 URL 已签名，可正常加载 |
| 测试数据 | MC 消息包含 cover_url、title、contents（2-3 张图片）                                                                                                                                                                 |
| 优先级   | P0                                                                                                                                                                                                                   |

#### TC-012：官方消息 - 本地文本展示

| 项目     | 内容                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证本地系统消息（`source='local'` 或 `extend=null`）的展示                                                                                   |
| 前置条件 | 官方消息 Tab 有本地消息                                                                                                                       |
| 测试步骤 | 1. 切换到官方消息 Tab<br>2. 观察本地消息的展示                                                                                                |
| 预期结果 | 1. 显示系统头像（32px）<br>2. 显示消息文本内容（HTML 格式，使用 `cleanHtmlTag` 处理）<br>3. 底部显示时间<br>4. 样式简洁，与 MC 消息有明显区分 |
| 测试数据 | 本地消息文本："您的账号已升级为 VIP 会员"                                                                                                     |
| 优先级   | P0                                                                                                                                            |

#### TC-013：互动消息展示

| 项目     | 内容                                                                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证互动消息（mentions、activities）的展示                                                                                                                      |
| 前置条件 | 互动消息 Tab 有消息                                                                                                                                             |
| 测试步骤 | 1. 切换到互动消息 Tab<br>2. 观察消息列表                                                                                                                        |
| 预期结果 | 1. 左侧显示用户头像（40px）<br>2. 右侧顶部显示标题<br>3. 往下显示描述文本<br>4. 如有图片则显示图片（可选）<br>5. 底部左侧显示时间，右侧显示按钮（如"查看详情"） |
| 测试数据 | 互动消息包含头像、标题、描述、图片                                                                                                                              |
| 优先级   | P0                                                                                                                                                              |

#### TC-014：私信消息展示

| 项目     | 内容                                                                                                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证私信会话的展示（使用新接口 `/dm/list` 返回的数据）                                                                                                                                          |
| 前置条件 | 私信 Tab 有会话                                                                                                                                                                                 |
| 测试步骤 | 1. 切换到私信 Tab<br>2. 观察会话列表                                                                                                                                                            |
| 预期结果 | 1. 左侧显示对方用户头像（40px）<br>2. 右侧顶部：左侧显示对方昵称，右侧显示时间<br>3. 右侧底部：显示最后一条消息内容<br>4. 未读会话有未读标识（红点或数字 Badge）<br>5. 点击会话跳转到聊天详情页 |
| 测试数据 | 会话包含 `with_user` 信息、`last_message`、`unread_count`                                                                                                                                       |
| 优先级   | P0                                                                                                                                                                                              |

### 8.7 强提醒消息测试

#### TC-015：强提醒消息展示

| 项目     | 内容                                                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证强提醒消息浮窗的展示                                                                                                                                                         |
| 前置条件 | 官方消息中有 `extend.need_strong_remind='true'` 的 MC 消息，且该消息未被关闭过                                                                                                   |
| 测试步骤 | 1. 登录系统<br>2. 获取官方消息列表<br>3. 观察强提醒浮窗                                                                                                                          |
| 预期结果 | 1. 页面右上角展示强提醒浮窗（固定定位）<br>2. 浮窗包含：封面图、标题、描述、素材模板图、底部（时间+按钮）<br>3. 右上角有关闭按钮（×）<br>4. 浮窗尺寸约 360px 宽，带 slideIn 动画 |
| 测试数据 | MC 消息设置 `need_strong_remind='true'`                                                                                                                                          |
| 优先级   | P1                                                                                                                                                                               |

#### TC-016：强提醒消息关闭

| 项目     | 内容                                                                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证强提醒消息的关闭和持久化                                                                                                                                                 |
| 前置条件 | 强提醒浮窗正在显示                                                                                                                                                           |
| 测试步骤 | 1. 点击浮窗右上角关闭按钮<br>2. 刷新页面<br>3. 检查 localStorage                                                                                                             |
| 预期结果 | 1. 点击关闭按钮后浮窗消失<br>2. localStorage 记录关闭状态（key: `dismissed_notification_${message_id}`）<br>3. 刷新页面后该消息不再展示强提醒<br>4. 其他强提醒消息仍正常展示 |
| 优先级   | P1                                                                                                                                                                           |

#### TC-017：强提醒与 Dropdown 互斥

| 项目     | 内容                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证强提醒浮窗与消息中心 Dropdown 的互斥逻辑                                                              |
| 前置条件 | 强提醒浮窗正在显示                                                                                        |
| 测试步骤 | 1. 强提醒浮窗显示时，点击通知图标打开 Dropdown<br>2. 关闭 Dropdown<br>3. 打开 Dropdown 时，如果有新强提醒 |
| 预期结果 | 1. 打开 Dropdown 时，强提醒浮窗自动隐藏<br>2. 关闭 Dropdown 时，强提醒浮窗重新显示<br>3. 两者不会同时显示 |
| 优先级   | P1                                                                                                        |

### 8.8 数据加载和刷新测试

#### TC-018：统一未读数接口调用

| 项目     | 内容                                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证统一未读数接口的调用和数据更新                                                                                                                                |
| 前置条件 | 用户登录后                                                                                                                                                        |
| 测试步骤 | 1. 应用初始化<br>2. 观察网络请求<br>3. 观察未读数显示                                                                                                             |
| 预期结果 | 1. 调用 `GET /messages/unreads` 接口（单次请求）<br>2. 返回数据包含 `system`、`dynamic`、`dm` 三个字段<br>3. 头部通知图标显示总未读数<br>4. 各 Tab 显示对应未读数 |
| 测试数据 | 返回：`{system:{total:5}, dynamic:{total:8}, dm:{total:3}}`                                                                                                       |
| 优先级   | P0                                                                                                                                                                |

#### TC-019：未读数轮询刷新

| 项目     | 内容                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------ |
| 测试场景 | 验证未读数的定期轮询刷新机制                                                                           |
| 前置条件 | 用户保持登录状态                                                                                       |
| 测试步骤 | 1. 登录系统<br>2. 等待 30 秒<br>3. 观察网络请求                                                        |
| 预期结果 | 1. 每 30 秒自动调用 `GET /messages/unreads` 接口<br>2. 未读数自动更新<br>3. 用户无感知，不影响当前操作 |
| 优先级   | P1                                                                                                     |

#### TC-020：私信列表游标分页

| 项目     | 内容                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 测试场景 | 验证私信列表的游标分页功能                                                                                                                                         |
| 前置条件 | 私信 Tab 有大量会话（超过 20 个）                                                                                                                                  |
| 测试步骤 | 1. 打开私信 Tab<br>2. 滚动到列表底部<br>3. 观察加载更多请求                                                                                                        |
| 预期结果 | 1. 首次请求：`GET /dm/list?limit=20`<br>2. 滚动加载更多：`GET /dm/list?max={next_max}&limit=20`<br>3. 使用 `pagination.next_max` 作为游标<br>4. 数据不重复，不遗漏 |
| 测试数据 | 总会话数 50 个                                                                                                                                                     |
| 优先级   | P1                                                                                                                                                                 |

### 8.9 异常情况测试

#### TC-021：网络异常处理

| 项目     | 内容                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证网络请求失败时的错误处理                                                                         |
| 前置条件 | 模拟网络异常（断网或接口 500 错误）                                                                  |
| 测试步骤 | 1. 打开消息中心<br>2. 点击一键已读按钮<br>3. 切换 Tab                                                |
| 预期结果 | 1. 显示友好的错误提示信息<br>2. 不会出现白屏或崩溃<br>3. 用户可以重试操作<br>4. 错误信息记录到控制台 |
| 优先级   | P1                                                                                                   |

#### TC-022：空数据展示

| 项目     | 内容                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证各 Tab 无消息时的空状态展示                                                                           |
| 前置条件 | 某个 Tab 没有消息                                                                                         |
| 测试步骤 | 1. 切换到空数据的 Tab                                                                                     |
| 预期结果 | 1. 显示空状态提示<br>2. 提示文案友好（如"暂无消息"）<br>3. 可选：显示空状态插图<br>4. 不显示 loading 状态 |
| 优先级   | P1                                                                                                        |

#### TC-023：extend 字段为 null 的处理

| 项目     | 内容                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证官方消息 extend 字段为 null 时的容错处理                                                                  |
| 前置条件 | 官方消息包含 `extend=null` 的本地消息                                                                         |
| 测试步骤 | 1. 切换到官方消息 Tab<br>2. 观察本地消息展示                                                                  |
| 预期结果 | 1. 不会报错或崩溃<br>2. 使用可选链操作符（`msg.extend?.title`）<br>3. 正常显示文本消息样式<br>4. 控制台无报错 |
| 测试数据 | 本地消息：`{source:'local', extend:null, text:'系统通知'}`                                                    |
| 优先级   | P0                                                                                                            |

#### TC-024：contents 字段 JSON 解析失败

| 项目     | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证 MC 消息 contents 字段 JSON 解析失败时的容错                                                                |
| 前置条件 | MC 消息的 `extend.contents` 是非法 JSON 字符串                                                                  |
| 测试步骤 | 1. 获取包含非法 contents 的 MC 消息<br>2. 观察消息展示                                                          |
| 预期结果 | 1. 使用 try-catch 捕获解析错误<br>2. 返回空数组，不显示素材图<br>3. 其他内容正常显示<br>4. 错误信息记录到控制台 |
| 测试数据 | `contents: "invalid json"`                                                                                      |
| 优先级   | P1                                                                                                              |

### 8.10 兼容性测试

#### TC-025：浏览器兼容性

| 项目     | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| 测试场景 | 验证在不同浏览器中的兼容性                                                                                      |
| 前置条件 | 准备测试浏览器环境                                                                                              |
| 测试步骤 | 在以下浏览器中执行核心功能测试：<br>1. Chrome 最新版<br>2. Safari 最新版<br>3. Firefox 最新版<br>4. Edge 最新版 |
| 预期结果 | 所有核心功能在各浏览器中表现一致，无明显差异                                                                    |
| 优先级   | P1                                                                                                              |

#### TC-026：分辨率适配

| 项目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 测试场景 | 验证在不同屏幕分辨率下的显示效果                                                       |
| 前置条件 | 准备不同分辨率测试环境                                                                 |
| 测试步骤 | 在以下分辨率下测试：<br>1. 1920×1080<br>2. 1366×768<br>3. 1440×900                     |
| 预期结果 | 1. Dropdown 位置正确（不超出屏幕）<br>2. 强提醒浮窗位置正确<br>3. 内容布局合理，不错位 |
| 优先级   | P1                                                                                     |

### 8.11 性能测试

#### TC-027：大量消息加载性能

| 项目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| 测试场景 | 验证加载大量消息时的性能表现                                                                |
| 前置条件 | 准备大量测试数据（每个 Tab 100+ 条消息）                                                    |
| 测试步骤 | 1. 打开消息中心<br>2. 切换各个 Tab<br>3. 滚动加载更多                                       |
| 预期结果 | 1. 首屏加载时间 < 1 秒<br>2. Tab 切换流畅，无卡顿<br>3. 滚动加载响应及时<br>4. 内存占用合理 |
| 优先级   | P2                                                                                          |

#### TC-028：图片懒加载

| 项目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| 测试场景 | 验证消息中图片的懒加载效果                                                                       |
| 前置条件 | 消息列表包含大量图片（MC 消息的封面图和模板图）                                                  |
| 测试步骤 | 1. 打开官方消息 Tab<br>2. 观察网络请求<br>3. 滚动列表                                            |
| 预期结果 | 1. 只加载可见区域的图片<br>2. 滚动时懒加载后续图片<br>3. 减少初始请求数量<br>4. 提升首屏加载速度 |
| 优先级   | P2                                                                                               |

### 8.12 测试数据准备清单

**官方消息测试数据：**

```javascript
// MC 消息（富内容）
{
  system_dm_id: 1001,
  source: 'mc',
  text: 'MC 系统消息',
  extend: {
    title: '双十一活动通知',
    cover_url: 'https://cdn.example.com/cover.jpg',
    contents: '[{"content_id":2001,"content_url":"https://cdn.example.com/template1.jpg","content_cover_url":"https://cdn.example.com/template1_cover.jpg"}]',
    need_strong_remind: 'true'
  },
  created_at: 1699200000,
  unread: true
}

// 本地消息（纯文本）
{
  system_dm_id: 1002,
  source: 'local',
  text: '您的账号已升级为 VIP 会员',
  extend: null,
  created_at: 1699190000,
  unread: false
}
```

**互动消息测试数据：**

```javascript
{
  message_id: 3001,
  type: 'activities',
  by_user: {
    user_id: 5001,
    username: 'testuser',
    avatar: {...}
  },
  text: '@了你',
  created_at: 1699180000,
  unread: true
}
```

**私信测试数据：**

```javascript
{
  conversation_id: 4001,
  with_user_id: 6001,
  unread: true,
  unread_count: 5,
  last_message: {
    text: '你好，最近怎么样？',
    created_at: 1699170000
  },
  with_user: {
    user_id: 6001,
    username: 'friend1',
    avatar: {...}
  }
}
```

### 8.13 测试执行记录模板

| 用例编号 | 测试场景 | 执行日期 | 测试人员 | 测试结果 | 缺陷编号 | 备注 |
| -------- | -------- | -------- | -------- | -------- | -------- | ---- |
| TC-001   |          |          |          | ✅/❌    |          |      |
| TC-002   |          |          |          | ✅/❌    |          |      |
| ...      |          |          |          |          |          |      |

### 8.14 测试通过标准

**功能测试通过标准：**

- P0 级别用例通过率 100%
- P1 级别用例通过率 ≥ 95%
- P2 级别用例通过率 ≥ 90%
- 无阻塞性缺陷
- 无严重性缺陷

**性能测试通过标准：**

- 首屏加载时间 < 1 秒
- Tab 切换响应时间 < 300ms
- 接口响应时间 < 500ms
- 页面 FPS ≥ 55

**兼容性测试通过标准：**

- 主流浏览器（Chrome、Safari、Firefox、Edge）功能一致
- 不同分辨率下显示正常
- 移动端 H5 适配良好（如有）

---

**文档创建时间**: 2025-11-06  
**文档版本**: v1.0  
**维护人员**: AI Assistant
