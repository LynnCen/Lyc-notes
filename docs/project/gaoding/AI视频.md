# AI视频

## 1. 需求分析

基于长期的流量目标，Q2拓展了AI视频这一方向，为后续的流量增长提供助力。

基于3月底的流量暴涨，基于做同款快速拓展了AI视频的做同款，但做同款对于能力的承载单一，因此新增AI视频通用组件。

Ai视频的玩法包含三个方向：文生视频、图生视频、视频特效，本期功能将涵盖这些能力。

- PRD：https://doc.huanleguang.com/pages/viewpage.action?pageId=454485852
- UI：http://figma.com/design/cloCh7qypoMszjqIu1oMFK/insMind--%E8%90%BD%E5%9C%B0%E9%A1%B5%E5%B7%A5%E5%85%B7%E8%AE%BE%E8%AE%A1?t=WGqwABnHLqqgrPIK-0

### 1.1 文生视频

#### 1. 切换功能

- 初始化状态支持功能切换（文生视频/图生视频/视频特效）
- 进入编辑器后不支持切换

进入编辑器是进入聚合页，还是工具直接覆盖？

待确认@虾米 --> 落地页

#### 2. 文生视频配置从Dify获取

- 模型：获取默认模式，支持获取模式列表，切换模式
- 尺寸：获取尺寸列表，支持切换
- 时间：获取时间列表，支持切换
- 强度：默认为50%，点击支持调整强度

从Dify获取配置，Dify从哪里拿到所对应的这些配置信息？我如何接入Dify？

1. 前端根据接口（@榴莲）拿到配置，有哪些就展示哪些
2. 切换模型时，模型所对应的尺寸、时间可能不一致，存在联动变化，包含credit

根据后端数据解析，@昭扬提供下数据预设

credit解析：用多场景方案，选择时间切换场景code，居于接口数据维护一个场景code和点数的映射，点数只跟时长关联

5S场景、10S场景,点数

1. 模型相关@昭扬，配置credit

#### 3. 生成流程

- 文案输入为必填项
- 点击生成进入落地页工具
- 生成完成展示生成结果
- 点击下载则下载生成结果（不区分分辨率）

**问题：**

1. 文案输入是否有字数限制？

@虾米字数待确认

前端写死1500

输出结果字数？前端截取

2. 提示词增强由谁提供接口？

调用AI视频提示词增强接口，由@昭扬补充DifyAI视频工作流

@虾米 已有需求，只需接入，对接人待定（后端提供个接口）

调用getAiVideoPrompt，对该方法增加输出配置

3. 文案的替换采用流式还是全覆盖？

@虾米跟提示词增强捆绑

按照原本提示词的逻辑

优化项：流式

4. 点击生成接口？

@榴莲

私下问下条哥，跟@昭扬对齐接口入参

#### 4. 视频播放组件

- 生成完成自动播放，播放完成暂停
- 默认静音

视频组件是否已有？样式需要改造？

跟ai-video通用

#### 5. 轻舟配置（支持配置默认选中）

- 模式：支持切换默认选中模式
- 尺寸：支持切换默认选中尺寸
- 时间：支持切换默认选中时间
- 强度：支持切换默认选中强度

既然列表从Dify获取，那么轻舟配置默认选中所对应的列表从哪里获取？直接写死？

轻舟是总数据源，Dify配置会经过轻舟的中转，轻舟数据写死

模式输入框，输入对应code由运营人员自行查找对应code映射的模型（四个都是输入框，可选）

AI视频玩法是否也需要加入轻舟配置？

新建Ai视频工具，生成模式：文生视频、图生视频，视频特效

### 1.2 图生视频

#### 1. 图生视频配置从Dify获取

缺少尺寸选择

#### 2. 生成流程

上传图片必选，文案非必选

轻舟配置如何区分文生视频和图生视频？

同属于AI视频工具，文生视频、图生视频和特效视频属于该工具的3中模式

### 1.3 视频特效

#### 1. 切换功能

- 初始化状态支持功能切换（文生视频/图生视频/视频特效）
- 进入编辑器后不支持切换

#### 2. 视频特效配置从场景配置获取

- 展示默认选中内容
- 点击change effect进入编辑器展示更多分类内容

什么是场景配置？从哪里获取？

可参考Ai绘图：

根据根分类code去查接口（接口已有的，AI绘图有）getScenes

补充getVideoScenes 

点击change effect直接进入落地页？预览区未看到UI

直接进入编辑器

预览区分为1-3张图片上传，是否需要配置？

根据场景配置绑定展示几张图，默认几张图根据轻舟默认场景code展示（可参考AI绘图）

#### 3. 生成流程

- 上传图片为必填项

#### 4. 轻舟配置

- 支持配置根分类
- 支持配置默认选中分类
- 支持配置默认选中分类的默认选中场景
- credits根据场景绑定，需要配置是否付费，付费点数（不同于上面两种模式的credit绑定模型）

输入框 可参考上述（参考AI绘图）

## 2. 逻辑梳理

### 2.1 路由配置

本次新增AI视频通用工具，路由应处于landing，根据组件映射关系，位于落地页tool-banner内部，属于工具的一部分，可利用工具封装的公共逻辑。

### 2.2 工具组件ToolBanner分析

以这个工具为例：

- 左侧：属于Media，分为图片预览、视频预览、图片比较预览
- 右侧：属于上传交互区，分为两个组件：AIDraw、UploadBanner
  - AIDraw（Ai绘图）
  - UploadBanner（通用上传）

AIVideo：新增AIVideo则需要preview新增一个组件，可以考虑将Toolbanner重构，维护一套组件映射，不需要分支判断

### 2.3 ToolWrap

ToolWrap内部组装component和slot，component用于展示工具的详情（点击generate后进入），slot用于展示预览区，由于大部分工具都具有相似逻辑和生命周期，故统一在toolwrap中组装（条哥考虑后续将这块进行重构掉，支持不同工具不同ui）。

- component：工具详情展示组件，通过tool字段指定，tool由useOpenTool中的openTool方法创建。
- slot：是一个插槽，展示在Toolbanner中的预览区，可通过openToolEditor和openOuterTool进行切换工具模式。

### 2.4 useOpenTool Hook 机制

useOpenTool是一个工具管理器，负责统一的工具的打开逻辑，包括平台适配，文件校验，状态管理等。

**主要职责：**

1. **加载工具loadTool**：通过动态引入的方式引入工具Editor（分为移动端和PC端，详情可见Editor），在ToolWrap组件挂载的时候执行。

2. **打开工具openTool**：打开的方式分为三种
   - 标准打开工具openTool：在原本预览区的位置进行覆盖
   - 聚合页工具打开openToolsEditor：通过工具聚合打开指定工具，原本预览区不变，在整个外层套一个聚合页层。
   - 编辑器打开openOuterTool：打开外部传入的编辑器工具

3. **状态管理：**
   - tool: 当前工具组件的引用（使用shallowRef避免深度响应）
   - visible: 工具是否可见的状态
   - wap: 是否为移动端环境
   - fileData: 当前选择的文件数据数组
   - editor: 编辑器服务实例
   - config: 当前工具的配置信息
   - title: 工具的标题
   - showTool: 工具是否应该显示（visible && tool存在）
   - showComp: 组件是否应该显示（移动端AB测试或工具未显示时）
   - toolType: 当前工具类型（从配置或编辑器获取）
   - toolConfig: 轻舟动态配置

### 2.5 Editor 来源和服务架构

当调用openTool时会打开对应的Too组件，工具的预加载通过loadTool加载Editor组件，Editor组件通过wap区分加载移动端还是PCEditor，每个editor对应一个editor服务，editor服务通过bootstrap使用toolType进行动态创建每个工具所对应的服务。

Editor组件：

### 2.6 不同工具的 Editor 服务特点

### 2.7 数据流向和通信机制

## 3. 具体设计

### 3.1 轻舟配置数据

数据源从哪里获取？静态写死

**选中AI视频工具：**

1. **AI视频模式**
   - 单选：文生视频、图生视频、视频特效

2. **文生视频配置**
   - 模型：Input 输入code
   - 尺寸：Input 具体值
   - 时间：Input 具体值
   - 强度：Input 具体值
   - 输入框：defaultvalue？
   - 是否付费：

3. **图生视频**
   - 模式：Input
   - 时间：Input
   - 强度：Input

4. **视频特效**
   - 根分类code：Input
   - 默认选中分类：Input
   - 默认选中分类中的默认选中场景：
   - 是否付费：credit 

### 3.2 配置流程

1. 进入页面管理

搜索指定路由background-template，进入编辑

2. 进入页面配置

在页面配置中进入组件中心

3. 新增编辑工具

4. 配置工具Schema

配置手册参考：https://formilyjs.org/zh-CN

5. 配置数据结构

### 3.3 UI组件

按照组件最小原则进行封装，也可参考已有的组件

#### 3.3.1 视频模式选择AiVideoFeatureSelect

- 可采用Select的quiet
- Dropdown

#### 3.3.2 带logo输入框

设计图：

具体可参考AI绘图中的组件(meta/www-insmind/routes/(vue3)/components/tool/components/text-area/index.vue)，需要替换Toolbar（通过插槽）

#### 3.3.3 图片上传

设计图：

与现有的存在差异，需要特殊改造下适配样式（/meta/www-insmind/routes/(vue3)/components/tool/components/ai-draw/components/upload-image.vue）（upload-image），建议重新写一个，图片svg需要改造为填充色：

#### 3.3.4 下拉

/meta/www-insmind/routes/(vue3)/components/tool/components/ratio/ratio-dropdown.vue ratio-dropdown：

是否可以抽象一个组件，两个插槽，一个展示，一个用于dropdown

#### 3.3.5 slider

#### 3.3.6 credit

business-btn

#### 3.3.7 场景scene

/Users/lynncen/work/meta/www-insmind/routes/(vue3)/components/tool/components/ai-draw/components/scene-list.vue

## 4. 移动端适配

## 5. 接口对接

### 5.1 轻舟配置接口

### 5.2 Dify获取模型配置

@榴莲给到具体参数

@昭扬数据结构

### 5.3 提示词增强

getAiVideoPrompt

### 5.4 视频生成接口

都走dify，只提供接口

### 5.7 场景接口

getScenes

## 6. 自测调试

- 单元测试：对每个模块进行单元测试，确保功能正确。
- 集成测试：测试整个组件的集成效果，确保各模块协同工作。
- 性能测试：测试组件在不同环境下的性能表现。
- 兼容性测试：测试组件在不同浏览器和移动设备上的表现。

## 7. 时间计划

- 需求分析：
- 设计与开发：
- 测试与调试：
- 文档编写：
- 总时间：
