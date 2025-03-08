# 前端数据预加载实现

## 📋 概述

数据预加载(Data Prefetching)是一种优化技术，通过在页面级别定义 dataLoader 并提前获取数据，减少用户等待时间，提升页面加载性能和用户体验。本方案基于 Vite 构建工具，实现页面级数据预加载。

### 核心思路
- 每个页面目录下定义 dataLoader 方法
- Vite 构建时收集并生成统一的 dataLoader.js
- 页面加载时优先执行对应的 dataLoader
- 页面组件通过 useData hook 获取预加载数据

## 🔧 目录结构
```
src/
├── pages/
│   ├── home/
│   │   ├── index.tsx      # 页面组件
│   │   └── dataLoader.ts  # 数据加载器
│   └── detail/
│       ├── index.tsx
│       └── dataLoader.ts
├── hooks/
│   └── useData.ts         # 数据获取Hook
└── plugins/
    └── vite-dataloader.ts # Vite插件
```

## 💡 具体实现

### 1. 页面数据加载器
```typescript
// pages/home/dataLoader.ts
export default async function dataLoader() {
  return {
    userInfo: await fetch('/api/user').then(res => res.json()),
    recommendations: await fetch('/api/recommendations').then(res => res.json())
  };
}

// pages/detail/dataLoader.ts
export default async function dataLoader(params: { id: string }) {
  return {
    detail: await fetch(`/api/detail/${params.id}`).then(res => res.json()),
    related: await fetch(`/api/related/${params.id}`).then(res => res.json())
  };
}
```

### 2. Vite 插件实现
```typescript
// plugins/vite-dataloader.ts
import type { Plugin } from 'vite';
import glob from 'glob';
import path from 'path';

export default function dataLoaderPlugin(): Plugin {
  const virtualModuleId = 'virtual:data-loader';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-dataloader',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        // 扫描所有页面的 dataLoader
        const pages = glob.sync('src/pages/**/dataLoader.ts');
        
        // 生成加载器映射
        const loaders = pages.map(file => {
          const pagePath = path.dirname(file).replace('src/pages/', '');
          return `'/${pagePath}': () => import('${file}')`;
        });

        // 生成 dataLoader.js 内容
        return `
          // 页面数据加载器映射
          const loaders = {
            ${loaders.join(',\n')}
          };
          
          // 全局数据存储
          window.__PAGE_DATA__ = new Map();
          
          // 执行页面数据加载
          export async function executePageLoader(path, params) {
            const loader = loaders[path];
            if (!loader) return;
            
            try {
              const { default: dataLoader } = await loader();
              const data = await dataLoader(params);
              
              window.__PAGE_DATA__.set(path, {
                data,
                timestamp: Date.now()
              });
              
              return data;
            } catch (error) {
              console.error(\`DataLoader [${path}] failed:\`, error);
            }
          }
        `;
      }
    }
  };
}
```

### 3. useData Hook 实现
```typescript
// hooks/useData.ts
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useData<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 从全局存储获取页面数据
        const pageData = window.__PAGE_DATA__.get(location.pathname);
        
        if (pageData) {
          setData(pageData.data);
          setLoading(false);
          return;
        }

        // 执行页面加载器
        const data = await executePageLoader(location.pathname, location.state);
        setData(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname]);

  return { data, loading, error };
}
```

### 4. 页面组件使用
```typescript
// pages/home/index.tsx
import { useData } from '@/hooks/useData';

interface HomeData {
  userInfo: {
    name: string;
    avatar: string;
  };
  recommendations: Array<{
    id: string;
    title: string;
  }>;
}

const HomePage: React.FC = () => {
  const { data, loading, error } = useData<HomeData>();

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <UserInfo data={data.userInfo} />
      <RecommendList items={data.recommendations} />
    </div>
  );
};
```

### 5. Vite 配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import dataLoaderPlugin from './plugins/vite-dataloader';

export default defineConfig({
  plugins: [dataLoaderPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'data-loader': ['virtual:data-loader']
        }
      }
    }
  }
});
```

## 🌟 技术亮点

### 1. 页面级数据管理
- 数据加载与页面组件解耦
- 支持页面级参数传递
- 自动收集页面加载器

### 2. 构建优化
- 自动扫描并整合页面加载器
- 确保数据加载最先执行
- 支持代码分割和按需加载

### 3. 开发体验
- 约定式目录结构
- 类型安全的数据获取
- 简单直观的 API

## 📈 性能优化

- 页面数据提前加载
- 避免数据重复请求
- 支持数据缓存复用
- 减少页面闪烁

## 🔄 最佳实践

### 使用建议
1. 合理拆分页面数据
2. 避免过度预加载
3. 处理加载异常情况
4. 合理设置缓存策略

### 注意事项
1. 控制数据量大小
2. 处理并发请求
3. 注意内存管理
4. 优化加载时序

## 🚀 后续优化

### 计划改进
- 支持数据预取策略
- 优化缓存淘汰机制
- 添加性能监控分析
- 支持 SSR 场景

