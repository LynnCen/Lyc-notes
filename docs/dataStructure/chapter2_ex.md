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