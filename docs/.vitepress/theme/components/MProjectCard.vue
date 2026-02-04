<script setup lang="ts">
interface Project {
  name: string
  desc: string
  icon: string
  link: string
  github?: string
  tags?: string[]
}

defineProps<{
  projects: Project[]
}>()
</script>

<template>
  <div class="m-project-cards">
    <div class="project-grid">
      <div v-for="project in projects" :key="project.name" class="project-card">
        <div class="project-header">
          <span class="project-icon">{{ project.icon }}</span>
          <h3 class="project-name">{{ project.name }}</h3>
        </div>
        <p class="project-desc">{{ project.desc }}</p>
        <div v-if="project.tags" class="project-tags">
          <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="project-links">
          <a v-if="project.link" :href="project.link" target="_blank" class="link-btn primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Docs
          </a>
          <a v-if="project.github" :href="project.github" target="_blank" class="link-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.m-project-cards {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
}

.project-card {
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--vp-c-brand-soft);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }
}

.project-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.project-icon {
  font-size: 1.75rem;
}

.project-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.project-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0 0 16px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
  border-radius: 4px;
}

.project-links {
  display: flex;
  gap: 10px;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
  border-radius: 6px;
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

.dark .project-card {
  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}
</style>
