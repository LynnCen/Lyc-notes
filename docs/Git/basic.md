# Git 基础篇

## 一、Git 是什么？

Git 是一个分布式版本控制系统，用于跟踪文件的更改，协调多个开发者之间的工作。它允许开发者从中央仓库克隆代码，进行修改，并提交回中央仓库。

## 常用命令

### 初始化仓库

```bash
git init
```

### 添加文件

```bash
git add .
```

### 提交文件

-m 是 message 的缩写，表示提交信息

```bash
git commit -m "提交信息"
```

### 查看状态

```bash
git status
```

### 撤销提交

- `--hard` 会回退到上个版本的已提交状态，
- `--soft` 会回退到上个版本的未提交状态，
- `--mixed` 会回退到上个版本已添加但未提交的状态。
- HEAD 表示当前版本
- HEAD^ 表示上个版本
- HEAD^^ 表示上上个版本
- HEAD~2 表示上上个版本
  
```bash
git reset --soft HEAD^
```

```bash
git reset --hard 版本号(commit id)
```

### 撤销修改

```bash
git checkout -- 文件名
```

### 删除文件

```bash
git rm 文件名
```

### 添加远程仓库

```bash
git remote add origin 远程仓库地址
```

### 推送远程仓库

```bash
git push origin master
```

### 删除远程仓库

```bash
git remote -v # 查看远程仓库
```

```bash
git remote rm origin # 删除远程仓库
```

### 克隆远程仓库

```bash
git clone 远程仓库地址
```

### 身份信息

github 贡献值不显示问题：

提交必须使用与github账号关联的电子邮箱地址

- `git config user.email`
- `git config --global user.email 邮箱地址` # 对所有仓库设置电子邮箱地址
- `git config --local user.email 邮箱地址` # 仅对当前仓库设置电子邮箱地址

### 分支管理

```bash
git branch -b dev # 创建并切换到 dev 分支
## 等于
 git branch dev
 git checkout dev
# Switched to branch 'dev'
```

**查看分支**

```bash
git branch
dev
* master
```

**切换分支**

```bash
git checkout 分支名
# Switched to branch 'dev'

git checkout master
# Switched to branch 'master'
```

**switch**

我们注意到切换分支使用`git checkout <branch>`，而前面讲过的撤销修改则是`git checkout -- <file>`，同一个命令，有两种作用，确实有点令人迷惑。

实际上，切换分支这个动作，用switch更科学。因此，最新版本的Git提供了新的`git switch`命令来切换分支：

```bash
git switch -c  dev # 创建并切换到 dev 分支

git switch master # 切换到 master 分支
```

**删除分支**

```bash
git branch -d 分支名

git branch -d dev # 删除 dev 分支
```

### 合并

合并分支

```bash
git merge dev # 合并 dev 分支到 master 分支
```

### 标签

- `git tag 标签名` 创建标签
- `git tag -a 标签名 -m "描述"` 创建标签
- `git tag -d 标签名` 删除标签
