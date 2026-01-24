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
