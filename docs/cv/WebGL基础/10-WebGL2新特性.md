# 第10章：WebGL 2.0 新特性

## 10.1 章节概述

WebGL 2.0 基于 OpenGL ES 3.0，带来了许多新特性，大幅提升了 Web 图形编程的能力。

本章将深入讲解：

- **GLSL ES 3.0**：新语法和特性
- **实例化渲染**：高效绘制大量相似物体
- **变换反馈**：GPU 计算
- **多重渲染目标**：G-Buffer、延迟渲染
- **新纹理格式**：3D 纹理、浮点纹理
- **VAO 内置支持**：简化状态管理

---

## 10.2 获取 WebGL 2.0 上下文

```javascript
// 获取 WebGL 2.0 上下文
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
    console.error('WebGL 2.0 不支持');
    // 回退到 WebGL 1.0
    gl = canvas.getContext('webgl');
}

// 检查 WebGL 版本
const isWebGL2 = gl instanceof WebGL2RenderingContext;
console.log('WebGL 版本:', isWebGL2 ? '2.0' : '1.0');
```

---

## 10.3 GLSL ES 3.0 新特性

### 10.3.1 版本声明

```glsl
// WebGL 2.0 着色器必须以版本声明开始
#version 300 es

precision highp float;

// 注意变化:
// attribute → in
// varying → out (顶点着色器) / in (片段着色器)
// texture2D → texture
// gl_FragColor → 自定义输出变量
```

### 10.3.2 新的输入输出语法

```glsl
// ========== 顶点着色器 ==========
#version 300 es

// 替代 attribute
in vec3 a_position;
in vec3 a_normal;
in vec2 a_texCoord;

// 替代 varying（输出到片段着色器）
out vec3 v_normal;
out vec2 v_texCoord;

uniform mat4 u_mvp;

void main() {
    gl_Position = u_mvp * vec4(a_position, 1.0);
    v_normal = a_normal;
    v_texCoord = a_texCoord;
}


// ========== 片段着色器 ==========
#version 300 es

precision highp float;

// 从顶点着色器接收（用 in）
in vec3 v_normal;
in vec2 v_texCoord;

// 自定义输出（替代 gl_FragColor）
out vec4 fragColor;

uniform sampler2D u_texture;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);  // texture2D → texture
    fragColor = texColor;
}
```

### 10.3.3 新的内置函数

```glsl
#version 300 es

// ========== 整数支持 ==========
int a = 5;
uint b = 10u;
ivec3 intVector = ivec3(1, 2, 3);
uvec4 uintVector = uvec4(1u, 2u, 3u, 4u);

// 位运算
int result = a & b;  // AND
result = a | b;      // OR
result = a ^ b;      // XOR
result = a << 2;     // 左移
result = a >> 1;     // 右移


// ========== 新纹理函数 ==========
// texture() - 统一的纹理采样
vec4 color = texture(sampler2D, vec2);
vec4 color = texture(samplerCube, vec3);
vec4 color = texture(sampler3D, vec3);
vec4 color = texture(sampler2DArray, vec3);

// textureLod() - 指定 mipmap 级别
vec4 color = textureLod(sampler, coords, lod);

// textureOffset() - 带偏移的采样
vec4 color = textureOffset(sampler, coords, ivec2(1, 0));

// texelFetch() - 直接获取 texel（不过滤）
vec4 color = texelFetch(sampler, ivec2(x, y), lod);

// textureSize() - 获取纹理尺寸
ivec2 size = textureSize(sampler, lod);


// ========== 数学函数 ==========
float rounded = round(value);      // 四舍五入
float truncated = trunc(value);    // 截断
float mantissa = modf(value, i);   // 分离整数和小数部分

// 整数函数
int bits = bitCount(x);            // 统计 1 的个数
int lowest = findLSB(x);           // 最低有效位
int highest = findMSB(x);          // 最高有效位
uint reversed = bitfieldReverse(x); // 位反转
uint extracted = bitfieldExtract(x, offset, bits);
uint inserted = bitfieldInsert(base, insert, offset, bits);

// 打包/解包
uint packed = packUnorm4x8(vec4);
vec4 unpacked = unpackUnorm4x8(uint);
```

### 10.3.4 Uniform 块（Uniform Buffer Objects）

```glsl
#version 300 es

// 定义 Uniform 块
layout(std140) uniform CameraBlock {
    mat4 viewMatrix;
    mat4 projectionMatrix;
    vec3 cameraPosition;
};

layout(std140) uniform LightBlock {
    vec3 lightPosition;
    vec3 lightColor;
    float lightIntensity;
};
```

```javascript
// JavaScript 端创建 UBO
function createUBO(gl, data, bindingPoint) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
    gl.bufferData(gl.UNIFORM_BUFFER, data, gl.DYNAMIC_DRAW);
    
    // 绑定到指定的绑定点
    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, buffer);
    
    return buffer;
}

// 获取 Uniform 块索引并绑定
const cameraBlockIndex = gl.getUniformBlockIndex(program, 'CameraBlock');
gl.uniformBlockBinding(program, cameraBlockIndex, 0);  // 绑定点 0

const lightBlockIndex = gl.getUniformBlockIndex(program, 'LightBlock');
gl.uniformBlockBinding(program, lightBlockIndex, 1);  // 绑定点 1

// 创建 UBO
const cameraUBO = createUBO(gl, cameraData, 0);
const lightUBO = createUBO(gl, lightData, 1);

// 更新 UBO 数据
gl.bindBuffer(gl.UNIFORM_BUFFER, cameraUBO);
gl.bufferSubData(gl.UNIFORM_BUFFER, 0, newCameraData);
```

---

## 10.4 实例化渲染（Instancing）

### 10.4.1 什么是实例化

```
实例化渲染

绘制大量相似物体时，避免重复的 draw call

没有实例化:
──────────────────────────────────
for (let i = 0; i < 1000; i++) {
    // 1000 次 draw call，每次更新 uniform
    gl.uniform3fv(positionLoc, positions[i]);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

开销：1000 次 CPU-GPU 通信


使用实例化:
──────────────────────────────────
// 1 次 draw call，绘制 1000 个实例
gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, 1000);

开销：1 次 CPU-GPU 通信


性能提升可达 10-100 倍！
```

### 10.4.2 实例化渲染实现

```javascript
// 创建实例数据缓冲
function setupInstancing(gl, program) {
    // 每个实例的位置偏移
    const instancePositions = new Float32Array([
        // 实例 0      实例 1      实例 2      ...
        0, 0, 0,     2, 0, 0,     4, 0, 0,     // x, y, z
        0, 2, 0,     2, 2, 0,     4, 2, 0,
        // ... 更多实例
    ]);
    
    // 每个实例的颜色
    const instanceColors = new Float32Array([
        1, 0, 0,     0, 1, 0,     0, 0, 1,     // r, g, b
        1, 1, 0,     1, 0, 1,     0, 1, 1,
        // ...
    ]);
    
    // 创建实例位置缓冲
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instancePositions, gl.STATIC_DRAW);
    
    const posLoc = gl.getAttribLocation(program, 'a_instancePosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    
    // 关键：设置每实例更新
    gl.vertexAttribDivisor(posLoc, 1);  // 每 1 个实例更新一次
    
    // 创建实例颜色缓冲
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceColors, gl.STATIC_DRAW);
    
    const colorLoc = gl.getAttribLocation(program, 'a_instanceColor');
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(colorLoc, 1);
    
    return { posBuffer, colorBuffer, instanceCount: instancePositions.length / 3 };
}

// 绘制
function drawInstanced(gl, instanceCount) {
    // 绘制多个实例
    gl.drawArraysInstanced(
        gl.TRIANGLES,
        0,              // 起始索引
        36,             // 每个实例的顶点数
        instanceCount   // 实例数量
    );
    
    // 或使用索引绘制
    gl.drawElementsInstanced(
        gl.TRIANGLES,
        36,             // 索引数量
        gl.UNSIGNED_SHORT,
        0,              // 偏移
        instanceCount
    );
}
```

### 10.4.3 实例化着色器

```glsl
#version 300 es

// 顶点属性（每顶点）
in vec3 a_position;
in vec3 a_normal;

// 实例属性（每实例）
in vec3 a_instancePosition;
in vec3 a_instanceColor;
in mat4 a_instanceMatrix;  // 也可以传矩阵

out vec3 v_color;
out vec3 v_normal;

uniform mat4 u_viewProjection;

void main() {
    // 使用实例位置偏移
    vec3 worldPos = a_position + a_instancePosition;
    
    // 或使用实例矩阵
    // vec4 worldPos = a_instanceMatrix * vec4(a_position, 1.0);
    
    gl_Position = u_viewProjection * vec4(worldPos, 1.0);
    v_color = a_instanceColor;
    v_normal = a_normal;
    
    // gl_InstanceID 是内置变量，表示当前实例索引
    // 可以用来计算程序化的变换
}
```

### 10.4.4 传递实例矩阵

```javascript
// 实例矩阵需要占用 4 个属性位置（mat4 = 4 个 vec4）
function setupInstanceMatrices(gl, program, matrices) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, matrices, gl.DYNAMIC_DRAW);
    
    const loc = gl.getAttribLocation(program, 'a_instanceMatrix');
    
    // mat4 占用 4 个连续的属性位置
    for (let i = 0; i < 4; i++) {
        const attribLoc = loc + i;
        gl.enableVertexAttribArray(attribLoc);
        gl.vertexAttribPointer(
            attribLoc,
            4,              // 每个 vec4 有 4 个分量
            gl.FLOAT,
            false,
            64,             // stride: 4 * 4 * 4 = 64 字节（一个 mat4）
            i * 16          // offset: 每个 vec4 偏移 16 字节
        );
        gl.vertexAttribDivisor(attribLoc, 1);  // 每实例更新
    }
    
    return buffer;
}
```

---

## 10.5 变换反馈（Transform Feedback）

### 10.5.1 什么是变换反馈

```
变换反馈

将顶点着色器的输出直接写回缓冲区
实现 GPU 端计算，无需读回 CPU

传统流程:
CPU → 顶点着色器 → 光栅化 → 片段着色器 → 帧缓冲


变换反馈流程:
                     ┌───────────────┐
CPU → 顶点着色器 ───→│ 变换反馈缓冲  │
         │          └───────────────┘
         ▼                 │
    光栅化（可选）          │ 下一帧输入
         │          ←──────┘
         ▼
    片段着色器


应用场景:
- 粒子系统
- 物理模拟
- 骨骼动画
- 地形 LOD
```

### 10.5.2 变换反馈实现

```javascript
/**
 * 创建变换反馈
 */
function createTransformFeedback(gl, program) {
    // 1. 在链接程序前指定输出变量
    gl.transformFeedbackVaryings(
        program,
        ['v_position', 'v_velocity'],  // 输出变量名
        gl.INTERLEAVED_ATTRIBS         // 或 gl.SEPARATE_ATTRIBS
    );
    gl.linkProgram(program);
    
    // 2. 创建变换反馈对象
    const transformFeedback = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    
    // 3. 创建输出缓冲
    const bufferSize = particleCount * 6 * 4;  // 6 floats per particle
    const tfBuffer = gl.createBuffer();
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, tfBuffer);
    gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, bufferSize, gl.DYNAMIC_COPY);
    
    // 4. 绑定缓冲到变换反馈
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, tfBuffer);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    
    return { transformFeedback, tfBuffer };
}

/**
 * 使用变换反馈渲染
 */
function renderWithTransformFeedback(gl, tf, inputBuffer, outputBuffer) {
    gl.useProgram(tfProgram);
    
    // 绑定输入
    gl.bindBuffer(gl.ARRAY_BUFFER, inputBuffer);
    // ... 设置属性
    
    // 绑定变换反馈
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf.transformFeedback);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, outputBuffer);
    
    // 开始变换反馈
    gl.beginTransformFeedback(gl.POINTS);
    
    // 如果只需要计算，不需要光栅化
    gl.enable(gl.RASTERIZER_DISCARD);
    
    // 绘制
    gl.drawArrays(gl.POINTS, 0, particleCount);
    
    // 结束变换反馈
    gl.endTransformFeedback();
    gl.disable(gl.RASTERIZER_DISCARD);
    
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
}
```

### 10.5.3 GPU 粒子系统

```glsl
// ========== 变换反馈顶点着色器 ==========
#version 300 es

in vec3 a_position;
in vec3 a_velocity;

// 变换反馈输出
out vec3 v_position;
out vec3 v_velocity;

uniform float u_deltaTime;
uniform vec3 u_gravity;

void main() {
    // 更新速度
    v_velocity = a_velocity + u_gravity * u_deltaTime;
    
    // 更新位置
    v_position = a_position + v_velocity * u_deltaTime;
    
    // 边界检测（简单反弹）
    if (v_position.y < 0.0) {
        v_position.y = 0.0;
        v_velocity.y *= -0.8;  // 能量损失
    }
    
    gl_Position = vec4(v_position, 1.0);
    gl_PointSize = 4.0;
}
```

```javascript
/**
 * GPU 粒子系统
 */
class GPUParticleSystem {
    constructor(gl, count) {
        this.gl = gl;
        this.count = count;
        
        // 创建双缓冲（ping-pong）
        this.buffers = [
            this.createParticleBuffer(),
            this.createParticleBuffer()
        ];
        this.currentBuffer = 0;
        
        // 创建变换反馈
        this.transformFeedbacks = [
            gl.createTransformFeedback(),
            gl.createTransformFeedback()
        ];
        
        // 绑定缓冲到变换反馈
        for (let i = 0; i < 2; i++) {
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[i]);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buffers[i]);
        }
        
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    }
    
    createParticleBuffer() {
        const gl = this.gl;
        const data = new Float32Array(this.count * 6);  // pos(3) + vel(3)
        
        // 初始化粒子
        for (let i = 0; i < this.count; i++) {
            // 位置
            data[i * 6 + 0] = (Math.random() - 0.5) * 10;
            data[i * 6 + 1] = Math.random() * 10;
            data[i * 6 + 2] = (Math.random() - 0.5) * 10;
            // 速度
            data[i * 6 + 3] = (Math.random() - 0.5) * 2;
            data[i * 6 + 4] = Math.random() * 5;
            data[i * 6 + 5] = (Math.random() - 0.5) * 2;
        }
        
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_COPY);
        
        return buffer;
    }
    
    update(deltaTime) {
        const gl = this.gl;
        const read = this.currentBuffer;
        const write = 1 - this.currentBuffer;
        
        gl.useProgram(this.updateProgram);
        gl.uniform1f(gl.getUniformLocation(this.updateProgram, 'u_deltaTime'), deltaTime);
        
        // 绑定输入缓冲
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[read]);
        // 设置属性...
        
        // 绑定输出
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbacks[write]);
        
        gl.enable(gl.RASTERIZER_DISCARD);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.count);
        gl.endTransformFeedback();
        gl.disable(gl.RASTERIZER_DISCARD);
        
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        
        // 交换缓冲
        this.currentBuffer = write;
    }
    
    render() {
        const gl = this.gl;
        
        gl.useProgram(this.renderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[this.currentBuffer]);
        // 设置属性...
        
        gl.drawArrays(gl.POINTS, 0, this.count);
    }
}
```

---

## 10.6 多重渲染目标（MRT）

### 10.6.1 MRT 基础

```javascript
// 创建 G-Buffer
function createGBuffer(gl, width, height) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    
    const textures = {};
    
    // 位置纹理
    textures.position = createTexture(gl, gl.RGBA16F, width, height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures.position, 0);
    
    // 法线纹理
    textures.normal = createTexture(gl, gl.RGBA16F, width, height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, textures.normal, 0);
    
    // 颜色纹理
    textures.albedo = createTexture(gl, gl.RGBA8, width, height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, textures.albedo, 0);
    
    // 指定渲染目标
    gl.drawBuffers([
        gl.COLOR_ATTACHMENT0,
        gl.COLOR_ATTACHMENT1,
        gl.COLOR_ATTACHMENT2
    ]);
    
    // 深度缓冲
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    return { framebuffer: fb, textures, depthBuffer };
}
```

### 10.6.2 MRT 着色器

```glsl
#version 300 es
precision highp float;

in vec3 v_position;
in vec3 v_normal;
in vec2 v_texCoord;

// 多个输出
layout(location = 0) out vec4 gPosition;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gAlbedo;

uniform sampler2D u_diffuseMap;

void main() {
    gPosition = vec4(v_position, 1.0);
    gNormal = vec4(normalize(v_normal), 0.0);
    gAlbedo = texture(u_diffuseMap, v_texCoord);
}
```

---

## 10.7 3D 纹理与纹理数组

### 10.7.1 3D 纹理

```javascript
// 创建 3D 纹理
function create3DTexture(gl, width, height, depth, data) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_3D, texture);
    
    gl.texImage3D(
        gl.TEXTURE_3D,
        0,
        gl.RGBA,
        width, height, depth,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data
    );
    
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    
    return texture;
}

// 在着色器中使用
// uniform sampler3D u_volume;
// vec4 color = texture(u_volume, vec3(u, v, w));
```

### 10.7.2 2D 纹理数组

```javascript
// 创建纹理数组
function createTextureArray(gl, width, height, layers, images) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    
    // 分配存储
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, width, height, layers);
    
    // 上传每一层
    images.forEach((image, layer) => {
        gl.texSubImage3D(
            gl.TEXTURE_2D_ARRAY,
            0,
            0, 0, layer,
            width, height, 1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
    });
    
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    
    return texture;
}

// 在着色器中使用
// uniform sampler2DArray u_textures;
// vec4 color = texture(u_textures, vec3(uv, layer));
```

---

## 10.8 VAO（顶点数组对象）

WebGL 2.0 原生支持 VAO：

```javascript
// 创建 VAO
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// 设置顶点属性（只需设置一次）
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(0);

gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(1);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

gl.bindVertexArray(null);

// 渲染时只需绑定 VAO
function render() {
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}
```

---

## 10.9 同步对象与查询

```javascript
// 同步对象 - 等待 GPU 完成
const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

// 检查状态
const status = gl.clientWaitSync(sync, 0, 0);
if (status === gl.ALREADY_SIGNALED || status === gl.CONDITION_SATISFIED) {
    console.log('GPU 操作完成');
}

gl.deleteSync(sync);


// 遮挡查询
const query = gl.createQuery();

gl.beginQuery(gl.ANY_SAMPLES_PASSED, query);
// 绘制物体
drawBoundingBox();
gl.endQuery(gl.ANY_SAMPLES_PASSED);

// 稍后获取结果
if (gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
    const passed = gl.getQueryParameter(query, gl.QUERY_RESULT);
    if (passed > 0) {
        // 物体可见，绘制完整模型
        drawFullModel();
    }
}
```

---

## 10.10 本章小结

### WebGL 2.0 新特性总结

| 特性 | 说明 |
|------|------|
| **GLSL ES 3.0** | 新语法、整数支持、UBO |
| **实例化** | 高效绘制大量相似物体 |
| **变换反馈** | GPU 端计算 |
| **MRT** | 多目标渲染 |
| **3D 纹理** | 体积数据 |
| **纹理数组** | 多层纹理 |
| **VAO** | 原生支持 |
| **同步/查询** | 精确控制 |

### 关键 API

| API | 作用 |
|-----|------|
| `drawArraysInstanced()` | 实例化绘制 |
| `vertexAttribDivisor()` | 设置实例更新频率 |
| `transformFeedbackVaryings()` | 指定输出变量 |
| `beginTransformFeedback()` | 开始变换反馈 |
| `drawBuffers()` | 指定 MRT 目标 |
| `texImage3D()` | 创建 3D 纹理 |
| `createVertexArray()` | 创建 VAO |

---

## 10.11 练习题

### 基础练习

1. 使用实例化渲染 1000 个立方体

2. 创建多目标渲染的 G-Buffer

### 进阶练习

3. 使用变换反馈实现 GPU 粒子系统

4. 实现纹理数组切换地形贴图

### 挑战练习

5. 实现完整的延迟渲染管线

---

**下一章预告**：在第11章中，我们将学习 WebGL 性能优化和调试技巧。

---

**文档版本**：v1.0  
**字数统计**：约 11,000 字  
**代码示例**：45+ 个
