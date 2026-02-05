---
layout: home
layoutClass: 'm-home-layout'

hero:
  name: Lynn Cen
  text: Senior Frontend Engineer
  tagline: Crafting delightful web experiences. Open source contributor with a passion for AI, graphics, and scalable architecture.
  image:
    src: /LynnCenLogo.png
    alt: Lynn Cen
  actions:
    - text: GitLab MCP
      link: https://github.com/LynnCen/gitlab-mcp
    - text: LynKit
      link: https://lynncen.github.io/LynKit/
      theme: alt
    - text: TransLink
      link: https://github.com/LynnCen/translink-i18n
      theme: alt
    - text: Picto
      link: https://github.com/LynnCen/picto
      theme: alt
    - text: About Me
      link: /about/about
      theme: alt

features:
  - icon: 🏗️
    title: Web Frontend
    details: React, Vue, TypeScript, browser internals, build tools, and modern frontend development patterns.
    link: /frontend/
    linkText: Read More


  - icon: 🤖
    title: AI & Agent
    details: Deep dive into LLM applications, Agent architecture, LangGraph integration, and AI-powered development tools.
    link: /ai/
    linkText: Learn More

  - icon: 🎨
    title: Graphics & Rendering
    details: Infinite canvas engines, WebGL/Canvas2D tutorials, computer graphics fundamentals, and image processing.
    link: /cv/
    linkText: Discover

  - icon: 🚀
    title: Open Source
    details: Creator of GitLab MCP, LynKit, TransLink i18n, and Picto. Building tools that empower developers worldwide.
    link: /open-source/
    linkText: Explore Projects

  - icon: 📐
    title: Design Patterns
    details: GoF patterns, microservices patterns like CQRS and Event Sourcing, and modern frontend patterns in practice.
    link: /design-patterns/
    linkText: Study

  - icon: 📚
    title: CS Fundamentals
    details: Data structures, algorithms, computer networks, operating systems, and software engineering principles.
    link: /fundamentals/
    linkText: Explore
---

<style>
/* Magical rotation effect */
.m-home-layout .image-src:hover {
  transform: translate(-50%, -50%) rotate(666turn);
  transition: transform 59s 1s cubic-bezier(0.3, 0, 0.8, 1);
}
</style>
