# 第二章 线性表 课后习题

## 线性表

### 顺序表

 **设将n(n>1)个整数存放到一维数组R中。设计一个在时间和空间两方面都尽可能高效的算法。将R中保存的序列循环左移p(0<P<n)个位置，即将R中的数据由(Xo,X1,...Xn-1)变换为(Xp,Xp+1,Xn-1,Xo,...,Xp-1)。要求:**

1️⃣ 给出算法的基本设计思想。

2️⃣ 根据设计思想，采用C或C++或Java语言描述算法，关键之处给出注释。 

3️⃣ 说明你所设计算法的时间复杂度和空间复杂度

**解法一（暴力解）：**

1️⃣ 构建一个辅助数组B[n]，依次遍历数组A，若i小于p，则将A[i]中的数据加入到B[n-p+i]，若i>=p，则将A[i]放入B[j]的位置。

2️⃣ 如下
```c

int[] leftMove(int A[],int p,int n){

  int j = 0;
  int B[n];

  for(int i=0 ; i<n;i++){
    if(i<p){
      B[n-p+i] = A[i]
    }else{
      B[j] = A[i];
      j++
    }
  }

  return B;

}
```

3️⃣ 时间复杂度O(n)、空间复杂度O(n);

**解法二（最优解）**

1️⃣ 可将问题视为把数组ab转换成数组ba(a代表数组的前p个元素，b代表数组中余下的n-p个元素)，先将a逆置得到a^-1 b，再将b逆置得到a^-1 b^-1，最后将整个a^-1 b^-1逆置得到(a^-1 b^-1)^-1=ba。设Reverse函数执行将数组逆置的操作，对abcdefgh向左循环移动3(p=3)个位置的过程如下:

Reverse(0,p-1)得到cbadefgh:

Reverse(p,n-1)1Ilcbahgfed;

Reverse(0,n-1)得到defghabc。

注:在Reverse中，两个参数分别表示数组中待转换元素的始末位置。

2️⃣ 如下
```c

void Reverse(int A[],int from , int to){
  int temp;
  for(int i=0; i< (to - from + 1)/2;i++){
    temp = A[from+i];
    A[from+i] = A[to-i];
    A[to -i] = temp;
  }
}

int[] Converse(int A[],int n , int p){
  Reverse(A,0,p-1);
  Reverse(A,p,n-1);
  Reverse(A,0,n-1);
}

```

Reverse函数的时间复杂度为O(p/2),O((n-p)/2),O(n/2);

3️⃣ 故时间复杂度O(n),空间复杂度O(1)

**一个长度为L(L≥1)的升序序列S，处在第「L/2 个位置的数称为S的中位数。例如，若序列S1=(11,13,15,17,19)，则S1的中位数是15，两个序列的中位数是含它们所有元素的升序序列的中位数。例如，若S2=(2,4,6,8,20)，则S1和S2的中位数是11。现在有两个等长升序序列A和B，试设计一个在时间和空间两方面都尽可能高效的算法，找出两个序列4和B的中位数。要求**

1️⃣ 给出算法的基本设计思想。

2️⃣ 根据设计思想，采用C或C++或Java语言描述算法，关键之处给出注释。 

3️⃣ 说明你所设计算法的时间复杂度和空间复杂度



**解法一（双指针）：**

1️⃣ 定义两个指针，分别代表

```c
int SearchBinary(int A[] ,int l1,int B,int l2){
  int i = 0 ,j = 0,binary = 0;
  for(int k=0;k<(l1+l2 - 1)/2;k++){
    if(A[i]>b[j]){
      binary = A[i];
      j++
    }else{
      binary = B[j];
      i++
    }
  }
  return binary;
}
```


**找主元素x x的个数大于/2n**

1️⃣ 定义一个新数组B，初始值全为0，遍历数组A，数组A中的值作为B的数组下标，用数组B来记录各元素出现的次数，最后遍历数组B找出次数最大，判断是否大于n/2。

2️⃣ 空间换时间

```c

int SearchMain(int A[],int n){
  int B[];
  int index=0;

  for(int i=0; i<n;i++){
    B[A[i]]++;
  }

  for(int j=1 ; j<n;j++){
    if(B[index]<B[j])index = j;
  }

  if(B[index]>(n/2)) return index;
  return -1;

}

```

3️⃣ 时间复杂度O(n),空间复杂度O(n)