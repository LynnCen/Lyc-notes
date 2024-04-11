### 说一下 position 有哪些类型以及各个类型的特点？

static（静态定位）：这是默认的定位方式，元素按照正常的文档流进行排列，不受 top、bottom、left、right 等属性的影响。

relative（相对定位）：元素相对于其正常位置进行定位，通过设置 top、bottom、left、right 等属性来调整元素的位置。相对定位不会使元素脱离文档流，其他元素的布局不会受到影响。

absolute（绝对定位）：元素相对于其最近的已定位祖先元素进行定位，如果没有已定位的祖先元素，则相对于文档的初始坐标进行定位。通过设置 top、bottom、left、right 等属性来精确控制元素的位置。绝对定位会使元素脱离正常的文档流，其他元素的布局可能会受到影响。

fixed（固定定位）：元素相对于浏览器窗口进行定位，即使页面滚动，元素也会保持固定的位置。通过设置 top、bottom、left、right 等属性来确定元素在视口中的位置。固定定位会使元素脱离正常的文档流，其他元素的布局可能会受到影响。

sticky（粘性定位）：元素根据用户的滚动位置进行定位。粘性定位会将元素固定在距离顶部、底部、左侧或右侧一定距离的位置，直到达到指定的偏移值才会取消固定定位。粘性定位在支持的浏览器上表现类似于相对定位和固定定位的结合。

### 更改公共组件样式

```css
:global{

}
深度选择器
```

### css 画一个三角形

```css
// 上三角
.triangle {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 100px solid red;
}
```

### css 实现水平垂直居中实现方式有多少？

```css
.container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
// 子元素使用绝对定位，并且通过 top: 50%; 和 left: 50%; 将子元素的左上角定位在父容器的中心，然后通过 transform: translate(-50%, -50%); 将子元素向左上方移动自身宽度和高度的一半，实现了水平和垂直居中。
.container {
  position: relative;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### link 和@import 的区别

加载顺序不同
当一个页面加载时，所有的 link 标签都会被同时加载，而@import 语句只有在解析到它所在的样式表时才会被加载。因此，使用 link 标签可以让样式表同时加载，而@import 语句可能会导致样式表的延迟加载。

兼容性不同
link 标签是 HTML 标签，被所有的浏览器支持，而@import 语句是 CSS 语法，部分旧浏览器不支持。

使用方式不同
link 标签可以用于指定其他类型资源的加载方式，如 rel="icon"可以指定图标资源的加载方式，而@import 语句只能用于引入 CSS 文件。

CSS 优先级不同
当一个样式在 link 标签和@import 语句中同时存在时，link 标签所在的样式表的优先级高于@import 语句所在的样式表。

总之，link 标签是 HTML 标签，用于引入 CSS 文件，具有兼容性好、加载顺序固定等优点；而@import 语句是 CSS 语法，用于引入 CSS 文件，具有加载顺序不固定的缺点。在实际开发中，我们应该根据需求选择合适的加载方式。
