import{_ as s,c as i,o as a,aa as n}from"./chunks/framework.CAVwB9kQ.js";const b=JSON.parse('{"title":"第二章 线性表 课后习题","description":"","frontmatter":{},"headers":[],"relativePath":"dataStructure/chapter2_ex.md","filePath":"dataStructure/chapter2_ex.md","lastUpdated":1725441411000}'),p={name:"dataStructure/chapter2_ex.md"},l=n(`<h1 id="第二章-线性表-课后习题" tabindex="-1">第二章 线性表 课后习题 <a class="header-anchor" href="#第二章-线性表-课后习题" aria-label="Permalink to &quot;第二章 线性表 课后习题&quot;">​</a></h1><h2 id="线性表" tabindex="-1">线性表 <a class="header-anchor" href="#线性表" aria-label="Permalink to &quot;线性表&quot;">​</a></h2><h3 id="顺序表" tabindex="-1">顺序表 <a class="header-anchor" href="#顺序表" aria-label="Permalink to &quot;顺序表&quot;">​</a></h3><p><strong>设将n(n&gt;1)个整数存放到一维数组R中。设计一个在时间和空间两方面都尽可能高效的算法。将R中保存的序列循环左移p(0&lt;P&lt;n)个位置，即将R中的数据由(Xo,X1,...Xn-1)变换为(Xp,Xp+1,Xn-1,Xo,...,Xp-1)。要求:</strong></p><p>1️⃣ 给出算法的基本设计思想。</p><p>2️⃣ 根据设计思想，采用C或C++或Java语言描述算法，关键之处给出注释。</p><p>3️⃣ 说明你所设计算法的时间复杂度和空间复杂度</p><p><strong>解法一（暴力解）：</strong></p><p>1️⃣ 构建一个辅助数组B[n]，依次遍历数组A，若i小于p，则将A[i]中的数据加入到B[n-p+i]，若i&gt;=p，则将A[i]放入B[j]的位置。</p><p>2️⃣ 如下</p><div class="language-c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int[]</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> leftMove</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> A</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">[]</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">){</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> j </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> B</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[n];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ; i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n;i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">p){</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      B</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[n</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">p</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">i] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> A</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[i]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">      B</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[j] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> A</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[i];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      j</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> B;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>3️⃣ 时间复杂度O(n)、空间复杂度O(n);</p><p><strong>解法二（最优解）</strong></p><p>1️⃣ 可将问题视为把数组ab转换成数组ba(a代表数组的前p个元素，b代表数组中余下的n-p个元素)，先将a逆置得到a^-1 b，再将b逆置得到a^-1 b^-1，最后将整个a^-1 b^-1逆置得到(a^-1 b^-1)^-1=ba。设Reverse函数执行将数组逆置的操作，对abcdefgh向左循环移动3(p=3)个位置的过程如下:</p><p>Reverse(0,p-1)得到cbadefgh:</p><p>Reverse(p,n-1)1Ilcbahgfed;</p><p>Reverse(0,n-1)得到defghabc。</p><p>注:在Reverse中，两个参数分别表示数组中待转换元素的始末位置。</p><p>2️⃣ 如下</p><div class="language-c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div>`,20),e=[l];function t(h,k,r,E,d,c){return a(),i("div",null,e)}const y=s(p,[["render",t]]);export{b as __pageData,y as default};
