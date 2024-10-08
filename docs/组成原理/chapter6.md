# 第 6 章 总线

## 总线的概述

### 总线基本概念

1. **总线的定义**

总线是一组能为多个部件分时和共享的公共信息传送线路

2. **总线设备**

3. **总线特性**

### 总线的分类

1. 按功能层次分类

片内总线、系统总线、I/O 总线、通信总线

2. 按时序控制方式分类

同步总线、异步总线

3. 按数据传输方式分类

串行总线、并行总线

### 系统总线的结构

1. 单总线结构

单总线结构将 CPU、主存、I/O 设备(通过 I/O 接口)都挂在一组总线上，允许 I/O 设备之间、I/O 设备与主存之间直接交换信息

2. 双总线结构

双总线结构有两条总线: 一条是主存总线，用于在 CPU、主存和通道之间传送数据;另 一条 是 I/O 总线，用于在多个外部设备与通道之间传送数据

3. 三总线结构

三总线结构是在计算机系统各部件之间采用 3 条各自独立的总线来构成信息通路，这 三条总 线分别为主存总线、1/O 总线和直接内存访问(DMA)总线

### 总线的性能指标

1. 总线时钟周期。即机器的时钟周期。计算机有一个统一的时钟，以控制整个计算机的各个部件，总线也要受此时钟的控制。

2. 总线时钟频率。即机器的时钟频率，它为时钟周期的倒数。

3. 总线传输周期。指一次总线操作所需的时间，包括申请阶段、寻址阶段、传输阶段和结束阶段。总线传输周期通常由若干总线时钟周期构成。

4. 总线工作频率。总线上各种操作的频率，为总线周期的倒数。实际上指 1 秒内传送几次数据。若总线周期=N 个时钟周期，则总线的工作频率=时钟频率/N;此外，若一个时钟周期可以传送 K 次数据，则总线工作频率是总线时钟频率的 K 倍。

5. 总线宽度。总线宽度也称总线位宽，是总线上能够同时传输的数据位数，通常指数据总线的根数，如 32 根称为 32 位总线 。

6. 总线带宽。单位时间内总线上最多可传输数据的位数，通常用每秒传送信息的字节数来衡量，单位可用字节/秒(B/s)表示。总线带宽=总线工作频率 x(总线宽度/8)。

7. 总线复用。总线复用是指一种信号线在不同的时间传输不同的信息。例如，有些总线没有单独的地址线，地址信息通过数据线来传送，这种情况称为地址/数据线复用。因此可以使用较少的线传输更多的信息，从而节省空间和成本。

8. 信号线数。地址总线、数据总线和控制总线 3 种总线数的总和称为信号线数

其中 ，总线最主要的性能指标为总线宽度、总线工作频率、总线带宽。总线带宽是指总线的最大数据传输速率，它是衡量总线性能的重要指标。三者的关系:总线带宽=总线宽度 x 总线工作频率。例如，总线工作频率为 22MHz，总线宽度为 16 位，则总线带宽=22Mx(16/8)=44MB/s。

## 总线事务和定时

### 总线事务

从请求总线到完成总线使用的操作序列称为总线事务，它是在一个总线周期中发生的一系列 活动。典型的总线事务包括请求操作、仲裁操作、地址传输、数据传输和总线释放

1)请求阶段。主设备(CPU 或 DMA)发出总线传输请求，并且获得总线控制权。

2)仲裁阶段。总线仲裁机构决定将下一个传输周期的总线使用权授予某个申请者。

3)寻址阶段。主设备通过总线给出要访问的从设备地址及有关命令，启动从模块。

4)传输阶段。主模块和从模块进行数据交换，可单向或双向进行数据传送。

5)释放阶段。 主模块的有关信息均从系统总线 上撤除，让出总线使用权。

总线上的数据传送方式分为**非突发方式**和**突发方式**两种

**非突发传送方式**在每个传送周期内 都先传送地址，再传送数据，主、从设备之间通常每次只能传输一个字长的数据。

**突发(猝发)传送方式**能够进行连续成组数据的传送，其寻址阶段发送的是连续数据单元的首地址，在传输阶段传送多个连续单元的数据，每个时钟周期可以传送一个字长的信息，但是不释放总线，直到一组数据全部传送完毕后，再释放总线

### 总线定时

总线定时是指总线在双方**交换数据的过程中**需要时间上配合关系的控制，这种控制称为总线定时，其实质是一种协议或规则，主要有同步、异步、半同步和分离式四种定时方式。

1. 同步定时方式

指系统采用一个统一的时钟信号来协调发送和接收双方的传送定时关系。时钟产生相等的时间间隔，每个间隔构成一个总线周期

2. 异步定时方式

没有统一的时钟，也没有固定的时间间隔，完全依靠传送双方相互制约 的“握手” 信号来实现定时控制。

3. 半同步定时方式

4. 分离式定时方式


## 强化

1. 总线的分类

片总线、系统总线、

数据总线、地址总线、控制总线（区分传输内容）

2. 总线结构

单总线、双总线、三总线

3. 总线带宽的计算

单位时间内所能传输数据的位数

总线带宽 = 总线宽度 x 总线工作频率

4. 总线数据传输方式

突发数据传送：寻址一次，传输阶段连续传输多个单元数据

非突发传送：先传首地址，再传送数据

5. 总线定时的方式和特点

同步定时方式：采用同一个统一的时钟信号来协调

异步定时方式：没有统一的时钟信号协调，通过双方约定握手信号实现定时控制（不互锁、半互锁、全互锁 是否需要响应）

异步串行方式的特点：使用开始位和结束位作为标志

半同步定时方式：

分离式定时方式：





