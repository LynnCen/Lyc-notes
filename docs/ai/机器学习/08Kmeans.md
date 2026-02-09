# K-Means 聚类算法

> **核心思想**：根据样本间的相似性对样本进行分组，使同一簇内样本尽可能相似、不同簇间尽可能分离，从而发现数据内部结构与相互关系。

---

## 一、数据探索与聚类概览

### 1. 使用 KMeans 进行数据探索聚类

#### （1）K-Means 算法简介

| 项目 | 说明 |
|------|------|
| **核心思想** | 按样本相似性将样本集划分为 \(k\) 个簇，发现事物内部结构及相互关系 |
| **关键参数** | 需**预先指定**聚类数量 `n_clusters`（如 2/3/4），体现聚类的“自主设定”特性 |
| **实际应用** | 根据样本相似度探索数据结构，例如本案例数据可尝试 2/3/4 个簇并比较效果 |

算法通过迭代更新簇中心（质心）和样本归属，最小化簇内距离和（或等价目标），属于**无监督学习**。

#### （2）KMeans 模型构建流程概览

- **模型效果**：将原始数据按指定簇数聚类，本例中可对比 2 / 3 / 4 个簇的效果。
- **数据准备** → **实例化并预测** → **展示聚类效果** → **评估与调参**。

---

### 2. 数据准备

| 项目 | 说明 |
|------|------|
| **数据生成** | 使用 `make_blobs` 生成 1000 个样本，每个样本 2 个特征 |
| **质心位置** | `centers=[[-1,-1],[0,0],[1,1],[2,2]]`，共 4 个簇中心 |
| **离散程度** | `cluster_std=[0.4, 0.2, 0.2, 0.2]`，控制各簇的散布程度 |
| **可复现性** | `random_state=22`（或 11）固定随机种子，便于复现 |

**可视化要点**：

- 用 `plt.scatter(x[:,0], x[:,1])` 绘制散点：`x[:,0]` 为第一特征（横轴），`x[:,1]` 为第二特征（纵轴）。
- 特征矩阵 `x` 的**列**表示特征维度，本例为 2 维坐标。

---

### 3. 实例化模型并预测

- **模型初始化**：
  - `n_clusters`：聚类数量（如 2、3、4）。
  - `init='k-means++'`：优化质心初始化，减少陷入局部最优，默认会多次尝试选较优起点。
  - `random_state`：固定随机性，保证结果一致。
- **训练与预测**：
  - 使用 **`fit_predict(x)`** 一步完成训练和预测。
  - 无监督学习**不需要标签**，直接对特征 `x` 操作，得到每个样本的簇标签 `y_pred`。

---

### 4. 展示聚类效果

- 结果可视化：`plt.scatter(x[:,0], x[:,1], c=y_pred)`，用 `c=y_pred` 按预测簇标号着色（0/1/2/3 对应不同颜色）。
- 评估聚类质量：
  - 使用 **Calinski-Harabasz 指数**（`calinski_harabasz_score(x, y_pred)`），**分数越高**通常表示簇间分离越好、簇内越紧凑，效果越好。
  - 可对多个 `n_clusters` 取值分别聚类并计算该分数，选择较优的聚类数。

**注意**：`cluster_std` 越大数据越分散；特征量纲差异大时建议先标准化；k-means++ 一般比随机初始化更稳定。

---

## 二、无监督聚类 K-Means 实现

### 1. API 使用流程

1. **数据准备**：用 `make_blobs` 等生成或加载数据。
2. **模型构建**：使用 `KMeans` 类实例化并设置 `n_clusters` 等参数。
3. **训练与预测**：`fit_predict(x)` 得到聚类标签。
4. **效果评估**：如采用 `calinski_harabasz_score` 评估，并配合可视化对比。

---

### 2. 数据创建与展示

**关键参数**：

| 参数 | 含义 | 示例 |
|------|------|------|
| `n_samples` | 样本数 | 1000 |
| `n_features` | 特征数 | 2 |
| `centers` | 真实簇中心坐标 | `[[-1,-1],[0,0],[1,1],[2,2]]` |
| `cluster_std` | 各簇标准差 | `[0.4, 0.2, 0.2, 0.2]` |

**可视化**：`plt.figure()` 创建画布，`plt.scatter(x[:,0], x[:,1], marker='o')` 绘制散点图。

---

### 3. 数据生成示例代码

```python
from sklearn.datasets import make_blobs

x, y = make_blobs(
    n_samples=1000,
    n_features=2,
    centers=[[-1, -1], [0, 0], [1, 1], [2, 2]],
    cluster_std=[0.4, 0.2, 0.2, 0.2],
    random_state=11
)
```

---

### 4. 模型实例化与预测

**核心参数**：

| 参数 | 含义 | 说明 |
|------|------|------|
| `n_clusters` | 聚类数量 | 必须事先指定 |
| `init` | 质心初始化方式 | `'k-means++'` 优于随机 |
| `n_init` | 初始化尝试次数 | 1.4 版本后默认 `'auto'`，显式设置可避免警告 |

**预测**：`fit_predict(x)` 一次完成拟合与预测，返回每个样本的簇标签。

```python
from sklearn.cluster import KMeans

kmeans_cls = KMeans(n_clusters=2, init='k-means++', n_init='auto')
y_pred = kmeans_cls.fit_predict(x)
```

---

### 5. 模型评估与可视化

- **评估**：`calinski_harabasz_score(x, y_pred)`，分数越高聚类效果越好。
- **可视化**：对比“原始数据分布”与“按 `y_pred` 着色的聚类结果”；可尝试不同 `n_clusters` 并比较。

```python
from sklearn.metrics import calinski_harabasz_score

print(calinski_harabasz_score(x, y_pred))
plt.scatter(x[:, 0], x[:, 1], c=y_pred)
plt.show()
```

---

### 6. 参数调整实践

**典型实验**（示例数据）：

| n_clusters | Calinski-Harabasz 分数 | 说明 |
|------------|------------------------|------|
| 2 | 3125.94 | 簇数偏少 |
| 3 | 2964.31 | 略降 |
| 4 | **5813.86** | 本例最优，与真实 4 簇一致 |

- **选择策略**：比较不同 `n_clusters` 的 CH 分数；分数明显下降或拐点常对应较合理的簇数（需结合业务与可视化判断）。

---

### 7. 完整代码结构

1. 导入依赖（`sklearn.cluster.KMeans`、`sklearn.datasets.make_blobs`、`matplotlib`、评估指标等）。
2. 使用 `make_blobs` 创建测试数据。
3. 可选：可视化原始数据分布。
4. 实例化 `KMeans`，调用 `fit_predict(x)`。
5. 可视化聚类结果（按 `y_pred` 着色）。
6. 使用 CH 分数（及可选其他指标）评估效果。

**示例框架**：

```python
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
from sklearn.metrics import calinski_harabasz_score
import matplotlib.pyplot as plt

def kmeans_demo():
    # 数据准备
    x, y = make_blobs(n_samples=1000, n_features=2,
                      centers=[[-1,-1],[0,0],[1,1],[2,2]],
                      cluster_std=[0.4, 0.2, 0.2, 0.2],
                      random_state=11)

    # 原始数据可视化（可选）
    plt.figure(figsize=(6, 4))
    plt.scatter(x[:, 0], x[:, 1], marker='o')
    plt.title("Original data")
    plt.show()

    # 模型训练与预测
    kmeans = KMeans(n_clusters=4, init='k-means++', n_init='auto')
    y_pred = kmeans.fit_predict(x)

    # 结果评估与可视化
    print("CH Score:", calinski_harabasz_score(x, y_pred))
    plt.figure(figsize=(6, 4))
    plt.scatter(x[:, 0], x[:, 1], c=y_pred)
    plt.title("K-Means clustering (k=4)")
    plt.show()
```

---

### 8. 注意事项

| 项目 | 说明 |
|------|------|
| **版本兼容** | sklearn 1.4 后 `n_init` 默认改为 `'auto'`，显式设置可避免警告 |
| **数据标准化** | 特征量纲差异大时先标准化（如 StandardScaler），避免某些特征主导距离 |
| **随机种子** | 设置 `random_state` 保证实验可复现 |
| **初始质心** | 优先使用 `init='k-means++'`，比随机初始化更稳定 |

---

## 三、知识小结

| 知识点 | 核心内容 | 易混淆点 / 关键细节 | 难度 |
|--------|----------|----------------------|------|
| **K-Means 原理** | 迭代优化聚类中心，按距离将样本分配到最近簇 | 需**预先指定**簇数；初始中心对结果影响大 | ⭐⭐⭐⭐ |
| **聚类评估** | 可用 Calinski-Harabasz 指数、轮廓系数等；CH/轮廓越大越好 | 无监督指标与分类准确率等监督指标区分开 | ⭐⭐⭐ |
| **数据与标准化** | 通过 `cluster_std` 控制生成数据离散程度；实际数据常需标准化 | 标准差与分布形状、聚类边界清晰度的关系 | ⭐⭐ |
| **随机种子** | `random_state` 固定后每次运行结果一致 | 不设置则每次可能不同，影响复现与调参 | ⭐ |
| **聚类可视化** | 用 matplotlib 按 `y_pred` 着色展示不同簇 | 高维时需降维或选两维再画图 | ⭐⭐ |
| **无监督特点** | 只需特征 `x`，用 `fit_predict(x)` 一步得到标签 | 与监督学习的 `fit(x,y)` + `predict(x)` 区分 | ⭐⭐⭐ |
| **多维数据** | `n_features` 控制生成数据维度；高维距离仍可用欧氏等 | 高维易出现“维度灾难”，可视化困难 | ⭐⭐⭐⭐ |
| **参数调优** | `n_init` 控制质心初始化次数；`n_clusters` 需人工或指标辅助选择 | 初始化次数与计算效率的权衡 | ⭐⭐⭐ |

---

*文档已按“原理 → 数据 → 建模 → 评估 → 代码与注意点 → 知识小结”整理，便于复习与实现 K-Means 聚类。*
