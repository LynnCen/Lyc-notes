import{_ as a,c as l,o as i,aa as e}from"./chunks/framework.CAVwB9kQ.js";const o="/Lyc-notes/assets/%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F%E6%A8%A1%E5%9E%8B.B_PZGm7t.png",t="/Lyc-notes/assets/%E6%96%87%E4%BB%B6%E7%9B%AE%E5%BD%95.BYbJ5XJl.png",r="/Lyc-notes/assets/%E5%A4%9A%E7%BA%A7%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84.BN-LClS1.png",h="/Lyc-notes/assets/%E7%BA%BF%E6%80%A7%E7%9B%AE%E5%BD%95%E6%A3%80%E7%B4%A2.C98MCyqk.png",s="/Lyc-notes/assets/%E6%9C%89%E5%90%91%E6%97%A0%E5%BE%AA%E7%8E%AF%E5%9B%BE%E7%9B%AE%E5%BD%95%E5%B1%82%E6%AC%A1.BzxyAVcg.png",n="/Lyc-notes/assets/%E8%AE%BF%E9%97%AE%E7%9F%A9%E9%98%B5.Ck1pKOHK.png",c="/Lyc-notes/assets/%E5%85%B7%E6%9C%89%E5%88%87%E6%8D%A2%E6%9D%83%E7%9A%84%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6%E7%9F%A9%E9%98%B5.BXlGvShu.png",k=JSON.parse('{"title":"第 4 章 文件管理","description":"","frontmatter":{},"headers":[],"relativePath":"os/chapter4.md","filePath":"os/chapter4.md","lastUpdated":1724149748000}'),d={name:"os/chapter4.md"},p=e('<h1 id="第-4-章-文件管理" tabindex="-1">第 4 章 文件管理 <a class="header-anchor" href="#第-4-章-文件管理" aria-label="Permalink to &quot;第 4 章 文件管理&quot;">​</a></h1><h2 id="文件和文件系统" tabindex="-1">文件和文件系统 <a class="header-anchor" href="#文件和文件系统" aria-label="Permalink to &quot;文件和文件系统&quot;">​</a></h2><h4 id="数据项、记录和文件" tabindex="-1">数据项、记录和文件 <a class="header-anchor" href="#数据项、记录和文件" aria-label="Permalink to &quot;数据项、记录和文件&quot;">​</a></h4><ol><li>数据项（理解为属性）</li><li>记录（理解为对象）</li><li>文件 有结构（含有若干记录对象） 无结构（字符流） 文件属性： （1）文件类型 （2）文件长度 （3）文件的物理地址：通常用于指示文件所在设备及所在设备中地址的指针 （4）文件的建立时间：最后一次修改时间 （5）保护信息 文件-&gt;记录-&gt;数据项 基本功能： 创建文件（create 系统调用）</li><li>所需的外存空间</li><li>文件存放路径</li><li>文件名 系统： 在外存中找到文件所需的空间 根据文件存放路径的信息找到该目录的目录文件，在目录文件中创建该文件对应的目录项</li></ol><p>删除文件（delete 系统调用）</p><ol><li>文件存放路径</li><li>文件名</li></ol><p>系统： 找到文件名对应的目录项 回收文件占用的磁盘块 从目录中删除目录项</p><p>读文件（reacd 系统调用） 写文件（系统调用） 打开文件（open 系统调用）</p><ol><li>文件存放路径</li><li>文件名</li><li>对文件的操作类型（RW？）</li></ol><p>将目录项中的信息复制到内存中的打开文件表中，并将打开文件表的索引号返回给用户 打开文件之后，对文件的操作不再需要每次查询目录，可以根据内存中的打开文件表进行操作 每个进程都有自己的打开文件表，系统中也有一张总的打开文件表 进程打开文件表中的属性：读写指针、访问权限（只读 只写） 系统打开文件表中的特有属性：打开计数器（有多少个进程打开了该文件）</p><p>关闭文件（close 系统调用） 将进程打开文件表中的相应表项删除 系统打开文件表的打开计数器-1 若打开计数器为 0，则删除系统表的表项</p><p>读文件 根据读指针、读入数据量、内存位置将文件数据从外存读入内存 写文件：根据写指针，写出数据，内存位置将文件数据从内存写出外存</p><h4 id="文件名和类型" tabindex="-1">文件名和类型 <a class="header-anchor" href="#文件名和类型" aria-label="Permalink to &quot;文件名和类型&quot;">​</a></h4><ol><li>文件名和拓展名 （1）文件名 （2）拓展名 后缀名，用于指示文件的类型</li><li>文件类型 1）按用途分类 （1）系统文件 （2）用户文件 （3）库文件 2）按文件中数据的形式分类 （1）源文件 由 ASCII 码或汉子构成 （2）目标文件 把源程序编译后 且未经过链接的目标代码所构成文件 （3）可执行文件 3）按存取控制属性分类 （1）只执行文件 （2）只读文件 （3）读写文件 3）按组织形式和处理方式分类 （1）普通文件 （2）目录文件 （3）特殊文件</li></ol><h4 id="文件系统的层次结构" tabindex="-1">文件系统的层次结构 <a class="header-anchor" href="#文件系统的层次结构" aria-label="Permalink to &quot;文件系统的层次结构&quot;">​</a></h4><p><img src="'+o+'" alt="46"></p><h4 id="文件操作" tabindex="-1">文件操作 <a class="header-anchor" href="#文件操作" aria-label="Permalink to &quot;文件操作&quot;">​</a></h4><ol><li>最基本的文件操作 （1）创建文件 （2）删除文件 （3）读文件 （4）写文件 （5）设置文件的读/写位置</li><li>文件的“打开”和“关闭”操作 每次用户对文件的读写，都要从检索目录开始，为了避免重复检索，引入“open”文件系统调用，将指定文件的属性从外存拷贝到内存打开文件表的一个表目中，可通过“关闭”系统调用来关闭此文件</li><li>其它文件操作</li></ol><h2 id="文件的逻辑结构" tabindex="-1">文件的逻辑结构 <a class="header-anchor" href="#文件的逻辑结构" aria-label="Permalink to &quot;文件的逻辑结构&quot;">​</a></h2><h4 id="文件逻辑结构的类型" tabindex="-1">文件逻辑结构的类型 <a class="header-anchor" href="#文件逻辑结构的类型" aria-label="Permalink to &quot;文件逻辑结构的类型&quot;">​</a></h4><ol><li>按文件是否有结构分类 1）有结构文件 由一个个的记录项组成，也称为记录文件 （1）定长记录 （2）变长记录 2）无结构文件 在系统中运行的大量的源程序、可执行文件、库函数等，都是无结构的文件形式，即流式文件。其文件的长度是以字节为单位的。对它的访问，则是利用读、写指针指出下一个要访问的字符</li><li>按文件的组织方式分类 把有结构的文件分为三类： （1）顺序文件 （2）索引文件 （3）索引顺序文件</li></ol><h4 id="顺序文件" tabindex="-1">顺序文件 <a class="header-anchor" href="#顺序文件" aria-label="Permalink to &quot;顺序文件&quot;">​</a></h4><ol><li><p>顺序文件的排列方式 （1）串结构。按存入<strong>时间</strong>的先后进行排序，各记录之间的顺序与关键字无关 （2）顺序结构 由关键字指定顺序排列</p></li><li><p>顺序文件的优缺点 优点：在进行批量存取，顺序文件的效率最高 缺点：查找单个记录性能很差，增加或删除困难</p><p>定长记录的顺序文件，若物理上采用顺序存储，则可实现随机存取。</p></li></ol><h4 id="记录寻址" tabindex="-1">记录寻址 <a class="header-anchor" href="#记录寻址" aria-label="Permalink to &quot;记录寻址&quot;">​</a></h4><ol><li>隐式寻址方式</li><li>显式寻址方式 （1）通过文件中记录的位置 （2）利用关键字</li></ol><h4 id="索引文件" tabindex="-1">索引文件 <a class="header-anchor" href="#索引文件" aria-label="Permalink to &quot;索引文件&quot;">​</a></h4><ol><li>按关键字建立索引</li><li>具有多个索引表的索引文件 索引表本身就是定长记录的顺序文件，一个索引表项就是一条定长记录，支持随机存取</li></ol><h4 id="索引顺序文件" tabindex="-1">索引顺序文件 <a class="header-anchor" href="#索引顺序文件" aria-label="Permalink to &quot;索引顺序文件&quot;">​</a></h4><ol><li>索引顺序文件的特征 索引文件和顺序文件的结合</li><li>一级索引顺序文件</li><li>两级索引顺序文件</li></ol><h4 id="直接文件和哈希文件" tabindex="-1">直接文件和哈希文件 <a class="header-anchor" href="#直接文件和哈希文件" aria-label="Permalink to &quot;直接文件和哈希文件&quot;">​</a></h4><ol><li>直接文件 根据给定的关键字直接获得指定记录的物理地址，（关键字本身决定了记录的物理地址），这种由关键字到记录物理地址的转换称为键值转换</li><li>哈希文件 利用 hash 函数可将关键字转换为相应记录的地址</li></ol><h2 id="文件目录" tabindex="-1">文件目录 <a class="header-anchor" href="#文件目录" aria-label="Permalink to &quot;文件目录&quot;">​</a></h2><h4 id="文件控制块和索引结点" tabindex="-1">文件控制块和索引结点 <a class="header-anchor" href="#文件控制块和索引结点" aria-label="Permalink to &quot;文件控制块和索引结点&quot;">​</a></h4><ol><li>文件控制块 FCB 实现文件名和文件之间的映射，以实现按名存取 1）基本信息 文件名 文件物理地址 文件逻辑结构（流还是记录） 文件的物理结构（顺序文件、链接式文件 索引文件） 2）存取控制信息类 包括文件的存取权限、核准用户的存取权限一级一般用户的存取权限 3）使用信息类 建立时间、修改时间、当前使用信息、打开该文件的进程数、是否被其它进程锁住，在内存中是否被修改</li><li>索引结点 1）索引结点的引入 文件名和文件信息拆开 检索过程中只使用到了文件名 2）磁盘索引结点 存放在磁盘上的索引结点。包括以下： 文件标识符、文件类型、文件存取权限、文件物理地址、文件长度、文件连接计数、文件存取时间 3）内存索引结点 存放在内存中的索引结点。当文件被打开时，要将磁盘索引结点拷贝到内存的索引结点中 索引结点编号 状态（是否上锁）访问计数 文件所属文件系统的逻辑设备号 链接指针</li></ol><h4 id="简单的文件目录" tabindex="-1">简单的文件目录 <a class="header-anchor" href="#简单的文件目录" aria-label="Permalink to &quot;简单的文件目录&quot;">​</a></h4><ol><li>单级文件目录 不允文件重名</li><li>两级文件目录 主文件目录 和 用户文件目录 允许不同用户的文件重名 不允许对文件进行分类 <img src="'+t+'" alt="47"></li></ol><h4 id="树形结构目录-多级目录结构" tabindex="-1">树形结构目录（多级目录结构） <a class="header-anchor" href="#树形结构目录-多级目录结构" aria-label="Permalink to &quot;树形结构目录（多级目录结构）&quot;">​</a></h4><ol><li>树形目录 <img src="'+r+'" alt="48"> 方框代表目录文件，圆圈代表文件</li><li>路径名和当前目录 1）路径名 /B/F/J 2）当前目录 为每个进程设置一个“当前目录”，又称为“工作目录”。进程对各文件的访问都相对于“当前目录”而进行。 从当前目录开始的路径名称为相对路径名 从树根开始的路径名称为绝对路径名</li><li>目录操作 （1）创建目录 （2）删除目录 （3）改变目录 （4）移动目录 （5）链接操作 （6）查找</li></ol><h4 id="目录查询技术" tabindex="-1">目录查询技术 <a class="header-anchor" href="#目录查询技术" aria-label="Permalink to &quot;目录查询技术&quot;">​</a></h4><p>当用户要访问一个已存文件时，系统首先利用用户提供的文件名对目录进行查询。找过该文件的文件控制块或对应索引结点。然后根据 FCB 或索引结点中的记录的文件物理地址（盘块号），换算出文件在磁盘上的物理位置。最后根据磁盘驱动程序将所需文件读入内存。</p><ol><li>线性检索法（顺序检索法） <img src="'+h+'" alt="49"></li><li>hash 方法 建立 hash 索引文件目录，系统利用用户提供的文件名，并将它变换为文件目录的索引值，再利用该索引值到目录中去查找 如果使用了通配符“ * ？ ”便无法通过 hash 检索。</li></ol><h2 id="文件共享" tabindex="-1">文件共享 <a class="header-anchor" href="#文件共享" aria-label="Permalink to &quot;文件共享&quot;">​</a></h2><p>指系统应允许多个用户共享同一份文件 ，只需保存一份文件的副本。</p><h4 id="基于有向无循环图实现文件共享" tabindex="-1">基于有向无循环图实现文件共享 <a class="header-anchor" href="#基于有向无循环图实现文件共享" aria-label="Permalink to &quot;基于有向无循环图实现文件共享&quot;">​</a></h4><ol><li>有向无循环图 DAG 树形结构目录不适合文件共享。 <img src="'+s+'" alt="50"></li><li>利用索引结点（硬链接） 索引结点：文件目录瘦身策略，由于检索文件时只需要用到文件名，因此可以将除文件名之外的信息放到索引结点中，这样子目录项就只包含文件名、索引结点指针 索引结点中设置一个链接计数变量，用于表示本索引结点上的用户目录项数 利用索引结点，将文件的物理地址及其它的文件属性等信息，不再放在目录项中，而是放在索引结点中。在文件目录中只设置文件名及其指向相应索引结点的指针。在索引结点中还应有一个链接计数，表示链接到本索引结点上的用户目录项的数目。</li></ol><h4 id="利用符号链接实现文件共享-软连接" tabindex="-1">利用符号链接实现文件共享（软连接） <a class="header-anchor" href="#利用符号链接实现文件共享-软连接" aria-label="Permalink to &quot;利用符号链接实现文件共享（软连接）&quot;">​</a></h4><p>如 win 的快捷方式</p><ol><li>利用符号链接的基本思想 基本思想：允许一个文件或子目录有多个父目录，但起哄仅有一个作为主父目录，其它几个父目录都是通过符号链接方式与之相链接的</li><li>如何利用符号链实现共享</li><li>利用符号链实现共享的优点 只有文件主才拥有指向其索引结点的指针，而共享该文件的其它用户只有该文件的路径名，并不拥有指向其索引结点的指针。</li><li>利用符号链的共享方式存在的问题 根据文件名去访问，可能要多次地读磁盘</li></ol><p><strong>文件共享总结</strong> 硬链接： 各个用户的目录项指向同一个索引结点 索引结点需要有链接计数 count 某用户想删除文件时，只是删除该用户的目录项，且 count-- 只有 count==0 时 才能真正删除文件数据和索引结点，否则会导致指针悬空</p><p>软连接（符号链接）： 在以 link 型文件中记录共享文件的存放路径（windows 快捷方式） OS 根据路径一层层查找目录、最终找到该共享文件 即使软链接指向的共享文件已被删除、link 文件依然存在，只是通过 link 文件中的文件路径区查找共享文件会失效（找不到对应目录项） 由于用软连接的方式访问共享文件时要查询多级目录，会有多次磁盘 I/O</p><h2 id="文件保护" tabindex="-1">文件保护 <a class="header-anchor" href="#文件保护" aria-label="Permalink to &quot;文件保护&quot;">​</a></h2><h4 id="保护域" tabindex="-1">保护域 <a class="header-anchor" href="#保护域" aria-label="Permalink to &quot;保护域&quot;">​</a></h4><p>进程只能在保护域内执行操作，而且只允许进程访问它们具有“访问权”的对象。</p><ol><li>访问权 把一个进程能对某对象执行操作的权利，称为访问权，每个访问权可以用一个有序对（对象名，权集）来表示。</li><li>保护域 为了对系统中的资源进行保护而引入了保护域的概念，简称为“域”。域是进程对一组对象访问权的集合，进程只能在指定域内执行操作，这样域也就规定了进程所能访问的对象和能执行的操作。</li><li>进程和域间的静态联系 进程和域之间 一一对应</li><li>进程和域间的动态练习方式 一对多关系</li></ol><h4 id="访问矩阵" tabindex="-1">访问矩阵 <a class="header-anchor" href="#访问矩阵" aria-label="Permalink to &quot;访问矩阵&quot;">​</a></h4><ol><li>基本的访问矩阵 用矩阵来描述系统的访问控制，把该矩阵称为访问矩阵 <img src="'+n+'" alt="51"></li><li>具有域切换权的访问矩阵 为了实现进程和域之间的动态练习，应能将进程从一个保护域切换到另一个保护域 <img src="'+c+'" alt="52"></li></ol><h4 id="访问矩阵的修改" tabindex="-1">访问矩阵的修改 <a class="header-anchor" href="#访问矩阵的修改" aria-label="Permalink to &quot;访问矩阵的修改&quot;">​</a></h4><ol><li>拷贝权</li><li>所有权</li><li>控制权</li></ol><h4 id="访问矩阵的实现" tabindex="-1">访问矩阵的实现 <a class="header-anchor" href="#访问矩阵的实现" aria-label="Permalink to &quot;访问矩阵的实现&quot;">​</a></h4><ol><li>访问控制表</li><li>访问权限表</li></ol><p><strong>王道补充</strong> 口令保护： 为文件设置一个“口令”，用户想要访问文件时需要提供口令，由系统验证口令是否正确 实现开销小，但“口令”一半存放在 FCB 或索引结点中（也就是存放在系统中）因此不太安全</p><p>加密保护： 用一个“密码”对文件加密，用户想要访问文件时，需要提供相同的“密码”才能正确的解密。 安全性高，但加密/解密需要耗费一定的时间（异或加密）</p><p>访问控制： 用一个访问控制表（ACL）记录哥哥用户（或各组用户）对文件的访问权限 对文件的访问类型可以分为：读/写/执行/删除等 实现灵活，可以实现复杂的文件保护功能</p>',63),E=[p];function u(b,q,m,B,_,A){return i(),l("div",null,E)}const P=a(d,[["render",u]]);export{k as __pageData,P as default};
