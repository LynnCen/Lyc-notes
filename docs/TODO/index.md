# TODO

## blog 图片压缩

**问题：目前 blog 项目体积过大，图片资源较多**

方案一：将图片资源 cdn

是否需要资源服务器？
使用 cdn 服务器

方案二：使用 vite plugin 插件打包压缩

生产环境的包体积会有所降低，但是仓库代码体积并未得到改善

方案三：使用 node 在本地压缩图片

```JS
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 当前目录下的 img 文件夹路径
const imgFolder = path.join(__dirname, 'img');

// 压缩配置
const resizeWidth = 800;  // 压缩后的宽度
const quality = 80;  // 图片质量

// 读取目录中的文件
fs.readdir(imgFolder, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // 遍历文件列表
  files.forEach(file => {
    // 获取文件的完整路径
    const filePath = path.join(imgFolder, file);

    // 检查文件是否是图片（这里简单地以文件扩展名来判断）
    if (file.match(/\.(jpg|jpeg|png|gif)$/)) {
      // 使用 sharp 压缩图片
      sharp(filePath)
        .resize({ width: resizeWidth })
        .jpeg({ quality: quality })
        .toFile(filePath.replace(/\.(jpg|jpeg|png|gif)$/, '-compressed.jpg'), (err, info) => {
          if (err) {
            console.error('Error compressing image:', err);
          } else {
            console.log('Image compressed successfully:', info);
          }
        });
    }
  });
});
```
