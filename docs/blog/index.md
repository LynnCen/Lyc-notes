---
layoutClass: m-nav-layout
outline: [2, 3, 4]
---

# 博客文章


<script setup>
import { data } from './data';

</script>

<style src="../../../resources/index.scss"></style>

<MNavLinks v-for="{title, items} in data" :title="title" :items="items"/>
