<script setup lang="ts">
import { withBase } from 'vitepress'

interface Module {
  icon: string
  title: string
  desc: string
  link: string
  count?: number
}

defineProps<{
  title?: string
  desc?: string
  modules: Module[]
}>()
</script>

<template>
  <div class="module-overview">
    <div v-if="title || desc" class="overview-header">
      <h2 v-if="title" class="overview-title">{{ title }}</h2>
      <p v-if="desc" class="overview-desc">{{ desc }}</p>
    </div>

    <div class="module-grid">
      <a
        v-for="mod in modules"
        :key="mod.title"
        :href="withBase(mod.link)"
        class="module-card"
      >
        <div class="card-icon">{{ mod.icon }}</div>
        <div class="card-body">
          <h3 class="card-title">
            {{ mod.title }}
            <span v-if="mod.count" class="card-count">{{ mod.count }} 篇</span>
          </h3>
          <p class="card-desc">{{ mod.desc }}</p>
        </div>
        <div class="card-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.module-overview {
  padding: 16px 0;
}

.overview-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--vp-c-divider);
}

.overview-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 12px;
}

.overview-desc {
  font-size: 1rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .module-grid {
    grid-template-columns: 1fr;
  }
}

.module-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-bg);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

    .card-icon {
      transform: scale(1.1);
    }

    .card-title {
      color: var(--vp-c-brand-1);
    }

    .card-arrow {
      opacity: 1;
      transform: translateX(0);
      color: var(--vp-c-brand-1);
    }
  }
}

.card-icon {
  font-size: 2.25rem;
  line-height: 1;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 6px;
  transition: color 0.3s ease;
}

.card-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-3);
  background: var(--vp-c-default-soft);
  padding: 2px 8px;
  border-radius: 4px;
}

.card-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-arrow {
  color: var(--vp-c-text-3);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.dark .module-card {
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}
</style>
