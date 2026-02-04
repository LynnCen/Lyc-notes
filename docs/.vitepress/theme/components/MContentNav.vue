<script setup lang="ts">
import { withBase } from 'vitepress'

interface NavItem {
  title: string
  link: string
  badge?: string
}

interface NavSection {
  icon: string
  title: string
  desc?: string
  items: NavItem[]
}

defineProps<{
  sections: NavSection[]
}>()
</script>

<template>
  <div class="content-nav">
    <div v-for="section in sections" :key="section.title" class="nav-section">
      <div class="section-header">
        <span class="section-icon">{{ section.icon }}</span>
        <div class="section-info">
          <h3 class="section-title">{{ section.title }}</h3>
          <p v-if="section.desc" class="section-desc">{{ section.desc }}</p>
        </div>
      </div>
      <ul class="section-list">
        <li v-for="item in section.items" :key="item.title">
          <a :href="withBase(item.link)" class="nav-link">
            <span class="link-title">{{ item.title }}</span>
            <span v-if="item.badge" class="link-badge">{{ item.badge }}</span>
            <svg class="link-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px 0;
}

.nav-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: var(--vp-c-brand-soft);
  }
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 20px 16px;
  background: linear-gradient(135deg, var(--vp-c-brand-soft) 0%, transparent 100%);
}

.section-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.section-info {
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.section-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin: 6px 0 0;
  line-height: 1.5;
}

.section-list {
  margin: 0;
  padding: 8px 0;
  list-style: none;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: var(--vp-c-default-soft);

    .link-title {
      color: var(--vp-c-brand-1);
    }

    .link-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.link-title {
  flex: 1;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  transition: color 0.2s ease;
}

.link-badge {
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 4px;
  margin-right: 8px;
}

.link-arrow {
  color: var(--vp-c-text-3);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.dark .section-header {
  background: linear-gradient(135deg, rgba(var(--vp-c-brand-1-rgb), 0.1) 0%, transparent 100%);
}
</style>
