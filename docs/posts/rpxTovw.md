# rpx 转换为 vw/vh 的完整指南

在移动端开发中,rpx(responsive pixel)是一个常用的响应式单位。本文将详细介绍如何将rpx转换为vw/vh,以实现更好的跨设备适配。

## 什么是rpx?

rpx是小程序中的响应式单位,可以根据屏幕宽度进行自适应。在标准设计稿(750px)下:
- 1rpx = 0.5px = 100vw/750

## 转换方案

### 1. PostCSS 方案

使用 `postcss-px-to-viewport` 插件可以自动转换CSS中的rpx单位。这是最推荐的方案,因为:
- 零侵入性,不需要修改源码
- 支持条件编译
- 性能好,在构建时完成转换

```ts
// vite.config.ts
const rpxPluginConfig = {
  unitToConvert: 'rpx', // 需要转换的单位
  viewportWidth: 750,   // 设计稿的视口宽度
  viewportUnit: 'vw',   // 希望使用的视口单位
  unitPrecision: 5,     // 单位转换后保留的精度
  propList: ['*'],      // 能转化为vw的属性列表
  viewportUnit: 'vw',   // 希望使用的视口单位
  fontViewportUnit: 'vw',// 字体使用的视口单位
  selectorBlackList: [], // 需要忽略的CSS选择器
  minPixelValue: 1,     // 设置最小的转换数值
  mediaQuery: false,    // 是否在媒体查询的css代码中也进行转换
  replace: true,        // 是否转换后直接更换属性值
  exclude: [],          // 忽略某些文件夹下的文件或特定文件
};

// Storybook环境使用px
const rpxToPxPlugin = {
  ...rpxPluginConfig,
  viewportWidth: 400 / 2,
  viewportUnit: 'px',
  fontViewportUnit: 'px',
}

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('postcss-px-to-viewport')(
          command === 'storybook' ? rpxToPxPlugin : rpxPluginConfig
        )
      ],
    },
  },
});
```

### 2. 行内样式转换

#### 2.1 工具函数方案

最简单的方案是封装一个转换函数:

```ts
// utils/rpx2vw.ts
export const rpx2vw = (rpx: string | number): string => {
  if (typeof rpx === 'string') rpx = parseFloat(rpx);
  return `${(100 / 750) * rpx}vw`;
};

// 使用示例
const styles = {
  width: rpx2vw(100),    // -> "13.333333333333334vw"
  height: rpx2vw('200'), // -> "26.666666666666668vw"
};
```

#### 2.2 Vite 插件方案

通过 Vite 插件在构建时自动转换代码中的 rpx 单位:

```ts
// plugins/vite-plugin-rpx-to-vw.ts
export default function rpxToVwPlugin() {
  return {
    name: 'vite-plugin-rpx-to-vw',
    transform(code: string, id: string) {
      // 只处理 JS/TS 文件
      if (!id.match(/\.(js|ts|jsx|tsx)$/)) return null;

      // 匹配rpx值,支持小数
      const rpxRegex = /(\d*\.?\d+)rpx/g;

      const transformedCode = code.replace(rpxRegex, (match, value) => {
        const vwValue = (parseFloat(value) / 750) * 100;
        return `${vwValue.toFixed(6)}vw`;
      });

      return {
        code: transformedCode,
        map: null,
      };
    },
  };
}
```

#### 2.3 Babel 插件方案

对于需要更精确控制的场景,可以使用 Babel 插件在编译时转换:

```ts
// plugins/babel-plugin-rpx-to-vw.ts
import { declare } from '@babel/helper-plugin-utils';
import { types as t } from '@babel/core';

export default declare(api => {
  api.assertVersion(7);

  return {
    name: 'babel-plugin-rpx-to-vw',
    visitor: {
      StringLiteral(path) {
        const { node } = path;
        const rpxRegex = /^(-?\d+(\.\d+)?)rpx$/;
        
        if (rpxRegex.test(node.value)) {
          const value = parseFloat(node.value);
          const vwValue = (value / 750) * 100;
          
          path.replaceWith(
            t.stringLiteral(`${vwValue.toFixed(6)}vw`)
          );
        }
      },
      
      NumericLiteral(path) {
        const { node, parent } = path;
        
        // 检查是否在样式对象中
        if (t.isObjectProperty(parent) && parent.value === node) {
          const key = parent.key;
          if (t.isIdentifier(key) && /width|height|margin|padding/.test(key.name)) {
            const vwValue = (node.value / 750) * 100;
            path.replaceWith(
              t.stringLiteral(`${vwValue.toFixed(6)}vw`)
            );
          }
        }
      }
    }
  };
});
```

## 最佳实践建议

1. **优先使用 PostCSS 方案**
   - 对源码无侵入
   - 性能最优
   - 维护成本低

2. **特殊场景的降级处理**
   - 对于动态计算的样式,使用工具函数
   - 考虑设备兼容性,必要时提供px降级方案

3. **注意事项**
   - 设计稿宽度统一使用750px作为基准
   - 考虑极端屏幕尺寸的显示效果
   - 建议配合CSS变量使用,方便维护

## 参考资料

- [PostCSS 官方文档](https://postcss.org/)
- [Vite 插件开发指南](https://vitejs.dev/guide/api-plugin.html)
- [Babel 插件手册](https://babel.dev/docs/en/plugins)
