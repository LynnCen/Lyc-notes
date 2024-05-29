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

```c
bool ListInsert(LinkList &L , int i , ElemType e){
    LNode *p = L;
    int j=0;
    while()
}
```
