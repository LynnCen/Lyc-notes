## nvm 安装记录
windows安装完nvm node -v error

 'node' 不是内部或外部命令，也不是可运行的程序

根本原因是配置系统变量 

打开系统变量 win+r 输入sysdm:cpl

找到系统变量

![alt text](./img/image.png)


## mac 安装nvm

安装homebrew

`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

安装成功 `brew -v `

使用homebrew安装nvm

`brew update `
`brew install nvm`

接下来，在home目录中为NVM创建一个文件夹。

```bash

mkdir ~/.nvm 

```

现在，配置所需的环境变量。在你的home中编辑以下配置文件

```bash

vim ~/.bash_profile 

```

然后，在 `~/.bash_profile` 中添加以下几行

```bash

export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh

```

按ESC + `:wq` 保存并关闭你的文件。 接下来，将该变量加载到当前的shell环境中。在下一次登录，它将自动加载。

```bash

source ~/.bash_profile

```

按以上步骤 同理配置`.zshrc`




