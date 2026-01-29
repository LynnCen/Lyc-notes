# 第3章：着色器与 GLSL

## 3.1 章节概述

着色器是 WebGL 的灵魂。在前两章中，我们编写了简单的着色器代码，但并没有深入理解它们。本章将带你全面掌握 **GLSL（OpenGL Shading Language）**——WebGL 使用的着色器编程语言。

掌握 GLSL 是成为 WebGL 专家的必经之路。通过着色器，你可以实现：

- 复杂的 3D 变换和动画
- 逼真的光照和材质效果
- 图像处理和后处理特效
- 程序化纹理和图形生成
- GPU 加速的并行计算

本章将深入讲解：

- **着色器程序的完整生命周期**：从源码到可执行程序
- **GLSL 语法详解**：数据类型、操作符、流程控制
- **变量限定符**：attribute、uniform、varying 的深入理解
- **内置变量和函数**：gl_Position、gl_FragColor 等
- **着色器调试和优化技巧**

---

## 3.2 着色器基础概念

### 3.2.1 什么是着色器？

**着色器（Shader）** 是运行在 GPU 上的小程序。与 JavaScript 运行在 CPU 上不同，着色器程序被编译成 GPU 指令，由 GPU 的众多处理核心并行执行。

```
着色器的工作方式

CPU (JavaScript)                    GPU (GLSL 着色器)
┌──────────────────┐               ┌─────────────────────────────┐
│                  │               │                             │
│  准备数据        │  ─────────→  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│  设置 uniform    │               │  │ VS│ │ VS│ │ VS│ │ VS│   │
│  调用 draw       │               │  └───┘ └───┘ └───┘ └───┘   │
│                  │               │    ↓     ↓     ↓     ↓     │
│  等待结果...     │  ←─────────  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│                  │               │  │ FS│ │ FS│ │ FS│ │ FS│   │
└──────────────────┘               │  └───┘ └───┘ └───┘ └───┘   │
                                   │         ...                │
                                   │  (成千上万个并行执行)      │
                                   └─────────────────────────────┘

VS = 顶点着色器（每顶点执行一次）
FS = 片段着色器（每像素执行一次）
```

### 3.2.2 两种着色器的角色

WebGL 需要两种着色器协同工作：

**顶点着色器（Vertex Shader）**：

```
顶点着色器的职责

输入：顶点属性（位置、颜色、纹理坐标等）
输出：裁剪空间位置 (gl_Position) + 传递给片段着色器的数据

┌─────────────────────────────────────────────────┐
│                  顶点着色器                      │
├─────────────────────────────────────────────────┤
│                                                 │
│   主要任务：                                    │
│   1. 坐标变换（模型空间 → 裁剪空间）            │
│   2. 计算需要传递的数据（法线、纹理坐标等）     │
│   3. 逐顶点光照计算（可选）                     │
│                                                 │
│   执行频率：                                    │
│   每个顶点执行一次                              │
│   1000 个顶点 = 执行 1000 次                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**片段着色器（Fragment Shader）**：

```
片段着色器的职责

输入：插值后的数据（从顶点着色器）、纹理、uniform
输出：片段颜色 (gl_FragColor)

┌─────────────────────────────────────────────────┐
│                  片段着色器                      │
├─────────────────────────────────────────────────┤
│                                                 │
│   主要任务：                                    │
│   1. 计算最终颜色                               │
│   2. 纹理采样                                   │
│   3. 光照计算（逐像素）                         │
│   4. 特效处理                                   │
│                                                 │
│   执行频率：                                    │
│   每个片段（像素）执行一次                      │
│   1920×1080 分辨率 = 可能执行 200 万次/帧       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.2.3 着色器程序（Program）

着色器程序是顶点着色器和片段着色器链接后的可执行对象：

```
着色器程序结构

┌─────────────────────────────────────────────────┐
│               着色器程序 (Program)               │
├─────────────────────────────────────────────────┤
│                                                 │
│   ┌──────────────┐     ┌──────────────┐         │
│   │  顶点着色器  │ ←─→ │  片段着色器  │         │
│   │              │     │              │         │
│   │ - attribute  │     │ - varying    │         │
│   │ - uniform    │ ──→ │ - uniform    │         │
│   │ - varying    │     │ - sampler    │         │
│   │              │     │              │         │
│   │ 输出:        │     │ 输出:        │         │
│   │ gl_Position  │     │ gl_FragColor │         │
│   └──────────────┘     └──────────────┘         │
│                                                 │
│   共享的 uniform 变量                           │
│   ┌────────────────────────────────────────┐    │
│   │ u_modelMatrix, u_viewMatrix, ...       │    │
│   └────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 3.3 着色器程序的生命周期

### 3.3.1 完整的创建流程

创建一个可用的着色器程序需要以下步骤：

```
着色器程序创建详细流程

步骤 1: 创建着色器对象
─────────────────────────────────────────────
gl.createShader(gl.VERTEX_SHADER)   → vertexShader
gl.createShader(gl.FRAGMENT_SHADER) → fragmentShader

步骤 2: 设置源代码
─────────────────────────────────────────────
gl.shaderSource(vertexShader, vertexSource)
gl.shaderSource(fragmentShader, fragmentSource)

步骤 3: 编译着色器
─────────────────────────────────────────────
gl.compileShader(vertexShader)
gl.compileShader(fragmentShader)

检查编译状态：
gl.getShaderParameter(shader, gl.COMPILE_STATUS)

获取错误信息：
gl.getShaderInfoLog(shader)

步骤 4: 创建程序对象
─────────────────────────────────────────────
gl.createProgram() → program

步骤 5: 附加着色器
─────────────────────────────────────────────
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)

步骤 6: 链接程序
─────────────────────────────────────────────
gl.linkProgram(program)

检查链接状态：
gl.getProgramParameter(program, gl.LINK_STATUS)

获取错误信息：
gl.getProgramInfoLog(program)

步骤 7: 清理着色器对象（可选但推荐）
─────────────────────────────────────────────
gl.deleteShader(vertexShader)
gl.deleteShader(fragmentShader)

步骤 8: 使用程序
─────────────────────────────────────────────
gl.useProgram(program)
```

### 3.3.2 完整的工具类实现

```javascript
/**
 * 着色器程序管理器
 * 提供完整的着色器创建、编译、链接、调试功能
 */
class ShaderProgram {
    /**
     * @param {WebGLRenderingContext} gl - WebGL 上下文
     */
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.uniformLocations = new Map();
        this.attributeLocations = new Map();
        this.uniformSetters = new Map();
    }
    
    /**
     * 从源代码创建程序
     * @param {string} vertexSource - 顶点着色器源码
     * @param {string} fragmentSource - 片段着色器源码
     * @returns {boolean} 是否成功
     */
    create(vertexSource, fragmentSource) {
        const gl = this.gl;
        
        // 编译两个着色器
        const vertexShader = this._compileShader(gl.VERTEX_SHADER, vertexSource);
        if (!vertexShader) return false;
        
        const fragmentShader = this._compileShader(gl.FRAGMENT_SHADER, fragmentSource);
        if (!fragmentShader) {
            gl.deleteShader(vertexShader);
            return false;
        }
        
        // 创建程序
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        
        // 链接程序
        gl.linkProgram(this.program);
        
        // 检查链接状态
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('程序链接失败:');
            console.error(gl.getProgramInfoLog(this.program));
            this._cleanup(vertexShader, fragmentShader);
            return false;
        }
        
        // 验证程序（可选，用于开发调试）
        gl.validateProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.VALIDATE_STATUS)) {
            console.warn('程序验证警告:', gl.getProgramInfoLog(this.program));
        }
        
        // 删除着色器对象（已链接到程序）
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        
        // 自动获取所有 uniform 和 attribute
        this._introspect();
        
        return true;
    }
    
    /**
     * 编译单个着色器
     * @private
     */
    _compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const typeName = type === gl.VERTEX_SHADER ? '顶点' : '片段';
            console.error(`${typeName}着色器编译失败:`);
            
            // 解析错误信息，提供更友好的输出
            const errorLog = gl.getShaderInfoLog(shader);
            this._formatShaderError(source, errorLog);
            
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    /**
     * 格式化着色器编译错误
     * @private
     */
    _formatShaderError(source, errorLog) {
        console.error(errorLog);
        
        // 解析错误行号
        const errorMatch = errorLog.match(/ERROR:\s*\d+:(\d+)/);
        if (errorMatch) {
            const errorLine = parseInt(errorMatch[1]);
            const lines = source.split('\n');
            
            console.error('\n源代码上下文:');
            console.error('─'.repeat(50));
            
            // 显示错误行前后的代码
            const start = Math.max(0, errorLine - 3);
            const end = Math.min(lines.length, errorLine + 2);
            
            for (let i = start; i < end; i++) {
                const lineNum = (i + 1).toString().padStart(4, ' ');
                const marker = (i + 1) === errorLine ? ' >>>' : '    ';
                console.error(`${marker}${lineNum} | ${lines[i]}`);
            }
            
            console.error('─'.repeat(50));
        }
    }
    
    /**
     * 自动发现所有 uniform 和 attribute
     * @private
     */
    _introspect() {
        const gl = this.gl;
        
        // 获取所有 uniform
        const numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const info = gl.getActiveUniform(this.program, i);
            const location = gl.getUniformLocation(this.program, info.name);
            
            // 处理数组 uniform（名字会带 [0]）
            const name = info.name.replace('[0]', '');
            this.uniformLocations.set(name, location);
            
            // 创建 setter
            this.uniformSetters.set(name, this._createUniformSetter(info, location));
        }
        
        // 获取所有 attribute
        const numAttributes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttributes; i++) {
            const info = gl.getActiveAttrib(this.program, i);
            const location = gl.getAttribLocation(this.program, info.name);
            this.attributeLocations.set(info.name, location);
        }
        
        console.log('Uniforms:', Array.from(this.uniformLocations.keys()));
        console.log('Attributes:', Array.from(this.attributeLocations.keys()));
    }
    
    /**
     * 创建 uniform setter 函数
     * @private
     */
    _createUniformSetter(info, location) {
        const gl = this.gl;
        const type = info.type;
        const size = info.size;
        
        // 根据类型返回对应的 setter
        const setters = {
            [gl.FLOAT]: (v) => gl.uniform1f(location, v),
            [gl.FLOAT_VEC2]: (v) => gl.uniform2fv(location, v),
            [gl.FLOAT_VEC3]: (v) => gl.uniform3fv(location, v),
            [gl.FLOAT_VEC4]: (v) => gl.uniform4fv(location, v),
            [gl.INT]: (v) => gl.uniform1i(location, v),
            [gl.INT_VEC2]: (v) => gl.uniform2iv(location, v),
            [gl.INT_VEC3]: (v) => gl.uniform3iv(location, v),
            [gl.INT_VEC4]: (v) => gl.uniform4iv(location, v),
            [gl.BOOL]: (v) => gl.uniform1i(location, v ? 1 : 0),
            [gl.FLOAT_MAT2]: (v) => gl.uniformMatrix2fv(location, false, v),
            [gl.FLOAT_MAT3]: (v) => gl.uniformMatrix3fv(location, false, v),
            [gl.FLOAT_MAT4]: (v) => gl.uniformMatrix4fv(location, false, v),
            [gl.SAMPLER_2D]: (v) => gl.uniform1i(location, v),
            [gl.SAMPLER_CUBE]: (v) => gl.uniform1i(location, v),
        };
        
        return setters[type] || ((v) => {
            console.warn(`未知的 uniform 类型: ${type}`);
        });
    }
    
    /**
     * 清理资源
     * @private
     */
    _cleanup(vertexShader, fragmentShader) {
        const gl = this.gl;
        if (this.program) {
            gl.deleteProgram(this.program);
            this.program = null;
        }
        if (vertexShader) gl.deleteShader(vertexShader);
        if (fragmentShader) gl.deleteShader(fragmentShader);
    }
    
    /**
     * 使用这个程序
     */
    use() {
        this.gl.useProgram(this.program);
    }
    
    /**
     * 设置 uniform 值
     * @param {string} name - uniform 名称
     * @param {*} value - 值
     */
    setUniform(name, value) {
        const setter = this.uniformSetters.get(name);
        if (setter) {
            setter(value);
        } else {
            console.warn(`未找到 uniform: ${name}`);
        }
    }
    
    /**
     * 批量设置 uniform
     * @param {Object} uniforms - uniform 名称和值的映射
     */
    setUniforms(uniforms) {
        for (const [name, value] of Object.entries(uniforms)) {
            this.setUniform(name, value);
        }
    }
    
    /**
     * 获取 attribute 位置
     * @param {string} name - attribute 名称
     * @returns {number} 位置
     */
    getAttributeLocation(name) {
        return this.attributeLocations.get(name) ?? -1;
    }
    
    /**
     * 获取 uniform 位置
     * @param {string} name - uniform 名称
     * @returns {WebGLUniformLocation} 位置
     */
    getUniformLocation(name) {
        return this.uniformLocations.get(name) ?? null;
    }
    
    /**
     * 释放资源
     */
    dispose() {
        if (this.program) {
            this.gl.deleteProgram(this.program);
            this.program = null;
        }
        this.uniformLocations.clear();
        this.attributeLocations.clear();
        this.uniformSetters.clear();
    }
}
```

### 3.3.3 使用示例

```javascript
// 创建着色器程序
const shader = new ShaderProgram(gl);

const success = shader.create(`
    attribute vec3 a_position;
    attribute vec2 a_texCoord;
    
    uniform mat4 u_mvpMatrix;
    uniform float u_time;
    
    varying vec2 v_texCoord;
    
    void main() {
        vec3 pos = a_position;
        pos.y += sin(u_time + pos.x * 5.0) * 0.1;  // 波动效果
        
        gl_Position = u_mvpMatrix * vec4(pos, 1.0);
        v_texCoord = a_texCoord;
    }
`, `
    precision mediump float;
    
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform vec3 u_tintColor;
    
    void main() {
        vec4 texColor = texture2D(u_texture, v_texCoord);
        gl_FragColor = vec4(texColor.rgb * u_tintColor, texColor.a);
    }
`);

if (!success) {
    console.error('着色器创建失败');
}

// 渲染时
shader.use();
shader.setUniforms({
    u_mvpMatrix: mvpMatrix,
    u_time: performance.now() / 1000,
    u_texture: 0,  // 纹理单元索引
    u_tintColor: [1.0, 0.8, 0.6]
});

gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
```

---

## 3.4 GLSL 语法详解

### 3.4.1 版本和预处理器

```glsl
// WebGL 1.0 使用 GLSL ES 1.0，不需要版本声明
// 以下代码用于 WebGL 1.0

// WebGL 2.0 使用 GLSL ES 3.0，必须声明版本
#version 300 es
precision highp float;

// 预处理器指令
#define PI 3.14159265359
#define TWO_PI (PI * 2.0)

// 条件编译
#ifdef USE_NORMAL_MAP
    varying vec3 v_tangent;
    varying vec3 v_bitangent;
#endif

// 检查扩展
#extension GL_OES_standard_derivatives : enable
```

### 3.4.2 基本数据类型

GLSL 提供了丰富的数据类型：

```glsl
// 标量类型
bool flag = true;           // 布尔值
int count = 42;             // 整数
float value = 3.14;         // 浮点数

// 向量类型 - 最常用的类型
vec2 position2D = vec2(1.0, 2.0);           // 2D 向量
vec3 position3D = vec3(1.0, 2.0, 3.0);      // 3D 向量
vec4 color = vec4(1.0, 0.0, 0.0, 1.0);      // 4D 向量 (常用于颜色 RGBA)

ivec2 pixelCoord = ivec2(100, 200);         // 整数向量
bvec3 results = bvec3(true, false, true);   // 布尔向量

// 矩阵类型
mat2 rotation2D = mat2(1.0);                // 2×2 矩阵
mat3 normalMatrix = mat3(1.0);              // 3×3 矩阵
mat4 modelMatrix = mat4(1.0);               // 4×4 矩阵 (最常用)

// 采样器类型 (只能作为 uniform)
uniform sampler2D u_texture;                // 2D 纹理采样器
uniform samplerCube u_cubemap;              // 立方体纹理采样器
```

### 3.4.3 向量构造和访问

向量是 GLSL 中最重要的数据类型，它有多种构造和访问方式：

```glsl
// ============ 向量构造 ============

// 从标量构造
vec3 v1 = vec3(1.0);              // (1.0, 1.0, 1.0) - 所有分量相同
vec4 v2 = vec4(1.0, 2.0, 3.0, 4.0);

// 从其他向量构造
vec2 xy = vec2(1.0, 2.0);
vec3 v3 = vec3(xy, 3.0);          // (1.0, 2.0, 3.0)
vec4 v4 = vec4(v3, 4.0);          // (1.0, 2.0, 3.0, 4.0)
vec4 v5 = vec4(xy, xy);           // (1.0, 2.0, 1.0, 2.0)

// ============ 分量访问 ============

vec4 color = vec4(1.0, 0.5, 0.2, 1.0);

// 方式 1: 位置访问 (x, y, z, w)
float r = color.x;  // 1.0
float g = color.y;  // 0.5
float b = color.z;  // 0.2
float a = color.w;  // 1.0

// 方式 2: 颜色访问 (r, g, b, a) - 等价于 x, y, z, w
float red = color.r;    // 1.0
float green = color.g;  // 0.5
float blue = color.b;   // 0.2
float alpha = color.a;  // 1.0

// 方式 3: 纹理访问 (s, t, p, q) - 等价于 x, y, z, w
float s = color.s;  // 1.0
float t = color.t;  // 0.5

// ============ Swizzling (分量重排) ============
// 这是 GLSL 最强大的特性之一！

vec4 c = vec4(1.0, 2.0, 3.0, 4.0);

vec3 rgb = c.rgb;           // (1.0, 2.0, 3.0) - 提取前三个分量
vec3 bgr = c.bgr;           // (3.0, 2.0, 1.0) - 反转顺序
vec2 rg = c.rg;             // (1.0, 2.0) - 只取前两个
vec4 rrrr = c.rrrr;         // (1.0, 1.0, 1.0, 1.0) - 重复同一分量
vec3 xxx = c.xxx;           // (1.0, 1.0, 1.0) - 同上

// 可以用于赋值
vec4 v = vec4(0.0);
v.rgb = vec3(1.0, 0.5, 0.2);  // 只修改 rgb，保持 a 不变
v.xz = vec2(1.0, 2.0);        // 只修改 x 和 z

// ============ 数组访问 ============
float components[4];
components[0] = c.x;
components[1] = c.y;
// 或者
float first = c[0];  // 等价于 c.x
```

### 3.4.4 矩阵操作

```glsl
// ============ 矩阵构造 ============

// 单位矩阵（对角线为 1）
mat4 identity = mat4(1.0);

// 从数值构造（列主序！）
mat2 m2 = mat2(
    1.0, 2.0,    // 第一列
    3.0, 4.0     // 第二列
);

// 在内存中的布局：
// m2[0][0] = 1.0, m2[0][1] = 2.0  (第一列)
// m2[1][0] = 3.0, m2[1][1] = 4.0  (第二列)

// 从向量构造
vec4 col0 = vec4(1.0, 0.0, 0.0, 0.0);
vec4 col1 = vec4(0.0, 1.0, 0.0, 0.0);
vec4 col2 = vec4(0.0, 0.0, 1.0, 0.0);
vec4 col3 = vec4(0.0, 0.0, 0.0, 1.0);
mat4 m4 = mat4(col0, col1, col2, col3);

// ============ 矩阵访问 ============

mat4 m = mat4(1.0);

vec4 column0 = m[0];       // 获取第一列
float element = m[1][2];   // 获取第二列第三行的元素
m[0] = vec4(2.0);          // 设置第一列

// ============ 矩阵运算 ============

mat4 a = mat4(1.0);
mat4 b = mat4(2.0);

mat4 product = a * b;      // 矩阵乘法
vec4 v = vec4(1.0, 2.0, 3.0, 1.0);
vec4 transformed = a * v;  // 矩阵-向量乘法

// 注意：GLSL 中矩阵乘法是 后乘（post-multiply）
// transformed = a * v 表示 v 被 a 变换
// 而不是 v * a
```

### 3.4.5 运算符

```glsl
// ============ 算术运算符 ============

float a = 10.0, b = 3.0;
float sum = a + b;        // 13.0
float diff = a - b;       // 7.0
float prod = a * b;       // 30.0
float quot = a / b;       // 3.333...

// 向量运算（逐分量）
vec3 v1 = vec3(1.0, 2.0, 3.0);
vec3 v2 = vec3(2.0, 3.0, 4.0);
vec3 vsum = v1 + v2;      // (3.0, 5.0, 7.0)
vec3 vprod = v1 * v2;     // (2.0, 6.0, 12.0) - 注意是逐分量乘法！
vec3 scaled = v1 * 2.0;   // (2.0, 4.0, 6.0) - 标量乘法

// ============ 比较运算符 ============

bool eq = a == b;         // false
bool ne = a != b;         // true
bool lt = a < b;          // false
bool gt = a > b;          // true
bool le = a <= b;         // false
bool ge = a >= b;         // true

// 向量比较返回布尔向量
bvec3 comparison = lessThan(v1, v2);  // (true, true, true)
bool anyTrue = any(comparison);        // true
bool allTrue = all(comparison);        // true

// ============ 逻辑运算符 ============

bool x = true, y = false;
bool andResult = x && y;   // false
bool orResult = x || y;    // true
bool notResult = !x;       // false

// ============ 位运算符 (WebGL 2.0 / GLSL ES 3.0) ============

int i = 5, j = 3;
int bitAnd = i & j;        // 1
int bitOr = i | j;         // 7
int bitXor = i ^ j;        // 6
int bitNot = ~i;           // -6
int leftShift = i << 1;    // 10
int rightShift = i >> 1;   // 2
```

### 3.4.6 流程控制

```glsl
// ============ 条件语句 ============

if (condition) {
    // ...
} else if (otherCondition) {
    // ...
} else {
    // ...
}

// 三元运算符
float result = condition ? valueA : valueB;

// ============ 循环 ============

// for 循环
for (int i = 0; i < 10; i++) {
    // 循环体
}

// while 循环
while (condition) {
    // 循环体
}

// do-while 循环
do {
    // 循环体
} while (condition);

// break 和 continue
for (int i = 0; i < 100; i++) {
    if (i == 50) break;      // 退出循环
    if (i % 2 == 0) continue; // 跳过本次迭代
    // ...
}

// ============ GLSL ES 1.0 的循环限制 ============
// WebGL 1.0 中，循环有一些限制：

// ❌ 错误：循环次数不能由 uniform 决定
uniform int u_count;
for (int i = 0; i < u_count; i++) {  // 编译可能失败！
    // ...
}

// ✅ 正确：使用固定上限 + 条件退出
const int MAX_ITERATIONS = 100;
for (int i = 0; i < MAX_ITERATIONS; i++) {
    if (i >= u_count) break;
    // ...
}
```

### 3.4.7 函数定义

```glsl
// ============ 函数声明 ============

// 基本函数
float add(float a, float b) {
    return a + b;
}

// 返回向量
vec3 blend(vec3 color1, vec3 color2, float factor) {
    return mix(color1, color2, factor);
}

// 无返回值
void outputColor(vec4 color) {
    gl_FragColor = color;
}

// ============ 参数限定符 ============

// in: 输入参数（默认，只读）
// out: 输出参数（只写）
// inout: 输入输出参数（可读可写）

void swap(inout float a, inout float b) {
    float temp = a;
    a = b;
    b = temp;
}

void decompose(in vec4 color, out vec3 rgb, out float alpha) {
    rgb = color.rgb;
    alpha = color.a;
}

// 使用示例
vec4 myColor = vec4(1.0, 0.5, 0.2, 0.8);
vec3 rgb;
float alpha;
decompose(myColor, rgb, alpha);
// rgb = (1.0, 0.5, 0.2), alpha = 0.8

// ============ 函数重载 ============

float brightness(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

float brightness(vec4 color) {
    return brightness(color.rgb);
}

// ============ 递归限制 ============
// GLSL 不支持递归！
// 以下代码会编译失败：
// float factorial(int n) {
//     if (n <= 1) return 1.0;
//     return float(n) * factorial(n - 1);  // ❌ 错误！
// }
```

---

## 3.5 变量限定符详解

### 3.5.1 attribute（顶点属性）

`attribute` 是顶点着色器的输入，每个顶点有不同的值：

```glsl
// 顶点着色器
attribute vec3 a_position;    // 位置
attribute vec3 a_normal;      // 法线
attribute vec2 a_texCoord;    // 纹理坐标
attribute vec4 a_color;       // 颜色
attribute vec4 a_tangent;     // 切线（用于法线贴图）

void main() {
    // 使用这些属性...
    gl_Position = vec4(a_position, 1.0);
}
```

```javascript
// JavaScript 端设置 attribute

// 1. 获取属性位置
const positionLoc = gl.getAttribLocation(program, 'a_position');
const normalLoc = gl.getAttribLocation(program, 'a_normal');

// 2. 启用属性数组
gl.enableVertexAttribArray(positionLoc);
gl.enableVertexAttribArray(normalLoc);

// 3. 绑定缓冲区并设置指针
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(
    positionLoc,    // 属性位置
    3,              // 分量数量
    gl.FLOAT,       // 数据类型
    false,          // 是否归一化
    stride,         // 步长（字节）
    offset          // 偏移（字节）
);

// 4. 绘制完成后可以禁用（可选）
gl.disableVertexAttribArray(positionLoc);
```

**attribute 数据流**：

```
JavaScript 数据                     顶点着色器

Float32Array [                     顶点 0:
  x0, y0, z0,  ←──────────────→   a_position = (x0, y0, z0)
  nx0, ny0, nz0, ←────────────→   a_normal = (nx0, ny0, nz0)
  u0, v0,      ←──────────────→   a_texCoord = (u0, v0)
  
  x1, y1, z1,  ←──────────────→   顶点 1:
  nx1, ny1, nz1, ←────────────→   a_position = (x1, y1, z1)
  u1, v1,      ←──────────────→   ...
  ...
]
```

### 3.5.2 uniform（统一变量）

`uniform` 是全局常量，所有顶点/片段共享同一个值：

```glsl
// 顶点着色器和片段着色器都可以使用 uniform

// 变换矩阵
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_normalMatrix;

// 时间和动画
uniform float u_time;
uniform float u_deltaTime;

// 光照参数
uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform float u_lightIntensity;

// 材质参数
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;
uniform float u_shininess;

// 纹理采样器
uniform sampler2D u_diffuseMap;
uniform sampler2D u_normalMap;
uniform samplerCube u_environmentMap;

// 其他参数
uniform vec2 u_resolution;    // 画布尺寸
uniform vec2 u_mouse;         // 鼠标位置
```

```javascript
// JavaScript 端设置 uniform

// 获取位置（只需获取一次，可以缓存）
const timeLoc = gl.getUniformLocation(program, 'u_time');
const modelMatrixLoc = gl.getUniformLocation(program, 'u_modelMatrix');
const lightPosLoc = gl.getUniformLocation(program, 'u_lightPosition');
const textureLoc = gl.getUniformLocation(program, 'u_diffuseMap');

// 设置标量
gl.uniform1f(timeLoc, performance.now() / 1000);
gl.uniform1i(textureLoc, 0);  // 纹理单元索引

// 设置向量
gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
gl.uniform3f(lightPosLoc, 10.0, 10.0, 10.0);
gl.uniform3fv(lightPosLoc, [10.0, 10.0, 10.0]);  // 使用数组
gl.uniform4fv(colorLoc, new Float32Array([1, 0, 0, 1]));

// 设置矩阵
gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
// 第二个参数 false 表示矩阵不需要转置
// （GLSL 和 JavaScript 使用相同的列主序）
```

**所有 uniform 设置函数**：

```javascript
// 标量
gl.uniform1f(location, v0);                      // float
gl.uniform1i(location, v0);                      // int, bool, sampler

// 向量
gl.uniform2f(location, v0, v1);                  // vec2
gl.uniform3f(location, v0, v1, v2);              // vec3
gl.uniform4f(location, v0, v1, v2, v3);          // vec4
gl.uniform2fv(location, array);                  // vec2 from array
gl.uniform3fv(location, array);                  // vec3 from array
gl.uniform4fv(location, array);                  // vec4 from array

// 整数向量
gl.uniform2i(location, v0, v1);                  // ivec2
gl.uniform3i(location, v0, v1, v2);              // ivec3
gl.uniform4i(location, v0, v1, v2, v3);          // ivec4

// 矩阵
gl.uniformMatrix2fv(location, transpose, array); // mat2
gl.uniformMatrix3fv(location, transpose, array); // mat3
gl.uniformMatrix4fv(location, transpose, array); // mat4
```

### 3.5.3 varying（插值变量）

`varying` 用于从顶点着色器向片段着色器传递数据，数据会在光栅化阶段被**插值**：

```glsl
// ============ 顶点着色器 ============
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;
attribute vec4 a_color;

uniform mat4 u_mvpMatrix;
uniform mat4 u_modelMatrix;
uniform mat3 u_normalMatrix;

// 声明 varying 变量（输出）
varying vec3 v_worldPosition;
varying vec3 v_normal;
varying vec2 v_texCoord;
varying vec4 v_color;

void main() {
    // 计算世界坐标
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_worldPosition = worldPos.xyz;
    
    // 变换法线
    v_normal = normalize(u_normalMatrix * a_normal);
    
    // 直接传递纹理坐标和颜色
    v_texCoord = a_texCoord;
    v_color = a_color;
    
    // 输出裁剪空间位置
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
}


// ============ 片段着色器 ============
precision mediump float;

// 声明 varying 变量（输入，必须与顶点着色器完全匹配）
varying vec3 v_worldPosition;
varying vec3 v_normal;
varying vec2 v_texCoord;
varying vec4 v_color;

uniform sampler2D u_texture;
uniform vec3 u_lightPosition;

void main() {
    // 现在 v_normal, v_texCoord 等都是插值后的值
    vec3 normal = normalize(v_normal);  // 重新归一化！
    
    // 光照计算
    vec3 lightDir = normalize(u_lightPosition - v_worldPosition);
    float diff = max(dot(normal, lightDir), 0.0);
    
    // 纹理采样
    vec4 texColor = texture2D(u_texture, v_texCoord);
    
    // 最终颜色
    vec3 finalColor = texColor.rgb * v_color.rgb * diff;
    gl_FragColor = vec4(finalColor, texColor.a * v_color.a);
}
```

**varying 的插值过程**：

```
varying 插值示意

三角形三个顶点的颜色：
V0: v_color = 红 (1, 0, 0)
V1: v_color = 绿 (0, 1, 0)
V2: v_color = 蓝 (0, 0, 1)

              V1 (绿)
              ╱╲
             ╱  ╲
            ╱    ╲
           ╱  P   ╲   ← 点 P 的 v_color 是什么？
          ╱        ╲
         ╱          ╲
        V0───────────V2
       (红)         (蓝)

光栅化时，GPU 使用重心坐标插值：

假设 P 的重心坐标是 (0.2, 0.5, 0.3)

P 的 v_color = 0.2 × V0.color + 0.5 × V1.color + 0.3 × V2.color
             = 0.2 × (1,0,0) + 0.5 × (0,1,0) + 0.3 × (0,0,1)
             = (0.2, 0.5, 0.3)

所有 varying 变量都会这样插值！
```

### 3.5.4 WebGL 2.0 中的变化

WebGL 2.0（GLSL ES 3.0）使用新的语法：

```glsl
// ============ WebGL 2.0 顶点着色器 ============
#version 300 es

// attribute 改为 in
in vec3 a_position;
in vec3 a_normal;
in vec2 a_texCoord;

uniform mat4 u_mvpMatrix;

// varying 改为 out
out vec3 v_normal;
out vec2 v_texCoord;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_normal = a_normal;
    v_texCoord = a_texCoord;
}


// ============ WebGL 2.0 片段着色器 ============
#version 300 es
precision highp float;

// varying 改为 in
in vec3 v_normal;
in vec2 v_texCoord;

uniform sampler2D u_texture;

// gl_FragColor 改为自定义输出
out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);  // texture2D 改为 texture
    fragColor = texColor;
}


// ============ 插值限定符（WebGL 2.0 新增）============

// flat: 不插值，使用第一个顶点的值
flat out vec3 v_flatColor;

// smooth: 默认，透视校正插值
smooth out vec3 v_smoothPosition;

// noperspective: 线性插值，不做透视校正
noperspective out vec2 v_screenCoord;
```

---

## 3.6 内置变量

### 3.6.1 顶点着色器内置变量

```glsl
// ============ 输出变量（必须/可选设置）============

// gl_Position: 裁剪空间位置（必须设置！）
// 类型: vec4
// 这是顶点着色器最重要的输出
gl_Position = u_mvpMatrix * vec4(a_position, 1.0);

// gl_PointSize: 点的大小（像素）
// 类型: float
// 只在绘制 gl.POINTS 时有效
gl_PointSize = 10.0;  // 10 像素的点

// 动态点大小
gl_PointSize = u_baseSize / gl_Position.w;  // 根据距离调整大小


// ============ 输入变量（WebGL 2.0）============

// gl_VertexID: 当前顶点的索引
// 类型: int
// 对于 drawArrays: 从 first 开始的索引
// 对于 drawElements: 索引缓冲中的值
int index = gl_VertexID;

// gl_InstanceID: 实例化渲染时的实例索引
// 类型: int
// 对于 drawArraysInstanced 和 drawElementsInstanced
int instance = gl_InstanceID;
```

### 3.6.2 片段着色器内置变量

```glsl
// ============ 输出变量 ============

// gl_FragColor: 片段颜色（WebGL 1.0）
// 类型: vec4
gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // 红色

// WebGL 2.0 使用自定义输出
out vec4 fragColor;
fragColor = vec4(1.0, 0.0, 0.0, 1.0);

// gl_FragData[n]: 多渲染目标输出（需要扩展）
// 类型: vec4
gl_FragData[0] = albedo;
gl_FragData[1] = normal;


// ============ 输入变量 ============

// gl_FragCoord: 片段在窗口中的坐标
// 类型: vec4
// gl_FragCoord.xy: 窗口坐标（像素），原点在左下角
// gl_FragCoord.z: 深度值 [0, 1]
// gl_FragCoord.w: 1/w (透视除法的倒数)

vec2 screenPos = gl_FragCoord.xy;
float depth = gl_FragCoord.z;

// 归一化到 [0, 1]
vec2 uv = gl_FragCoord.xy / u_resolution;

// 应用示例：棋盘格
vec2 cell = floor(gl_FragCoord.xy / 50.0);
float checker = mod(cell.x + cell.y, 2.0);


// gl_FrontFacing: 是否是正面
// 类型: bool
if (gl_FrontFacing) {
    gl_FragColor = frontColor;
} else {
    gl_FragColor = backColor;
}

// 双面材质示例
vec3 normal = gl_FrontFacing ? v_normal : -v_normal;


// gl_PointCoord: 点精灵内的坐标
// 类型: vec2
// 范围: [0, 1]，从左上角到右下角
// 只在渲染 gl.POINTS 时有效

// 圆形点
float dist = distance(gl_PointCoord, vec2(0.5));
if (dist > 0.5) discard;

// 纹理贴图的点
gl_FragColor = texture2D(u_sprite, gl_PointCoord);
```

### 3.6.3 实用示例

```glsl
// 示例 1: 使用 gl_FragCoord 创建屏幕空间效果

precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // 归一化坐标
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    // 将坐标映射到 [-1, 1]
    vec2 st = uv * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;  // 修正宽高比
    
    // 距离中心的距离
    float d = length(st);
    
    // 动画圆环
    float ring = smoothstep(0.3, 0.31, d) - smoothstep(0.4, 0.41, d);
    ring *= 0.5 + 0.5 * sin(u_time * 3.0 + d * 10.0);
    
    gl_FragColor = vec4(vec3(ring), 1.0);
}


// 示例 2: 使用 gl_PointCoord 创建粒子效果

precision mediump float;
uniform sampler2D u_particleTexture;
varying vec4 v_color;

void main() {
    // 圆形裁切
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // 软边缘
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    
    // 或者使用纹理
    vec4 texColor = texture2D(u_particleTexture, gl_PointCoord);
    
    gl_FragColor = v_color * vec4(1.0, 1.0, 1.0, alpha);
}


// 示例 3: 双面渲染

precision mediump float;
varying vec3 v_normal;
varying vec2 v_texCoord;

uniform sampler2D u_frontTexture;
uniform sampler2D u_backTexture;

void main() {
    // 根据正反面选择纹理
    vec4 color;
    if (gl_FrontFacing) {
        color = texture2D(u_frontTexture, v_texCoord);
    } else {
        // 背面可能需要翻转纹理坐标
        vec2 flippedUV = vec2(1.0 - v_texCoord.x, v_texCoord.y);
        color = texture2D(u_backTexture, flippedUV);
    }
    
    gl_FragColor = color;
}
```

---

## 3.7 内置函数

GLSL 提供了丰富的内置函数，让我们按类别详细介绍：

### 3.7.1 数学函数

```glsl
// ============ 角度和三角函数 ============

float rad = radians(180.0);    // 度 → 弧度: π
float deg = degrees(3.14159);  // 弧度 → 度: ≈180

float s = sin(angle);          // 正弦
float c = cos(angle);          // 余弦
float t = tan(angle);          // 正切
float as = asin(x);            // 反正弦 [-π/2, π/2]
float ac = acos(x);            // 反余弦 [0, π]
float at = atan(y, x);         // 反正切 [-π, π]（推荐用这个）
float at2 = atan(x);           // 反正切 [-π/2, π/2]


// ============ 指数函数 ============

float p = pow(x, y);           // x^y
float e = exp(x);              // e^x
float l = log(x);              // ln(x)
float e2 = exp2(x);            // 2^x
float l2 = log2(x);            // log₂(x)
float sq = sqrt(x);            // √x
float isq = inversesqrt(x);    // 1/√x (比 1.0/sqrt(x) 更快)


// ============ 通用函数 ============

float a = abs(x);              // |x|
float s = sign(x);             // x>0 返回1, x<0 返回-1, x=0 返回0
float f = floor(x);            // 向下取整
float c = ceil(x);             // 向上取整
float t = trunc(x);            // 截断小数（WebGL 2.0）
float r = round(x);            // 四舍五入（WebGL 2.0）
float fr = fract(x);           // 小数部分: x - floor(x)
float m = mod(x, y);           // x mod y: x - y * floor(x/y)
float mn = min(x, y);          // 最小值
float mx = max(x, y);          // 最大值
float cl = clamp(x, min, max); // 限制范围


// ============ 插值函数 ============

// mix: 线性插值
float m = mix(a, b, t);        // a*(1-t) + b*t
vec3 color = mix(red, blue, 0.5);  // 混合颜色

// step: 阶跃函数
float s = step(edge, x);       // x < edge ? 0 : 1

// smoothstep: 平滑阶跃
float ss = smoothstep(e0, e1, x);
// 当 x < e0 时返回 0
// 当 x > e1 时返回 1
// 中间是平滑的 S 曲线


// ============ 实用示例 ============

// 创建锯齿波
float sawtooth = fract(u_time);

// 创建三角波
float triangle = abs(fract(u_time) * 2.0 - 1.0);

// 软化边缘
float softEdge = smoothstep(0.4, 0.5, distance(uv, center));

// 量化颜色（减少色阶）
vec3 quantized = floor(color * levels + 0.5) / levels;
```

### 3.7.2 几何函数

```glsl
// ============ 向量运算 ============

float len = length(v);           // 向量长度: √(x²+y²+z²)
float dist = distance(a, b);     // 两点距离: length(a-b)
float d = dot(a, b);             // 点积: a.x*b.x + a.y*b.y + a.z*b.z
vec3 c = cross(a, b);            // 叉积（只对 vec3 有效）
vec3 n = normalize(v);           // 归一化: v / length(v)


// ============ 法线和反射 ============

// faceforward: 确保法线朝向观察者
vec3 ff = faceforward(N, I, Nref);
// 如果 dot(Nref, I) < 0 返回 N，否则返回 -N

// reflect: 计算反射向量
vec3 R = reflect(I, N);
// I: 入射向量（指向表面）
// N: 法线（必须归一化）
// R: 反射向量

// refract: 计算折射向量
vec3 T = refract(I, N, eta);
// I: 入射向量（必须归一化）
// N: 法线（必须归一化）
// eta: 折射率比值（n1/n2）
// 全反射时返回 vec3(0.0)


// ============ 实用示例 ============

// 计算漫反射光照
vec3 lightDir = normalize(lightPos - fragPos);
float diff = max(dot(normal, lightDir), 0.0);

// 计算镜面反射
vec3 viewDir = normalize(cameraPos - fragPos);
vec3 reflectDir = reflect(-lightDir, normal);
float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);

// Fresnel 效果（边缘发光）
float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);

// 计算切线空间法线
vec3 T = normalize(v_tangent);
vec3 B = normalize(v_bitangent);
vec3 N = normalize(v_normal);
mat3 TBN = mat3(T, B, N);
vec3 worldNormal = TBN * textureNormal;
```

### 3.7.3 纹理函数

```glsl
// ============ WebGL 1.0 纹理采样 ============

// 2D 纹理采样
vec4 color = texture2D(sampler, texCoord);

// 立方体纹理采样
vec4 color = textureCube(sampler, direction);

// 带 LOD 的采样（需要扩展或在顶点着色器中）
vec4 color = texture2DLod(sampler, texCoord, lod);

// 投影纹理采样
vec4 color = texture2DProj(sampler, texCoord);
// texCoord 是 vec3 或 vec4，会自动除以 .z 或 .w


// ============ WebGL 2.0 纹理采样 ============

// 统一的采样函数
vec4 color = texture(sampler, texCoord);

// 带 LOD 的采样
vec4 color = textureLod(sampler, texCoord, lod);

// 带偏移的采样（偏移是整数像素）
vec4 color = textureOffset(sampler, texCoord, ivec2(1, 0));

// 获取纹理尺寸
ivec2 size = textureSize(sampler, lod);

// 获取纹理像素（整数坐标，不过滤）
vec4 color = texelFetch(sampler, ivec2(x, y), lod);


// ============ 实用示例 ============

// 简单纹理采样
vec4 albedo = texture2D(u_albedoMap, v_texCoord);

// 法线贴图采样并解码
vec3 normalMap = texture2D(u_normalMap, v_texCoord).rgb;
vec3 normal = normalMap * 2.0 - 1.0;  // [0,1] → [-1,1]

// 多纹理混合
vec4 grass = texture2D(u_grassTexture, v_texCoord);
vec4 rock = texture2D(u_rockTexture, v_texCoord);
float blend = texture2D(u_blendMap, v_texCoord).r;
vec4 terrain = mix(grass, rock, blend);

// 环境反射
vec3 reflectDir = reflect(-viewDir, normal);
vec4 envColor = textureCube(u_environmentMap, reflectDir);

// 屏幕空间纹理
vec2 screenUV = gl_FragCoord.xy / u_resolution;
vec4 screenColor = texture2D(u_screenTexture, screenUV);
```

### 3.7.4 常用工具函数集

以下是一些实用的自定义函数：

```glsl
// ============ 颜色处理 ============

// RGB 转灰度
float grayscale(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

// 调整饱和度
vec3 adjustSaturation(vec3 color, float saturation) {
    float gray = grayscale(color);
    return mix(vec3(gray), color, saturation);
}

// 调整对比度
vec3 adjustContrast(vec3 color, float contrast) {
    return (color - 0.5) * contrast + 0.5;
}

// 伽马校正
vec3 gammaCorrect(vec3 color, float gamma) {
    return pow(color, vec3(1.0 / gamma));
}

// 色调映射（简单版）
vec3 toneMap(vec3 hdr) {
    return hdr / (hdr + vec3(1.0));
}


// ============ 数学工具 ============

// 将值重映射到新范围
float remap(float value, float low1, float high1, float low2, float high2) {
    return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

// 平滑最小值（用于 SDF 混合）
float smoothMin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

// 旋转 2D 向量
vec2 rotate2D(vec2 v, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}


// ============ 噪声函数 ============

// 简单的伪随机
float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D 值噪声
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    // 四角随机值
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    // 平滑插值
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// FBM (分形布朗运动)
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}
```

---

## 3.8 精度限定符

### 3.8.1 精度级别

GLSL 中的浮点数有三种精度级别：

```glsl
// 声明默认精度（片段着色器必须声明）
precision highp float;    // 高精度
precision mediump float;  // 中等精度
precision lowp float;     // 低精度

// 为特定变量指定精度
highp vec4 position;      // 高精度位置
mediump vec2 texCoord;    // 中等精度纹理坐标
lowp vec4 color;          // 低精度颜色
```

**各精度的规格**：

| 精度 | 范围 | 精度（小数位） | 建议使用场景 |
|------|------|---------------|-------------|
| `highp` | ±2^62 | ~16 位 | 位置、矩阵、物理计算 |
| `mediump` | ±2^14 | ~10 位 | 纹理坐标、法线、时间 |
| `lowp` | ±2 | ~8 位 | 颜色、简单计算 |

### 3.8.2 移动端精度问题

```glsl
// 某些移动 GPU 不支持片段着色器中的 highp
// 检测方法：

#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
    // 可能需要调整算法以避免精度问题
#endif
```

**精度相关的常见问题和解决方案**：

```glsl
// 问题 1: 大坐标精度丢失
// 当世界坐标很大时，精度可能不足

// ❌ 可能有问题
varying highp vec3 v_worldPos;  // 如果坐标很大

// ✅ 使用相对坐标
varying mediump vec3 v_localOffset;  // 相对于某个参考点的偏移


// 问题 2: 法线归一化后的精度
// 插值后的法线可能不再归一化

// ❌ 直接使用
vec3 N = v_normal;

// ✅ 重新归一化
vec3 N = normalize(v_normal);


// 问题 3: 深度精度
// 在计算阴影等需要深度比较的地方

// 添加偏移避免 z-fighting
float bias = 0.005;
float shadow = depth < shadowDepth - bias ? 0.0 : 1.0;
```

---

## 3.9 着色器调试技巧

### 3.9.1 可视化调试

由于无法在着色器中使用 `console.log`，我们需要通过颜色输出来调试：

```glsl
// 调试技巧：将数值可视化为颜色

// 调试标量值
float debugValue = someCalculation();
gl_FragColor = vec4(vec3(debugValue), 1.0);  // 灰度显示

// 调试向量（如法线）
vec3 debugNormal = v_normal;
gl_FragColor = vec4(debugNormal * 0.5 + 0.5, 1.0);  // [-1,1] → [0,1]

// 调试 UV 坐标
gl_FragColor = vec4(v_texCoord, 0.0, 1.0);  // R=U, G=V

// 调试深度
float depth = gl_FragCoord.z;
gl_FragColor = vec4(vec3(depth), 1.0);

// 调试 NaN 和 Inf
if (isnan(value) || isinf(value)) {
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);  // 粉色警告
    return;
}

// 热力图可视化
vec3 heatmap(float t) {
    t = clamp(t, 0.0, 1.0);
    return vec3(
        smoothstep(0.5, 0.8, t),                    // R
        smoothstep(0.0, 0.5, t) - smoothstep(0.5, 1.0, t),  // G
        1.0 - smoothstep(0.2, 0.5, t)              // B
    );
}
gl_FragColor = vec4(heatmap(someValue), 1.0);
```

### 3.9.2 常见错误和解决方案

```glsl
// ============ 错误 1: 忘记精度声明 ============
// ❌ 片段着色器没有默认精度
float x = 1.0;  // 编译错误！

// ✅ 添加精度声明
precision mediump float;
float x = 1.0;


// ============ 错误 2: varying 名称不匹配 ============
// 顶点着色器
varying vec3 v_Normal;  // 大写 N

// 片段着色器
varying vec3 v_normal;  // 小写 n
// 链接错误！名称必须完全匹配


// ============ 错误 3: 类型不匹配 ============
// ❌ 整数和浮点数混用
int count = 10;
float result = count / 3;  // 可能警告

// ✅ 显式转换
float result = float(count) / 3.0;


// ============ 错误 4: 使用未初始化的变量 ============
// ❌
vec3 color;
color.r = 1.0;  // g 和 b 未初始化

// ✅
vec3 color = vec3(0.0);
color.r = 1.0;


// ============ 错误 5: 除以零 ============
// ❌ 可能除以零
float result = value / divisor;

// ✅ 安全除法
float result = value / max(divisor, 0.0001);


// ============ 错误 6: normalize 零向量 ============
// ❌ 零向量无法归一化
vec3 dir = vec3(0.0);
dir = normalize(dir);  // NaN!

// ✅ 先检查长度
float len = length(dir);
dir = len > 0.0 ? dir / len : vec3(0.0, 0.0, 1.0);
```

---

## 3.10 本章小结

### 核心概念

| 概念 | 说明 |
|------|------|
| **着色器** | 运行在 GPU 上的程序 |
| **GLSL** | WebGL 使用的着色器语言 |
| **顶点着色器** | 处理每个顶点，输出位置 |
| **片段着色器** | 处理每个像素，输出颜色 |
| **attribute** | 顶点着色器输入（每顶点不同） |
| **uniform** | 全局常量（所有着色器共享） |
| **varying** | 顶点→片段的插值数据 |

### 关键数据类型

| 类型 | 说明 | 常用场景 |
|------|------|---------|
| `float` | 浮点数 | 各种计算 |
| `vec2/3/4` | 浮点向量 | 位置、颜色、纹理坐标 |
| `mat2/3/4` | 矩阵 | 变换 |
| `sampler2D` | 2D 纹理采样器 | 纹理 |

### 常用内置函数

| 类别 | 函数 |
|------|------|
| 数学 | `sin`, `cos`, `pow`, `sqrt`, `abs`, `floor`, `fract` |
| 插值 | `mix`, `step`, `smoothstep`, `clamp` |
| 几何 | `length`, `distance`, `dot`, `cross`, `normalize`, `reflect` |
| 纹理 | `texture2D`, `textureCube` |

---

## 3.11 练习题

### 基础练习

1. 创建一个颜色渐变的着色器（从左到右颜色变化）

2. 实现一个随时间变化的动画效果

3. 使用 `gl_PointCoord` 创建圆形的点

### 进阶练习

4. 实现简单的图像处理效果（灰度、反色、模糊）

5. 创建一个棋盘格图案着色器

6. 实现基本的 Phong 光照模型

### 挑战练习

7. 创建一个程序化的噪声纹理

8. 实现一个着色器编辑器，支持实时预览和错误提示

---

**下一章预告**：在第4章中，我们将学习缓冲区和顶点数据的管理，这是向 GPU 传递数据的核心技术。

---

**文档版本**：v1.0  
**字数统计**：约 18,000 字  
**代码示例**：60+ 个
