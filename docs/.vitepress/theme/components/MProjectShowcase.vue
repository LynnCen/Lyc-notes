<script setup lang="ts">
interface Project {
  name: string
  icon: string
  desc: string
  features: string[]
  links: {
    docs?: string
    github: string
  }
  tags: string[]
}

defineProps<{
  projects: Project[]
}>()
</script>

<template>
  <div class="project-showcase">
    <div v-for="project in projects" :key="project.name" class="project-item">
      <div class="project-main">
        <div class="project-icon">{{ project.icon }}</div>
        <div class="project-content">
          <div class="project-header">
            <h2 class="project-name">{{ project.name }}</h2>
            <div class="project-tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
          <p class="project-desc">{{ project.desc }}</p>
          <div class="project-features">
            <span v-for="feature in project.features" :key="feature" class="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ feature }}
            </span>
          </div>
        </div>
      </div>
      <div class="project-actions">
        <a v-if="project.links.docs" :href="project.links.docs" target="_blank" class="action-btn primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          在线文档
        </a>
        <a :href="project.links.github" target="_blank" class="action-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project-showcase {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 0;
}

.project-item {
  display: flex;
  flex-direction: column;
  padding: 32px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  }
}

.project-main {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.project-icon {
  font-size: 4rem;
  line-height: 1;
  flex-shrink: 0;
}

.project-content {
  flex: 1;
  min-width: 0;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.project-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 6px;
}

.project-desc {
  font-size: 1rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0 0 20px;
}

.project-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.feature-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);

  svg {
    color: var(--vp-c-brand-1);
    flex-shrink: 0;
  }
}

.project-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-soft);
  }

  &.primary {
    color: var(--vp-c-white);
    background: var(--vp-c-brand-1);

    &:hover {
      background: var(--vp-c-brand-2);
    }
  }
}

@media (max-width: 640px) {
  .project-main {
    flex-direction: column;
    gap: 16px;
  }

  .project-icon {
    font-size: 3rem;
  }

  .project-name {
    font-size: 1.4rem;
  }

  .project-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}

.dark .project-item {
  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
}
</style>
