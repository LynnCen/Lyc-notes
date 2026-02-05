# DevOps与可观测性技术详解

---

## 一、CI/CD（持续集成/持续部署）

### 1.1 定义
自动化构建、测试、部署流程，频繁将代码集成到主干并快速发布到生产环境的实践。

### 1.2 解决的问题
- 手动发布慢且易错
- 集成冲突发现晚
- 反馈周期长

### 1.3 CI/CD流水线

```
代码提交
    ↓
代码质量检查（Lint）
    ↓
单元测试
    ↓
构建（Build）
    ↓
集成测试
    ↓
安全扫描（SAST/DAST）
    ↓
镜像构建 & 推送
    ↓
部署到预发环境
    ↓
E2E测试
    ↓
灰度发布
    ↓
全量发布
```

### 1.4 常用工具

| 类别 | 工具 |
|------|------|
| CI平台 | Jenkins, GitLab CI, GitHub Actions |
| 代码质量 | ESLint, SonarQube |
| 容器 | Docker, Podman |
| 编排 | Kubernetes, ArgoCD |
| 镜像仓库 | Harbor, Docker Hub |

---

## 二、容器化与编排

### 2.1 Kubernetes（K8s）

#### 定义
开源的容器编排平台，自动化部署、扩展和管理容器化应用。

#### 核心概念

| 概念 | 说明 |
|------|------|
| Pod | 最小部署单元，包含一个或多个容器 |
| Service | 服务发现和负载均衡 |
| Deployment | 声明式应用部署 |
| ConfigMap | 配置管理 |
| Secret | 敏感信息管理 |
| Ingress | 外部访问入口 |

#### 弹性伸缩（HPA）

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-service
  minReplicas: 10
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 2.2 PodDisruptionBudget（PDB）

#### 定义
确保在自愿中断期间（如滚动更新、节点维护）保持一定数量的Pod可用。

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ai-service-pdb
spec:
  minAvailable: 2  # 至少保持2个Pod可用
  selector:
    matchLabels:
      app: ai-service
```

---

## 三、发布策略

### 3.1 灰度发布/金丝雀发布（Canary Deployment）

#### 定义
将新版本先发布到小部分用户（如5%），观察无问题后逐步扩大范围的发布策略。

#### 流程
```
新版本上线
    ↓
路由1%流量到新版本
    ↓
监控错误率、延迟等指标
    ↓
指标正常 → 扩大到10%
    ↓
继续观察 → 扩大到50%
    ↓
全量发布100%
```

#### 异常处理
一旦发现问题，一键回滚到旧版本。

### 3.2 蓝绿部署（Blue-Green Deployment）

#### 定义
维护两套完全相同的生产环境（蓝/绿），部署新版本到绿环境，切流量到绿环境，蓝环境作为回退。

```
当前生产（蓝环境）←── 100%流量
    │
    │ 部署新版本到绿环境
    ↓
绿环境就绪
    │
    │ 流量切换
    ↓
绿环境 ←── 100%流量
蓝环境（保留，用于回滚）
```

#### 优势
- 瞬间切换
- 回滚只需切回流量
- MTTR降至2分钟

---

## 四、可观测性三大支柱

### 4.1 日志（Logs）

#### 结构化日志示例
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "template-service",
  "trace_id": "abc123",
  "span_id": "def456",
  "user_id": "user_789",
  "action": "template_download",
  "template_id": "tpl_001",
  "duration_ms": 150,
  "status": "success"
}
```

#### 工具
- ELK Stack（Elasticsearch + Logstash + Kibana）
- Grafana Loki

### 4.2 指标（Metrics）

#### RED方法（面向服务）
| 指标 | 说明 |
|------|------|
| Rate | 每秒请求数（QPS） |
| Error | 错误率 |
| Duration | 响应时间 |

#### USE方法（面向资源）
| 指标 | 说明 |
|------|------|
| Utilization | 资源使用率 |
| Saturation | 饱和度（排队等待） |
| Error | 错误数 |

#### 工具
- Prometheus + Alertmanager
- Grafana
- InfluxDB

### 4.3 追踪（Tracing）

#### 定义
分布式链路追踪，追踪请求在多个服务间的调用路径。

#### 核心概念
| 概念 | 说明 |
|------|------|
| Trace | 一次完整的请求链路 |
| Span | 链路中的一个操作单元 |
| Trace ID | 唯一标识一次追踪 |
| Span ID | 唯一标识一个操作 |

#### 工具
- Jaeger
- Zipkin
- SkyWalking

### 4.4 OpenTelemetry

#### 定义
CNCF开源的可观测性框架，统一收集Trace、Metrics、Logs的标准。

#### 架构
```
应用（SDK埋点）
    ↓
OTel Collector
    ↓
┌─────────────────────────────┐
│ Jaeger │ Prometheus │ Loki │
└─────────────────────────────┘
    ↓
Grafana Dashboard
```

---

## 五、测试策略

### 5.1 测试金字塔（Test Pyramid）

```
        /\
       /  \  E2E测试（10%）
      /────\
     /      \  集成测试（20%）
    /────────\
   /          \  单元测试（70%）
  /────────────\
```

| 层级 | 说明 | 工具 |
|------|------|------|
| 单元测试 | 测试单个函数/方法 | Jest, JUnit |
| 集成测试 | 测试服务间交互 | Testcontainers |
| 契约测试 | 验证API契约 | Pact |
| E2E测试 | 端到端用户流程 | Playwright, Cypress |

### 5.2 性能压测

#### 定义
模拟大量并发用户或请求，测试系统在高负载下的性能表现和瓶颈。

#### 工具
- k6
- JMeter
- Locust

#### 关键指标
| 指标 | 说明 |
|------|------|
| QPS | 每秒查询数 |
| P95/P99 | 95%/99%分位延迟 |
| 错误率 | 请求失败比例 |
| 资源使用 | CPU/内存/网络 |

---

## 六、混沌工程（Chaos Engineering）

### 6.1 定义
主动在生产环境注入故障（如杀进程、网络延迟），验证系统韧性的实践。

### 6.2 常见实验

| 实验类型 | 说明 |
|------|------|
| 进程故障 | 随机杀死服务实例 |
| 网络延迟 | 增加服务间调用延迟 |
| 网络丢包 | 模拟网络不稳定 |
| CPU压力 | 模拟CPU资源紧张 |
| 依赖不可用 | 模拟下游服务故障 |

### 6.3 工具
- Chaos Monkey（Netflix）
- Chaos Mesh（K8s）
- LitmusChaos

---

## 七、安全DevOps（DevSecOps）

### 7.1 供应链安全

#### SBOM（Software Bill of Materials）
列出软件中所有依赖组件及其版本的清单。

```json
{
  "components": [
    {
      "name": "lodash",
      "version": "4.17.21",
      "type": "npm",
      "license": "MIT"
    }
  ]
}
```

#### 镜像扫描
自动检测Docker镜像中的安全漏洞、恶意代码、配置错误。

工具：Trivy, Clair

### 7.2 安全测试

| 类型 | 说明 |
|------|------|
| SAST | 静态代码分析 |
| DAST | 动态应用安全测试 |
| IAST | 交互式应用安全测试 |
| SCA | 软件成分分析 |

### 7.3 镜像签名（Cosign）

确保只有经过签名验证的镜像才能部署到生产环境。

```bash
# 签名镜像
cosign sign --key cosign.key myregistry/myimage:v1

# 验证签名
cosign verify --key cosign.pub myregistry/myimage:v1
```

---

## 八、关键性能指标

### 8.1 性能指标

| 指标 | 定义 | 目标值 |
|------|------|--------|
| TTFB | 首字节时间 | ≤200ms |
| P95延迟 | 95%请求响应时间 | ≤150ms |
| P99延迟 | 99%请求响应时间 | ≤300ms |
| QPS | 每秒查询数 | 根据业务定 |

### 8.2 可用性指标

| 指标 | 定义 | 目标值 |
|------|------|--------|
| SLA | 服务等级协议 | ≥99.95% |
| SLO | 服务等级目标 | 内部细化目标 |
| MTTR | 平均恢复时间 | ≤5分钟 |
| MTBF | 平均故障间隔 | 越长越好 |

### 8.3 可用性换算

| 可用性 | 年停机时间 |
|--------|-----------|
| 99.9% | 8.76小时 |
| 99.95% | 4.38小时 |
| 99.99% | 52.56分钟 |
| 99.999% | 5.26分钟 |
