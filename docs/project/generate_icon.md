# Icon自动生成脚本

## 核心逻辑

> 从一个图标库获取指定的一系列图标数据，并自动生成对应的React组件文件和索引文件。

### 优势：这种自动化脚本非常适合维护大型项目中的资源管理，可以显著减少手动编写和修改文件的工作量。

### 目标

- 用户可以通过命令行输入想要更新的图标名称。
- 脚本会自动从远程API获取图标数据，并基于这些数据生成React组件文件及索引文件。
- 所有生成的文件都会按照一定的命名规范存储在指定目录内。

### 主要步骤

1. 引入必要的模块：

- path: 处理路径相关的操作。
- fs: 文件系统操作，用于创建目录和写入文件。
- axios: 发送HTTP请求，从远程服务器获取图标数据。
- readline: 创建命令行界面，接收用户输入。

2. 定义辅助函数：

- capitalizeFirstLetter: 首字母大写的字符串处理函数。
- 定义核心函数 genIcons:

3. 接收一个图标数组作为参数。

- 定义模板字符串 iconTemplate 和 indexTemplate 来生成React组件和索引文件的内容。
- 确保目标目录存在，如果不存在则创建它。
- 对于每个图标，提取SVG路径和颜色属性，然后根据这些信息生成相应的React组件文件，并将其保存到指定目录下。
- 更新索引文件，确保新生成的组件被正确导入。

4. 通过命令行接口获取用户输入：

- 使用readline模块创建一个交互式命令行界面，让用户输入需要更新的图标名称列表。
- 根据用户输入的名称，发送HTTP GET请求到指定API，获取图标数据。
- 解析返回的数据，过滤出用户感兴趣的图标，调用genIcons函数生成相应文件。

## icon生成

```ts
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const BASE = './packages/icon';
const readline = require('readline');
function capitalizeFirstLetter(string) {
  return string.trim().replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
}
function genIcons(iconfont) {
  const iconTemplate = (name, svg, colorValue) => `
// GENERATE BY scripts/gen-icon.ts
// DON NOT EDIT IT MANUALLY

import * as React from 'react';
import Icon, { IconProps } from '../Icon';

const Internal${name}: React.ForwardRefRenderFunction<
  HTMLSpanElement,
  IconProps
  > = ({ className, fontSize, style, ...rest }: IconProps, ref) => {
  return (
    <Icon
      {...rest}
      ref={ref}
      className={\`odin-icon-${name.toLowerCase()} \$\{className || ''\}\`}
      fontSize={fontSize}
      style={${`{ color: '${colorValue}', ...style }`}}
    >
      <svg
        viewBox="0 0 1024 1024"
        width="1em"
        height="1em"
        fill="currentColor"
        style={{ display: 'block' }}
        aria-hidden="false"
        focusable="false"
      >
        ${svg}
      </svg>
    </Icon>
  );
};

const ${name} = React.forwardRef<HTMLSpanElement, IconProps>(Internal${name});

${name}.displayName = '${name}';

export default ${name};`;

  const indexTemplate = (
    name,
  ) => `export { default as ${name} } from './icons/${name}';
  `;

  if (!fs.existsSync(`${BASE}/src/icons`)) {
    fs.mkdirSync(`${BASE}/src/icons`);
  }

  let indexFileContent = '';
  if (fs.existsSync(`${BASE}/src/index.ts`)) {
    // 读取已有的index.ts文件内容
    indexFileContent = fs.readFileSync(`${BASE}/src/index.ts`, 'utf8');
  }
  iconfont.forEach((item) => {
    //fill相关参数
    const attributes = item.path_attributes?.split('|') || [];
    //svg相关参数
    const svgList = item.prototype_svg.split('|');
    const isSinglePath = svgList.length === 1;
    let colorValue = null;
    if (attributes.length) {
      const colorRegex = /fill="(#\w{6})"/;
      const match = attributes[0].match(colorRegex);

      if (match && match[1]) {
        // 提取第一个捕获组的内容，即颜色值
        colorValue = match[1];
      }
    }
    //${!isSinglePath && attributes[i] ? attributes[i] : ''} fill填充 目前看起来fill是一致的
    const svgPath = svgList.map((v, i) => `<path d="${v}"></path>`).join('');
    const name = `Tbj${capitalizeFirstLetter(item.name).replace(/\s+/g, '')}`;
    const indexTemplateExportLine = indexTemplate(name);
    // 只有当该行不存在时，才添加到indexFileContent中
    if (!indexFileContent.includes(indexTemplateExportLine.trim())) {
      indexFileContent = indexTemplateExportLine + indexFileContent; // 将新的导出放在内容的顶部
    }
    const file = iconTemplate(name, svgPath, colorValue);
    fs.writeFileSync(`${BASE}/src/icons/${name}.tsx`, file);
  });
  fs.writeFileSync(`${BASE}/src/index.ts`, indexFileContent);
}
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question(
  '请输入要更新的icon的name，多个name请以逗号分隔: ',
  function (answer) {
    const iconNames = answer
      .split(',')
      .map((name) => capitalizeFirstLetter(name.trim()).toLowerCase()); // 这里统一转为小写
    axios
      .get(
        'https://www.iconfont.cn/open/project/detailByGuid.json?guid=06da5c2a4707-4571638',
      )
      .then((response) => {
        const result = response.data.data;
        const filteredIcons = result.icons.filter((icon) => {
          const iconName = capitalizeFirstLetter(icon.name)
            .replace(/\s+/g, '')
            .toLowerCase(); // 同理，也转为小写后比较
          return iconNames.includes(iconName);
        });

        genIcons(filteredIcons);
      });

    rl.close();
  },
);

```

## 更新

```bash
tnpm run iconUpdate
```

packages.json -> scripts

```json
"iconUpdate": "node scripts/gen-icon.ts"
```