# 前端架构

例如： 日本前端项目基础能力

## 整体全貌

- **工作流**：直接选择用 Def（参考 SuperBuy）。背后逻辑：尽管 Dida 背后也是 Def , 但考虑到 Dida 和 Def 研发体验还是有一定差距，且平台有改造成本 & 大家开发有学习和切换成本，且生产关系上 Dida 不对我们负责，基于短期 & 长期研效最佳的方案的考虑（确定 CICD 平台）。
- **基础物料**：涉及到的全部 Fork 一轮，（基础包的使用）。@清洛
- **监控平台**：经过 AE 内部几个团队的调研，综合对比易用性下来，计划使用 aem-sg（参考 SuperBuy）（数据监控和埋点）
- **性能**：基于 CSR 架构的性能优化方案，后续长期再看 SSR 、流式 SSR 等。
- **图片**：背后 Filebroker，业务层使用 @车铭 开发的上传平台
  ○ 由于目前日本站的域名还在申请中，因此先到纵横平台上传图片资源，后续域名开通后，再将图片资源上传到诺亚提供的上传平台，再对项目中的链接做替换。
- **搭建**：本期不涉及

## 研发流程

#### 新建 ice 脚手架应用

在 615 之前，先用 assets ，后续可能得重新绑定域名，目前应用已经准备好
● 导购：
● 正向交易：
● 逆向交易：

#### document.tsx 配置

```html
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
        <meta name="aplus-rhost-v" content="jp.mmstat.com">
        //黄金令箭
        <meta name="aplus-rhost-g" content="jp.mmstat.com">
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

#### 基础能力配置

```js
// 监控
import { createAEM, getAESInstance } from '@ali/odin-jp-api'
createAEM({
  pid: 'jp-xxx',
  requiredFields: ['username'],
  plugins: {
    // 用户传入的其他插件和配置...
  },
})
export const aes = getAESInstance()
```

```js
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

```js
// 埋点上报
import { tracker } from '@ali/odin-jp-api'
export const click = (type: string, values?: any) => {
  tracker.trackClick('/jp.pc_click.statweb_jp_click', {
    button_type: type,
    object_value: formatLogValues(values),
  })
}
```

## 基础物料

> 组件原则：
>
> 1. 优先用 odin-jp 里的组件库
> 2. 其次用集团已有的组件库：https://hyper-kit.alibaba-inc.com/
> 3. 复杂表单，可以考虑使用 antd-mobile
> 4. 其他开源组件库使用最好找 松隐、清洛 review 一下
> 5. 包体积需要严格控制

1. 基础 ui 组件库
2. icon 库
3. 工具库
4. api 请求库
   接口请求与 mock
   基础版使用，传入 isMock 参数，可结合 ice 提供的 mock 能力，实现业务无倾入 mock

```js
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

可在 mock 目录下新建如下文件,调用上边 getStartRendData 方法时根据 isMock 参数来获取 mock 文件中的内容，
注意：文件名需要和 api 参数相同，如 mtop.aliexpress.buyer.reverse.batch.initiateReverseRender

```js
export default {
  'POST /mtop.aliexpress.buyer.reverse.batch.initiatereverserender': {
    api: 'mtop.aliexpress.buyer.reverse.batch.initiatereverserender',
    data: {
      module: {},
      notSuccess: false,
      repeated: false,
      retry: false,
    },
    ret: ['SUCCESS::调用成功'],
    v: '1.0',
  },
}
```

接口异常监控

结合 AEM 使用，可使用 initMtop 初始化请求，传入 aes 对象后，会配合接口异常插件，自动采集接口的异常

```js
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

## 性能

#### 性能监控

统一使用 aem

#### 性能优化

> 本期统一采用 CSR 的方案，整体等 @湘知 ready 后再讨论
> 核心页面，目标要求在算上容器时间，首屏时间控制在 1s 以内
> Zcache
> Dataprefetch

## 稳定性

目标：1）可监控 2）高可用在 99.99% 以内
统一使用 aem

## 埋点

由于日本站埋点域名使用 jp.mmstat.com，所以发送埋点前需要在 document 文档中设置如下 meta

```js
//pv日志
<meta name="aplus-rhost-v" content="jp.mmstat.com">
//黄金令箭
<meta name="aplus-rhost-g" content="jp.mmstat.com">
```

```js
// 埋点使用
import { tracker } from '@ali/odin-jp-api'
export const recordLog = (type: string, values?: any) => {
  tracker.trackClick('/jp.pc_click.statweb_jp_click', {
    button_type: type,
    object_value: formatLogValues(values),
  })
}
```
