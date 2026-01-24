# SAM主体选择深度解析

> **文档说明：** 本文档详细解析基于SAM（Segment Anything Model）的主体选择功能实现原理，涵盖从API调用、数据处理、用户交互到视觉渲染的完整技术链路。

## 📚 目录

1. [什么是SAM主体选择](#一什么是sam主体选择)
2. [完整工作流程](#二完整工作流程)
3. [技术架构与职责划分](#三技术架构与职责划分)
4. [核心实现原理](#四核心实现原理)
5. [高亮效果的深度实现](#五高亮效果的深度实现)
6. [性能优化与最佳实践](#六性能优化与最佳实践)

---

## 一、什么是SAM主体选择？

### 1.1 功能概述

SAM主体选择是基于Meta的Segment Anything Model（SAM）实现的智能选区功能。该功能通过AI模型预先分析图像，生成多个候选分割区域（mask），用户通过鼠标交互快速选择目标区域。

**核心特性：**

- **预计算分割**：后端SAM模型预先生成所有候选mask，前端无需实时推理
- **交互式选择**：鼠标悬停实时高亮预览，点击确认选中
- **多选支持**：支持连续点击多个区域进行加选或减选
- **高性能渲染**：采用Canvas内阴影技术实现流畅的高亮效果

### 1.2 技术架构

**后端职责：**

- SAM模型推理：接收图像URL，返回多个候选mask的RLE压缩数据
- 数据格式：每个mask包含segmentation（RLE编码）、bbox（边界框）、area（面积）等元信息

**前端职责：**

- API调用与缓存：管理mask数据的获取与缓存
- 数据解码：将RLE数据解码为Canvas图像
- 交互处理：坐标转换、layer查找、状态管理
- 视觉渲染：高亮边框、蒙版合并、颜色填充

**关键设计：** 采用预计算+查找模式，而非实时推理，确保交互流畅性。

### 1.3 在项目中的角色

在AI改图功能中，主体选择是三个选区工具之一：

- **主体选择（本文）**：AI辅助，点击即选，适合快速选中规则物体
- **套索工具**：手动绘制路径，适合自由形状
- **画笔工具**：手绘蒙版，适合精细控制

三者配合使用，满足不同场景需求。

---

## 二、完整工作流程

### 2.1 宏观流程图

```
┌─────────────────────────────────────────────────────────┐
│  阶段一：初始化（只执行一次）                              │
├─────────────────────────────────────────────────────────┤
│  1. 用户选择"主体选择"工具                               │
│  2. 系统获取当前图片URL                                  │
│  3. 检查本地缓存（jsonMap）                              │
│     ├─ 命中缓存：直接使用                                │
│     └─ 未命中：调用后端API                               │
│  4. 后端返回多个候选mask（SAM预测结果）                  │
│  5. 创建AutoMaskModel实例（管理所有mask）                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  阶段二：交互处理（频繁触发）                             │
├─────────────────────────────────────────────────────────┤
│  6. 用户鼠标hover到图片某位置                            │
│  7. 屏幕坐标转换为图像坐标                               │
│  8. 调用pickLayer(x, y)查找对应的mask                   │
│  9. 在selectionCanvas上绘制高亮边框                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  阶段三：确认选择（点击时）                               │
├─────────────────────────────────────────────────────────┤
│  10. 用户点击确认                                        │
│  11. 调用toggleLayerMode(x, y)切换选中状态              │
│  12. 合并所有选中的mask（getMaskResult）                │
│  13. 更新maskCanvas，显示最终蒙版                       │
└─────────────────────────────────────────────────────────┘
```

### 2.2 流程细节解析

#### 阶段一：初始化（智能缓存机制）

**步骤1-2：触发时机**

```typescript
// 当用户点击工具栏的"主体选择"按钮时
// use-auto-masks.ts
const enabled = computed(() => {
  return currentType.value === 'autoMask';
});
```

**步骤3：缓存检查**

系统使用一个全局的`jsonMap`来缓存已请求过的图片的mask数据：

```typescript
// 简化逻辑
const jsonMap = new Map<string, IAutoMask[]>();

if (jsonMap.get(imageUrl)) {
  // 直接使用缓存，无需请求后端
  const cachedMasks = jsonMap.get(imageUrl);
} else {
  // 调用后端API获取
  const masks = await fetchAutoMasks(imageUrl);
  jsonMap.set(imageUrl, masks);
}
```

**为什么需要缓存？**

- 后端SAM推理耗时（通常1-3秒）
- 用户可能切换工具后再切回来
- 避免重复请求，提升用户体验

**步骤4：后端返回的数据结构**

后端API返回的是一个mask数组，每个mask代表一个可选区域：

```typescript
interface IAutoMask {
  id: string; // 唯一标识
  segmentation: {
    counts: number[]; // RLE压缩的像素数据
    size: [width, height]; // 尺寸
  };
  bbox: [x, y, width, height]; // 边界框
  area: number; // 面积
  predicted_iou: number; // 预测的质量分数
}
```

**RLE（Run-Length Encoding）压缩说明：**

RLE是一种简单高效的压缩算法，特别适合mask这种大量连续相同值的数据：

```
原始数据（1代表选中，0代表未选中）：
0 0 0 1 1 1 1 0 0 1 1 0 0 0

RLE压缩后：
[3, 4, 2, 2, 3]  // 3个0，4个1，2个0，2个1，3个0
```

压缩率通常可达80-90%，大大减少网络传输量。

**步骤5：创建AutoMaskModel**

`AutoMaskModel`是`@lego/sam`库提供的核心类，它的作用是：

- 将RLE压缩的mask数据解码为Canvas图像
- 提供`pickLayer(x, y)`查找方法
- 管理选中状态（`toggleLayerMode`）
- 合并mask（`getMaskResult`）

```typescript
const autoMaskModel = await factory.createAutoMaskModel(imageUrl, masksData);
```

内部会为每个mask创建一个`AutoMaskLayer`对象：

```typescript
interface AutoMaskLayer {
  id: string; // 唯一ID
  maskCanvas: HTMLCanvasElement; // 解码后的mask图像
  area: number; // 面积
  bbox: [x, y, w, h]; // 边界框
  mode: null | 'source-over' | 'destination-out'; // 选中模式
}
```

#### 阶段二：交互处理（实时响应）

**步骤6-7：坐标转换的必要性**

用户的鼠标位置是**屏幕坐标**（相对于浏览器窗口），而mask数据是**图像坐标**（相对于原始图片）。必须进行转换：

```
屏幕坐标（clientX, clientY）
    ↓ 考虑canvas的位置和尺寸
Canvas坐标（offsetX, offsetY）
    ↓ 考虑canvas的缩放
图像坐标（imageX, imageY）
```

**详细转换逻辑：**

```typescript
function pointFormEvent(e: MouseEvent, imageSize: { width; height }): { x; y } {
  // 1. 获取canvas的DOM矩形
  const rect = canvas.getBoundingClientRect();

  // 2. 屏幕坐标 → Canvas坐标
  const canvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const canvasY = (e.clientY - rect.top) * (canvas.height / rect.height);

  // 3. Canvas坐标 → 图像坐标（考虑缩放、裁剪等）
  const scaleX = imageSize.width / canvas.width;
  const scaleY = imageSize.height / canvas.height;

  return {
    x: canvasX * scaleX,
    y: canvasY * scaleY,
  };
}
```

**为什么要这么复杂？**

- Canvas的显示尺寸（CSS尺寸）≠ Canvas的实际尺寸（width/height属性）
- 图片可能被缩放显示（适应屏幕）
- 可能有旋转、偏移等变换

**步骤8：pickLayer方法调用**

`pickLayer(x, y)`由`@lego/sam`库的`AutoMaskModel`提供，该方法根据图像坐标查找对应的mask layer。

**接口定义：**

```typescript
// @lego/sam 提供的接口
interface AutoMaskModel {
  pickLayer(x: number, y: number): AutoMaskLayer | null;
  toggleLayerMode(x: number, y: number): void;
  getMaskResult(): MaskResult | null;
  getSourceImage(): HTMLImageElement;
}
```

**实现说明：**

该方法的具体实现位于`@lego/sam`库内部，项目代码通过接口调用。实现逻辑包括：

- 坐标到layer的映射查找
- 支持多个layer重叠时的优先级处理
- 基于RLE数据的快速点包含判断

**调用示例：**

```typescript
// use-auto-masks.ts:127
const layer = autoMaskModel.pickLayer(x, y);
```

返回的`AutoMaskLayer`包含`maskCanvas`（该layer的mask图像）等属性，用于后续的高亮渲染。

**步骤9：高亮边框渲染**

找到layer后，在`selectionCanvas`上绘制高亮边框：

```typescript
// use-auto-masks.ts
function handleHoverMask(e: MouseEvent) {
  const layer = autoMaskModel.pickLayer(x, y);

  if (layer) {
    // 清空之前的高亮
    selectionCtx.clearRect(0, 0, width, height);

    // 绘制新的高亮边框
    addBorderToCanvas(layer.maskCanvas, selectionCanvas, {
      borderWidth: calculatedWidth,
      borderColor: '#33C8E6', // 青色
    });
  }
}
```

具体的高亮实现原理，见下文"第五部分"的详细讲解。

#### 阶段三：确认选择（状态管理）

**步骤10-11：切换选中状态**

用户点击时，调用`toggleLayerMode`切换layer的选中状态：

```typescript
// use-auto-masks.ts:151
autoMaskModel.toggleLayerMode(x, y);
```

**接口说明：**

`toggleLayerMode`由`@lego/sam`库实现，功能包括：

- 根据坐标查找对应的layer
- 切换layer的选中状态（null ↔ 'source-over'）
- 支持减选模式（'destination-out'）

**状态管理：**

layer的`mode`属性表示选中状态：

- `null`：未选中
- `'source-over'`：加选模式（叠加到结果）
- `'destination-out'`：减选模式（从结果中擦除）

**步骤12-13：合并mask并更新**

选中状态改变后，调用`getMaskResult()`获取合并后的mask结果：

```typescript
// use-auto-masks.ts:152-154
const maskResult = autoMaskModel.getMaskResult();
options.maskResultChange?.(maskResult?.getMask(AUTO_MASK_COLOR) || null, getSnapshot());
```

**接口说明：**

`getMaskResult()`由`@lego/sam`库实现，返回`MaskResult`对象，该对象提供`getMask(color)`方法生成指定颜色的mask Canvas。

**更新流程：**

1. `getMaskResult()`：合并所有选中layer的mask，返回`MaskResult`对象
2. `maskResult.getMask(AUTO_MASK_COLOR)`：生成指定颜色的mask Canvas
3. `maskResultChange`回调：将结果传递给父组件，更新`maskCanvas`

**混合模式：**

mask合并时使用Canvas的`globalCompositeOperation`：

- `'source-over'`：加选模式，新mask叠加到已有mask上
- `'destination-out'`：减选模式，从已有mask中擦除

---

## 三、技术架构与职责划分

### 3.1 核心文件结构

```
项目代码
├── use-auto-masks.ts          # 业务逻辑层（项目实现）
│   ├── 事件处理（hover、click）
│   ├── 坐标转换
│   ├── UI渲染（高亮效果）
│   ├── 缓存管理（jsonMap）
│   └── 生命周期管理
│
└── @lego/sam                   # 算法层（库提供）
    ├── AutoMaskModel           # 数据模型
    ├── AutoMaskLayer           # 单个mask
    ├── SamFactory              # 工厂类
    ├── pickLayer()             # 查找算法
    ├── toggleLayerMode()       # 状态管理
    └── getMaskResult()         # mask合并
```

### 3.2 职责划分表

| 功能模块     | lego/sam库           | 项目代码               | 说明             |
| ------------ | -------------------- | ---------------------- | ---------------- |
| **数据结构** | ✅ AutoMaskModel     | ❌                     | 管理所有mask数据 |
| **算法实现** | ✅ pickLayer(x,y)    | ❌                     | 坐标查找算法     |
| **状态管理** | ✅ toggleLayerMode() | ❌                     | 选中/取消逻辑    |
| **Mask合并** | ✅ getMaskResult()   | ❌                     | 混合模式合并     |
| **API调用**  | ❌                   | ✅ fetch + cache       | 网络请求与缓存   |
| **坐标转换** | ❌                   | ✅ pointFormEvent()    | 屏幕→图像坐标    |
| **事件绑定** | ❌                   | ✅ useEventListener    | 鼠标事件处理     |
| **高亮渲染** | ❌                   | ✅ addBorderToCanvas() | 视觉反馈         |
| **生命周期** | ❌                   | ✅ Vue hooks           | 组件管理         |

### 3.3 为什么这样划分？

**lego/sam的职责：** 提供"能力"

- 算法和数据结构（通用、可复用）
- 与具体UI框架无关
- 可以在Vue、React、原生JS中使用

**项目代码的职责：** 提供"体验"

- 业务逻辑和UI交互（定制化）
- 与Vue生态集成
- 符合项目特定需求

**这种设计的优势：**

1. **关注点分离**：算法与UI解耦
2. **可测试性**：算法层可以单独测试
3. **可维护性**：升级SAM算法不影响UI代码
4. **可复用性**：`@lego/sam`可以在其他项目中使用

---

## 四、核心实现原理

### 4.1 API调用与数据流

#### 后端API接口

```typescript
// 实际的API调用
async function fetchAutoMasks(imageUrl: string): Promise<IAutoMask[]> {
  // 1. 图片预处理（压缩到3000x3000以内）
  const processedUrl = ossUrl(imageUrl, {
    width: 3000,
    height: 3000,
    useDpr: false,
    forcePngResize: true,
    transformFormat: false,
  });

  // 2. 调用后端SAM服务
  const response = await axios.post('/api/sam/auto-masks', {
    image_url: processedUrl,
  });

  // 3. 返回mask数组
  return response.data.masks;
}
```

**为什么要压缩到3000x3000？**

- SAM模型的输入尺寸限制
- 平衡精度与性能
- 太大：推理时间长，内存占用高
- 太小：细节丢失，分割不准确

#### 数据流转图

```
用户操作 → 前端请求 → OSS图片处理 → 后端SAM推理 → RLE压缩
    ↓                                                    ↓
缓存到jsonMap ←────────────────────────────← JSON响应
    ↓
创建AutoMaskModel
    ↓
解码RLE → 生成Canvas
    ↓
用户交互（hover/click）
    ↓
更新maskCanvas
```

### 4.2 AutoMaskModel接口说明

`AutoMaskModel`由`@lego/sam`库提供，项目代码通过接口调用其方法。

#### 核心接口定义

```typescript
// @lego/sam 提供的接口（项目代码中的使用方式）
interface AutoMaskModel {
  // 获取源图像
  getSourceImage(): HTMLImageElement;

  // 根据坐标查找对应的layer
  pickLayer(x: number, y: number): AutoMaskLayer | null;

  // 切换layer的选中状态
  toggleLayerMode(x: number, y: number): void;

  // 获取合并后的mask结果
  getMaskResult(): MaskResult | null;

  // 快照相关方法
  getSimpleAutoMasks(): AutoMaskModelSnapshotItem[];
  setSimpleAutoMasks(snapshot: AutoMaskModelSnapshotItem[]): void;
  reset(): void;

  // 资源释放
  release(): void;
}
```

#### 数据结构说明

**AutoMaskLayer（由库提供）：**

```typescript
interface AutoMaskLayer {
  id: string; // 唯一标识
  maskCanvas: HTMLCanvasElement; // 该layer的mask图像（白色mask，透明背景）
  area: number; // 面积
  bbox: [x, y, width, height]; // 边界框
  mode: null | 'source-over' | 'destination-out'; // 选中状态
}
```

**MaskResult（由库提供）：**

```typescript
interface MaskResult {
  // 生成指定颜色的mask Canvas
  getMask(color: [number, number, number, number]): HTMLCanvasElement | null;
}
```

#### RLE数据格式说明

后端返回的mask数据使用RLE（Run-Length Encoding）压缩：

```typescript
interface IAutoMask {
  id: string;
  segmentation: {
    counts: number[]; // RLE压缩的像素数据
    size: [width, height]; // 尺寸
  };
  bbox: [x, y, width, height]; // 边界框
  area: number; // 面积
  predicted_iou: number; // 预测质量分数
}
```

**RLE编码原理：**

RLE将连续的相同值压缩为`[数量, 值]`的序列。对于mask数据：

- `counts`数组：`[背景像素数, 前景像素数, 背景像素数, ...]`
- 交替表示背景和前景区域
- 压缩率通常可达80-90%

**示例：**

```
原始数据（1代表选中，0代表未选中）：
0 0 0 1 1 1 1 0 0 1 1 0 0 0

RLE压缩后：
counts = [3, 4, 2, 2, 3]
含义：3个0，4个1，2个0，2个1，3个0
```

**解码处理：**

RLE解码由`@lego/sam`库内部处理，将压缩数据转换为Canvas图像。项目代码直接使用解码后的`maskCanvas`。

### 4.3 坐标转换的数学原理

#### 多重坐标系统

在Canvas应用中，通常涉及三个坐标系统：

```
1. 屏幕坐标（Screen Coordinate）
   - 相对于浏览器窗口左上角
   - 单位：物理像素
   - 来源：MouseEvent.clientX/clientY

2. Canvas坐标（Canvas Coordinate）
   - 相对于canvas元素左上角
   - 单位：canvas逻辑像素
   - 考虑了canvas的CSS缩放

3. 图像坐标（Image Coordinate）
   - 相对于原始图片左上角
   - 单位：图片像素
   - SAM mask数据使用的坐标系
```

#### 转换公式推导

**第一步：屏幕坐标 → Canvas坐标**

```typescript
// canvas的DOM位置和尺寸
const rect = canvas.getBoundingClientRect();

// canvas的实际尺寸（width/height属性）
const actualWidth = canvas.width;
const actualHeight = canvas.height;

// 缩放比例
const scaleX = actualWidth / rect.width;
const scaleY = actualHeight / rect.height;

// 转换公式
const canvasX = (screenX - rect.left) * scaleX;
const canvasY = (screenY - rect.top) * scaleY;
```

**为什么需要缩放？**

Canvas的CSS尺寸和实际尺寸可能不一致：

- CSS尺寸：500px × 400px（显示大小）
- 实际尺寸：1000px × 800px（绘制缓冲区）
- 缩放比例：2倍

如果不考虑缩放，点击位置会偏移一倍！

**第二步：Canvas坐标 → 图像坐标**

这一步需要考虑图片的显示方式（contain、cover等）：

```typescript
function canvasToImageCoordinate(
  canvasPoint: { x; y },
  canvasSize: { width; height },
  imageSize: { width; height },
  fitMode: 'contain' | 'cover',
): { x; y } {
  // 计算图片在canvas中的实际显示区域
  const imageDisplayRect = calculateDisplayRect(canvasSize, imageSize, fitMode);

  // 转换公式
  const imageX = (canvasPoint.x - imageDisplayRect.x) * (imageSize.width / imageDisplayRect.width);
  const imageY =
    (canvasPoint.y - imageDisplayRect.y) * (imageSize.height / imageDisplayRect.height);

  return { x: imageX, y: imageY };
}
```

**contain模式示例：**

```
Canvas尺寸：800 × 600
图片尺寸：1000 × 500

contain模式下，图片按比例缩放到800 × 400，居中显示：
- 显示区域：x=0, y=100, width=800, height=400
- 点击位置（canvas坐标）：400, 300
- 转换为图像坐标：500, 250
```

### 4.4 性能优化的关键技术

#### 1. 缓存策略

**三级缓存架构：**

```typescript
// 一级缓存：API响应缓存
const jsonMap = new Map<string, IAutoMask[]>();

// 二级缓存：AutoMaskModel实例缓存
let autoMaskModel: AutoMaskModel | null = null;

// 三级缓存：高亮Canvas缓存（避免重复生成）
const highlightCache = new Map<string, HTMLCanvasElement>();
```

**缓存失效策略：**

- 图片URL改变：清空所有缓存
- 切换工具：保留一级缓存，清空二三级
- 内存压力：使用LRU策略淘汰旧数据

#### 2. 事件节流

```typescript
// 高频事件（hover）使用节流
const handleHoverMask = throttle((e: MouseEvent) => {
  // ... 高亮逻辑
}, 16); // 约60fps
```

**为什么是16ms？**

- 1000ms / 60fps ≈ 16.67ms
- 保证流畅的视觉体验
- 避免过度消耗CPU

#### 3. 离屏Canvas技术

```typescript
// 高亮效果在临时canvas上生成，避免污染主canvas
const tempCanvas = createOffscreenCanvas(width, height);
renderHighlight(tempCanvas);

// 一次性绘制到selectionCanvas
selectionCtx.drawImage(tempCanvas, 0, 0);
```

**优势：**

- 避免多次操作主canvas导致的重绘
- 支持复杂的多步骤渲染
- 便于调试和测试

#### 4. 惰性初始化

```typescript
// 只在真正需要时才初始化SAM Factory
let _factory: SamFactory | null = null;

const getFactory = async () => {
    if (_factory) return _factory;

    // 第一次调用时才加载（可能几MB的WASM文件）
    const { SamFactory } = await import('@lego/sam');
    _factory = SamFactory.getInstance({...});

    return _factory;
};
```

**为什么要惰性？**

- `@lego/sam`包含大型WASM文件（2-5MB）
- 不是所有用户都会使用主体选择工具
- 按需加载，优化首屏性能

---

## 五、高亮效果的深度实现

### 5.1 技术背景

Canvas API提供`stroke()`方法用于描边，但该方法仅适用于几何路径（Path），无法直接对位图图像进行描边。mask数据是像素位图，需要采用其他技术实现边框效果。

**解决方案：** 使用Canvas的阴影API（`shadowBlur`）结合混合模式（`globalCompositeOperation`）模拟内阴影效果，视觉上呈现为边框。

#### Canvas API的局限性

如果要给矩形或圆形描边，Canvas提供了便捷的API：

```typescript
ctx.strokeRect(x, y, width, height); // 矩形描边

ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.stroke(); // 圆形描边
```

但这些方法的前提是：**你有明确的几何路径（Path）**。

而我们的mask是什么呢？是一张**像素位图**——可能是复杂的人物轮廓、头发丝、手指等不规则形状，根本没有简单的几何描述。

**核心矛盾：** Canvas的`stroke()`只能描路径，不能描位图的边界。

#### 传统方案为什么不可行？

**方案1：将位图转换为矢量路径**

可以使用Marching Squares等算法提取边界点，然后生成路径：

```typescript
// 伪代码
const boundaryPoints = extractBoundary(maskCanvas); // 提取边界
const path = pointsToPath(boundaryPoints); // 转为路径
ctx.stroke(path); // 描边
```

**问题：**

- 算法复杂度高：O(n×m)，n×m是图片尺寸
- 复杂形状会生成数万个路径点
- 实时性差：hover时需要立即响应，没时间计算
- 抗锯齿效果差

**方案2：逐像素绘制边界**

遍历每个像素，检测是否是边界点（旁边有透明像素）：

```typescript
// 伪代码
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (isBoundaryPixel(x, y)) {
      ctx.fillRect(x, y, 1, 1); // 绘制边界点
    }
  }
}
```

**问题：**

- 双重循环，性能极差
- 边框没有抗锯齿，很粗糙
- 边框宽度难以控制

### 5.2 实现方案

采用内阴影技术实现边框效果，核心原理：

1. 使用`shadowBlur`在mask边缘生成模糊光晕
2. 通过`destination-in`混合模式限制阴影仅在mask内部显示
3. 通过重复绘制强化阴影效果，形成清晰的边框

**技术要点：**

- `shadowOffsetX/Y = 0`：阴影均匀扩散，无方向性
- `shadowColor`：使用高亮色（青色）而非传统阴影的黑色
- `destination-in`：建立mask边界，限制后续绘制范围

### 5.3 addInsetShadowToCanvas函数逐行解析

**函数签名：**

```typescript
function addInsetShadowToCanvas(
  sourceCanvas: HTMLCanvasElement, // 输入的mask Canvas
  targetCanvas: HTMLCanvasElement, // 目标Canvas（selectionCanvas）
  options: { blur: number; color: string; offsetX: number; offsetY: number },
): HTMLCanvasElement;
```

**输入说明：**

- `sourceCanvas`：layer的maskCanvas，包含白色mask区域和透明背景的Canvas图像
- `targetCanvas`：用于显示高亮效果的selectionCanvas
- `options.blur`：阴影模糊半径，决定边框宽度
- `options.color`：边框颜色（如`#33C8E6`青色）
- `options.offsetX/Y`：阴影偏移（通常为0，实现均匀扩散）

#### 步骤1：参数校验与初始化

```typescript
// 67-69行
const { blur, color, offsetX = 0, offsetY = 0 } = options;
const { width } = sourceCanvas;
const { height } = sourceCanvas;
```

**作用：** 解构配置参数，获取sourceCanvas尺寸。

**Canvas状态：** 无变化

#### 步骤2：创建resultCanvas（结果容器）

```typescript
// 72-73行
const resultCanvas = createCanvas(width, height);
const resultCtx = resultCanvas.getContext('2d')!;
```

**作用：** 创建与sourceCanvas同尺寸的结果Canvas，用于存储最终的高亮效果。

**Canvas状态：**

- `resultCanvas`：空白Canvas（width × height）

#### 步骤3：创建tempCanvas（临时工作区）

```typescript
// 76-77行
const tempCanvas = createCanvas(width + blur * 2, height + blur * 2);
const tempCtx = tempCanvas.getContext('2d')!;
```

**作用：** 创建比原图更大的临时Canvas，为阴影扩散预留空间。

**尺寸计算：**

- 宽度：`width + blur * 2`（左右各预留blur像素）
- 高度：`height + blur * 2`（上下各预留blur像素）

**Canvas状态：**

- `tempCanvas`：空白Canvas（(width + blur*2) × (height + blur*2)）

#### 步骤4：绘制原图到tempCanvas（带偏移）

```typescript
// 80-82行
const drawOffsetX = blur + offsetX;
const drawOffsetY = blur + offsetY;
tempCtx.drawImage(sourceCanvas, drawOffsetX, drawOffsetY, width, height);
```

**作用：** 将sourceCanvas绘制到tempCanvas的中心位置（考虑偏移）。

**坐标计算：**

- `drawOffsetX = blur + offsetX`：水平偏移（blur为预留空间，offsetX为配置偏移）
- `drawOffsetY = blur + offsetY`：垂直偏移

**Canvas状态：**

- `tempCanvas`：中心位置有白色mask图像，四周为透明区域

**视觉示意：**

```
tempCanvas (width+blur*2 × height+blur*2)
┌─────────────────────────┐
│  (透明)                  │
│    ┌─────────────┐       │
│    │  mask图像   │       │ ← 偏移(blur, blur)位置
│    └─────────────┘       │
│  (透明)                  │
└─────────────────────────┘
```

#### 步骤5：XOR操作创建负片效果

```typescript
// 85-86行
tempCtx.globalCompositeOperation = 'xor';
tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
```

**作用：** 使用XOR混合模式填充整个tempCanvas，创建负片效果。

**XOR混合模式原理：**

- XOR操作：相同像素值结果为0（透明），不同像素值保留
- 白色mask区域：XOR后变为透明
- 透明背景区域：XOR后变为不透明（白色）

**Canvas状态：**

- `tempCanvas`：mask区域变为透明，背景区域变为白色

**视觉示意：**

```
tempCanvas (XOR后)
┌─────────────────────────┐
│  ████████████████████    │ ← 背景变白色
│  ██┌─────────────┐██    │
│  ██│  (透明)     │██    │ ← mask区域变透明
│  ██└─────────────┘██    │
│  ████████████████████    │
└─────────────────────────┘
```

**注意：** 代码中存在调试代码（97-103行），实际执行时可能被移除或修改。

#### 步骤6：配置阴影参数

```typescript
// 89-93行
resultCtx.save();
resultCtx.shadowBlur = blur;
resultCtx.shadowColor = color;
resultCtx.shadowOffsetX = offsetX;
resultCtx.shadowOffsetY = offsetY;
```

**作用：** 在resultCtx上配置阴影参数，后续绘制操作将自动应用阴影。

**参数说明：**

- `shadowBlur`：模糊半径，决定阴影扩散范围
- `shadowColor`：阴影颜色（高亮色，非传统黑色）
- `shadowOffsetX/Y`：通常为0，实现均匀扩散

**Canvas状态：** resultCanvas仍为空白，但已配置阴影上下文

#### 步骤7：绘制sourceCanvas触发阴影

```typescript
// 95行
resultCtx.drawImage(sourceCanvas, -drawOffsetX, -drawOffsetY);
```

**作用：** 在resultCanvas上绘制sourceCanvas，触发阴影效果。

**坐标说明：**

- 使用负偏移`(-drawOffsetX, -drawOffsetY)`，与tempCanvas的偏移对应

**阴影生成机制：**

- Canvas在绘制时自动在绘制区域边缘生成阴影
- 阴影向内外两侧扩散
- 由于后续的`destination-in`裁剪，外侧阴影被截断，仅保留内侧阴影

**Canvas状态：**

- `resultCanvas`：包含mask图像和边缘阴影（模糊的青色光晕）

#### 步骤8：清理tempCanvas

```typescript
// 105行
cleanCanvas(tempCanvas);
```

**作用：** 释放tempCanvas内存，避免内存泄漏。

#### 步骤9：恢复上下文状态

```typescript
// 106行
resultCtx.restore();
```

**作用：** 恢复之前保存的Canvas上下文状态（清除阴影配置）。

**注意：** 由于步骤7已触发阴影，阴影效果已绘制到resultCanvas上，恢复状态不影响已绘制内容。

#### 步骤10：destination-in裁剪（限制阴影范围）

```typescript
// 109-111行
resultCtx.globalCompositeOperation = 'destination-in';
resultCtx.drawImage(sourceCanvas, 0, 0);
resultCtx.globalCompositeOperation = 'source-over';
```

**作用：** 使用`destination-in`混合模式，将resultCanvas裁剪为仅保留与sourceCanvas重叠的不透明区域。

**destination-in原理：**

- 保留destination（resultCanvas）中与source（sourceCanvas）重叠的不透明部分
- 相当于用sourceCanvas作为"遮罩"裁剪resultCanvas

**效果：**

- 阴影的外侧部分（超出mask边界）被截断
- 仅保留mask内部的内阴影部分

**Canvas状态：**

- `resultCanvas`：仅包含mask区域内的内阴影效果

#### 步骤11：颜色填充（生成填充色）

```typescript
// 114行
const colorCanvas = colorizeCanvas(sourceCanvas, AUTO_MASK_HOVER_FILL_COLOR);
```

**作用：** 调用`colorizeCanvas`将sourceCanvas的颜色转换为填充色。

**colorizeCanvas实现：**

```typescript
// canvas.ts:12-43
export function colorizeCanvas(sourceCanvas: HTMLCanvasElement, targetColor: string) {
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = sourceCanvas.width;
  resultCanvas.height = sourceCanvas.height;
  const resultCtx = resultCanvas.getContext('2d')!;

  // 1. 复制原始图像
  resultCtx.drawImage(sourceCanvas, 0, 0);

  // 2. 使用source-in模式：只保留重叠的不透明区域
  resultCtx.globalCompositeOperation = 'source-in';

  // 3. 填充目标颜色
  resultCtx.fillStyle = targetColor;
  resultCtx.fillRect(0, 0, width, height);

  // 4. 恢复混合模式
  resultCtx.globalCompositeOperation = 'source-over';

  return resultCanvas;
}
```

**处理流程：**

1. 复制sourceCanvas到新Canvas
2. 使用`source-in`模式：只保留与source重叠的不透明区域
3. 填充目标颜色（`AUTO_MASK_HOVER_FILL_COLOR = 'rgba(20, 179, 210, 0.16)'`）
4. 返回颜色化后的Canvas

**Canvas状态：**

- `colorCanvas`：mask区域填充为半透明青色，背景透明

#### 步骤12：绘制填充色到targetCanvas

```typescript
// 115行
targetCtx.drawImage(colorCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
```

**作用：** 将颜色化的mask绘制到targetCanvas（selectionCanvas）。

**Canvas状态：**

- `targetCanvas`：包含半透明青色填充的mask区域

#### 步骤13：清理colorCanvas

```typescript
// 116行
cleanCanvas(colorCanvas);
```

**作用：** 释放colorCanvas内存。

#### 步骤14：返回resultCanvas

```typescript
// 118行
return resultCanvas;
```

**作用：** 返回包含内阴影边框的resultCanvas。

**注意：** 实际代码中，resultCanvas包含边框效果，但targetCanvas已绘制填充色。后续的`addBorderToCanvas`函数会进一步处理resultCanvas。

### 5.4 addBorderToCanvas函数解析

**函数签名：**

```typescript
export function addBorderToCanvas(
  sourceCanvas: HTMLCanvasElement, // layer.maskCanvas
  targetCanvas: HTMLCanvasElement, // selectionCanvas
  options: {
    borderColor: string; // 边框颜色
    borderWidth: number; // 边框宽度
  },
);
```

**调用流程：**

```typescript
// use-auto-masks.ts:132-137
addBorderToCanvas(layer.maskCanvas, hoverCanvasRef.value!, {
  borderWidth:
    Math.max(1, (2 * layer.maskCanvas.width) / hoverCanvasRef.value!.width) * pixelRatio.value,
  borderColor: AUTO_MASK_HOVER_BORDER_COLOR,
});
```

#### 步骤1：调用addInsetShadowToCanvas生成内阴影

```typescript
// canvas.ts:132-137
const insetShadowCanvas = addInsetShadowToCanvas(sourceCanvas, targetCanvas, {
  blur: options.borderWidth,
  color: options.borderColor,
  offsetX: 0,
  offsetY: 0,
});
```

**作用：** 调用内阴影函数，生成包含边框效果的Canvas。

**返回结果：**

- `insetShadowCanvas`：包含内阴影边框的Canvas（mask区域有青色边框效果）

**注意：** 在`addInsetShadowToCanvas`内部，已执行步骤11-12，将填充色绘制到targetCanvas。

#### 步骤2：重复绘制强化边框效果

```typescript
// canvas.ts:140-149
const insetShadowCtx = insetShadowCanvas.getContext('2d')!;
for (let i = 0; i < 50; i++) {
  insetShadowCtx.drawImage(
    insetShadowCanvas,
    0,
    0,
    insetShadowCanvas.width,
    insetShadowCanvas.height,
  );
}
```

**作用：** 将insetShadowCanvas绘制到自身，重复50次，强化边框的不透明度。

**叠加原理：**

每次`drawImage`使用`source-over`混合模式（默认），半透明内容叠加：

```
初始边框不透明度：α₀ ≈ 10-20%（由shadowBlur生成）
第1次叠加：α₁ = α₀ + α₀ × (1 - α₀)
第2次叠加：α₂ = α₁ + α₀ × (1 - α₁)
...
第50次叠加：α₅₀ ≈ 99%（接近完全不透明）
```

**数学推导（简化）：**

假设每次叠加增加固定比例的不透明度增量：

```
αₙ = 1 - (1 - α₀)^(n+1)
```

当α₀ = 0.1，n = 50时：

```
α₅₀ = 1 - (1 - 0.1)^51 ≈ 0.995
```

**视觉效果：**

- 边框从淡青色逐渐变浓
- 50次后达到接近完全不透明的清晰边框

#### 步骤3：绘制边框到targetCanvas

```typescript
// canvas.ts:151行
targetCtx.drawImage(insetShadowCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
```

**作用：** 将强化后的边框效果绘制到targetCanvas（selectionCanvas）。

**Canvas状态：**

- `targetCanvas`：包含填充色（步骤11-12）和边框（当前步骤）

**图层叠加：**

- 底层：半透明青色填充（`rgba(20, 179, 210, 0.16)`）
- 上层：清晰的青色边框（`#33C8E6`）

#### 步骤4：清理insetShadowCanvas

```typescript
// canvas.ts:153行
cleanCanvas(insetShadowCanvas);
```

**作用：** 释放insetShadowCanvas内存。

### 5.5 颜色生成与叠加机制

#### 填充色的生成

**colorizeCanvas函数处理流程：**

1. **复制sourceCanvas**

   ```typescript
   resultCtx.drawImage(sourceCanvas, 0, 0);
   ```

   - 结果：resultCanvas包含白色mask区域和透明背景

2. **source-in混合模式**

   ```typescript
   resultCtx.globalCompositeOperation = 'source-in';
   ```

   - 作用：只保留与source重叠的不透明区域
   - 结果：resultCanvas仅保留mask区域，背景完全透明

3. **填充目标颜色**
   ```typescript
   resultCtx.fillStyle = AUTO_MASK_HOVER_FILL_COLOR; // 'rgba(20, 179, 210, 0.16)'
   resultCtx.fillRect(0, 0, width, height);
   ```

````
   - 作用：填充整个Canvas，但由于source-in限制，仅mask区域被填充
   - 结果：mask区域变为半透明青色，背景保持透明

**最终效果：**
- mask区域：`rgba(20, 179, 210, 0.16)`（16%不透明度的青色）
- 背景：完全透明

#### 边框色的生成

**内阴影生成流程：**

1. **阴影触发**
   ```typescript
   resultCtx.shadowBlur = blur;
   resultCtx.shadowColor = color; // '#33C8E6'
   resultCtx.drawImage(sourceCanvas, ...);
````

- 作用：在mask边缘生成模糊的青色阴影

2. **destination-in裁剪**

```typescript
resultCtx.globalCompositeOperation = 'destination-in';
resultCtx.drawImage(sourceCanvas, 0, 0);
```

- 作用：截断外侧阴影，仅保留内侧阴影

3. **重复强化**
   ```typescript
   for (let i = 0; i < 50; i++) {
       insetShadowCtx.drawImage(insetShadowCanvas, ...);
   }
   ```

   - 作用：通过叠加提高边框不透明度

**最终效果：**

- 边框：接近完全不透明的青色（`#33C8E6`）
- 中心区域：被mask覆盖，不可见

#### 图层叠加关系

**targetCanvas（selectionCanvas）的最终状态：**

```
targetCanvas图层结构（从底到顶）：
┌─────────────────────────────┐
│  1. 半透明青色填充            │ ← colorCanvas绘制
│     rgba(20, 179, 210, 0.16) │
│                              │
│  2. 清晰青色边框              │ ← insetShadowCanvas绘制
│     #33C8E6 (不透明)         │
│                              │
└─────────────────────────────┘
```

**视觉呈现：**

- mask区域中心：半透明青色填充（16%不透明度）
- mask区域边缘：清晰的青色边框（100%不透明度）
- 背景：完全透明

### 5.6 边框宽度的自适应计算原理

#### 问题：为什么需要动态计算？

```typescript
borderWidth: Math.max(1, (2 * layer.maskCanvas.width) / hoverCanvasRef.value!.width) *
  pixelRatio.value;
```

这个公式看起来复杂，背后解决的是一个重要问题：**在不同缩放和不同设备上，如何保持边框的视觉一致性？**

#### 场景1：缩放导致的视觉不一致

假设我们固定边框宽度为4像素：

```
原始mask：2000px宽
边框：4px
视觉占比：4 / 2000 = 0.2%

缩小显示到500px：
边框：还是4px
视觉占比：4 / 500 = 0.8%
结果：边框看起来粗了4倍！
```

**用户体验问题：**

- 缩小查看全图时，边框显得很粗，遮挡内容
- 放大查看细节时，边框显得很细，看不清

#### 场景2：高DPI屏幕的模糊问题

```
普通屏幕（DPR=1）：
4px CSS像素 = 4px 物理像素 ✓

Retina屏幕（DPR=2）：
4px CSS像素 = 4px × 2 = 8px 物理像素
但canvas的像素比例可能没有适配
结果：4px / 2 = 2px 物理像素（看起来很细很模糊）
```

#### 解决方案拆解

**第一部分：缩放系数计算**

```typescript
(2 * layer.maskCanvas.width) / hoverCanvasRef.value!.width;
```

计算逻辑：

```
layer.maskCanvas.width = 2000px（原始mask尺寸）
hoverCanvasRef.value!.width = 500px（当前显示尺寸）

缩放比例 = 2000 / 500 = 4倍缩小

边框宽度系数 = 2 × 4 = 8
```

**为什么要乘以2？**

- 这是一个调整系数，确保边框在任何尺寸下都不会太细
- 2这个数值是通过大量实际测试确定的经验值
- 如果不乘2，在大图上边框会显得太细

**第二部分：最小值保护**

```typescript
Math.max(1, ...)
```

确保边框至少有1像素宽：

- 在极端缩放情况下，计算结果可能小于1
- 小于1像素的边框基本看不见
- 强制设置为至少1像素，保证可见性

**第三部分：DPI适配**

```typescript
* pixelRatio.value
```

不同设备的像素比例：

```
普通屏幕：pixelRatio = 1，不缩放
Retina屏幕（MacBook Pro）：pixelRatio = 2，边框翻倍
4K高密度屏幕：pixelRatio = 3或4，边框相应增加
```

**实际计算示例：**

```
原始mask：2000px
显示尺寸：500px
设备：Retina屏幕（pixelRatio = 2）

borderWidth = Math.max(1, (2 × 2000) / 500) × 2
           = Math.max(1, 4000 / 500) × 2
           = Math.max(1, 8) × 2
           = 8 × 2
           = 16px

最终边框宽度：16px（在Retina屏幕上相当于8px的视觉效果）
```

#### 为什么这样就能保证视觉一致？

**核心原理：** 边框宽度与mask的缩放比例成正比，与设备DPI成正比。

```
视觉占比 = borderWidth / 显示宽度
        = (缩放系数 × DPI) / 显示宽度
        = 常数（在不同情况下近似相等）
```

这样无论用户怎么缩放、使用什么设备，边框在视觉上的"粗细感"都保持一致。

### 5.7 图层关系分析

#### Hover状态的图层关系

**Canvas层级结构：**

```
┌─────────────────────────────────────────┐
│  底层：原始图片（Image Element）         │
│  - 用户编辑的原始图像                    │
│  - 不参与mask渲染                        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  中层：maskCanvas（最终蒙版）            │
│  - 显示已选中的mask区域                  │
│  - 使用AUTO_MASK_COLOR填充              │
│  - 仅在点击确认后更新                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  顶层：selectionCanvas（交互预览）       │
│  - Hover时显示高亮边框和填充             │
│  - 包含colorCanvas（填充色）             │
│  - 包含insetShadowCanvas（边框）        │
│  - 鼠标离开时清空                        │
└─────────────────────────────────────────┘
```

**Hover时的渲染流程：**

1. **清空selectionCanvas**

```typescript
ctx.clearRect(0, 0, width, height);
```

- 清除之前的高亮效果

2. **绘制填充色**

   ```typescript
   // addInsetShadowToCanvas内部
   targetCtx.drawImage(colorCanvas, 0, 0, ...);
   ```

   - 在selectionCanvas上绘制半透明青色填充

3. **绘制边框**
   ```typescript
   // addBorderToCanvas
   targetCtx.drawImage(insetShadowCanvas, 0, 0, ...);
   ```

   - 在selectionCanvas上绘制清晰青色边框

**最终视觉效果：**

- 用户看到：mask区域有半透明青色填充和清晰青色边框
- maskCanvas：保持不变（显示已选中的mask）
- selectionCanvas：显示当前hover的layer的高亮效果

#### Click状态的图层关系

**Click后的渲染流程：**

1. **切换layer选中状态**

   ```typescript
   autoMaskModel.toggleLayerMode(x, y);
   ```

   - 更新layer的mode属性（null ↔ 'source-over'）

2. **合并所有选中的mask**

   ```typescript
   const maskResult = autoMaskModel.getMaskResult();
   const finalMask = maskResult.getMask(AUTO_MASK_COLOR);
   ```

   - 合并所有mode为'source-over'的layer
   - 生成最终mask Canvas

3. **更新maskCanvas**

   ```typescript
   options.maskResultChange?.(finalMask, getSnapshot());
   ```

   - 将最终mask绘制到maskCanvas
   - maskCanvas显示所有已选中的mask区域

4. **继续显示hover高亮**
   ```typescript
   handleHoverMask(e);
   ```

   - selectionCanvas继续显示当前hover的layer高亮

**最终图层状态：**

```
┌─────────────────────────────────────────┐
│  maskCanvas                             │
│  - 显示所有已选中的mask（合并后）        │
│  - 使用AUTO_MASK_COLOR填充              │
│  - 持久显示，直到用户取消选中            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  selectionCanvas                        │
│  - 显示当前hover的layer高亮              │
│  - 与maskCanvas叠加显示                 │
│  - 提供实时交互反馈                     │
└─────────────────────────────────────────┘
```

**视觉呈现：**

- maskCanvas：显示所有已选中的mask区域（如：人物+背景物体）
- selectionCanvas：显示当前鼠标悬停的layer高亮（如：仅人物）
- 两者叠加：用户可以看到已选中的区域（maskCanvas）和当前可选的区域（selectionCanvas）

#### 图层交互逻辑

**状态转换：**

```
初始状态：
- maskCanvas: 空白
- selectionCanvas: 空白

Hover Layer A:
- maskCanvas: 空白
- selectionCanvas: Layer A的高亮

Click Layer A:
- maskCanvas: Layer A（已选中）
- selectionCanvas: Layer A的高亮（继续显示）

Hover Layer B:
- maskCanvas: Layer A（保持不变）
- selectionCanvas: Layer B的高亮

Click Layer B:
- maskCanvas: Layer A + Layer B（合并）
- selectionCanvas: Layer B的高亮（继续显示）
```

**关键设计：**

- maskCanvas和selectionCanvas独立管理，互不干扰
- selectionCanvas仅用于交互反馈，不影响最终结果
- maskCanvas存储最终选中状态，持久显示

### 5.9 完整流程的视觉演变

**输入数据：**

- `sourceCanvas`：layer的maskCanvas（白色mask区域，透明背景，2000×2000px）
- `targetCanvas`：selectionCanvas（500×500px显示尺寸）

**处理流程的Canvas状态变化：**

| 步骤                       | Canvas            | 内容描述                   | 关键操作                              |
| -------------------------- | ----------------- | -------------------------- | ------------------------------------- |
| 初始                       | resultCanvas      | 空白Canvas                 | 创建                                  |
| 初始                       | tempCanvas        | 空白Canvas（2004×2004px）  | 创建（预留blur空间）                  |
| 步骤4                      | tempCanvas        | 中心位置有白色mask图像     | `drawImage(sourceCanvas, blur, blur)` |
| 步骤5                      | tempCanvas        | mask区域变透明，背景变白色 | XOR操作                               |
| 步骤7                      | resultCanvas      | 白色mask + 边缘青色阴影    | `drawImage`触发阴影                   |
| 步骤10                     | resultCanvas      | 仅mask内部的内阴影         | `destination-in`裁剪                  |
| 步骤11                     | colorCanvas       | mask区域半透明青色填充     | `colorizeCanvas`                      |
| 步骤12                     | targetCanvas      | 半透明青色填充             | `drawImage(colorCanvas)`              |
| 步骤2（addBorderToCanvas） | insetShadowCanvas | 强化后的边框（50次叠加）   | 重复绘制                              |
| 步骤3（addBorderToCanvas） | targetCanvas      | 填充色 + 边框              | `drawImage(insetShadowCanvas)`        |

**最终视觉效果：**

- mask区域中心：半透明青色填充（16%不透明度）
- mask区域边缘：清晰青色边框（接近100%不透明度）
- 背景：完全透明

### 5.8 技术方案的优势与局限

#### 优势总结

**1. 性能优异**

- 利用Canvas原生shadowBlur API，由浏览器内核优化（可能GPU加速）
- 不需要逐像素计算，避免双重循环
- 实时响应（hover时延<10ms），用户感觉不到卡顿

**2. 效果自然**

- 模糊边缘，抗锯齿效果好
- 视觉柔和，不像硬边框那样生硬
- 适合各种复杂形状（头发丝、手指等细节）

**3. 实现简洁**

- 不需要复杂的边界提取算法（Marching Squares等）
- 不需要位图转矢量路径
- 约50行代码实现完整功能

**4. 扩展性强**

- 边框颜色、宽度、模糊度都可灵活调整
- 可以轻松添加动画效果（改变颜色或宽度）
- 可以适配不同主题（暗色/亮色）

**5. 兼容性好**

- 使用标准Canvas API，所有现代浏览器都支持
- 不需要WebGL或特殊硬件支持
- 在低性能设备上也能流畅运行

#### 局限与权衡

**1. 边框必须是模糊的**

- 如果产品需要清晰的实线边框，此方案不适用
- 解决方案：可以调整shadowBlur为更小值（如1-2px），接近实线

**2. 重复绘制50次的开销**

- 虽然5ms可接受，但在极低性能设备上可能卡顿
- 解决方案：可以根据设备性能动态调整次数（如移动端减少到20次）

**3. "魔法数字"缺乏理论依据**

- 50次、乘以2等数值是经验值，没有理论公式
- 不同场景可能需要不同参数
- 解决方案：可以通过A/B测试找到最优值，或者提供配置选项

**4. 内存开销**

- 每次hover都创建临时canvas，频繁创建销毁
- 解决方案：可以复用临时canvas，而不是每次创建新的

#### 与其他方案的对比

| 方案                     | 性能       | 效果       | 实现难度 | 适用场景           |
| ------------------------ | ---------- | ---------- | -------- | ------------------ |
| **内阴影技术（本方案）** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐     | 任意形状，模糊边框 |
| 位图转矢量描边           | ⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐       | 简单形状，清晰边框 |
| 逐像素边界检测           | ⭐         | ⭐⭐⭐     | ⭐⭐⭐   | 小尺寸图像         |
| WebGL着色器              | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐       | 需要高性能和高质量 |

**选择建议：**

- 大多数场景：内阴影技术（性价比最高）
- 追求极致性能：WebGL着色器（需要额外学习成本）
- 需要清晰边框：位图转矢量（实现复杂，但效果最好）

### 5.11 技术要点总结

**核心设计思路：**

利用Canvas的阴影API（`shadowBlur`）结合混合模式（`globalCompositeOperation`）实现边框效果，而非传统的路径描边。

**关键技术点：**

1. **XOR操作**：创建负片效果，为阴影生成做准备
2. **shadowBlur + shadowOffset=0**：生成均匀扩散的阴影光晕
3. **destination-in裁剪**：限制阴影仅在mask内部显示
4. **重复叠加**：通过50次绘制强化边框不透明度
5. **颜色填充**：使用`colorizeCanvas`生成半透明填充色
6. **动态宽度计算**：根据缩放比例和设备DPI自适应边框宽度

**实现优势：**

- 性能优异：利用浏览器原生API，可能GPU加速
- 效果自然：模糊边缘，抗锯齿效果好
- 实现简洁：无需复杂的边界提取算法
- 兼容性好：标准Canvas API，所有现代浏览器支持

---

## 六、性能优化与最佳实践

### 6.1 性能瓶颈分析

在SAM主体选择功能中，可能出现性能问题的环节：

#### 瓶颈1：初始化阶段（API调用）

```typescript
const res: IAutoMask[] = await factory.apiService.autoMasks(imageUrl);
```

**问题：**

- 后端SAM模型推理需要1-3秒
- 网络传输mask数据（可能几百KB）
- 用户需要等待，体验不佳

**优化方案：**

```typescript
// 1. 缓存机制（已实现）
const jsonMap = new Map<string, IAutoMask[]>();
if (jsonMap.get(url)) {
  return jsonMap.get(url)!; // 直接使用缓存
}

// 2. 预加载（建议）
onImageLoad(() => {
  // 在用户可能使用前就开始加载
  preloadAutoMasks(imageUrl);
});

// 3. 降低图片分辨率（已实现）
ossUrl(url, {
  width: 3000, // 限制最大尺寸
  height: 3000,
  useDpr: false,
  forcePngResize: true,
});
```

**效果对比：**

```
无优化：每次使用需等待3秒
缓存：二次使用<10ms
预加载：用户使用时已就绪
降分辨率：减少50%处理时间
```

#### 瓶颈2：Hover事件的高频触发

```typescript
useEventListener(canvasRef, 'mousemove', handleHoverMask);
```

**问题：**

- 鼠标移动触发频率高（每秒100-200次）
- 每次触发都要绘制高亮（5-10ms）
- 可能造成卡顿或掉帧

**优化方案：**

```typescript
// 1. 防抖/节流（建议节流）
const handleHoverMask = throttle((e: MouseEvent) => {
  // ... 高亮逻辑
}, 16); // 约60fps，人眼察觉不到延迟

// 2. 避免重复计算
let lastLayerId: string | null = null;
function handleHoverMask(e: MouseEvent) {
  const layer = autoMaskModel.pickLayer(x, y);
  if (layer?.id === lastLayerId) {
    return; // 相同layer，不重新绘制
  }
  lastLayerId = layer?.id || null;
  // ... 绘制高亮
}

// 3. RAF优化（高级）
let rafId: number | null = null;
function handleHoverMask(e: MouseEvent) {
  if (rafId) return; // 已有待处理请求
  rafId = requestAnimationFrame(() => {
    // ... 高亮逻辑
    rafId = null;
  });
}
```

**效果对比：**

```
无优化：200次/秒 × 10ms = 2000ms（卡死）
节流（60fps）：60次/秒 × 10ms = 600ms（流畅）
避免重复：约10次/秒 × 10ms = 100ms（很流畅）
RAF：约60fps，与浏览器刷新率同步（最流畅）
```

#### 瓶颈3：高亮绘制的50次重复

```typescript
for (let i = 0; i < 50; i++) {
  resultCtx.drawImage(resultCanvas, 0, 0, width, height);
}
```

**问题：**

- 每次5ms，虽然可接受，但仍有优化空间
- 在低性能设备（如旧款手机）上可能卡顿

**优化方案：**

```typescript
// 1. 根据设备性能动态调整
const getRepeatCount = () => {
  if (isMobile && isLowEnd) return 20; // 低端移动设备
  if (isMobile) return 30; // 普通移动设备
  return 50; // 桌面设备
};

// 2. 缓存高亮结果
const highlightCache = new Map<string, HTMLCanvasElement>();
function getHighlightCanvas(layerId: string) {
  if (highlightCache.has(layerId)) {
    return highlightCache.get(layerId)!;
  }
  const canvas = generateHighlight(layer);
  highlightCache.set(layerId, canvas);
  return canvas;
}

// 3. Web Worker离屏渲染（高级）
const worker = new Worker('highlight-worker.js');
worker.postMessage({ layer, options });
worker.onmessage = (e) => {
  const highlightCanvas = e.data;
  // 使用结果
};
```

**效果对比：**

```
固定50次：5ms
动态调整（移动端20次）：2ms
缓存结果：<0.1ms（已缓存的layer）
Web Worker：不阻塞主线程，用户感知零延迟
```

### 6.2 内存管理最佳实践

#### 问题：临时Canvas的内存泄漏

每次hover都创建临时canvas，如果不清理会导致内存泄漏：

```typescript
// 错误示范
function addBorderToCanvas(...) {
    const resultCanvas = createCanvas(width, height);
    // ... 处理
    return resultCanvas; // 没有清理
}
```

**正确做法：**

```typescript
// 1. 使用完立即清理（已实现）
function addBorderToCanvas(...) {
    const resultCanvas = createCanvas(width, height);
    // ... 处理
    targetCtx.drawImage(resultCanvas, 0, 0, ...);
    cleanCanvas(resultCanvas); // ✓ 及时清理
}

// 2. 复用canvas，而不是每次创建
let reusableCanvas: HTMLCanvasElement | null = null;
function getReusableCanvas(width: number, height: number) {
    if (!reusableCanvas) {
        reusableCanvas = createCanvas(width, height);
    } else {
        reusableCanvas.width = width;
        reusableCanvas.height = height;
    }
    return reusableCanvas;
}

// 3. 生命周期管理
onUnmounted(() => {
    // 组件销毁时清理所有资源
    cleanCanvas(maskCanvas.value);
    cleanCanvas(selectionCanvas.value);
    jsonMap.clear();
    autoMaskModel = null;
});
```

**内存监控：**

```typescript
// 开发环境监控内存
if (import.meta.env.DEV) {
  let frameCount = 0;
  const checkMemory = () => {
    frameCount++;
    if (frameCount % 60 === 0 && performance.memory) {
      console.log('内存使用:', {
        used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
        total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
      });
    }
    requestAnimationFrame(checkMemory);
  };
  checkMemory();
}
```

### 6.3 代码组织最佳实践

#### 1. 关注点分离

```
lego/sam（底层库）       项目代码（业务层）
├── 数据模型             ├── API调用
├── 核心算法             ├── UI交互
└── Mask合并             ├── 坐标转换
                          ├── 事件处理
                          └── 视觉效果
```

**好处：**

- 底层库可独立升级，不影响业务代码
- 业务代码可复用底层能力，不重复造轮子
- 职责清晰，便于维护和测试

#### 2. 类型安全

```typescript
// 使用严格的类型定义
interface AutoMaskLayer {
  id: string;
  maskCanvas: HTMLCanvasElement;
  area: number;
  mode: null | 'source-over' | 'destination-out';
}

// 避免any类型
function pickLayer(x: number, y: number): AutoMaskLayer | null {
  // 明确的返回类型
}
```

#### 3. 错误处理

```typescript
// 处理API失败
try {
  const res = await factory.apiService.autoMasks(imageUrl);
  if (!res || res.length === 0) {
    throw new Error('未获取到有效mask数据');
  }
} catch (error) {
  console.error('获取auto masks失败:', error);
  // 降级方案：提示用户使用其他工具
  showToast('智能选区暂时不可用，请使用套索或画笔工具');
  return null;
}

// 处理坐标越界
function pickLayer(x: number, y: number) {
  if (x < 0 || x > width || y < 0 || y > height) {
    return null; // 坐标越界，返回null
  }
  // ... 正常逻辑
}
```

### 6.4 用户体验优化

#### 1. 加载状态提示

```typescript
const loading = ref(false);

async function getAutoMaskModel() {
  loading.value = true; // 显示loading
  try {
    // ... 加载逻辑
  } finally {
    loading.value = false; // 隐藏loading
  }
}
```

```vue
<template>
  <div v-if="loading" class="loading-overlay">
    <Spin />
    <p>AI正在分析图片...</p>
  </div>
</template>
```

#### 2. 交互反馈

```typescript
// 鼠标样式变化
canvas.style.cursor = layer ? 'pointer' : 'crosshair';

// 高亮颜色区分状态
const HOVER_COLOR = '#33C8E6'; // 悬停：青色
const SELECTED_COLOR = '#FF6B6B'; // 选中：红色
```

#### 3. 快捷键支持

```typescript
// Shift键：加选模式
// Alt键：减选模式
useEventListener(document, 'keydown', (e) => {
  if (e.key === 'Shift') {
    setMode('add');
  } else if (e.key === 'Alt') {
    setMode('subtract');
  }
});
```

### 6.5 调试技巧

#### 1. 可视化调试

```typescript
// 显示所有mask边界（调试用）
if (import.meta.env.DEV) {
  autoMaskModel.layers.forEach((layer, index) => {
    ctx.strokeStyle = `hsl(${(index * 360) / layers.length}, 80%, 50%)`;
    ctx.stroke(layer.path);
    ctx.fillText(layer.id, layer.bbox.x, layer.bbox.y);
  });
}
```

#### 2. 性能监控

```typescript
// 测量关键操作耗时
function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`[性能] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

// 使用
const layer = measurePerformance('pickLayer', () => {
  return autoMaskModel.pickLayer(x, y);
});
```

#### 3. 数据导出（用于分析）

```typescript
// 导出mask数据用于分析
function exportMaskData() {
  const data = {
    imageUrl,
    masks: autoMaskModel.layers.map((layer) => ({
      id: layer.id,
      area: layer.area,
      bbox: layer.bbox,
    })),
  };
  console.log(JSON.stringify(data, null, 2));
  // 或者下载为文件
  downloadJSON(data, 'mask-data.json');
}
```

---

## 总结

### 核心要点回顾

1. **SAM主体选择 = AI预测 + 前端交互**
   - 后端：SAM模型生成候选mask
   - 前端：用户交互选择mask

2. **完整流程**
   - 初始化：获取mask数据
   - Hover：实时高亮预览
   - Click：确认选中，合并mask

3. **职责划分**
   - `lego/sam`：数据模型、核心算法
   - 项目代码：API调用、UI交互、视觉效果

4. **高亮实现的精髓**
   - 利用内阴影技术，将阴影API"滥用"为边框绘制
   - destination-in建立边界 + shadowBlur生成光晕 + 重复强化
   - 动态宽度计算，保证视觉一致性

5. **性能优化关键**
   - 缓存机制（API结果、高亮canvas）
   - 节流防抖（hover事件）
   - 避免重复计算（相同layer不重绘）
   - 内存管理（及时清理临时canvas）

### 技术亮点

- **创新性**：内阴影技术是一个巧妙的hack，将不相关的API用于新场景
- **实用性**：性能好、效果好、实现简单，是工程上的最优解
- **可扩展性**：架构清晰，易于添加新功能（如动画、主题适配）
- **用户体验**：实时反馈、流畅交互，AI辅助降低操作门槛

### 延伸思考

**问题1：能否用WebGL实现更高性能的高亮？**

可以，WebGL着色器可以实现相同效果且性能更好，但：

- 增加实现复杂度
- 增加代码体积（需要着色器代码）
- 在当前场景下，Canvas方案已足够流畅
- 建议：性能瓶颈出现时再考虑WebGL

**问题2：为什么不用SVG而用Canvas？**

SVG的优势是矢量可缩放，但：

- Mask是位图数据，用SVG需要转换
- SVG的滤镜效果性能不如Canvas
- Canvas更适合像素级操作
- Canvas的compositeOperation更强大

**问题3：如何支持更多交互模式？**

可以扩展：

- 框选模式：拖拽矩形框，选中所有相交mask
- 画笔模式：涂抹式选择，自动匹配最近mask
- 魔棒模式：点击后自动扩展到相似区域
- 智能扩展：选中一个mask后，自动建议相关mask

这些都可以基于现有架构扩展，核心是AutoMaskModel提供了良好的抽象。

---

**文档结束。希望这份深度解析能帮助你完全理解SAM主体选择的实现原理！**
