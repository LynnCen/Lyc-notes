---
layout: home
layoutClass: 'm-home-layout'

hero:
  name: 林岑LynnCen
  text: Web Developer Blog
  tagline: LynnCen daily record
  image:
    src: /LynnCenLogo.png
    alt: 林岑LynnCen
  actions:
    - text: About Me
      link: /mine/about
    - text: WebFrontEnd Navigation
      link: /nav/
      theme: alt
    - text: mmPlayer
      link: https://netease-music.fe-mm.com
    - text: Soul
      link: /test
      theme: alt
features:
  - icon: 📖
    title: Algorithm
    details: Explore core algorithms powering modern systems, including 
      <strong>Exponential Backoff</strong> for resilient network retries and 
      <strong>LRU Cache</strong> for high-performance memory management.  <small> ( ͡° ͜ʖ ͡°)  </small><br />
    link: /algorithm/LRU
    linkText: next
  - icon:
      src: /icons/react.svg
    title: Custom Hooks
    details: Learn ReactHooks (づ｡◕‿‿◕｡)づ  <br /> make something customizing hooks 🚀
    link: /react/customHook/hooks
    linkText: hooks
  - icon:
      src: /icons/浏览器.svg
    title: Browser
    details: Cheatsheets for experienced React developers getting started with TypeScript</small><br /> Incredible magic o_o ....
    link: /browser/Chrome架构
    linkText: React Utils
  - icon:
      src: /icons/blogIcon.svg
    title: Blogs
    details: To do a good job, an artisan needs the best tools<br />Record software, plug-ins, extensions, etc. used in development and daily use
    link: /posts/index
    linkText: next
  - icon:
      src: /icons/数据结构1.svg
    title: 数据结构
    details: The pitfalls we stepped on over the years<br />There are always some questions that surprise you
    link: /dataStructure/chapter1
    linkText: ಥ_ಥ
  - icon:
      src: /icons/Postgraduate。.svg
    title: Postgraduate。
    details: <small class="bottom-small">Gods determine what you're going to be</small>
    link: /Postgraduate/school
    linkText: ▶►
---

<style>
/*爱的魔力转圈圈*/
.m-home-layout .image-src:hover {
  transform: translate(-50%, -50%) rotate(666turn);
  transition: transform 59s 1s cubic-bezier(0.3, 0, 0.8, 1);
}

.m-home-layout .details small {
  opacity: 0.8;
}

.m-home-layout .bottom-small {
  display: block;
  margin-top: 2em;
  text-align: right;
}
</style>
