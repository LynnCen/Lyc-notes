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
git branch -d 分支名 # 删除分支 如果分支没有合并到master，则不能删除
```

```bash
git branch -D 分支名 # 删除分支
```

### 合并

合并分支

```bash
git merge dev # 合并 dev 分支到 master 分支
```

### 解决冲突

### 储藏修改

description: 当开发过程中，需要切换到其他分支进行开发，但是又不想提交当前分支的修改，可以使用储藏修改。

```bash
git stash # 储藏修改
```

```bash
git stash list # 查看储藏的修改
```

```bash
git stash pop # 恢复储藏的修改 pop 恢复并删除储藏
```

```bash
git stash apply # 恢复储藏的修改 apply 恢复但不删除储藏
```

```bash
git stash drop # 删除储藏
```

```bash
git stash clear # 清空储藏
```

### 推送分支

```bash
git push origin 分支名 # 推送分支到远程仓库
```

### 拉取远程分支

```bash
git pull origin 分支名 # 拉取远程仓库的指定分支到本地
```

### 变基Rebase

description: 变基是将当前分支的修改应用到目标分支上，而不是创建新的提交。

```bash
git rebase 目标分支 # 变基 未填写目标分支，则变基到当前分支
```

- rebase操作可以把本地未push的分叉提交历史整理成直线；
- rebase的目的是使得我们在查看历史提交的变化时更容易，因为分叉的提交需要三方对比。

## 标签管理

> 发布一个版本时，我们通常先在版本库中打一个标签（tag），这样，就唯一确定了打标签时刻的版本。将来无论什么时候，取某个标签的版本，就是把那个打标签的时刻的历史版本取出来。所以，标签也是版本库的一个快照。
> Git的标签虽然是版本库的快照，但其实它就是指向某个commit的指针（跟分支很像对不对？但是分支可以移动，标签不能移动），所以，创建和删除标签都是瞬间完成的。


### 创建标签

创建的标签通常是基于最新的commit，也可以基于某个commit

```bash
git tag v1.0 # 创建标签
```

```bash
git tag v1.0 版本号 # 创建标签 版本号通常是基于某个commit的hash值
```

### 查看标签

```bash
git tag # 查看所有标签
```

```bash
git show v1.0 # 查看标签信息
```

### 操作标签

  **删除标签**

```bash
git tag -d v1.0 # 删除标签
```

**推送标签**

```bash
git push origin v1.0 # 推送标签到远程仓库
```

**删除远程标签**

```bash
git push origin --delete v1.0 # 删除远程标签
```

