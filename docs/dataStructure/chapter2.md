# 第 2 章 线性表

## 线性表的定义和基本操作

### 线性表的定义

线性表是具有相同数据类型的 n 个数据元素的有限序列。

相关概念：表头元素、表尾元素、直接前驱、直接后继

:warning

> - 线性表是一种**逻辑结构**，表示元素之间一对一的相邻关系。顺序表和链表是指存储结构， 两者属于不同层面的概念，因此不要将其混淆。

### 线性表基本操作

- `Initiist(&L)`: 初始化表。构造一个空的线性表
- `Length(L)`: 求表长。 返回线性表工的长度，即中数据元素的个数
- `LocateElem(L,e)`: 按值查找操作。在表 t 中查找具有给定关键字值的元素
- `GetElem(I，主)`:按位查找操作。获取表工中第 i 个位置的元素的值。
- `ListInsert(&L,i,e)`:插入操作。在表工中的第个位置上插入指定元素 e。
- `ListDelete(&L,i，&e)`:删除操作。删除表工中第 i 个位置的元素，并用 e 返回删除元素的值。
- `PrintList(L)`:输出操作。按前后顺序输出线性表 的所有元素值。
- `Empty(L)`:判空操作。若工为空表，则返回 true，否则返回 false。
- `DestroyList(&L)`:销毁操作。销毁线性表，并释放线性表工所占用的内存空间。

## 线性表的顺序表示

### 顺序表的定义

**定义：**线性表的顺序存储又称顺序表。它是用一组地址连续的存储单元依次存储线性表中的数据元 素，从而使得逻辑上相邻的两个元素在物理位置上也相邻。

**特点：**逻辑顺序与其在储的物理顺相同

> 线性表中元素的位序是从 1 开始的，而数组中元素的下标是从 0 开始的。

**数据结构描述**

静态分配

```c
#define MaxSize 50           // 定义线性表的最大长度
typeof struct{
    ElemType data[MaxSize];  // 顺序表的元素
    int length               // 顺序表的当前长度
} SqList;                    // 顺序表的类型定义
```

动态分配

```c
#define InitSize 50           // 表的初始长度
typeof struct{
    ElemType *data;          // 指示动态分配数组的指针
    int MaxSize, length       // 顺序表的当前长度
} SqList;                    // 顺序表的类型定义

// C 的初始动态分配语句为
L.data = (ElemType*)malloc(sizeof(ElemType)*InitSize);

// C ++的初始动态分配语句为
L.data = new ElemType(InitSize);

```

**优点：**
1、支持随机访问，可在 O(1)时间内找到制定元素
2、存储密度高，每个节点只存储数据元素

**缺点：**
1、插入删除需要移动大量元素，插入操作平均需要移动 n/2 个元素，删除操作平均需要移动(n- 1)/2 个元素。
2、顺序存储分配需要一段连续的存储空间，不够灵活

### 顺序表上的基本操作的实现

1. 顺序表的初始化
   静态分配

```c
// 声明一个顺序表
void InitList(SqList &L){
    L.Length = 0;
}

```

动态分配

```c
void InitList(SqList &L){
    L.data = (ElemType *)malloc(MaxSize * sizeof(ElemType));
    L.length = 0;
    L.MaxSize = InitSize;
}
```

2. 插入操作

```c
bool ListInsert(SqList &L, int i ,ElemType e){
    if(i<1 || i > L.length+1) return false; // 判断i(位序)的范围是否有效
    if(L.length >= MaxSize) return false; // 当前存储空间已满，不能插入
    for( int j=L.length; j>=i; j--){
        L.data[j] = L.data[j -1]; // 将第i 个元素及之后的元素后移

    }
    L.data[i - 1 ] = e; // 在位置主处放入e
    L.length++;
    return true;
}
```

最好情况：在表尾插入，时间复杂度 O(1)。
最坏情况：在表头插入，时间复杂度 O(n)。
平均情况：O(n)

3. 删除操作

```c
bool ListDelete(SqList &L, int i ,ElemType &e){
    if(i<1 || i > L.length+1) return false; // 判断i(位序)的范围是否有效
    e = L.data[i-1];
    if(L.length >= MaxSize) return false; // 当前存储空间已满，不能插入
    for( int j=i; j<L.length; j++){
        L.data[j-1] = L.data[j]; // 将第i 个元素及之后的元素前移

    }
    L.length--;
    return true;
}
```

最好情况：在表尾删除，时间复杂度 O(1)。
最坏情况：在表头删除，时间复杂度 O(n)。
平均情况：O(n)

4. 按值查找（顺序查找）

```c
int LocationElem(SqList L ,ElemType e){
    int i;
    for(int i = 0; i < L.length ; i++){
        if(L.data[i] ==e){
            return i+1;
        }
    }
    return 0;
}
```

最好情况：在表头，时间复杂度 O(1)。
最坏情况：在表尾，时间复杂度 O(n)。
平均情况：O(n)
