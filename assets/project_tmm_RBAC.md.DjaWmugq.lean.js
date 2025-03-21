import{_ as r,C as E,c as d,o as a,a8 as p,b as h,j as k,w as i,a as n,G as e,a9 as t}from"./chunks/framework.B1-gFi6y.js";const m=JSON.parse('{"title":"基于RBAC模型的群组权限体系设计与实现","description":"","frontmatter":{},"headers":[],"relativePath":"project/tmm/RBAC.md","filePath":"project/tmm/RBAC.md","lastUpdated":1742551972000}'),A={name:"project/tmm/RBAC.md"};function g(y,s,c,b,B,D){const l=E("Mermaid");return a(),d("div",null,[s[2]||(s[2]=p("",20)),(a(),h(t,null,{default:i(()=>[e(l,{id:"mermaid-146",class:"mermaid",graph:"graph%20TD%0A%20%20%20%20A%5B%E7%94%A8%E6%88%B7%E5%B1%82%5D%20--%3E%20B%5B%E8%AE%A4%E8%AF%81%E5%B1%82%5D%0A%20%20%20%20B%20--%3E%20C%5B%E6%8E%88%E6%9D%83%E5%B1%82%5D%0A%20%20%20%20C%20--%3E%20D%5B%E8%B5%84%E6%BA%90%E5%B1%82%5D%0A%20%20%20%20%0A%20%20%20%20E%5B%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86%5D%20--%3E%20A%0A%20%20%20%20F%5B%E8%BA%AB%E4%BB%BD%E8%AE%A4%E8%AF%81%5D%20--%3E%20B%0A%20%20%20%20G%5B%E6%9D%83%E9%99%90%E7%AE%A1%E7%90%86%5D%20--%3E%20C%0A%20%20%20%20H%5B%E7%BE%A4%E7%BB%84%E7%AE%A1%E7%90%86%5D%20--%3E%20C%0A%20%20%20%20I%5B%E8%B5%84%E6%BA%90%E7%AE%A1%E7%90%86%5D%20--%3E%20D%0A"})]),fallback:i(()=>s[0]||(s[0]=[n(" Loading... ")])),_:1})),s[3]||(s[3]=k("h3",{id:"_4-2-权限检查流程",tabindex:"-1"},[n("4.2 权限检查流程 "),k("a",{class:"header-anchor",href:"#_4-2-权限检查流程","aria-label":'Permalink to "4.2 权限检查流程"'},"​")],-1)),(a(),h(t,null,{default:i(()=>[e(l,{id:"mermaid-150",class:"mermaid",graph:"sequenceDiagram%0A%20%20%20%20%E7%94%A8%E6%88%B7-%3E%3E%E7%B3%BB%E7%BB%9F%3A%20%E8%AF%B7%E6%B1%82%E6%89%A7%E8%A1%8C%E6%93%8D%E4%BD%9C%0A%20%20%20%20%E7%B3%BB%E7%BB%9F-%3E%3E%E8%AE%A4%E8%AF%81%E6%9C%8D%E5%8A%A1%3A%20%E9%AA%8C%E8%AF%81%E7%94%A8%E6%88%B7%E8%BA%AB%E4%BB%BD%0A%20%20%20%20%E8%AE%A4%E8%AF%81%E6%9C%8D%E5%8A%A1--%3E%3E%E7%B3%BB%E7%BB%9F%3A%20%E8%BF%94%E5%9B%9E%E7%94%A8%E6%88%B7%E8%BA%AB%E4%BB%BD%E4%BF%A1%E6%81%AF%0A%20%20%20%20%E7%B3%BB%E7%BB%9F-%3E%3E%E7%BE%A4%E7%BB%84%E6%9C%8D%E5%8A%A1%3A%20%E8%8E%B7%E5%8F%96%E7%94%A8%E6%88%B7%E5%9C%A8%E7%9B%AE%E6%A0%87%E7%BE%A4%E7%BB%84%E7%9A%84%E8%BA%AB%E4%BB%BD%0A%20%20%20%20%E7%BE%A4%E7%BB%84%E6%9C%8D%E5%8A%A1--%3E%3E%E7%B3%BB%E7%BB%9F%3A%20%E8%BF%94%E5%9B%9E%E6%88%90%E5%91%98%E8%BA%AB%E4%BB%BD%E4%BF%A1%E6%81%AF%0A%20%20%20%20%E7%B3%BB%E7%BB%9F-%3E%3E%E6%9D%83%E9%99%90%E6%9C%8D%E5%8A%A1%3A%20%E6%A3%80%E6%9F%A5%E6%9D%83%E9%99%90(%E7%94%A8%E6%88%B7%2C%E8%A7%92%E8%89%B2%2C%E6%93%8D%E4%BD%9C%2C%E8%B5%84%E6%BA%90)%0A%20%20%20%20%E6%9D%83%E9%99%90%E6%9C%8D%E5%8A%A1-%3E%3E%E7%BC%93%E5%AD%98%3A%20%E6%9F%A5%E8%AF%A2%E6%9D%83%E9%99%90%E7%BC%93%E5%AD%98%0A%20%20%20%20%E7%BC%93%E5%AD%98--%3E%3E%E6%9D%83%E9%99%90%E6%9C%8D%E5%8A%A1%3A%20%E8%BF%94%E5%9B%9E%E7%BC%93%E5%AD%98%E7%BB%93%E6%9E%9C(%E5%8F%AF%E8%83%BD%E6%9C%AA%E5%91%BD%E4%B8%AD)%0A%20%20%20%20%E6%9D%83%E9%99%90%E6%9C%8D%E5%8A%A1-%3E%3E%E6%95%B0%E6%8D%AE%E5%BA%93%3A%20%E6%9F%A5%E8%AF%A2%E8%A7%92%E8%89%B2-%E6%9D%83%E9%99%90%E5%85%B3%E7%B3%BB%0A%20%20%20%20%E6%95%B0%E6%8D%AE%E5%BA%93--%3E%3E%E6%9D%83%E9%99%90%E6%9C%8D%E5%8A%A1%3A%20%E8%BF%94%E5%9B%9E%E6%9D%83%E9%99%90%E9%85%8D%E7%BD%AE%0A%20%20%20%20%E6%9D%83%E9%99%90%E6%9C%8D%E5%8A%A1--%3E%3E%E7%B3%BB%E7%BB%9F%3A%20%E8%BF%94%E5%9B%9E%E6%9D%83%E9%99%90%E5%88%A4%E5%AE%9A%E7%BB%93%E6%9E%9C%0A%20%20%20%20%E7%B3%BB%E7%BB%9F-%3E%3E%E5%AE%A1%E8%AE%A1%E6%9C%8D%E5%8A%A1%3A%20%E8%AE%B0%E5%BD%95%E6%9D%83%E9%99%90%E6%A3%80%E6%9F%A5%0A%20%20%20%20%E7%B3%BB%E7%BB%9F--%3E%3E%E7%94%A8%E6%88%B7%3A%20%E6%A0%B9%E6%8D%AE%E6%9D%83%E9%99%90%E5%85%81%E8%AE%B8%2F%E6%8B%92%E7%BB%9D%E6%93%8D%E4%BD%9C%0A"})]),fallback:i(()=>s[1]||(s[1]=[n(" Loading... ")])),_:1})),s[4]||(s[4]=p("",12))])}const o=r(A,[["render",g]]);export{m as __pageData,o as default};
