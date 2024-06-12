import{_ as s,c as a,o as i,aa as n}from"./chunks/framework.CAVwB9kQ.js";const t="/Lyc-notes/assets/%E5%B8%83%E5%B1%80%E6%A0%91%E5%92%8C%E5%9B%BE%E5%B1%82%E6%A0%91.CnxLzSFn.png",p="/Lyc-notes/assets/%E7%BB%98%E5%88%B6%E5%88%97%E8%A1%A8.Bq2CdA4N.png",l="/Lyc-notes/assets/%E5%9B%BE%E5%B1%82%E7%BB%98%E5%88%B6%E8%A1%A8.B_WDYZig.png",e="/Lyc-notes/assets/%E5%90%88%E6%88%90%E7%BA%BF%E7%A8%8B%E5%92%8C%E4%B8%BB%E7%BA%BF%E7%A8%8B.DJ2N0p7w.png",r="/Lyc-notes/assets/%E5%9B%BE%E5%B1%82%E5%9D%97.5y56dmuP.png",h="/Lyc-notes/assets/%E6%A0%85%E6%A0%BC%E5%8C%96%E7%BA%BF%E7%A8%8B%E6%B1%A0.LMt3aelG.png",E="/Lyc-notes/assets/GPU%E6%A0%85%E6%A0%BC%E5%8C%96.DSX3j2yC.png",k="/Lyc-notes/assets/%E5%AE%8C%E6%95%B4%E6%B8%B2%E6%9F%93%E6%B5%81%E6%B0%B4%E7%BA%BF.C5_E0kk8.png",o="/Lyc-notes/assets/%E6%9B%B4%E6%96%B0%E5%85%83%E7%B4%A0%E7%9A%84%E5%87%A0%E4%BD%95%E5%B1%9E%E6%80%A7.MUlhTcQE.png",d="/Lyc-notes/assets/%E6%9B%B4%E6%96%B0%E8%83%8C%E6%99%AF%E5%85%83%E7%B4%A0.09KIdaRF.png",c="/Lyc-notes/assets/%E9%81%BF%E5%BC%80%E9%87%8D%E6%8E%92%E5%92%8C%E9%87%8D%E7%BB%98.DO7_juH3.png",P=JSON.parse('{"title":"渲染流程（下）","description":"","frontmatter":{},"headers":[],"relativePath":"browser/rendersec.md","filePath":"browser/rendersec.md","lastUpdated":1717728505000}'),g={name:"browser/rendersec.md"},y=n('<h1 id="渲染流程-下" tabindex="-1">渲染流程（下） <a class="header-anchor" href="#渲染流程-下" aria-label="Permalink to &quot;渲染流程（下）&quot;">​</a></h1><p>这里还是先简单回顾下上节前三个阶段的主要内容：在 HTML 页面内容被提交给渲染引擎之后，渲染引擎首先将 HTML 解析为浏览器可以理解的 DOM；然后根据 CSS 样式表，计算出 DOM 树所有节点的样式；接着又计算每个元素的几何坐标位置，并将这些信息保存在布局树中。</p><h2 id="分层" tabindex="-1">分层 <a class="header-anchor" href="#分层" aria-label="Permalink to &quot;分层&quot;">​</a></h2><p>现在我们有了布局树，而且每个元素的具体位置信息都计算出来了，那么接下来是不是就要开始着手绘制页面了？</p><p>答案依然是否定的。</p><p>因为页面中有很多复杂的效果，如一些复杂的 3D 变换、页面滚动，或者使用 z-indexing 做 z 轴排序等，为了更加方便地实现这些效果，<strong>渲染引擎还需要为特定的节点生成专用的图层，并生成一棵对应的图层树（LayerTree）</strong>。如果你熟悉 PS，相信你会很容易理解图层的概念，正是这些图层叠加在一起构成了最终的页面图像。</p><p>要想直观地理解什么是图层，你可以打开 Chrome 的“开发者工具”，选择“Layers”标签，就可以可视化页面的分层情况。</p><p><img src="'+t+`" alt="alt text"></p><p>通常情况下，并不是布局树的每个节点都包含一个图层，如果一个节点没有对应的层，那么这个节点就从属于父节点的图层。如上图中的 span 标签没有专属图层，那么它们就从属于它们的父节点图层。但不管怎样，最终每一个节点都会直接或者间接地从属于一个层。</p><p>那么需要满足什么条件，渲染引擎才会为特定的节点创建新的图层呢？通常满足下面两点中任意一点的元素就可以被提升为单独的一个图层。</p><p><strong>第一点，拥有层叠上下文属性的元素会被提升为单独的一层</strong>。</p><p><strong>第二点，需要剪裁（clip）的地方也会被创建为图层</strong>。</p><p>不过首先你需要了解什么是剪裁，结合下面的 HTML 代码：</p><div class="language-html vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    overflow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">auto</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    background</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">gray</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;所以元素有了层叠上下文的属性或者需要被剪裁，那么就会被提升成为单独一层，你可以参看下图：&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      从上图我们可以看到，document层上有A和B层，而B层之上又有两个图层。这些图层组织在一起也是一颗树状结构。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      图层树是基于布局树来创建的，为了找出哪些元素需要在哪些层中，渲染引擎会遍历布局树来创建层树（Update</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      LayerTree）。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>在这里我们把 div 的大小限定为 200 _ 200 像素，而 div 里面的文字内容比较多，文字所显示的区域肯定会超出 200 _ 200 的面积，这时候就产生了剪裁，渲染引擎会把裁剪文字内容的一部分用于显示在 div 区域，</p><p>出现这种裁剪情况的时候，渲染引擎会为文字部分单独创建一个层，如果出现滚动条，滚动条也会被提升为单独的层。</p><p>所以说，元素有了层叠上下文的属性或者需要被剪裁，满足其中任意一点，就会被提升成为单独一层。</p><h2 id="图层绘制" tabindex="-1">图层绘制 <a class="header-anchor" href="#图层绘制" aria-label="Permalink to &quot;图层绘制&quot;">​</a></h2><p>在完成图层树的构建之后，渲染引擎会对图层树中的每个图层进行绘制，那么接下来我们看看渲染引擎是怎么实现图层绘制的？</p><p>渲染引擎实现图层的绘制与之类似，会把一个图层的绘制拆分成很多小的<strong>绘制指令</strong>，然后再把这些指令按照顺序组成一个待绘制列表，如下图所示：</p><p><img src="`+p+'" alt="alt text"></p><p>从图中可以看出，绘制列表中的指令其实非常简单，就是让其执行一个简单的绘制操作，比如绘制粉色矩形或者黑色的线等。而绘制一个元素通常需要好几条绘制指令，因为每个元素的背景、前景、边框都需要单独的指令去绘制。所以在图层绘制阶段，输出的内容就是这些待绘制列表。</p><p>你也可以打开“开发者工具”的“Layers”标签，选择“document”层，来实际体验下绘制列表，如下图所示： <img src="'+l+'" alt="alt text"></p><p>在该图中，区域 1 就是 document 的绘制列表，拖动区域 2 中的进度条可以重现列表的绘制过程。</p><h2 id="栅格化-raster-操作" tabindex="-1">栅格化（raster）操作 <a class="header-anchor" href="#栅格化-raster-操作" aria-label="Permalink to &quot;栅格化（raster）操作&quot;">​</a></h2><p>绘制列表只是用来记录绘制顺序和绘制指令的列表，而实际上绘制操作是由渲染引擎中的<strong>合成线程</strong>来完成的。你可以结合下图来看下渲染主线程和合成线程之间的关系：</p><p><img src="'+e+'" alt="alt text"></p><p>如上图所示，当图层的绘制列表准备好之后，主线程会把该绘制列表提交（commit）给合成线程，那么接下来合成线程是怎么工作的呢？</p><p>那我们得先来看看什么是视口，通常一个页面可能很大，但是用户只能看到其中的一部分，我们把用户可以看到的这个部分叫做<strong>视口（viewport）</strong>。</p><p>在有些情况下，有的图层可以很大，比如有的页面你使用滚动条要滚动好久才能滚动到底部，但是通过视口，用户只能看到页面的很小一部分，所以在这种情况下，要绘制出所有图层内容的话，就会产生太大的开销，而且也没有必要。</p><p>基于这个原因，<strong>合成线程会将图层划分为图块（tile）</strong>，这些图块的大小通常是 256x256 或者 512x512，如下图所示：</p><p><img src="'+r+'" alt="alt text"></p><p>然后<strong>合成线程会按照视口附近的图块来优先生成位图，实际生成位图的操作是由栅格化来执行的。所谓栅格化，是指将图块转换为位图</strong>。而图块是栅格化执行的最小单位。渲染进程维护了一个栅格化的线程池，所有的图块栅格化都是在线程池内执行的，运行方式如下图所示：</p><p><img src="'+h+'" alt="alt text"></p><p>通常，栅格化过程都会使用 GPU 来加速生成，使用 GPU 生成位图的过程叫快速栅格化，或者 GPU 栅格化，生成的位图被保存在 GPU 内存中。</p><p>相信你还记得，GPU 操作是运行在 GPU 进程中，如果栅格化操作使用了 GPU，那么最终生成位图的操作是在 GPU 中完成的，这就涉及到了跨进程操作。具体形式你可以参考下图：</p><p><img src="'+E+'" alt="alt text"></p><p>从图中可以看出，渲染进程把生成图块的指令发送给 GPU，然后在 GPU 中执行生成图块的位图，并保存在 GPU 的内存中。</p><h2 id="合成和显示" tabindex="-1">合成和显示 <a class="header-anchor" href="#合成和显示" aria-label="Permalink to &quot;合成和显示&quot;">​</a></h2><p>一旦所有图块都被光栅化，合成线程就会生成一个绘制图块的命令——“DrawQuad”，然后将该命令提交给浏览器进程。</p><p>浏览器进程里面有一个叫 viz 的组件，用来接收合成线程发过来的 DrawQuad 命令，然后根据 DrawQuad 命令，将其页面内容绘制到内存中，最后再将内存显示在屏幕上。</p><p>到这里，经过这一系列的阶段，编写好的 HTML、CSS、JavaScript 等文件，经过浏览器就会显示出漂亮的页面了。</p><h2 id="渲染流水线大总结" tabindex="-1">渲染流水线大总结 <a class="header-anchor" href="#渲染流水线大总结" aria-label="Permalink to &quot;渲染流水线大总结&quot;">​</a></h2><p>好了，我们现在已经分析完了整个渲染流程，从 HTML 到 DOM、样式计算、布局、图层、绘制、光栅化、合成和显示。下面我用一张图来总结下这整个渲染流程：</p><p><img src="'+k+'" alt="alt text"></p><p>结合上图，一个完整的渲染流程大致可总结为如下：</p><ol><li>渲染进程将 HTML 内容转换为能够读懂的 DOM 树结构。</li><li>渲染引擎将 CSS 样式表转化为浏览器可以理解的 styleSheets，计算出 DOM 节点的样式。</li><li>创建布局树，并计算元素的布局信息。</li><li>对布局树进行分层，并生成分层树。</li><li>为每个图层生成绘制列表，并将其提交到合成线程。</li><li>合成线程将图层分成图块，并在光栅化线程池中将图块转换成位图。</li><li>合成线程发送绘制图块命令 DrawQuad 给浏览器进程。</li><li>浏览器进程根据 DrawQuad 消息生成页面，并显示到显示器上。</li></ol><h2 id="相关概念" tabindex="-1">相关概念 <a class="header-anchor" href="#相关概念" aria-label="Permalink to &quot;相关概念&quot;">​</a></h2><p>有了上面介绍渲染流水线的基础，我们再来看看三个和渲染流水线相关的概念——<strong>“重排”“重绘”和“合成”</strong>。理解了这三个概念对于你后续 Web 的性能优化会有很大帮助。</p><h4 id="更新了元素的几何属性-重排" tabindex="-1">更新了元素的几何属性（重排） <a class="header-anchor" href="#更新了元素的几何属性-重排" aria-label="Permalink to &quot;更新了元素的几何属性（重排）&quot;">​</a></h4><p><img src="'+o+'" alt="alt text"></p><p>从上图可以看出，如果你通过 JavaScript 或者 CSS 修改元素的几何位置属性，例如改变元素的宽度、高度等，那么浏览器会触发重新布局，解析之后的一系列子阶段，这个过程就叫<strong>重排</strong>。无疑，<strong>重排需要更新完整的渲染流水线，所以开销也是最大的</strong>。</p><h4 id="更新元素的绘制属性-重绘" tabindex="-1">更新元素的绘制属性（重绘） <a class="header-anchor" href="#更新元素的绘制属性-重绘" aria-label="Permalink to &quot;更新元素的绘制属性（重绘）&quot;">​</a></h4><p>接下来，我们再来看看重绘，比如通过 JavaScript 更改某些元素的背景颜色，渲染流水线会怎样调整呢？你可以参考下图：</p><p><img src="'+d+'" alt="alt text"></p><p>从图中可以看出，如果修改了元素的背景颜色，那么布局阶段将不会被执行，因为并没有引起几何位置的变换，所以就直接进入了绘制阶段，然后执行之后的一系列子阶段，这个过程就叫<strong>重绘</strong>。相较于重排操作，<strong>重绘省去了布局和分层阶段，所以执行效率会比重排操作要高一些</strong>。</p><h4 id="直接合成阶段" tabindex="-1">直接合成阶段 <a class="header-anchor" href="#直接合成阶段" aria-label="Permalink to &quot;直接合成阶段&quot;">​</a></h4><p>那如果你更改一个既不要布局也不要绘制的属性，会发生什么变化呢？渲染引擎将跳过布局和绘制，只执行后续的合成操作，我们把这个过程叫做合成。具体流程参考下图：</p><p><img src="'+c+'" alt="alt text"></p><p>在上图中，我们使用了 CSS 的 transform 来实现动画效果，这可以避开重排和重绘阶段，直接在非主线程上执行合成动画操作。这样的效率是最高的，因为是在非主线程上合成，并没有占用主线程的资源，另外也避开了布局和绘制两个子阶段，所以<strong>相对于重绘和重排，合成能大大提升绘制效率</strong>。</p><h2 id="思考" tabindex="-1">思考 <a class="header-anchor" href="#思考" aria-label="Permalink to &quot;思考&quot;">​</a></h2><p>在优化 Web 性能的方法中，减少重绘、重排是一种很好的优化方式，那么结合文中的分析，你能总结出来为什么减少重绘、重排能优化 Web 性能吗？那又有那些具体的实践方法能减少重绘、重排呢？</p>',62),b=[y];function m(B,u,_,A,C,D){return i(),a("div",null,b)}const F=s(g,[["render",m]]);export{P as __pageData,F as default};