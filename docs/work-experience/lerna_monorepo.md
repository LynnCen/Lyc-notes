# 基于 pnpm+lerna+TypeScript+React 搭建 Monorepo 最佳实践

> 本文介绍如何使用 pnpm、lerna、TypeScript 和 React 搭建一个现代化的 Monorepo 项目，包含 API、UI、Hooks 和 Icon 四个独立包。

## 1. Monorepo 概述

### 1.1 什么是 Monorepo？

Monorepo（单一代码库）是一种项目架构模式，它将多个相关的项目代码存储在同一个代码仓库中。与传统的 Multirepo（多仓库）模式相比，Monorepo 具有以下优势：

- **代码共享**: 更容易共享和重用代码
- **原子提交**: 可以在一次提交中更新多个包
- **统一工作流**: 统一的构建、测试和发布流程
- **依赖管理**: 简化依赖管理，避免版本冲突
- **跨项目变更**: 可以轻松实现跨项目的变更

### 1.2 背景

> 在开发大型项目时，我们通常会遇到同一工程依赖不同组件包，同时不同的组件包之间还会相互依赖的问题，那么如何管理组织这些依赖包就是一个迫在眉睫的问题。

Monorepo 模式下，我们将所有组件包放在同一个仓库中，并通过工具来管理组件包的版本，避免组件包之间的依赖冲突。同时，为了让团队其他成员更好地理解和使用我们开发的组件，搭建组件文档和 demo 就显得格外重要。

## 2. 技术栈选择

### 2.1 核心技术

- **pnpm**: 高效的包管理器，节省磁盘空间并提高安装速度
- **Lerna**: 管理多包 JavaScript 项目的工具
- **TypeScript**: 提供类型安全和更好的开发体验
- **React**: UI 组件库的基础框架
- **Vite**: 现代化的构建工具，提供快速的开发体验
- **Vitest**: 基于 Vite 的测试框架
- **ESLint**: 代码质量检查工具
- **Prettier**: 代码格式化工具
- **Husky + lint-staged**: Git 钩子工具，确保提交前代码质量

### 2.2 为什么选择 pnpm + Lerna？

- **pnpm**: 
  - 节省磁盘空间（通过硬链接共享依赖）
  - 创建确定性的依赖树
  - 防止幽灵依赖
  - 比 npm/yarn 更快的安装速度

- **Lerna**: 
  - 管理多包版本
  - 处理包之间的依赖关系
  - 提供统一的发布流程
  - 简化跨包操作

## 3. 项目结构

```
monorepo-project/
├── .husky/                 # Git 钩子配置
├── .github/                # GitHub 工作流配置
├── packages/               # 所有包的目录
│   ├── api/                # API 包
│   │   ├── src/            # 源代码
│   │   ├── tests/          # 测试文件
│   │   ├── package.json    # 包配置
│   │   ├── tsconfig.json   # TypeScript 配置
│   │   └── vite.config.ts  # Vite 配置
│   ├── ui/                 # UI 组件包
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   ├── hooks/              # React Hooks 包
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── icon/               # 图标包
│       ├── src/
│       ├── tests/
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── docs/                   # 文档网站
├── .eslintrc.js            # ESLint 配置
├── .prettierrc             # Prettier 配置
├── lerna.json              # Lerna 配置
├── package.json            # 根项目配置
├── pnpm-workspace.yaml     # pnpm 工作区配置
├── tsconfig.base.json      # 基础 TypeScript 配置
└── vitest.config.ts        # Vitest 配置
```

## 4. 项目搭建步骤

### 4.1 初始化项目

```bash
# 创建项目目录
mkdir monorepo-project && cd monorepo-project

# 初始化 package.json
pnpm init

# 安装 Lerna
pnpm add -D lerna

# 初始化 Lerna
npx lerna init

# 创建 pnpm 工作区配置
echo "packages:
  - 'packages/*'
  - 'docs'" > pnpm-workspace.yaml
```

### 4.2 配置 package.json

```json
{
  "name": "monorepo-project",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "docs"
  ],
  "scripts": {
    "dev": "lerna run dev --parallel",
    "build": "lerna run build",
    "test": "lerna run test",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "prepare": "husky install",
    "publish": "lerna publish"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "eslint": "^8.38.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^8.0.3",
    "lerna": "^6.6.1",
    "lint-staged": "^13.2.1",
    "prettier": "^2.8.7",
    "typescript": "^5.0.4",
    "vite": "^4.3.1",
    "vitest": "^0.30.1"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx,json,md}": [
      "prettier --write"
    ]
  }
}
```

### 4.3 配置 lerna.json

```json
{
  "version": "independent",
  "npmClient": "pnpm",
  "useWorkspaces": true,
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish",
      "registry": "https://registry.npmjs.org",
      "ignoreChanges": ["**/*.md", "**/*.test.ts", "**/*.test.tsx"]
    },
    "version": {
      "conventionalCommits": true,
      "message": "chore(release): version"
    }
  }
}
```

### 4.4 配置 TypeScript

创建 `tsconfig.base.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  }
}
```

### 4.5 配置 ESLint 和 Prettier

创建 `.eslintrc.js`：

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
};
```

创建 `.prettierrc`：

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### 4.6 配置 Husky 和 lint-staged

```bash
# 安装 husky
pnpm dlx husky-init && pnpm install

# 添加 pre-commit 钩子
npx husky add .husky/pre-commit "npx lint-staged"
```

### 4.7 创建包目录结构

```bash
# 创建包目录
mkdir -p packages/{api,ui,hooks,icon}/src
mkdir -p packages/{api,ui,hooks,icon}/tests
```

## 5. 包配置详解

### 5.1 API 包

`packages/api/package.json`:

```json
{
  "name": "@monorepo/api",
  "version": "0.1.0",
  "description": "API utilities for the monorepo project",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "axios": "^1.3.6"
  },
  "devDependencies": {
    "@types/node": "^18.15.13",
    "typescript": "^5.0.4",
    "vite": "^4.3.1",
    "vite-plugin-dts": "^2.3.0",
    "vitest": "^0.30.1"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

`packages/api/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['axios']
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src']
    })
  ],
  test: {
    globals: true,
    environment: 'node'
  }
});
```

`packages/api/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 5.2 UI 包

`packages/ui/package.json`:

```json
{
  "name": "@monorepo/ui",
  "version": "0.1.0",
  "description": "UI components for the monorepo project",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@monorepo/hooks": "workspace:*",
    "@monorepo/icon": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.0.38",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.4",
    "vite": "^4.3.1",
    "vite-plugin-dts": "^2.3.0",
    "vitest": "^0.30.1"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

`packages/ui/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@monorepo/hooks', '@monorepo/icon'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
```

### 5.3 Hooks 包

`packages/hooks/package.json`:

```json
{
  "name": "@monorepo/hooks",
  "version": "0.1.0",
  "description": "React hooks for the monorepo project",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@monorepo/api": "workspace:*",
    "react": "^18.2.0"
  },
  "devDependencies": {
    "@testing-library/react-hooks": "^8.0.1",
    "@types/react": "^18.0.38",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.4",
    "vite": "^4.3.1",
    "vite-plugin-dts": "^2.3.0",
    "vitest": "^0.30.1"
  },
  "peerDependencies": {
    "react": ">=17.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### 5.4 Icon 包

`packages/icon/package.json`:

```json
{
  "name": "@monorepo/icon",
  "version": "0.1.0",
  "description": "Icon components for the monorepo project",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.0.38",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.4",
    "vite": "^4.3.1",
    "vite-plugin-dts": "^2.3.0",
    "vitest": "^0.30.1"
  },
  "peerDependencies": {
    "react": ">=17.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

## 6. 包实现示例

### 6.1 API 包

`packages/api/src/index.ts`:

```typescript
export * from './request';
export * from './types';
```

`packages/api/src/request.ts`:

```typescript
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from './types';

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await instance(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.message,
        data: null as unknown as T
      };
    }
    return {
      success: false,
      message: 'Unknown error',
      data: null as unknown as T
    };
  }
}

export function get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  return request<T>({ method: 'GET', url, params });
}

export function post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
  return request<T>({ method: 'POST', url, data });
}

export function put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
  return request<T>({ method: 'PUT', url, data });
}

export function del<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>({ method: 'DELETE', url });
}
```

`packages/api/src/types.ts`:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

### 6.2 Hooks 包

`packages/hooks/src/index.ts`:

```typescript
export * from './useRequest';
export * from './useLocalStorage';
```

`packages/hooks/src/useRequest.ts`:

```typescript
import { useState, useEffect } from 'react';
import { get, ApiResponse } from '@monorepo/api';

interface UseRequestOptions {
  manual?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseRequestResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  run: (params?: Record<string, any>) => Promise<void>;
}

export function useRequest<T>(
  url: string,
  options: UseRequestOptions = {}
): UseRequestResult<T> {
  const { manual = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState<string | null>(null);

  const run = async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<T> = await get<T>(url, params);
      
      if (response.success) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        setError(response.message);
        onError?.(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!manual) {
      run();
    }
  }, [manual, url]);

  return { data, loading, error, run };
}
```

`packages/hooks/src/useLocalStorage.ts`:

```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
```

### 6.3 Icon 包

`packages/icon/src/index.ts`:

```typescript
export * from './icons/IconHome';
export * from './icons/IconUser';
export * from './icons/IconSettings';
export * from './types';
```

`packages/icon/src/types.ts`:

```typescript
import { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}
```

`packages/icon/src/icons/IconHome.tsx`:

```typescript
import React from 'react';
import { IconProps } from '../types';

export const IconHome: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  ...props 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
};
```

### 6.4 UI 包

`packages/ui/src/index.ts`:

```typescript
export * from './components/Button';
export * from './components/Card';
export * from './components/Input';
```

`packages/ui/src/components/Button.tsx`:

```typescript
import React from 'react';
import { useRipple } from '@monorepo/hooks';
import { IconHome } from '@monorepo/icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  useRipple(buttonRef);

  const baseStyles = 'inline-flex items-center justify-center rounded font-medium transition-colors';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100'
  };
  
  const sizeStyles = {
    small: 'text-sm px-3 py-1',
    medium: 'text-base px-4 py-2',
    large: 'text-lg px-6 py-3'
  };
  
  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;

  return (
    <button
      ref={buttonRef}
      className={buttonStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="mr-2 animate-spin">⟳</span>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
```

## 7. 测试实现

### 7.1 API 测试

`packages/api/tests/request.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { get, post } from '../src/request';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API request functions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should make a successful GET request', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Success',
        data: { id: 1, name: 'Test' }
      }
    };

    mockedAxios.create.mockReturnValue({
      request: vi.fn().mockResolvedValue(mockResponse),
      get: vi.fn().mockResolvedValue(mockResponse),
      post: vi.fn().mockResolvedValue(mockResponse),
      put: vi.fn().mockResolvedValue(mockResponse),
      delete: vi.fn().mockResolvedValue(mockResponse),
      patch: vi.fn().mockResolvedValue(mockResponse),
      head: vi.fn().mockResolvedValue(mockResponse),
      options: vi.fn().mockResolvedValue(mockResponse),
    } as any);

    const result = await get('/test');
    
    expect(result).toEqual({
      success: true,
      message: 'Success',
      data: { id: 1, name: 'Test' }
    });
  });

  it('should handle errors in POST request', async () => {
    const mockError = {
      isAxiosError: true,
      message: 'Network Error'
    };

    mockedAxios.create.mockReturnValue({
      request: vi.fn().mockRejectedValue(mockError),
      get: vi.fn().mockRejectedValue(mockError),
      post: vi.fn().mockRejectedValue(mockError),
      put: vi.fn().mockRejectedValue(mockError),
      delete: vi.fn().mockRejectedValue(mockError),
      patch: vi.fn().mockRejectedValue(mockError),
      head: vi.fn().mockRejectedValue(mockError),
      options: vi.fn().mockRejectedValue(mockError),
    } as any);

    mockedAxios.isAxiosError.mockReturnValue(true);

    const result = await post('/test', { data: 'test' });
    
    expect(result).toEqual({
      success: false,
      message: 'Network Error',
      data: null
    });
  });
});
```

### 7.2 Hooks 测试

`packages/hooks/tests/useRequest.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRequest } from '../src/useRequest';
import * as api from '@monorepo/api';

vi.mock('@monorepo/api',
```

## 8. 发布流程

### 8.1 版本管理

Lerna 提供了强大的版本管理功能，可以自动处理包之间的依赖关系和版本更新：

```bash
# 交互式选择版本升级
lerna version

# 发布包
lerna publish
```

版本发布流程：
1. 确保所有修改已提交
2. 运行测试确保质量
3. 使用 lerna version 更新版本
4. 使用 lerna publish 发布到 npm

### 8.2 Changelog 生成

使用 conventional-changelog 自动生成变更日志：

```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s"
  }
}
```

## 9. CI/CD 配置

### 9.1 GitHub Actions 配置

创建 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 7
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test
        
      - name: Build packages
        run: pnpm build
```

### 9.2 自动发布配置

创建 `.github/workflows/release.yml`：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 7
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Publish to NPM
        run: pnpm lerna publish from-git --yes
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

## 10. 文档网站

### 10.1 VitePress 配置

使用 VitePress 构建文档网站：

```bash
# 安装 VitePress
pnpm add -D vitepress

# 创建文档目录
mkdir docs && cd docs
```

创建 `docs/.vitepress/config.ts`：

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Monorepo Components',
  description: 'A modern component library built with monorepo',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' }
          ]
        }
      ],
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button', link: '/components/button' },
            { text: 'Input', link: '/components/input' }
          ]
        }
      ]
    }
  }
})
```

### 10.2 组件文档示例

创建 `docs/components/button.md`：

```markdown
# Button 按钮

基础按钮组件，支持多种样式和状态。

## 基础用法

```vue
<template>
  <Button>默认按钮</Button>
  <Button type="primary">主要按钮</Button>
  <Button type="success">成功按钮</Button>
</template>
```

## API

| 参数    | 说明     | 类型    | 默认值  |
|---------|----------|---------|---------|
| type    | 按钮类型 | string  | default |
| size    | 按钮大小 | string  | medium  |
| loading | 加载状态 | boolean | false   |


## 11. 性能优化

### 11.1 构建优化

- 使用 esbuild 加速 TypeScript 构建
- 配置构建缓存提升速度
- 优化包体积，移除未使用代码

### 11.2 开发体验优化

- 配置模块热替换
- 优化 TypeScript 类型检查
- 使用 turbopack 提升构建速度

## 12. 最佳实践

### 12.1 开发规范

- 遵循统一的代码风格
- 编写完整的测试用例
- 及时更新文档
- 规范的 Git 提交信息

### 12.2 包管理建议

- 合理拆分包的粒度
- 明确包的职责和边界
- 避免循环依赖
- 及时处理依赖更新

### 12.3 版本发布流程

1. 完成功能开发和测试
2. 更新版本号和 changelog
3. 提交代码并打标签
4. 触发自动发布流程
5. 验证发布结果

## 13. 常见问题

### 13.1 依赖管理

Q: 如何处理包之间的依赖关系？
A: 使用 workspace 协议，例如 `"@monorepo/ui": "workspace:*"`

Q: 如何避免依赖冲突？
A: 统一依赖版本，使用 pnpm 的依赖提升功能

### 13.2 构建问题

Q: 如何确保包按正确顺序构建？
A: 使用 Lerna 的 topological 排序功能

Q: 如何优化构建速度？
A: 使用并行构建，配置构建缓存

## 14. 未来规划

- 支持更多构建工具选项
- 添加更多实用组件
- 优化开发体验
- 完善文档系统
- 添加更多自动化工具