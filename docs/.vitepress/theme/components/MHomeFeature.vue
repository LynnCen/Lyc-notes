<script setup lang="ts">
import { withBase } from 'vitepress'

interface FeatureItem {
  icon: string
  title: string
  desc: string
  link: string
  highlights?: string[]
}

defineProps<{
  features: FeatureItem[]
}>()
</script>

<template>
  <div class="m-home-features">
    <div class="feature-grid">
      <a
        v-for="feature in features"
        :key="feature.title"
        :href="withBase(feature.link)"
        class="feature-card"
      >
        <div class="feature-icon">{{ feature.icon }}</div>
        <div class="feature-content">
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
          <div v-if="feature.highlights" class="feature-highlights">
            <span
              v-for="tag in feature.highlights"
              :key="tag"
              class="highlight-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="feature-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.m-home-features {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    background: var(--vp-c-bg);

    &::before {
      opacity: 1;
    }

    .feature-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .feature-icon {
      transform: scale(1.1);
    }
  }
}

.feature-icon {
  font-size: 2.5rem;
  line-height: 1;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.feature-content {
  flex: 1;
  min-width: 0;
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
  line-height: 1.4;
}

.feature-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0 0 12px;
  line-height: 1.6;
}

.feature-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.highlight-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.feature-arrow {
  color: var(--vp-c-brand-1);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s ease;
  flex-shrink: 0;
  align-self: center;
}

.dark .feature-card {
  &:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
}
</style>
