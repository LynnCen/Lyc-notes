# 线性表的链式表示

## 单链表的定义

线性表的链式存储又称单链表，它是指通过一组任意的存储单元来存储线性表中的数据元素。为了建立数据元素之间的线性关系，对每个链表结点，除存放元素自身的信息之外，还需要存放一个指向其后继的指针。

```c
typeof struct LNode{
    ElemType data; // 数据域
    struct LNode *next; // 指针域
} LNode,*LinkList
```

头指针 L(或 head 等)来标识一个单链表，指出链表的起始地址，头指针为 NULI 时表示一个空表。

为了操作上的方便，在单链表第 一个数据结点之前附加 一个结点，称为头结点。头结点的数据域可以不设任何信息，但也可以记录表长等信息。单链表带头结点时， 头指针 L 指向头结点
![alt text](./img/头节点和头指针.png)

头结点和头指针的关系:不管带不带头结点，头指针都始终指向链表的第 一个结点，而头结 点是带头结点的链表中的第 一个结点，结点内通常不存储信息。

### 基本操作的实现

1.  单链表初始化

```c
// 带头节点
bool InitList(LinkList &L){
    L = (LNode*)malloc(sizeof (LNode));
    L ->next = NULL;
    return true;
}

// 不带头节点
bool InitList(LinkList &L){
    L = null;
    return true;
}
```

2. 求表长操作

```c
 // 不带头节点
int Length(LinkList L ){
    int Len = 0;
    LNode *p = L;
    while(p->next != NULL){
        p = p->next;
        Len++;
    }
    return Len
}
```

3. 按序号查找节点

```c
LNode *GetElem(LinkList L ,int i){
    LNode *p = L;
    int j=0;
    while(p !=NULL&&j<i){
        p = p->next;
        j++;
    }
    return p;

}
```

4. 按值查找表节点

```c
LNode *LocationElem(LinkList L, ElemType e){
    LNode *p = L;
    while(p != NULL&&p->data != e){
        p = p->next;
    }
    return p;

}
```

5. 插入结点操作

分前插法和后插法
![alt text](./img/单链表插入操作.png)

```c
// 找到第i-1的节点，再其后插入
bool ListInsert(LinkList &L , int i , ElemType e){
    LNode *p = L;
    int j=0;
    while( p!= NULL&& j<i-1){
        p = p->next;
        j++;
    }

    if( p ==NULL) return false;
    LNode *s = (LNode*)malloc(sizeof(LNode));
    // 后插法
    s->data = e;
    s->next = p->next;
    p->next = s;
    // 前插法 交换思想
    s->next = p->next;
    p->next = s;
    temp = p->data;
    p->data = s->data;
    s->data = temp;

    return true;
}
```

6. 删除结点
   删除结点操作是将单链表的第 i 个结点删除。先检查删除位置的合法性，然后查找表中第 1- 1 个结点，即被删结点的前驱，再删除第之个结点。

```c
bool ListDelete(LinkList &L, int i, ElemType &e){
    LNode *p = L;
    int j=0;
     while( p!= NULL&& j<i-1){
        p = p->next;
        j++;
    }

    if( p ==NULL) return false;
    LNode *q = p->next;
    e = q->data;
    p->next = q->next;
    free(q);
    return true;
}
```

7. 采用头插法建立单链表

```c
LinkList List_HeadInsert(LinkList &L){
    LNode *s;
    int x;
    L = (LNode*)maclloc(sizeof(LNode));
    L-next = NULL;
    scanf("%d",&x);
    while(x!=9999){
        s = (LNode*)malloc(sizeof(LNode));
        s->data = x;
        s->next = L->next;
        L->next = s;
        scanf("%d", &x);
    }

    return L ;
}
```

8. 采用尾插法建立单链表

需增加尾指针 r ，使其始终指向当前链表的尾结点

```c
LinkList List_TailInsert(LinkList &L){
    int x;
    L = (LNode*)malloc(sizeof(LNode));
    LNode *s , *r = L;
    scanf("%d",&x);
    while(x!=9999){
        s = (LNode*)malloc(sizeof(LNode));
        s->data = x；
        r->next = s;
        r = s;
        scanf("%d",&x);
    }
    r->next = NULL;
    return L

}
```

## 双链表

双链表结点中有两个指针`prior`和`next` ，分别指向其直接前驱和直接后继，

结点类型定义

```c
typedef struct DNode{
    ElemType data;
    Struct DNode *prior ,*next;
}DNode , *DNodeList;
```

1. 双链表的插入操作
   p s c 在 p 和 c 中插入 s

```c
s-next = p->next ;
p->next-prior = s;
p->next = s;
s-prior = p
```

2. 双链表的删除操作

删除结点*p 的后继结点 *q

```c
p->next = q->next ;
q->next->prior = p
free(q);
```

## 循环链表

1. 循环单链表
   表尾结点\*r 的 next 域指向 L，故表中没有指针域为 NULL 的结点，因此，循环单链表的判空条件不是头结点的指针是否为空，而是它是否等于头指针 L。
   设的是尾指针工， r- >next 即为头指针，对在表头或表尾插入元素都只需要 O(1)的时间复杂度。
   ![alt text](./img/循环单链表.png)
2. 循环双链表
   当循环双链表为空表时，其头结点的 prior 域和 next 域都等于 L。
   ![alt text](./img/循环双链表.png)

## 静态链表

静态链表是用数组来描述线性表的链式存储结构，结点也有数据域 data 和指针域 next， 与前面所讲的链表中的指针不同的是，这里的指针是结点在数组中的相对地址 (数组下标)，又 称游标 。静态链表也要预先分配一块连续的内存空间。
![alt text](./img/静态链表.png)

结构类型

```c
#define MaxSize 50;
typedef struct{
    ElemType data;
    int next;
} SLinkList[MaxSize]
```

静态链表以 next==- 1 作为其结束的标志

## 顺序表和链表的比较

1. 存取方式
2. 逻辑结构和物理结构
3. 查找、插入和删除操作
4. 空间分配

**如何选取存储结构**

1. 基于存储考虑
2. 基于运算考虑
3. 基于环境的考虑
