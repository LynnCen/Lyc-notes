# Transformer

> 2017 年 Google 论文 *"Attention Is All You Need"* 提出了 Transformer 架构，彻底改变了 NLP 乃至整个深度学习的格局。GPT、BERT、LLaMA……今天几乎所有大模型的底座都是 Transformer。这篇文档从「为什么需要它」出发，逐层拆解每一个组件，力求让你**看完就真正理解**。

---

## 一、从 RNN 的痛点说起

在 Transformer 之前，处理序列（文本、语音）的主流模型是 **RNN / LSTM / GRU**。它们的核心思路是「一步一步读」：

```
x₁ → h₁ → x₂ → h₂ → x₃ → h₃ → ... → xₙ → hₙ
```

这带来了两个致命问题：

| 问题 | 说明 |
|------|------|
| **无法并行** | 第 t 步的隐藏状态 hₜ 依赖 hₜ₋₁，必须串行计算，GPU 的并行能力被浪费 |
| **长距离遗忘** | 句子很长时，前面的信息传到后面已经「衰减」了。LSTM 的门机制缓解了但没根治 |

**Transformer 的回答**：扔掉循环结构，用 **Attention（注意力）** 让每个位置**直接**关注序列中的任意位置，一步到位、完全并行。

---

## 二、整体架构：一张图看全貌

Transformer 是一个 **Encoder–Decoder** 结构（以原始论文为例）：

```
                ┌────────────────────────────────────────┐
                │            Transformer                 │
                │                                        │
  输入序列 ───▶ │  ┌──────────┐      ┌──────────┐       │ ───▶ 输出序列
  (源语言)      │  │ Encoder  │ ───▶ │ Decoder  │       │     (目标语言)
                │  │  × N层   │      │  × N层   │       │
                │  └──────────┘      └──────────┘       │
                └────────────────────────────────────────┘
```

- **Encoder**（编码器）：读入完整输入序列，输出一组「理解后的表示」。
- **Decoder**（解码器）：基于 Encoder 的输出，逐步生成目标序列。
- 原论文中 N = 6，即 Encoder 和 Decoder 各有 6 层堆叠。

> **变体提示**：后来的模型并非都用完整的 Encoder-Decoder。  
> - **BERT**：只用 Encoder（擅长理解任务）。  
> - **GPT**：只用 Decoder（擅长生成任务）。  
> - **T5**：仍用 Encoder-Decoder。

---

## 三、核心组件逐一拆解

### 3.1 输入表示：词嵌入 + 位置编码

Transformer 没有循环，也没有卷积，所以它**天生不知道词的先后顺序**。为了让模型感知位置信息，需要在词嵌入（Word Embedding）上**加上**位置编码（Positional Encoding）：

```
输入表示 = Embedding(token) + PositionalEncoding(position)
```

#### 为什么是「加」而不是「拼接」？

拼接会增大维度、增加参数量。实验表明，加法在不增加维度的前提下效果足够好——位置信息和语义信息在同一个向量空间里「叠加」。

#### 位置编码怎么算？

论文使用**正弦-余弦函数**生成位置编码：

$$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

$$PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

- `pos`：该 token 在序列中的位置（0, 1, 2, ...）。
- `i`：向量的第 i 个维度。
- `d_model`：嵌入向量的总维度（论文中为 512）。

**直觉理解**：不同维度的正弦/余弦频率不同，组合起来每个位置都能得到**唯一的编码**，就像用不同频率的信号来编码坐标。而且正弦函数天然具有「相对位置可通过线性变换表达」的数学性质，便于模型学习相对距离。

---

### 3.2 Self-Attention：Transformer 的灵魂

**Self-Attention（自注意力）** 是整个架构最核心的创新。一句话概括：

> **让序列中的每个词，都能「看到」并「关注」序列中所有其它词，从而获得上下文感知的表示。**

#### 3.2.1 生活中的类比

想象你在读一句话：

> "小明把**它**放在了桌子上，因为**它**太重了。"

你在理解第二个「它」时，大脑会自动回去看前文，判断「它」指的是什么。这就是注意力机制在做的事——**动态地决定关注哪些位置**。

#### 3.2.2 Q、K、V：三个角色

Self-Attention 为序列中的每个 token 生成三个向量：

| 向量 | 全称 | 类比 |
|------|------|------|
| **Q** (Query) | 查询 | "我想找什么信息？" |
| **K** (Key)   | 键   | "我能提供什么信息？" |
| **V** (Value) | 值   | "我实际包含的信息" |

它们由输入向量 x 分别乘以三个可学习的权重矩阵 \(W^Q, W^K, W^V\) 得到：

$$Q = X \cdot W^Q, \quad K = X \cdot W^K, \quad V = X \cdot W^V$$

#### 3.2.3 计算过程（Scaled Dot-Product Attention）

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) V$$

分步理解：

**第一步：计算注意力分数**

```
Score = Q × Kᵀ    （矩阵乘法）
```

Q 的每一行（一个 token 的查询）和 K 的每一列（所有 token 的键）做点积。点积越大，表示这两个位置越「相关」。

**结果是一个 n×n 的矩阵**，n 是序列长度，每个元素代表「token i 对 token j 的关注程度」。

**第二步：缩放（Scale）**

```
Score = Score / √dₖ
```

为什么要除以 \(\sqrt{d_k}\)？当维度 \(d_k\) 很大时，点积的数值会很大，导致 softmax 输出趋近于 one-hot（梯度极小，学不动）。除以 \(\sqrt{d_k}\) 让数值回到合理范围。

**第三步：Softmax 归一化**

```
Weights = softmax(Score)   （每一行做 softmax）
```

将分数转为概率分布（每行之和为 1），代表每个 token 对其它 token 的「注意力权重」。

**第四步：加权求和**

```
Output = Weights × V
```

用注意力权重对 V 做加权求和。最终每个 token 的输出，是所有 token 的 Value 按注意力权重的加权混合——**包含了全局上下文信息**。

#### 3.2.4 一个具体例子

假设句子 "I love cats"，序列长度 n=3，\(d_k\)=4：

```
      Q × Kᵀ 得到 3×3 的注意力分数矩阵：

              I     love   cats
      I    [ 0.9    0.1    0.3 ]     ← "I"   最关注自己
      love [ 0.2    0.8    0.7 ]     ← "love" 关注 "love" 和 "cats"
      cats [ 0.1    0.6    0.9 ]     ← "cats" 最关注自己，也关注 "love"

      经过 softmax 后变成概率，再乘以 V，每个词获得了上下文感知的新表示。
```

---

### 3.3 Multi-Head Attention：多角度理解

只做一次 Attention 相当于只从「一个角度」看句子。**Multi-Head Attention 就是并行做多次 Attention**，让模型从不同的角度（子空间）捕捉不同类型的关系：

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \text{head}_2, \dots, \text{head}_h) \cdot W^O$$

$$\text{其中}\ \text{head}_i = \text{Attention}(QW_i^Q,\ KW_i^K,\ VW_i^V)$$

**原论文**：\(d_{model}\) = 512，h = 8 个头，每个头的维度 \(d_k = d_v = 512/8 = 64\)。

**直觉**：
- 某个头可能学会关注「语法关系」（主语 → 谓语）。
- 某个头可能学会关注「指代关系」（代词 → 名词）。
- 某个头可能学会关注「相邻词」（局部上下文）。

多头并行运行，最后拼接 + 线性变换，融合所有视角的信息。

---

### 3.4 残差连接 + 层归一化（Add & Norm）

Transformer 每个子层（Self-Attention 或 FFN）后面都有：

```
output = LayerNorm(x + SubLayer(x))
```

两个作用：

- **残差连接（Residual Connection）**：`x + SubLayer(x)`。让梯度可以直接「跳过」子层回传，解决深层网络的梯度消失问题。即使子层什么也没学到（输出为 0），信息也不会丢失。
- **层归一化（Layer Normalization）**：对每个样本的特征维度做归一化（均值为 0、方差为 1），稳定训练、加速收敛。

---

### 3.5 前馈神经网络（Feed-Forward Network, FFN）

每一层 Attention 之后，都会经过一个**逐位置的全连接前馈网络**：

$$FFN(x) = \text{ReLU}(xW_1 + b_1)W_2 + b_2$$

- 先升维（512 → 2048），经过 ReLU 激活，再降维（2048 → 512）。
- **逐位置**意味着每个 token 独立地通过同一个 FFN（参数共享），不涉及 token 间交互。

**为什么需要 FFN？**  
Self-Attention 擅长「混合不同位置的信息」，但它本质上是**线性变换 + softmax**，表达能力有限。FFN 引入了非线性（ReLU），增强模型的表达能力。可以理解为：Attention 负责「看哪里」，FFN 负责「想一想」。

---

### 3.6 Encoder 的完整结构

把以上组件组合起来，**一层 Encoder** 长这样：

```
输入
  │
  ▼
┌─────────────────────────┐
│  Multi-Head Self-Attention │
└────────────┬────────────┘
             │
       Add & Norm  ← 残差 + 层归一化
             │
┌────────────┴────────────┐
│    Feed-Forward Network    │
└────────────┬────────────┘
             │
       Add & Norm  ← 残差 + 层归一化
             │
             ▼
           输出（送入下一层 Encoder）
```

N 层 Encoder **堆叠**（每层结构相同，但参数独立），最终输出是对输入序列的**深层语义理解表示**。

---

### 3.7 Decoder 的完整结构

Decoder 比 Encoder 多了一个子层——**Cross-Attention**（交叉注意力），用于关注 Encoder 的输出：

```
目标序列输入（右移一位）
  │
  ▼
┌─────────────────────────────┐
│  Masked Multi-Head Self-Attention │  ← 只能看到「当前及之前」的位置
└────────────┬────────────────┘
             │
       Add & Norm
             │
┌────────────┴────────────────┐
│  Multi-Head Cross-Attention    │  ← Q 来自 Decoder，K/V 来自 Encoder 输出
└────────────┬────────────────┘
             │
       Add & Norm
             │
┌────────────┴────────────────┐
│    Feed-Forward Network        │
└────────────┬────────────────┘
             │
       Add & Norm
             │
             ▼
           输出（送入下一层 Decoder）
```

#### Masked Self-Attention：为什么要「遮挡」？

在生成任务中，Decoder 是**自回归**的——预测第 t 个词时，只能使用 1 到 t-1 个词的信息，不能「偷看」未来。

实现方式：在 softmax 之前，将注意力分数矩阵的**右上三角**设为 \(-\infty\)，这样 softmax 后这些位置的权重为 0：

```
              位置1  位置2  位置3  位置4
    位置1  [  0.5    -∞     -∞     -∞  ]
    位置2  [  0.3    0.7    -∞     -∞  ]
    位置3  [  0.1    0.4    0.6    -∞  ]
    位置4  [  0.2    0.3    0.1    0.8 ]
```

位置3 只能看到位置1、2、3，看不到位置4。

#### Cross-Attention：Encoder 和 Decoder 的桥梁

- **Q**（查询）来自 Decoder 当前层的输出——「我要找什么」。
- **K 和 V** 来自 Encoder 的最终输出——「源序列提供的信息」。

这让 Decoder 在生成每个词时，都能**回头看源序列**，找到最相关的部分。比如翻译时，生成法语单词会去 attend 对应的英语单词。

---

## 四、最终输出层

Decoder 最后一层的输出，经过一个**线性层 + Softmax**，映射到词表大小的概率分布：

```
Decoder 输出 → Linear(d_model → vocab_size) → Softmax → 概率分布
```

概率最高的词（或采样得到的词）就是模型预测的下一个 token。

---

## 五、训练相关

### 5.1 损失函数

标准的**交叉熵损失（Cross-Entropy Loss）**：比较模型输出的概率分布与真实标签（one-hot）的差异。

### 5.2 优化器与学习率

论文使用 Adam 优化器，并设计了**带 warmup 的学习率调度**：

$$lr = d_{model}^{-0.5} \cdot \min(step^{-0.5},\ step \cdot warmup\_steps^{-1.5})$$

前 warmup_steps 步线性增大学习率，之后按步数的平方根衰减。这个策略在 Transformer 训练中非常重要——过早用大学习率会导致训练不稳定。

### 5.3 Teacher Forcing

训练 Decoder 时，每一步的输入用的是**真实标签**（而非模型自己的预测）。这叫 Teacher Forcing，能加速收敛、稳定训练。

---

## 六、为什么 Transformer 如此成功？

| 优势 | 说明 |
|------|------|
| **完全并行** | 没有循环依赖，序列中所有位置同时计算，充分利用 GPU |
| **长距离建模** | 任意两个位置之间只隔「一层 Attention」，信息路径长度为 O(1)，RNN 是 O(n) |
| **可扩展性强** | 增大模型/数据/算力 → 性能持续提升（Scaling Law），这是大模型时代的基础 |
| **灵活架构** | Encoder-only（BERT）、Decoder-only（GPT）、Encoder-Decoder（T5）都能用 |
| **注意力可解释** | 注意力权重可以可视化，一定程度上可以看到模型「在关注什么」 |

---

## 七、复杂度分析

| 模型 | 每层计算复杂度 | 序列依赖距离 | 可并行 |
|------|----------------|-------------|--------|
| RNN | O(n · d²) | O(n) | 否 |
| CNN | O(k · n · d²) | O(logₖn) | 是 |
| **Transformer** | **O(n² · d)** | **O(1)** | **是** |

Transformer 的代价：**Self-Attention 的 n² 复杂度**。当序列很长（如 n=100,000）时，注意力矩阵占用的内存和计算量都很大。这也是后来各种「高效 Transformer」（如 Sparse Attention、Flash Attention、Linear Attention）要解决的问题。

---

## 八、从原始 Transformer 到现代大模型

原始 Transformer 之后，架构在持续演进：

| 演进方向 | 代表 | 说明 |
|----------|------|------|
| Encoder-only | BERT (2018) | 双向注意力，擅长理解/分类/抽取 |
| Decoder-only | GPT 系列 (2018-) | 自回归生成，擅长文本生成 |
| Encoder-Decoder | T5 (2019) | 统一的文本到文本框架 |
| 位置编码改进 | RoPE (2021) | 旋转位置编码，支持更好的长度外推 |
| 注意力优化 | Flash Attention (2022) | IO 感知的高效注意力实现 |
| 激活函数改进 | SwiGLU | 替代 ReLU，提升 FFN 表达能力 |
| 归一化改进 | RMSNorm, Pre-Norm | 更稳定的归一化方式和放置位置 |
| 超长上下文 | Ring Attention 等 | 支持百万级 token 的上下文窗口 |

---

## 九、总结

用一句话串起整个 Transformer：

> **把输入序列通过词嵌入 + 位置编码变成向量，经过多层「Self-Attention → FFN」反复提炼，每一层都让每个 token 充分感知全局上下文，最终输出高质量的语义表示。**

核心记忆点：

1. **Attention 是灵魂**：Q、K、V 三个矩阵，点积 → 缩放 → softmax → 加权求和。
2. **Multi-Head 看多面**：多个头并行，捕捉不同类型的关系。
3. **位置编码补顺序**：正弦/余弦函数为无循环结构注入位置信息。
4. **残差 + 层归一化**：保证深层网络训练稳定。
5. **FFN 加非线性**：Attention 看哪里，FFN 想一想。
6. **Mask 防偷看**：Decoder 的自回归特性靠 mask 保证。

理解了这些，你就掌握了当今几乎所有大模型的底层架构基础。
