# Icon生成逻辑

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