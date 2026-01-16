#

# 1 推荐能力 框架图

# 2 推荐能力详细介绍

| 阶段 | 子阶段 | 具体介绍 |
| --- | --- | --- |
| 过滤 | 政治敏感过滤 | [政治敏感过滤] |
| 曝光过滤 | ） |
| 过气热点 | 离线过气热点过滤 |
| 召回 | 热度召回 | [2.1.0 热度召回](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=176929106) |
| 实时点击召回 | [2.1.7.2 实时点击模板召回](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=168645749) |
| 实时搜索召回 | [2.1.7.5 实时queryi2i](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=168645777) |
| 人群标签召回 | [2.1.9 人群标签召回](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=185228365) |
| sem召回 | [2.1.10 sem召回](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=185228367) |
| 历史行为相似召回 | [2.1.7.0 离线i2i召回](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=185228465) |
| 历史点击相似召回 | [2.1.7.1 离线clicki2i](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=151726658) |
| 历史收藏相似召回 | [2.1.7.4 离线收藏i2i](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=168645667) |
| 历史下载相似召回 | [2.1.7.3 离线downloadi2i](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=168645697) |
| dac召回 | [2.1.5.1 Web模板中心DAC（Deep Attention Cross） 召回模型1](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=123766180)；除了个性化推荐以外，也通过该模型训练用户冷启动的数据，即拿userid=0的用户训练dac模型，得到 dac_common，这是冷启动用户的推荐结果 |
| dssm召回 | [2.1.4.2 稿定Web DSSM召回](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=151726650) [2.1.4.1 稿定App-DSSM](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=160280496) |
| 相似召回 | [2.1.7.6 item2vec模板/素材相似召回](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=151726642) |
| 个性化召回仅召回优质内容池的内容 | |
| 融合 | [融合策略] | 内容优质分： 内容优质分=内容是否优质+热度分 内容是否优质：即，内容是否在优质内容池内，若在则分值为100，否则分值为0 |
| 精排 | - | [20221027-WEB模板中心CTR精排-V3](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=263063436) [web编辑器相似推荐精排模型](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=176932064) |
| 重排 | 过气热点打压 | [过气热点打压] |
| 付费模板置顶 | [付费模板置顶]， 针对注册超过30天的非会员仅查看付费内容和公益内容 |
| 运营人工干预 | [排序结果干预_操作指引] |
| 比例混排 | [流量池后台_操作指引]，设置好混排比例后，根据混排比例取完后按照ctr得分排。 20个一桶，比如比例设置10%，那么每20个里，有20*10%=2个这一路的召回。不足比例的，用base补足 |
| 多样性打散 | |
| 实时曝光打压 | [20240126 双端端曝光打压逻辑优化（优化为取最近14天数据）（需ab）] [20231213-排序结果干预后台支持配置曝光打压] |

# 3 各坑位策略现状

链接：

## 3.1 稿定-web

### 3.1.1 模板中心/场景页模板中心/营销日历/首页-瀑布流-推荐分类内容

详见：[模板中心/场景页模板中心/营销日历]/首页瀑布流推荐分类/首页内容专栏推荐

专栏之间顺序的推荐逻辑：[20231023-WEB推荐页内容分发维度路径优化](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=333263465)

- 取轻舟人群标签配置顺序逻辑
- 子tab取筛选器热度排

### 3.1.2 最新/最热专栏

详见：[新品\热门专栏推荐]

### 3.1.3 编辑器左侧栏-模板tab/找相似弹窗/模板详情页相似推荐

详见：

### 3.1.4 编辑器左侧栏-素材

详见：[编辑器左侧栏模板推荐素材]

### 3.1.5 编辑器左侧栏-素材相似素材推荐

详见：[素材相似推荐]

## 3.2 稿定-APP

### 3.2.1 创作页瀑布流/模板页瀑布流

详见：[创作页瀑布流/模板页瀑布流/场景页瀑布流/营销日历]

### 3.2.2 最新/最热专栏（同web端逻辑）

详见：[新品\热门专栏推荐]

### 3.2.3 模板详情页相/图片模板编辑器-换模板

详见 ：[模板详情页]/[编辑器内换模板]

### 3.2.4 图片标记编辑器-换模板

### 3.2.5 编辑器左侧栏-素材为你推荐（逻辑同web）

详见：[编辑器左侧栏模板推荐素材]

### 3.2.6 编辑器左侧栏-素材相似素材推荐（逻辑同web）

详见：[素材相似推荐]

### 3.2.7 模板编辑器-作图完成页

详见：[模板编辑器作图完成页]

### 3.2.8 我的收藏

详见：[收藏夹]

## 3.3 稿定-art-ai社区

### 3.3.1 关联推荐

详见： 稿定ai社区增加作品/模板图搜能力支持
通过图搜能力进行支持