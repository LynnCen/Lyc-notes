<script setup lang="ts">
import { withBase } from 'vitepress'

interface ModuleItem {
  icon: string
  title: string
  desc: string
  link: string
  tags?: string[]
}

interface ModuleGroup {
  title: string
  items: ModuleItem[]
}

defineProps<{
  modules: ModuleGroup[]
}>()
</script>

<template>
  <div class="m-module-container">
    <div v-for="group in modules" :key="group.title" class="module-group">
      <h2 class="group-title">
        <span class="title-text">{{ group.title }}</span>
        <span class="title-line"></span>
      </h2>
      <div class="module-grid">
        <a
          v-for="item in group.items"
          :key="item.title"
          :href="withBase(item.link)"
          class="module-card"
        >
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="card-header">
              <span class="card-icon">{{ item.icon }}</span>
              <h3 class="card-title">{{ item.title }}</h3>
            </div>
            <p class="card-desc">{{ item.desc }}</p>
            <div v-if="item.tags && item.tags.length" class="card-tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div class="card-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.m-module-container {
  padding: 24px 0;
}

.module-group {
  margin-bottom: 48px;

  &:last-child {
    margin-bottom: 0;
  }
}

.group-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 0 24px;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--vp-c-text-1);

  .title-text {
    flex-shrink: 0;
  }

  .title-line {
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, var(--vp-c-brand-1), transparent);
    border-radius: 1px;
  }
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

@media (max-width: 640px) {
  .module-grid {
    grid-template-columns: 1fr;
  }
}

.module-card {
  position: relative;
  display: block;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  text-decoration: none;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(var(--vp-c-brand-1-rgb), 0.1) 0%,
      transparent 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2), var(--vp-c-brand-3));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    transform: translateY(-6px);
    border-color: var(--vp-c-brand-1);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 0 0 1px var(--vp-c-brand-soft);
    background: var(--vp-c-bg);

    &::before {
      transform: scaleX(1);
    }

    .card-glow {
      opacity: 1;
    }

    .card-icon {
      transform: scale(1.15) rotate(5deg);
    }

    .card-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .card-title {
      color: var(--vp-c-brand-1);
    }
  }
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.card-icon {
  font-size: 2rem;
  line-height: 1;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  transition: color 0.3s ease;
}

.card-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 6px;
  transition: all 0.2s ease;

  .module-card:hover & {
    background: var(--vp-c-brand-1);
    color: var(--vp-c-white);
  }
}

.card-arrow {
  position: absolute;
  bottom: 0;
  right: 0;
  color: var(--vp-c-brand-1);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s ease;
}

/* Dark mode enhancements */
.dark .module-card {
  &:hover {
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 0 1px var(--vp-c-brand-soft),
      0 0 30px rgba(var(--vp-c-brand-1-rgb), 0.1);
  }
}
</style>
