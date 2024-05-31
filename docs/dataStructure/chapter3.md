# 栈、队列和数组

**知识框架**

![alt text](./img/第3章知识框架.png)

## 栈

#### 栈的基本概念

1. 栈的定义
   `栈(Stack)`是只允许在一端进行插入或删除操作的**线性表**。操作特性概括为`后进先出（LIFO）`

2. 栈的基本操作

• `Initstack(&S)`:初始化一个空栈 S。
• `StackEmpty(S)`:判断一个栈是否为空，若栈 s 为空则返回 true，否则返回 false。
• `Push(&S，x)`:进栈，若栈 s 未满，则将 x 加入使之成为新栈顶。
• `Pop(&S，&x)`:出栈，若栈 s 非空，则弹出栈项元素，并用 x 返回。
• `Get Top (S，&x)`:读栈顶元素，但不出栈，若栈 S 非空，则用 x 返回栈项元素。
• `Destroystack(&S)`:销毁栈，并释放栈 S 占用的存储空间(“&” 表示引用调用)

栈的数学性质：当 n 个不同元素进栈时，出栈元素不同排列的个数为 （1 / n+1）C（n 2n）,这个公式称
为 `卡特兰数(Catalan)`公式，

#### 栈的顺序存储结构

1. 顺序栈的实现

采用顺序存储的栈称为顺序栈，它利用一组地址连续的存储单元存放自栈底到栈项的数据元素，同时附设一个指针`(top)`指示当前栈项元素的位置。

```c
#define MaxSize 50
typeof struct{
   ElemType data[MaxSize];
   int top;
}SqStack;
```

2. 顺序栈的基本操作

**（1）初始化**

```c
void InitStack(SqStack &S){
   S.top = -1;
}
```

**(2) 判栈空**

```c
bool StackEmpty(SqStack S){
   if(S.top === -1)return true;
   return false;
}
```

**(3) 进栈**

```c
bool Push(SqStack &S,ElemType x){
   if(S.top == MaxSize - 1) return false;
   S.data[++S.top] = x; // 指针先加1，再入栈
   return true;
}
```

**（4）出栈**

```c
bool Pop(SqStack &S , ElemType &x){
   if(S.top == -1)return false; // 栈空
   x = S.data[S.top--];
   return true;
}
```

**（5）读栈顶元素**

```c
bool GetTop(SqStack S , ElemType &x){
   if(S.top == -1)return false;
   x = S.data[S.top];
   return true;
}
```

3. 共享栈

利用栈底位置相对不变的特性，可让两个顺序栈共享一个一维数组空间 ，将两个栈的栈底分别设置在共享空间的两端，两个栈项向共享空间的中间延伸。

![alt text](./img/3.3%20共享栈.png)

判空： `top0= -1`时 0 号栈为空，`top1= MaxSize`时 1 号栈为空。
判满： 两个栈项指针相邻 `(top1 - top0 = 1) `时 ， 判断为栈满。
进栈： 当 0 号栈进栈时 `S.data[++S.top0] = x`top0 先加 1 再赋值，1 号栈进栈时 ` S.data[--S.top1] = x`top1 先减 1 再赋值。
出栈： `x = S.data[S.top0--]`,` x = S.data[S.top++];`

#### 栈的链式存储结构

采用链式存储的栈称为链栈，链栈的优点是便于多个栈共享存储空间和提高其效率，且不存 在栈满上溢的情况。通常采用单链表实现，并规定所有操作都是在单链表的表头进行的。这里规 定链栈没有头结点，Lhead 指向栈顶元素。
![alt text](./img/3.4栈的链式存储结构.png)

```c
typedef struct Linknode{
   Elemtype data;
   struct Linknode *next;
}LiStack
```

## 队列

#### 队列的基本概念

1. 队列的定义

`队列 (Queue)`简称队，也是一种操作受限的线性表，只允许在表的一端进行插入，而在表的另 一端进行删除。其操作特性是`先进先出（FIFO）`。`队头(Front)`允许删除的一端，又称队首。 `队尾(Rear)`允许插入的一端。

![alt text](./img/3.5队列.png)

2. 队列的基本操作

#### 队列的顺序存储结构

1. 队列的顺序存储

队列的顺序实现是指分配一块连续的存储单元存放队列中的元素，并附设两个指针:队头指针 front 指向队头元素，队尾指针 rear 指向队尾元素的下一个位置。

```c
#define MaxSize 50
typedef struct {
   ElemType data[MaxSize];
   int front,rear;
}SqQueue;
```

初始化：`Q.front = Q.rear = 0`;
进队：队不满时，先送值到队尾元素，再将队尾指针加 1。
出队：队不空时，先取队头元素值，再将队头指针加 1

2. 循环队列

初始时:`Q.front = Q.rear = 0`。
队首指针进 1: `Q.front = (Q.front + 1) % Maxsize`。
队尾指针进 1: `Q.rear=(Q.rear+1)%Maxsize`。
队列长度:`(Q.rear+MaxSize-Q.front)&Maxsize`

**循环队列的判空/判满**

三种处理方式：

1. 牺牲一个单元来区分队空和队满，入队时少用一个队列单元，队头指针在队尾指针的下一位置作为队满的标志.

队满条件：`(Q.rear + 1) % MaxSize = Q.front`
队空：`Q.front == q.rear`。
队列中的个数：`(Q.rear - Q.front + MaxSize ) % MaxSize`

2. 类型中增设 size 数据成员，表示元素个数。删除成功 size 减 1，插入成功 size 加 1。队空时 Q.size==0;队满时 Q.size==MaxSize，两种情况都有 Q.front==Q.rear。
3. 类型中增设 tag 数据成员，以区分是队满还是队空。删除成功置 tag=0，若导致 Q.front==Q.rear，则为队空:插入成功置 tag=1，若导致 Q.front==Q.rear，则为队满。
