# TMM模块重构与架构设计


## 一、架构目标

###  1.1 关注点分离

**关注点分离是一种软件工程设计原则，旨在将系统或程序中的不同部分进行逻辑上的分离，使得每个部分只关注于特定方面的功能。这种分离可以帮助提高代码的可维护性、可读性以及可扩展性。**
  
  **核心思想**
 
- 独立性：每个模块或组件应该独立处理其相关的功能，不依赖于其他模块的实现细节。
- 单一职责：每个模块应负责一个特定的关注点（功能或责任），避免职责混合。 
- 模块化设计：通过将不同关注点的代码分离成独立的模块或组件，简化任务管理。


### 1.2 依赖注入  

**依赖注入（Dependency Injection, DI）是一种设计模式，用于实现控制反转（Inversion of Control, IoC）。它通过将对象所依赖的组件从外部传递进来，而不是在对象内部自己创建，从而实现对象间的解耦。这一模式有助于提高代码的可测试性和可维护性**

## 二、架构实现

![alt text](../img/tmm-mode.png)

### 2.1 UI层
```ts
/**
 * 消息列表组件
 * 
 * 职责:
 * 1. 渲染消息列表和输入框
 * 2. 处理用户交互
 * 3. 触发消息发送等操作
 * 4. 虚拟列表优化性能
 */
export const MessageList = observer(() => {
  // API服务实例，用于发送网络请求
  const messageAPI = useMessageAPI();
  // 状态管理实例，用于获取和更新状态
  const messageStore = useMessageStore();
  // 虚拟列表引用，用于滚动控制
  const virtualListRef = useRef<VirtualListRef>(null);

  /**
   * 发送消息处理函数
   * @param content 消息内容
   */
  const handleSendMessage = async (content: string) => {
    try {
      // 调用API发送消息
      await messageAPI.sendMessage({
        content,
        type: 'text',
        timestamp: Date.now(),
        conversationId: messageStore.currentConversationId
      });
    } catch (error) {
      // 错误处理，可以显示错误提示等
      console.error('Send message failed:', error);
    }
  };

  /**
   * 虚拟列表渲染优化
   * 1. 只渲染可视区域的消息
   * 2. 通过overscan参数控制预渲染区域
   * 3. 使用memo优化子组件渲染
   */
  return (
    <div className="message-list">
      <VirtualList
        ref={virtualListRef}
        data={messageStore.currentMessages}
        itemHeight={60}
        overscan={5}
      >
        {(message) => (
          <MessageItem
            key={message.id}
            message={message}
            onResend={handleResend}
            onDelete={handleDelete}
          />
        )}
      </VirtualList>
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
});

```
### 2.2 API层 
```ts
/**
 * 消息API服务类
 * 
 * 职责:
 * 1. 处理所有网络请求
 * 2. 实现乐观更新
 * 3. 错误处理和重试逻辑
 * 4. 请求状态管理
 */
export class MessageAPI {
  constructor(
    private http: AxiosInstance,
    private db: MessageDB,
    private eventBus: EventBus
  ) {}

  /**
   * 发送消息
   * 实现乐观更新策略：
   * 1. 立即保存到本地数据库
   * 2. 更新UI显示
   * 3. 后台发送请求
   * 4. 成功后更新消息状态
   * 
   * @param payload 消息内容
   */
  async sendMessage(payload: MessagePayload): Promise<void> {
    // 生成本地消息ID，用于乐观更新
    const localId = generateUUID();
    
    try {
      // 创建本地消息对象
      const localMessage = {
        ...payload,
        id: localId,
        status: 'sending'
      };

      // 先保存本地消息，实现即时显示
      await this.db.saveMessage(localMessage);

      // 发送API请求
      const response = await this.http.post('/messages', payload);
      
      // 更新本地消息状态
      const serverMessage = {
        ...response.data,
        localId,
        status: 'sent'
      };

      // 更新数据库中的消息状态
      await this.db.updateMessage(localId, serverMessage);

    } catch (error) {
      // 错误处理：更新消息状态为失败
      await this.db.updateMessage(localId, {
        status: 'failed',
        error: error.message
      });
      
      throw new APIError('Failed to send message', error);
    }
  }

  /**
   * 获取历史消息
   * 包含以下功能：
   * 1. 分页加载
   * 2. 缓存控制
   * 3. 错误重试
   * 
   * @param params 查询参数
   */
  async fetchMessages(params: FetchMessagesParams): Promise<Message[]> {
    try {
      // 检查本地缓存
      const cachedMessages = await this.db.getMessages(params);
      if (cachedMessages.length > 0) {
        return cachedMessages;
      }

      // 发送网络请求
      const response = await this.http.get('/messages', { params });
      
      // 保存到数据库
      await this.db.saveMessages(response.data);
      
      return response.data;
    } catch (error) {
      throw new APIError('Failed to fetch messages', error);
    }
  }
}

```

### 2.3 DB层
```ts
/**
 * 消息数据库服务类
 * 
 * 职责:
 * 1. 数据持久化
 * 2. 索引管理
 * 3. 事务处理
 * 4. 缓存控制
 */
export class MessageDB {
  constructor(
    private db: Dexie,
    private eventBus: EventBus
  ) {
    this.initializeDB();
  }

  /**
   * 初始化数据库
   * 配置数据库结构和索引
   */
  private initializeDB() {
    this.db.version(1).stores({
      messages: '&id, conversationId, timestamp, status',
      conversations: '&id, lastMessageId, unreadCount'
    });
  }

  /**
   * 保存单条消息
   * 使用事务确保数据一致性
   * 
   * @param message 消息对象
   */
  async saveMessage(message: Message): Promise<void> {
    try {
      await this.db.transaction('rw', 
        [this.db.messages, this.db.conversations], 
        async () => {
          // 保存消息
          await this.db.messages.add(message);

          // 更新会话信息
          await this.db.conversations.update(message.conversationId, {
            lastMessageId: message.id,
            timestamp: message.timestamp
          });

          // 触发存储成功事件
          this.eventBus.emit(EventTypes.DB_MESSAGE_SAVED, {
            type: 'message',
            data: message
          });
      });
    } catch (error) {
      this.eventBus.emit(EventTypes.DB_ERROR, {
        type: 'message',
        error
      });
      throw error;
    }
  }

  /**
   * 批量保存消息
   * 使用bulkAdd提高性能
   * 
   * @param messages 消息数组
   */
  async saveMessages(messages: Message[]): Promise<void> {
    try {
      await this.db.transaction('rw', 
        [this.db.messages], 
        async () => {
          await this.db.messages.bulkAdd(messages);
          
          this.eventBus.emit(EventTypes.DB_MESSAGES_SAVED, {
            type: 'messages',
            data: messages
          });
      });
    } catch (error) {
      throw new DBError('Failed to save messages', error);
    }
  }
}

```
### 2.4 Event层
```ts
/**
 * 事件总线服务类
 * 
 * 职责:
 * 1. 事件发布订阅
 * 2. 事件队列管理
 * 3. 错误处理
 * 4. 事件追踪
 */
export class EventBus {
  // 事件处理器映射
  private handlers = new Map<EventTypes, Set<EventHandler>>();
  // 事件队列，用于异步处理
  private eventQueue: Queue<EventPayload> = new Queue();

  constructor() {
    this.processEventQueue();
  }

  /**
   * 发布事件
   * 将事件加入队列异步处理
   * 
   * @param type 事件类型
   * @param payload 事件数据
   */
  emit(type: EventTypes, payload: EventPayload): void {
    this.eventQueue.enqueue({
      type,
      payload,
      timestamp: Date.now()
    });
  }

  /**
   * 订阅事件
   * 返回取消订阅函数
   * 
   * @param type 事件类型
   * @param handler 事件处理器
   */
  on(type: EventTypes, handler: EventHandler): () => void {
    let handlers = this.handlers.get(type);
    if (!handlers) {
      handlers = new Set();
      this.handlers.set(type, handlers);
    }
    handlers.add(handler);

    return () => {
      handlers?.delete(handler);
      if (handlers?.size === 0) {
        this.handlers.delete(type);
      }
    };
  }

  /**
   * 处理事件队列
   * 异步处理所有事件
   */
  private async processEventQueue(): Promise<void> {
    while (true) {
      if (this.eventQueue.isEmpty()) {
        await new Promise(resolve => setTimeout(resolve, 10));
        continue;
      }

      const event = this.eventQueue.dequeue();
      if (!event) continue;

      const handlers = this.handlers.get(event.type);
      if (!handlers) continue;

      // 并行处理所有处理器
      await Promise.all(
        Array.from(handlers).map(handler =>
          handler(event.payload).catch(error =>
            console.error(`Event handler error: ${error}`)
          )
        )
      );
    }
  }
}

```
  ### 2.5 Data层
```ts
/**
 * 消息状态管理类
 * 
 * 职责:
 * 1. 状态管理
 * 2. 状态计算
 * 3. 状态同步
 * 4. 状态持久化
 */
export class MessageStore {
  // 消息Map，用于快速查找和更新
  @observable messages = new Map<string, Message>();
  // 当前会话ID
  @observable currentConversationId: string | null = null;
  // 加载状态管理
  @observable loadingStatus = new Map<string, LoadingStatus>();

  constructor(private eventBus: EventBus) {
    this.subscribeToEvents();
    makeAutoObservable(this);
  }

  /**
   * 订阅数据库事件
   * 保持状态同步
   */
  private subscribeToEvents(): void {
    this.eventBus.on(EventTypes.DB_MESSAGE_SAVED, this.handleMessageSaved);
    this.eventBus.on(EventTypes.DB_MESSAGES_SAVED, this.handleMessagesSaved);
    this.eventBus.on(EventTypes.DB_MESSAGE_UPDATED, this.handleMessageUpdated);
  }

  /**
   * 处理单条消息保存事件
   * 更新内存中的消息状态
   * 
   * @param event 数据库事件
   */
  @action
  private handleMessageSaved = (event: DBEvent): void => {
    const message = event.data as Message;
    this.messages.set(message.id, message);
    
    this.eventBus.emit(EventTypes.STATE_UPDATED, {
      type: 'message',
      data: message
    });
  };

  /**
   * 获取当前会话的消息列表
   * 按时间排序
   */
  @computed
  get currentMessages(): Message[] {
    if (!this.currentConversationId) return [];
    
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === this.currentConversationId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * 切换当前会话
   * 触发消息加载
   * 
   * @param conversationId 会话ID
   */
  @action
  setCurrentConversation(conversationId: string): void {
    this.currentConversationId = conversationId;
    // 加载会话消息
    this.loadConversationMessages(conversationId);
  }
}

```

### 2.6 类型定义
```ts
/**
 * 消息类型定义
 */
export interface Message {
  id: string;
  localId?: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: number;
  conversationId: string;
  senderId: string;
  attachments?: Attachment[];
}

/**
 * 事件类型定义
 */
export enum EventTypes {
  // API事件
  API_REQUEST_START = 'api:request:start',
  API_REQUEST_SUCCESS = 'api:request:success',
  API_REQUEST_ERROR = 'api:request:error',

  // 数据库事件
  DB_MESSAGE_SAVED = 'db:message:saved',
  DB_MESSAGES_SAVED = 'db:messages:saved',
  DB_MESSAGE_UPDATED = 'db:message:updated',
  DB_ERROR = 'db:error',

  // 状态事件
  STATE_UPDATED = 'state:updated',
  STATE_RESET = 'state:reset',

  // UI事件
  UI_UPDATE = 'ui:update',
  UI_ERROR = 'ui:error'
}

/**
 * 事件负载定义
 */
export interface EventPayload<T = any> {
  type: EventTypes;
  data: T;
  timestamp: number;
  metadata?: Record<string, any>;
}

```
### 2.7 应用初始化和依赖注入
```ts
// app/index.ts
export class ChatApplication {
  private container: Container;

  constructor() {
    this.container = new Container();
    this.registerDependencies();
    this.initializeServices();
  }

  private registerDependencies(): void {
    // 注册核心服务
    this.container.register('eventBus', () => new EventBus());
    this.container.register('db', () => new MessageDB());
    this.container.register('api', (c) => new MessageAPI(
      c.get('http'),
      c.get('db'),
      c.get('eventBus')
    ));
    this.container.register('store', (c) => new MessageStore(
      c.get('eventBus')
    ));
  }

  private initializeServices(): void {
    // 初始化各层服务
    const eventBus = this.container.get('eventBus');
    const store = this.container.get('store');
    const api = this.container.get('api');

    // 设置全局错误处理
    eventBus.on(EventTypes.ERROR, this.handleError);
  }

  // 启动应用
  async start(): Promise<void> {
    try {
      // 初始化数据
      const store = this.container.get('store');
      await store.initialize();

      // 启动WebSocket连接
      const ws = this.container.get('websocket');
      await ws.connect();

    } catch (error) {
      console.error('Failed to start application:', error);
      throw error;
    }
  }
}

```

### 2.8 使用案例
```ts
// pages/chat/index.tsx
const ChatPage: React.FC = () => {
  const api = useMessageAPI();
  const store = useMessageStore();
  const [loading, setLoading] = useState(false);

  // 加载历史消息
  const loadMessages = async () => {
    try {
      setLoading(true);
      await api.fetchMessages({
        conversationId: store.currentConversationId,
        pageSize: 20
      });
    } finally {
      setLoading(false);
    }
  };

  // 切换会话
  const switchConversation = (conversationId: string) => {
    store.setCurrentConversation(conversationId);
    loadMessages();
  };

  return (
    <div className="chat-container">
      <ConversationList
        onSelect={switchConversation}
        selectedId={store.currentConversationId}
      />
      <MessageList loading={loading} />
    </div>
  );
};

```
