# unocss

文档：
https://unocss.nodejs.cn/#google_vignette

参考

- https://antfu.me/posts/reimagine-atomic-css-zh

原子化 CSS 是一种 CSS 写法，它将 CSS 样式拆分成一个个独立的样式，每个样式只包含一个属性，比如：

```css
/* 原子化 CSS */
.mt-10 {
  margin-top: 10px;
}
```

通过原子化 CSS 能力，可以方便地支持响应式布局，以及减少 CSS 文件体积。

## 配置 unocss vscode 插件

安装`UnoCSS`

在`setting.json`中加入以下

```json
"editor.quickSuggestions": {
        "other": true,
        "comments": true,
        "strings": true
      },
      "unocss.root": [

      ]
```

预览效果：

![alt text](./img/unocss插件.png)
