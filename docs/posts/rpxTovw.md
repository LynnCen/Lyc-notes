# rpx 转换为vw vh


## PostCss

使用插件`postcss-px-to-viewport`

```ts
const rpxPluginConfig = {
  unitToConvert: 'rpx',
  viewportWidth: 750,
  viewportUnit: 'vw',
  minPixelValue: 1,
  mediaQuery: false,
};
const rpxTopxPlugin = {
  unitToConvert: 'rpx',
  viewportWidth: 400 / 2,
  viewportUnit: 'px',
  fontViewportUnit: 'px',
  minPixelValue: 1,
  mediaQuery: false,
}

export default defineConfig({
  css: {
    postcss: {
      plugins: [require('postcss-px-to-viewport')(command==='storybook'?rpxTopxPlugin:rpxPluginConfig)],
    },
  },
});
```


## 行内样式

### 手动转换
```ts
export default (rpx: string | number) => {
  return `${(100 / 750) * +rpx}vw`;
};
```
### vite插件

创建 Vite 插件
首先，创建一个名为 vite-plugin-rpx-to-vw.js 的文件：

```ts
export default function rpxToVwPlugin() {
  return {
    name: 'vite-plugin-rpx-to-vw',
    transform(code, id) {
      if (!id.endsWith('.js') && !id.endsWith('.ts')) {
        return null;
      }

      // Regex to find rpx values in the code
      const rpxRegex = /(\d+(\.\d+)?)rpx/g;

      // Replace function
      const transformedCode = code.replace(rpxRegex, (_, value) => {
        const numValue = parseFloat(value);
        const vwValue = (numValue / 750) * 100; // Assuming the design width is 750rpx
        return `${vwValue}vw`;
      });

      return {
        code: transformedCode,
        map: null, // Provide source map if needed
      };
    },
  };
}
```
配置 Vite 使用插件

然后，更新 Vite 的配置文件（通常是 vite.config.js 或 vite.config.ts）来使用这个插件：
```ts
import { defineConfig } from 'vite';
import rpxToVwPlugin from './vite-plugin-rpx-to-vw';

export default defineConfig({
  plugins: [rpxToVwPlugin()],
});

```

### babel插件

使用 Babel 插件或其他 AST 转换工具来在编译时自动转换 JavaScript 文件中的 rpx 单位。这种方法较为复杂，需要编写自定义的 Babel 插件或使用工具如 `jscodeshift` 来进行代码转换。

1. 安装 Babel 和相关工具

首先，确保你的项目中安装了 Babel 及其相关工具。如果还没有安装，可以使用以下命令：

`npm install --save-dev @babel/core @babel/cli @babel/preset-env`

2. 创建自定义 Babel 插件

自定义 Babel 插件将会扫描你的 JavaScript 文件，找到所有使用 rpx 为单位的行内样式，并将其转换为 vw。
创建 Babel 插件
在项目中创建一个 babel-plugin-rpx-to-vw.js 文件：
javascript
Copy
```ts 
module.exports = function({ types: t }) {
  return {
    visitor: {
      NumericLiteral(path) {
        // 检查是否是 rpx 单位
        const { node } = path;
        const parent = path.parent;
        if (t.isBinaryExpression(parent) && parent.operator === '*' && parent.right.value === 1) {
          const rpxValue = node.value;
          const vwValue = (rpxValue / 750) * 100; // 这里假设设计稿宽度为750rpx
          parent.right = t.numericLiteral(vwValue);
          parent.operator = '*';
        }
      }
    }
  };
};
```

在这个插件中，我们假设所有的行内样式中单位为 rpx 的属性，通过一个乘法表达式（如 100 * 1）来表示。


3. 配置 Babel 使用插件
在项目的 Babel 配置文件（如 .babelrc 或 babel.config.js 中）添加刚才创建的插件：
```json
// .babelrc
{
  "presets": ["@babel/preset-env"],
  "plugins": ["./babel-plugin-rpx-to-vw"]
}
```


