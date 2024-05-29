# 前端基础架构

## 工作流

CICD（自动化构建、测试和部署）

## 技术选型

基础框架（如脚手架 cra，或者阿里的 ice，react or vue），基于这个框架结合项目引入某些工程化特殊配置（less or sass loader 、plugin 等）

## 基础物料包

#### ui 组件

antd elementui

**样式** classnames
**原子化** unocss

#### 工具类组件

ahooks loadsh

**react** uuid

#### icon 组件

阿里的 iconfont

#### 接口请求

axios 阿里的 mtop

#### 静态资源加载

使用 cdn 方式加载 需要一个统一管理图片的地方

## 开发规范

#### 编码风格

1. 统一 stylelint 自动保存格式化（如缩紧、简写等）
2. 文件和组件命名 （小驼峰和大驼峰）
3. 文件目录结构

#### git 规范

1. 开发阶段 基于 master 拉一个 develop-迭代分支 开发人员基于 develop 拉取名为 feature-data（迭代）-name 为分支
2. 测试阶段 基于 develop 拉取 bugfix-name 分支 改完之后删除该分支
3. 预演阶段 将 develop 合并到 master 修改代码预演问题代码 基于 master 拉取 bugfix-name 分支 改完之后删除该分支
4. 上线 将 master 发布到 release 修改线上代码如上 基于 release
5. git 提交规范
