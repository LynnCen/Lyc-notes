---
layoutClass: m-nav-layout
outline: [2, 3, 4]
---

# 计算机基础


<script setup>
import { data } from './data';

</script>

<style src="../nav/index.scss"></style>

<MNavLinks v-for="{title, items} in data" :title="title" :items="items"/>
