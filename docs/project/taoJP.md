# Tao日本逆向前端基础架构

## 项目概述

项目概述：全流程包裹维度的逆向入口优化

项目背景：

在电商平台的逆向物流流程中，用户申请退款和退货的场景复杂多样。为了提高用户体验和运营效率，我们对全流程包裹维度的逆向入口进行了优化，确保在特定情况下能够快速、准确地处理用户的退款请求。

项目职责：

- 负责设计和优化逆向物流入口，确保用户在不同订单状态下能够正确选择"仅退款"或"退货退款"选项。
- 针对未发货、已发货、物流异常等不同场景，制定相应的退款策略和流程。
- 与物流平台对接，确保在物流异常情况下能够及时下发拒收指令，并引导用户发起仅退款。
- 处理多子单退款场景，支持部分子单退款和整包仅退款，确保退款流程的灵活性和准确性。

项目成果：

- 实现了全流程包裹维度的逆向入口优化，提升了用户退款申请的便捷性和准确性。
- 在物流异常场景下，通过引导用户发起仅退款，减少了用户等待时间和纠纷率。
- 支持多子单部分退款功能，提高了退款处理的灵活性和用户满意度。

技术亮点：

- 与物流平台深度对接，实现拒收指令的自动下发。
- 针对不同订单状态和物流场景，设计了差异化的退款策略。
- 优化了多子单退款流程，支持部分子单退款和整包仅退款，提升了运营效率。

项目影响：

- 用户退款申请的处理时间缩短了30%，用户满意度提升了20%。
- 物流异常场景下的纠纷率降低了15%，运营成本得到了有效控制。

---

## 整体全貌

- **工作流**：直接选择用 Def（参考 SuperBuy）。背后逻辑：尽管 Dida 背后也是 Def , 但考虑到 Dida 和 Def 研发体验还是有一定差距，且平台有改造成本 & 大家开发有学习和切换成本，且生产关系上 Dida 不对我们负责，基于短期 & 长期研效最佳的方案的考虑。
- **基础物料**：涉及到的全部 Fork 一轮
- **监控平台**：经过 AE 内部几个团队的调研，综合对比易用性下来，计划使用 aem-sg（参考 SuperBuy）
- **性能**：基于 CSR 架构的性能优化方案，后续长期再看 SSR 、流式 SSR 等。
- **图片**：背后 Filebroker，业务层使用 开发的上传平台
  - 由于目前日本站的域名还在申请中，因此先到纵横平台上传图片资源，后续域名开通后，再将图片资源上传到诺亚提供的上传平台，再对项目中的链接做替换。
- **搭建**：本期不涉及

---

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

---

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

使用[lerna_monorepo](./lerna_monorepo.md)统一收敛进`odin-jp`现在收敛到如下包

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

### [odin-jp组件库文档](./odin_document.md)

组件库预览文档

文档地址：[https://tmg-odin.pages.alibaba-inc.com/components/button](https://tmg-odin.pages.alibaba-inc.com/)

组件库需求请填写至组件库需求文档

###  @ali/odin-jp-ui

`@ali/comet-ui`替换为`@ali/odin-jp-ui`，本质上是对`@ali/comet-ui`的封装

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
```

#### icon更新方案

在japan-components库中，执行`tnpm run iconUpdate`命令，输入要更新的icon名字即可，更新后会在icon目录中新增该icon的文件

注意：名字需要和Japan_TAO中的icon名字一致（不区分大小写），因为默认从该项目中拉取icon

```tsx
import { TbjIcAdd } from '@ali/odin-jp-icon';
<TbjIcAdd style={{ fontSize: '16px', color: '#08c' }} />;
```

### @ali/odin-jp-hook

fork自`@ali/comet-hooks`

目前提供了两个hook `useResponsive`和`useCountdown`，主要是原AE项目中存在判断pc和移动端的需求，本次日本站关于`useResponsive`的逻辑可以移除掉，默认都是用移动端的逻辑，使用方法

新增`useSetState`hook

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

---

## 性能

### 性能监控

统一使用 aem 

### aem 支持

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

<div class='text-red-600'>有些必要参数（如uid）可能需要异步获取，但我们又不希望延迟初始化导致期间的埋点丢失，这时可以在初始化时或者在SDK加载前配置requiredFields参数，配置完之后再进行发送</div>
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

**Zcache**

1. 预加载资源管理：平台以ZCache包为单位管理预加载资源，目前有两种资源组织类型：前缀类型和页面URL类型
2. 多客户端投放：同一ZCache包可投放到多个客户端
3. 灰度能力：支持按百分比放量
4. 数据分析能力：平台提供 ZCache 包的完整实时数据，包括命中率、版本分布情况和更新成功率。支持天、小时、分钟三种级别的报表和分客户端查看。


**Dataprefetch**

---

## 稳定性

目标：1）可监控 2）高可用在 99.99% 以内

### 稳定性监控

统一使用 aem 

### 稳定性埋点
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

### 埋点规范

由于日本站埋点域名使用jp.mmstat.com，所以发送埋点前需要在 document 文档中设置如下meta

//pv日志
`<meta name="aplus-rhost-v" content="sg.mmstat.com"> `
//黄金令箭
`<meta name="aplus-rhost-g" content="sg.mmstat.com"> `

### 埋点使用
```ts
import { tracker } from "@ali/odin-jp-api";
export const recordLog = (type: string, values?: any) => {
  tracker.trackClick('/jp.pc_click.statweb_jp_click', {
    button_type: type,
    object_value: formatLogValues(values),
  });
};
```

### 常用方法

`trackExpose(logKey: string, params?: IParams)`

aplus曝光埋点

参数

`logKey:` 用于记录的唯一标识符。

`params:` (可选) 需要追踪的附加参数。



`trackClick(logKey: string, params?: IParams)`

aplus点击埋点

参数

`logKey`: 用于记录的唯一标识符。

`params`: (可选) 需要追踪的附加参数。

`trackSetPageSPM(spmA: string, spmB: string) `

> ⚠️ pha容器需要在每个页面入口 手动设置page spm （原因）

设置当前页面的SPM值。

参数

`spmA`: SPM A字段值。

`spmB`: SPM B字段值。

### [A+分析站点](../posts/埋点.md)

通识基础：
- 分析指标概念，如PV（页面浏览量），UV（独立访客数），跳转点击，访问时长。
- 埋点与事件，如点击，浏览，停留时间和黄金令箭。
- SPM，如A位，B位，C位，D位
- SCM

● A+采集工作台：https://log2.alibaba-inc.com/track?tenantId=10&spm=aplus_put_channel.29903622.0.0 
● A+流量分析：https://aplus2.alibaba-inc.com/platform/dashboard?spm=aplus_put_channel.29903622.0.0 

---

## APP 容器能力

一期用到的容器：ADC ，涉及到几个关键的 Native Module，weex容器，pha容器，rax容器，

模块名	解释	备注

module-windvane	基于通用 windvane 的业务封装，uc 的初始化、ua 的设置就在此处	

component-pha	基于手淘 PHA 的业务封装，大部分的容器增强能力都在此处	后续 AE 会逐步用 module-adc 来替换

module-adc	AE 基于 component-pha 抽离的 ADC 基座	一期不用

### 半浮层

url 加：adc_popup=true&adc_popup_ratio=0.9&pha_manifest=true

### 隐藏头部

- 方案1：disableNav=YES&status_bar_transparent=true&status_bar_hidden=true&pha_manifest=default
- 方案2：_immersiveMode=true

隐藏头部后，使用 odin-jp 里的 header 组件，会自适应 safe area.

隐藏分享按钮 _addShare=false

### 下拉刷新

使用软刷新的能力：

1. url 增加 pha_manifest=default&enable_pull_refresh=true 参数
2. 增加 addEventListenter
```ts
addEventListener('pullrefresh', (event) => {
  pha.pullRefresh.stop({});
  location.reload();
});
```

