# Git 基础篇

## 一、Git 是什么？

Git 是一个分布式版本控制系统，用于跟踪文件的更改，协调多个开发者之间的工作。它允许开发者从中央仓库克隆代码，进行修改，并提交回中央仓库。

## 常用命令

### 初始化仓库

```bash
git init
```

### 撤销提交

`git reset --soft HEAD^`

### 身份信息

github 贡献值不显示问题：

提交必须使用与github账号关联的电子邮箱地址

- ` git config user.email`
- `  git config --global user.email 邮箱地址` # 对所有仓库设置电子邮箱地址
- `  git config --local user.email 邮箱地址` # 仅对当前仓库设置电子邮箱地址

### 分支

- `git branch 分支名` 创建分支
- `git checkout 分支名` 切换分支
- `git merge 分支名` 合并分支
- `git branch -d 分支名` 删除分支
- `git branch -D 分支名` 强制删除分支

### 合并

- `git merge 分支名` 合并分支
- `git merge --no-ff 分支名` 合并分支并生成合并提交
- `git merge --squash 分支名` 合并分支并生成合并提交

### 标签

- `git tag 标签名` 创建标签
- `git tag -a 标签名 -m "描述"` 创建标签
- `git tag -d 标签名` 删除标签
