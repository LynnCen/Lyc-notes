# SAM 前端图像分割深度解析

> 从使用到原理，从数据到实现的完整技术之旅  
> 作者：资深前端专家 & 大模型技术讲师

---

## 课程导航

**第一部分：快速上手**
- [第一章：5分钟快速体验](#第一章5分钟快速体验)

**第二部分:数据流转详解**
- [第二章：自动分割的数据旅程](#第二章自动分割的数据旅程)
- [第三章：交互式分割的数据旅程](#第三章交互式分割的数据旅程)

**第三部分：实现剖析**
- [第四章：RLE数据的解码实现](#第四章rle数据的解码实现)
- [第五章：颜色ID拾取系统的实现](#第五章颜色id拾取系统的实现)
- [第六章：图层合成的实现](#第六章图层合成的实现)
- [第七章：ONNX推理的实现](#第七章onnx推理的实现)

**第四部分：原理深度剖析**
- [第八章：SAM模型的工作原理](#第八章sam模型的工作原理)
- [第九章：Canvas图像处理原理](#第九章canvas图像处理原理)

**第五部分：实战进阶**
- [第十章：性能优化实战](#第十章性能优化实战)
- [第十一章：常见问题解决](#第十一章常见问题解决)

---

# 第一部分：快速上手

## 第一章：5分钟快速体验

### 1.1 我们要做什么？

想象一下，你正在开发一个图片编辑器，用户上传了一张照片，里面有一只猫。用户希望：
1. **点击猫**，自动选中整只猫
2. **导出抠图**，获得透明背景的猫咪图片

这就是 SAM 包要帮你实现的功能。让我们从最简单的例子开始。

### 1.2 最小可运行示例

```typescript
import { SamFactory } from '@lego/sam';
import axios from 'axios';

// 步骤1：初始化工厂
const factory = SamFactory.getInstance({
  axiosInstance: axios.create({ baseURL: 'https://your-api.com' }),
  upload: async (blob) => {
    // 你的文件上传逻辑
    return 'https://cdn.com/uploaded-file.png';
  },
  loadImage: (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
});

// 步骤2：创建模型
const model = await factory.createAutoMaskModel('https://example.com/cat.jpg');

// 步骤3：用户点击猫的位置（假设坐标是300, 200）
const result = model.toggleLayerMode(300, 200);

// 步骤4：导出抠图
if (result) {
  const cutoutImage = result.getImage();
  // cutoutImage 就是抠出来的猫咪图片（Canvas对象）
}
```

### 1.3 这四步背后发生了什么？

现在你已经完成了基本的抠图，但你可能有很多疑问：
- **步骤2** 调用 `createAutoMaskModel` 时，内部请求了什么数据？
- **步骤3** 点击后，如何知道用户点的是哪一层？
- **步骤4** `getImage()` 如何生成抠图的？

别急，接下来我们会一层层揭开这些谜团。

---

# 第二部分：数据流转详解

## 第二章：自动分割的数据旅程

### 2.1 整体数据流概览

让我用一个完整的数据流图来展示整个过程：

```
用户图片URL
    ↓
【后端API】返回 RLE 数据
    ↓
【前端解码】RLE → 像素数据
    ↓
【绘制Canvas】像素 → 多层Canvas
    ↓
【颜色标记】每层分配唯一颜色ID
    ↓
【用户点击】
    ↓
【颜色匹配】找到对应的层
    ↓
【图层合成】多层混合
    ↓
【导出结果】Mask Canvas 或抠图 Canvas
```

现在，让我们详细拆解每一步。

### 2.2 第一站：后端返回的RLE数据

#### 数据结构

当你调用 `createAutoMaskModel(imageUrl)` 时，内部会向后端发送请求：

```typescript
POST /gdesign/tool/ai/auto-masks
{
  url: "https://example.com/cat.jpg",
  mask_generator_config: {
    output_mode: "uncompressed_rle"
  }
}
```

后端会返回一个**数组**，每个元素代表一层分割结果：

```json
[
  {
    "area": 15234,
    "segmentation": {
      "counts": [0, 8, 15, 4, 23, 7, ...],
      "size": [1024, 768]
    }
  },
  {
    "area": 8932,
    "segmentation": {
      "counts": [120, 5, 89, 12, ...],
      "size": [1024, 768]
    }
  },
  ...
]
```

#### 数据含义解读

让我详细解释这个数据结构：

**1. `area` 字段**
- **含义**：这一层包含多少个像素
- **作用**：用于排序（面积大的在前）和判断层的包含关系
- **例子**：15234 表示这一层有 15234 个白色像素

**2. `segmentation.size` 字段**
- **含义**：`[高度, 宽度]`，注意顺序！
- **作用**：告诉我们这个mask的尺寸
- **例子**：`[1024, 768]` 表示高1024像素，宽768像素

**3. `segmentation.counts` 字段（核心）**
- **含义**：RLE编码的游程数组
- **作用**：压缩存储mask的像素信息
- **例子**：`[0, 8, 15, 4, 23, 7]` 的意思是：
  - 从第0个位置开始
  - 跳过0个像素（0个黑色）
  - 接着8个白色像素
  - 再跳过15个黑色像素
  - 再4个白色像素
  - ...以此类推

#### 为什么用RLE编码？

让我用一个直观的例子说明：

**原始方式**（1024×768 = 786,432 个像素）：
```
[0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,...]  // 需要存储786,432个数字
```

**RLE方式**（假设只有50段连续区域）：
```
[5, 6, 5, ...]  // 只需要存储约100个数字
```

**压缩比**：786,432 / 100 = **7864倍**！

### 2.3 第二站：RLE解码成像素数据

#### 解码的目标

我们需要把 `counts: [0, 8, 15, 4, ...]` 还原成一个完整的像素数组，其中：
- 值为 `0` 的位置表示背景（黑色）
- 值为 `1` 的位置表示前景（白色）

#### 解码的核心逻辑

```typescript
// 输入：RLE的counts数组
const counts = [0, 8, 15, 4, 23, 7];
const width = 768;
const height = 1024;

// 输出：RGBA像素数组（每个像素4个值：R, G, B, A）
const pixelData = new Uint8ClampedArray(width * height * 4);

let currentPosition = 0;  // 当前写入的像素位置

for (let i = 0; i < counts.length; i += 2) {
  const zeroCount = counts[i];      // 黑色像素数量
  const oneCount = counts[i + 1];   // 白色像素数量
  
  // 跳过黑色像素（保持为0，不用写入）
  currentPosition += zeroCount;
  
  // 填充白色像素
  for (let j = 0; j < oneCount; j++) {
    const index = currentPosition * 4;
    pixelData[index] = 255;      // R
    pixelData[index + 1] = 255;  // G
    pixelData[index + 2] = 255;  // B
    pixelData[index + 3] = 255;  // A
    currentPosition++;
  }
}
```

#### 关键点：坐标转换

这里有个**非常重要的细节**：SAM返回的RLE数据是**旋转90度**的！

为什么？因为SAM内部的存储顺序是按列优先（column-major），而Canvas是按行优先（row-major）。

所以解码后，我们需要：
```typescript
// 1. 先解码到临时Canvas（宽高互换）
tempCanvas.width = height;   // 注意：宽度用高度值
tempCanvas.height = width;   // 高度用宽度值

// 2. 绘制解码后的像素
tempCtx.putImageData(imageData, 0, 0);

// 3. 旋转回正常方向
finalCanvas.width = width;
finalCanvas.height = height;
const ctx = finalCanvas.getContext('2d');
ctx.scale(1, -1);
ctx.rotate(-90 * Math.PI / 180);
ctx.drawImage(tempCanvas, 0, 0);
```

### 2.4 第三站：为每一层分配颜色ID

#### 为什么需要颜色ID？

现在我们有了多个层（比如50层），每层都是一个Canvas。当用户点击时，我们需要快速知道点击的是哪一层。

最直观的方法是遍历所有层，检查点击位置的像素：
```typescript
// ❌ 低效方法
for (let layer of layers) {
  const pixel = layer.canvas.getImageData(x, y, 1, 1);
  if (pixel.data[3] > 0) {
    return layer;  // 找到了
  }
}
```

**问题**：50层 × 每层读取ImageData = 非常慢！

#### 颜色ID的巧妙方案

我们创建一个**隐藏的pickCanvas**，在这个Canvas上：
- 第1层用颜色 `rgb(0, 0, 1)` 绘制
- 第2层用颜色 `rgb(0, 0, 2)` 绘制
- 第3层用颜色 `rgb(0, 0, 3)` 绘制
- ...

当用户点击时，只需要：
```typescript
// ✅ 高效方法（O(1)时间复杂度）
const pixel = pickCanvas.getImageData(x, y, 1, 1);
const colorId = pixel.data[2];  // 读取B通道的值
return layerMap.get(colorId);   // 直接定位到对应层
```

#### 颜色ID的生成

```typescript
class ColorIdService {
  private n = 0;
  
  generateID() {
    this.n += 1;
    
    // 将数字编码为RGB
    const r = (this.n >>> 16) & 0xFF;  // 高8位
    const g = (this.n >>> 8) & 0xFF;   // 中8位
    const b = this.n & 0xFF;           // 低8位
    
    return {
      id: this.n.toString(),
      color: [r, g, b, 255]
    };
  }
}
```

**举例**：
- ID=1 → `rgb(0, 0, 1)`
- ID=256 → `rgb(0, 1, 0)`
- ID=65536 → `rgb(1, 0, 0)`

这样可以支持 **16,777,216** 层（2^24）。

### 2.5 第四站：用户点击后的层匹配

#### 完整的点击处理流程

当用户点击坐标 `(300, 200)` 时：

```typescript
pickLayer(x, y) {
  // 1. 坐标转换（屏幕坐标 → Canvas坐标）
  const scale = this.pickCanvas.width / this.image.naturalWidth;
  const canvasX = x * scale;
  const canvasY = y * scale;
  
  // 2. 读取pickCanvas上的颜色
  const ctx = this.pickCanvas.getContext('2d');
  const pixel = ctx.getImageData(canvasX, canvasY, 1, 1);
  const clickedColor = [
    pixel.data[0],
    pixel.data[1],
    pixel.data[2],
    pixel.data[3]
  ];
  
  // 3. 找到最接近的颜色ID
  let minDistance = Infinity;
  let matchedLayer = null;
  
  for (let layer of this.layers) {
    const distance = this.colorDistance(layer.color, clickedColor);
    if (distance < 3 && distance < minDistance) {
      minDistance = distance;
      matchedLayer = layer;
    }
  }
  
  return matchedLayer;
}
```

#### 为什么需要颜色距离？

理论上颜色应该完全匹配，但实际中可能因为：
- Canvas的抗锯齿
- 浏览器的颜色空间转换
- 浮点数精度问题

导致颜色有细微差异。所以我们用**欧式距离**来匹配：

```typescript
colorDistance(color1, color2) {
  const dr = color1[0] - color2[0];
  const dg = color1[1] - color2[1];
  const db = color1[2] - color2[2];
  return Math.sqrt(dr*dr + dg*dg + db*db);
}
```

阈值设为3，意味着RGB每个通道最多差1个单位。

### 2.6 第五站：图层合成

#### 三种模式

找到用户点击的层后，我们需要决定它的**合成模式**：

| 模式 | 值 | 含义 | Canvas操作 |
|-----|---|------|-----------|
| 未选中 | `null` | 不参与合成 | 不绘制 |
| 正选 | `'source-over'` | 添加到选区 | 叠加绘制 |
| 负选 | `'destination-out'` | 从选区扣除 | 擦除绘制 |

#### 模式切换逻辑

```typescript
toggleLayerMode(x, y) {
  const clickedLayer = this.pickLayer(x, y);
  if (!clickedLayer) return null;
  
  // 检查点击位置是否有其他已选中的层
  const overlappingLayers = this.findOverlappingLayers(x, y);
  
  if (overlappingLayers.length === 0) {
    // 情况1：独立区域，简单切换
    if (clickedLayer.mode === null) {
      clickedLayer.mode = 'source-over';  // 选中
    } else {
      clickedLayer.mode = null;  // 取消选中
    }
  } else {
    // 情况2：在已选区域内部，切换为负选
    const largerSelectedLayer = overlappingLayers.find(
      l => l.area > clickedLayer.area && l.mode === 'source-over'
    );
    
    if (largerSelectedLayer) {
      if (clickedLayer.mode === null) {
        clickedLayer.mode = 'destination-out';  // 扣除
      } else if (clickedLayer.mode === 'destination-out') {
        clickedLayer.mode = null;  // 取消扣除
      }
    }
  }
  
  return this.composeLayers();
}
```

#### 最终合成

```typescript
composeLayers() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 按顺序绘制所有选中的层
  for (let layer of this.layers) {
    if (layer.mode !== null) {
      ctx.globalCompositeOperation = layer.mode;
      ctx.drawImage(layer.maskCanvas, 0, 0);
    }
  }
  
  return new AutoMaskResult(this.image, canvas);
}
```

### 2.7 第六站：导出结果

#### 两种导出方式

**方式1：导出Mask**
```typescript
getMask() {
  // 返回黑白mask（白色=选中区域，黑色=背景）
  return this.maskCanvas;
}
```

**方式2：导出抠图**
```typescript
getImage() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 1. 先绘制mask
  ctx.drawImage(this.maskCanvas, 0, 0);
  
  // 2. 使用mask作为遮罩，绘制原图
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(this.image, 0, 0);
  
  // 结果：只有mask白色区域保留原图，其余透明
  return canvas;
}
```

#### Canvas混合模式的魔法

`globalCompositeOperation = 'source-in'` 的含义：
- 只保留**新绘制内容**（source）与**已有内容**（destination）**重叠**的部分

```
已有内容（mask）：  新绘制内容（原图）：  结果：
□□□□□□□□          🐱🐱🐱🐱            ⬜⬜⬜⬜
□■■■■□□□          🐱🐱🐱🐱            ⬜🐱🐱🐱
□■■■■□□□          🐱🐱🐱🐱            ⬜🐱🐱🐱
□□□□□□□□          🐱🐱🐱🐱            ⬜⬜⬜⬜
(■=白色mask)      (原图)              (抠图结果)
```

---

## 第三章：交互式分割的数据旅程

### 3.1 与自动分割的区别

**自动分割**：后端预先计算好所有可能的分割层，前端只需选择和组合。

**交互式分割**：根据用户的点击点，**实时推理**生成mask。

数据流对比：

```
自动分割：
图片URL → 后端计算 → RLE数据 → 前端解码 → 多层Canvas

交互式分割：
图片URL → 后端生成Embedding → 前端ONNX推理 → 单个Mask
```

### 3.2 第一站：Embedding数据

#### 什么是Embedding？

Embedding（嵌入）是图像的**高维特征表示**，包含了图像的所有语义信息。

```typescript
POST /gdesign/tool/ai/embedding
{
  url: "https://example.com/cat.jpg"
}

// 响应
{
  embedding_file_url: "https://cdn.com/embeddings/xxx.emb"
}
```

#### Embedding的数据格式

下载 `xxx.emb` 文件后，你会得到一个**Base64编码的字符串**。解码后是一个**浮点数数组**，形状为：

```
[1, 256, 64, 64] = 1,048,576 个浮点数
```

转换过程：
```typescript
// 1. 下载并解码Base64
const base64Str = await fetch(embeddingUrl).then(r => r.text());
const binaryStr = atob(base64Str);

// 2. 转为Uint8Array
const uint8Array = new Uint8Array(binaryStr.length);
for (let i = 0; i < binaryStr.length; i++) {
  uint8Array[i] = binaryStr.charCodeAt(i);
}

// 3. 转为Float32Array
const float32Array = new Float32Array(uint8Array.buffer);

// 4. 创建Tensor（ONNX格式）
const tensor = new Tensor('float32', float32Array, [1, 256, 64, 64]);
```

#### Embedding的大小

- **浮点数个数**：1,048,576
- **每个浮点数**：4字节
- **总大小**：1,048,576 × 4 = **4,194,304字节** ≈ **4MB**

### 3.3 第二站：点击数据的准备

#### 点击点的数据结构

```typescript
type IClick = [x: number, y: number, type: 0 | 1];
// x, y: 点击坐标
// type: 1=正点（包含），0=负点（排除）
```

例如：
```typescript
const clicks = [
  [300, 200, 1],  // 第一次点击：包含
  [350, 180, 0],  // 第二次点击：排除
];
```

#### 坐标归一化

SAM模型的输入尺寸固定为 `1024×1024`，所以需要将坐标归一化：

```typescript
// 原图尺寸：1920×1080
const imageWidth = 1920;
const imageHeight = 1080;

// 计算缩放比例（长边缩放到1024）
const scale = 1024 / Math.max(imageWidth, imageHeight);
// scale = 1024 / 1920 = 0.533

// 归一化坐标
const normalizedX = 300 * 0.533 = 160;
const normalizedY = 200 * 0.533 = 107;
```

#### 准备ONNX输入

```typescript
const feeds = {
  // 1. 图像特征（来自Embedding）
  image_embeddings: embeddingTensor,  // [1, 256, 64, 64]
  
  // 2. 点击坐标
  point_coords: new Tensor('float32', [
    160, 107,   // 第一个点
    187, 96     // 第二个点
  ], [1, 2, 2]),  // [batch, num_points, 2]
  
  // 3. 点击类型
  point_labels: new Tensor('float32', [
    1,  // 第一个点是正点
    0   // 第二个点是负点
  ], [1, 2]),  // [batch, num_points]
  
  // 4. 历史mask（用于增量计算）
  mask_input: prevMaskTensor || zeros([1, 1, 256, 256]),
  has_mask_input: new Tensor('float32', [prevMask ? 1 : 0], [1]),
  
  // 5. 原图尺寸
  orig_im_size: new Tensor('float32', [1080, 1920], [2])
};
```

### 3.4 第三站：ONNX推理输出

#### 推理执行

```typescript
const session = await InferenceSession.create('sam_decoder.onnx');
const results = await session.run(feeds);
```

这一步会耗时 **50-200ms**（取决于设备和执行提供者）。

#### 输出数据结构

```typescript
{
  masks: Tensor {
    data: Float32Array(196608),  // 3 * 256 * 256
    dims: [1, 3, 256, 256]
  },
  iou_predictions: Tensor {
    data: Float32Array([0.92, 0.87, 0.78]),
    dims: [1, 3]
  }
}
```

**关键点**：
- 模型输出**3个候选mask**
- 每个mask有对应的**质量评分**（IOU）
- 我们选择评分最高的mask

#### 选择最佳Mask

```typescript
const masks = results.masks.data;      // Float32Array(196608)
const scores = results.iou_predictions.data;  // [0.92, 0.87, 0.78]

// 找到最高分数的索引
let bestIndex = 0;
let bestScore = scores[0];
for (let i = 1; i < 3; i++) {
  if (scores[i] > bestScore) {
    bestScore = scores[i];
    bestIndex = i;
  }
}

// 提取对应的mask
const maskSize = 256 * 256;
const bestMask = masks.slice(
  bestIndex * maskSize,
  (bestIndex + 1) * maskSize
);
```

### 3.5 第四站：Mask数据的后处理

#### Float32Array → 像素数据

```typescript
const width = 256;
const height = 256;
const pixelData = new Uint8ClampedArray(width * height * 4);

for (let i = 0; i < bestMask.length; i++) {
  const value = bestMask[i] > 0 ? 255 : 0;  // 阈值处理
  pixelData[i * 4] = value;      // R
  pixelData[i * 4 + 1] = value;  // G
  pixelData[i * 4 + 2] = value;  // B
  pixelData[i * 4 + 3] = value;  // A
}

// 绘制到Canvas
const imageData = new ImageData(pixelData, width, height);
ctx.putImageData(imageData, 0, 0);
```

#### 上采样到原图尺寸

模型输出的mask是 `256×256`，需要放大到原图尺寸：

```typescript
// 原图：1920×1080
const fullSizeCanvas = document.createElement('canvas');
fullSizeCanvas.width = 1920;
fullSizeCanvas.height = 1080;

const ctx = fullSizeCanvas.getContext('2d');
ctx.drawImage(
  maskCanvas,      // 源：256×256
  0, 0, 256, 256,  // 源区域
  0, 0, 1920, 1080 // 目标区域（自动拉伸）
);
```

#### SVG轮廓生成（可选）

为了更好的视觉效果，可以提取mask的轮廓：

```typescript
// 1. 使用Marching Squares算法提取轮廓点
const contours = findContours(maskData);
// contours: [[[x1,y1], [x2,y2], ...], ...]

// 2. 转换为SVG Path
const svgPath = contours.map(contour => {
  let path = `M ${contour[0][0]} ${contour[0][1]}`;
  for (let i = 1; i < contour.length; i++) {
    path += ` L ${contour[i][0]} ${contour[i][1]}`;
  }
  path += ' Z';
  return path;
});

// 3. 绘制轮廓
ctx.strokeStyle = 'green';
ctx.lineWidth = 2;
svgPath.forEach(path => {
  ctx.stroke(new Path2D(path));
});
```

---

# 第三部分：实现剖析

## 第四章：RLE数据的解码实现

### 4.1 为什么需要深入理解RLE？

在第二章我们知道了RLE的基本解码流程，但实际实现中有很多细节：
- 如何处理坐标旋转？
- 如何优化解码性能？
- 如何处理边界情况？

### 4.2 完整的解码实现

```typescript
function rleToMask(
  counts: number[],
  width: number,
  height: number,
  color: [number, number, number, number]
): HTMLCanvasElement {
  
  // === 阶段1：创建临时Canvas（注意宽高互换）===
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = height;    // 用height作为宽度
  tempCanvas.height = width;    // 用width作为高度
  
  const tempCtx = tempCanvas.getContext('2d', {
    willReadFrequently: true  // 性能优化提示
  });
  
  // === 阶段2：创建像素数组 ===
  const imageData = tempCtx.createImageData(height, width);
  const data = imageData.data;
  
  // === 阶段3：RLE解码 ===
  let position = 0;
  
  for (let i = 0; i < counts.length; i += 2) {
    const zeros = counts[i];      // 跳过的像素数
    const ones = counts[i + 1];   // 填充的像素数
    
    // 跳过zeros个像素
    position += zeros;
    
    // 填充ones个像素
    for (let j = 0; j < ones; j++) {
      const idx = position * 4;
      data[idx] = color[0];      // R
      data[idx + 1] = color[1];  // G
      data[idx + 2] = color[2];  // B
      data[idx + 3] = color[3];  // A
      position++;
    }
  }
  
  // === 阶段4：绘制到临时Canvas ===
  tempCtx.putImageData(imageData, 0, 0);
  
  // === 阶段5：旋转校正 ===
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width;
  finalCanvas.height = height;
  
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.save();
  
  // 旋转变换矩阵
  finalCtx.scale(1, -1);                    // Y轴翻转
  finalCtx.rotate(-90 * Math.PI / 180);    // 逆时针旋转90度
  finalCtx.drawImage(tempCanvas, 0, 0);
  
  finalCtx.restore();
  
  // === 阶段6：清理临时Canvas ===
  tempCanvas.width = 1;
  tempCanvas.height = 1;
  
  return finalCanvas;
}
```

### 4.3 关键点深度解析

#### 为什么宽高要互换？

SAM的RLE数据是**列优先**存储的，想象一个 3×4 的图像：

```
原始图像（行优先）：     SAM存储（列优先）：
1  2  3  4              1  5   9
5  6  7  8              2  6  10
9 10 11 12              3  7  11
                        4  8  12
```

所以解码时，创建的临时Canvas是 **4×3**（宽高互换）。

#### 旋转变换的数学原理

```typescript
// 原点在左上角，Y轴向下
scale(1, -1)    // Y轴翻转，原点移到左下
rotate(-90°)    // 逆时针旋转90度
```

用变换矩阵表示：
```
[1   0 ]   [cos(-90)  -sin(-90)]   [0   1]
[0  -1] × [sin(-90)   cos(-90)] = [1   0]
```

#### 性能优化技巧

1. **避免频繁创建ImageData**
```typescript
// ❌ 每次都创建（慢）
for (let layer of layers) {
  const imageData = ctx.createImageData(w, h);
  // ...
}

// ✅ 复用ImageData（快）
const imageData = ctx.createImageData(w, h);
for (let layer of layers) {
  // 直接修改imageData.data
  // ...
  ctx.putImageData(imageData, 0, 0);
}
```

2. **使用Typed Array的子数组视图**
```typescript
// ❌ 逐个赋值（慢）
for (let i = 0; i < ones; i++) {
  data[pos*4] = 255;
  data[pos*4+1] = 255;
  data[pos*4+2] = 255;
  data[pos*4+3] = 255;
  pos++;
}

// ✅ 批量填充（快）
const rgba = new Uint8Array([255, 255, 255, 255]);
for (let i = 0; i < ones; i++) {
  data.set(rgba, pos * 4);
  pos++;
}
```

---

## 第五章：颜色ID拾取系统的实现

### 5.1 颜色ID生成器的实现

```typescript
class ColorIdService {
  private static instance: ColorIdService;
  private currentId = 0;
  private colorMap = new Map<string, [number, number, number, number]>();
  
  static getInstance() {
    if (!ColorIdService.instance) {
      ColorIdService.instance = new ColorIdService();
    }
    return ColorIdService.instance;
  }
  
  generateID(): [string, [number, number, number, number]] {
    this.currentId++;
    
    // 将ID编码为RGB（24位色彩空间）
    const r = (this.currentId >>> 16) & 0xFF;  // 高8位
    const g = (this.currentId >>> 8) & 0xFF;   // 中8位
    const b = this.currentId & 0xFF;           // 低8位
    
    const id = this.currentId.toString();
    const color: [number, number, number, number] = [r, g, b, 255];
    
    this.colorMap.set(id, color);
    
    return [id, color];
  }
  
  checkColorDistance(
    color1: Uint8ClampedArray | number[],
    color2: Uint8ClampedArray | number[]
  ): number {
    const dr = color1[0] - color2[0];
    const dg = color1[1] - color2[1];
    const db = color1[2] - color2[2];
    const da = color1[3] - color2[3];
    
    return Math.sqrt(dr*dr + dg*dg + db*db + da*da);
  }
}
```

### 5.2 PickCanvas的构建

```typescript
class AutoMaskModel {
  private pickCanvas: HTMLCanvasElement;
  private layerMap = new Map<string, AutoMaskLayer>();
  
  constructor(autoMasks: IAutoMask[], image: HTMLImageElement) {
    const colorService = ColorIdService.getInstance();
    
    // 1. 创建pickCanvas
    this.pickCanvas = document.createElement('canvas');
    this.pickCanvas.width = autoMasks[0].segmentation.size[1];
    this.pickCanvas.height = autoMasks[0].segmentation.size[0];
    
    const pickCtx = this.pickCanvas.getContext('2d');
    
    // 2. 按面积从大到小排序（重要！）
    autoMasks.sort((a, b) => b.area - a.area);
    
    // 3. 为每层生成颜色ID并绘制到pickCanvas
    this.layers = autoMasks.map(mask => {
      const [id, color] = colorService.generateID();
      
      // 解码RLE，使用唯一颜色
      const maskCanvas = rleToMask(
        mask.segmentation.counts,
        mask.segmentation.size[1],
        mask.segmentation.size[0],
        color  // 使用颜色ID
      );
      
      // 绘制到pickCanvas
      pickCtx.drawImage(maskCanvas, 0, 0);
      
      const layer = {
        id,
        color,
        mode: null,
        area: mask.area,
        maskCanvas,
        segmentation: mask.segmentation
      };
      
      this.layerMap.set(id, layer);
      return layer;
    });
  }
}
```

### 5.3 为什么要按面积排序？

考虑这个场景：
- 大层：整只猫（面积10000）
- 小层：猫的耳朵（面积500）

如果先绘制小层，再绘制大层，那么pickCanvas上**小层会被覆盖**，用户点击耳朵时会匹配到大层，这是错误的。

正确顺序：**从大到小**绘制，小层会覆盖大层，确保优先匹配最精确的层。

### 5.4 点击拾取的完整实现

```typescript
pickLayer(x: number, y: number): AutoMaskLayer | null {
  // 1. 坐标转换
  const scale = this.pickCanvas.width / this.image.naturalWidth;
  const canvasX = Math.floor(x * scale);
  const canvasY = Math.floor(y * scale);
  
  // 边界检查
  if (canvasX < 0 || canvasX >= this.pickCanvas.width ||
      canvasY < 0 || canvasY >= this.pickCanvas.height) {
    return null;
  }
  
  // 2. 读取颜色
  const ctx = this.pickCanvas.getContext('2d');
  const pixel = ctx.getImageData(canvasX, canvasY, 1, 1);
  
  // 3. 颜色匹配
  const colorService = ColorIdService.getInstance();
  let minDistance = Infinity;
  let matchedLayer: AutoMaskLayer | null = null;
  
  for (let layer of this.layers) {
    const distance = colorService.checkColorDistance(layer.color, pixel.data);
    
    // 阈值3：允许轻微色差
    if (distance < 3 && distance < minDistance) {
      minDistance = distance;
      matchedLayer = layer;
    }
  }
  
  return matchedLayer;
}
```

---

## 第六章：图层合成的实现

### 6.1 Canvas混合模式详解

Canvas的 `globalCompositeOperation` 决定了新内容如何与已有内容混合。

#### 核心模式对比

```typescript
ctx.globalCompositeOperation = 'source-over';
// 源（新内容）覆盖在目标（旧内容）之上
// 结果 = 源 + (1-源透明度)*目标

ctx.globalCompositeOperation = 'destination-out';
// 源的形状从目标中"挖"出来
// 结果 = (1-源透明度)*目标
```

用图示说明：

```
已有内容（目标）：     新内容（源）：       source-over：      destination-out：
■■■■■■■            ●●●●              ■■■■■■■          ■■■■■■■
■■■■■■■            ●●●●              ■●●●■■■          ■□□□■■■
■■■■■■■            ●●●●              ■●●●■■■          ■□□□■■■
■■■■■■■            ●●●●              ■■■■■■■          ■■■■■■■
```

### 6.2 智能模式切换的实现

```typescript
toggleLayerMode(x: number, y: number): AutoMaskResult | null {
  const layer = this.pickLayer(x, y);
  if (!layer) return null;
  
  // 查找该位置其他已选中的层
  const overlappingLayers = this.findOverlappingSelectedLayers(x, y, layer);
  
  if (overlappingLayers.length === 0) {
    // === 情况1：独立区域 ===
    // null → source-over → null
    layer.mode = layer.mode === 'source-over' ? null : 'source-over';
  } else {
    // === 情况2：在其他层内部 ===
    // 找到包含当前层的最大层
    const containerLayer = overlappingLayers.find(
      l => l.area > layer.area && l.mode === 'source-over'
    );
    
    if (containerLayer) {
      // 在正选层内部：null → destination-out → null
      if (layer.mode === null) {
        layer.mode = 'destination-out';
      } else if (layer.mode === 'destination-out') {
        layer.mode = null;
      } else {
        layer.mode = null;
      }
    } else {
      // 在负选层内部：正常切换
      layer.mode = layer.mode === 'source-over' ? null : 'source-over';
    }
  }
  
  return this.getMaskResult();
}

private findOverlappingSelectedLayers(
  x: number,
  y: number,
  excludeLayer: AutoMaskLayer
): AutoMaskLayer[] {
  const scale = this.pickCanvas.width / this.image.naturalWidth;
  const canvasX = Math.floor(x * scale);
  const canvasY = Math.floor(y * scale);
  
  return this.layers.filter(layer => {
    if (layer === excludeLayer || layer.mode === null) return false;
    
    // 检查该层在点击位置是否有像素
    const ctx = layer.maskCanvas.getContext('2d');
    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1);
    return pixel.data[3] > 0;  // alpha > 0 表示有像素
  });
}
```

### 6.3 最终合成的实现

```typescript
getMaskResult(): AutoMaskResult | null {
  // 检查是否有选中的层
  const hasSelectedLayers = this.layers.some(l => l.mode !== null);
  if (!hasSelectedLayers) return null;
  
  // 创建结果Canvas
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = this.image.naturalWidth;
  resultCanvas.height = this.image.naturalHeight;
  
  const ctx = resultCanvas.getContext('2d');
  ctx.save();
  
  // 按顺序合成所有选中的层
  for (let layer of this.layers) {
    if (layer.mode !== null) {
      ctx.globalCompositeOperation = layer.mode;
      
      // 缩放绘制（layer的Canvas可能尺寸不同）
      ctx.drawImage(
        layer.maskCanvas,
        0, 0, layer.maskCanvas.width, layer.maskCanvas.height,
        0, 0, resultCanvas.width, resultCanvas.height
      );
    }
  }
  
  ctx.restore();
  
  return new AutoMaskResult(this.image, this.layers.filter(l => l.mode !== null));
}
```

---

## 第七章：ONNX推理的实现

### 7.1 模型加载与缓存

```typescript
class OnnxModelService {
  private static modelCache: InferenceSession | null = null;
  private static loadingPromise: Promise<InferenceSession> | null = null;
  
  static async getModel(options?: { onnxUrl?: string }): Promise<InferenceSession> {
    // 如果已加载，直接返回
    if (this.modelCache) {
      return this.modelCache;
    }
    
    // 如果正在加载，等待加载完成
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    // 开始加载
    this.loadingPromise = (async () => {
      const modelUrl = options?.onnxUrl || '/default-sam-decoder.onnx';
      
      // 配置执行提供者（优先级：webgpu > wasm > cpu）
      const executionProviders = ['webgpu', 'wasm', 'cpu'];
      
      this.modelCache = await InferenceSession.create(modelUrl, {
        executionProviders
      });
      
      return this.modelCache;
    })();
    
    return this.loadingPromise;
  }
}
```

### 7.2 输入数据准备

```typescript
function toModelData(
  clicks: IClick[],
  imageTensor: Tensor,
  modelScale: ModelScale,
  prevMask: Tensor | null
): Record<string, Tensor> {
  
  const numClicks = clicks.length;
  
  // 1. 准备点击坐标
  const coords = new Float32Array(numClicks * 2);
  const labels = new Float32Array(numClicks);
  
  for (let i = 0; i < numClicks; i++) {
    const [x, y, label] = clicks[i];
    
    // 坐标归一化
    coords[i * 2] = x * modelScale.samScale;
    coords[i * 2 + 1] = y * modelScale.samScale;
    
    labels[i] = label;
  }
  
  // 2. 准备mask输入
  const hasMask = prevMask !== null;
  const maskInput = hasMask 
    ? prevMask 
    : new Tensor('float32', new Float32Array(1 * 1 * 256 * 256), [1, 1, 256, 256]);
  
  // 3. 组装所有输入
  return {
    image_embeddings: imageTensor,
    point_coords: new Tensor('float32', coords, [1, numClicks, 2]),
    point_labels: new Tensor('float32', labels, [1, numClicks]),
    mask_input: maskInput,
    has_mask_input: new Tensor('float32', [hasMask ? 1 : 0], [1]),
    orig_im_size: new Tensor('float32', [
      modelScale.height,
      modelScale.width
    ], [2])
  };
}
```

### 7.3 推理与结果处理

```typescript
class SamModel {
  private async predict(
    clicks: IClick[],
    prevMask: Tensor | null
  ): Promise<{ mask: Float32Array, predMask: Tensor }> {
    
    // 1. 加载模型
    const model = await OnnxModelService.getModel();
    
    // 2. 准备输入
    const feeds = toModelData(clicks, this.embedding, this.modelScale, prevMask);
    
    // 3. 执行推理
    const startTime = performance.now();
    const results = await model.run(feeds);
    const inferenceTime = performance.now() - startTime;
    console.log(`推理耗时: ${inferenceTime.toFixed(2)}ms`);
    
    // 4. 提取输出
    const masksOutput = results[model.outputNames[0]];   // 'masks'
    const scoresOutput = results[model.outputNames[1]];  // 'iou_predictions'
    const predMaskOutput = results[model.outputNames[2]]; // 低分辨率mask（用于下次输入）
    
    // 5. 选择最佳mask
    const { mask, predMask } = getBestMask(
      masksOutput.data as Float32Array,
      masksOutput.dims[2],  // height: 256
      masksOutput.dims[3],  // width: 256
      scoresOutput.data as Float32Array,
      predMaskOutput.data as Float32Array,
      predMaskOutput.dims[2],  // height: 256
      predMaskOutput.dims[3]   // width: 256
    );
    
    return { mask, predMask };
  }
}
```

### 7.4 最佳Mask选择

```typescript
function getBestMask(
  masks: Float32Array,      // [3, 256, 256]
  maskHeight: number,
  maskWidth: number,
  scores: Float32Array,     // [3]
  predMasks: Float32Array,  // [3, 256, 256]
  predHeight: number,
  predWidth: number
): { mask: Float32Array, predMask: Tensor } {
  
  // 1. 找到最高分数
  let bestIdx = 0;
  let bestScore = scores[0];
  
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > bestScore) {
      bestScore = scores[i];
      bestIdx = i;
    }
  }
  
  // 2. 提取对应的mask
  const maskSize = maskHeight * maskWidth;
  const mask = masks.slice(
    bestIdx * maskSize,
    (bestIdx + 1) * maskSize
  );
  
  // 3. 提取对应的predMask（用于下次推理）
  const predMaskSize = predHeight * predWidth;
  const predMaskData = predMasks.slice(
    bestIdx * predMaskSize,
    (bestIdx + 1) * predMaskSize
  );
  
  const predMask = new Tensor(
    'float32',
    predMaskData,
    [1, 1, predHeight, predWidth]
  );
  
  return { mask, predMask };
}
```

### 7.5 历史管理的实现

```typescript
class SamModel {
  private clicks: IClick[] = [];
  private predMask: Tensor | null = null;
  private history: Array<{ clicks: IClick[], predMask: Tensor | null }> = [];
  private historyCursor = 0;
  
  async addClick(click: IClick, snapshot = false): Promise<MaskResult | null> {
    // 拒绝无效的负点
    if (click[2] === 0 && this.clicks.length === 0) {
      return null;
    }
    
    // 执行推理
    const newClicks = [...this.clicks, click];
    const { mask, predMask } = await this.predict(newClicks, this.predMask);
    
    // 保存快照
    if (snapshot) {
      // 删除当前游标后的历史
      if (this.history.length > this.historyCursor) {
        this.history.splice(this.historyCursor);
      }
      
      // 添加新快照
      this.history.push({ clicks: newClicks, predMask });
      this.historyCursor++;
      
      // 更新状态
      this.clicks = newClicks;
      this.predMask = predMask;
    }
    
    return new MaskResult(newClicks, this.image, mask);
  }
  
  async setClicks(clicks: IClick[]): Promise<void> {
    // 查找历史中的匹配点
    const matchIndex = this.findHistoryMatch(clicks);
    
    if (matchIndex !== -1 && matchIndex === clicks.length) {
      // 完全匹配，直接恢复历史状态
      const snapshot = this.history[matchIndex - 1];
      this.clicks = snapshot.clicks;
      this.predMask = snapshot.predMask;
      this.historyCursor = matchIndex;
    } else {
      // 不匹配，重新推理
      this.predMask = null;
      for (let i = 0; i < clicks.length; i++) {
        const result = await this._addClick(clicks[i]);
        this.predMask = result.predMask;
        this.clicks = result.clicks;
      }
      this.history = [{ clicks: [...this.clicks], predMask: this.predMask }];
      this.historyCursor = 1;
    }
  }
  
  private findHistoryMatch(clicks: IClick[]): number {
    for (let i = 0; i < this.history.length; i++) {
      const snapshot = this.history[i];
      
      // 检查前i+1个点击是否匹配
      if (i + 1 > clicks.length) break;
      
      let match = true;
      for (let j = 0; j <= i; j++) {
        const c1 = clicks[j];
        const c2 = snapshot.clicks[j];
        if (c1[0] !== c2[0] || c1[1] !== c2[1] || c1[2] !== c2[2]) {
          match = false;
          break;
        }
      }
      
      if (match && i + 1 === clicks.length) {
        return i + 1;
      }
      if (!match) {
        return -1;
      }
    }
    return -1;
  }
}
```

---

# 第四部分：原理深度剖析

## 第八章：SAM模型的工作原理

### 8.1 什么是SAM？

SAM（Segment Anything Model）是Meta AI在2023年发布的革命性图像分割模型。它的核心创新是**提示式分割范式**。

#### 传统分割 vs SAM分割

**传统分割**：
```
训练数据：猫的图片 → 模型 → 只能分割猫
训练数据：狗的图片 → 模型 → 只能分割狗
```
需要为每个类别训练专门的模型。

**SAM分割**：
```
训练数据：10亿+标注图片 → SAM → 可以分割任何物体
用户提示：点击点/框选 → SAM → 生成对应的mask
```
一个模型处理所有对象，通过"提示"告诉模型要分割什么。

### 8.2 SAM的三层架构

```
输入图像 → Image Encoder → Image Embedding (1×256×64×64)
                                    ↓
用户点击 → Prompt Encoder → Prompt Embedding
                                    ↓
                            Mask Decoder → 输出Mask
```

#### 第一层：Image Encoder（图像编码器）

**作用**：将图像转换为高维特征表示（Embedding）

**架构**：Vision Transformer（ViT-H）
- 参数量：约6亿
- 输入：1024×1024 RGB图像
- 输出：256×64×64 特征图

**工作流程**：
1. 将图像分割为16×16的patches（共4096个patches）
2. 每个patch通过线性投影得到一个向量
3. 添加位置编码
4. 经过32层Transformer处理
5. 输出256通道的64×64特征图

**关键特性**：
- 只需运行**一次**（重量级计算）
- 输出的Embedding包含图像所有语义信息
- 可复用于多次分割（多个点击共享同一个Embedding）

#### 第二层：Prompt Encoder（提示编码器）

**作用**：将用户的提示（点击、框选）编码为向量

**支持的提示类型**：
1. **点提示**：`(x, y, type)` → 位置编码 + 类型嵌入
2. **框提示**：`(x1, y1, x2, y2)` → 四个角点的位置编码
3. **Mask提示**：粗糙的mask → 卷积编码

**工作流程**（以点提示为例）：
```typescript
// 位置编码（类似Transformer）
function positionalEncoding(x, y) {
  const pe = [];
  for (let i = 0; i < 128; i++) {
    const freq = 2 ** i;
    pe.push(sin(x * freq * Math.PI));
    pe.push(cos(x * freq * Math.PI));
    pe.push(sin(y * freq * Math.PI));
    pe.push(cos(y * freq * Math.PI));
  }
  return pe;
}

// 类型嵌入
const typeEmbedding = {
  foreground: [1, 0],  // 正点
  background: [0, 1]   // 负点
};

// 最终编码
const promptEmbedding = concat(
  positionalEncoding(x, y),
  typeEmbedding[type]
);
```

#### 第三层：Mask Decoder（掩码解码器）

**作用**：结合Image Embedding和Prompt Embedding，生成分割mask

**架构**：轻量级Transformer + 上采样层
- 参数量：约400万（只有Encoder的1/150）
- 输入：Image Embedding (256×64×64) + Prompt Embedding
- 输出：3个候选Mask (3×256×256) + 质量评分 (3×1)

**为什么输出3个Mask？**

考虑这个场景：用户点击了狗的头部

- **Mask 1**：只分割狗头（最精确）
- **Mask 2**：分割整只狗（中等范围）
- **Mask 3**：分割狗和周围环境（最大范围）

模型同时输出多个歧义解，让质量评分自动选择最佳的。

**质量评分（IOU Prediction）**：
- 预测"生成的mask与真实mask的重叠度"
- 范围：0-1，越高越好
- 用于自动选择最佳mask

### 8.3 训练策略

SAM的训练采用了**数据引擎**的创新方法：

```
第一阶段（Assisted Manual）：
人工标注员手动标注 → 4.3M masks

第二阶段（Semi-Automatic）：
模型预测 + 人工校正 → 10.2M masks

第三阶段（Fully Automatic）：
模型自动生成 → 1.1B masks
```

**数据规模**：
- 图片数量：1100万张
- Mask数量：11亿个
- 数据集大小：约400GB

### 8.4 为什么SAM适合Web端？

**传统深度学习模型在Web端的问题**：
1. 模型太大（几百MB到几GB）
2. 推理太慢（秒级延迟）
3. 无法交互式调整

**SAM的优势**：
1. **分离式架构**：重量级的Encoder在后端跑，轻量级的Decoder在前端跑
2. **快速推理**：Decoder只有4M参数，浏览器推理50-200ms
3. **交互友好**：支持增量计算（利用上一次的结果）

---

## 第九章：Canvas图像处理原理

### 9.1 Canvas的像素操作

#### ImageData的数据结构

```typescript
const imageData = ctx.getImageData(0, 0, width, height);
// imageData.data: Uint8ClampedArray，长度 = width * height * 4
```

**存储顺序**（行优先）：
```
像素(0,0): [R0, G0, B0, A0]
像素(1,0): [R1, G1, B1, A1]
像素(2,0): [R2, G2, B2, A2]
...
像素(0,1): [Rw, Gw, Bw, Aw]
```

**坐标到索引的转换**：
```typescript
function getPixelIndex(x, y, width) {
  return (y * width + x) * 4;
}

// 读取像素
const idx = getPixelIndex(10, 20, width);
const r = imageData.data[idx];
const g = imageData.data[idx + 1];
const b = imageData.data[idx + 2];
const a = imageData.data[idx + 3];

// 写入像素
imageData.data[idx] = 255;      // R
imageData.data[idx + 1] = 0;    // G
imageData.data[idx + 2] = 0;    // B
imageData.data[idx + 3] = 255;  // A
```

### 9.2 混合模式详解

#### source-over（默认）

```
alpha_out = alpha_source + alpha_dest * (1 - alpha_source)
color_out = (color_source * alpha_source + color_dest * alpha_dest * (1 - alpha_source)) / alpha_out
```

**示例**：
```
目标：RGBA(100, 100, 100, 0.5)
源：  RGBA(255, 0, 0, 0.8)

alpha_out = 0.8 + 0.5 * (1 - 0.8) = 0.9
R_out = (255*0.8 + 100*0.5*0.2) / 0.9 = 237
结果：RGBA(237, 11, 11, 0.9)
```

#### destination-out（擦除）

```
alpha_out = alpha_dest * (1 - alpha_source)
color_out = color_dest
```

**示例**：
```
目标：RGBA(100, 100, 100, 0.8)
源：  RGBA(任意, 任意, 任意, 1.0)

alpha_out = 0.8 * (1 - 1.0) = 0
结果：完全透明
```

#### source-in（遮罩）

```
alpha_out = alpha_source * alpha_dest
color_out = color_source
```

**应用**：实现抠图
```typescript
// 1. 绘制mask（白色=前景，黑色=背景）
      ctx.drawImage(maskCanvas, 0, 0);

// 2. 使用source-in混合原图
ctx.globalCompositeOperation = 'source-in';
ctx.drawImage(originalImage, 0, 0);

// 结果：只保留mask白色区域的原图内容
```

### 9.3 坐标变换原理

#### 变换矩阵

Canvas的变换使用3×3矩阵：
```
[a  c  e]   [x]   [a*x + c*y + e]
[b  d  f] × [y] = [b*x + d*y + f]
[0  0  1]   [1]   [1]
```

- `a, d`：缩放
- `b, c`：倾斜/旋转
- `e, f`：平移

#### 旋转90度

```typescript
ctx.rotate(-90 * Math.PI / 180);
// 对应矩阵：
// [cos(-90)  -sin(-90)  0]   [0   1  0]
// [sin(-90)   cos(-90)  0] = [-1  0  0]
// [0          0         1]   [0   0  1]
```

变换效果：
```
(x, y) → (y, -x)
```

#### 翻转 + 旋转

```typescript
ctx.scale(1, -1);     // Y轴翻转
ctx.rotate(-90°);     // 旋转90度

// 组合矩阵：
// [1   0  0]   [0   1  0]   [0   1  0]
// [0  -1  0] × [-1  0  0] = [1   0  0]
// [0   0  1]   [0   0  1]   [0   0  1]
```

变换效果：
```
(x, y) → (y, x)
```

这正是RLE解码时需要的坐标转换！

### 9.4 性能优化原理

#### 离屏Canvas

```typescript
// ❌ 直接操作可见Canvas（慢）
for (let i = 0; i < 100; i++) {
  visibleCtx.fillRect(...);  // 每次都触发重绘
}

// ✅ 先在离屏Canvas操作（快）
const offscreen = document.createElement('canvas');
const offCtx = offscreen.getContext('2d');

for (let i = 0; i < 100; i++) {
  offCtx.fillRect(...);  // 不触发重绘
}

visibleCtx.drawImage(offscreen, 0, 0);  // 一次性绘制
```

#### willReadFrequently选项

```typescript
// 如果频繁读取像素
const ctx = canvas.getContext('2d', {
  willReadFrequently: true  // 优化getImageData性能
});
```

浏览器会：
- 在CPU内存保留一份像素数据副本
- 避免频繁的GPU→CPU传输

#### ImageBitmap

```typescript
// 普通Image（解码是同步的，可能阻塞）
const img = new Image();
img.src = url;
img.onload = () => {
  ctx.drawImage(img, 0, 0);  // 可能很慢
};

// ImageBitmap（异步解码）
const blob = await fetch(url).then(r => r.blob());
const bitmap = await createImageBitmap(blob);
ctx.drawImage(bitmap, 0, 0);  // 更快
```

---

# 第五部分：实战进阶

## 第十章：性能优化实战

### 10.1 加载性能优化

#### 模型预加载

```typescript
class AppInitializer {
  async init() {
    // 并行加载
    await Promise.all([
      this.preloadSamModel(),
      this.preloadCommonImages(),
      this.warmupCanvas()
    ]);
  }
  
  private async preloadSamModel() {
    const modelUrl = 'https://cdn.com/sam_decoder.onnx';
    await OnnxModelService.getModel({ onnxUrl: modelUrl });
    console.log('SAM模型已预加载');
  }
  
  private async preloadCommonImages() {
    // 预加载常用图标、纹理等
    const urls = ['icon1.png', 'icon2.png'];
    await Promise.all(urls.map(url => this.loadImage(url)));
  }
  
  private async warmupCanvas() {
    // 创建一个小Canvas，触发浏览器初始化Canvas环境
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    canvas.getContext('2d');
  }
}
```

#### Service Worker缓存

```typescript
// sw.js
const CACHE_NAME = 'sam-v1';
const urlsToCache = [
  '/sam_decoder.onnx',
  '/sam_encoder_wasm.wasm'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 10.2 运行时性能优化

#### Web Worker卸载计算

```typescript
// main.js
const worker = new Worker('sam-worker.js');

worker.postMessage({
  type: 'decode_rle',
  rle: { counts: [...], size: [1024, 768] }
});

worker.onmessage = (e) => {
  const { maskData } = e.data;
  // 使用解码后的数据
};

// sam-worker.js
self.onmessage = (e) => {
  const { type, rle } = e.data;
  
  if (type === 'decode_rle') {
    const maskData = decodeRLE(rle);
    self.postMessage({ maskData }, [maskData.buffer]);  // 转移所有权
  }
};
```

#### 对象池模式

```typescript
class CanvasPool {
  private pool: HTMLCanvasElement[] = [];
  private inUse = new Set<HTMLCanvasElement>();
  
  acquire(width: number, height: number): HTMLCanvasElement {
    let canvas = this.pool.pop();
    
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    
    canvas.width = width;
    canvas.height = height;
    this.inUse.add(canvas);
    
    return canvas;
  }
  
  release(canvas: HTMLCanvasElement) {
    if (this.inUse.has(canvas)) {
      this.inUse.delete(canvas);
      
      // 清空内容
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 限制池大小
      if (this.pool.length < 10) {
        this.pool.push(canvas);
      } else {
        canvas.width = canvas.height = 1;  // 释放内存
      }
    }
  }
}
```

### 10.3 内存优化

#### 及时释放资源

```typescript
class MaskEditor {
  private currentModel: AutoMaskModel | null = null;
  
  async loadImage(url: string) {
    // 释放旧模型
    if (this.currentModel) {
      this.currentModel.release();
      this.currentModel = null;
    }
    
    // 创建新模型
    this.currentModel = await factory.createAutoMaskModel(url);
  }
  
  destroy() {
    this.currentModel?.release();
    this.currentModel = null;
  }
}
```

#### 内存泄漏检测

```typescript
class MemoryMonitor {
  private baseline: number = 0;
  
  start() {
    if (performance.memory) {
      this.baseline = performance.memory.usedJSHeapSize;
    }
  }
  
  check(label: string) {
    if (performance.memory) {
      const current = performance.memory.usedJSHeapSize;
      const diff = (current - this.baseline) / 1024 / 1024;
      console.log(`${label}: ${diff.toFixed(2)}MB`);
      
      if (diff > 500) {
        console.warn('⚠️ 内存增长异常！');
      }
    }
  }
}

// 使用
const monitor = new MemoryMonitor();
monitor.start();

await model.loadImage(url1);
monitor.check('加载图片1');

await model.loadImage(url2);
monitor.check('加载图片2');  // 应该接近图片1的内存
```

---

## 第十一章：常见问题解决

### 11.1 坐标系问题

**问题**：点击位置不准确

**原因**：屏幕坐标 ≠ Canvas坐标 ≠ 原图坐标

**解决方案**：
```typescript
function getImageCoordinates(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement
): [number, number] {
  
  // 1. 获取Canvas边界
  const rect = canvas.getBoundingClientRect();
  
  // 2. 屏幕坐标 → Canvas坐标
  const canvasX = event.clientX - rect.left;
  const canvasY = event.clientY - rect.top;
  
  // 3. Canvas坐标 → 原图坐标
  const scaleX = image.naturalWidth / canvas.width;
  const scaleY = image.naturalHeight / canvas.height;
  
  const imageX = canvasX * scaleX;
  const imageY = canvasY * scaleY;
  
  return [imageX, imageY];
}
```

### 11.2 跨域问题

**问题**：`getImageData` 报错 "Tainted canvases may not be exported"

**原因**：图片跨域，Canvas被污染

**解决方案1**：服务器配置CORS
```nginx
add_header Access-Control-Allow-Origin "*";
```

**解决方案2**：使用代理
```typescript
function getProxiedUrl(url: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

// 后端实现
app.get('/api/image-proxy', async (req, res) => {
  const url = req.query.url;
  const response = await fetch(url);
  const buffer = await response.buffer();
  res.set('Access-Control-Allow-Origin', '*');
  res.send(buffer);
});
```

### 11.3 浏览器兼容性

**检测支持**：
```typescript
function checkBrowserSupport(): {
  supported: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  
  // 检测BigInt64Array
  if (typeof BigInt64Array === 'undefined') {
    missing.push('BigInt64Array');
  }
  
  // 检测Canvas
  const canvas = document.createElement('canvas');
  if (!canvas.getContext) {
    missing.push('Canvas');
  }
  
  // 检测WebAssembly
  if (typeof WebAssembly === 'undefined') {
    missing.push('WebAssembly');
  }
  
  return {
    supported: missing.length === 0,
    missing
  };
}

// 使用
const { supported, missing } = checkBrowserSupport();
if (!supported) {
  alert(`您的浏览器不支持：${missing.join(', ')}`);
}
```

---

## 结语

### 你学到了什么？

通过这份文档，你应该掌握了：

**使用层面**：
- ✅ 如何快速集成@lego/sam
- ✅ 如何处理用户交互
- ✅ 如何导出和使用结果

**数据层面**：
- ✅ 后端返回的数据结构
- ✅ 每个阶段的数据变换
- ✅ RLE、Embedding、Tensor的含义

**实现层面**：
- ✅ RLE解码算法
- ✅ 颜色ID拾取系统
- ✅ Canvas图层合成
- ✅ ONNX推理流程

**原理层面**：
- ✅ SAM模型的三层架构
- ✅ Canvas图像处理原理
- ✅ 坐标变换数学基础

### 下一步学习建议

1. **动手实践**：创建一个简单的图片编辑器
2. **阅读源码**：深入理解每个细节
3. **性能调优**：针对实际场景优化
4. **扩展功能**：添加更多编辑能力

### 参考资源

- **SAM论文**：https://arxiv.org/abs/2304.02643
- **ONNX Runtime**：https://onnxruntime.ai/docs/tutorials/web/
- **Canvas API**：https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

**文档版本**：v2.0  
**最后更新**：2026-01-19  
**作者**：资深前端专家 & 大模型技术讲师  
**适用于**：@lego/sam v1.1.1+

