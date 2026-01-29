# AI扩图

## 一、需求概述

## 二、基础功能

### 2.1 总览图

### 2.2 预览区Layout

整个预览区分为画布、mask裁剪框、内容图片。画布为整体内容的父容器，mask裁剪框在画布的中心位置自适应（通过在gap字段指定留白部分高度），内容图片自适应画布。

#### 2.2.1 画布contain

#### 2.2.2 mask裁剪框

mask裁剪框需要由内部图片自适应撑开，并且要位于画布的居中位置，基础信息如下：

故需要确定一下数据：

- 裁剪框宽高
- 相对于画布偏移量x、y（居中）

#### 2.2.3 图片展示

### 2.3 功能区

#### 2.3.1 尺寸切换

#### 2.3.2 比例切换

#### 2.3.3 高质量模式

## 三、功能实现

### 3.1 裁剪框位置确定

在service实例化之后，拿到画布的宽高，根据当前选中的Size或者Ratio进行调用changeSize/changeRatio。

**changeSize的实现：**

1. 获取图片原始尺寸naturalWidth, naturalHeight
2. 设置裁剪框的比例ratio（如果原始图片宽高一致比例为1:1 否则为4:3）
3. 根据设计图给出的gap间距，根据画布的宽高（offsetWith/offsetHeight）计算裁剪框的初始宽高（initWrapRect）

```
宽度 = offsetWith - gap * 2 
高度 = offsetHeight - gap * 2 
```

4. 计算最终mask宽高

通过containSize（实现contain效果）根据缩放比例计算出最终宽高maskWidth、maskHeight

5. 计算裁剪框相对于画布的相对偏移位置

首先需要理解下什么是相对偏移位置，裁剪框左上角点相对于画布左上角点的偏移位置，如下所示：

**计算公式：**

```
x =（画布宽度offsetWidth - 裁剪框宽度maskWidth）/ 2
y = （画布高度offsetHeight - 裁剪框高度maskHeight）/ 2
```

### 3.2 图片位置计算

1. 获取原始图片宽高

通过执行baseEditorService中的originImageSizePromise，获取图片的原始宽高。可从layout的image中拿到naturalWidth、naturalHeight。

2. 计算图片宽高

为实现图片在裁剪框中contain效果，需要重新计算图片宽高，按照一定比例进行缩放计算得出最终inageWidth、imageHeight。

3. 计算图片相对于裁剪框的相对偏移量

**计算公式：**

```
x = （maskWidth - imageWidth）/ 2
y = （maskHeight - imageHeight）/ 2
```

### 3.3 拖拽系统v-drag

v-drag是一个vue3自定义指令，用于监听鼠标起始位置、移动位置和相对偏移量。

挂载时：添加事件mousedown/touchstart监听，开启dragStart。

**提供三个事件：**

- dragStart：鼠标按下或者触摸开始，记录起始坐标startposition的x和y，并开启监听鼠标移动和鼠标抬起
- dragMove：拖拽过程中鼠标/手指移动触发，记录当前的位置x、y（相较于视口），记录偏移量diffX、diffY（相较于起始位置）
- dragEnd：拖拽结束时触发，记录当前的位置x、y（相较于视口），记录偏移量diffX、diffY（相较于起始位置）

### 3.4 裁剪框拖拽

裁剪框有8个角：n（北）、ne（东北）、e（东）、es（东南）、s（南）、sw（西南）、w（西）、nw（西北）。

#### 1. dragMaskStart

记录裁剪框的初始宽高和相对偏移量，以及拖拽过程中上下左右四个角最小值（防止拖拽过程中裁剪框的宽高小于图片，主要用于边界限制）

#### 2. dragMaskMove

移动分为八个方向，不同方向的计算公式不同，如下：

- **北边拖拽（n）**：向上拖拽时，相较于起始位置，向上拖拽时，Y是在变小，所以diffY为负数，向下拖拽时，Y增大，diffY为正数，新高度为初始裁剪框高度减去偏移量diffY。对新高度进行边界判断，最大为无穷Infinity，最小为图片高度+底部空白区域，该如何计算呢？图片高度已知，但是底部空白区域未知，图片y偏移量是相较于裁剪框左上角，所以可以通过裁剪框的高度减去顶部偏移量得到。更新裁剪框相较于画布的偏移量Y。

- **东边拖拽（e）**：向右拖拽，diffx为正数，向左拖拽，diffx为负数。新宽度为初始裁剪框宽度加上diffx，再进行边界检测得到最终宽度。更新偏移量X。

根据您的要求，我将生成一个详细的表格来描述不同拖拽方向下的宽度计算、高度计算、X位置计算、Y位置计算以及特殊逻辑和备注。这个表格会帮助清晰地展示在不同操作下矩形如何变化及其约束条件。

| 拖拽方向 | 宽度计算 | 高度计算 | X位置计算 | Y位置计算 | 特殊逻辑 | 备注 |
|---------|---------|---------|----------|----------|---------|------|
| move | 不变 | 不变 | initRect.x + diffX | initRect.y + diffY | 无 | 整体移动 |
| e (右边) | initRect.width + diffX<br>边界限制: [minInfo.right, maxInfo.right] | 不变 | 不变 | 不变 | 无 | 只调整宽度 |
| s (下边) | 不变 | initRect.height + diffY<br>限制: [minInfo.bottom, maxInfo.bottom] | 不变 | 不变 | 无 | 只调整高度 |
| n (上边) | 不变 | initRect.height - diffY<br>限制: [minInfo.top, maxInfo.top] | 不变 | initRect.y - (limitHeight - initRect.height) | 位置补偿 | 向上调整需要同步调整Y位置 |
| w (左边) | initRect.width - diffX<br>限制: [minInfo.left, maxInfo.left] | 不变 | initRect.x - (limitWidth - initRect.width) | 不变 | 位置补偿 | 向左调整需要同步调整X位置 |
| se (右下角) | 两步计算:<br>1. initRect.width + diffX<br>2. limitHeight × ratio | 两步计算:<br>1. limitWidth ÷ ratio<br>2. 限制: [minInfo.bottom, maxInfo.bottom] | 不变 | 不变 | 等比例缩放优先宽度，高度适配 | 保持宽高比 |
| ne (右上角) | 两步计算:<br>1. initRect.width + diffX<br>2. limitHeight × ratio | 两步计算:<br>1. limitWidth ÷ ratio<br>2. 限制: [minInfo.top, maxInfo.top] | 不变 | initRect.y - (limitHeight - initRect.height) | 等比例缩放+位置补偿 | 保持宽高比 + Y位置调整 |
| sw (左下角) | 两步计算:<br>1. initRect.width - diffX<br>2. limitHeight × ratio | 两步计算:<br>1. limitWidth ÷ ratio<br>2. 限制: [minInfo.bottom, maxInfo.bottom] | initRect.x - (limitWidth - initRect.width) | 不变 | 等比例缩放+位置补偿 | 保持宽高比 + X位置调整 |
| nw (左上角) | 两步计算:<br>1. initRect.width - diffX<br>2. limitHeight × ratio | 两步计算:<br>1. limitWidth ÷ ratio<br>2. 限制: [minInfo.top, maxInfo.top] | initRect.x - (limitWidth - initRect.width) | initRect.y - (limitHeight - initRect.height) | 等比例缩放+双重位置补偿 | 保持宽高比 + X、Y位置都需调整 |

#### 3. dragMaskEnd

拖拽结束后，需要调整自适应布局。

- 获取容器实际尺寸
- 计算最大允许区域
- 裁剪框遮罩适配到容器（containSize）
- 计算遮罩偏移量X、Y
- 计算缩放比例sacle
- 应用图片比例

### 3.5 图片拖拽

图片拖拽与裁剪框拖拽类似，但仅为图片拖拽移动，移动偏移量使用拖拽系统的相对偏移量（起始位置相较于移动位置的偏移量）。

**边界计算：** 由于是相对位置移动，图片位于裁剪框内，最小x可移动距离为0，最大x可移动距离为裁剪框宽度减去图片宽度，y方向同理。

### 3.6 changeSize

### 3.7 changeRatio

### 3.8 containSize

这个函数主要实现css的object-fit：contain的效果，用于计算在保持子元素宽高比的前提下，如果让子元素完整的适配到父容器中。

1. 计算容器宽高比
2. 计算元素宽高比
3. 适配计算

**情况一：子元素宽高比 > 父容器宽高比**

- 说明子元素相对更"宽"
- 以父容器的宽度为准，等比例缩放高度
- 结果：宽度填满，高度留白

**情况二：子元素宽高比 <= 父容器宽高比**

- 说明子元素相对更高
- 以父容器的高度为准，等比例缩放宽度
- 结果：高度填满，宽度留白
