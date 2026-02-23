# 无重复字符的最长子串

## 题目描述

给定一个字符串 `s`，请你找出其中不含有重复字符的**最长**子串的长度。

**示例 1:**
```
输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```

**示例 2:**
```
输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。
```

**示例 3:**
```
输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
```

## 题目分析

这道题要求找出字符串中**不含重复字符的最长连续子串**的长度。关键点：
- 必须是连续的子串(substring)，不是子序列(subsequence)
- 子串内不能有重复字符
- 返回长度，不是返回子串本身

---

## 解法一：暴力解法 - 枚举所有子串

### 思路

枚举所有可能的子串，检查每个子串是否包含重复字符，记录最长的。

### 复杂度分析

- **时间复杂度**: O(n³)
  - 两层循环枚举起点和终点: O(n²)
  - 检查子串是否有重复字符: O(n)
- **空间复杂度**: O(min(n, m))，m 是字符集大小

### 代码实现

```typescript
function lengthOfLongestSubstring(s: string): number {
    let maxLen = 0;
    const n = s.length;
    
    // 枚举所有可能的起点
    for (let i = 0; i < n; i++) {
        // 枚举所有可能的终点
        for (let j = i; j < n; j++) {
            // 检查 s[i...j] 是否有重复字符
            if (hasUniqueChars(s, i, j)) {
                maxLen = Math.max(maxLen, j - i + 1);
            }
        }
    }
    
    return maxLen;
}

function hasUniqueChars(s: string, start: number, end: number): boolean {
    const set = new Set<string>();
    for (let i = start; i <= end; i++) {
        if (set.has(s[i])) {
            return false;
        }
        set.add(s[i]);
    }
    return true;
}
```

### 缺点

效率太低，重复计算太多。

---

## 解法二：滑动窗口 + Set - 优化版本

### 思路

使用滑动窗口维护一个无重复字符的子串。当遇到重复字符时，收缩左边界。

**核心思想**：
1. 使用 `left` 和 `right` 两个指针维护窗口
2. `right` 指针不断右移扩大窗口
3. 当发现重复字符时，`left` 指针右移缩小窗口，直到没有重复
4. 用 Set 存储当前窗口内的字符

### 复杂度分析

- **时间复杂度**: O(2n) = O(n)
  - 最坏情况下，每个字符被访问两次（一次 right，一次 left）
- **空间复杂度**: O(min(n, m))

### 代码实现

```typescript
function lengthOfLongestSubstring(s: string): number {
    const set = new Set<string>();
    let maxLen = 0;
    let left = 0;
    
    for (let right = 0; right < s.length; right++) {
        // 如果当前字符已存在，移动左指针直到没有重复
        while (set.has(s[right])) {
            set.delete(s[left]);
            left++;
        }
        
        // 将当前字符加入窗口
        set.add(s[right]);
        
        // 更新最大长度
        maxLen = Math.max(maxLen, right - left + 1);
    }
    
    return maxLen;
}
```

### 执行过程示例

以 `s = "abcabcbb"` 为例：

```
right=0: [a], maxLen=1
right=1: [ab], maxLen=2
right=2: [abc], maxLen=3
right=3: 发现重复'a', left移动, [bca], maxLen=3
right=4: 发现重复'b', left移动, [cab], maxLen=3
right=5: 发现重复'c', left移动, [abc], maxLen=3
right=6: 发现重复'b', left移动, [cb], maxLen=3
right=7: 发现重复'b', left移动, [b], maxLen=3
```

---

## 解法三：滑动窗口 + HashMap - 最优解

### 思路

使用 HashMap 存储字符最后出现的位置，可以直接跳过重复字符之前的所有字符。

**优化点**：相比解法二，不需要一个一个移动 left 指针，可以直接跳到重复字符的下一个位置。

### 复杂度分析

- **时间复杂度**: O(n) - 每个字符只访问一次
- **空间复杂度**: O(min(n, m))

### 代码实现

```typescript
function lengthOfLongestSubstring(s: string): number {
    const map = new Map<string, number>(); // 字符 -> 最后出现的索引
    let maxLen = 0;
    let left = 0;
    
    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        
        // 如果字符已存在且在当前窗口内，更新左边界
        if (map.has(char) && map.get(char)! >= left) {
            left = map.get(char)! + 1;
        }
        
        // 更新字符最后出现的位置
        map.set(char, right);
        
        // 更新最大长度
        maxLen = Math.max(maxLen, right - left + 1);
    }
    
    return maxLen;
}
```

### 执行过程示例

以 `s = "abcabcbb"` 为例：

```
right=0: char='a', left=0, map={a:0}, maxLen=1
right=1: char='b', left=0, map={a:0,b:1}, maxLen=2
right=2: char='c', left=0, map={a:0,b:1,c:2}, maxLen=3
right=3: char='a', left跳到1, map={a:3,b:1,c:2}, maxLen=3
right=4: char='b', left跳到2, map={a:3,b:4,c:2}, maxLen=3
right=5: char='c', left跳到3, map={a:3,b:4,c:5}, maxLen=3
right=6: char='b', left跳到5, map={a:3,b:6,c:5}, maxLen=3
right=7: char='b', left跳到7, map={a:3,b:7,c:5}, maxLen=3
```

### 关键细节

- `map.get(char)! >= left` 这个判断很重要，确保只处理当前窗口内的重复
- `left = map.get(char)! + 1` 直接跳到重复字符的下一位，避免逐个移动

---

## 三种解法对比

| 解法 | 时间复杂度 | 空间复杂度 | 特点 |
|------|-----------|-----------|------|
| 暴力枚举 | O(n³) | O(m) | 简单但效率低 |
| 滑动窗口+Set | O(2n) | O(m) | 需要逐个移动左指针 |
| 滑动窗口+Map | O(n) | O(m) | 最优，可直接跳跃 |

---

## 核心技巧总结

1. **滑动窗口**：适用于连续子串/子数组问题
2. **数据结构选择**：Set 检查存在，Map 记录位置信息
3. **优化思路**：从逐步移动到直接跳跃

---

## 相关题目

- [最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)
- [最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)
- [长度最小的子数组](https://leetcode.cn/problems/minimum-size-subarray-sum/)

---

# 寻找两个正序数组的中位数

## 题目描述

给定两个大小分别为 `m` 和 `n` 的正序（从小到大）数组 `nums1` 和 `nums2`。请你找出并返回这两个正序数组的**中位数**。

算法的时间复杂度应该为 **O(log (m+n))**。

**示例 1：**
```
输入：nums1 = [1,3], nums2 = [2]
输出：2.00000
解释：合并数组 = [1,2,3] ，中位数 2
```

**示例 2：**
```
输入：nums1 = [1,2], nums2 = [3,4]
输出：2.50000
解释：合并数组 = [1,2,3,4] ，中位数 (2 + 3) / 2 = 2.5
```

## 题目分析

这道题要求找出两个有序数组合并后的中位数，并且要求时间复杂度为 O(log(m+n))。

**关键点**：
- 两个数组都是正序（从小到大）
- 时间复杂度要求 O(log(m+n))，暗示需要使用二分查找
- 中位数定义：
  - 如果总长度为奇数，中位数是第 `(m+n+1)/2` 小的元素
  - 如果总长度为偶数，中位数是第 `(m+n)/2` 小和第 `(m+n)/2+1` 小元素的平均值

---

## 解法一：合并数组 - 不满足时间复杂度要求

### 思路

直接合并两个数组，然后找中位数。虽然简单，但不满足 O(log(m+n)) 的要求。

### 复杂度分析

- **时间复杂度**: O(m+n) - 需要遍历两个数组
- **空间复杂度**: O(m+n) - 需要额外的合并数组

### 代码实现

```typescript
function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    const merged: number[] = [];
    let i = 0, j = 0;
    
    // 合并两个有序数组
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] <= nums2[j]) {
            merged.push(nums1[i++]);
        } else {
            merged.push(nums2[j++]);
        }
    }
    
    // 添加剩余元素
    while (i < nums1.length) merged.push(nums1[i++]);
    while (j < nums2.length) merged.push(nums2[j++]);
    
    // 计算中位数
    const len = merged.length;
    if (len % 2 === 0) {
        return (merged[len / 2 - 1] + merged[len / 2]) / 2;
    } else {
        return merged[Math.floor(len / 2)];
    }
}
```

### 缺点

不满足题目要求的时间复杂度 O(log(m+n))。

---

## 解法二：二分查找 - 寻找第 k 小元素

### 核心思路

将问题转化为：**寻找两个有序数组合并后的第 k 小元素**。

**关键洞察**：
- 中位数就是第 `(m+n+1)/2` 小（奇数）或第 `(m+n)/2` 和 `(m+n)/2+1` 小的平均值（偶数）
- 可以使用二分查找，每次排除一半的元素

**算法步骤**：
1. 在两个数组中分别取前 `k/2` 个元素进行比较
2. 较小的一半可以排除（不可能是第 k 小）
3. 更新 k 值，继续在剩余部分查找

### 复杂度分析

- **时间复杂度**: O(log(m+n))
  - 每次递归排除 k/2 个元素，k 最多为 (m+n)
- **空间复杂度**: O(1) - 只使用常数额外空间

### 代码实现

```typescript
function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    const m = nums1.length;
    const n = nums2.length;
    const total = m + n;
    
    if (total % 2 === 1) {
        // 奇数：返回第 (total+1)/2 小的元素
        return findKth(nums1, 0, nums2, 0, Math.floor(total / 2) + 1);
    } else {
        // 偶数：返回第 total/2 和 total/2+1 小的元素的平均值
        const left = findKth(nums1, 0, nums2, 0, total / 2);
        const right = findKth(nums1, 0, nums2, 0, total / 2 + 1);
        return (left + right) / 2;
    }
}

/**
 * 在两个有序数组中寻找第 k 小的元素
 * @param nums1 第一个数组
 * @param i nums1 的起始索引
 * @param nums2 第二个数组
 * @param j nums2 的起始索引
 * @param k 要找的第 k 小元素（从1开始计数）
 */
function findKth(
    nums1: number[], 
    i: number, 
    nums2: number[], 
    j: number, 
    k: number
): number {
    // 如果 nums1 已经全部排除，直接返回 nums2 的第 k 小
    if (i >= nums1.length) {
        return nums2[j + k - 1];
    }
    
    // 如果 nums2 已经全部排除，直接返回 nums1 的第 k 小
    if (j >= nums2.length) {
        return nums1[i + k - 1];
    }
    
    // 如果 k=1，返回两个数组当前元素的最小值
    if (k === 1) {
        return Math.min(nums1[i], nums2[j]);
    }
    
    // 在两个数组中分别取前 k/2 个元素
    const mid1 = i + Math.floor(k / 2) - 1;
    const mid2 = j + Math.floor(k / 2) - 1;
    
    const val1 = mid1 < nums1.length ? nums1[mid1] : Infinity;
    const val2 = mid2 < nums2.length ? nums2[mid2] : Infinity;
    
    // 如果 nums1 的第 k/2 个元素较小，说明 nums1 的前 k/2 个元素都不可能是第 k 小
    if (val1 <= val2) {
        return findKth(nums1, mid1 + 1, nums2, j, k - Math.floor(k / 2));
    } else {
        return findKth(nums1, i, nums2, mid2 + 1, k - Math.floor(k / 2));
    }
}
```

### 执行过程示例

以 `nums1 = [1,3]`, `nums2 = [2]` 为例，寻找中位数（第 2 小）：

```
初始：i=0, j=0, k=2
- mid1 = 0 + 1 - 1 = 0, val1 = nums1[0] = 1
- mid2 = 0 + 1 - 1 = 0, val2 = nums2[0] = 2
- val1(1) <= val2(2)，排除 nums1 的前 1 个元素
- 递归：i=1, j=0, k=1

递归：i=1, j=0, k=1
- k=1，返回 min(nums1[1], nums2[0]) = min(3, 2) = 2
```

---

## 解法三：二分查找 - 分割数组（最优解）

### 核心思路

使用二分查找在两个数组中找到合适的分割点，使得：
- 左半部分的元素数量等于右半部分（或左半部分多1个）
- 左半部分的最大值 <= 右半部分的最小值

**关键思想**：
- 在较短的数组上进行二分查找
- 分割点满足：`leftMax1 <= rightMin2 && leftMax2 <= rightMin1`

### 复杂度分析

- **时间复杂度**: O(log(min(m, n)))
  - 在较短的数组上进行二分查找
- **空间复杂度**: O(1)

### 代码实现

```typescript
function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    // 确保 nums1 是较短的数组
    if (nums1.length > nums2.length) {
        [nums1, nums2] = [nums2, nums1];
    }
    
    const m = nums1.length;
    const n = nums2.length;
    const total = m + n;
    const half = Math.floor((total + 1) / 2); // 左半部分的元素数量
    
    let left = 0;
    let right = m;
    
    while (left <= right) {
        // 在 nums1 中的分割点
        const partition1 = Math.floor((left + right) / 2);
        // 在 nums2 中的分割点（保证左半部分总数为 half）
        const partition2 = half - partition1;
        
        // 获取分割点两侧的值
        const leftMax1 = partition1 === 0 ? -Infinity : nums1[partition1 - 1];
        const rightMin1 = partition1 === m ? Infinity : nums1[partition1];
        const leftMax2 = partition2 === 0 ? -Infinity : nums2[partition2 - 1];
        const rightMin2 = partition2 === n ? Infinity : nums2[partition2];
        
        // 检查是否找到正确的分割点
        if (leftMax1 <= rightMin2 && leftMax2 <= rightMin1) {
            // 找到中位数
            if (total % 2 === 0) {
                return (Math.max(leftMax1, leftMax2) + Math.min(rightMin1, rightMin2)) / 2;
            } else {
                return Math.max(leftMax1, leftMax2);
            }
        } else if (leftMax1 > rightMin2) {
            // nums1 的分割点太靠右，需要左移
            right = partition1 - 1;
        } else {
            // nums1 的分割点太靠左，需要右移
            left = partition1 + 1;
        }
    }
    
    return 0; // 不会执行到这里
}
```

### 执行过程示例

以 `nums1 = [1,3]`, `nums2 = [2]` 为例：

```
初始：m=2, n=1, total=3, half=2
left=0, right=2

循环1：partition1=1, partition2=1
- leftMax1 = nums1[0] = 1
- rightMin1 = nums1[1] = 3
- leftMax2 = nums2[0] = 2
- rightMin2 = Infinity
- 检查：1 <= Infinity ✓, 2 <= 3 ✓
- 找到分割点！
- total为奇数，返回 max(1, 2) = 2
```

### 关键细节

1. **边界处理**：使用 `-Infinity` 和 `Infinity` 处理分割点在数组边界的情况
2. **分割点计算**：`partition2 = half - partition1` 确保左半部分总数为 `half`
3. **二分查找方向**：
   - `leftMax1 > rightMin2`：分割点太靠右，需要左移
   - `leftMax2 > rightMin1`：分割点太靠左，需要右移

---

## 三种解法对比

| 解法 | 时间复杂度 | 空间复杂度 | 特点 |
|------|-----------|-----------|------|
| 合并数组 | O(m+n) | O(m+n) | 简单但不满足要求 |
| 二分查找第k小 | O(log(m+n)) | O(1) | 满足要求，逻辑清晰 |
| 分割数组 | O(log(min(m,n))) | O(1) | 最优，但实现较复杂 |

---

## 核心技巧总结

1. **问题转化**：将中位数问题转化为寻找第 k 小元素
2. **二分查找**：利用有序数组的性质，每次排除一半元素
3. **边界处理**：注意处理数组边界和空数组的情况
4. **优化方向**：在较短的数组上进行二分查找可以进一步优化

---

## 相关题目

- [合并两个有序数组](https://leetcode.cn/problems/merge-sorted-array/)
- [第K个最小的数对和](https://leetcode.cn/problems/find-k-pairs-with-smallest-sums/)
- [寻找两个有序数组的中位数](https://leetcode.cn/problems/median-of-two-sorted-arrays/)

# LRU 缓存

## 题目描述

请你设计并实现一个满足 **LRU (最近最少使用)** 缓存约束的数据结构。

实现 `LRUCache` 类：

- `LRUCache(int capacity)` 以正整数作为容量 `capacity` 初始化 LRU 缓存
- `int get(int key)` 如果关键字 `key` 存在于缓存中，则返回关键字的值，否则返回 -1
- `void put(int key, int value)` 如果关键字 `key` 已经存在，则变更其数据值 `value`；如果不存在，则向缓存中插入该组 `key-value`。如果插入操作导致关键字数量超过 `capacity`，则应该**逐出最久未使用的关键字**。

函数 `get` 和 `put` 必须以 **O(1)** 的平均时间复杂度运行。

**示例：**
```
输入
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]

输出
[null, null, null, 1, null, -1, null, -1, 3, 4]

解释
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // 缓存是 {1=1}
lRUCache.put(2, 2); // 缓存是 {1=1, 2=2}
lRUCache.get(1);    // 返回 1，此时 1 被访问，变为最近使用
lRUCache.put(3, 3); // 逐出 2（最久未使用），缓存是 {1=1, 3=3}
lRUCache.get(2);    // 返回 -1
lRUCache.put(4, 4); // 逐出 1，缓存是 {3=3, 4=4}
lRUCache.get(1);    // 返回 -1
lRUCache.get(3);    // 返回 3
lRUCache.get(4);    // 返回 4
```

## 题目分析

- **LRU**：Least Recently Used，淘汰最久未使用的项
- **get**：若存在则返回值，并将该 key 标记为「最近使用」；否则返回 -1
- **put**：若存在则更新值并标记为最近使用；若不存在则插入，超出容量时淘汰最久未使用的项
- **O(1) 要求**：查找、插入、删除、更新访问顺序都要 O(1)

---

## 解法一：暴力解法 - 数组 + 线性查找

### 思路

用数组存储 `[key, value]` 对，按访问顺序排列（末尾为最近使用，头部为最久未使用）。

- **get**：线性扫描查找 key，若找到则取出并移到末尾，否则返回 -1
- **put**：线性扫描查找 key，若找到则更新并移到末尾；否则插入末尾。若超出容量，删除头部元素

### 复杂度分析

- **时间复杂度**：get O(n)，put O(n)
- **空间复杂度**：O(capacity)

### 代码实现

```typescript
class LRUCache {
    private capacity: number;
    private cache: Array<[number, number]> = [];  // [key, value]

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    get(key: number): number {
        const idx = this.cache.findIndex(([k]) => k === key);
        if (idx === -1) return -1;
        const [, value] = this.cache[idx];
        this.cache.splice(idx, 1);        // 移除
        this.cache.push([key, value]);    // 移到末尾（最近使用）
        return value;
    }

    put(key: number, value: number): void {
        const idx = this.cache.findIndex(([k]) => k === key);
        if (idx !== -1) {
            this.cache.splice(idx, 1);
        } else if (this.cache.length >= this.capacity) {
            this.cache.shift();  // 逐出最久未使用（头部）
        }
        this.cache.push([key, value]);
    }
}
```

### 缺点

`findIndex`、`splice`、`shift` 均为 O(n)，无法满足 O(1) 要求。

---

## 解法二：HashMap + 数组维护顺序

### 思路

用 `Map` 做 O(1) 查找，用数组维护访问顺序。查找 O(1)，但更新顺序仍需在数组中移动元素，为 O(n)。

### 复杂度分析

- **时间复杂度**：get 查找 O(1)、更新顺序 O(n)；put 同理
- **空间复杂度**：O(capacity)

### 代码实现

```typescript
class LRUCache {
    private capacity: number;
    private map: Map<number, number> = new Map();
    private order: number[] = [];  // 按访问顺序存储 key，末尾为最近使用

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    get(key: number): number {
        if (!this.map.has(key)) return -1;
        const value = this.map.get(key)!;
        // 更新顺序：从 order 中移除再追加到末尾
        const idx = this.order.indexOf(key);
        this.order.splice(idx, 1);
        this.order.push(key);
        return value;
    }

    put(key: number, value: number): void {
        if (this.map.has(key)) {
            const idx = this.order.indexOf(key);
            this.order.splice(idx, 1);
        } else if (this.map.size >= this.capacity) {
            const lru = this.order.shift()!;
            this.map.delete(lru);
        }
        this.map.set(key, value);
        this.order.push(key);
    }
}
```

### 缺点

`indexOf`、`splice`、`shift` 仍为 O(n)，未达到 O(1)。

---

## 解法三：最优解 - Map 利用有序性（JavaScript/TypeScript）

### 思路

JavaScript 的 `Map` 会**按插入顺序**迭代。利用这一点：

- **get**：若存在，先 `delete` 再 `set`，相当于把该 key 移到「最近使用」位置
- **put**：若存在，先 `delete` 再 `set`；若不存在且超容，删除**第一个** key（迭代器第一个即为最久未使用），再 `set`

`Map` 的 `get`、`set`、`delete` 以及获取第一个 key 均为 O(1)。

### 复杂度分析

- **时间复杂度**：get O(1)，put O(1)
- **空间复杂度**：O(capacity)

### 代码实现

```typescript
class LRUCache {
    private capacity: number;
    private cache: Map<number, number>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(key: number): number {
        if (!this.cache.has(key)) return -1;
        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);  // 移到末尾 = 最近使用
        return value;
    }

    put(key: number, value: number): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            const lruKey = this.cache.keys().next().value;
            this.cache.delete(lruKey);
        }
        this.cache.set(key, value);
    }
}
```

---

## 解法四：最优解 - HashMap + 双向链表（通用写法）

### 思路

适用于不依赖 `Map` 有序性的语言（如 Java、C++）：用 HashMap 做 O(1) 查找，用双向链表维护访问顺序，头尾操作均为 O(1)。

- **链表**：头部为最久未使用，尾部为最近使用
- **get**：在 HashMap 中查找，若存在则将节点移到尾部
- **put**：若存在则更新并移到尾部；若不存在则新建节点插到尾部，超容则删除头部节点

### 复杂度分析

- **时间复杂度**：get O(1)，put O(1)
- **空间复杂度**：O(capacity)

### 代码实现

```typescript
class DLinkedNode {
    key: number;
    value: number;
    prev: DLinkedNode | null = null;
    next: DLinkedNode | null = null;
    constructor(key: number, value: number) {
        this.key = key;
        this.value = value;
    }
}

class LRUCache {
    private capacity: number;
    private map: Map<number, DLinkedNode> = new Map();
    private head: DLinkedNode;  // 哨兵，head.next 为最久未使用
    private tail: DLinkedNode;  // 哨兵，tail.prev 为最近使用

    constructor(capacity: number) {
        this.capacity = capacity;
        this.head = new DLinkedNode(-1, -1);
        this.tail = new DLinkedNode(-1, -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private addToTail(node: DLinkedNode): void {
        node.prev = this.tail.prev;
        node.next = this.tail;
        this.tail.prev!.next = node;
        this.tail.prev = node;
    }

    private removeNode(node: DLinkedNode): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private moveToTail(node: DLinkedNode): void {
        this.removeNode(node);
        this.addToTail(node);
    }

    get(key: number): number {
        if (!this.map.has(key)) return -1;
        const node = this.map.get(key)!;
        this.moveToTail(node);
        return node.value;
    }

    put(key: number, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToTail(node);
            return;
        }
        if (this.map.size >= this.capacity) {
            const lru = this.head.next!;
            this.removeNode(lru);
            this.map.delete(lru.key);
        }
        const node = new DLinkedNode(key, value);
        this.map.set(key, node);
        this.addToTail(node);
    }
}
```

---

## 四种解法对比

| 解法 | get | put | 空间 | 特点 |
|------|-----|-----|------|------|
| 数组 + 线性查找 | O(n) | O(n) | O(n) | 暴力，易实现 |
| HashMap + 数组顺序 | O(n) | O(n) | O(n) | 查找 O(1)，更新顺序 O(n) |
| Map 有序性（JS/TS） | O(1) | O(1) | O(n) | 最简，依赖语言特性 |
| HashMap + 双向链表 | O(1) | O(1) | O(n) | 通用最优解，可移植 |

---

## 核心技巧总结

1. **访问即更新**：get 和 put 命中时都要把该 key 标记为「最近使用」
2. **淘汰策略**：超出容量时删除「最久未使用」的项
3. **O(1) 实现**：查找用 HashMap；顺序更新用双向链表（或利用 Map 有序性）
4. **哨兵节点**：双向链表用 head/tail 哨兵可简化边界处理

---

## 相关题目

- [LFU 缓存](https://leetcode.cn/problems/lfu-cache/)
- [设计循环队列](https://leetcode.cn/problems/design-circular-queue/)

# 最长连续序列

## 题目描述

给定一个未排序的整数数组 `nums`，找出**数字连续**的最长序列的长度。（不要求序列元素在原数组中连续。）

请你设计并实现**时间复杂度为 O(n)** 的算法解决此问题。

**示例 1：**
```
输入：nums = [100,4,200,1,3,2]
输出：4
解释：最长数字连续序列是 [1, 2, 3, 4]。它的长度为 4。
```

**示例 2：**
```
输入：nums = [0,3,7,2,5,8,4,6,0,1]
输出：9
解释：最长连续序列是 [0,1,2,3,4,5,6,7,8]，长度为 9。
```

**示例 3：**
```
输入：nums = [1,0,1,2]
输出：3
解释：最长连续序列是 [0,1,2]，长度为 3。
```

## 题目分析

- **连续**：指数值上连续，如 1,2,3,4，与在原数组中的位置无关
- **重复**：如 [1,0,1,2] 中 1 只算一次，序列为 [0,1,2]，长度为 3
- **O(n) 要求**：不能排序（排序为 O(n log n)），需要线性扫描 + O(1) 查找（用 Set/Map）

---

## 解法一：排序 + 一次遍历

### 思路

先排序，再遍历一次，用当前是否等于「上一数+1」来维护当前连续段长度。

### 复杂度分析

- **时间复杂度**：O(n log n)，由排序决定
- **空间复杂度**：O(log n) 排序栈 或 O(n) 若使用额外数组

### 代码实现

```typescript
function longestConsecutive(nums: number[]): number {
    if (nums.length === 0) return 0;
    nums.sort((a, b) => a - b);
    let maxLen = 1;
    let curLen = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) continue;           // 重复跳过
        if (nums[i] === nums[i - 1] + 1) {
            curLen++;
        } else {
            maxLen = Math.max(maxLen, curLen);
            curLen = 1;
        }
    }
    return Math.max(maxLen, curLen);
}
```

### 缺点

不满足 O(n) 要求。

---

## 解法二：Set + 只从「序列起点」扩展（O(n) 最优）

### 思路

- 把所有数放进 `Set`，去重且 O(1) 查找
- **关键**：只从「某个连续序列的起点」开始往后数。若 `num - 1` 在 Set 里，说明当前 num 不是起点，跳过，避免重复统计同一段
- 若 `num - 1` 不在 Set 里，则从 num 开始往后数（num, num+1, num+2...），直到不在 Set 中，得到以 num 为起点的连续段长度
- 每个数最多被访问两次：一次作为非起点被跳过，一次在从起点扩展时被数到，故总时间 O(n)

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(n)，Set 存所有数

### 代码实现

```typescript
function longestConsecutive(nums: number[]): number {
    const set = new Set(nums);
    let maxLen = 0;
    for (const num of set) {
        if (set.has(num - 1)) continue;  // 不是起点，跳过
        let cur = num;
        let len = 0;s
        while (set.has(cur)) {
            len++;
            cur++;
        }
        maxLen = Math.max(maxLen, len);
    }
    return maxLen;
}
```

### 要点

- 只有「没有 num-1」的 num 才作为起点向后扩展，保证每段连续序列只被数一次
- 用 Set 去重，重复值不影响结果

---

## 两种解法对比

| 解法 | 时间复杂度 | 空间复杂度 | 是否满足要求 |
|------|-----------|-----------|--------------|
| 排序 + 遍历 | O(n log n) | O(log n) 或 O(n) | 否 |
| Set + 只从起点扩展 | O(n) | O(n) | 是 |

---

## 核心技巧总结

1. **连续序列**：按数值连续，与下标无关；重复数只算一次
2. **避免重复统计**：只从「序列起点」（即 num-1 不存在）开始向后数
3. **O(n) 实现**：Set 去重 + O(1) 查找；每个数至多参与两次操作

---

## 相关题目

- [存在重复元素](https://leetcode.cn/problems/contains-duplicate/)
- [数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)
