# 现代前端基础架构详解

## 一、CICD自动化流程详解与实践

### 1.1 现代CICD工具链对比
| 工具           | 优势                       | 劣势                     | 适用场景                 |
| -------------- | -------------------------- | ------------------------ | ------------------------ |
| Jenkins        | 灵活性高，插件丰富         | 配置复杂，维护成本高     | 复杂项目，自定义需求高   |
| GitLab CI      | 与代码库紧密集成，配置简单 | 扩展性略低               | GitLab用户，中小团队     |
| GitHub Actions | 社区资源丰富，零运维       | 定制化程度有限           | GitHub用户，快速迭代项目 |
| CircleCI       | 易用性好，云服务           | 成本较高                 | 注重开发效率的团队       |

### 1.2 自动化流程设计

#### 1.2.1 代码管理与质量控制
- **代码托管与版本控制**
  - 分支保护策略：限制直接推送到主分支
  - 权限管理：基于角色的访问控制
  - 自动化代码审查：通过CI触发
- **代码质量检测**
  ```js
  // 单元测试示例 (Jest)
  describe('Button组件', () => {
    it('点击时应触发onClick事件', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>点击</Button>);
      fireEvent.click(screen.getByText('点击'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  ```
  - **SonarQube集成**：代码覆盖率>80%，重复率<3%，技术债务比率<5%

#### 1.2.2 自动化构建与部署
- **多环境部署矩阵**
  | 环境名称 | 触发方式 | 分支来源 | 部署策略 | 回滚机制 |
  | -------- | -------- | -------- | -------- | -------- |
  | 开发环境 | 自动     | develop  | 每次提交 | 自动回滚到上一版本 |
  | 测试环境 | 手动     | develop/release | 手动确认 | 版本切换 |
  | 预发环境 | 手动     | release  | 蓝绿部署 | 流量切换 |
  | 生产环境 | 手动     | master   | 灰度发布 | 紧急回滚机制 |

- **GitHub Actions工作流示例**
  ```yaml
  # .github/workflows/deploy.yml
  name: 构建与部署
  on:
    push:
      branches: [ main, develop ]
    pull_request:
      branches: [ main, develop ]
  
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: 安装Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '16'
            cache: 'pnpm'
        - run: pnpm install
        - run: pnpm run lint
        - run: pnpm run test
    
    build:
      needs: test
      runs-on: ubuntu-latest
      if: github.event_name == 'push'
      steps:
        - uses: actions/checkout@v3
        - name: 安装Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '16'
            cache: 'pnpm'
        - run: pnpm install
        - run: pnpm run build
        - name: 上传构建产物
          uses: actions/upload-artifact@v3
          with:
            name: build-files
            path: dist/
    
    deploy:
      needs: build
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
      steps:
        - name: 下载构建产物
          uses: actions/download-artifact@v3
          with:
            name: build-files
            path: dist/
        - name: 部署到开发环境
          if: github.ref == 'refs/heads/develop'
          uses: some-deploy-action@v1
          with:
            target: 'dev'
        - name: 部署到生产环境
          if: github.ref == 'refs/heads/main'
          uses: some-deploy-action@v1
          with:
            target: 'prod'
  ```

#### 1.2.3 高级部署策略
- **灰度发布实践**
  - 流量分配：初始5%用户，逐步增加至100%
  - 监控指标：错误率、响应时间、业务指标
  - 自动回滚触发条件：错误率>1%，P95响应时间>500ms
- **A/B测试集成**
  - 特性开关：基于用户群体动态开启功能
  - 数据收集：用户行为与转化率分析
  - 决策流程：基于数据驱动的功能迭代

## 二、现代前端技术栈选型策略

### 2.1 框架选型决策矩阵

| 技术栈 | 性能表现 | 开发效率 | 生态完整性 | 学习曲线 | 适用场景 |
| ------ | -------- | -------- | ---------- | -------- | -------- |
| React + Next.js | ★★★★☆ | ★★★★☆ | ★★★★★ | 中等 | 企业级应用，需SEO |
| Vue3 + Nuxt3 | ★★★★☆ | ★★★★★ | ★★★★☆ | 低 | 快速开发，中小型应用 |
| Angular | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | 高 | 大型企业应用，团队规模大 |
| Svelte + SvelteKit | ★★★★★ | ★★★★☆ | ★★★☆☆ | 低 | 性能敏感，包体积受限 |

### 2.2 构建工具选型与优化

- **Vite vs Webpack对比**
  | 特性 | Vite | Webpack |
  | ---- | ---- | ------- |
  | 开发服务器启动时间 | <300ms | >5s (大型项目) |
  | 热更新速度 | <50ms | 300ms-1s |
  | 构建产物优化 | 良好 | 非常好 |
  | 插件生态 | 成长中 | 非常丰富 |
  | 配置复杂度 | 低 | 高 |

- **Vite配置最佳实践**
  ```js
  // vite.config.js
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import legacy from '@vitejs/plugin-legacy';
  import { visualizer } from 'rollup-plugin-visualizer';
  
  export default defineConfig({
    plugins: [
      react(),
      legacy({
        targets: ['defaults', 'not IE 11']
      }),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ],
    build: {
      target: 'es2015',
      minify: 'terser',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['antd', '@ant-design/icons'],
            'utils': ['lodash', 'dayjs', 'axios']
          }
        }
      }
    },
    server: {
      hmr: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  });
  ```

### 2.3 包管理与依赖优化

- **pnpm优势与实践**
  - 硬链接共享：节省40-60%磁盘空间
  - 严格的依赖管理：防止幽灵依赖
  - 安装速度：比npm快2-3倍

- **依赖优化策略**
  ```json
  // package.json
  {
    "scripts": {
      "deps:check": "npx depcheck",
      "deps:update": "pnpm update --interactive",
      "deps:analyze": "npx bundle-analyzer"
    },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    "pnpm": {
      "peerDependencyRules": {
        "ignoreMissing": ["@babel/*"],
        "allowAny": ["eslint"]
      }
    }
  }
  ```

### 2.4 TypeScript配置与最佳实践

- **严格模式配置**
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "strictBindCallApply": true,
      "strictPropertyInitialization": true,
      "noImplicitThis": true,
      "useUnknownInCatchVariables": true,
      "alwaysStrict": true
    }
  }
  ```

- **类型工具库**
  ```typescript
  // types/utility-types.ts
  
  // 只读版本类型
  export type Immutable<T> = {
    readonly [K in keyof T]: Immutable<T[K]>;
  };
  
  // 深度部分类型
  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };
  
  // 非空类型
  export type NonNullable<T> = T extends null | undefined ? never : T;
  
  // API响应类型
  export type ApiResponse<T> = {
    code: number;
    data: T;
    message: string;
  };
  ```

## 三、组件库设计与样式方案最佳实践

### 3.1 组件库选型与集成

- **企业级组件库对比**
  | 组件库 | UI风格 | 组件数量 | 定制性 | 适用场景 |
  | ------ | ------ | -------- | ------ | -------- |
  | Ant Design | 企业级 | 60+ | 高 | 中后台系统 |
  | Material UI | Material Design | 50+ | 中 | 现代Web应用 |
  | Chakra UI | 简约现代 | 40+ | 高 | 快速开发，高度定制 |
  | Element Plus | 轻量简洁 | 50+ | 中 | Vue生态，中小应用 |

- **组件库定制化**
  ```js
  // theme.js - Ant Design主题定制
  export default {
    token: {
      colorPrimary: '#1677ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1677ff',
      borderRadius: 4,
      wireframe: false,
    },
    components: {
      Button: {
        colorPrimary: '#1677ff',
        algorithm: true,
      },
      Input: {
        colorPrimary: '#1677ff',
      },
    },
  };
  ```

### 3.2 样式解决方案全景图

- **CSS方案对比**
  | 方案 | 优势 | 劣势 | 适用场景 |
  | ---- | ---- | ---- | -------- |
  | CSS Modules | 局部作用域，无运行时 | 动态样式支持有限 | 大多数项目 |
  | Styled Components | 组件化，动态样式 | 运行时开销，调试难 | React项目，高度定制UI |
  | Tailwind CSS | 开发效率高，体积小 | 学习曲线，HTML臃肿 | 快速开发，设计系统完善 |
  | UnoCSS | 按需生成，性能高 | 生态较新 | 性能敏感，原子化CSS爱好者 |

- **CSS-in-JS高级实践**
  ```jsx
  // 主题系统与样式组合
  import styled, { ThemeProvider } from 'styled-components';
  
  // 定义主题
  const theme = {
    colors: {
      primary: '#1677ff',
      secondary: '#f5f5f5',
      success: '#52c41a',
      error: '#ff4d4f',
    },
    fontSizes: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.25rem',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    breakpoints: {
      mobile: '576px',
      tablet: '768px',
      desktop: '1024px',
    },
  };
  
  // 创建组件
  const Button = styled.button`
    background-color: ${props => props.variant === 'primary' 
      ? props.theme.colors.primary 
      : 'transparent'};
    color: ${props => props.variant === 'primary' 
      ? 'white' 
      : props.theme.colors.primary};
    border: 1px solid ${props => props.theme.colors.primary};
    padding: ${props => props.size === 'large' 
      ? `${props.theme.spacing.md} ${props.theme.spacing.lg}` 
      : `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
    font-size: ${props => props.theme.fontSizes[props.size || 'medium']};
    border-radius: 4px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.6 : 1};
    transition: all 0.2s ease;
    
    &:hover {
      background-color: ${props => props.variant === 'primary' 
        ? props.theme.colors.primary + 'dd'
        : props.theme.colors.secondary};
    }
    
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
      width: 100%;
    }
  `;
  
  // 应用主题
  function App() {
    return (
      <ThemeProvider theme={theme}>
        <Button variant="primary" size="large">主按钮</Button>
        <Button variant="secondary" size="medium">次按钮</Button>
      </ThemeProvider>
    );
  }
  ```

### 3.3 原子化CSS实践

- **Tailwind配置优化**
  ```js
  // tailwind.config.js
  module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          'brand': {
            50: '#f0f5ff',
            100: '#d6e4ff',
            500: '#1677ff',
            600: '#0958d9',
            900: '#061178',
          },
        },
        spacing: {
          '4.5': '1.125rem',
        },
        fontSize: {
          'xs': ['0.75rem', { lineHeight: '1rem' }],
          'sm': ['0.875rem', { lineHeight: '1.25rem' }],
          'base': ['1rem', { lineHeight: '1.5rem' }],
          'lg': ['1.125rem', { lineHeight: '1.75rem' }],
          'xl': ['1.25rem', { lineHeight: '1.75rem' }],
          '2xl': ['1.5rem', { lineHeight: '2rem' }],
        },
        borderRadius: {
          'sm': '0.125rem',
          DEFAULT: '0.25rem',
          'md': '0.375rem',
          'lg': '0.5rem',
          'xl': '0.75rem',
          '2xl': '1rem',
        },
        boxShadow: {
          'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
      require('@tailwindcss/aspect-ratio'),
    ],
  };
  ```

- **组件封装最佳实践**
  ```jsx
  // 基于Tailwind的组件封装
  function Card({ title, children, bordered = true, hoverable = false }) {
    return (
      <div 
        className={`
          bg-white rounded-lg overflow-hidden
          ${bordered ? 'border border-gray-200' : ''}
          ${hoverable ? 'transition-shadow hover:shadow-lg' : 'shadow-sm'}
          p-6
        `}
      >
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div>{children}</div>
      </div>
    );
  }
  
  // 使用组件
  <Card title="用户信息" hoverable>
    <p className="text-gray-600">这是卡片内容</p>
  </Card>
  ```

## 四、HTTP请求层设计与封装

### 4.1 请求库选型与配置

- **请求库对比**
  | 库 | 优势 | 劣势 | 适用场景 |
  | -- | ---- | ---- | -------- |
  | Axios | 拦截器机制，取消请求，兼容性好 | 体积较大 | 通用RESTful API |
  | Fetch API | 原生支持，体积小 | 错误处理复杂，兼容性问题 | 现代浏览器，简单请求 |
  | SWR | 缓存，重新验证，错误重试 | 依赖React | React应用，需要缓存 |
  | React Query | 缓存，背景更新，开发工具 | 仅限React | 复杂数据管理需求 |

### 4.2 请求层架构设计

- **请求层分层架构**
  ```typescript
  // 1. 基础请求层 - 处理HTTP请求底层逻辑
  // http/axios.ts
  import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
  
  const instance = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 添加token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      // 统一处理响应
      const { code, data, message } = response.data;
      if (code !== 0) {
        return Promise.reject(new Error(message || '请求失败'));
      }
      return data;
    },
    (error: AxiosError) => {
      // 错误处理
      if (error.response) {
        const { status } = error.response;
        switch (status) {
          case 401:
            // 未授权，跳转登录
            window.location.href = '/login';
            break;
          case 403:
            // 权限不足
            console.error('权限不足');
            break;
          case 500:
            // 服务器错误
            console.error('服务器错误');
            break;
        }
      } else if (error.request) {
        // 请求发出但未收到响应
        console.error('网络错误，请检查网络连接');
      }
      return Promise.reject(error);
    }
  );
  
  export default instance;
  
  // 2. 业务API层 - 封装业务接口
  // api/user.ts
  import http from '../http/axios';
  import { User, LoginParams, RegisterParams } from '../types/user';
  
  export const userApi = {
    login: (params: LoginParams) => http.post<User>('/auth/login', params),
    register: (params: RegisterParams) => http.post<User>('/auth/register', params),
    getUserInfo: () => http.get<User>('/user/info'),
    updateUserInfo: (params: Partial<User>) => http.put<User>('/user/info', params),
  };
  
  // 3. 业务Hook层 - 结合React状态管理
  // hooks/useUser.ts
  import { useState, useCallback } from 'react';
  import { userApi } from '../api/user';
  import { User, LoginParams } from '../types/user';
  
  export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const login = useCallback(async (params: LoginParams) => {
      setLoading(true);
      setError(null);
      try {
        const userData = await userApi.login(params);
        setUser(userData);
        return userData;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);
    
    const fetchUserInfo = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await userApi.getUserInfo();
        setUser(userData);
        return userData;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);
    
    return { user, loading, error, login, fetchUserInfo };
  }
  ```

### 4.3 数据缓存与状态同步

- **React Query高级配置**
  ```tsx
  // queryClient.ts
  import { QueryClient, QueryClientProvider } from 'react-query';
  import { ReactQueryDevtools } from 'react-query/devtools';
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5分钟
        cacheTime: 10 * 60 * 1000, // 10分钟
        onError: (err) => {
          console.error('Query error:', err);
        },
      },
      mutations: {
        onError: (err) => {
          console.error('Mutation error:', err);
        },
      },
    },
  });
  
  // App.tsx
  function App() {
    return (
      <QueryClientProvider client={queryClient}>
        {/* 应用组件 */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }
  
  // hooks/useProducts.ts
  import { useQuery, useMutation, useQueryClient } from 'react-query';
  import { productApi } from '../api/product';
  
  export function useProducts() {
    const queryClient = useQueryClient();
    
    // 获取产品列表
    const productsQuery = useQuery(
      ['products'],
      () => productApi.getProducts(),
      {
        keepPreviousData: true,
      }
    );
    
    // 添加产品
    const addProductMutation = useMutation(
      (newProduct) => productApi.addProduct(newProduct),
      {
        onSuccess: () => {
          // 成功后使缓存失效，触发重新获取
          queryClient.invalidateQueries(['products']);
        },
      }
    );
    
    // 更新产品
    const updateProductMutation = useMutation(
      (product) => productApi.updateProduct(product.id, product),
      {
        // 乐观更新
        onMutate: async (updatedProduct) => {
          // 取消任何外部查询
          await queryClient.cancelQueries(['products']);
          
          // 保存之前的数据
          const previousProducts = queryClient.getQueryData(['products']);
          
          // 乐观更新缓存
          queryClient.setQueryData(['products'], (old) => {
            return old.map((product) => 
              product.id === updatedProduct.id ? updatedProduct : product
            );
          });
          
          // 返回上下文对象
          return { previousProducts };
        },
        onError: (err, variables, context) => {
          // 发生错误时回滚
          queryClient.setQueryData(['products'], context.previousProducts);
        },
        onSettled: () => {
          // 完成后重新获取
          queryClient.invalidateQueries(['products']);
        },
      }
    );
    
    return {
      products: productsQuery.data || [],
      isLoading: productsQuery.isLoading,
      error: productsQuery.error,
      addProduct: addProductMutation.mutate,
      updateProduct: updateProductMutation.mutate,
    };
  }
  ```

## 五、Git工作流与团队协作规范

### 5.1 Git分支模型与工作流

- **Git Flow分支策略**
  | 分支类型 | 命名规范 | 用途 | 合并目标 | 生命周期 |
  | -------- | -------- | ---- | -------- | -------- |
  | master/main | master/main | 生产环境代码 | - | 永久 |
  | develop | develop | 开发环境代码 | master | 永久 |
  | feature | feature/功能名 | 新功能开发 | develop | 临时 |
  | release | release/版本号 | 版本发布准备 | master和develop | 临时 |
  | hotfix | hotfix/问题描述 | 生产环境紧急修复 | master和develop | 临时 |

- **Trunk-Based开发模型**
  ```mermaid
  graph TD
    A[主干分支 main] --> B[短期特性分支 feature/x]
    A --> C[短期特性分支 feature/y]
    B --> A
    C --> A
    A --> D[发布分支 release/1.0]
    D --> E[紧急修复 hotfix/z]
    E --> D
  ```

### 5.2 提交规范与自动化工具

- **Conventional Commits规范**
  ```
  <类型>[可选作用域]: <描述>
  
  [可选正文]
  
  [可选脚注]
  ```

  | 类型 | 说明 |
  | ---- | ---- |
  | feat | 新功能 |
  | fix | 修复bug |
  | docs | 文档更新 |
  | style | 代码格式调整 |
  | refactor | 重构代码 |
  | perf | 性能优化 |
  | test | 测试相关 |
  | build | 构建系统或外部依赖 |
  | ci | CI配置文件和脚本 |
  | chore | 其他修改 |

- **Commitlint与Husky配置**
  ```js
  // commitlint.config.js
  module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'body-max-line-length': [2, 'always', 100],
      'subject-case': [2, 'never', ['upper-case']],
      'scope-enum': [2, 'always', ['core', 'ui', 'api', 'utils', 'docs', 'config']],
      'type-enum': [
        2,
        'always',
        ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
      ]
    }
  };
  ```

  ```js
  // .husky/pre-commit
  #!/bin/sh
  . "$(dirname "$0")/_/husky.sh"

  npx lint-staged
  ```

  ```json
  // package.json
  {
    "scripts": {
      "prepare": "husky install",
      "commit": "git-cz"
    },
    "lint-staged": {
      "*.{js,jsx,ts,tsx}": [
        "eslint --fix",
        "prettier --write"
      ],
      "*.{css,scss,less}": [
        "stylelint --fix",
        "prettier --write"
      ]
    },
    "config": {
      "commitizen": {
        "path": "@commitlint/cz-commitlint"
      }
    }
  }
  ```

### 5.3 Code Review最佳实践

- **Review流程与标准**
  | 阶段 | 关注点 | 检查项 |
  | ---- | ------ | ------ |
  | 自我检查 | 代码质量 | 功能完整性、测试覆盖、代码风格 |
  | 提交PR | 描述清晰 | 问题背景、解决方案、测试方法 |
  | 团队Review | 技术实现 | 架构设计、性能影响、安全隐患 |
  | 修改与讨论 | 反馈处理 | 及时响应、合理解释、积极改进 |
  | 合并代码 | 最终确认 | CI通过、冲突解决、文档更新 |

- **PR模板示例**
  ```markdown
  ## 需求背景
  
  <!-- 描述这个PR解决的问题或实现的功能 -->
  
  ## 实现方案
  
  <!-- 简要描述技术实现方案和考虑 -->
  
  ## 测试方法
  
  <!-- 如何验证这个功能是否正常工作 -->
  
  ## 自测清单
  
  - [ ] 单元测试已通过
  - [ ] 功能测试已完成
  - [ ] 文档已更新
  - [ ] 性能影响已评估
  
  ## 截图或演示
  
  <!-- 如适用，添加截图或演示链接 -->
  ```

## 六、前端性能优化策略

### 6.1 性能指标与监控

- **核心Web指标**
  | 指标 | 描述 | 良好标准 | 测量工具 |
  | ---- | ---- | -------- | -------- |
  | LCP (最大内容绘制) | 页面主要内容加载完成的时间 | ≤ 2.5秒 | Lighthouse, Web Vitals |
  | FID (首次输入延迟) | 用户首次交互到响应的时间 | ≤ 100毫秒 | Chrome UX Report |
  | CLS (累积布局偏移) | 页面视觉稳定性的度量 | ≤ 0.1 | PageSpeed Insights |
  | TTFB (首字节时间) | 从请求到收到第一个字节的时间 | ≤ 800毫秒 | Navigation Timing API |
  | TTI (可交互时间) | 页面完全可交互的时间 | ≤ 3.8秒 | Lighthouse |

- **性能监控实现**
  ```javascript
  // 使用Web Vitals库监控核心指标
  import {getLCP, getFID, getCLS, getTTFB, getFCP} from 'web-vitals';
  
  function sendToAnalytics({name, delta, id}) {
    const body = JSON.stringify({name, delta, id});
    // 使用Beacon API发送数据，不阻塞页面卸载
    navigator.sendBeacon('/analytics', body);
  }
  
  // 监控所有核心指标
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  getFCP(sendToAnalytics);
  ```

### 6.2 加载性能优化

- **资源加载优化**
  | 技术 | 实现方式 | 收益 |
  | ---- | -------- | ---- |
  | 代码分割 | 路由级别懒加载、组件动态导入 | 初始加载减少50-70% |
  | 资源预加载 | `<link rel="preload">`、`<link rel="prefetch">` | 关键资源提前加载 |
  | 图片优化 | WebP/AVIF格式、响应式图片、懒加载 | 减少50-80%图片流量 |
  | 字体优化 | 字体子集化、font-display策略 | 减少FOIT/FOUT问题 |

- **代码分割实现**
  ```jsx
  // React中的代码分割
  import React, { Suspense, lazy } from 'react';
  
  // 懒加载组件
  const Dashboard = lazy(() => import('./Dashboard'));
  const Settings = lazy(() => import('./Settings'));
  
  function App() {
    return (
      <Suspense fallback={<div>加载中...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    );
  }
  ```

### 6.3 运行时性能优化

- **React性能优化技巧**
  ```jsx
  // 使用React.memo避免不必要的重渲染
  const UserCard = React.memo(function UserCard({ user }) {
    return (
      <div className="card">
        <img src={user.avatar} alt={user.name} />
        <h3>{user.name}</h3>
      </div>
    );
  });
  
  // 使用useCallback缓存函数引用
  function ParentComponent() {
    const [count, setCount] = useState(0);
    
    const handleClick = useCallback(() => {
      console.log('按钮被点击');
    }, []); // 依赖为空数组，函数引用永远不变
    
    return <ChildComponent onClick={handleClick} />;
  }
  
  // 使用useMemo缓存计算结果
  function ExpensiveComponent({ data }) {
    const processedData = useMemo(() => {
      return data.filter(item => item.active)
                .sort((a, b) => a.price - b.price);
    }, [data]); // 只有data变化时才重新计算
    
    return (
      <ul>
        {processedData.map(item => (
          <li key={item.id}>{item.name}: ¥{item.price}</li>
        ))}
      </ul>
    );
  }
  ```

### 6.4 构建优化与部署策略

- **构建优化措施**
  | 优化方向 | 具体措施 | 预期效果 |
  | -------- | -------- | -------- |
  | 代码压缩 | Terser配置优化、CSS压缩 | 减少30-40%体积 |
  | Tree Shaking | ESM模块、sideEffects标记 | 减少20-50%无用代码 |
  | 依赖优化 | 分析并移除未使用依赖 | 减少10-30%包体积 |
  | 并行构建 | 多线程/多进程构建 | 构建速度提升40-60% |

- **Webpack优化配置**
  ```js
  // webpack.prod.js
  const TerserPlugin = require('terser-webpack-plugin');
  const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  
  module.exports = {
    mode: 'production',
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // 移除console
              pure_funcs: ['console.log'] // 移除特定函数调用
            },
            mangle: true
          },
          parallel: true // 并行压缩
        }),
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // 获取包名，实现更细粒度的分包
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            priority: 10
          },
          commons: {
            minChunks: 2, // 至少被两个chunk引用
            priority: 5,
            reuseExistingChunk: true
          }
        }
      }
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false
      })
    ]
  };
  ```

