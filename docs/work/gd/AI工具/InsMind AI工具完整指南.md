# InsMind AI工具完整指南

> **文档说明：** 本文档详细介绍InsMind项目中的所有AI工具，包括工具功能、技术实现、应用场景等完整信息。

## 📚 目录

1. [工具分类概览](#一工具分类概览)
2. [AI生成类工具](#二ai生成类工具)
3. [AI图像处理工具](#三ai图像处理工具)
4. [AI视频工具](#四ai视频工具)
5. [基础编辑工具](#五基础编辑工具)
6. [技术架构](#六技术架构)
7. [商业化配置](#七商业化配置)

---

## 一、工具分类概览

### 1.1 工具总览

InsMind项目共包含**19个工具**，其中**12个AI工具**和**7个基础编辑工具**。

**工具统计：**

| 类别 | 数量 | 工具列表 |
|------|------|---------|
| **AI生成类** | 4个 | AI绘图、AI绘图通用、AI背景、AI视频 |
| **AI图像处理** | 6个 | 抠图、智能消除、AI扩图、涂抹替换、AI滤镜、AI变清晰 |
| **AI视频处理** | 2个 | AI视频生成、视频变清晰 |
| **基础编辑** | 7个 | 裁剪、调整大小、格式转换、压缩、换色、模板、做同款 |

### 1.2 工具类型枚举

```typescript
// apps/insmind/routes/(vue3)/services/editor/const/config.ts
export enum ToolType {
    // ============ AI工具（商业化） ============
    
    // AI生成类
    AiDraw = 'aiDraw',                    // AI绘图
    AiDrawGeneral = 'aiDrawGeneral',      // AI绘图通用
    AiBackground = 'aiBackground',        // AI背景
    AiVideoGeneral = 'aiVideo',           // AI视频
    
    // AI图像处理类
    Matting = 'matting',                  // 抠图
    MagicEraser = 'magicEraser',          // 智能消除
    OutPaintExpand = 'outPaintExpand',    // AI扩图
    AiReplace = 'aiReplace',              // 涂抹替换
    AiFilter = 'aiFilter',                // AI滤镜
    SuperResolution = 'superResolution',  // AI变清晰
    
    // AI视频处理类
    AiVideoInspiration = 'aiVideoInspiration',  // AI做同款视频
    AiVideoEnhance = 'aiVideoEnhance',          // 视频变清晰
    
    // ============ 基础工具（非商业化） ============
    
    Crop = 'crop',                        // 裁剪
    Resize = 'resize',                    // 尺寸调整
    Convert = 'convert',                  // 格式转换
    Compress = 'compress',                // 图片压缩
    ChangeColor = 'changeColor',          // 换色
    Template = 'template',                // 模版工具
    Inspiration = 'inspiration',          // 做同款工具
    
    // ============ 其他 ============
    
    Upload = 'upload',                    // 上传
}
```

---

## 二、AI生成类工具

### 2.1 AI绘图（AiDraw）

**功能描述：** 基于文本描述生成图像的AI工具

**核心特性：**

- ✨ 文本生成图像（Text-to-Image）
- 🎨 支持多种风格和场景
- 🔧 可调整生成参数（尺寸、风格强度等）
- 📦 批量生成支持

**技术实现：**

```
文件位置：
apps/insmind/routes/(vue3)/services/editor/editors/ai-draw/
├── services.ts          # 核心服务类
├── editor.vue           # 编辑器UI
├── index.vue            # 入口组件
└── components/          # UI组件
    ├── prompt-input.vue     # 提示词输入
    ├── style-selector.vue   # 风格选择器
    └── params-panel.vue     # 参数面板
```

**实现接口：**

```typescript
interface IAiDrawService extends IAiPipelineService {
    // 生成图像
    start(prompt: string, params: GenerationParams): Promise<void>;
    
    // 场景管理
    loadScenes(): Promise<IScene[]>;
    switchScene(sceneCode: string): void;
    
    // 参数配置
    setSize(width: number, height: number): void;
    setStyle(style: string): void;
}
```

**应用场景：**

- 🎨 创意设计：快速生成设计灵感
- 📸 社交媒体：生成吸引人的配图
- 🖼️ 艺术创作：辅助艺术家创作

**商业化配置：**

- 商业化类型：`BusinessType.generate`
- 消耗高斯币：是
- 水印支持：是

---

### 2.2 AI绘图通用（AiDrawGeneral）

**功能描述：** 更通用的AI绘图工具，支持更多生成模式

**核心特性：**

- 🎯 支持图生图（Image-to-Image）
- 🖌️ 支持局部重绘（Inpainting）
- 🔄 支持图像变体（Variation）
- 📐 更多尺寸和比例选项

**与AiDraw的区别：**

| 特性 | AiDraw | AiDrawGeneral |
|------|--------|---------------|
| 文生图 | ✅ | ✅ |
| 图生图 | ❌ | ✅ |
| 局部重绘 | ❌ | ✅ |
| 图像变体 | ❌ | ✅ |
| 场景数量 | 基础 | 丰富 |
| 参数配置 | 简化 | 完整 |

**技术实现：**

```typescript
// 支持多种生成策略
enum GenerationStrategy {
    TEXT_TO_IMAGE = 'text-to-image',
    IMAGE_TO_IMAGE = 'image-to-image',
    INPAINTING = 'inpainting',
    VARIATION = 'variation',
}

class AiDrawGeneralService {
    async generate(strategy: GenerationStrategy, params: any) {
        switch (strategy) {
            case GenerationStrategy.TEXT_TO_IMAGE:
                return this.textToImage(params);
            case GenerationStrategy.IMAGE_TO_IMAGE:
                return this.imageToImage(params);
            case GenerationStrategy.INPAINTING:
                return this.inpainting(params);
            case GenerationStrategy.VARIATION:
                return this.variation(params);
        }
    }
}
```

---

### 2.3 AI背景（AiBackground）

**功能描述：** 智能生成图像背景的AI工具

**核心特性：**

- 🎯 自动抠图+背景生成
- 🌈 多种背景风格（纯色、渐变、场景）
- 📦 商品摄影专用场景
- 🔍 智能主体识别和定位

**工作流程：**

```
用户上传图片
    ↓
自动抠图（SAM/Matting）
    ↓
主体识别与场景分类
    ↓
调整主体大小和位置
    ↓
AI生成背景
    ↓
合成最终图像
```

**技术实现：**

```typescript
// services.ts
class AiBackgroundService extends BaseEditorService implements IAiPipelineService {
    async start() {
        // 1. 抠图处理
        if (!isTransparentPixelRatioOverThreshold(originResult)) {
            this.mattingRes = await mattingImage(productImage);
        }
        
        // 2. 调整主体
        let resultCanvas = await this.adjustMainImage(
            mainResult,
            originResult,
            productImage,
        );
        
        // 3. 生成背景
        const { task } = executeAiPipeline(params);
        const res = await task();
        
        // 4. 返回结果
        this.aiBgResult = res.url;
    }
}
```

**应用场景：**

- 🛍️ 电商产品图：快速生成产品场景图
- 📸 人像摄影：更换人像背景
- 🎨 设计素材：为设计元素添加背景

**文件位置：**

```
ai-background/
├── services.ts          # 核心服务（753行）
├── editor.vue           # 编辑器UI
└── index.vue            # 入口组件
```

---

### 2.4 AI视频生成（AiVideoGeneral）

**功能描述：** 多模式AI视频生成工具

**支持的生成模式：**

#### 模式1：图生视频（Image-to-Video）

- 📸 静态图片转动态视频
- 🎬 添加动画效果
- ⏱️ 支持3-10秒时长

#### 模式2：文生视频（Text-to-Video）

- 📝 文本描述生成视频
- 🎨 支持多种风格
- 🎭 场景自动生成

#### 模式3：视频特效（Video-Effects）

- ✨ 为现有视频添加特效
- 🌟 滤镜和转场效果
- 🎪 动画叠加

#### 模式4：视频编辑（Video-Edit）

- ✂️ 智能剪辑
- 🔄 视频拼接
- 🎵 音频处理

**技术架构：**

```typescript
// 策略模式实现
interface VideoGenerationStrategy {
    validate(params: any): boolean;
    generate(params: any): Promise<VideoResult>;
}

class ImageToVideoStrategy implements VideoGenerationStrategy {
    async generate(params: ImageToVideoParams) {
        // 图生视频逻辑
    }
}

class TextToVideoStrategy implements VideoGenerationStrategy {
    async generate(params: TextToVideoParams) {
        // 文生视频逻辑
    }
}

// 服务类
class AiVideoGeneralService {
    private strategies: Map<VideoGenerationMode, VideoGenerationStrategy>;
    
    async generate(mode: VideoGenerationMode, params: any) {
        const strategy = this.strategies.get(mode);
        return strategy.generate(params);
    }
}
```

**文件结构：**

```
ai-video-general/
├── services/
│   ├── index.ts                          # 主服务类
│   └── strategies/
│       ├── image-to-video-strategy.ts    # 图生视频
│       ├── text-to-video-strategy.ts     # 文生视频
│       ├── video-edit-strategy.ts        # 视频编辑
│       └── video-effects-strategy.ts     # 视频特效
└── components/
    ├── ai-video.vue                      # 主组件
    ├── preview-video-edit.vue            # 预览组件
    └── ...（17个组件）
```

---

## 三、AI图像处理工具

### 3.1 抠图（Matting）

**功能描述：** 智能去除图像背景，提取主体

**核心特性：**

- 🎯 自动识别主体
- 🖼️ 高精度边缘处理
- 🎨 支持背景替换（纯色/渐变/图片）
- 📐 边缘优化和羽化

**技术实现：**

```typescript
// services.ts
class MattingService extends BaseEditorService {
    async matting() {
        // 调用@lego/matting-service
        const result = await legoMattingService.matting({
            url: this.imageUrl,
            type: 'auto',  // 自动抠图
        });
        
        // 处理结果
        this.mattingResult = result;
    }
    
    // 背景替换
    async changeBackground(background: IBackground) {
        if (background.type === 'color') {
            // 纯色背景
            this.applyColorBackground(background.color);
        } else if (background.type === 'gradient') {
            // 渐变背景
            this.applyGradientBackground(background.gradient);
        } else if (background.type === 'image') {
            // 图片背景
            this.applyImageBackground(background.imageUrl);
        }
    }
}
```

**应用场景：**

- 🛍️ 电商：商品图背景去除
- 📱 社交：证件照换背景
- 🎨 设计：素材提取

**集成的技术：**

- `@lego/matting-service`：抠图服务库
- SAM模型：主体识别
- 边缘优化算法：提升抠图质量

---

### 3.2 智能消除（MagicEraser）

**功能描述：** 智能擦除图像中不需要的对象

**核心特性：**

- 🖱️ 三种选择模式：
  - **画笔模式**：手动涂抹选择
  - **橡皮擦模式**：擦除选择区域
  - **智能点击**：基于SAM的智能选择
- 🎯 AI智能填充
- 🔄 支持撤销/重做
- 📝 可选文本提示词增强

**工作模式：**

```typescript
enum MaskType {
    Paint = 'paint',      // 画笔模式
    Erase = 'erase',      // 橡皮擦模式
    QuickSelect = 'quickSelect',  // 智能点击（SAM）
}

enum ActionModeEnum {
    Paint = 'paint',      // 笔刷模式：涂抹区域+提示词
    Dialogue = 'dialogue', // 对话模式：直接输入提示词
}
```

**技术实现：**

```typescript
// SelectionCanvas：智能选区
class SelectionCanvas extends BaseCanvas {
    // SAM智能选择
    drawHoverMask(x: number, y: number) {
        const layer = autoMaskModel.pickLayer(x, y);
        // 高亮显示
    }
    
    async toggleLayerMode(x: number, y: number) {
        autoMaskModel.toggleLayerMode(x, y);
        return maskResult?.getMask(AUTO_MASK_COLOR);
    }
}

// 画笔/橡皮擦
class PaintCanvas extends BaseCanvas {
    drawBrush(points: Point[]) {
        // 使用贝塞尔曲线平滑路径
        const path = createSmoothPathWithQuadratic(points);
        ctx.stroke(path);
    }
}
```

**应用场景：**

- 📸 修图：去除路人、杂物
- 🎨 设计：清理不需要的元素
- 📱 社交：美化照片

**文件结构：**

```
magic-eraser/
├── services/
│   ├── index.ts                    # 主服务（234行）
│   ├── canvas/
│   │   ├── selection.ts            # SAM智能选区（339行）
│   │   ├── paint.ts                # 画笔Canvas（188行）
│   │   └── base.ts                 # 基类（72行）
│   └── utils/
│       ├── mask.ts                 # 描边算法（434行）
│       ├── canvas.ts               # Canvas工具
│       └── color.ts                # 颜色配置
└── capability/
    └── ai-in-paint.ts              # AI填充能力（564行）
```

---

### 3.3 AI扩图（OutPaintExpand）

**功能描述：** 智能扩展图像边界，生成自然衔接的内容

**核心特性：**

- 📐 四向扩展（上下左右）
- 🎯 智能内容生成
- 🖼️ 保持原图风格
- 📝 可选提示词引导

**扩展模式：**

```typescript
enum ExpandDirection {
    TOP = 'top',        // 向上扩展
    BOTTOM = 'bottom',  // 向下扩展
    LEFT = 'left',      // 向左扩展
    RIGHT = 'right',    // 向右扩展
}

// 扩展参数
interface ExpandParams {
    direction: ExpandDirection;
    expandSize: number;      // 扩展像素数
    prompt?: string;         // 可选提示词
}
```

**技术实现：**

```typescript
class OutPaintExpandService extends BaseEditorService {
    async expand(params: ExpandParams) {
        // 1. 计算扩展区域
        const expandedCanvas = this.createExpandedCanvas(params);
        
        // 2. 生成mask（标记扩展区域）
        const mask = this.generateExpandMask(params);
        
        // 3. 调用AI Pipeline生成内容
        const result = await this.executeAiPipeline({
            image: expandedCanvas,
            mask: mask,
            prompt: params.prompt,
        });
        
        return result;
    }
}
```

**应用场景：**

- 📱 适配：扩展图片适配不同比例
- 🎨 创作：拓展画面边界
- 📸 修复：补全被裁切的内容

---

### 3.4 涂抹替换（AiReplace）

**功能描述：** 智能替换图像中的指定区域

**核心特性：**

- 🖱️ 与MagicEraser相同的选择模式（画笔/橡皮擦/智能点击）
- 📝 文本描述目标内容
- 🎯 AI生成替换内容
- 🔄 保持周边一致性

**工作流程：**

```
用户选择区域
    ↓
输入替换内容描述
    ↓
AI理解意图
    ↓
生成替换内容
    ↓
智能融合到原图
```

**技术实现：**

```typescript
class AiReplaceService extends BaseEditorService {
    async replace(maskCanvas: HTMLCanvasElement, prompt: string) {
        // 1. 上传mask
        const maskUrl = await this.uploadMask(maskCanvas);
        
        // 2. 调用AI替换
        const result = await executeAiPipeline({
            url: this.originImageUrl,
            mask_url: maskUrl,
            prompt: prompt,
            project_type: 'AI_INPAINT',
        });
        
        return result.url;
    }
}
```

**应用场景：**

- 👗 时尚：更换服装颜色/样式
- 🏠 设计：替换室内装饰
- 📸 修图：更换背景元素

---

### 3.5 AI滤镜（AiFilter）

**功能描述：** 将照片转换为各种艺术风格

**支持的风格：**

- 🎨 **艺术风格**：素描、水彩、油画、漫画
- 📸 **摄影风格**：黑白、复古、电影感
- 🌟 **特效风格**：赛博朋克、梦幻、科技感
- 🎭 **动漫风格**：二次元、动画片

**技术实现：**

```typescript
interface IFilterScene {
    scene_code: string;    // 场景编码
    scene_name: string;    // 场景名称
    category: string;      // 分类
    cover_url: string;     // 预览图
    model_version: string; // 模型版本
}

class AiFilterService extends BaseEditorService implements IAiPipelineService {
    async applyFilter(sceneCode: string) {
        const result = await executeAiPipeline({
            url: this.imageUrl,
            scene_code: sceneCode,
            project_type: 'REDRAW',
        });
        
        return result.url;
    }
}
```

**特殊配置：**

```typescript
// 支持解锁数量限制
tool_config: {
    ai_filter_limit: 3,           // 免费用户限制3个
    ai_filter_category: 'sketch', // 默认分类
    ai_filter_id: 'sketch_001',   // 默认场景
}
```

**应用场景：**

- 📱 社交：快速美化照片
- 🎨 设计：生成艺术效果
- 📸 摄影：风格化处理

---

### 3.6 AI变清晰（SuperResolution）

**功能描述：** 使用AI技术提升图像分辨率和清晰度

**核心特性：**

- 📈 支持2x/4x放大
- 🎯 智能降噪
- 🖼️ 细节增强
- 📐 边缘锐化

**放大模式：**

```typescript
enum UpscaleMode {
    X2 = '2x',    // 2倍放大
    X4 = '4x',    // 4倍放大
}

// 放大参数
interface UpscaleParams {
    mode: UpscaleMode;
    denoise: boolean;      // 是否降噪
    sharpen: number;       // 锐化强度 0-100
}
```

**技术实现：**

```typescript
class SuperResolutionService extends BaseEditorService {
    async upscale(params: UpscaleParams) {
        const result = await executeAiPipeline({
            url: this.imageUrl,
            scale: params.mode === UpscaleMode.X2 ? 2 : 4,
            denoise: params.denoise,
            sharpen: params.sharpen,
            project_type: 'SUPER_RESOLUTION',
        });
        
        return result.url;
    }
}
```

**应用场景：**

- 📸 老照片修复
- 🖼️ 低分辨率图片处理
- 🎨 打印素材准备

---

## 四、AI视频工具

### 4.1 视频变清晰（AiVideoEnhance）

**功能描述：** AI视频增强和超分辨率

**支持的增强模式：**

#### 模式1：标清转高清（SD to HD）

```typescript
{
    mode: 'sd-to-hd',
    input: '480p/540p',
    output: '720p/1080p',
    useCase: '老旧视频、低分辨率拍摄'
}
```

#### 模式2：高清转4K（HD to 4K）

```typescript
{
    mode: 'hd-to-4k',
    input: '1080p',
    output: '4K (3840x2160)',
    useCase: '专业级视频制作'
}
```

#### 模式3：帧率提升（FPS Boost）

```typescript
{
    mode: 'fps-boost',
    input: '24/30 FPS',
    output: '60 FPS',
    useCase: '让视频更流畅'
}
```

**技术实现：**

```typescript
enum VideoEnhanceMode {
    SD_TO_HD = 'sd-to-hd',
    HD_TO_4K = 'hd-to-4k',
    FPS_BOOST = 'fps-boost',
}

interface VideoEnhanceParams {
    mode: VideoEnhanceMode;
    targetResolution?: '720p' | '1080p' | '4k';
    targetFrameRate?: 24 | 30 | 60;
    modelScene: string;  // AI模型场景
}

class VideoEnhanceService extends BaseEditorService {
    async enhance(params: VideoEnhanceParams) {
        // 1. 验证参数
        this.validateParams(params);
        
        // 2. 上传视频
        const videoUrl = await this.uploadVideo();
        
        // 3. 执行增强
        const result = await executeAiPipeline({
            url: videoUrl,
            mode: params.mode,
            resolution: params.targetResolution,
            frame_rate: params.targetFrameRate,
            scene_code: params.modelScene,
        });
        
        return result;
    }
}
```

**限制条件：**

- 📦 文件格式：.mp4, .mov, .m4v, .3gp, .avi
- 📏 文件大小：最大500MB
- ⏱️ 视频时长：最长60秒
- ⚡ 处理时间：平均2-3分钟

**文件结构：**

```
ai-video-enhance/
├── README.md              # 详细文档（238行）
├── services/
│   ├── index.ts           # 服务实现
│   └── types.ts           # 类型定义
└── components/
    ├── video-preview.vue  # 视频预览
    ├── mode-selector.vue  # 模式选择
    ├── model-selector.vue # 模型选择
    └── params-config.vue  # 参数配置
```

---

### 4.2 AI做同款视频（AiVideoInspiration）

**功能描述：** 基于模板快速生成同款视频

**核心特性：**

- 📋 模板库支持
- 🔄 素材自动替换
- 🎬 一键生成
- 📱 移动端优化

**技术实现：**

```typescript
class AiVideoInspirationService extends BaseEditorService {
    async generate(templateId: string, materials: Material[]) {
        // 1. 加载模板
        const template = await this.loadTemplate(templateId);
        
        // 2. 替换素材
        const processedMaterials = await this.replaceMaterials(
            template,
            materials
        );
        
        // 3. 生成视频
        const result = await executeAiPipeline({
            template_id: templateId,
            materials: processedMaterials,
            project_type: 'VIDEO_INSPIRATION',
        });
        
        return result;
    }
}
```

---

## 五、基础编辑工具

### 5.1 裁剪（Crop）

**功能描述：** 图像裁剪和尺寸调整

**核心特性：**

- ✂️ 自由裁剪
- 📐 预设比例（1:1, 4:3, 16:9等）
- 🔄 旋转和翻转
- 📏 精确像素控制

---

### 5.2 尺寸调整（Resize）

**功能描述：** 调整图像尺寸

**核心特性：**

- 📏 按比例缩放
- 📐 自定义尺寸
- 🎯 智能缩放（保持关键内容）
- 📦 批量处理

---

### 5.3 格式转换（Convert）

**功能描述：** 图像格式转换

**支持格式：**

- 📥 输入：PNG, WebP, BMP, GIF, JPEG等
- 📤 输出：主要为JPG
- 🎨 质量控制
- 📦 批量转换

---

### 5.4 图片压缩（Compress）

**功能描述：** 图像压缩优化

**核心特性：**

- 📉 智能压缩
- 🎚️ 质量可调（高/中/低）
- 📦 支持批量
- 📊 压缩率显示

**技术实现：**

使用`squoosh-encoder`库进行压缩：

```
compress/services/
├── index.ts           # 主服务
├── mozjpeg_enc.js     # MozJPEG编码器
├── mozjpeg_enc.cpp    # C++实现
└── mozjpeg_enc.wasm   # WASM模块
```

---

### 5.5 换色（ChangeColor）

**功能描述：** 智能换色工具

**核心特性：**

- 🎨 智能识别颜色区域（基于SAM）
- 🖱️ 点击选择颜色
- 🎯 精确替换
- 📦 支持多区域

**技术实现：**

```typescript
// 使用与MagicEraser相同的SelectionCanvas
class ChangeColorService extends BaseEditorService {
    selectionCanvas: SelectionCanvas;
    
    async changeColor(selectedRegions: Region[], newColor: string) {
        // 选择区域后替换颜色
        for (const region of selectedRegions) {
            await this.replaceColor(region, newColor);
        }
    }
}
```

---

### 5.6 模板工具（Template）

**功能描述：** 基于模板生成设计

**核心特性：**

- 📋 丰富的模板库
- 🔄 素材替换
- 🎨 样式定制
- 📱 多尺寸导出

---

### 5.7 做同款（Inspiration）

**功能描述：** 落地页模块，快速生成同款设计

**核心特性：**

- 🎯 一键同款
- 🔄 自动适配
- 📐 尺寸调整
- 🎨 风格保持

---

## 六、技术架构

### 6.1 服务基类架构

所有工具服务继承自`BaseEditorService`：

```typescript
// base/interface.ts
export abstract class BaseEditorService<
    S = any,
    C extends IBaseEditorServiceConfig = IBaseEditorServiceConfig
> {
    state: S;
    config: C;
    tracker: LifecycleTracker;
    
    // 生命周期
    abstract main(): Promise<void>;
    completeState(): void;
    errorState(error: Error): void;
    
    // 商业化
    openBuyVipModal(): Promise<boolean>;
    checkRights(): boolean;
    
    // 下载和导出
    download(quality: 'low' | 'ultra'): Promise<void>;
    exportResult(): Promise<Blob>;
}
```

### 6.2 AI Pipeline接口

AI工具额外实现`IAiPipelineService`接口：

```typescript
export interface IAiPipelineService {
    aigcType: AigcType;
    
    // 核心方法
    start(
        interceptParams?: (params: IPipelineParams) => Promise<IPipelineParams>
    ): Promise<void>;
    
    // 场景管理
    loadScenes(): Promise<IScene[]>;
    switchScene(sceneCode: string): void;
    
    // 停止生成
    stopGeneration(): void;
}
```

### 6.3 工具配置接口

```typescript
export interface IToolConfig {
    // AI滤镜配置
    ai_filter_limit?: number;
    ai_filter_category?: string;
    ai_filter_id?: string;
    
    // AI替换配置
    ai_replace_pre_word?: string;
    ai_replace_prompt_disabled?: boolean;
    
    // 智能消除配置
    magic_eraser?: {
        paint_mode_code: string;
    };
    
    // 通用配置
    filter_id?: [{ name: string; id: number }];
    collection_id?: string;
    tool_name?: string;
    title?: string;
    background_color?: string;
}
```

### 6.4 文件结构规范

标准的工具文件结构：

```
{tool-name}/
├── index.ts                # 导出
├── index.vue               # 入口组件
├── editor.vue              # 编辑器UI
├── services.ts 或 services/  # 服务实现
│   ├── index.ts            # 主服务类
│   └── types.ts            # 类型定义
├── components/             # UI组件
│   ├── preview.vue         # 预览组件
│   ├── params.vue          # 参数配置
│   └── ...
└── utils/                  # 工具函数（可选）
    ├── canvas.ts
    └── ...
```

---

## 七、商业化配置

### 7.1 商业化工具列表

**需要付费的AI工具（12个）：**

| 工具 | 商业化类型 | 消耗高斯币 | VIP折扣 | 水印 |
|------|-----------|-----------|---------|------|
| AI绘图 | generate | ✅ | ✅ | ✅ |
| AI绘图通用 | generate | ✅ | ✅ | ✅ |
| AI背景 | generate | ✅ | ✅ | ✅ |
| AI视频 | generate | ✅ | ✅ | ✅ |
| 抠图 | generate | ✅ | ✅ | ✅ |
| 智能消除 | generate | ✅ | ✅ | ✅ |
| AI扩图 | generate | ✅ | ✅ | ✅ |
| 涂抹替换 | generate | ✅ | ✅ | ✅ |
| AI滤镜 | generate | ✅ | ✅ | ✅ |
| AI变清晰 | generate | ✅ | ✅ | ✅ |
| AI视频生成 | generate | ✅ | ✅ | ✅ |
| 视频变清晰 | generate | ✅ | ✅ | ✅ |

**免费工具（7个）：**

| 工具 | 说明 |
|------|------|
| 裁剪 | 完全免费 |
| 尺寸调整 | 完全免费 |
| 格式转换 | 完全免费 |
| 图片压缩 | 完全免费 |
| 换色 | 完全免费 |
| 模板 | 部分模板免费 |
| 做同款 | 部分免费 |

### 7.2 商业化类型

```typescript
export enum BusinessType {
    /** 生成类 - 消耗高斯币 */
    generate = 'generate',
    
    /** 下载类 - 需要VIP */
    download = 'download',
    
    /** 无商业化 */
    none = 'none',
}
```

### 7.3 权益配置

```typescript
// business/const.ts
export const compareFeatures: CompareFeature[] = [
    {
        text: 'Generative AI Tools',
        children: [
            {
                text: 'Background removal',
                description: 'Remove background from images with high precision',
                free: { enable: true, limit: '3/day', watermark: true },
                pro: { enable: true, limit: 'unlimited', watermark: false },
            },
            {
                text: 'AI image enhancer',
                description: 'Enhance image clarity and remove noise',
                free: { enable: true, limit: '3/day', watermark: true },
                pro: { enable: true, limit: 'unlimited', watermark: false },
            },
            // ... 其他工具
        ],
    },
];
```

### 7.4 费用计算

AI工具的费用由场景配置决定：

```typescript
interface IScene {
    scene_code: string;
    scene_name: string;
    fee_type: 1 | 2;              // 1=固定费用, 2=按次计费
    fee_point_rights: number;      // 消耗的高斯币数量
    vip_discount?: number;         // VIP折扣（0-1）
}

// 示例
{
    scene_code: 'ai_background_001',
    scene_name: 'AI背景-商品摄影',
    fee_type: 1,
    fee_point_rights: 5,           // 消耗5个高斯币
    vip_discount: 0.5,             // VIP享5折
}
```

---

## 八、工具图标配置

### 8.1 图标映射表

```typescript
// const/icon-config.ts
export const ICON_MAP: Partial<Record<IconMapKey, IconConfig>> = {
    // AI工具
    [ToolType.Matting]: { 
        default: IconCutout, 
        checked: IconCutoutFilled 
    },
    [ToolType.AiBackground]: { 
        default: IconBgAi, 
        checked: IconBackgroundaiFilled 
    },
    [ToolType.AiFilter]: { 
        default: IconRedraw, 
        checked: IconRedrawFilled 
    },
    [ToolType.OutPaintExpand]: { 
        default: IconImgExpand, 
        checked: IconImgExpandFilled 
    },
    [ToolType.MagicEraser]: { 
        default: IconAiEraser, 
        checked: IconAiEraserFilled 
    },
    [ToolType.AiReplace]: { 
        default: IconDrawreplacement, 
        checked: IconDrawreplacementFilled 
    },
    [ToolType.SuperResolution]: { 
        default: IconUpscaler, 
        checked: IconUpscalerFilled 
    },
    [ToolType.AiDraw]: { 
        default: IconAiDraw, 
        checked: IconAiDrawFilled 
    },
    [ToolType.AiDrawGeneral]: { 
        default: IconAiDraw, 
        checked: IconAiDrawFilled 
    },
    
    // 视频工具
    [VideoGenerationMode.IMAGE_TO_VIDEO]: {
        default: IconImage2video,
        checked: IconImage2videoFill,
    },
    [VideoGenerationMode.TEXT_TO_VIDEO]: { 
        default: IconText2video, 
        checked: IconText2videoFill 
    },
    
    // 基础工具
    [ToolType.Crop]: { 
        default: IconCrop, 
        checked: IconCropFilled 
    },
    [ToolType.Resize]: { 
        default: IconCustomize, 
        checked: IconCustomizeFilled 
    },
    [ToolType.Convert]: { 
        default: IconSynchronize, 
        checked: IconSynchronizeFilled 
    },
    [ToolType.Compress]: { 
        default: IconCompression, 
        checked: IconCompressionFilled 
    },
    [ToolType.Template]: { 
        default: IconTemplate, 
        checked: IconTemplateFilled 
    },
};
```

---

## 九、工具使用统计

### 9.1 代码规模统计

| 工具分类 | 文件数 | 代码行数（估算） | 复杂度 |
|---------|--------|---------------|--------|
| **AI生成类** | ~40 | ~5000 | 高 |
| **AI图像处理** | ~60 | ~8000 | 高 |
| **AI视频** | ~30 | ~3000 | 中 |
| **基础编辑** | ~30 | ~2000 | 低 |
| **总计** | ~160 | ~18000 | - |

### 9.2 核心文件统计

**最大的服务文件：**

1. `ai-background/services.ts` - 753行
2. `magic-eraser/capability/ai-in-paint.ts` - 564行
3. `magic-eraser/services/utils/mask.ts` - 434行（描边算法）
4. `magic-eraser/services/canvas/selection.ts` - 339行（智能选区）
5. `matting/services.ts` - 887行

---

## 十、开发指南

### 10.1 创建新工具的步骤

1. **在ToolType枚举中添加工具类型**

```typescript
// const/config.ts
export enum ToolType {
    NewTool = 'newTool',  // 添加新工具
}
```

2. **创建工具目录和文件**

```bash
mkdir -p editors/new-tool/{services,components}
touch editors/new-tool/{index.ts,index.vue,editor.vue,services.ts}
```

3. **实现服务类**

```typescript
// new-tool/services.ts
export class NewToolService extends BaseEditorService {
    async main() {
        // 实现主逻辑
    }
}
```

4. **添加图标配置**

```typescript
// const/icon-config.ts
export const ICON_MAP = {
    [ToolType.NewTool]: { 
        default: IconNew, 
        checked: IconNewFilled 
    },
};
```

5. **注册到轻舟配置**

```typescript
// 轻舟后台配置
{
    tool_type: 'newTool',
    tool_config: {
        // 配置参数
    }
}
```

### 10.2 开发规范

**服务类规范：**

- ✅ 必须继承`BaseEditorService`
- ✅ AI工具需实现`IAiPipelineService`
- ✅ 实现`main()`方法
- ✅ 实现商业化逻辑
- ✅ 添加埋点追踪

**文件命名规范：**

- 服务类：`services.ts` 或 `services/index.ts`
- 入口组件：`index.vue`
- 编辑器：`editor.vue`
- 类型定义：`types.ts` 或 `interface.ts`

**代码风格：**

- TypeScript严格模式
- Vue 3 Composition API
- ESLint规则检查
- 添加详细注释

---

## 十一、相关文档

### 11.1 技术文档

- [AI Replace智能选区深度解析](./计算机图像/AI%20Replace智能选区深度解析.md) - 智能选区和描边算法详解
- [SAM主体选择深度解析](./计算机图像/SAM主体选择深度解析.md) - SAM集成和高亮实现
- [套索工具实现原理详解](./计算机图像/套索工具实现原理详解.md) - 套索工具实现
- [画笔工具实现原理详解](./计算机图像/画笔工具实现原理详解.md) - 画笔工具实现

### 11.2 架构文档

- `editors/.cursor/rules/editors-services.mdc` - 编辑器服务架构规范
- `README.md` - 视频增强工具详细文档

---

## 十二、总结

### 12.1 工具能力总览

InsMind作为专业的AI图像编辑平台，提供了**19个工具**，覆盖：

- ✨ **AI生成**：从文本/图像生成新内容
- 🎨 **AI编辑**：智能修改和优化图像
- 🎬 **AI视频**：视频生成和增强
- 📐 **基础编辑**：裁剪、调整、转换等

### 12.2 技术亮点

1. **统一架构**：所有工具基于`BaseEditorService`统一架构
2. **SAM集成**：多个工具集成SAM智能选区技术
3. **AI Pipeline**：统一的AI处理管线
4. **商业化完善**：完整的权限和付费体系
5. **性能优化**：LRU缓存、Promise去重等优化策略

### 12.3 代码质量

- 📊 总代码量：~18000行
- 🏗️ 架构清晰：分层明确，职责单一
- 📝 文档完善：关键工具有详细文档
- 🔧 可维护性：良好的代码组织和规范

---

**文档版本：** v1.0  
**最后更新：** 2026-01-26  
**作者：** Meta Frontend Team  
**维护者：** InsMind Tool Team
