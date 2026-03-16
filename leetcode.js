function addStrings(num1, num2) {
  let len1 = num1.length - 1;
  let len2 = num2.length - 1;
  let carry = 0;
  const result = [];
  while (len1 >= 0 || len2 >= 0 || carry > 0) {
      const target1 = len1 >= 0 ? parseInt(num1[len1]) : 0;
      const target2 = len2 >= 0 ? parseInt(num2[len2]) : 0;
      const sum = target1 + target2 + carry;
      carry = Math.floor(sum / 10);
      result.push((sum % 10).toString());


      console.log('target1', target1);
      console.log('target2', target2);
      console.log('carry', carry);
      console.log('sum', sum);
      console.log('result', result);
      len1--;
      len2--;
  }
  return result.reverse().join('')
};

console.log(addStrings('123', '456'));
