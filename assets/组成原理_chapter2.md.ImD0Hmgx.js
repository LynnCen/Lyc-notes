import{_ as a,c as t,o,aa as e}from"./chunks/framework.CAVwB9kQ.js";const r="/Lyc-notes/assets/%E6%95%B0%E7%A0%81%E6%8C%89%E6%9D%83%E7%9B%B8%E5%8A%A0.CeoF-u_r.png",l="/Lyc-notes/assets/%E5%8D%81%E8%BF%9B%E5%88%B6%E8%BD%ACR.DstHu5oq.png",i="/Lyc-notes/assets/1692874167077.B05ZRIn5.png",s="/Lyc-notes/assets/IEEE754%E6%B5%AE%E7%82%B9%E6%95%B0%E7%9A%84%E8%A7%A3%E9%87%8A.h-2YUHl0.png",n="/Lyc-notes/assets/example4.Dfz9vu5r.png",p="/Lyc-notes/assets/example5.vxIIkmaa.png",h="/Lyc-notes/assets/c%E8%AF%AD%E8%A8%80%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E5%AE%BD%E5%BA%A6.GJQJ6FP9.png",c="/Lyc-notes/assets/1693219490132.BizNw2z8.png",d="/Lyc-notes/assets/CRC%E5%BE%AA%E7%8E%AF%E5%86%97%E4%BD%99.DmF2Xz01.png",C=JSON.parse('{"title":"第 2 章 数据的表示和运算","description":"","frontmatter":{},"headers":[],"relativePath":"组成原理/chapter2.md","filePath":"组成原理/chapter2.md","lastUpdated":1719913244000}'),b={name:"组成原理/chapter2.md"},u=e('<h1 id="第-2-章-数据的表示和运算" tabindex="-1">第 2 章 数据的表示和运算 <a class="header-anchor" href="#第-2-章-数据的表示和运算" aria-label="Permalink to &quot;第 2 章 数据的表示和运算&quot;">​</a></h1><h2 id="数制和编码" tabindex="-1">数制和编码 <a class="header-anchor" href="#数制和编码" aria-label="Permalink to &quot;数制和编码&quot;">​</a></h2><h4 id="信息的二进制编码" tabindex="-1">信息的二进制编码 <a class="header-anchor" href="#信息的二进制编码" aria-label="Permalink to &quot;信息的二进制编码&quot;">​</a></h4><p>1）二进制只有两种状态，使用有两个稳定状态的物理器件就可以表示 二进制数的每一位，制造成本比较低，例如用高低电平或电荷的正负极性都可以很方便地表示 0 和 1</p><p>2）二进制位 1 和 0 正好与逻辑值“真”和“假”相对应 ，计算机实现逻辑运算和程序中 的逻辑判断提供了便利条件。</p><p>3）二进制的编码和运算规则都很简单，通过逻辑门电路能方便地实现算术运算。</p><h4 id="进位记数制及其相互转换" tabindex="-1">进位记数制及其相互转换 <a class="header-anchor" href="#进位记数制及其相互转换" aria-label="Permalink to &quot;进位记数制及其相互转换&quot;">​</a></h4><ol><li><strong>进位计数法</strong></li></ol><p>每个数位所用到的不同数码的个数称为<strong>基数</strong>。</p><p>每个数码所表示的数值等于该数码本身乘以一个与它所在数位有关的常数，这个常数称为<strong>位权</strong></p><p>一个进位数的数值大小就是它的各位数码<strong>按权相加</strong><img src="'+r+'" alt="alt text"> r 是基数 r^j 是第 i 位的位权 用 B 表示二进制，用 O 表示八进制，用 D 表示十 进制(通常直接省略)，用 H 表示十六进制，有时也用前缀 Ox 表示十六进制数 R 进制转十进制</p><ol start="2"><li><strong>不同进制数之间的相互转换</strong></li></ol><p>按权展开：数位 i*该位上的权 R^i 再进行累加 R 称为基数</p><ul><li>十进制 R 进制相互转化</li></ul><p>要将整数和小数分别进行转换。 (1) 整数部分的转换 “除基取余，上右下左”</p><p>(2)小数部分的转换 “乘基取整，上左下右”</p><p>(3)含整数和小数部分的数转换 分别对整数和小数进行转换，再组合起来</p><p><img src="'+l+'" alt="alt text"></p><ul><li>二、八、十六进制数的相互转换</li></ul><p>(1) 八进制转二进制 将八进制的每一位改成等值的 3 位二进制数</p><p>(2) 十六进制转二进制 将十六进制的每一位改成等值的 4 位二进制数</p><p>(3) 二进制转八进制 整数部分：从低位到高位每 3 位用等值的八进制数来替换，最后高位不满 3 位时补 0 凑满 3 位 小数：从高位向低位每 3 位用等值的八进制数来替换，最后低位不满 3 位时补 0 凑满 3 位</p><p>(4) 二进制转十六进制 整数部分：从低位到高位每 4 位用等值的八进制数来替换，最后高位不满 4 位时补 0 凑满 4 位 小数：从高位向低位每 4 位用等值的八进制数来替换，最后低位不满 4 位时补 0 凑满 4 位</p><h4 id="定点与浮点表示" tabindex="-1">定点与浮点表示 <a class="header-anchor" href="#定点与浮点表示" aria-label="Permalink to &quot;定点与浮点表示&quot;">​</a></h4><p>小数点位置约定在固定位置的数称为定点数，小数点位置约定为可浮动的数称为浮点数</p><ol><li><strong>定点表示</strong></li></ol><p>定点表示法用来对定点小数和定点整数进行表示。 定点小数：小数点总是固定在数的最左边，一般用来表示浮点数的尾数部分。 定点整数：小数点总是固定在数的最右边，因此可以用&quot;定点整数&quot;来表示整数。</p><ol start="2"><li><strong>浮点表示</strong></li></ol><p>X = (-1)^S ✖️ M ✖️ R^E S:取值为 0 或 1 M:二进制定点小数 反应 X 的有效位数 R:基数 E:二进制定点整数，称为数 X 的阶或指数 其位数决定 X 的表示范围，其值确定了小数点的位置</p><h4 id="定点数的编码表示" tabindex="-1">定点数的编码表示 <a class="header-anchor" href="#定点数的编码表示" aria-label="Permalink to &quot;定点数的编码表示&quot;">​</a></h4><ol><li><p><strong>真值和机器数</strong> 真值：机器数所代表的实际值。 机器数：常用的有原码、补码和 反码表示法。如 0，101 (这里的逗号“，” 仅为区分符号位与数值位)表示+5</p></li><li><p><strong>机器数的定点表示</strong> 通常用补码整数表示整数，用原码小数表示浮点数的尾数部分，用移码表示浮点数的阶码部分，</p></li><li><p><strong>原码、补码、反码、移码</strong> 定点数的编码表示方法有 4 种：原码、补码、反码和移码。 机器数：数值数据在计算机内部编码表示的数称为机器数。 真值：机器数真正的值(现实世界带有正负号的数)称为机器数的真值。 1.原码表示法 定义：由符号位直接后跟数值位构成，也称为“符号-数值”表示法。正数和负数的编码表示仅符号位不同，数值位完全相同 [ +0 ]原 = 000...0 [ -0 ]原 = 100...0</p><p>优点：与真值的对应关系直观、方便 实现乘除运算比较简便 缺点：0 的表示不唯一，原码加减运算规则复杂 2.补码表示法</p><p>实现加减运算的统一，即用加法来实现减法运算。也称为“2-补码”表示法，由符号位后跟真值的模 2^n 补码构成</p><p>(1) 模运算 A = B + K ✖️ M 记为 A = B (mod M) A、B 各除以 M 后的余数相同，故称为 B 和 A 为模 M 同余，也就是说 一个数与它除以“模”后得到的余数是等价的 时钟 ：</p><p>(2) 补码的定义</p><p>真值-&gt;补码：各位取反，末位加 1 （写出二进制 从右向左找到第一个 1，1 左边的数按位取反，符号位不参与）</p><p>补码-&gt;真值：各位取反，末位加 1</p><p>正数的补码：符号位取 0，其余不变 负数的补码等于模与该负数绝对值之差-&gt; 写出二进制 从右向左找到第一个 1，1 左边的数按位取反，符号位不参与。</p><p>使用 10...000 表示最大负数 使用 01...111 表示最大正数 正数和负数的数量相同，一个正零 00000 和一个负零 111111</p><p>(3) 特殊数据的补码表示 补码 0 的表示是唯一的 减少了 +0 和-0 之间的转换</p><p>(4)补码与真值之间的转换方法 正数：正号转换位 0，数值部分不变 负数：做减法运算，“各位取反，末位加 1”。 注意：最小负数取负后的补码表示是不存在的</p></li><li><p><strong>反码表示法</strong> 各位取反 优点： 缺点：</p></li><li><p><strong>移码表示法</strong> 浮点数的指数都是用一种移码表示 指数的阶：真值 阶码：机器数 定义：[E]移 = 2^n-1 + E (2^n-1 为偏置常数) 主要用来表示浮点数的指数，移码只能用来表示定点整数</p></li></ol><p>补码的符号位取反</p><h2 id="运算方法和运算电路" tabindex="-1">运算方法和运算电路 <a class="header-anchor" href="#运算方法和运算电路" aria-label="Permalink to &quot;运算方法和运算电路&quot;">​</a></h2><h4 id="基本运算部件" tabindex="-1">基本运算部件 <a class="header-anchor" href="#基本运算部件" aria-label="Permalink to &quot;基本运算部件&quot;">​</a></h4><p>运算器由算术逻辑单元(ArithmeticLogicUnit,ALU)、移位器、状态寄存器(PSW)和通用寄存器组等组成。运算器的基本功能包括加、减、乘、除四则运算，与、或、非、异或等逻辑运算，以及移位、求补等操作。ALU 的核心部件是加法器。</p><p>无符号数加法器只能用于两个无符号数相加，不能进行有符号整数的加/减运算</p><p>OF（溢出位）：<strong>有符号数</strong>的加减运算是否发生了溢出。<code>OF = Cn 异或 Cn-1</code>。OF = 1 ，说明发生了溢出</p><p>SF（符号位）：<strong>有符号数</strong>加减运算结果的正负性。SF = 0 ，表示运算结果为正</p><p>ZF（零标志位）：加减运算结果是否为 0。ZF = 1 表示运算结果为 0， 对于无符号数和有符号数的运算，ZF 都有意义</p><p>CF（进位/借位）：<strong>无符号数</strong>加减法是否发生了溢出。<code>CF = Sub 异或 Cout</code>当 CF = 1 说明发生了溢出</p><p><img src="'+i+'" alt="1692874167077"></p><ol><li><p><strong>带标志位的加法器</strong></p></li><li><p><strong>算数逻辑单元（ALU）</strong></p></li></ol><h4 id="定点数的移位运算" tabindex="-1">定点数的移位运算 <a class="header-anchor" href="#定点数的移位运算" aria-label="Permalink to &quot;定点数的移位运算&quot;">​</a></h4><p>当计算机中没有乘/除法运算电路时，可以通过加法和移位相结合的方法来实现乘/除法运算。 对于任意二进制整数，左移一位，若不产生溢出，相当于乘以 2(与十进制数的左移一位相当于乘以 10 类似);右移一位，若不考虑因移出而舍去的末位尾数，相当于除以 2。</p><ol><li><p>逻辑移位 逻辑移位将操作数视为无符号整数。逻辑移位的规则:左移时，高位移出，低位补 0;右移时，低位移出，高位补 0 。对于无符号整数的逻辑左移，若高位的 1 移出，则发生溢出。</p></li><li><p>算数移位 算术移位需要考虑符号位的问题，即将操作数视为有符号整数 算术移位的规则:左移时，高位移出，低位补 0，若移出的高位不同于移位后的符号位，即左移前后的符号位不同，则发生溢出;右移时，低位移出，高位补符号位，若低位的 1 移出，则影响精度。例如，补码 1001 和 0101 左移时会发生溢出，右移时会丢失精度。</p></li></ol><h4 id="定点数的加减运算" tabindex="-1">定点数的加减运算 <a class="header-anchor" href="#定点数的加减运算" aria-label="Permalink to &quot;定点数的加减运算&quot;">​</a></h4><ol><li>补码的加减法运算</li></ol><p>1）按二进制运算规则运算，逢二进一。 2）若做加法，两个数的补码直接相加;若做减法，则将被减数与减数的负数补码相加。 3）符号位与数值位一起参与运算，加、减运算结果的符号位也在运算中直接得出。 4）最终运算结果的高位丢弃，保留 nt 1 位，运算结果亦为补码。</p><ol start="2"><li>溢出判别方法</li></ol><p>仅当两个符号<strong>相同的数相加</strong>或两个符号<strong>相异的数相减</strong>才可能产生溢出。</p><p>溢出判断方法： （1）采用一位符号位 由于减法运算在机器中是用加法器实现的，因此无论是加法还是减法，只要参加操作的两个数的符号相同， 结果又与原操作数的符号不同，则表示 结果溢出</p><p>（2）采用双符号位 双符号位法也称模 4 补码。运算结果的两个符号位 Ss1, Ss2 相同，表示未溢出;运算结果的两个符号位 Ss1Ss2 不同，表示溢出，此时最高位符号位代表真正的符号</p><p>（3）采用一位符号位根据数值位的进位情况判断溢出 若符号位 (最高位)的进位 Cn，与最高数位 (次高位)的进位 Cn-1s 相同，说明无溢出，否则说明有溢出</p><ol start="3"><li>加减运算电路</li></ol><h2 id="整数的表示" tabindex="-1">整数的表示 <a class="header-anchor" href="#整数的表示" aria-label="Permalink to &quot;整数的表示&quot;">​</a></h2><h4 id="无符号整数的表示" tabindex="-1">无符号整数的表示 <a class="header-anchor" href="#无符号整数的表示" aria-label="Permalink to &quot;无符号整数的表示&quot;">​</a></h4><h4 id="带符号整数的表示" tabindex="-1">带符号整数的表示 <a class="header-anchor" href="#带符号整数的表示" aria-label="Permalink to &quot;带符号整数的表示&quot;">​</a></h4><p>补码的优点：</p><h4 id="c-语言中的整数类型" tabindex="-1">C 语言中的整数类型 <a class="header-anchor" href="#c-语言中的整数类型" aria-label="Permalink to &quot;C 语言中的整数类型&quot;">​</a></h4><p>c 语言中，一个运算同时有无符号数和有符号整数参加，C 编译器会隐含地将带符号整数强制类型转换为无符号数。 -2147483648 二进制 真值：1 1000……000 补码：1 1000……000 -2147483647 二进制 真值：1 0111……111 补码：1 1000……001 -2147483648 &lt; -2147483647</p><h3 id="实数的表示" tabindex="-1">实数的表示 <a class="header-anchor" href="#实数的表示" aria-label="Permalink to &quot;实数的表示&quot;">​</a></h3><p>计算机中用专门用浮点数来表示实数</p><h4 id="浮点数的表示格式" tabindex="-1">浮点数的表示格式 <a class="header-anchor" href="#浮点数的表示格式" aria-label="Permalink to &quot;浮点数的表示格式&quot;">​</a></h4><p>X = (-1)^S ✖️ M ✖️ R^E S：取值为 0 或 1 0 为正数 1 为负数 M：表示定点小数 称为 X 的尾数 原码小数表示 E：是一个二进制定点整数，称为数 X 的阶或指数 用移码表示 R：基数 2、4、16</p><p><strong>IBM370</strong></p><h4 id="浮点数的规格化" tabindex="-1">浮点数的规格化 <a class="header-anchor" href="#浮点数的规格化" aria-label="Permalink to &quot;浮点数的规格化&quot;">​</a></h4><p>浮点数尾数的位数决定浮点数的有效位数，有效位数越多，数据的精度越高。 规格化操作：“左归”和“右归”，当有效位进到小数点前面时，需要进行右归，右归时，尾数每右移一位，阶码加 1，直到尾数变成规格化的形式，形如 0.0000bbb✖️2^E，需要左归，尾数每前进一位，阶码减 1，直到尾数变成规格化的形式为止。</p><h4 id="ieee-754-浮点数标准" tabindex="-1">IEEE 754 浮点数标准 <a class="header-anchor" href="#ieee-754-浮点数标准" aria-label="Permalink to &quot;IEEE 754 浮点数标准&quot;">​</a></h4><p>几乎所有计算机都采用 IEEE754 标准制定浮点数。这个标准提供了两种基本浮点格式：32 位单精度和 64 位双精度格式。 32 位单精度：1 位 8 位 23 位 符号位 阶码 尾数 64 位双精度：1 位 11 位 52 位 符号位 阶码 尾数 32 位单精度包含 1 位符号位 s，8 位阶码 e 和 23 位尾数 f； 64 位双精度格式包含 1 位符号位 s，11 位阶码和 52 位尾数 f; 尾数用<strong>原码</strong>表示，第一位总为 1，因此可在尾数中省略第一位的 1，称为隐藏位，使得单精度格式的 23 位尾数实际上表示了 24 位有效数字，双精度格式的 52 位尾数实际上表示了 53 位有效数字。隐藏位 1 的位置在小数点之前 指数用<strong>移码</strong>表示，偏置常数并不是通常 n 位移码所用的 2^n-1，而是<strong>2^n-1 - 1</strong>,因此单精度和双精度的偏执常数分别位 127 和 1023 优点： （1）尾数可表示的位数多一位，因而使浮点数的精度更高 （2）指数的可表示范围更大，因而使浮点数范围更大。</p><p><img src="'+s+'" alt="9"></p><p>1.全 0 阶码全 0 尾数：+0 / -0 IEEE754 的零有两种表示：+0 和 -0 零的符号取决于数符 s。一般情况下+0 和-0 是等效的 2.全 0 阶码非 0 尾数：非规格化数 非规格化数的特点：阶码全为 0，尾数高位有一个或几个连续的 0，但不全为 0，非规格化数的隐藏位位 0，并且单精度和双精度浮点数的指数分别为-126 和-1022 (-1)^s ✖️ 0.f ✖️2^-126 和(-1)^s ✖️ 0.f ✖️ 2^-1022 3.全 1 阶码全 0 尾数：+∞ / -∞ 4.全 1 阶码非 0 尾数：NAN 5.阶码非全 0 且非全 1:规格化非 0 数</p><p>例题： <img src="'+n+'" alt="10"></p><p>IEEE754 标准的单精度和双精度格式的特征参数： <img src="'+p+'" alt="11"></p><h4 id="浮点数的加减运算" tabindex="-1">浮点数的加减运算 <a class="header-anchor" href="#浮点数的加减运算" aria-label="Permalink to &quot;浮点数的加减运算&quot;">​</a></h4><ol><li><p>对阶 小阶向大阶看齐</p></li><li><p>尾数加减</p></li><li><p>尾数规格化 右归：1x.xxxx -&gt; 1.xxxxx 指数加 1 左归：0.001xx -&gt; 1.xxxx 指数减 1</p></li><li><p>舍入 就近舍入：尾数全部保留，运算后，超出部分四舍五入 正向舍入：取右边最近的表示数 负向舍入：取左边最近的表示数 截断法：直接截取所需部分，丢弃后面的所有位</p></li><li><p>溢出判断 指数上溢 11110 变为 11111 指数下溢 00001 变为 00000</p></li></ol><h3 id="c-语言中的浮点数类型" tabindex="-1">C 语言中的浮点数类型 <a class="header-anchor" href="#c-语言中的浮点数类型" aria-label="Permalink to &quot;C 语言中的浮点数类型&quot;">​</a></h3><p>整数数据类型： char：通常是 8 位，但可能是 16 位或 32 位。 short：通常是 16 位。 int：通常是 32 位。 long：通常是 32 位，但有时也可能是 64 位。 long long：通常是 64 位。</p><p>浮点数类型： float：通常是 32 位，其中 1 位表示符号，8 位表示指数，23 位表示尾数。 double：通常是 64 位，其中 1 位表示符号，11 位表示指数，52 位表示尾数。 long double：位数因编译器和操作系统而异，通常是 80 位或 128 位。</p><p>C 语言中有 float 和 double 两种不同的浮点数类型，分别对应 IEEE754 单精度浮点数格式和双精度格式，相应的十进制有效数字分别为 7 位和 17 位 int、float 和 double 类型转换 （1）从 int 转换为 float，不会发生溢出，但可能有数据被舍入 （2）从 int 或 float 转换为 double，因为 double 的有效位更多，故能保留精确值 （3）从 double 转为 float，因为 float 表示范围更小，故可能发生溢出，此外，有效位数表少，故可能被舍入 （4）从 float 或 double 转位 int 时，因为 int 没有小数部分，所以数据有可能会向 0 方向截断，例如 1.99999999 截断为 1 因为 int 的表示范围更小，故可能发生溢出</p><h3 id="十进制数的表示" tabindex="-1">十进制数的表示 <a class="header-anchor" href="#十进制数的表示" aria-label="Permalink to &quot;十进制数的表示&quot;">​</a></h3><h4 id="用-ascii-码字符表示" tabindex="-1">用 ASCII 码字符表示 <a class="header-anchor" href="#用-ascii-码字符表示" aria-label="Permalink to &quot;用 ASCII 码字符表示&quot;">​</a></h4><h4 id="用-bcd-码表示" tabindex="-1">用 BCD 码表示 <a class="header-anchor" href="#用-bcd-码表示" aria-label="Permalink to &quot;用 BCD 码表示&quot;">​</a></h4><h3 id="非数值数据的编码表示" tabindex="-1">非数值数据的编码表示 <a class="header-anchor" href="#非数值数据的编码表示" aria-label="Permalink to &quot;非数值数据的编码表示&quot;">​</a></h3><h4 id="逻辑值" tabindex="-1">逻辑值 <a class="header-anchor" href="#逻辑值" aria-label="Permalink to &quot;逻辑值&quot;">​</a></h4><p>逻辑数据只能参加逻辑运算，并且是按位进行的，如按位“与”，按位“或”，逻辑左移，逻辑右移等。</p><h3 id="西文字符" tabindex="-1">西文字符 <a class="header-anchor" href="#西文字符" aria-label="Permalink to &quot;西文字符&quot;">​</a></h3><h3 id="数据的宽度和存储" tabindex="-1">数据的宽度和存储 <a class="header-anchor" href="#数据的宽度和存储" aria-label="Permalink to &quot;数据的宽度和存储&quot;">​</a></h3><h4 id="数据的宽度和单位" tabindex="-1">数据的宽度和单位 <a class="header-anchor" href="#数据的宽度和单位" aria-label="Permalink to &quot;数据的宽度和单位&quot;">​</a></h4><p>二进制数据的每一位（0 或 1）是组成二进制信息的最小单位，称为一个比特（bit），或称为位元，简称位。比特是计算机处理、存储后劲儿传输信息的最小单位。 西文字符需用 8 个 bit 表示，汉字需用 16 个比特才能表示。在计算机内部，二进制信息的计量单位是字节（byte），也称为位组，一个字节等于 8 个比特。 还经常使用字（word）作为单位，不同的计算机，字的长度和组成不完全相同，一个字可能由 2 个字节，4 个字节，8 个字节甚至 16 个字节组成 机器字长：指 CPU 内部用于整数运算的数据通路的宽度。 CPU 数据通路：指 CPU 内部数据流经的路径以及路径上的部件，主要是 CPU 内部进行数据运算、存储和传送的部件，这些部件的宽度基本一致，才能互相匹配，因此 CPU 内部用于整数运算的运算器位数和通用寄存器宽度一致。</p><p>表示容量： 1KB = 2^10B = 1024B 1MB = 2^20B = 1058576B 1GB = 2^30B = 1073741824B 1TB = 2^40B 1PB = 2^50B 1EB = 2^60B 1ZB = 2^70B 1YB = 2^80B</p><p>表示距离、频率 速率 ： 比特/秒(b/s) bps 1kb/s = 10^3b/s = 1000b/s 1Mb/s = 10^6b/s 1Gb/s = 10^9b/s 1Tb/s = 10^12b/s</p><p>C 语言数值类型的宽度 <img src="'+h+'" alt="11"></p><h4 id="数据的存储和排列顺序" tabindex="-1">数据的存储和排列顺序 <a class="header-anchor" href="#数据的存储和排列顺序" aria-label="Permalink to &quot;数据的存储和排列顺序&quot;">​</a></h4><p>最低有效位：LSB 最高位 最高有效位：MSB 最低位 带符号数：最高位就是符号位 现代计算机采用<strong>字节编址方式</strong>，即对存储空间上的存储单元进行编号时，每个地址编号中存放一个字节。换而言之，采用字节编址，对存储空间进行按字节分组，并对每个分组进行编号。</p><p>假定 int 型变量 i 的地址为 0800H,i 的机器数为 01 23 45 67H 大端方式： 0800H 0801H 0802H 0803H 01H 23H 45H 67H 小端方式： 0800H 0801H 0802H 0803H 67H 45H 23H 01H</p><p>大端方式将数据的最高有效字节 MSB 存放在低地址单元中，将最低有效字节 LSB 存放在最高地址单元中，即数据的地址就是 MSB 所在的地址 小端方式将数据的最高有效字节 MSB 放在高地址中，将最低有效字节 LSB 放在低地址中，即数据的地址就是 LSB 所在地址。</p><h5 id="边界对齐" tabindex="-1">边界对齐 <a class="header-anchor" href="#边界对齐" aria-label="Permalink to &quot;边界对齐&quot;">​</a></h5><p><img src="'+c+'" alt="1693219490132"></p><h3 id="数据校验码" tabindex="-1">数据校验码 <a class="header-anchor" href="#数据校验码" aria-label="Permalink to &quot;数据校验码&quot;">​</a></h3><h4 id="奇偶校验码" tabindex="-1">奇偶校验码 <a class="header-anchor" href="#奇偶校验码" aria-label="Permalink to &quot;奇偶校验码&quot;">​</a></h4><p>只能发现奇数位的错位，不能发现偶数位的错位。不提供纠错功能</p><h4 id="海明码" tabindex="-1">海明码 <a class="header-anchor" href="#海明码" aria-label="Permalink to &quot;海明码&quot;">​</a></h4><p>将数据按某种规律分成若干组，对每组进行相应的奇偶检测，以提供多位校验信息，从而可对错误位置进行定位，并将其纠正。实质上就是一种多重奇偶校验码 1.校验位的位数的确定 2.分组方式的确定 3.校验位的生成和检错、纠错</p><h4 id="循环冗余码-crc" tabindex="-1">循环冗余码(CRC) <a class="header-anchor" href="#循环冗余码-crc" aria-label="Permalink to &quot;循环冗余码(CRC)&quot;">​</a></h4><p>具有较强检错、纠错能力的校验码，常用于外存储器的数据校验。 1.CRC 码的检错方式 一个 CRC 码一定能被生成多项式整除，所以当数据和校验位一起送到接收端后，只要接受到的数据和校验位用同样的生成多项式相除，如果正好除尽，表示没有发生错误，若除不尽，则表示某些数据位发生了错误。 2.校验位的生成 <img src="'+d+'" alt="12"> 3.CRC 码的纠错 余数是否为 0</p>',105),g=[u];function q(m,E,x,B,f,P){return o(),t("div",null,g)}const k=a(b,[["render",q]]);export{C as __pageData,k as default};
