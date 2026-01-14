function findMedianSortedArrays(nums1, nums2) {
    const merged = [];
    let i = 0;
    let j = 0;

    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] <= nums2[j]) {
            merged.push(nums1[i++])
        } else {
            merged.push(nums2[j++])
        }
    }

    while (i < nums1.length) merged.push(nums1[i++]);
    while (j < nums1.length) merged.push(nums2[j++]);
    const len = merged.length;
console.log(merged);
    if (len % 2 === 0) {
        const middle = len / 2;
        return (merged[middle] + merged[middle - 1]) / 2
    } else {
        return merged[Math.floor(len / 2)]
    }


};

console.log(findMedianSortedArrays([1,3], [2]));