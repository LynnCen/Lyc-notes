# K 近邻算法（KNN）与距离度量

> **核心思想**：物以类聚，人以群分 —— 通过样本周边 \(k\) 个最近邻的类别进行投票，从而判断样本属性。

---

## 一、KNN 算法入门

### 1. 例题：运用 KNN 进行影片分类

| 项目 | 说明 |
|------|------|
| **特征选择** | 搞笑镜头、拥抱镜头、打斗镜头（三个特征维度） |
| **标签编码** | 0：喜剧片 \| 1：动作片 \| 2：爱情片 |
| **预测目标** | 判断 `[23, 3, 17]`（《唐人街探案》）的电影类型 |

算法根据该样本在特征空间中与训练集中各样本的距离，找出最近的 \(k\) 个邻居，再按多数投票得到预测类别。

---

### 2. KNN 模型 API 介绍

#### （1）导入分类器

```python
from sklearn.neighbors import KNeighborsClassifier
```

- 注意包名大小写：`KNeighborsClassifier` 中 K、N、C 为大写，IDE 可能不会自动补全小写开头的名称。

#### （2）准备数据

- **特征数据**：二维数组/列表，每行一个样本，每列一个特征（如：搞笑、拥抱、打斗镜头数）。
- **标签数据**：一维数组，与样本一一对应，取值为类别编码（0/1/2）。

#### （3）实例化 KNN 模型

```python
knn_cls = KNeighborsClassifier(n_neighbors=3)
```

- **`n_neighbors`**：参与投票的最近邻数量 \(k\)。
- \(k\) 过小：容易过拟合，对噪声敏感；\(k\) 过大：容易欠拟合，边界模糊。需结合数据用交叉验证等方式调优。

#### （4）训练与预测

- **训练**：`estimator.fit(X, y)`，学习“特征 → 标签”的映射（KNN 实质是记住训练集，无显式模型参数）。
- **预测**：`predict(X_new)` 接收待预测样本的特征数组（保持与训练时相同的维度和顺序）。

#### （5）应用小结

- 流程：导入 `KNeighborsClassifier` → 准备 `x`、`y` → 实例化（如 `n_neighbors=3`）→ `fit(x, y)` → `predict(...)`。
- 本例中《唐人街探案》`[23, 3, 17]` 被预测为 **0（喜剧片）**。
- 输入特征顺序须与训练一致：搞笑、拥抱、打斗镜头。

---

## 二、代码实践

### 1. 基本流程：实例化 → 训练 → 预测

```python
from sklearn.neighbors import KNeighborsClassifier

# 特征矩阵（每行一部电影：搞笑、拥抱、打斗镜头）
x = [
    [39, 0, 31],   # 功夫熊猫
    [3, 2, 65],    # 叶问
    [2, 3, 55],    # 二次曝光
    # ... 共 9 部电影
]
# 标签向量：0-喜剧片，1-动作片，2-爱情片
y = [0, 1, 2, ...]

# 实例化并训练
knn_cls = KNeighborsClassifier(n_neighbors=3)
knn_cls.fit(x, y)

# 预测《唐人街探案》
result = knn_cls.predict([[23, 3, 17]])  # 输出: [0] → 喜剧片
```

---

### 2. 应用案例：KNN 电影分类编程实践

#### 数据说明

- 9 部电影，每部 3 个特征：**搞笑镜头、拥抱镜头、打斗镜头**。
- 示例：
  - 《功夫熊猫》`[39, 0, 31]` → 喜剧片(0)
  - 《叶问》`[3, 2, 65]` → 动作片(1)
  - 《二次曝光》`[2, 3, 55]` → 爱情片(2)

#### 常用参数

| 参数 | 含义 | 本例 |
|------|------|------|
| `n_neighbors` | 最近邻个数 \(k\) | 3 |
| `weights` | 邻居权重 | 默认 `"uniform"`（等权投票） |
| `metric` | 距离度量 | 默认 `"minkowski"`（闵可夫斯基） |

#### 预测接口

- **`predict()`**：返回预测类别（如 0、1、2）。
- **`predict_proba()`**：返回属于各类别的概率，便于分析置信度。

#### 结果与注意点

- 测试样本 `[23, 3, 17]` 预测为 **0（喜剧片）**，由 3 个最近邻投票决定。
- 建议：
  - 特征做尺度统一（如标准化），避免某一维主导距离。
  - 用交叉验证选取合适的 \(k\)。
  - 划分训练集/测试集评估泛化能力。
- KNN 天然支持多分类，无需 One-vs-Rest 等额外策略。
- 文件名避免与库冲突（如不用 `knn.py`），并保持代码分段清晰。

---

## 三、知识小结

| 知识点 | 核心内容 | 易混淆点 / 关键细节 | 应用示例 |
|--------|----------|----------------------|----------|
| **KNN 原理** | 基于“近朱者赤”，用样本周围 \(k\) 个邻居的类别投票分类 | \(k\) 需人工设定（如 \(k=3\)）；默认距离多为欧氏（由 `metric` 决定） | 用搞笑/动作/爱情镜头数区分喜剧、动作、爱情片 |
| **实现步骤** | ① 导入 `KNeighborsClassifier` ② 准备二维特征 + 一维标签 ③ 实例化、`fit` ④ `predict` 预测 | 特征必须是二维数组；`predict_proba()` 返回概率而非类别编码 | `knn = KNeighborsClassifier(n_neighbors=3)` → `fit` → `predict([[20,23,17]])` |
| **应用场景** | 小规模、低维分类（电影类型、用户画像等） | 高维易受“维度灾难”影响；特征与权重需人工设计 | 用“厨房物品”等特征推断读书/烹饪等爱好 |
| **参数调优** | `n_neighbors` 控制模型复杂度 | 小 \(k\) 易过拟合，大 \(k\) 易欠拟合；默认 5；建议交叉验证选 \(k\) | 比较 \(k=3\) 与 \(k=5\) 的准确率与泛化 |
| **与其他算法** | 无显式训练，依赖存储全部数据；计算量随样本数增加 | 与决策树：KNN 无树结构；与 SVM：KNN 计算成本随数据线性增长；均可做多分类 | 数据量小可用 KNN；特征复杂、需可解释性时可考虑决策树 |

---

# 距离度量

## 一、学习目标与四种距离

- **掌握**：欧氏距离、曼哈顿距离的计算与含义。
- **了解**：切比雪夫距离、闵可夫斯基距离的定义与在 KNN 中的作用。
- 四种距离均以外文人名命名：Euclidean（欧几里得）、Manhattan（曼哈顿）、Chebyshev（切比雪夫）、Minkowski（闵可夫斯基）。

---

## 二、欧氏距离（Euclidean Distance）

- **别称**：欧几里得距离。
- **公式**（\(n\) 维空间）：

\[
d_{\text{Euclidean}}(\mathbf{x}, \mathbf{y}) = \sqrt{\sum_{i=1}^{n}(x_i - y_i)^2}
\]

- **几何意义**：两点之间的直线距离。
- **示例**：
  - 二维：\((1,1)\) 与 \((2,2)\) → \(\sqrt{(2-1)^2 + (2-1)^2} = \sqrt{2}\)。
  - 三维：在二维基础上加上 \(z\) 坐标差的平方再开根。
- 是最直观的空间距离，sklearn 中 `metric="minkowski", p=2` 即欧氏距离。

---

## 三、曼哈顿距离（Manhattan Distance）

- **别称**：城市街区距离（City Block Distance）。
- **公式**：

\[
d_{\text{Manhattan}}(\mathbf{x}, \mathbf{y}) = \sum_{i=1}^{n}|x_i - y_i|
\]

- **几何意义**：只能沿坐标轴行走时的路径长度（横平竖直），如城市网格道路。
- **示例**：\((1,1)\) 到 \((2,2)\) → \(|2-1| + |2-1| = 2\)。
- **与欧氏关系**：同一对点上，曼哈顿距离 ≥ 欧氏距离；在直角路径下，红蓝两条直角路径等长。

---

## 四、切比雪夫距离（Chebyshev Distance）

- **典型应用**：国际象棋中国王的移动步数（可直行、横行、斜行，一步到相邻 8 格之一）。
- **公式**：取各维坐标差绝对值的最大值：

\[
d_{\text{Chebyshev}}(\mathbf{x}, \mathbf{y}) = \max_i |x_i - y_i|
\]

- **示例**：\((0,0)\) 到 \((3,4)\) → \(\max(3, 4) = 4\) 步。

---

## 五、闵可夫斯基距离（Minkowski Distance）

- **作用**：用同一公式统一表示上述多种距离。
- **公式**：

\[
d_{\text{Minkowski}}(\mathbf{x}, \mathbf{y}; p) = \left( \sum_{i=1}^{n}|x_i - y_i|^p \right)^{1/p}
\]

- **参数与对应关系**：

| \(p\) | 对应距离 |
|-------|----------|
| \(p=1\) | 曼哈顿距离 |
| \(p=2\) | 欧氏距离 |
| \(p \to \infty\) | 切比雪夫距离（极限形式为 \(\max_i |x_i - y_i|\)） |

sklearn 中 KNN 默认 `metric="minkowski"`，常配合 `p=2` 使用。

---

## 六、闵可夫斯基例题

**题目**：下列哪个是闵可夫斯基距离的通用表达式？

- A：\(p=1\) 时的形式（曼哈顿）
- B：\(p=2\) 时的形式（欧氏）
- C：\(p\to\infty\) 时的形式（切比雪夫）
- D：非标准距离表达式

**答案**：选 **D**。题目问的是“通用表达式”，A/B/C 都是特例，只有闵可夫斯基通式 \(d = \big(\sum |x_i - y_i|^p\big)^{1/p}\) 才是通用；若 D 描述的是该通式，则选 D，否则根据选项表述判断。考点在于区分“通式”与“特例”。

---

## 七、距离度量小结表

| 知识点 | 核心内容 | 考试/易错点 | 难度 |
|--------|----------|-------------|------|
| **欧氏距离** | 直线距离，差方和开根 \(\sqrt{\sum(x_i-y_i)^2}\) | 常写为“欧几里得距离”；适用于任意 \(n\) 维 | ⭐⭐ |
| **曼哈顿距离** | 城市街区距离，绝对误差之和 \(\sum|x_i-y_i|\) | 联想网格道路；与欧氏几何意义不同 | ⭐⭐ |
| **切比雪夫距离** | 棋盘王移动，取绝对误差最大值 \(\max_i|x_i-y_i|\) | 场景：棋盘路径；与曼哈顿“最大值”逻辑不同 | ⭐⭐⭐ |
| **闵可夫斯基距离** | 通式 \(\big(\sum|x_i-y_i|^p\big)^{1/p}\)，\(p=1/2/\infty\) 对应以上三种 | \(p=1\) 曼哈顿，\(p=2\) 欧氏，\(p=\infty\) 切比雪夫 | ⭐⭐⭐⭐ |
| **对比与选择** | 欧氏：平方和开根；曼哈顿：绝对和；切比雪夫：最大值 | 题目常给四个坐标点，要求选对公式或算距离 | ⭐⭐⭐ |

---

# 鸢尾花实战与超参数调优

## 一、鸢尾花数据集

### 1.1 数据集介绍

| 项目 | 说明 |
|------|------|
| **规模** | 150 条样本，每类 50 条，3 类均匀分布 |
| **类别** | 山鸢尾(Iris Setosa)、变色鸢尾(Iris versicolor)、弗吉尼亚鸢尾(Iris Virginica) |
| **特征** | 4 个：花萼长度/宽度(sepal length/width)、花瓣长度/宽度(petal length/width)，单位 cm |
| **记忆** | p 开头是花瓣(petal)，其余是花萼(sepal) |

分类依据：通过花瓣和花萼的形态差异区分三个品种。示例：山鸢尾 花萼 5.1×3.5 cm、花瓣 1.4×0.2 cm；变色鸢尾 花萼 6.4×3.5 cm、花瓣 4.5×1.2 cm；弗吉尼亚鸢尾 花萼 5.9×3.0 cm、花瓣 5.0×1.8 cm。

### 1.2 数据加载与属性

- **加载**：`load_iris()`，必须带括号调用。
- **常用属性**：

| 属性 | 含义 |
|------|------|
| `.data` | 特征矩阵 150×4 |
| `.target` | 标签数组，取值 0/1/2 |
| `.feature_names` | 特征名称（含单位，如 `'sepal length (cm)'`） |
| `.target_names` | 类别名称 |
| `.DESCR` | 数据集描述与统计信息 |

```python
from sklearn.datasets import load_iris

iris_data = load_iris()
print(iris_data.data[:5])
print(iris_data.target)
print(iris_data.feature_names)
print(iris_data.target_names)
```

### 1.3 转为 DataFrame 与可视化

- **转换**：`pd.DataFrame(iris_data.data, columns=iris_data.feature_names)`，列名需与 `feature_names` 完全一致（含空格、单位、英文括号）。
- **添加标签**：`iris_df['label'] = iris_data.target`。
- **绘图**：`seaborn.lmplot(x, y, data=iris_df, hue='label', fit_reg=False)`。`hue` 按类别着色；`fit_reg=False` 关闭回归线。

---

## 二、KNN 鸢尾花分类流程

### 2.1 整体流程

1. 获取数据集：`load_iris()`
2. 数据基本处理：划分训练/测试集
3. 特征工程：标准化（StandardScaler）
4. 模型训练：KNeighborsClassifier
5. 模型预测与评估：predict / score / accuracy_score

### 2.2 依赖与数据划分

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

iris_data = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris_data.data, iris_data.target, test_size=0.2, random_state=22
)
```

### 2.3 标准化（重要）

| 方法 | 用途 | 使用场景 |
|------|------|----------|
| `fit` | 只计算统计量（如均值、方差） | 仅拟合计 |
| `fit_transform` | 计算并转换 | **训练集** |
| `transform` | 用已有统计量转换 | **测试集**（避免数据泄露） |

```python
scaler = StandardScaler()
x_train = scaler.fit_transform(X_train)
x_test = scaler.transform(X_test)   # 测试集只用 transform
```

### 2.4 模型训练与预测

```python
model = KNeighborsClassifier(n_neighbors=3)  # 或 5 等
model.fit(x_train, y_train)

y_pred = model.predict(x_test)
# 或 model.predict_proba(x_test) 得到概率
acc = accuracy_score(y_test, y_pred)   # 或 model.score(x_test, y_test)
```

- **predict**：返回类别标签；**predict_proba**：返回各类别概率（每行和为 1）。
- 新数据预测前必须用**同一 scaler** 做 `transform`。

### 2.5 特征关系与选择

- 花瓣长度 + 花瓣宽度：类别更集中、边界更清晰，与 DESCR 中高相关性一致。
- 花萼长度 + 花瓣宽度：第 0 类易分，第 1、2 类有重叠。
- 可通过多组特征组合 + 散点图选择区分度更好的特征。

---

## 三、超参数选择：交叉验证与网格搜索

### 3.1 交叉验证（CV）

- **思想**：将训练集划分为 n 份，轮流用 1 份做验证、其余做训练，共 n 次，取平均得分。
- **CV=10**：10 折交叉验证。用于更稳定地评估模型，避免单次划分偶然性。

### 3.2 网格搜索（Grid Search）

- **作用**：在给定超参数候选（如 `n_neighbors: [1,3,5,7]`）上自动训练评估，选出最优组合。
- **与 CV 结合**：每组参数都用交叉验证评分，得到更可靠的最优参数。

### 3.3 GridSearchCV API

| 参数 | 含义 |
|------|------|
| `estimator` | 实例化后的模型（如 KNeighborsClassifier()） |
| `param_grid` | 字典，如 `{'n_neighbors': [4,5,7,9]}` |
| `cv` | 折数，如 4 或 5 |

| 属性 | 含义 |
|------|------|
| `best_score_` | 交叉验证最佳得分 |
| `best_estimator_` | 最优参数对应的模型（**应用时应用此模型**） |
| `cv_results_` | 每次 CV 的详细结果（可转 DataFrame 存 CSV） |

**注意**：`estimator.score(X_test, y_test)` 是**最后一轮**验证的模型得分，不一定等于 `best_score_`。应使用 `best_estimator_` 做最终预测。

### 3.4 代码示例

```python
from sklearn.model_selection import GridSearchCV

scaler = StandardScaler()
x_train = scaler.fit_transform(X_train)
x_test = scaler.transform(X_test)

param_grid = {'n_neighbors': [4, 5, 7, 9]}
estimator = GridSearchCV(
    KNeighborsClassifier(), param_grid, cv=4
)
estimator.fit(x_train, y_train)

print(estimator.best_score_)
print(estimator.best_estimator_)
best_model = estimator.best_estimator_
acc = best_model.score(x_test, y_test)
```

---

## 四、特征预处理与 API 小结

### 4.1 归一化与标准化

| 方法 | 公式 | API | 特点 |
|------|------|-----|------|
| 归一化 | (x−min)/(max−min)，缩放到 [0,1] | MinMaxScaler | 受极值影响大 |
| 标准化 | (x−μ)/σ，均值为 0、方差为 1 | StandardScaler | 更鲁棒，常用 |

### 4.2 API 小结

- 分类：`KNeighborsClassifier(n_neighbors=5)`
- 回归：`KNeighborsRegressor(n_neighbors=5)`
- 预处理：`StandardScaler()` / `MinMaxScaler()`；测试集只用 `transform`。

---

## 五、知识小结（鸢尾花与调参）

| 知识点 | 核心内容 | 易混淆点 / 注意 | 难度 |
|--------|----------|------------------|------|
| 鸢尾花数据集 | 150 条、3 类、4 特征（花萼/花瓣长宽）；p=花瓣 | 类别名、特征名与 feature_names 对应 | ⭐⭐ |
| 数据加载与格式 | load_iris() 必须加括号；DataFrame 列名与 feature_names 一致 | 中英文符号、空格、单位 | ⭐⭐ |
| 数据可视化 | sns.lmplot(x, y, data, hue='label', fit_reg=False) | hue 为字符串列名；plt.xlabel 不是 xLabel | ⭐⭐⭐ |
| 标准化 | 训练集 fit_transform，测试集 transform | 测试集不重新 fit，避免泄露 | ⭐⭐⭐ |
| KNN 训练流程 | 加载 → 划分 → 标准化 → 实例化 → fit → predict/score | 新数据预测前要同样标准化 | ⭐⭐⭐ |
| predict vs predict_proba | predict 返回类别；predict_proba 返回概率（行和为 1） | 评估时区分验证集与测试集 | ⭐⭐⭐ |
| fit/transform/fit_transform | fit 计算参数，transform 应用参数，fit_transform 计算并应用 | 面试高频 | ⭐⭐⭐⭐ |
| 交叉验证 | n 折轮流做验证集，取平均得分 | CV 值表示折数 | ⭐⭐ |
| 网格搜索 | 遍历参数组合，结合 CV 选最优 | param_grid 字典，key 为参数名 | ⭐⭐⭐⭐ |
| GridSearchCV 使用 | best_score_、best_estimator_、cv_results_ | 最终用 best_estimator_，不是默认 estimator | ⭐⭐⭐⭐ |

---

*文档包含 KNN 原理、电影分类、距离度量、鸢尾花实战与超参数调优，便于复习与查阅。*
