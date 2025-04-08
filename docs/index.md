---
layout: home
layoutClass: 'm-home-layout'

hero:
  name: Lynn Cen
  text: Web Developer Blog
  tagline: Exploring the digital frontier, one line of code at a time
  image:
    src: /LynnCenLogo.png
    alt: Lynn Cen
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
  - icon:
      src: /icons/blogIcon.svg
    title: Developer Tools
    details: The right tools make all the difference. Discover software, plugins, and extensions that enhance productivity and streamline development workflows.
    link: /posts/index
    linkText: Explore
  - icon: 📖
    title: Algorithms & Data Structures
    details: Dive into the core algorithms powering modern systems, including 
      <strong>Exponential Backoff</strong> for resilient networking and 
      <strong>LRU Cache</strong> for optimized memory management. <small> ( ͡° ͜ʖ ͡°) </small><br />
    link: /algorithm/LRU
    linkText: Learn More
  - icon:
      src: /icons/react.svg
    title: React Ecosystem
    details: Master the art of React Hooks (づ｡◕‿‿◕｡)づ <br /> Discover powerful custom hooks to supercharge your applications 🚀
    link: /react/customHook/hooks
    linkText: Discover
  - icon:
      src: /icons/浏览器.svg
    title: Browser Insights
    details: Uncover the inner workings of modern browsers and performance optimization techniques <br /> Witness the incredible magic behind web rendering o_o ....
    link: /browser/Chrome架构
    linkText: Explore
  - icon:
      src: /icons/数据结构1.svg
    title: Computer Science Fundamentals
    details: Essential knowledge that forms the foundation of software engineering <br /> Tackling surprising challenges and common pitfalls
    link: /computerBasics/index
    linkText: Dive In
  - icon:
      src: /icons/Postgraduate。.svg
    title: Academic Journey
    details: <small class="bottom-small">Charting the path through higher education and research</small>
    link: /Postgraduate/school
    linkText: ▶►
---

<style>
/*Magical rotation effect*/
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
