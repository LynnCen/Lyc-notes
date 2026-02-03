# AI改图功能：主体选择、套索、画笔实现详解

## 📚 教学大纲

本教程将循序渐进地讲解AI改图功能中三个核心工具的实现原理：

1. **主体选择**（基于SAM的智能选区）
2. **套索工具**（自由路径选区）
3. **画笔工具**（手绘蒙版）

---

## 一、整体架构：理解设计思路

### 1.1 核心设计理念

AI改图功能的核心是**生成蒙版（Mask）**，用于告诉AI模型"哪些区域需要修改"。

```
用户操作 → 生成蒙版 → AI处理 → 返回结果
```

### 1.2 代码组织架构

**核心文件路径：**

```
domains/editor/packages/common/drawing-masks/src/hooks/
├── use-draw-masks.ts      # 主控制器，整合所有工具
├── use-auto-masks.ts      # 主体选择（SAM）
├── use-lasso-masks.ts     # 套索工具
└── use-brush-masks.ts     # 画笔工具
```

**UI入口：**

```
domains/editor/packages/ai/plugins/src/plugins/ai-painting-editor/
├── toolbar/components/toolbar.vue    # 工具栏UI
└── ai-editor/index.vue              # 编辑器主组件
```

### 1.3 双Canvas设计

系统使用**两个Canvas**分离关注点：

```typescript
// use-draw-masks.ts (核心架构)
const maskCanvas = ref<HTMLCanvasElement>(); // 负责渲染蒙版（最终结果）
const selectionCanvas = ref<HTMLCanvasElement>(); // 负责交互预览（临时效果）
```

**设计优势：**

- `maskCanvas`：存储用户最终确定的蒙版数据
- `selectionCanvas`：实时显示用户操作过程中的预览效果
- 分离后可以独立优化渲染性能

---

## 二、主体选择：SAM智能选区

### 2.1 核心思想

**主体选择**基于Meta的SAM（Segment Anything Model）模型，实现"点击即选"的智能体验。

**工作流程：**

```
1. 用户点击图片 →
2. 后端生成多个候选mask →
3. 前端显示可选项 →
4. 用户点击确认 →
5. 生成最终蒙版
```

### 2.2 关键代码路径

**文件：** `domains/editor/packages/common/drawing-masks/src/hooks/use-auto-masks.ts`

### 2.3 核心实现解析

#### 步骤1：初始化SAM模型

```typescript
// use-auto-masks.ts (39-55行)
const initFactory = async () => {
  if (_factory) return _factory;

  const { SamFactory } = await getLegoSam(); // 动态加载SAM库
  _factory = SamFactory.getInstance({
    axiosInstance: options.axiosInstance,
    loadImage: async (url: string) => {
      const image = await resourceManager.loadImage(url);
      return image;
    },
    onnxUrl: '',
  });
  return _factory;
};
```

**要点：**

- 使用单例模式，避免重复初始化
- 动态加载减少首屏体积
- 通过`resourceManager`统一管理图片资源

#### 步骤2：获取自动mask数据

```typescript
// use-auto-masks.ts (60-115行)
function getAutoMaskModel(): AutoMaskModel | null {
  if (!enabled.value) return null;

  // 调用后端API获取自动mask
  const _getAutoMasks = async (_url: string) => {
    const res: IAutoMask[] = await initFactory().then((factory) =>
      factory.apiService.autoMasks(
        ossUrl(_url, {
          width: 3000,
          height: 3000,
          useDpr: false,
          forcePngResize: true,
        }),
      ),
    );
    return res;
  };

  // 创建AutoMaskModel
  return initFactory().then((factory) => factory.createAutoMaskModel(url, data));
}
```

**后端返回的数据结构：**

```typescript
interface IAutoMask {
  id: string; // mask唯一标识
  bbox: [x, y, w, h]; // 边界框
  area: number; // 面积
  stability_score: number; // 稳定性分数
  mask_data: Uint8Array; // 二值mask数据
}
```

#### 步骤3：鼠标悬停预览

```typescript
// use-auto-masks.ts (117-141行)
function handleHoverMask(e: MouseEvent) {
  const autoMaskModel = getAutoMaskModel();
  if (!enabled.value || !autoMaskModel) return;

  // 转换屏幕坐标到图像坐标
  const { x, y } = pointFormEvent(e, {
    width: autoMaskModel.getSourceImage().naturalWidth,
    height: autoMaskModel.getSourceImage().naturalHeight,
  });

  // 根据坐标拾取对应的mask层
  const layer = autoMaskModel.pickLayer(x, y);

  // 在selectionCanvas上绘制边框高亮
  if (ctx && layer) {
    addBorderToCanvas(layer.maskCanvas, hoverCanvasRef.value!, {
      borderWidth: 2 * pixelRatio.value,
      borderColor: AUTO_MASK_HOVER_BORDER_COLOR, // 青色边框
    });
  }
}
```

**核心方法：`pickLayer(x, y)`**

- 遍历所有mask层，找到包含该坐标的层
- 使用Canvas的`isPointInPath`或像素检测
- 返回最上层的mask（支持重叠）

#### 步骤4：点击选中/取消

```typescript
// use-auto-masks.ts (143-156行)
function handlePickMask(e: MouseEvent) {
  const autoMaskModel = getAutoMaskModel();
  if (!enabled.value || !autoMaskModel) return;

  const { x, y } = pointFormEvent(e, {
    width: autoMaskModel.getSourceImage().naturalWidth,
    height: autoMaskModel.getSourceImage().naturalHeight,
  });

  // 切换layer的选中状态（toggle）
  autoMaskModel.toggleLayerMode(x, y);

  // 获取合并后的mask结果
  const maskResult = autoMaskModel.getMaskResult();

  // 通知外部更新maskCanvas
  options.maskResultChange?.(maskResult?.getMask(AUTO_MASK_COLOR) || null, getSnapshot());
}
```

**关键方法：`toggleLayerMode(x, y)`**

```typescript
// 伪代码逻辑
toggleLayerMode(x, y) {
    const layer = this.pickLayer(x, y);
    if (layer) {
        if (this.selectedLayers.has(layer.id)) {
            this.selectedLayers.delete(layer.id);  // 取消选中
        } else {
            this.selectedLayers.add(layer.id);      // 选中
        }
    }
}

getMaskResult() {
    // 合并所有选中的mask层
    const canvas = createCanvas(width, height);
    this.selectedLayers.forEach(layerId => {
        const layer = this.layers.find(l => l.id === layerId);
        canvas.drawImage(layer.maskCanvas, 0, 0);
    });
    return canvas;
}
```

### 2.4 技术要点总结

1. **坐标转换**：屏幕坐标 → 图像坐标（考虑缩放、偏移）
2. **层级管理**：支持多个mask叠加，点击切换选中状态
3. **性能优化**：使用`jsonMap`缓存mask数据，避免重复请求
4. **交互反馈**：悬停显示边框，点击立即更新蒙版

---

## 三、套索工具：自由路径选区

### 3.1 核心思想

**套索工具**允许用户自由绘制闭合路径，形成选区。

**工作流程：**

```
1. 鼠标按下 → 开始记录路径点
2. 鼠标移动 → 实时绘制虚线路径
3. 鼠标抬起 → 闭合路径，生成蒙版
```

### 3.2 关键代码路径

**文件：** `domains/editor/packages/common/drawing-masks/src/hooks/use-lasso-masks.ts`

### 3.3 核心实现解析

#### 步骤1：路径点收集

```typescript
// use-lasso-masks.ts (26-30行)
const points = ref<Point[]>([]); // 存储路径点数组

const onMouseDown = () => {
  if (!enabled.value) return;
  points.value = []; // 清空之前的路点
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
```

#### 步骤2：实时路径绘制

```typescript
// use-lasso-masks.ts (78-90行)
const onMouseMove = throttle((e: MouseEvent) => {
  if (!enabled.value || !selectionCanvas.value) return;

  // 获取canvas坐标（考虑变换）
  transform = transform ?? getCanvasTransform(selectionCanvas.value);
  const { x, y } = getCanvasOffsetPoint(selectionCanvas.value, e, transform);

  // 添加路径点
  points.value.push({ x, y });

  // 实时绘制预览（虚线效果）
  drawLasso();
}, 1000 / 30); // 30fps节流
```

**关键：坐标转换**

```typescript
// 需要考虑canvas的变换（旋转、缩放、偏移）
getCanvasOffsetPoint(canvas, event, transform) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    // 应用变换矩阵
    if (transform) {
        // 逆变换计算
        return applyInverseTransform(x, y, transform);
    }
    return { x, y };
}
```

#### 步骤3：路径平滑处理

```typescript
// use-lasso-masks.ts (32-42行)
const _drawLasso = () => {
  const ctx = selectionCanvas.value!.getContext('2d')!;
  if (points.value.length < 2) return;

  // 使用二次贝塞尔曲线平滑路径
  const path = createSmoothPathWithQuadratic(points.value);
  if (path) {
    const path2d = new Path2D(path);
    ctx.stroke(path2d);
  }
};
```

**路径平滑算法：**

```typescript
// 伪代码：二次贝塞尔曲线插值
createSmoothPathWithQuadratic(points) {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        // 使用前一个点和当前点作为控制点
        path += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
    }

    return path;
}
```

#### 步骤4：虚线效果实现

```typescript
// use-lasso-masks.ts (44-75行)
const drawLasso = (closed = false) => {
  const ctx = selectionCanvas.value.getContext('2d')!;
  ctx.clearRect(0, 0, selectionCanvas.value.width, selectionCanvas.value.height);

  if (closed) {
    // 闭合路径：实线
    _drawLasso();
    ctx.closePath();
  } else {
    // 绘制中：双层虚线（白色+青色）
    ctx.save();
    ctx.setLineDash([4, 8]); // 虚线样式
    ctx.lineDashOffset = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; // 白色底层
    _drawLasso();
    ctx.restore();

    ctx.save();
    ctx.setLineDash([8, 4]);
    ctx.strokeStyle = '#33C8E6'; // 青色顶层
    _drawLasso();
    ctx.restore();
  }
};
```

**视觉效果：**

- 双层虚线叠加，形成动态效果
- 白色底层提供对比度
- 青色顶层突出路径

#### 步骤5：生成最终蒙版

```typescript
// use-lasso-masks.ts (92-106行)
const onMouseUp = () => {
  if (!enabled.value) return;
  onMouseMove.cancel();
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);

  drawLasso(true); // 绘制闭合路径

  if (points.value.length > 2) {
    // 通知父组件更新mask
    change(points.value);
  }

  // 清空selectionCanvas（预览完成）
  ctx.clearRect(0, 0, selectionCanvas.value.width, selectionCanvas.value.height);
};
```

**蒙版生成逻辑：**

```typescript
// use-draw-masks.ts (181-222行)
function updateMaskDataByPoints(points: Point[]) {
  // 1. 坐标转换：canvas坐标 → 图像坐标
  points = points.map((p) => getImageCoordinate(p, canvasSize, imageSize));

  // 2. 添加到maskData数组
  maskData.value = maskData.value.concat([
    {
      points, // 路径点数组
      lineSizeScale: scale, // 线宽缩放
      drawParams: { ...drawParams.value, type: 'lasso' },
    },
  ]);

  // 3. 重新渲染maskCanvas
  initRenderCanvas();
}
```

### 3.4 技术要点总结

1. **路径平滑**：使用贝塞尔曲线，避免锯齿感
2. **实时预览**：在`selectionCanvas`上绘制，不影响`maskCanvas`
3. **坐标转换**：考虑canvas变换矩阵，确保路径准确
4. **性能优化**：使用`throttle`限制绘制频率（30fps）

---

## 四、画笔工具：手绘蒙版

### 4.1 核心思想

**画笔工具**模拟真实画笔，通过连续的笔触生成蒙版。

**工作流程：**

```
1. 鼠标按下 → 开始一笔
2. 鼠标移动 → 连续绘制笔触
3. 鼠标抬起 → 完成一笔，合并到maskCanvas
```

### 4.2 关键代码路径

**文件：** `domains/editor/packages/common/drawing-masks/src/hooks/use-brush-masks.ts`

### 4.3 核心实现解析

#### 步骤1：笔触缓存机制

```typescript
// use-brush-masks.ts (89-103行)
const cacheMaskCanvas = createCanvas(); // 离屏canvas缓存

const onMouseDown = (e: MouseEvent) => {
  if (!enabled.value) return;

  // 记录起始点
  points.value = [{ x: e.offsetX, y: e.offsetY }];

  // 缓存当前maskCanvas状态
  cacheMaskCanvas.width = maskCanvas.value!.width;
  cacheMaskCanvas.height = maskCanvas.value!.height;
  cacheMaskCanvas
    .getContext('2d')!
    .drawImage(maskCanvas.value!, 0, 0, maskCanvas.value!.width, maskCanvas.value!.height);

  drawBrush(); // 开始绘制
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
```

**为什么需要缓存？**

- 每次绘制都要基于之前的状态
- 避免重复绘制整个maskCanvas（性能优化）
- 支持撤销单笔操作

#### 步骤2：连续笔触绘制

```typescript
// use-brush-masks.ts (60-77行)
const onMouseMove = throttle((e: MouseEvent) => {
  if (!enabled.value || !selectionCanvas.value) return;

  transform = transform ?? getCanvasTransform(selectionCanvas.value);
  const { x, y } = getCanvasOffsetPoint(selectionCanvas.value, e, transform);

  // 过滤重复点（距离<1px）
  if (
    Math.abs(x - points.value[points.value.length - 1].x) < 1 &&
    Math.abs(y - points.value[points.value.length - 1].y) < 1
  ) {
    return;
  }

  points.value.push({ x, y });
  drawBrush(); // 实时绘制
}, 1000 / 60); // 60fps（比套索更流畅）
```

**关键优化：**

- 过滤重复点，减少不必要的绘制
- 60fps节流，保证流畅度
- 使用`throttle`而非`debounce`，确保连续性

#### 步骤3：笔触渲染逻辑

```typescript
// use-brush-masks.ts (36-58行)
const drawBrush = () => {
  if (!selectionCanvas.value || points.value.length === 0 || !enabled.value) return;

  const ctx = maskCanvas.value!.getContext('2d')!;

  // 1. 清空maskCanvas
  ctx.clearRect(0, 0, maskCanvas.value!.width, maskCanvas.value!.height);

  // 2. 恢复缓存状态（之前的所有笔触）
  ctx.drawImage(cacheMaskCanvas, 0, 0, maskCanvas.value!.width, maskCanvas.value!.height);

  // 3. 绘制当前笔触
  ctx.save();
  ctx.scale(pixelRatio.value, pixelRatio.value);
  initStyle(ctx); // 设置画笔样式

  // 4. 区分画笔和橡皮擦
  if (currentType.value === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'; // 擦除模式
  } else {
    ctx.globalCompositeOperation = 'source-over'; // 叠加模式
  }

  // 5. 使用平滑路径绘制
  const path2d = new Path2D(
    createSmoothPathWithQuadratic(
      points.value.length === 1
        ? [points.value[0], points.value[0]] // 单点也要绘制
        : points.value,
      false,
    ),
  );
  ctx.stroke(path2d);
  ctx.restore();
};
```

**关键：混合模式（Blend Mode）**

```typescript
// 画笔：source-over（正常叠加）
ctx.globalCompositeOperation = 'source-over';
// 效果：新笔触覆盖在旧笔触上

// 橡皮擦：destination-out（擦除）
ctx.globalCompositeOperation = 'destination-out';
// 效果：新笔触擦除旧笔触（alpha通道）
```

#### 步骤4：完成笔触并合并

```typescript
// use-brush-masks.ts (79-87行)
const onMouseUp = () => {
  if (!enabled.value) return;
  onMouseMove.cancel();

  // 清空缓存（笔触已完成）
  cleanCanvas(cacheMaskCanvas);

  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  transform = undefined;

  // 通知父组件：将当前笔触添加到maskData
  change(points.value);
};
```

**数据持久化：**

```typescript
// use-draw-masks.ts (181-222行)
function updateMaskDataByPoints(points: Point[]) {
  // 坐标转换
  points = points.map((p) => getImageCoordinate(p, canvasSize, imageSize));

  // 添加到maskData（支持多笔叠加）
  maskData.value = maskData.value.concat([
    {
      points,
      lineSizeScale: scale,
      drawParams: { ...drawParams.value, type: 'brush' },
    },
  ]);

  // 重新渲染（合并所有笔触）
  initRenderCanvas();
}
```

### 4.4 画笔样式配置

```typescript
// use-draw-masks.ts (408-420行)
function initStyle(ctx: CanvasRenderingContext2D, style?: Style) {
  ctx.strokeStyle = style?.strokeStyle || DEFAULT_BRUSH_COLOR; // 默认青色
  ctx.fillStyle = style?.fillStyle || DEFAULT_BRUSH_COLOR;
  ctx.lineCap = 'round'; // 圆形笔头
  ctx.lineJoin = 'round'; // 圆角连接
  ctx.lineWidth = drawParams.value.size; // 可调节粗细（1-200px）
}
```

**样式参数：**

- `lineCap: 'round'` - 笔头圆形，更自然
- `lineJoin: 'round'` - 转角圆滑
- `lineWidth` - 从工具栏滑块控制（1-200px）

### 4.5 技术要点总结

1. **缓存机制**：使用离屏canvas缓存，避免重复绘制
2. **混合模式**：`source-over`（画笔）vs `destination-out`（橡皮擦）
3. **路径平滑**：贝塞尔曲线连接点，避免锯齿
4. **性能优化**：60fps节流，过滤重复点

---

## 五、统一渲染：maskCanvas的合成逻辑

### 5.1 核心方法

**文件：** `domains/editor/packages/common/drawing-masks/src/hooks/use-draw-masks.ts`

### 5.2 渲染流程

```typescript
// use-draw-masks.ts (320-405行)
function renderMaskData(
  ctx?: CanvasRenderingContext2D,
  isExport = false,
  renderData = maskData.value,
) {
  ctx = ctx || maskCanvas.value!.getContext('2d')!;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // 遍历所有mask数据项
  for (const item of renderData) {
    const { points, lineSizeScale, drawParams, sourceImage } = item;

    ctx.save();

    if (points && lineSizeScale) {
      // 路径类蒙版（套索、画笔）
      ctx.scale(pixelRatio, pixelRatio);
      ctx.lineWidth = item.drawParams.size * scale;
      ctx.globalCompositeOperation = getBlendMode(item.drawParams.type);

      // 坐标转换：图像坐标 → canvas坐标
      points = points.map((point) => getCanvasCoordinate(point, canvasSize, imageSize));

      // 创建平滑路径
      const path2d = new Path2D(
        createSmoothPathWithQuadratic(points.length === 1 ? [points[0], points[0]] : points),
      );

      if (drawParams.type === 'lasso') {
        // 套索：填充闭合路径
        ctx.closePath();
        ctx.fill(path2d);
      } else {
        // 画笔：描边路径
        ctx.stroke(path2d);
      }
    } else if (sourceImage) {
      // 图像类蒙版（主体选择）
      if (typeof ctx.fillStyle === 'string') {
        // 应用颜色（用于预览）
        const colorCanvas = colorizeCanvas(sourceImage, ctx.fillStyle);
        ctx.drawImage(colorCanvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
      } else {
        // 直接绘制mask图像
        ctx.drawImage(sourceImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }

    ctx.restore();
  }
}
```

### 5.3 混合模式映射

```typescript
// use-brush-masks.ts (105-107行)
const getBlendMode = (type: string) => {
  return type === 'eraser' ? 'destination-out' : 'source-over';
};
```

**混合模式说明：**

- `source-over`：正常叠加（画笔、套索）
- `destination-out`：擦除模式（橡皮擦）

### 5.4 导出蒙版（AI处理前）

```typescript
// use-draw-masks.ts (445-469行)
function exportCanvas(
  targetWidth: number = imageParams.value.imageWidth,
  targetHeight: number = imageParams.value.imageHeight,
  backgroundColor = 'black', // AI需要黑底
  fillColor = '#fff', // 白色蒙版
) {
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d')!;

  // 设置白色填充
  ctx.strokeStyle = fillColor;
  ctx.fillStyle = fillColor;

  // 渲染所有mask数据
  renderMaskData(ctx, true);

  // 创建黑底canvas
  const bgCanvas = createCanvas(targetWidth, targetHeight);
  const bgCtx = bgCanvas.getContext('2d')!;
  bgCtx.fillStyle = backgroundColor;
  bgCtx.fillRect(0, 0, canvas.width, canvas.height);
  bgCtx.drawImage(canvas, 0, 0); // 叠加白色蒙版

  return bgCanvas; // 返回：黑底白mask
}
```

**为什么是黑底白mask？**

- AI模型（如Stable Diffusion）的标准输入格式
- 黑色=不处理，白色=需要处理
- 便于模型理解蒙版区域

---

## 六、完整交互流程

### 6.1 用户操作流程

```
1. 用户点击"AI改图"按钮
   ↓
2. 打开编辑器，显示工具栏
   ↓
3. 用户选择工具：
   - 主体选择：点击图片，选择区域
   - 套索：绘制闭合路径
   - 画笔：手绘蒙版
   ↓
4. 实时预览在selectionCanvas上显示
   ↓
5. 用户确认后，更新maskCanvas
   ↓
6. 点击"生成"按钮
   ↓
7. 导出mask（黑底白mask）
   ↓
8. 调用AI API（图片+mask+提示词）
   ↓
9. 返回结果，替换原图
```

### 6.2 数据流转

```typescript
// 1. 用户操作 → 生成points数组
points: [{x, y}, {x, y}, ...]

// 2. 坐标转换 → 图像坐标
imagePoints: [{x, y}, {x, y}, ...]  // 归一化到图像尺寸

// 3. 添加到maskData
maskData = [
    { points: imagePoints, drawParams: {...}, type: 'lasso' },
    { points: imagePoints, drawParams: {...}, type: 'brush' },
    { sourceImage: canvas, autoMaskModelSnapshot: [...] },  // SAM结果
]

// 4. 渲染到maskCanvas
renderMaskData() → maskCanvas

// 5. 导出为AI格式
exportCanvas() → 黑底白mask (PNG/Blob)
```

---

## 七、关键技术总结

### 7.1 坐标系统

**三层坐标转换：**

1. **屏幕坐标**：`event.clientX/Y`（鼠标位置）
2. **Canvas坐标**：考虑DOM尺寸和pixelRatio
3. **图像坐标**：归一化到原始图像尺寸

**转换函数：**

```typescript
// 屏幕 → Canvas
getCanvasOffsetPoint(canvas, event, transform);

// Canvas → 图像
getImageCoordinate(point, canvasSize, imageSize);

// 图像 → Canvas（渲染时）
getCanvasCoordinate(point, canvasSize, imageSize);
```

### 7.2 性能优化策略

1. **节流控制**：套索30fps，画笔60fps
2. **缓存机制**：画笔使用离屏canvas缓存
3. **按需渲染**：只在`maskCanvas`上渲染最终结果
4. **数据复用**：SAM结果缓存，避免重复请求

### 7.3 交互体验优化

1. **实时预览**：`selectionCanvas`提供即时反馈
2. **路径平滑**：贝塞尔曲线消除锯齿
3. **视觉反馈**：悬停高亮、虚线动画
4. **撤销支持**：每笔独立，可单独撤销

---

## 八、扩展思考

### 8.1 如何添加新工具？

1. 创建新的hook（如`use-magic-wand-masks.ts`）
2. 在`use-draw-masks.ts`中集成
3. 在`toolbar.vue`中添加UI按钮
4. 实现`change`回调，更新`maskData`

### 8.2 如何优化性能？

1. **Web Worker**：将复杂计算移到Worker
2. **Canvas分层**：使用多个Canvas分层渲染
3. **增量更新**：只重绘变化区域
4. **GPU加速**：使用WebGL渲染

### 8.3 如何支持移动端？

1. **触摸事件**：`touchstart/touchmove/touchend`
2. **手势识别**：区分点击、拖拽、缩放
3. **响应式设计**：适配不同屏幕尺寸
4. **性能降级**：低端设备降低fps

---

## 📖 学习路径建议

1. **理解架构**：先看`use-draw-masks.ts`的整体设计
2. **深入工具**：逐个学习三个工具的实现
3. **实践调试**：在浏览器中打断点，观察数据流
4. **扩展功能**：尝试添加新工具或优化现有功能

---

**文档版本**：v1.0  
**最后更新**：2026-01-15  
**适用对象**：前端开发、AI应用开发者
