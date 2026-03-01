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


# 最长公共前缀

## 题目描述

编写一个函数来查找字符串数组中的**最长公共前缀**。如果不存在公共前缀，返回空字符串 `""`。

**示例 1：**
```
输入：strs = ["flower","flow","flight"]
输出："fl"
```

**示例 2：**
```
输入：strs = ["dog","racecar","car"]
输出：""
解释：输入不存在公共前缀。
```

**提示：**
- 1 <= strs.length <= 200
- 0 <= strs[i].length <= 200
- strs[i] 仅由小写英文字母组成

## 题目分析

- **公共前缀**：所有字符串从开头起连续相同的一段
- **空数组 / 空串**：若存在空串，则公共前缀必为 `""`；题目保证至少 1 个字符串
- **思路**：要么「按列比较」（第 0 位是否全相同、第 1 位是否全相同…），要么「先取一个串再逐个缩短」

---

## 解法一：纵向扫描（逐列比较）

### 思路

从第 0 列开始，检查所有字符串在该列是否相同；若相同则继续下一列，若不同或某串已到头则停止，当前列数即为公共前缀长度。

### 复杂度分析

- **时间复杂度**：O(n×m)，n 为字符串个数，m 为最短串长度（最坏比较到最短串末尾）
- **空间复杂度**：O(1)（不计返回字符串）

### 代码实现

```typescript
function longestCommonPrefix(strs: string[]): string {
    if (strs.length === 0) return "";
    const len = Math.min(...strs.map(s => s.length));
    for (let i = 0; i < len; i++) {
        const c = strs[0][i];
        for (let j = 1; j < strs.length; j++) {
            if (strs[j][i] !== c) {
                return strs[0].slice(0, i);
            }
        }
    }
    return strs[0].slice(0, len);
}
```

#### 具体例子（strs = ["flower","flow","flight"]）

| 列 i | c = strs[0][i] | 比较 strs[1][i]、strs[2][i] | 结果 |
|------|----------------|-----------------------------|------|
| 0 | 'f' | "flow"[0]='f', "flight"[0]='f' | 相同，继续 |
| 1 | 'l' | "flow"[1]='l', "flight"[1]='l' | 相同，继续 |
| 2 | 'o' | "flow"[2]='o', "flight"[2]='i' | 不同 → return strs[0].slice(0,2) = "fl" |

**结果**：`"fl"`。

---

## 解法二：横向扫描（用第一个串做前缀，逐个缩短）

### 思路

令 `prefix = strs[0]`，然后依次与 `strs[1]`、`strs[2]`… 比较：若当前串不以 `prefix` 开头，则不断删掉 `prefix` 最后一个字符，直到匹配或 `prefix` 为空。

### 复杂度分析

- **时间复杂度**：O(S)，S 为所有字符总数（最坏每个字符都参与比较）
- **空间复杂度**：O(m)，m 为第一个串长度（可复用/截取，通常仍算 O(1) 额外空间）

### 代码实现

```typescript
function longestCommonPrefix(strs: string[]): string {
    if (strs.length === 0) return "";
    let prefix = strs[0];
    for (let i = 1; i < strs.length; i++) {
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, -1);
            if (prefix === "") return "";
        }
    }
    return prefix;
}
```

---

## 解法三：排序后比较首尾

### 思路

将数组排序后，公共前缀一定等于「第一个串」和「最后一个串」的公共前缀（字典序下首尾差异最大，其余串夹在中间）。

### 复杂度分析

- **时间复杂度**：O(n×m log n)，排序 + 比较首尾
- **空间复杂度**：O(log n) 排序栈 或 O(1) 视语言而定

### 代码实现

```typescript
function longestCommonPrefix(strs: string[]): string {
    if (strs.length === 0) return "";
    strs.sort();
    const first = strs[0];
    const last = strs[strs.length - 1];
    const minLen = Math.min(first.length, last.length);
    let i = 0;
    while (i < minLen && first[i] === last[i]) i++;
    return first.slice(0, i);
}
```

---

## 三种解法对比

| 解法 | 思路 | 时间复杂度 | 空间复杂度 | 特点 |
|------|------|-----------|-----------|------|
| 纵向扫描 | 按列比较，遇不同即停 | O(n×m) | O(1) | 直观，面试常用 |
| 横向扫描 | 用首串做前缀，逐个缩短 | O(S) | O(m) | 实现简单 |
| 排序后首尾 | 排序后只比第一个和最后一个 | O(n×m log n) | O(log n) | 代码短，但多一次排序 |

---

## 核心技巧总结

1. **公共前缀**：从下标 0 开始连续相同的一段，一旦某列不一致即可截断
2. **边界**：空数组返回 `""`；若存在空串，公共前缀必为 `""`
3. **纵向 vs 横向**：纵向按「列」统一比较；横向固定一个前缀再逐个匹配、缩短

---

## 相关题目

- [最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/)
- [验证回文串](https://leetcode.cn/problems/valid-palindrome/)


# 移动零

## 题目描述

给定一个数组 `nums`，编写一个函数将**所有 0 移动到数组的末尾**，同时**保持非零元素的相对顺序**。

**要求**：必须**原地**修改数组，不能复制数组。

**示例 1：**
```
输入: nums = [0,1,0,3,12]
输出: [1,3,12,0,0]
```

**示例 2：**
```
输入: nums = [0]
输出: [0]
```

## 题目分析

- **相对顺序**：非零数之间的先后关系不能变，只能把 0 挪到后面
- **原地**：在原数组上操作，可用双指针覆盖或交换，不能开新数组存结果再整体拷贝
- **思路**：用「写指针」标出下一个非零该放的位置，遍历时把非零往前写，最后把剩余位置填 0；或边遍历边与写位置交换，则无需最后填 0

---

## 双指针滑动过程图例

以**解法二（交换）**为例，`nums = [0,1,0,3,12]`。图中 `w` 表示 **write**（下一个非零要放的下标），`i` 表示当前遍历下标；遇到非零时交换 `nums[w]` 与 `nums[i]`，然后 `w++`。

```
初始:   [  0,  1,  0,  3, 12 ]
         w
         i
        i=0 为 0，跳过

i=1:    [  0,  1,  0,  3, 12 ]
         w   i
         └───┘ 交换 → write++
        [  1,  0,  0,  3, 12 ]
              w   i

i=2:    [  1,  0,  0,  3, 12 ]
              w       i
        i=2 为 0，跳过

i=3:    [  1,  0,  0,  3, 12 ]
              w           i
              └───────────┘ 交换 → write++
        [  1,  3,  0,  0, 12 ]
                   w       i

i=4:    [  1,  3,  0,  0, 12 ]
                   w           i
                   └───────────┘ 交换 → write++
        [  1,  3, 12,  0,  0 ]
                        w
```

**图例说明**：
- **i**：从左到右扫描，每次循环 `i++`
- **write (w)**：仅当发生「写入」或「交换」时 `write++`，表示已排好的非零区间右边界 +1
- **虚线/箭头**：表示本轮发生交换的两个位置

解法一（写指针 + 末尾填 0）中，`i` 的移动方式相同，`write` 含义一致，只是把「交换」改成「把 nums[i] 写到 nums[write]」，最后再统一把 write 之后的位置填 0。

---

## 解法一：双指针（写指针 + 末尾填 0）

### 思路

- `write` 表示「下一个非零元素要放的下标」
- 遍历 `nums`，遇到非零就写到 `nums[write]` 并 `write++`
- 遍历结束后，把 `write` 到末尾全部置为 0

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(1)

### 代码实现

```typescript
function moveZeroes(nums: number[]): void {
    let write = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            nums[write++] = nums[i];
        }
    }
    for (let i = write; i < nums.length; i++) {
        nums[i] = 0;
    }
}
```

#### nums 执行过程（示例：nums = [0,1,0,3,12]）

**第一轮：把非零写到前面**

| i | write | nums[i] | 操作 | nums |
|---|-------|---------|------|------|
| 0 | 0 | 0 | 跳过 | [0,1,0,3,12] |
| 1 | 0 | 1 | nums[0]=1, write=1 | [**1**,1,0,3,12] |
| 2 | 1 | 0 | 跳过 | [1,1,0,3,12] |
| 3 | 1 | 3 | nums[1]=3, write=2 | [1,**3**,0,3,12] |
| 4 | 2 | 12 | nums[2]=12, write=3 | [1,3,**12**,3,12] |

**第二轮：末尾填 0**

| i | 操作 | nums |
|---|------|------|
| 3 | nums[3]=0 | [1,3,12,**0**,12] |
| 4 | nums[4]=0 | [1,3,12,0,**0**] |

**结果**：`nums = [1,3,12,0,0]`

---

## 解法二：双指针（交换，一次遍历）

### 思路

- `write` 表示「下一个非零该放的位置」（该位置及其左侧都是已排好的非零或尚未被覆盖的 0）
- 遍历时遇到非零，就与 `nums[write]` 交换，然后 `write++`
- 这样 0 会自然被「挤」到后面，无需再单独填 0

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(1)

### 代码实现

```typescript
function moveZeroes(nums: number[]): void {
    let write = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            [nums[write], nums[i]] = [nums[i], nums[write]];
            write++;
        }
    }
}
```

#### nums 执行过程（示例：nums = [0,1,0,3,12]）

| i | write | nums[i] | 操作 | nums |
|---|-------|---------|------|------|
| 0 | 0 | 0 | 跳过 | [0,1,0,3,12] |
| 1 | 0 | 1 | 交换 nums[0]↔nums[1], write=1 | [**1**,**0**,0,3,12] |
| 2 | 1 | 0 | 跳过 | [1,0,0,3,12] |
| 3 | 1 | 3 | 交换 nums[1]↔nums[3], write=2 | [1,**3**,0,**0**,12] |
| 4 | 2 | 12 | 交换 nums[2]↔nums[4], write=3 | [1,3,**12**,0,**0**] |

**结果**：`nums = [1,3,12,0,0]`

---

## 两种解法对比

| 解法 | 思路 | 遍历次数 | 特点 |
|------|------|----------|------|
| 写指针 + 末尾填 0 | 非零往前写，最后一段赋 0 | 两轮 | 逻辑清晰，写操作略多 |
| 交换 | 非零与 write 位置交换 | 一轮 | 一次遍历，代码更短 |

---

## 核心技巧总结

1. **原地 + 保序**：用写指针从前往后放非零，0 自然留在后面或被覆盖/交换到后面
2. **双指针**：一个遍历，一个表示「下一个非零应放的位置」
3. **交换写法**：避免最后再扫一遍填 0，适合面试手写

---

## 相关题目

- [移除元素](https://leetcode.cn/problems/remove-element/)
- [删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/)


# 有效的括号

## 题目描述

给定一个只包括 `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'` 的字符串 `s`，判断字符串是否**有效**。

有效字符串需满足：

1. 左括号必须用**相同类型**的右括号闭合
2. 左括号必须以**正确的顺序**闭合
3. 每个右括号都有一个对应的相同类型的左括号

**示例 1：**
```
输入：s = "()"
输出：true
```

**示例 2：**
```
输入：s = "()[]{}"
输出：true
```

**示例 3：**
```
输入：s = "(]"
输出：false
```

**示例 4：**
```
输入：s = "([)]"
输出：false
解释：正确顺序应为 "([])"，不能交叉闭合。
```

## 题目分析

- **匹配规则**：同类型左右括号成对，且后出现的左括号要先闭合（先进后出 → 栈）
- **无效情况**：右括号多了、左括号多了、类型不匹配、顺序交叉（如 `([)]`）
- **思路**：遇到左括号入栈，遇到右括号看栈顶是否同类型，是则弹栈，否则或栈空则无效；最后栈必须为空

---

## 解法一：栈（标准解法）

### 思路

- 遍历每个字符：左括号入栈；右括号则检查栈顶是否与之匹配，匹配则弹栈，不匹配或栈空则返回 `false`
- 遍历结束后栈必须为空，否则说明有左括号未闭合

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(n)，栈最多存一半括号

### 代码实现

```typescript
function isValid(s: string): boolean {
    const stack: string[] = [];
    const map: Record<string, string> = {
        ')': '(', ']': '[', '}': '{'
    };
    for (const c of s) {
        if (c === '(' || c === '[' || c === '{') {
            stack.push(c);
        } else {
            if (stack.length === 0 || stack[stack.length - 1] !== map[c]) {
                return false;
            }
            stack.pop();
        }
    }
    return stack.length === 0;
}
```

#### 具体例子（有效：s = "()[]{}"）

| 字符 c | 操作 | 栈（栈顶在右） |
|--------|------|----------------|
| ( | 左括号，push('(') | ['('] |
| ) | 栈顶 '(' 与 map[')'] 匹配，pop() | [] |
| [ | push('[') | ['['] |
| ] | 栈顶 '[' 匹配，pop() | [] |
| { | push('{') | ['{'] |
| } | 栈顶 '{' 匹配，pop() | [] |
| 结束 | stack.length === 0 → true | [] |

**结果**：`true`。

---

## 栈匹配过程图例

以 `s = "([)]"` 为例（无效）：右括号 `)` 出现时，栈顶是 `[`，类型不匹配，返回 `false`。

```
s = " ( [ ) ] "
     ↑
栈: [ '(' ]

s = " ( [ ) ] "
       ↑
栈: [ '(', '[' ]

s = " ( [ ) ] "
         ↑  ')' 与栈顶 '[' 不匹配 → false
栈: [ '(', '[' ]
```

以 `s = "()[]{}"` 为例（有效）：

```
'(' → 栈 ['(']
')' → 匹配，弹栈 → 栈 []
'[' → 栈 ['[']
']' → 匹配，弹栈 → 栈 []
'{' → 栈 ['{']
'}' → 匹配，弹栈 → 栈 []
结束，栈空 → true
```

---

## 解法二：暴力替换（思路简单，效率低）

### 思路

不断把字符串中的 `"()"`、`"[]"`、`"{}"` 替换成空串，直到无法再替换。若最终字符串为空则有效。

### 复杂度分析

- **时间复杂度**：O(n²)，每次替换可能只删 2 个字符，最多 O(n) 轮
- **空间复杂度**：O(n)

### 代码实现

```typescript
function isValidReplace(s: string): boolean {
    const pairs = ['()', '[]', '{}'];
    let prev = '';
    while (prev !== s) {
        prev = s;
        for (const p of pairs) {
            s = s.split(p).join('');
        }
    }
    return s.length === 0;
}
```

### 缺点

效率低，且若题目扩展为多种括号或带其他字符，不如栈通用。

---

## 两种解法对比

| 解法 | 思路 | 时间复杂度 | 空间复杂度 | 特点 |
|------|------|-----------|-----------|------|
| 栈 | 左括号入栈，右括号与栈顶匹配 | O(n) | O(n) | 标准写法，面试必会 |
| 暴力替换 | 反复去掉成对括号 | O(n²) | O(n) | 实现简单，不推荐 |

---

## 核心技巧总结

1. **后进先出**：最近未闭合的左括号要先被匹配 → 用栈
2. **右括号与栈顶**：遇到右括号时，栈顶必须是对应的左括号，否则无效
3. **最后检查栈空**：遍历完栈必须为空，否则有未闭合的左括号
4. **用哈希表存配对**：`')'->'('` 等，方便判断类型是否匹配

---

## 相关题目

- [最长有效括号](https://leetcode.cn/problems/longest-valid-parentheses/)
- [有效的括号字符串](https://leetcode.cn/problems/valid-parenthesis-string/)


# 二叉树的中序遍历

## 题目描述

给定一个二叉树的根节点 `root`，返回它的**中序遍历**结果。

**示例 1：**
```
输入：root = [1,null,2,3]
    1
     \
      2
     /
    3
输出：[1,3,2]
```

**示例 2：**
```
输入：root = []
输出：[]
```

**示例 3：**
```
输入：root = [1]
输出：[1]
```

## 题目分析

- **中序遍历**：左子树 → 根 → 右子树（LDR）
- **递归定义**：先遍历左子树，再访问根，再遍历右子树
- **思路**：递归直接按定义写；迭代用栈模拟「一路向左到底，弹栈访问，再转右」

---

## 解法一：递归

### 思路

按定义：先递归左子树得到列表，再把根的值加入，再递归右子树得到列表，拼接即可。

### 复杂度分析

- **时间复杂度**：O(n)，每个节点访问一次
- **空间复杂度**：O(h)，递归栈深度为树高 h，最坏 O(n)（链状）

### 代码实现

```typescript
function inorderTraversal(root: TreeNode | null): number[] {
    const res: number[] = [];
    function inorder(node: TreeNode | null) {
        if (node === null) return;
        inorder(node.left);
        res.push(node.val);
        inorder(node.right);
    }
    inorder(root);
    return res;
}
```

#### 具体例子（root = [1,null,2,3]，即 1 无左子、右子为 2，2 的左子为 3）

树：`1 \ 2 / 3`。递归访问顺序（左-根-右）：

| 调用顺序 | 访问节点 | 操作 | res |
|----------|----------|------|-----|
| inorder(1) | 1 | 先进入 inorder(1.left)=null 返回 | [] |
|  | 1 | 再 res.push(1) | [1] |
|  | 1 | 再进入 inorder(1.right)=inorder(2) | [1] |
| inorder(2) | 2 | 先进入 inorder(2.left)=inorder(3) | [1] |
| inorder(3) | 3 | 左 null → push(3) → 右 null | [1,3] |
| 回到 2 | 2 | push(2)，再 inorder(2.right)=null | [1,3,2] |

**结果**：`res = [1, 3, 2]`。

---

## 解法二：迭代（栈）

### 思路

用栈模拟递归：当前节点不为空就入栈并往左走；为空就弹栈访问，再转到右子树。这样保证访问顺序为「左-根-右」。

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(h)，栈最多存一条链（左链），最坏 O(n)

### 代码实现

```typescript
function inorderTraversal(root: TreeNode | null): number[] {
    const res: number[] = [];
    const stack: TreeNode[] = [];
    let cur: TreeNode | null = root;
    while (cur !== null || stack.length > 0) {
        while (cur !== null) {
            stack.push(cur);
            cur = cur.left;
        }
        cur = stack.pop()!;
        res.push(cur.val);
        cur = cur.right;
    }
    return res;
}
```

---

## 栈迭代过程图例

以示例 1 为例：`root` 为 1，右子 2，2 的左子 3。中序顺序：先 1（无左子），再以 2 为根的子树为左-根-右即 3、2，故结果为 `[1, 3, 2]`。

```
树:    1
        \
         2
        /
       3

步骤：
1) cur=1，入栈，cur=null（1 无左子）
   栈:[1]  res:[]
2) 弹栈 1，res.push(1)，cur=2
   栈:[]   res:[1]
3) cur=2，入栈，cur=3
   栈:[2]  res:[1]
4) cur=3，入栈，cur=null
   栈:[2,3] res:[1]
5) 弹栈 3，res.push(3)，cur=null
   栈:[2]  res:[1,3]
6) 弹栈 2，res.push(2)，cur=null
   栈:[]   res:[1,3,2]
7) cur=null 且栈空，结束 → res = [1,3,2]
```

---

## 两种解法对比

| 解法 | 思路 | 空间（除结果） | 特点 |
|------|------|----------------|------|
| 递归 | 左-根-右 直接写 | O(h) 递归栈 | 代码短，易写 |
| 迭代（栈） | 一路向左入栈，弹栈访问再转右 | O(h) 显式栈 | 避免递归爆栈，面试常考 |

---

## 核心技巧总结

1. **中序 = 左-根-右**：递归时先 left，再 push 根，再 right
2. **迭代套路**：`while(cur || stack)`，内层 `while(cur)` 一路向左入栈，弹栈访问后 `cur = cur.right`
3. **栈的作用**：保存「还未访问根」的节点，弹栈时表示左子树已处理完，可访问根并转右

---

## 相关题目

- [二叉树的前序遍历](https://leetcode.cn/problems/binary-tree-preorder-traversal/)
- [二叉树的后序遍历](https://leetcode.cn/problems/binary-tree-postorder-traversal/)
- [二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/)


# 二叉树的最大深度

## 题目描述

**二叉树的 最大深度** 是指从根节点到最远叶子节点的**最长路径上的节点数**。

（即：根为第 1 层，往下每层 +1，求最大层数。）

**示例 1：**
```
输入：root = [3,9,20,null,null,15,7]
      3
     / \
    9  20
      /  \
     15   7
输出：3
解释：最长路径为 3 → 20 → 7（或 3 → 20 → 15），共 3 个节点。
```

**示例 2：**
```
输入：root = [1,null,2]
输出：2
```

## 题目分析

- **深度**：根为第 1 层，每向下一层深度 +1；空树深度为 0
- **等价定义**：根节点的最大深度 = 1 + max(左子树最大深度, 右子树最大深度)
- **思路**：递归直接按定义；迭代可用 BFS 按层遍历，层数即深度

---

## 解法一：递归（推荐）

### 思路

空树深度 0；否则深度 = 1 + max(左子树深度, 右子树深度)。

### 复杂度分析

- **时间复杂度**：O(n)，每个节点访问一次
- **空间复杂度**：O(h)，递归栈深度为树高，最坏 O(n)

### 代码实现

```typescript
function maxDepth(root: TreeNode | null): number {
    if (root === null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

#### 具体例子（示例 1：root = [3,9,20,null,null,15,7]）

树结构：
```
      3
     / \
    9  20
      /  \
     15   7
```

递归调用过程（自顶向下再回传）：
```
maxDepth(3)  → 1 + max(maxDepth(9), maxDepth(20))
  maxDepth(9)   → 1 + max(0, 0) = 1   （9 为叶子）
  maxDepth(20)  → 1 + max(maxDepth(15), maxDepth(7))
    maxDepth(15) → 1 + max(0, 0) = 1
    maxDepth(7)  → 1 + max(0, 0) = 1
  → maxDepth(20) = 1 + max(1, 1) = 2
→ maxDepth(3) = 1 + max(1, 2) = 3  → 返回 3
```

---

## 解法二：BFS 层序遍历

### 思路

用队列做层序遍历，每处理完一层深度 +1，最后一层的层数即为最大深度。

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(w)，w 为最大层宽，最坏 O(n)

### 代码实现

```typescript
function maxDepth(root: TreeNode | null): number {
    if (root === null) return 0;
    const queue: TreeNode[] = [root];
    let depth = 0;
    while (queue.length > 0) {
        const levelSize = queue.length;
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!;
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        depth++;
    }
    return depth;
}
```

#### 具体例子（示例 1：root = [3,9,20,null,null,15,7]）

| 轮次 | 当前层 queue（处理前） | 本层出队节点 | 下一层入队 | depth |
|------|------------------------|--------------|------------|-------|
| 初始 | [3] | — | — | 0 |
| 1 | [3] | 3 | 9, 20 | 1 |
| 2 | [9, 20] | 9, 20 | 15, 7 | 2 |
| 3 | [15, 7] | 15, 7 | （无子节点） | 3 |
| 结束 | [] | — | — | 返回 3 |

---

## 两种解法对比

| 解法 | 思路 | 空间 | 特点 |
|------|------|------|------|
| 递归 | 深度 = 1 + max(左深度, 右深度) | O(h) | 代码极简，面试首选 |
| BFS 层序 | 按层扩展，层数即深度 | O(w) | 显式「一层一层」数，便于理解 |

---

## 核心技巧总结

1. **递归定义**：`maxDepth(root) = root 为 null ? 0 : 1 + max(maxDepth(left), maxDepth(right))`
2. **叶子**：左右都为空时，该节点深度就是 1，递归返回 0+0 再 +1 得 1，正确
3. **BFS**：每轮循环处理当前层所有节点，深度 +1，适合「层数」相关题目

---

## 相关题目

- [二叉树的最小深度](https://leetcode.cn/problems/minimum-depth-of-binary-tree/)
- [平衡二叉树](https://leetcode.cn/problems/balanced-binary-tree/)
- [二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/)


# 二叉树的层序遍历

## 题目描述

给你二叉树的根节点 `root`，返回其节点值的**层序遍历**结果。（即逐层从左到右访问所有节点，每一层单独成一个数组。）

**示例 1：**
```
输入：root = [3,9,20,null,null,15,7]
      3
     / \
    9  20
      /  \
     15   7
输出：[[3],[9,20],[15,7]]
```

**示例 2：**
```
输入：root = [1]
输出：[[1]]
```

**示例 3：**
```
输入：root = []
输出：[]
```

## 题目分析

- **层序遍历**：从根开始，第 1 层、第 2 层、第 3 层… 每层从左到右，层与层之间用不同数组表示
- **思路**：BFS 用队列，每轮处理「当前层」的节点（用当前队列长度固定本层节点数），把本层值收集成一行并加入结果，同时把下一层节点入队；也可用 DFS 按深度下标往结果里填

---

## 解法一：BFS 队列（按层收集）

### 思路

用队列做 BFS：每轮开始时当前队列中的节点就是「当前层」；先记下本层个数 `levelSize`，循环 `levelSize` 次，每次出队一个节点，把值加入本层数组，并把其左右子（若存在）入队；本层处理完后把本层数组 push 进结果。

### 复杂度分析

- **时间复杂度**：O(n)，每个节点入队出队各一次
- **空间复杂度**：O(w)，w 为最大层宽，最坏 O(n)

### 代码实现

```typescript
function levelOrder(root: TreeNode | null): number[][] {
    if (root === null) return [];
    const res: number[][] = [];
    const queue: TreeNode[] = [root];
    while (queue.length > 0) {
        const levelSize = queue.length;
        const row: number[] = [];
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!;
            row.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        res.push(row);
    }
    return res;
}
```

#### 具体例子（root = [3,9,20,null,null,15,7]）

| 轮次 | 当前层 queue（处理前） | 本层出队并收集的值 | 下一层入队 | res |
|------|------------------------|--------------------|------------|-----|
| 1 | [3] | 3 | [9, 20] | [[3]] |
| 2 | [9, 20] | 9, 20 | [15, 7] | [[3], [9, 20]] |
| 3 | [15, 7] | 15, 7 | [] | [[3], [9, 20], [15, 7]] |
| 结束 | [] | — | — | 返回 [[3],[9,20],[15,7]] |

---

## 解法二：DFS 递归（按深度下标填结果）

### 思路

DFS 遍历时传入当前深度 `depth`；若 `res[depth]` 不存在则先建空数组，再把当前节点值 `push` 进 `res[depth]`；先递归左子树再递归右子树，保证同层从左到右。

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(h) 递归栈，最坏 O(n)

### 代码实现

```typescript
function levelOrder(root: TreeNode | null): number[][] {
    const res: number[][] = [];
    function dfs(node: TreeNode | null, depth: number) {
        if (node === null) return;
        if (res.length === depth) res.push([]);
        res[depth].push(node.val);
        dfs(node.left, depth + 1);
        dfs(node.right, depth + 1);
    }
    dfs(root, 0);
    return res;
}
```

#### 具体例子（root = [3,9,20,null,null,15,7]）

DFS 访问顺序（先左后右）：3 → 9 → 20 → 15 → 7。

| 访问节点 | depth | 操作 | res |
|----------|-------|------|-----|
| 3 | 0 | res[0]=[], res[0].push(3) | [[3]] |
| 9 | 1 | res[1]=[], res[1].push(9) | [[3],[9]] |
| 20 | 1 | res[1].push(20) | [[3],[9,20]] |
| 15 | 2 | res[2]=[], res[2].push(15) | [[3],[9,20],[15]] |
| 7 | 2 | res[2].push(7) | [[3],[9,20],[15,7]] |

**结果**：`[[3],[9,20],[15,7]]`。

---

## 两种解法对比

| 解法 | 思路 | 特点 |
|------|------|------|
| BFS 队列 | 每轮固定本层节点数，出队收集并子节点入队 | 直观的「一层一层」遍历，面试常用 |
| DFS 递归 | 按深度下标往 res[depth] 里填 | 代码短，但遍历顺序不是严格按层，依赖递归顺序 |

---

## 核心技巧总结

1. **按层固定节点数**：`levelSize = queue.length` 再 for 循环，保证本轮只处理当前层
2. **层与层分开**：每轮得到一个 `row`，push 进 `res`，即一层一个子数组
3. **DFS 写法**：用 `depth` 下标对应层号，先左后右保证同层从左到右

---

## 相关题目

- [二叉树的层序遍历 II](https://leetcode.cn/problems/binary-tree-level-order-traversal-ii/)
- [二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/)
- [二叉树的锯齿形层序遍历](https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/)


# 翻转二叉树

## 题目描述

给你一棵二叉树的根节点 `root`，请你**翻转**这棵二叉树（即把每个节点的左右子节点互换），并返回新的根节点。

**示例 1：**
```
输入：root = [4,2,7,1,3,6,9]
      4                   4
     / \                 / \
    2   7      →         7   2
   / \ / \             / \ / \
  1  3 6  9            9  6 3  1
输出：[4,7,2,9,6,3,1]
```

**示例 2：**
```
输入：root = [2,1,3]
      2           2
     / \    →    / \
    1   3       3   1
输出：[2,3,1]
```

**示例 3：**
```
输入：root = []
输出：[]
```

## 题目分析

- **翻转**：每个节点的左、右子节点互换，子树内部同样递归翻转
- **思路**：递归时先翻转左子树、再翻转右子树，最后交换根的 left 与 right；或先交换再递归（等价）
- **迭代**：用队列/栈按层或深度遍历，每访问一个节点就交换其左右子

---

## 解法一：递归（先递归再交换）

### 思路

对当前节点：先递归翻转左子树、再递归翻转右子树，再把 `root.left` 与 `root.right` 互换，最后返回 root。空节点直接返回 null。

### 复杂度分析

- **时间复杂度**：O(n)，每个节点访问一次
- **空间复杂度**：O(h)，递归栈深度为树高，最坏 O(n)

### 代码实现

```typescript
function invertTree(root: TreeNode | null): TreeNode | null {
    if (root === null) return null;
    const left = invertTree(root.left);
    const right = invertTree(root.right);
    root.left = right;
    root.right = left;
    return root;
}
```

#### 执行流程（示例：root = [4,2,7,1,3,6,9]）

**初始树：**
```
        4
       / \
      2   7
     / \ / \
    1  3 6  9
```

**递归与交换顺序（后序：先处理子再处理根）：**

| 步骤 | 当前节点 | 递归左 | 递归右 | 交换后该节点的左右 |
|------|----------|--------|--------|--------------------|
| 1 | 1（叶子） | null | null | 1.left↔1.right（仍是 null） |
| 2 | 3（叶子） | null | null | 无变化 |
| 3 | 2 | 已得翻转后的左子树(1) | 已得翻转后的右子树(3) | 2 的左右互换 → 2 下变成 3,1 |
| 4 | 6（叶子） | null | null | 无变化 |
| 5 | 9（叶子） | null | null | 无变化 |
| 6 | 7 | 已得翻转(6,9)→(9,6) | 已得翻转(9,6) | 7 的左右互换 → 7 下变成 9,6 |
| 7 | 4 | 已得翻转(2,7 子树)→(7,2 子树) | 已得翻转(7,2 子树) | 4 的左右互换 → 4 下变成 7,2 |

**流程简图：**
```
递归下探（先左后右）：
  4 → 2 → 1(返回) → 3(返回) → 2 交换左右后返回
    → 7 → 6(返回) → 9(返回) → 7 交换左右后返回
  → 4 交换左右后返回

每层“交换左右”发生在该节点左右子树都翻转完成之后。
```

**最终树：**
```
        4
       / \
      7   2
     / \ / \
    9  6 3  1
```

---

## 解法二：BFS 迭代（按层交换）

### 思路

用队列做层序遍历，每出队一个节点就交换其 `left` 与 `right`，并把非空子节点入队。不改变遍历顺序，只保证每个节点都被访问并交换一次。

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(w)，队列最大宽度，最坏 O(n)

### 代码实现

```typescript
function invertTree(root: TreeNode | null): TreeNode | null {
    if (root === null) return null;
    const queue: TreeNode[] = [root];
    while (queue.length > 0) {
        const node = queue.shift()!;
        [node.left, node.right] = [node.right, node.left];
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    return root;
}
```

#### 执行流程（示例：root = [4,2,7,1,3,6,9]）

| 轮次 | 出队节点 | 交换 left↔right | 入队子节点 | 当前树（仅示意根 4 的左右） |
|------|----------|-----------------|------------|-----------------------------|
| 1 | 4 | 2↔7 | 7, 2（先右后左因先入队 7） | 4 下为 7,2 |
| 2 | 7 | 6↔9 | 9, 6 | 7 下为 9,6 |
| 3 | 2 | 1↔3 | 3, 1 | 2 下为 3,1 |
| 4~7 | 9,6,3,1 | 均为叶子，交换 null | 无 | 不变 |
| 结束 | — | — | — | 得到翻转树 |

**流程要点**：从上到下、按层依次对每个节点做一次「左右互换」，子节点入队顺序不影响最终结构（只要每个节点都交换一次）。

---

## 两种解法对比

| 解法 | 思路 | 特点 |
|------|------|------|
| 递归 | 先翻转左、右子树，再交换根的左右 | 代码短，顺序是「后序」：先子后根 |
| BFS 迭代 | 按层出队，每节点交换左右并子节点入队 | 不依赖递归栈，适合层序思维 |

---

## 核心技巧总结

1. **翻转 = 每节点左右互换**：递归时先让左右子树内部翻转好，再交换根的 left/right
2. **递归顺序**：先递归再交换 = 后序；先交换再递归 = 前序，两种都能得到正确结果
3. **迭代**：任何遍历方式（BFS/DFS 栈）都可，只要每个节点都做一次交换

---

## 相关题目

- [对称二叉树](https://leetcode.cn/problems/symmetric-tree/)
- [合并二叉树](https://leetcode.cn/problems/merge-two-binary-trees/)

# 对称二叉树

## 题目描述

给你一个二叉树的根节点 `root`，检查它是否**轴对称**（即：左子树与右子树互为镜像，结构相同且节点值相同）。

**示例 1：**
```
输入：root = [1,2,2,3,4,4,3]
      1
     / \
    2   2
   / \ / \
  3  4 4  3
输出：true
```

**示例 2：**
```
输入：root = [1,2,2,null,3,null,3]
      1
     / \
    2   2
     \   \
      3   3
输出：false
```

**示例 3：**
```
输入：root = []
输出：true（空树视为对称）
```

## 题目分析

- **轴对称**：根节点相同，且「左子树的左」与「右子树的右」对称、「左子树的右」与「右子树的左」对称
- **递归定义**：两棵树对称 ⟺ 根值相同 且 左↔右交叉对称（左的左对右的右、左的右对右的左）
- **思路**：写辅助函数 `isMirror(L, R)`，比较 L 与 R 是否镜像；主函数特判空树后调用 `isMirror(root.left, root.right)`

---

## 解法一：递归

### 思路

- `isMirror(L, R)`：若 L、R 都为空返回 true；若一个为空一个非空返回 false；若值不等返回 false；否则返回 `isMirror(L.left, R.right) && isMirror(L.right, R.left)`
- 主函数：空树返回 true；否则返回 `isMirror(root.left, root.right)`

### 复杂度分析

- **时间复杂度**：O(n)，每个节点最多参与两次比较（左-右配对）
- **空间复杂度**：O(h)，递归栈深度为树高，最坏 O(n)

### 代码实现

```typescript
function isSymmetric(root: TreeNode | null): boolean {
    if (root === null) return true;
    return isMirror(root.left, root.right);
}

function isMirror(L: TreeNode | null, R: TreeNode | null): boolean {
    if (L === null && R === null) return true;
    if (L === null || R === null) return false;
    if (L.val !== R.val) return false;
    return isMirror(L.left, R.right) && isMirror(L.right, R.left);
}
```

#### 具体例子（root = [1,2,2,3,4,4,3]，对称）

```
树：    1
      /   \
     2     2
    / \   / \
   3  4  4  3
```

| 调用 | L | R | 判断 | 递归 |
|------|---|---|------|------|
| isMirror(2,2) | 左2 | 右2 | val 相等 | isMirror(3,3) && isMirror(4,4) |
| isMirror(3,3) | 左3 | 右3 | 叶子，val 相等 | isMirror(null,null) && isMirror(null,null) → true |
| isMirror(4,4) | 左4 | 右4 | 叶子，val 相等 | → true |
| → isMirror(2,2) | — | — | — | true && true → **true** |

**结果**：`true`。

---

## 解法二：迭代（队列配对比较）

### 思路

用队列存「待比较的节点对」。初始入队 `(root.left, root.right)`；每次出队一对 `(L, R)`：若都为空则跳过；若一个空一个非空则返回 false；若值不等返回 false；否则将 `(L.left, R.right)` 和 `(L.right, R.left)` 入队。队列空则全部对称，返回 true。

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(w)，队列中最多约 n/2 对节点，最坏 O(n)

### 代码实现

```typescript
function isSymmetric(root: TreeNode | null): boolean {
    if (root === null) return true;
    const queue: [TreeNode | null, TreeNode | null][] = [[root.left, root.right]];
    while (queue.length > 0) {
        const [L, R] = queue.shift()!;
        if (L === null && R === null) continue;
        if (L === null || R === null || L.val !== R.val) return false;
        queue.push([L.left, R.right]);
        queue.push([L.right, R.left]);
    }
    return true;
}
```

#### 具体例子（root = [1,2,2,null,3,null,3]，不对称）

```
树：    1
      /   \
     2     2
      \     \
       3     3
```

| 轮次 | 出队 (L,R) | 判断 | 入队 |
|------|------------|------|------|
| 1 | (2, 2) | 值相等 | (2.left, 2.right)=(null, 3), (2.right, 2.left)=(3, null) |
| 2 | (null, 3) | 一空一非空 | → **false** |

**结果**：`false`。

---

## 两种解法对比

| 解法 | 思路 | 特点 |
|------|------|------|
| 递归 | isMirror(L,R)：值相等且 L.left↔R.right、L.right↔R.left 对称 | 代码短，易写 |
| 迭代队列 | 用队列存 (L,R) 对，按对出队比较并子对入队 | 不依赖递归栈 |

---

## 核心技巧总结

1. **对称 = 左右镜像**：比较的是「左子树的左 vs 右子树的右」「左子树的右 vs 右子树的左」，交叉配对
2. **空节点**：两边都空算对称；一边空一边非空算不对称
3. **递归/迭代**：都是「成对」比较，保证每次比较的两侧在镜像位置上

---

## 相关题目

- [翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)
- [相同的树](https://leetcode.cn/problems/same-tree/)
- [合并二叉树](https://leetcode.cn/problems/merge-two-binary-trees/)

# 反转链表

## 题目描述

给你单链表的头节点 `head`，请你**反转**链表，并返回反转后的头节点。

**示例 1：**
```
输入：head = [1,2,3,4,5]
输出：[5,4,3,2,1]
```

**示例 2：**
```
输入：head = [1,2]
输出：[2,1]
```

**示例 3：**
```
输入：head = []
输出：[]
```

## 题目分析

- **反转**：每个节点的 `next` 从指向后一个改为指向前一个，原头变尾、原尾变新头
- **思路**：迭代时用 `prev`、`cur`、`next` 三指针，边遍历边改 `cur.next = prev`；递归则先反转后半段，再把当前节点接到反转后的尾部后面

---

## 解法一：迭代（三指针，推荐）

### 思路

- `prev` 表示「已反转部分」的头（初始 null），`cur` 表示当前待反转节点（初始 head）
- 每步：暂存 `next = cur.next`，把 `cur.next` 指向前驱 `prev`，然后 `prev = cur`，`cur = next`
- 当 `cur` 为 null 时，`prev` 即为新头

### 复杂度分析

- **时间复杂度**：O(n)，遍历一遍
- **空间复杂度**：O(1)

### 代码实现

```typescript
function reverseList(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null;
    let cur: ListNode | null = head;
    while (cur !== null) {
        const next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}
```

#### 具体例子（head = [1,2,3,4,5]）

| 步数 | cur | next | 操作（cur.next=prev, prev=cur, cur=next） | 已反转部分 prev |
|------|-----|------|------------------------------------------|-----------------|
| 初始 | 1 | — | — | null |
| 1 | 1 | 2 | 1→null, prev=1, cur=2 | 1 |
| 2 | 2 | 3 | 2→1, prev=2, cur=3 | 2→1 |
| 3 | 3 | 4 | 3→2, prev=3, cur=4 | 3→2→1 |
| 4 | 4 | 5 | 4→3, prev=4, cur=5 | 4→3→2→1 |
| 5 | 5 | null | 5→4, prev=5, cur=null | 5→4→3→2→1 |
| 结束 | null | — | 返回 prev | 新头 5 |

**结果**：新头为 5，链表为 `5→4→3→2→1→null`。

---

## 解法二：递归

### 思路

- 若 `head` 为空或 `head.next` 为空，直接返回 `head`
- 先递归反转 `head.next` 及其后的链表，得到新头 `newHead`（此时从 `head.next` 往后已经反转好，`head.next` 是反转后的尾）
- 把 `head` 接到反转后的尾部后面：`head.next.next = head`，再 `head.next = null`，最后返回 `newHead`

### 复杂度分析

- **时间复杂度**：O(n)
- **空间复杂度**：O(n)，递归栈深度

### 代码实现

```typescript
function reverseList(head: ListNode | null): ListNode | null {
    if (head === null || head.next === null) return head;
    const newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}
```

#### 具体例子（head = [1,2,3]）

```
递归过程：
reverseList(1) → 需 reverseList(2)
  reverseList(2) → 需 reverseList(3)
    reverseList(3) → 3.next 为 null，返回 3（newHead=3）
  回到 2：2.next(即3).next=2 → 3→2；2.next=null → 返回 3
回到 1：1.next(即2).next=1 → 2→1；1.next=null → 返回 3

最终：3→2→1→null，新头 3。
```

---

## 两种解法对比

| 解法 | 思路 | 空间 | 特点 |
|------|------|------|------|
| 迭代三指针 | prev/cur/next，边遍历边改 next | O(1) | 面试首选，无栈开销 |
| 递归 | 先反转后半段，再把当前节点接到新尾部后 | O(n) | 代码短，理解「先子后己」 |

---

## 核心技巧总结

1. **迭代**：牢记「暂存 next → cur.next = prev → prev = cur → cur = next」，避免断链
2. **递归**：反转后 `head.next` 是反转段的尾，用 `head.next.next = head` 把当前节点接上去
3. **边界**：空链表或单节点直接返回 head

---

## 相关题目

- [反转链表 II](https://leetcode.cn/problems/reverse-linked-list-ii/)
- [回文链表](https://leetcode.cn/problems/palindrome-linked-list/)
- [K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/)
