# Tao日本逆向前端基础架构


## 整体全貌

- 工作流：直接选择用 Def（参考 SuperBuy）。背后逻辑：尽管 Dida 背后也是 Def , 但考虑到 Dida 和 Def 研发体验还是有一定差距，且平台有改造成本 & 大家开发有学习和切换成本，且生产关系上 Dida 不对我们负责，基于短期 & 长期研效最佳的方案的考虑。
- 基础物料：涉及到的全部 Fork 一轮
- 监控平台：经过 AE 内部几个团队的调研，综合对比易用性下来，计划使用 aem-sg（参考 SuperBuy）
- 性能：基于 CSR 架构的性能优化方案，后续长期再看 SSR 、流式 SSR 等。
- 图片：背后 Filebroker，业务层使用 @车铭 开发的上传平台
  ○ 由于目前日本站的域名还在申请中，因此先到纵横平台上传图片资源，后续域名开通后，再将图片资源上传到诺亚提供的上传平台，再对项目中的链接做替换。
- 搭建：本期不涉及

## 研发流程

### 新建ice脚手架应用

document.tsx配置

主要是 aplus 接入以及域名配置，可以直接复制

```js

/**
 * The page's HTML template structure, using JSX.
 */
import { Meta, Title, Links, Main, Scripts } from 'ice';
import { description } from '../package.json';

export default function Document() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="aplus-core" content="aplus.js" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        //pv日志
        <meta name="aplus-rhost-v" content="sg.mmstat.com"> 
        //黄金令箭
        <meta name="aplus-rhost-g" content="sg.mmstat.com"> 
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://assets.alicdn.com/g/ae-fe/cosmos/0.0.254/pc/index.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <Meta />
        <Title />
        <Links />
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: `
          (function(w, d, s, q) {
            w[q] = w[q] || [];
            var f = d.getElementsByTagName(s)[0],j = d.createElement(s);
            j.async = true;
            j.id = 'beacon-aplus';
            j.setAttribute('exparams','userid=<用户ID>&aplus&sidx=aplusSidex&ckx=aplusCkx');
            j.src = "//g.alicdn.com/alilog/mlog/aplus_v2.js";
            j.crossorigin = 'anonymous';
            f.parentNode.insertBefore(j, f);
          })(window, document, 'script', 'aplus_queue');
        `}}>
        </script>
      </head>
      <body>
        <Main />
        <Scripts />
      </body>
    </html>
  );
}
```

### 基础能力配置

```js
// aem
import { createAEM,getAESInstance } from "@ali/odin-jp-api";
createAEM({
  pid: 'jp-xxx',
  requiredFields: ['username'],
  plugins: {
    // 用户传入的其他插件和配置...
  }
});
export const aes = getAESInstance();
```
```ts
// api
import { sendRequest,initMtop} from "@ali/odin-jp-api";
import {aes} from './aem'	
initMtop(isPre,aes)
export const getStartRendData = (params:any) => {
  return sendRequest({
    api: "mtop.aliexpress.buyer.reverse.batch.initiateReverseRender",
    v: "1.0",
    method: "POST",
    isMock,
    data: params
  }).then((res) => {
    return res as any;
  });
};
```

```ts

// tracker
import { tracker } from "@ali/odin-jp-api";
export const click = (type: string, values?: any) => {
  tracker.trackClick('/jp.pc_click.statweb_jp_click', {
    button_type: type,
    object_value: formatLogValues(values),
  });
};
```

### 前端登录快速联调

**本地开发：**

在登陆域名下登陆注入cookie，本地通过代理模式将预发资源代理到本地，并且可访问预发接口，实现快速联调

**端内测试：**

1️⃣ 安装包下载

2️⃣ 环境切换和站点切换

3️⃣ 设置白名单

4️⃣ 通过ats可查看抓包接口

5️⃣ 通过app.dev可调式端内h5页面


### 绑定域名

新建应用，选择【关联仓库】 & 【pages.tao.co】 域名


## 基础物料

**文档**：完整指南 https://tmg-odin.pages.alibaba-inc.com/usage


**组件原则：**

1. 优先用 odin-jp 里的组件库
2. 其次用集团已有的组件库：https://hyper-kit.alibaba-inc.com/
3. 复杂表单，可以考虑使用 antd-mobile
4. 其他开源组件库使用最好找  review 一下
5. 包体积需要严格控制

原项目中依赖的基础能力如下

`"@ali/comet-hooks": "^0.1.2"`,

`"@ali/comet-icon": "^3.0.5"`,

`"@ali/comet-icons": "^0.2.3"`,

`"@ali/comet-ui": "^2.1.4"`,

`"@ali/cosmos-base": "^1.2.3"`,

`"@alife/zoro-goldlog": "^1.2.0"`,

`"@alife/zoro-cookie": "^3.0.4"`,

现在收敛到如下包

`@ali/comet-hooks` 替换为 `@ali/odin-jp-hook`

`@ali/comet-icon` 和 `@ali/comet-icons`收敛到 `@ali/odin-jp-icon`

`@ali/comet-ui`替换为`@ali/odin-jp-ui`

`@ali/cosmos-base`、`@alife/zoro-goldlog`、`@alife/zoro-cookie`收敛到`@ali/odin-jp-api`

收敛后如下，先锁死版本号

`"@ali/odin-jp-api": "0.0.1"`,

`"@ali/odin-jp-hook": "0.0.1"`,

`"@ali/odin-jp-icon": "0.0.1"`,

`"@ali/odin-jp-ui": "0.0.1"`,

注意，当前均处于beta版本，安装时请带详细版本号, 版本信息

###  @ali/odin-jp-ui

#### 组件库预览文档

文档地址：[https://tmg-odin.pages.alibaba-inc.com/components/button](https://tmg-odin.pages.alibaba-inc.com/)

组件库需求请填写至组件库需求文档

#### 样式覆盖

**主题色定制**可使用如下方法,最终会覆盖modifyVars中的原有变量

```tsx
import { ConfigProvider } from '@ali/odin-jp-ui'

// ...

ConfigProvider.config({
    theme: {
      "color-brand-primary": "#111",
      "color-brand-disable": "#ccc"
    }
  });
  ```

  ```less
  :root {
  --color-brand-primary: #333;
  --color-brand-primary2: #ff4513;
  --color-brand-disable: #ffcec1;
  --color-brand-bg: #ffe6e7;
  --color-function-4-1: #ce7039;
  --color-function-4-2: #f4dacc;
  --color-function-4-13: #fff2eb;
  --color-grey-1: #f5f5f5;
  --color-grey-2: #ebebeb;
  --color-grey-3: #cccccc;
  --color-grey-4: #e3e3dc;
  --color-grey-5: #f9f9f6;
  --color-grey-6: #757575;
  --color-grey-10: #191919;
  }
  ```

**根据ui稿定制样式，修改样式变量**

```less
@btn-prefix-cls: ~'@{comet-prefix}-btn';
@btn-border-width: 1rpx;
@btn-slim-active-bg-color: #dbdbdb;
@btn-primary-active-bg-color: #e23246;
@btn-default-active-bg-color: #e4cdce;
@btn-default-active-color: #e23246;
@btn-brand-bg-color: var(--color-brand-bg, '#fff');
@btn-brand-disable-bg-color: var(--color-brand-disable, '#FFB5BB');
@color-white: var(--color-white, '#fff');
@color-transparent: var(--color-Transparent, 'rgba(0,0,0,0)');
@font-size-md: 30rpx;
@font-size-smller: 20rpx;
@padding-inline-lg: 18rpx;

.default-active() {
  background: @btn-default-active-bg-color;
  border-color: @btn-default-active-bg-color;
  color: @btn-default-active-color;
}
```


#### uno-css 预设主题

为了快速开发，参考[tailwindcss](https://tailwind.nodejs.cn/docs/text-color)的类名(欢迎补充)导出了一份JP站点移动端预设配置，参考如下:

```tsx
// >>第一步<< 配置ice.config.mts
import Unocss from '@ice/plugin-unocss';
// JP移动站点预设配置
import presetJP from '@ali/odin-jp-api/lib/presets/preset-jp.js'

export default defineConfig(() => ({
  // ...
  plugins: [
    // ...
    Unocss({
      presets: [presetJP.default]
    })
  ],
  // ...
}))

// >>第二步<< 组件怎么写
const Component: FC = () => {

  return (
    // 自定义的css module
    <div className={styles.container}>
      // 预设样式里的数值类均已转换成rpx;色值类将优先跟随@ali/odin-ui的主题色
      // 以下等同于 padding-left: 7rpx;margin-top: 8rpx;color: var(--color-function-3-2, #ff8214) 
      <div className='pl-7 mt-8 text-12 text-orange'>文本</div>
    </div>
  );
};

```

#### html骨架图

**为什么要设置骨架屏？**

> 为了提升用户体验，在真实DOM渲染之前，我们需要先生成一张骨架图，并将其绘制到页面上。

https://tmg-odin.pages.alibaba-inc.com/usage/skelon

[核心原理](../blog/skelon.md)


### @ali/odin-jp-icon

合并了@ali/comet-icon和@ali/comet-icons两个icon库，icon详情

icon统一用最新的iconfont，均以Tbj为前缀，icon详情
```tsx
import { TbjIcAdd } from '@ali/odin-jp-icon';
<TbjIcAdd style={{ fontSize: '16px', color: '#08c' }} />;
```

#### icon更新方案

在japan-components库中，执行`tnpm run iconUpdate`命令，输入要更新的icon名字即可，更新后会在icon目录中新增该icon的文件

注意：名字需要和Japan_TAO中的icon名字一致（不区分大小写），因为默认从该项目中拉取icon



### @ali/odin-jp-hook

fork自`@ali/comet-hooks`

目前提供了两个hook `useResponsive`和`useCountdown`，主要是原AE项目中存在判断pc和移动端的需求，本次日本站关于`useResponsive`的逻辑可以移除掉，默认都是用移动端的逻辑，使用方法

###  @ali/odin-jp-api

合并了原来`@ali/cosmos-base`、`@alife/zoro-goldlog`、`@alife/zoro-cookie`的能力，提供如下能力

#### mtop请求

基础版使用，传入isMock参数，可结合ice提供的mock能力，实现业务无倾入mock
```tsx
import { sendRequest } from "@ali/odin-jp-api";
export const getStartRendData = (params:any) => {
  return sendRequest({
    api: "mtop.aliexpress.buyer.reverse.batch.initiateReverseRender",
    v: "1.0",
    method: "POST",
    isMock,
    data: params
  }).then((res) => {
    return res as any;
  });
};
```

可在mock目录下新建如下文件,调用上边`getStartRendData`方法时根据`isMock`参数来获取`mock`文件中的内容，

**注意：文件名需要和api参数相同**，如`mtop.aliexpress.buyer.reverse.batch.initiateReverseRender`
```ts
export default {
	"POST /mtop.aliexpress.buyer.reverse.batch.initiatereverserender":{
		"module": {
		},
		"notSuccess": false,
		"repeated": false,
		"retry": false
	}
}
```

结合AEM使用，可使用initMtop初始化请求，传入aes对象后，会配合接口异常插件，自动采集接口的异常

```ts
import { sendRequest,initMtop,createAEM,getAESInstance } from "@ali/odin-jp-api";
createAEM({
  pid: 'jp-xxx',
  requiredFields: ['username'],
  plugins: {
    // 用户传入的其他插件和配置...
  }
});
const aes = getAESInstance()
initMtop(true,aes)
export const getStartRendData = (params:any) => {
  return sendRequest({
    api: "mtop.aliexpress.buyer.reverse.batch.initiateReverseRender",
    v: "1.0",
    method: "POST",
    isMock,
    data: params
  }).then((res) => {
    return res as any;
  });
};
```

####  常用cookie获取

提供了获取cookie中常见信息的方法
```ts
import { cookie } from "@ali/odin-jp-api";
const lang = cookie.getLocale() || ''; 
const country = cookie.getRegion();
const country = cookie.getSite() || '';
const currency = cookie.getCurrency()
const Uid = cookie.getMemberId();
```

####  获取用户信息

待补充

#### windvane使用

https://tmg-odin.pages.alibaba-inc.com/windvane

## 性能

### 性能监控

统一使用 aem 

aem 支持

aem 地址：https://sg.aem.alibaba-inc.com/project/taobaojp/page/setting/base/code

前期统一用一个 pid 即可
```ts
import { createAEM,getAESInstance } from "@ali/odin-jp-api";
createAEM({
  pid: 'taobaojp',
  user_type: '13',
  requiredFields: ['username'],
  plugins: {
    // 用户传入的其他插件和配置...
  }
});
```

有些必要参数（如uid）可能需要异步获取，但我们又不希望延迟初始化导致期间的埋点丢失，这时可以在初始化时或者在SDK加载前配置requiredFields参数，配置完之后再进行发送
```ts
import { getAESInstance } from "@ali/odin-jp-api";
const aes = getAESInstance()
getUserName((username)=>{
  aes.setConfig({username})
})
```

默认的plugin如下,可以在createAEM的plugins中传入更多配置，更多插件
```ts
import AESPluginEvent from '@ali/aes-tracker-plugin-event';
import AESPluginPV from '@ali/aes-tracker-plugin-pv';
import AESPluginPerf from '@ali/aes-tracker-plugin-perf';
import AESPluginJSError from '@ali/aes-tracker-plugin-jserror';
import AESPluginAutolog from '@ali/aes-tracker-plugin-autolog';
```

### 性能优化

- 本期统一采用 CSR 的方案
- 核心页面，目标要求在算上容器时间，首屏时间控制在 1s 以内

**Zcache **

配置手册

参考： 接入端可以搜索关键词【日本】

目前已接入的有 jp-fe/pay，

如何验证

https://appdevtools.alibaba-inc.com/，扫码后，点击【跨端实时日志】

如果 Zcache/Access ok，说明已成功。

Dataprefetch ？

### 稳定性

目标：1）可监控 2）高可用在 99.99% 以内

#### 稳定性监控

统一使用 aem 

稳定性埋点
```ts
import { sendEvent } from "@ali/odin-jp-api";
sendEvent('事件ID', {
  // 事件类型
  et: 'EXP',
  
  // 埋点级自定义参数，支持String、Number、Boolean、非基础类型请主动 JSON.stringify
  c1: '用户自定义参数1'
  ...
  c10
})
```

埋点规范
由于日本站埋点域名使用jp.mmstat.com，所以发送埋点前需要在 document 文档中设置如下meta

//pv日志
`<meta name="aplus-rhost-v" content="sg.mmstat.com"> `
//黄金令箭
`<meta name="aplus-rhost-g" content="sg.mmstat.com"> `

埋点使用
```ts
import { tracker } from "@ali/odin-jp-api";
export const recordLog = (type: string, values?: any) => {
  tracker.trackClick('/jp.pc_click.statweb_jp_click', {
    button_type: type,
    object_value: formatLogValues(values),
  });
};
```

常用方法

```ts
trackExpose(logKey: string, params?: IParams)
```

aplus曝光埋点

参数

logKey: 用于记录的唯一标识符。

params: (可选) 需要追踪的附加参数。

`trackClick(logKey: string, params?: IParams)`

aplus点击埋点

参数

logKey: 用于记录的唯一标识符。

params: (可选) 需要追踪的附加参数。

`trackSetPageSPM(spmA: string, spmB: string) `

⚠️ pha容器需要在每个页面入口 手动设置page spm （原因）

设置当前页面的SPM值。

参数

spmA: SPM A字段值。

spmB: SPM B字段值。

A+分析站点

- A+采集管理 https://log2.alibaba-inc.com/track/tools/spm?tenantId=44
- 注意⚠️
  ○ 访问新版需要找 加下灰度
  ○ 按业务创建应用

注意：A+采集正在切换为新版本，事件与spm注册均需在埋点管理中进行，若打开后仍然为旧版页面，可联系 江柏 添加灰度名单解决

https://aliyuque.antfin.com/tqigeb/np7bku/vki8p6s2bsk1bgfh?spm=loginner.28437197.header.1.54c6717dEFBNy5#HuTEl

踩坑：事件编码需要填写完整的编码，/业务.场景.事件


 新版A+分析产品中，租户为“AIDC日本”

https://aplus2.alibaba-inc.com/platform/basic-analysis-app?tenantId=44

APP 容器能力

一期用到的容器：ADC ，涉及到几个关键的 Native Module

模块名	解释	备注

module-windvane	基于通用 windvane 的业务封装，uc 的初始化、ua 的设置就在此处	

component-pha	基于手淘 PHA 的业务封装，大部分的容器增强能力都在此处	后续 AE 会逐步用 module-adc 来替换

module-adc	AE 基于 component-pha 抽离的 ADC 基座	一期不用

半浮层

url 加：adc_popup=true&adc_popup_ratio=0.9&pha_manifest=true

隐藏头部

- 方案1：disableNav=YES&status_bar_transparent=true&status_bar_hidden=true&pha_manifest=default
- 方案2：_immersiveMode=true

隐藏头部后，使用 odin-jp 里的 header 组件，会自适应 safe area.

隐藏分享按钮 _addShare=false

下拉刷新

使用软刷新的能力：

1. url 增加 pha_manifest=default&enable_pull_refresh=true 参数
2. 增加 addEventListenter
```ts
addEventListener('pullrefresh', (event) => {
  pha.pullRefresh.stop({});
  location.reload();
});
```

