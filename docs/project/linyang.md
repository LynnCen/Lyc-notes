# 羚羊智能客服工作台技术架构深度解析

## 视频通信系统架构设计

### 1. 多模态消息协议：
**目标：**
- 构建完整的TypeScript类型系统，为整个视频通信应用提供类型安全保障
- 设计清晰的接口规范，便于团队协作和代码维护
- 实现状态和事件的标准化定义

```ts
// 基础类型定义
/**
 * 定义通话状态枚举
 * NULL: 初始状态
 * CALLING: 呼叫中
 * IN_CALL: 通话中
 * FAILED: 呼叫失败
 */
export enum CallingStatus {
  NULL,
  CALLING,
  IN_CALL,
  FAILED
}

export enum VideoChatPageStatus {
  Null,
  Minimized,
  FullScreen,
  PictureInPicture
}
/**
 * 网络质量等级定义
 * 从1-6分别代表从优到差的网络状态
 */
export enum NetworkQualityLevel {
  Excellent = 1,
  Good = 2,
  Poor = 3,
  Bad = 4,
  VeryBad = 5,
  Down = 6
}

export interface DeviceHealthStatus {
  audio: boolean;
  video: boolean;
  network: NetworkQualityScore;
}

export interface NetworkQuality {
  rtt: number;
  packetLoss: number;
  score: NetworkQualityLevel;
}

export type NetworkQualityScore = 'excellent' | 'good' | 'poor';

// 用户相关类型
export interface LocalUser {
  localAudioTrack?: ILocalAudioTrack;
  localVideoTrack?: ILocalVideoTrack;
  localUplinkNetworkQuality: number;
  enabledVideoTrack: boolean;
  enabledAudioTrack: boolean;
}

export interface RemoteUser {
  remoteUsersState: boolean;
  remoteUsersVolume: boolean;
  remoteUsersVideoEnabled: boolean;
  remoteUsersAudioEnabled: boolean;
  remoteUsers: IAgoraRTCRemoteUser[];
  remoteUplinkNetworkQuality: number;
  name: string;
  avatar: string;
}
```

### 2. 状态管理 `CallStateManager.ts`

**采用分层状态管理策略：**

- 核心状态层：管理通话状态、设备状态等基础状态
- 业务状态层：处理业务逻辑相关的状态
- UI状态层：管理界面展示相关的状态
- 使用MobX实现响应式状态管理，确保状态更新的高效性
```ts
import { makeAutoObservable, action, observable } from 'mobx';

export class CallStateManager {
  @observable callStatus: CallingStatus = CallingStatus.NULL;
  @observable deviceStatus: DeviceHealthStatus = {
    audio: false,
    video: false,
    network: 'poor'
  };
  @observable networkQuality: NetworkQuality = {
    rtt: 0,
    packetLoss: 0,
    score: NetworkQualityLevel.Good
  };

  constructor() {
    makeAutoObservable(this);
  }

  @action
  updateCallStatus(status: CallingStatus) {
    this.callStatus = status;
  }

  @action
  updateDeviceStatus(status: Partial<DeviceHealthStatus>) {
    this.deviceStatus = { ...this.deviceStatus, ...status };
  }

  @action
  updateNetworkQuality(quality: Partial<NetworkQuality>) {
    this.networkQuality = { ...this.networkQuality, ...quality };
  }
}
```

### 3. 重连管理 `ReconnectionManager.ts`

**设计目标：**
- 实现可靠的断线重连机制
- 优化弱网环境下的用户体验
- 提供清晰的重连状态反馈

**实现思路，采用多层级重连策略：**

- 即时重连：网络波动5秒内的快速重连
- 延迟重连：较长时间断线的重试机制
- [退避算法](/algorithm/退避算法)：控制重连频率和次数
- 状态同步：确保重连后的状态一致性

```ts
/**
 * 重连管理器
 * 实现指数退避算法的断线重连机制
 */
export class ReconnectionManager {
  private reconnectAttempts = 0;
  private readonly MAX_ATTEMPTS = 3;
  private readonly INITIAL_INTERVAL = 1000; // 初始重连间隔1秒
  private readonly MAX_INTERVAL = 30000;    // 最大重连间隔30秒
  private readonly BACKOFF_MULTIPLIER = 2;  // 退避指数
  private readonly JITTER_FACTOR = 0.1;     // 抖动因子
  private reconnectTimer?: NodeJS.Timeout;

  constructor(private stateManager: CallStateManager) {}

  /**
   * 计算下一次重连间隔
   * 使用指数退避算法并添加随机抖动
   */
  private getNextInterval(): number {
    // 基础间隔时间（指数增长）
    const baseInterval = Math.min(
      this.INITIAL_INTERVAL * Math.pow(this.BACKOFF_MULTIPLIER, this.reconnectAttempts),
      this.MAX_INTERVAL
    );

    // 添加随机抖动，避免多个客户端同时重连
    const jitter = baseInterval * this.JITTER_FACTOR;
    const randomJitter = Math.random() * jitter * 2 - jitter;

    return Math.min(baseInterval + randomJitter, this.MAX_INTERVAL);
  }

  /**
   * 处理断线重连
   * @param client Agora客户端实例
   * @param channelParams 频道连接参数
   */
  async handleDisconnection(client: IAgoraRTCClient, channelParams: {
    appid: string;
    channel: string;
    token: string;
    uid?: UID;
  }) {
    if (this.reconnectAttempts >= this.MAX_ATTEMPTS) {
      this.stateManager.updateCallStatus(CallingStatus.FAILED);
      throw new Error('Maximum reconnection attempts reached');
    }

    try {
      // 更新状态为重连中
      this.stateManager.updateCallStatus(CallingStatus.RECONNECTING);
      
      // 尝试重连
      await this.reconnect(client, channelParams);
      
      // 重连成功，重置计数器
      this.reconnectAttempts = 0;
      this.stateManager.updateCallStatus(CallingStatus.IN_CALL);
      
      // 触发重连成功事件
      this.onReconnectSuccess();
    } catch (error) {
      this.reconnectAttempts++;
      
      // 计算下一次重连间隔
      const nextInterval = this.getNextInterval();
      
      // 更新重连状态
      this.updateReconnectionStatus();
      
      // 设置下一次重连定时器
      this.reconnectTimer = setTimeout(
        () => this.handleDisconnection(client, channelParams),
        nextInterval
      );
    }
  }

  /**
   * 执行重连
   * @param client Agora客户端实例
   * @param params 连接参数
   */
  private async reconnect(client: IAgoraRTCClient, params: {
    appid: string;
    channel: string;
    token: string;
    uid?: UID;
  }): Promise<void> {
    try {
      // 确保之前的连接已经断开
      if (client.connectionState !== 'DISCONNECTED') {
        await client.leave();
      }

      // 重新加入频道
      await client.join(params.appid, params.channel, params.token, params.uid);
    } catch (error) {
      console.error('Reconnection failed:', error);
      throw error;
    }
  }

  /**
   * 更新重连状态
   */
  private updateReconnectionStatus(): void {
    const remainingAttempts = this.MAX_ATTEMPTS - this.reconnectAttempts;
    this.stateManager.updateReconnectionStatus({
      attempts: this.reconnectAttempts,
      remaining: remainingAttempts,
      nextInterval: this.getNextInterval()
    });
  }

  /**
   * 重连成功后的处理
   */
  private onReconnectSuccess(): void {
    // 可以添加重连成功后的逻辑，比如恢复之前的状态
    this.stateManager.updateReconnectionStatus({
      attempts: 0,
      remaining: this.MAX_ATTEMPTS,
      nextInterval: this.INITIAL_INTERVAL
    });
  }

  /**
   * 清理重连状态
   */
  clearReconnection() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.reconnectAttempts = 0;
    this.updateReconnectionStatus();
  }

  /**
   * 获取当前重连状态
   */
  getReconnectionStatus() {
    return {
      attempts: this.reconnectAttempts,
      remaining: this.MAX_ATTEMPTS - this.reconnectAttempts,
      isReconnecting: this.reconnectTimer !== undefined
    };
  }
}
```

```ts
// 在连接状态变化时调用
client.on('connection-state-change', (curState, prevState) => {
  if (curState === 'DISCONNECTED') {
    reconnectionManager.handleDisconnection(client, channelParams);
  }
});
```

### 4. 设备健康检测 DeviceHealthCheck.ts

**设计目标：**
- 实现设备状态的全面检测
- 提供网络质量评估
- 预防可能的设备问题

**实现思路，构建完整的设备健康检测体系：**
- 权限检测：检查摄像头和麦克风权限
- 设备测试：验证设备是否正常工作
- 网络诊断：评估网络质量和稳定性
- 实时监控：持续监测设备状态变化
```ts
export class DeviceHealthCheck {
  constructor(private stateManager: CallStateManager) {}

  async checkDevices(): Promise<DeviceHealthStatus> {
    const [audioPermission, videoPermission, networkQuality] = await Promise.all([
      this.checkAudioPermission(),
      this.checkVideoPermission(),
      this.checkNetworkQuality()
    ]);

    const status = {
      audio: audioPermission,
      video: videoPermission,
      network: networkQuality
    };

    this.stateManager.updateDeviceStatus(status);
    return status;
  }

  private async checkAudioPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  private async checkVideoPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  private async checkNetworkQuality(): Promise<NetworkQualityScore> {
    const rtt = await this.measureRTT();
    const packetLoss = await this.measurePacketLoss();
    return this.calculateNetworkScore(rtt, packetLoss);
  }

  private async measureRTT(): Promise<number> {
    // 实现RTT测量
    return 100; // 示例值
  }

  private async measurePacketLoss(): Promise<number> {
    // 实现丢包率测量
    return 0.01; // 示例值
  }

  private calculateNetworkScore(rtt: number, packetLoss: number): NetworkQualityScore {
    if (rtt < 100 && packetLoss < 0.01) return 'excellent';
    if (rtt < 300 && packetLoss < 0.05) return 'good';
    return 'poor';
  }
}

```

### 5. 通话超时管理 `CallTimeoutManager.ts`

**设计目标**

- 控制异常状态下的资源占用
- 提供及时的用户反馈
- 确保系统稳定性

**实现思路，建立多层级的超时控制机制：**

- 呼叫超时：控制呼叫等待时间
- 响应超时：监控信令交互超时
- 连接超时：管理媒体连接建立超时
- 自动清理：处理超时后的资源释放
```ts
export class CallTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly CALL_TIMEOUT = 30000; // 30秒

  constructor(private stateManager: CallStateManager) {}

  startCallTimeout(onTimeout: () => void) {
    this.timeoutId = setTimeout(() => {
      this.stateManager.updateCallStatus(CallingStatus.FAILED);
      onTimeout();
      this.clearTimeout();
    }, this.CALL_TIMEOUT);
  }

  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

```

### 6. 视频通信主类 AgoraRtc.ts

**设计目标：**
- 整合所有功能模块
- 提供统一的接口
- 管理整个通话生命周期

**实现思路采用模块化的设计架构：**

- 核心模块：处理基础的WebRTC功能
- 状态管理：集成MobX状态管理
- 设备控制：管理媒体设备
- 事件系统：处理各类通信事件
- 错误处理：统一的错误处理机制
```ts
export class AgoraRtc {
  public client!: IAgoraRTCClient;
  public AgoraRTC!: IAgoraRTC;
  private stateManager: CallStateManager;
  private reconnectionManager: ReconnectionManager;
  private deviceHealthCheck: DeviceHealthCheck;
  private timeoutManager: CallTimeoutManager;
  private localUser: LocalUser;
  private remoteUser: RemoteUser;

  constructor() {
    this.stateManager = new CallStateManager();
    this.reconnectionManager = new ReconnectionManager(this.stateManager);
    this.deviceHealthCheck = new DeviceHealthCheck(this.stateManager);
    this.timeoutManager = new CallTimeoutManager(this.stateManager);
    
    this.localUser = this.initializeLocalUser();
    this.remoteUser = this.initializeRemoteUser();
    
    makeAutoObservable(this);
  }

  private initializeLocalUser(): LocalUser {
    return {
      localAudioTrack: undefined,
      localVideoTrack: undefined,
      localUplinkNetworkQuality: 0,
      enabledVideoTrack: true,
      enabledAudioTrack: true
    };
  }

  private initializeRemoteUser(): RemoteUser {
    return {
      remoteUsersState: false,
      remoteUsersVolume: false,
      remoteUsersVideoEnabled: false,
      remoteUsersAudioEnabled: true,
      remoteUsers: [],
      remoteUplinkNetworkQuality: 0,
      name: "",
      avatar: ""
    };
  }

  public async init() {
    this.client = this.AgoraRTC.createClient({
      codec: "vp8",
      mode: "rtc"
    });

    this.initializeEventListeners();
    await this.deviceHealthCheck.checkDevices();
  }

  private initializeEventListeners() {
    this.client.on("connection-state-change", this.handleConnectionStateChange);
    this.client.on("user-published", this.handleUserPublished);
    this.client.on("user-unpublished", this.handleUserUnpublished);
    this.client.on("user-joined", this.handleUserJoined);
    this.client.on("user-left", this.handleUserLeft);
  }

  private handleConnectionStateChange = (curState: string, prevState: string) => {
    if (curState === "DISCONNECTED") {
      this.reconnectionManager.handleDisconnection(this.client, this.currentChannelParams);
    }
  }

  public async join(appid: string, channel: string, token: string, uid?: UID): Promise<UID | boolean> {
    const healthStatus = await this.deviceHealthCheck.checkDevices();
    if (!this.isHealthStatusOK(healthStatus)) {
      throw new Error('Device health check failed');
    }

    this.timeoutManager.startCallTimeout(() => this.leave());

    try {
      const clientUid = await this.client.join(appid, channel, token, uid);
      await this.createLocalTracks();
      this.timeoutManager.clearTimeout();
      this.stateManager.updateCallStatus(CallingStatus.IN_CALL);
      return clientUid;
    } catch (error) {
      this.timeoutManager.clearTimeout();
      this.stateManager.updateCallStatus(CallingStatus.FAILED);
      throw error;
    }
  }

  private async createLocalTracks() {
    const [audioTrack, videoTrack] = await Promise.all([
      this.AgoraRTC.createMicrophoneAudioTrack(),
      this.AgoraRTC.createCameraVideoTrack()
    ]);

    this.localUser.localAudioTrack = audioTrack;
    this.localUser.localVideoTrack = videoTrack;

    await this.client.publish([audioTrack, videoTrack]);
  }

  public async leave() {
    this.timeoutManager.clearTimeout();
    this.reconnectionManager.clearReconnection();
    
    if (this.localUser.localAudioTrack) {
      this.localUser.localAudioTrack.stop();
      this.localUser.localAudioTrack.close();
    }
    
    if (this.localUser.localVideoTrack) {
      this.localUser.localVideoTrack.stop();
      this.localUser.localVideoTrack.close();
    }

    await this.client.leave();
    this.stateManager.updateCallStatus(CallingStatus.NULL);
    this.resetState();
  }

  private resetState() {
    this.localUser = this.initializeLocalUser();
    this.remoteUser = this.initializeRemoteUser();
  }

  // 其他方法实现...
}

```


## AI智能客服
### 架构设计图
![alt text](./img/AI智能客服架构.png)
```mermaid
graph TD
    subgraph "低代码配置平台"
        A[技能编排引擎] --> B[话术模板管理]
        A --> C[知识库管理]
        B --> D[规则引擎]
        C --> D
        D --> E[配置中心]
    end

    subgraph "客户端渲染层"
        F[消息协议层] --> G[SSE流式渲染]
        F --> H[轮询调度器]
        G --> I[响应生成器]
        H --> I
    end

    E --> F
```

 **低代码配置平台**

1. 技能编排引擎

- AI能力编排
- 流程设计
- 参数配置
- 版本管理

2. 话术模板管理

- 模板设计
- 条件配置
- 变量管理
- A/B测试

3. 知识库管理

- 文档管理
- 向量存储
- 检索配置
- 自动更新

4. 规则引擎

- 业务规则配置
- 决策树管理
- 触发条件设置
- 动作定义

 **客户端渲染层**

1. 消息协议层

- 消息格式化
- 类型处理
- 状态追踪

2. SSE流式渲染

- 实时推送
- 断线重连
- 渲染优化

3. 轮询调度器

- 请求管理
- 重试策略
- 资源控制

### 1. 消息类型 MessageProtocol.ts

- 支持多种消息类型
- 确保消息格式统一
- 提供类型安全
- 支持消息状态追踪
```ts
// types/messages.ts

/**
 * 消息状态枚举
 */
export enum MessageStatus {
  PENDING = 'pending',   // 等待发送
  SENDING = 'sending',   // 发送中
  SENT = 'sent',        // 已发送
  FAILED = 'failed',    // 发送失败
  RECEIVED = 'received' // 已接收
}

/**
 * AI消息类型枚举
 */
export enum AIMessageType {
  CHAT = 'chat',      // 闲聊消息
  DOC = 'doc',        // 文档解析
  SUMMARY = 'summary' // 会话总结
}

/**
 * 基础消息接口
 */
export interface BaseAIMessage {
  id: string;         // 消息唯一ID
  type: AIMessageType;// 消息类型
  timestamp: number;  // 时间戳
  status: MessageStatus; // 消息状态
  sessionId: string;  // 会话ID
  userId: string;     // 用户ID
}

/**
 * 闲聊消息
 */
export interface ChatAIMessage extends BaseAIMessage {
  type: AIMessageType.CHAT;
  content: string;    // 聊天内容
  emotion?: string;   // 情感标签
  intent?: string;    // 意图标签
  context?: Record<string, any>; // 上下文信息
}

/**
 * 文档解析消息
 */
export interface DocAIMessage extends BaseAIMessage {
  type: AIMessageType.DOC;
  content: string;    // 解析内容
  docType: string;    // 文档类型
  docUrl: string;     // 文档链接
  confidence: number; // 解析置信度
  metadata?: Record<string, any>; // 文档元数据
}

/**
 * 会话总结消息
 */
export interface SummaryAIMessage extends BaseAIMessage {
  type: AIMessageType.SUMMARY;
  content: string;    // 总结内容
  keywords: string[]; // 关键词
  sentiment: string;  // 整体情感
  topics: string[];   // 主题列表
  duration: number;   // 会话时长
}

/**
 * 消息工厂类
 */
export class MessageFactory {
  /**
   * 创建闲聊消息
   */
  static createChatMessage(params: Omit<ChatAIMessage, 'id' | 'timestamp' | 'status'>): ChatAIMessage {
    return {
      id: this.generateId(),
      timestamp: Date.now(),
      status: MessageStatus.PENDING,
      ...params,
    };
  }

  /**
   * 创建文档解析消息
   */
  static createDocMessage(params: Omit<DocAIMessage, 'id' | 'timestamp' | 'status'>): DocAIMessage {
    return {
      id: this.generateId(),
      timestamp: Date.now(),
      status: MessageStatus.PENDING,
      ...params,
    };
  }

  /**
   * 创建会话总结消息
   */
  static createSummaryMessage(params: Omit<SummaryAIMessage, 'id' | 'timestamp' | 'status'>): SummaryAIMessage {
    return {
      id: this.generateId(),
      timestamp: Date.now(),
      status: MessageStatus.PENDING,
      ...params,
    };
  }

  private static generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

```

使用实例：
```ts
// 创建消息实例
const chatMessage = MessageFactory.createChatMessage({
  type: AIMessageType.CHAT,
  content: "你好，请问有什么可以帮您？",
  emotion: "neutral",
  intent: "greeting",
  sessionId: "session_123",
  userId: "user_456"
});

// 创建文档解析消息
const docMessage = MessageFactory.createDocMessage({
  type: AIMessageType.DOC,
  content: "根据文档分析...",
  docType: "pdf",
  docUrl: "https://example.com/doc.pdf",
  confidence: 0.95,
  sessionId: "session_123",
  userId: "user_456"
});
```

### 2. SSE流式渲染系统

目标：

- 实现实时消息推送
- 支持逐字渲染
- 处理连接异常
- 管理消息缓存

```ts
// services/SSEMessageManager.ts

/**
 * SSE连接状态
 */
export enum SSEConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

/**
 * SSE配置接口
 */
export interface SSEConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onStatusChange?: (status: SSEConnectionStatus) => void;
}

/**
 * SSE消息管理器
 */
export class SSEMessageManager {
  private eventSource?: EventSource;
  private messageBuffer: string = '';
  private status: SSEConnectionStatus = SSEConnectionStatus.DISCONNECTED;
  private reconnectCount: number = 0;
  private readonly config: Required<SSEConfig>;

  constructor(config: SSEConfig) {
    this.config = {
      reconnectAttempts: 3,
      reconnectInterval: 1000,
      onStatusChange: () => {},
      ...config
    };
    this.initEventSource();
  }

  /**
   * 初始化SSE连接
   */
  private initEventSource() {
    this.updateStatus(SSEConnectionStatus.CONNECTING);
    
    this.eventSource = new EventSource(this.config.url);
    this.eventSource.onopen = this.handleOpen;
    this.eventSource.onmessage = this.handleMessage;
    this.eventSource.onerror = this.handleError;
  }

  /**
   * 处理连接建立
   */
  private handleOpen = () => {
    this.updateStatus(SSEConnectionStatus.CONNECTED);
    this.reconnectCount = 0;
  }

  /**
   * 处理收到的消息
   */
  private handleMessage = (event: MessageEvent) => {
    this.messageBuffer += event.data;
    this.renderMessage();
  }

  /**
   * 处理错误
   */
  private handleError = (error: Event) => {
    this.updateStatus(SSEConnectionStatus.ERROR);
    
    if (this.reconnectCount < this.config.reconnectAttempts) {
      setTimeout(() => {
        this.reconnectCount++;
        this.initEventSource();
      }, this.config.reconnectInterval);
    }
  }

  /**
   * 逐字渲染消息
   */
  private renderMessage() {
    // 实现逐字渲染逻辑，可以使用requestAnimationFrame优化
    const chars = this.messageBuffer.split('');
    let index = 0;

    const render = () => {
      if (index < chars.length) {
        // 输出单个字符
        console.log(chars[index]);
        index++;
        requestAnimationFrame(render);
      }
    };

    requestAnimationFrame(render);
  }

  /**
   * 更新连接状态
   */
  private updateStatus(status: SSEConnectionStatus) {
    this.status = status;
    this.config.onStatusChange(status);
  }

  /**
   * 关闭连接
   */
  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.updateStatus(SSEConnectionStatus.DISCONNECTED);
    }
  }

  /**
   * 获取当前状态
   */
  getStatus(): SSEConnectionStatus {
    return this.status;
  }

  /**
   * 清除消息缓冲
   */
  clearBuffer() {
    this.messageBuffer = '';
  }
}

// React Hook封装
export function useSSE(config: SSEConfig) {
  const [status, setStatus] = useState<SSEConnectionStatus>(SSEConnectionStatus.DISCONNECTED);
  const sseRef = useRef<SSEMessageManager>();

  useEffect(() => {
    sseRef.current = new SSEMessageManager({
      ...config,
      onStatusChange: setStatus
    });

    return () => {
      sseRef.current?.close();
    };
  }, [config.url]);

  return { status, messageManager: sseRef.current };
}

```


使用实例：
```ts
// 在React组件中使用
function ChatComponent() {
  const { status, messageManager } = useSSE({
    url: 'https://api.example.com/chat/stream',
  });

  useEffect(() => {
    console.log('SSE连接状态:', status);
  }, [status]);

  return (
    <div>
      <div>连接状态: {status}</div>
      {/* 其他UI组件 */}
    </div>
  );
}
```

### 3. 轮询调度器

**目标**
- 实现智能轮询机制
- 支持[指数退避](/algorithm/退避算法.md)
- 控制请求频率
- 处理异常情况

```ts
// hooks/usePolling.ts

/**
 * 轮询配置接口
 */
export interface PollingConfig {
  initialInterval: number;     // 初始轮询间隔
  maxInterval: number;        // 最大轮询间隔
  backoffMultiplier: number;  // 退避系数
  maxAttempts: number;        // 最大尝试次数
  timeout?: number;           // 请求超时时间
  immediate?: boolean;        // 是否立即执行
  retryOnError?: boolean;     // 错误时是否重试
  resetAttemptsOnSuccess?: boolean; // 成功时是否重置重试次数
  onSuccess?: (data: any) => void;  // 成功回调
  onError?: (error: Error) => void; // 错误回调
  onTimeout?: () => void;     // 超时回调
}

/**
 * 轮询状态
 */
export interface PollingStatus {
  isPolling: boolean;
  attempts: number;
  currentInterval: number;
  lastExecuteTime?: number;
  lastSuccessTime?: number;
  error?: Error;
  data?: any;
}

/**
 * 轮询Hook
 */
export function usePolling(
  callback: () => Promise<any>,
  config: PollingConfig
) {
  const [status, setStatus] = useState<PollingStatus>({
    isPolling: false,
    attempts: 0,
    currentInterval: config.initialInterval
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const mountedRef = useRef(true);
  const executingRef = useRef(false);

  // 清理函数
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
  }, []);

  // 计算下一次轮询间隔
  const getNextInterval = useCallback(() => {
    const baseInterval = Math.min(
      config.initialInterval * Math.pow(config.backoffMultiplier, status.attempts),
      config.maxInterval
    );
    // 添加随机抖动
    const jitter = baseInterval * 0.1;
    return baseInterval + (Math.random() * jitter * 2 - jitter);
  }, [config.initialInterval, config.backoffMultiplier, config.maxInterval, status.attempts]);

  // 执行带超时的请求
  const executeWithTimeout = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    
    const timeoutPromise = config.timeout
      ? new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Request timeout'));
            config.onTimeout?.();
          }, config.timeout);
        })
      : null;

    try {
      const result = await Promise.race([
        callback(),
        timeoutPromise
      ].filter(Boolean));

      return result;
    } finally {
      abortControllerRef.current = undefined;
    }
  }, [callback, config]);

  // 执行轮询
  const poll = useCallback(async () => {
    if (!mountedRef.current || status.attempts >= config.maxAttempts || executingRef.current) {
      return;
    }

    executingRef.current = true;

    try {
      const result = await executeWithTimeout();
      
      if (mountedRef.current) {
        setStatus(prev => ({
          isPolling: true,
          attempts: config.resetAttemptsOnSuccess ? 0 : prev.attempts,
          currentInterval: config.initialInterval,
          lastSuccessTime: Date.now(),
          lastExecuteTime: Date.now(),
          data: result,
          error: undefined
        }));

        config.onSuccess?.(result);

        // 安排下一次轮询
        timeoutRef.current = setTimeout(poll, config.initialInterval);
      }
    } catch (error) {
      if (mountedRef.current) {
        const newAttempts = status.attempts + 1;
        const shouldContinue = config.retryOnError && newAttempts < config.maxAttempts;

        setStatus(prev => ({
          ...prev,
          isPolling: shouldContinue,
          attempts: newAttempts,
          currentInterval: shouldContinue ? getNextInterval() : 0,
          lastExecuteTime: Date.now(),
          error: error as Error
        }));

        config.onError?.(error as Error);

        if (shouldContinue) {
          timeoutRef.current = setTimeout(poll, getNextInterval());
        }
      }
    } finally {
      executingRef.current = false;
    }
  }, [callback, config, status.attempts, getNextInterval, executeWithTimeout]);

  // 开始轮询
  const start = useCallback(() => {
    cleanup();
    setStatus({
      isPolling: true,
      attempts: 0,
      currentInterval: config.initialInterval
    });
    poll();
  }, [poll, config.initialInterval, cleanup]);

  // 停止轮询
  const stop = useCallback(() => {
    cleanup();
    setStatus(prev => ({
      ...prev,
      isPolling: false
    }));
  }, [cleanup]);

  // 重置状态
  const reset = useCallback(() => {
    cleanup();
    setStatus({
      isPolling: false,
      attempts: 0,
      currentInterval: config.initialInterval
    });
  }, [cleanup, config.initialInterval]);

  // 组件挂载时自动开始轮询（如果配置了immediate）
  useEffect(() => {
    mountedRef.current = true;
    if (config.immediate) {
      start();
    }
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [config.immediate, start, cleanup]);

  return {
    status,
    start,
    stop,
    reset,
    isPolling: status.isPolling
  };
}


```

**使用实例：**

```ts
// 示例1：基础使用
function DataFetchComponent() {
  const { status, start, stop } = usePolling(
    async () => {
      const response = await fetch('https://api.example.com/data');
      return response.json();
    },
    {
      initialInterval: 1000,    // 初始间隔1秒
      maxInterval: 30000,       // 最大间隔30秒
      backoffMultiplier: 2,     // 退避系数2
      maxAttempts: 5,          // 最大重试5次
      immediate: true,          // 立即开始
      timeout: 5000,           // 5秒超时
      retryOnError: true,      // 错误时重试
      resetAttemptsOnSuccess: true, // 成功时重置重试次数
      onSuccess: (data) => console.log('数据获取成功:', data),
      onError: (error) => console.error('发生错误:', error),
      onTimeout: () => console.warn('请求超时')
    }
  );

  return (
    <div>
      <div>状态: {status.isPolling ? '轮询中' : '已停止'}</div>
      <div>重试次数: {status.attempts}</div>
      <div>当前间隔: {status.currentInterval}ms</div>
      {status.error && <div>错误: {status.error.message}</div>}
      <button onClick={start}>开始轮询</button>
      <button onClick={stop}>停止轮询</button>
    </div>
  );
}

// 示例2：与其他状态管理结合
function UserStatusComponent() {
  const [userData, setUserData] = useState(null);
  
  const { status, start, stop } = usePolling(
    async () => {
      const response = await fetch('/api/user/status');
      const data = await response.json();
      setUserData(data);
      
      // 如果用户状态为"完成"，则停止轮询
      if (data.status === 'completed') {
        stop();
      }
      
      return data;
    },
    {
      initialInterval: 2000,
      maxInterval: 10000,
      backoffMultiplier: 1.5,
      maxAttempts: 10,
      immediate: true
    }
  );

  return (
    <div>
      <div>用户状态: {userData?.status}</div>
      <div>轮询状态: {status.isPolling ? '活跃' : '停止'}</div>
    </div>
  );
}

// 示例3：条件轮询
function ConditionalPollingComponent() {
  const [shouldPoll, setShouldPoll] = useState(false);
  
  const { status, start, stop } = usePolling(
    async () => {
      if (!shouldPoll) {
        stop();
        return;
      }
      // 执行轮询逻辑
    },
    {
      initialInterval: 1000,
      maxInterval: 5000,
      backoffMultiplier: 2,
      maxAttempts: 3
    }
  );

  useEffect(() => {
    if (shouldPoll) {
      start();
    } else {
      stop();
    }
  }, [shouldPoll]);

  return (
    <div>
      <button onClick={() => setShouldPoll(!shouldPoll)}>
        {shouldPoll ? '停止轮询' : '开始轮询'}
      </button>
    </div>
  );
}

```