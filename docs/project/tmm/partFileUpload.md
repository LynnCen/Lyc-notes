
# ELectron大文件分片上传、断点续传、并行上传


## 基础系统架构

![alt text](../img/fileUpload.png)


## 文件夹结构
```markdown
src/
  ├── main/
  │   ├── s3/
  │   │   ├── S3Client.ts       // S3 操作封装
  │   │   └── types.ts          // 类型定义
  │   ├── upload/
  │   │   ├── FileHandler.ts    // 文件处理
  │   │   ├── UploadManager.ts  // 上传管理
  │   │   ├── UploadTask.ts     // 上传任务
  │   │   └── utils.ts          // 工具函数
  │   └── index.ts              // 主进程入口
  └── renderer/
      ├── components/
      │   └── Upload.tsx        // 上传组件
      └── index.tsx             // 渲染进程入口
```

## 基本数据结构

**基本配置项**
```ts
/**
 * AWS S3 配置接口
 * 定义连接 AWS S3 所需的基本配置项
 */
export interface S3Config {
  /** AWS访问密钥ID */
  accessKeyId: string;
  
  /** AWS秘密访问密钥 */
  secretAccessKey: string;
  
  /** AWS区域标识符(如 us-east-1) */
  region: string;
  
  /** S3存储桶名称 */
  bucket: string;
}

/**
 * 文件分片信息接口
 * 定义单个分片的详细信息
 */
export interface UploadChunk {
  /** 分片序号(从0开始) */
  index: number;
  
  /** 分片在文件中的起始位置(字节) */
  start: number;
  
  /** 分片在文件中的结束位置(字节) */
  end: number;
  
  /** 分片大小(字节) */
  size: number;
  
  /** 分片上传状态(pending|uploading|completed|failed) */
  status: ChunkStatus;
  
  /** 
   * 分片上传后的ETag标识
   * AWS S3返回的用于验证分片完整性的标识符
   */
  etag?: string;
}

/**
 * 断点续传检查点数据接口
 * 用于保存上传进度,支持断点续传
 */
export interface CheckpointData {
  /** 文件唯一标识符 */
  fileId: string;
  
  /** 文件名称 */
  fileName: string;
  
  /** 
   * 分片上传ID
   * AWS S3的multipart upload ID
   */
  uploadId: string;
  
  /** 所有分片信息数组 */
  chunks: UploadChunk[];
  
  /** 
   * 上传进度百分比
   * 范围0-100
   */
  progress: number;
}


```

**状态管理**
```ts
/**
 * 上传任务状态枚举
 * 定义整体上传任务的所有可能状态
 */
export enum UploadStatus {
  /** 等待上传 - 初始状态 */
  PENDING = 'pending',
  
  /** 正在上传 - 数据传输中 */
  UPLOADING = 'uploading',
  
  /** 已暂停 - 用户手动暂停或系统自动暂停 */
  PAUSED = 'paused',
  
  /** 已完成 - 所有分片上传成功并合并 */
  COMPLETED = 'completed',
  
  /** 错误 - 上传过程中发生错误 */
  ERROR = 'error'
}

/**
 * 分片状态枚举
 * 定义单个分片的所有可能状态
 */
export enum ChunkStatus {
  /** 等待上传 - 分片初始状态 */
  PENDING = 'pending',
  
  /** 正在上传 - 分片数据传输中 */
  UPLOADING = 'uploading',
  
  /** 上传成功 - 分片完成上传并验证 */
  SUCCESS = 'success',
  
  /** 上传失败 - 分片上传过程出错 */
  ERROR = 'error'
}

/**
 * 上传进度接口
 * 用于跟踪和报告上传进度
 */
export interface UploadProgress {
  /** 上传任务唯一标识符 */
  taskId: string;
  
  /** 已上传的字节数 */
  loaded: number;
  
  /** 文件总字节数 */
  total: number;
  
  /** 
   * 上传进度百分比 
   * 计算公式: (loaded / total) * 100
   */
  progress: number;
}

```

## 核心模块功能

```markdown
- FileHandler - 文件处理模块
  - 文件分片
  - 计算MD5
  - 读取文件流

- UploadManager - 上传管理模块  
  - 任务队列管理
  - 并发控制
  - 断点续传管理
  - 进度跟踪

- S3Client - S3操作模块
  - 初始化上传
  - 上传分片
  - 合并分片
  - 中止上传

```

## 主要流程

```ts
1. 初始化上传
- 检查是否存在断点记录
- 计算文件MD5作为唯一标识
- 调用 S3 createMultipartUpload
- 保存 uploadId

2. 分片处理  
- 根据文件大小和分片大小计算分片
- 生成每个分片的信息(序号、偏移量、大小)
- 存储分片信息用于断点续传

3. 并行上传
- 维护上传队列
- 控制并发数量
- 处理超时和重试
- 记录已上传分片

4. 断点续传
- 定期保存上传状态
- 启动时检查断点记录
- 仅上传未完成的分片
- 超时/错误时保存进度

5. 完成上传
- 验证所有分片上传成功
- 调用 completeMultipartUpload
- 清理断点记录

```

## 核心技术

 --- 

### 分片上传
实现：
```markdown
- 使用 File API 的 slice 方法将文件切分成固定大小的块
- 每个分片包含: 序号、起始位置、结束位置、大小等信息
- 使用 createReadStream 读取分片内容
- 利用 S3 的 multipart upload API 上传每个分片

主要代码逻辑:
file.slice(start, end) -> 生成分片
createReadStream(file, {start, end}) -> 读取分片内容 
s3.uploadPart() -> 上传分片到S3
```
**分片处理：**
```ts
/**
 * 将文件分割成固定大小的分片
 * 用于大文件分片上传
 * 
 * @param file 要上传的文件对象
 * @param chunkSize 分片大小(单位:字节)
 * @returns 分片信息数组
 * 
 * @example
 * const file = new File(['content'], 'test.txt');
 * const chunks = createChunks(file, 1024 * 1024); // 1MB分片
 */
function createChunks(file: File, chunkSize: number) {
  // 存储所有分片信息
  const chunks = [];
  
  // 循环生成分片
  // start: 当前分片的起始位置
  // file.size: 文件总大小
  // chunkSize: 每次增加一个分片大小
  for(let start = 0; start < file.size; start += chunkSize) {
    chunks.push({
      // 分片起始位置
      start,
      
      // 分片结束位置
      // Math.min确保最后一个分片不会超出文件大小
      end: Math.min(start + chunkSize, file.size)
    });
  }
  
  return chunks;
}

/**
 * 使用示例:
 */
interface Chunk {
  start: number;  // 分片起始字节
  end: number;    // 分片结束字节
}

// 优化版本
function createChunksOptimized(file: File, options: {
  chunkSize?: number;      // 分片大小
  maxChunks?: number;      // 最大分片数
  minChunkSize?: number;   // 最小分片大小
}) {
  const {
    chunkSize = 5 * 1024 * 1024,  // 默认5MB
    maxChunks = 10000,            // 最大分片数
    minChunkSize = 1024 * 1024    // 最小1MB
  } = options;

  // 计算最优分片大小
  const optimalChunkSize = Math.max(
    minChunkSize,
    Math.ceil(file.size / maxChunks)
  );

  // 使用优化后的分片大小
  return createChunks(file, optimalChunkSize);
}

// 使用方法
const file = new File(['content'], 'test.txt');

// 基础用法
const chunks = createChunks(file, 1024 * 1024);

// 优化用法
const optimizedChunks = createChunksOptimized(file, {
  chunkSize: 2 * 1024 * 1024,  // 2MB分片
  maxChunks: 1000,             // 最多1000个分片
  minChunkSize: 1024 * 1024    // 最小1MB
});

/**
 * 注意事项:
 * 1. 分片大小建议:
 *    - 最小 1MB (过小会增加请求次数)
 *    - 最大 5GB (S3单片上传限制)
 *    - 推荐 5MB (AWS官方建议)
 * 
 * 2. 分片数量建议:
 *    - 最大 10000 (S3 multipart限制)
 *    - 建议控制在1000以内
 * 
 * 3. 性能考虑:
 *    - 分片太小: 请求次数多,效率低
 *    - 分片太大: 单片失败影响大,重试代价高
 *    - 需要根据网络状况和文件大小调整
 * 
 * 4. 内存使用:
 *    - 分片信息数组占用空间小
 *    - 实际分片数据使用流式处理
 *    - 不会一次性加载整个文件
 */

```
**分片上传：**
```ts
/**
 * 上传单个分片到 AWS S3
 * 使用 multipart upload API 上传文件分片
 * 
 * @param params 上传参数
 * @param params.key 文件在S3中的唯一标识符(文件路径)
 * @param params.uploadId 分片上传任务的ID
 * @param params.partNumber 分片序号(1-10000)
 * @param params.body 分片数据Buffer
 * 
 * @returns 上传成功的分片信息
 * @returns {number} PartNumber - 分片序号
 * @returns {string} ETag - 分片的MD5校验值
 * 
 * @throws 上传失败时抛出错误
 * 
 * @example
 * const result = await uploadPart({
 *   key: 'path/to/file.txt',
 *   uploadId: 'xxx',
 *   partNumber: 1,
 *   body: Buffer.from('data')
 * });
 */
async uploadPart(params: {
    /** 文件在S3中的键值 */
    key: string,
    /** Multipart Upload ID */
    uploadId: string,
    /** 分片序号(1-10000) */
    partNumber: number,
    /** 分片数据 */
    body: Buffer
  }) {
    try {
      // 调用S3 API上传分片
      const response = await this.s3.uploadPart({
        // S3存储桶名称
        Bucket: this.config.bucket,
        // 文件键值(路径)
        Key: params.key,
        // 分片上传ID
        UploadId: params.uploadId,
        // 分片序号
        PartNumber: params.partNumber,
        // 分片数据
        Body: params.body
      }).promise();

      // 返回上传成功的分片信息
      return {
        PartNumber: params.partNumber,
        ETag: response.ETag // 用于后续完成上传时的分片验证
      };
    } catch (error) {
      // 包装错误信息
      throw new Error(`Failed to upload part: ${error.message}`);
    }
  }

/**
 * 使用说明:
 * 
 * 1. 分片大小限制:
 *    - 最小: 5MB
 *    - 最大: 5GB
 *    - 最后一片可以小于5MB
 * 
 * 2. 分片序号范围:
 *    - 最小: 1
 *    - 最大: 10000
 * 
 * 3. 注意事项:
 *    - ETag需要保存用于完成上传
 *    - 分片必须按顺序上传
 *    - 建议实现重试机制
 * 
 * 4. 错误处理:
 *    - 网络错误
 *    - 超时错误
 *    - 权限错误
 *    - 存储桶不存在
 * 
 * 5. 优化建议:
 *    - 实现并发控制
 *    - 添加进度回调
 *    - 支持取消上传
 *    - 实现断点续传
 */
```
--- 

#### 网络层IP分片

IP分片(IP Fragmentation)是网络层的一个重要机制,当IP数据报大于链路层MTU(最大传输单元)时,需要将数据报分片传输。

**基本特点:**
1. **强制分片条件**
   - 数据报大小 > MTU(通常为1500字节)
   - 未设置"不分片"标志(Don't Fragment)

2. **分片字段**
   - Identification: 同一数据报的分片共享标识符
   - Fragment Offset: 分片在原始数据报中的偏移量(以8字节为单位)
   - More Fragments(MF)标志: 表示是否还有后续分片
   - Don't Fragment(DF)标志: 禁止分片标志
   - 校验和: 确保分片数据完整性

3. **分片规则**
   - 分片大小必须是8字节的整数倍(除最后一片外)
   - 每个分片都有自己的IP头部
   - 原始IP头部的大部分信息在分片时被复制

4. **重组过程**
   - 目标主机收集具有相同Identification的所有分片
   - 根据Fragment Offset重新排序
   - 检查More Fragments标志确认所有分片到达
   - 去除IP头部后重组原始数据

基于对IP分片机制的理解,我们可以在文件分片上传中借鉴以下几点:

1. **分片策略**
   - 选择合适的分片大小,避免过度分片
   - 考虑网络MTU,合理设置最小分片大小

2. **标识机制**
   - 使用唯一标识关联同一文件的分片
   - 维护分片顺序信息便于重组

3. **传输优化**
   - 实现可靠的重传机制
   - 控制并发数量避免网络拥塞

4. **重组处理**
   - 完整性校验
   - 有序重组确保数据正确性


### 断点续传

**实现思路：**
```markdown
- 使用 electron-store 持久化存储上传状态
- 记录: uploadId、已上传分片信息、文件标识等
- 启动时检查是否存在未完成的上传任务
- 只上传未完成的分片

核心数据结构:
{
  fileId: string,      // 文件唯一标识
  uploadId: string,    // S3上传ID 
  chunks: [            // 分片信息
    {
      index: number,   // 分片序号
      status: string,  // 上传状态
      etag: string     // S3返回的标识
    }
  ]
}
```

--- 

### 并行上传


**实现思路：**
```ts
- 维护上传队列和并发计数
- 使用 Promise.all 控制并发数
- 任务池模式管理上传任务
- 错误重试机制

实现思路:
1. 初始化任务队列
2. 取出 N 个任务并行执行
3. 某个任务完成后,立即开始下一个
4. 控制最大并发数

```

```ts
/**
 * 控制分片并发上传
 * 使用Promise池实现并发控制
 * 
 * @param chunks 待上传的分片数组
 * @param maxConcurrent 最大并发数
 * 
 * @example
 * await uploadChunks(fileChunks, 3); // 最多同时上传3个分片
 */
async function uploadChunks(
  chunks: Chunk[],      // 分片数组
  maxConcurrent: number // 最大并发数
) {
  // 创建任务队列(复制数组避免修改原数据)
  const queue = [...chunks];
  
  // 正在执行的任务集合
  // 使用Set存储正在执行的Promise
  const executing = new Set<Promise<any>>();
  
  // 持续处理队列直到所有分片上传完成
  while(queue.length > 0) {
    // 检查是否达到并发上限
    if(executing.size >= maxConcurrent) {
      // 等待任意一个任务完成
      // Promise.race 返回最先完成的Promise
      await Promise.race(executing);
      continue; // 继续下一次循环
    }
    
    // 从队列中取出一个分片
    const chunk = queue.shift()!;
    
    // 创建上传Promise
    const promise = uploadChunk(chunk)
      // finally确保任务完成后从执行集合中移除
      .finally(() => executing.delete(promise));
      
    // 将任务添加到执行集合
    executing.add(promise);
  }
  
  // 等待所有正在执行的任务完成
  await Promise.all(executing);
}

```


## 核心代码
---

### S3 客户端封装 (S3Client.ts)


```ts
import AWS from 'aws-sdk';
import { S3Config } from './types';

/**
 * AWS S3客户端封装类
 * 处理与AWS S3的所有交互操作
 */
export class S3Client {
  /** AWS S3 SDK实例 */
  private s3: AWS.S3;

  /**
   * 初始化S3客户端
   * @param config S3配置信息
   */
  constructor(config: S3Config) {
    // 创建S3实例并配置认证信息
    this.s3 = new AWS.S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region
    });
  }

  /**
   * 初始化分片上传任务
   * 创建一个新的multipart upload任务
   * 
   * @param key 文件在S3中的键值(路径)
   * @returns uploadId 分片上传任务的唯一标识符
   * @throws 初始化失败时抛出错误
   */
  async initializeMultipartUpload(key: string) {
    try {
      const response = await this.s3.createMultipartUpload({
        Bucket: this.config.bucket,
        Key: key
      }).promise();
      
      return response.UploadId;
    } catch (error) {
      throw new Error(`Failed to initialize multipart upload: ${error.message}`);
    }
  }

  /**
   * 上传单个分片
   * 将文件分片上传到已初始化的multipart upload任务中
   * 
   * @param params 上传参数
   * @param params.key 文件键值
   * @param params.uploadId 上传任务ID
   * @param params.partNumber 分片序号(1-10000)
   * @param params.body 分片数据
   * @returns 上传成功的分片信息(序号和ETag)
   * @throws 上传失败时抛出错误
   */
  async uploadPart(params: {
    key: string,
    uploadId: string,
    partNumber: number,
    body: Buffer
  }) {
    try {
      const response = await this.s3.uploadPart({
        Bucket: this.config.bucket,
        Key: params.key,
        UploadId: params.uploadId,
        PartNumber: params.partNumber,
        Body: params.body
      }).promise();

      return {
        PartNumber: params.partNumber,
        ETag: response.ETag // 分片的MD5校验值
      };
    } catch (error) {
      throw new Error(`Failed to upload part: ${error.message}`);
    }
  }

  /**
   * 完成分片上传
   * 合并所有已上传的分片完成上传任务
   * 
   * @param params 完成上传参数
   * @param params.key 文件键值
   * @param params.uploadId 上传任务ID
   * @param params.parts 所有已上传分片的信息
   * @throws 完成上传失败时抛出错误
   */
  async completeMultipartUpload(params: {
    key: string,
    uploadId: string,
    parts: AWS.S3.CompletedPart[]
  }) {
    try {
      await this.s3.completeMultipartUpload({
        Bucket: this.config.bucket,
        Key: params.key,
        UploadId: params.uploadId,
        MultipartUpload: { Parts: params.parts }
      }).promise();
    } catch (error) {
      throw new Error(`Failed to complete multipart upload: ${error.message}`);
    }
  }

  /**
   * 取消分片上传
   * 清理未完成的上传任务和相关资源
   * 
   * @param key 文件键值
   * @param uploadId 上传任务ID
   * @throws 取消上传失败时抛出错误
   */
  async abortMultipartUpload(key: string, uploadId: string) {
    try {
      await this.s3.abortMultipartUpload({
        Bucket: this.config.bucket,
        Key: key,
        UploadId: uploadId
      }).promise();
    } catch (error) {
      throw new Error(`Failed to abort multipart upload: ${error.message}`);
    }
  }
}

```

### 文件处理器 (FileHandler.ts)

工具类模式：静态方法设计、职责单一、方法独立

流式处理：避免内存溢出、支持大文件

分片策略： 固定分片大小、边界处理

文件校验： MD5哈希
```ts
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { UploadChunk } from './types';

/**
 * 文件处理工具类
 * 提供文件分片、校验等基础操作
 */
export class FileHandler {
  /**
   * 计算文件的MD5哈希值
   * 使用流式读取避免一次性加载大文件
   * 
   * @param filePath 文件路径
   * @returns Promise<string> 文件的MD5哈希值(16进制字符串)
   * 
   * @example
   * const md5 = await FileHandler.calculateMD5('/path/to/file.txt');
   */
  static async calculateMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // 创建MD5哈希对象
      const hash = createHash('md5');
      // 创建文件读取流
      const stream = createReadStream(filePath);

      // 处理数据块
      stream.on('data', data => hash.update(data));
      // 完成后返回哈希值
      stream.on('end', () => resolve(hash.digest('hex')));
      // 错误处理
      stream.on('error', reject);
    });
  }

  /**
   * 生成文件分片信息
   * 将文件划分为固定大小的分片
   * 
   * @param fileSize 文件总大小(字节)
   * @param partSize 分片大小(字节)
   * @returns UploadChunk[] 分片信息数组
   * 
   * @example
   * const chunks = FileHandler.createChunks(
   *   fileSize,
   *   5 * 1024 * 1024 // 5MB分片
   * );
   */
  static createChunks(fileSize: number, partSize: number): UploadChunk[] {
    const chunks: UploadChunk[] = [];
    let index = 0;
    
    // 循环生成分片信息
    for (let start = 0; start < fileSize; start += partSize) {
      // 计算分片结束位置(不超过文件大小)
      const end = Math.min(start + partSize, fileSize);
      
      // 创建分片信息
      chunks.push({
        index,          // 分片索引
        start,          // 起始位置
        end,            // 结束位置
        size: end - start, // 分片大小
        status: ChunkStatus.PENDING // 初始状态
      });
      index++;
    }

    return chunks;
  }

  /**
   * 读取指定范围的文件内容
   * 使用流式读取并返回Buffer
   * 
   * @param filePath 文件路径
   * @param start 起始字节位置
   * @param end 结束字节位置
   * @returns Promise<Buffer> 文件内容Buffer
   * 
   * @example
   * const data = await FileHandler.readChunk(
   *   'file.txt',
   *   0,
   *   1024 // 读取前1KB
   * );
   */
  static async readChunk(
    filePath: string,
    start: number,
    end: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // 存储数据块
      const chunks: Buffer[] = [];
      
      // 创建范围读取流
      const stream = createReadStream(filePath, {
        start,
        end: end - 1 // end是包含的,所以减1
      });

      // 收集数据块
      stream.on('data', chunk => chunks.push(chunk));
      // 合并所有数据块
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      // 错误处理
      stream.on('error', reject);
    });
  }
}
```

### 上传任务类 (UploadTask.ts)

```ts
import { EventEmitter } from 'events';
import { S3Client } from '../s3/S3Client';
import { FileHandler } from './FileHandler';
import { CheckpointData, UploadStatus, ChunkStatus } from './types';

/**
 * 文件上传任务类
 * 继承自EventEmitter以支持事件机制
 * 管理单个文件的完整上传流程
 */
export class UploadTask extends EventEmitter {
  /** 当前上传状态 */
  private status: UploadStatus = UploadStatus.PENDING;
  /** 断点续传检查点数据 */
  private checkpoint: CheckpointData;
  /** 正在上传的分片集合 */
  private uploadingChunks: Set<number> = new Set();

  /**
   * 构造函数
   * @param taskId 任务唯一标识符
   * @param filePath 文件路径
   * @param fileName 文件名称
   * @param s3Client S3客户端实例
   * @param config 上传配置
   */
  constructor(
    public readonly taskId: string,
    private filePath: string,
    private fileName: string,
    private s3Client: S3Client,
    private config: {
      partSize: number;      // 分片大小
      maxConcurrent: number; // 最大并发数
      retryTimes: number;    // 重试次数
    }
  ) {
    super();
  }

  /**
   * 开始上传任务
   * 处理完整的上传流程
   */
  async start() {
    try {
      this.status = UploadStatus.UPLOADING;
      
      // 初始化或恢复检查点
      await this.initializeCheckpoint();
      
      // 开始上传分片
      await this.uploadChunks();
      
      // 如果所有分片上传完成,执行完成操作
      if (this.allChunksUploaded()) {
        await this.completeUpload();
      }
    } catch (error) {
      this.status = UploadStatus.ERROR;
      this.emit('error', error);
    }
  }

  /**
   * 暂停上传
   */
  pause() {
    this.status = UploadStatus.PAUSED;
    this.emit('pause');
  }

  /**
   * 恢复上传
   */
  resume() {
    if (this.status === UploadStatus.PAUSED) {
      this.status = UploadStatus.UPLOADING;
      this.uploadChunks();
      this.emit('resume');
    }
  }

  /**
   * 初始化或恢复检查点数据
   * 用于支持断点续传
   */
  private async initializeCheckpoint() {
    if (!this.checkpoint) {
      // 计算文件唯一标识
      const fileId = await FileHandler.calculateMD5(this.filePath);
      // 初始化S3分片上传任务
      const uploadId = await this.s3Client.initializeMultipartUpload(this.fileName);
      
      // 创建检查点数据
      this.checkpoint = {
        fileId,
        fileName: this.fileName,
        uploadId,
        chunks: FileHandler.createChunks(this.fileSize, this.config.partSize),
        progress: 0
      };
    }
  }


/**
 * 上传所有分片
 * 使用Promise池实现并发控制
 * 支持暂停、重试机制
 * 
 * @example
 * // 配置参数
 * maxConcurrent: 3     // 最大并发数 
 * retryTimes: 3        // 最大重试次数
 */
private async uploadChunks() {
  // 获取所有待上传的分片
  const pendingChunks = this.checkpoint.chunks.filter(
    chunk => chunk.status === ChunkStatus.PENDING
  );

  // 创建任务队列(复制数组避免修改原数据)
  const queue = [...pendingChunks];
  
  // 正在执行的任务集合
  // 使用Set存储正在执行的Promise
  const executing = new Set<Promise<any>>();

  try {
    // 持续处理队列直到所有分片上传完成
    while (queue.length > 0 || executing.size > 0) {
      // 检查上传状态(支持暂停)
      if (this.status !== UploadStatus.UPLOADING) {
        break;
      }

      // 检查是否达到并发上限
      if (executing.size >= this.config.maxConcurrent) {
        // 等待任意一个任务完成
        await Promise.race(executing);
        continue;
      }

      // 从队列中取出一个分片
      const chunk = queue.shift();
      if (!chunk) continue;

      // 创建上传Promise
      const promise = this.uploadChunk(chunk)
        .catch(error => {
          // 错误处理:支持重试机制
          if (this.shouldRetry(chunk)) {
            queue.push(chunk); // 重新加入队列
          } else {
            throw error;      // 超过重试次数
          }
        })
        // finally确保任务完成后从执行集合中移除
        .finally(() => executing.delete(promise));

      // 将任务添加到执行集合
      executing.add(promise);
    }

    // 等待所有正在执行的任务完成
    if (executing.size > 0) {
      await Promise.all(executing);
    }

  } catch (error) {
    this.status = UploadStatus.ERROR;
    this.emit('error', error);
    throw error;
  }
}

  
  /**
 * 上传单个分片
 * 包含状态管理和进度更新
 * 
 * @param chunk 分片信息
 * @throws 上传失败时抛出错误
 */
private async uploadChunk(chunk: UploadChunk): Promise<void> {
  try {
    // 更新分片状态
    chunk.status = ChunkStatus.UPLOADING;
    this.uploadingChunks.add(chunk.index);

    // 读取分片数据
    const data = await FileHandler.readChunk(
      this.filePath,
      chunk.start,
      chunk.end
    );

    // 上传到S3
    const result = await this.s3Client.uploadPart({
      key: this.fileName,
      uploadId: this.checkpoint.uploadId,
      partNumber: chunk.index + 1,
      body: data
    });

    // 更新分片信息
    chunk.status = ChunkStatus.SUCCESS;
    chunk.etag = result.ETag;
    
    // 更新上传进度
    this.updateProgress();

  } catch (error) {
    chunk.status = ChunkStatus.ERROR;
    throw error;
  } finally {
    this.uploadingChunks.delete(chunk.index);
  }
}

  /**
   * 获取下一个待上传的分片
   */
  private getNextChunk(): UploadChunk | null {
    return this.checkpoint.chunks.find(
      chunk => chunk.status === ChunkStatus.PENDING
    );
  }


/**
 * 判断分片是否应该重试
 * 使用指数退避策略
 * 
 * @param chunk 上传失败的分片
 * @returns boolean 是否应该重试
 */
private shouldRetry(chunk: UploadChunk): boolean {
  const retries = chunk.retryCount || 0;
  
  // 超过最大重试次数
  if (retries >= this.config.retryTimes) {
    return false;
  }

  // 增加重试计数
  chunk.retryCount = retries + 1;
  
  // 使用指数退避策略计算延迟
  // 延迟时间 = min(1000 * 2^重试次数, 30s)
  const delay = Math.min(1000 * Math.pow(2, retries), 30000);
  
  // 延迟后重置状态
  setTimeout(() => {
    chunk.status = ChunkStatus.PENDING;
  }, delay);

  return true;
}


```

### 上传管理器 (UploadManager.ts)

```ts
import { EventEmitter } from 'events';
import Store from 'electron-store';
import { S3Client } from '../s3/S3Client';
import { UploadTask } from './UploadTask';
import { S3Config, CheckpointData } from './types';

/**
 * 上传管理器类
 * 负责管理所有上传任务,提供断点续传功能
 * 继承自EventEmitter以支持事件机制
 */
export class UploadManager extends EventEmitter {
  /** 存储所有上传任务的Map */
  private tasks: Map<string, UploadTask> = new Map();
  /** 用于持久化存储上传检查点 */
  private store: Store;
  /** S3客户端实例 */
  private s3Client: S3Client;

  /**
   * 构造函数
   * @param s3Config - S3配置信息
   * @param config - 上传配置
   */
  constructor(
    s3Config: S3Config,
    private config = {
      partSize: 5 * 1024 * 1024,    // 分片大小(5MB)
      maxConcurrent: 3,             // 最大并发数
      retryTimes: 3                 // 重试次数
    }
  ) {
    super();
    this.s3Client = new S3Client(s3Config);
    // 初始化持久化存储
    this.store = new Store({ name: 'upload-checkpoint' });
    // 加载已保存的检查点
    this.loadCheckpoints();
  }

  /**
   * 添加上传任务
   * @param filePath - 文件路径
   * @param fileName - 文件名
   * @returns 任务ID
   */
  addTask(filePath: string, fileName: string): string {
    const taskId = Date.now().toString();
    const task = new UploadTask(
      taskId,
      filePath,
      fileName,
      this.s3Client,
      this.config
    );

    // 保存任务
    this.tasks.set(taskId, task);
    
    // 绑定事件处理
    task.on('progress', this.handleProgress.bind(this));
    task.on('error', this.handleError.bind(this));
    task.on('complete', () => this.handleComplete(taskId));

    return taskId;
  }

  /**
   * 开始上传任务
   * @param taskId - 任务ID
   */
  startUpload(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.start();
    }
  }

  /**
   * 暂停上传任务
   * @param taskId - 任务ID
   */
  pauseUpload(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.pause();
    }
  }

  /**
   * 恢复上传任务
   * @param taskId - 任务ID
   */
  resumeUpload(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.resume();
    }
  }

  /**
   * 处理上传进度事件
   * @param progress - 进度信息
   */
  private handleProgress(progress: UploadProgress) {
    // 转发进度事件
    this.emit('progress', progress);
    // 保存检查点
    this.saveCheckpoint(progress.taskId);
  }

  /**
   * 处理错误事件
   * @param taskId - 任务ID
   * @param error - 错误信息
   */
  private handleError(taskId: string, error: Error) {
    this.emit('error', taskId, error);
  }

  /**
   * 处理上传完成事件
   * @param taskId - 任务ID
   */
  private handleComplete(taskId: string) {
    // 发送完成事件
    this.emit('complete', taskId);
    // 清理检查点
    this.clearCheckpoint(taskId);
    // 移除任务
    this.tasks.delete(taskId);
  }

  /**
   * 保存上传检查点
   * @param taskId - 任务ID
   */
  private saveCheckpoint(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      // 将检查点数据持久化存储
      this.store.set(`checkpoints.${taskId}`, task.checkpoint);
    }
  }

  /**
   * 加载保存的检查点
   * 用于恢复未完成的上传任务
   */
  private loadCheckpoints() {
    const checkpoints = this.store.get('checkpoints') as Record<string, CheckpointData>;
    if (checkpoints) {
      // 遍历所有检查点,恢复上传任务
      Object.entries(checkpoints).forEach(([taskId, checkpoint]) => {
        const task = new UploadTask(
          taskId,
          checkpoint.fileName,
          this.s3Client,
          this.config
        );
        task.checkpoint = checkpoint;
        this.tasks.set(taskId, task);
      });
    }
  }

  /**
   * 清理上传检查点
   * @param taskId - 任务ID
   */
  private clearCheckpoint(taskId: string) {
    this.store.delete(`checkpoints.${taskId}`);
  }
}



```

### 渲染进程上传组件 (Upload.tsx)

```ts
import React, { useState, useCallback, useEffect } from 'react';
import { ipcRenderer } from 'electron';

// 上传文件的状态类型
interface UploadFile {
  id: string;          // 文件唯一标识
  file: File;          // 原始文件对象
  progress: number;    // 上传进度(0-100)
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
  error?: string;      // 错误信息
}

// 上传进度事件数据类型
interface ProgressEvent {
  taskId: string;
  loaded: number;
  total: number;
  progress: number;
}

export const Upload: React.FC = () => {
  // 上传文件列表状态
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  
  // 是否正在上传标志
  const [isUploading, setIsUploading] = useState(false);

  /**
   * 组件卸载时清理事件监听
   */
  useEffect(() => {
    return () => {
      // 清理所有上传相关的事件监听
      uploadFiles.forEach(file => {
        ipcRenderer.removeAllListeners(`upload:progress:${file.id}`);
        ipcRenderer.removeAllListeners(`upload:error:${file.id}`);
        ipcRenderer.removeAllListeners(`upload:complete:${file.id}`);
      });
    };
  }, [uploadFiles]);

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // 将选择的文件转换为上传文件对象
      const newFiles: UploadFile[] = Array.from(event.target.files).map(file => ({
        id: `file_${Date.now()}_${file.name}`, // 生成唯一ID
        file,
        progress: 0,
        status: 'pending'
      }));

      setUploadFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  /**
   * 开始上传所有文件
   */
  const handleUploadAll = useCallback(async () => {
    setIsUploading(true);

    // 遍历待上传文件列表
    for (const uploadFile of uploadFiles.filter(f => f.status === 'pending')) {
      try {
        // 调用主进程的上传方法
        const taskId = await ipcRenderer.invoke('upload:start', {
          filePath: uploadFile.file.path,
          fileName: uploadFile.file.name
        });

        // 更新文件状态为上传中
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'uploading' }
              : f
          )
        );

        // 监听上传进度
        ipcRenderer.on(`upload:progress:${taskId}`, (_, data: ProgressEvent) => {
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, progress: Math.round(data.progress * 100) }
                : f
            )
          );
        });

        // 监听上传完成
        ipcRenderer.once(`upload:complete:${taskId}`, () => {
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, status: 'completed', progress: 100 }
                : f
            )
          );
        });

        // 监听上传错误
        ipcRenderer.once(`upload:error:${taskId}`, (_, error: string) => {
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, status: 'error', error }
                : f
            )
          );
        });

      } catch (error) {
        // 处理启动上传失败的情况
        setUploadFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', error: error.message }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  }, [uploadFiles]);

  /**
   * 暂停指定文件的上传
   */
  const handlePause = useCallback((fileId: string) => {
    ipcRenderer.invoke('upload:pause', fileId);
    setUploadFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'paused' }
          : f
      )
    );
  }, []);

  /**
   * 恢复指定文件的上传
   */
  const handleResume = useCallback((fileId: string) => {
    ipcRenderer.invoke('upload:resume', fileId);
    setUploadFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'uploading' }
          : f
      )
    );
  }, []);

  /**
   * 移除指定文件
   */
  const handleRemove = useCallback((fileId: string) => {
    ipcRenderer.invoke('upload:cancel', fileId);
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  /**
   * 重试上传失败的文件
   */
  const handleRetry = useCallback((fileId: string) => {
    setUploadFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'pending', progress: 0, error: undefined }
          : f
      )
    );
  }, []);

  return (
    <div className="upload-container">
      {/* 文件选择区域 */}
      <div className="upload-input">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <button 
          onClick={handleUploadAll}
          disabled={isUploading || !uploadFiles.some(f => f.status === 'pending')}
        >
          Upload All
        </button>
      </div>

      {/* 文件列表 */}
      <div className="upload-list">
        {uploadFiles.map(file => (
          <div key={file.id} className="upload-item">
            {/* 文件信息 */}
            <div className="file-info">
              <span className="file-name">{file.file.name}</span>
              <span className="file-size">
                {(file.file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>

            {/* 进度条 */}
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${file.progress}%` }}
              />
            </div>

            {/* 状态和操作按钮 */}
            <div className="actions">
              <span className="status">{file.status}</span>
              
              {file.status === 'uploading' && (
                <button onClick={() => handlePause(file.id)}>
                  Pause
                </button>
              )}

              {file.status === 'paused' && (
                <button onClick={() => handleResume(file.id)}>
                  Resume
                </button>
              )}

              {file.status === 'error' && (
                <>
                  <span className="error">{file.error}</span>
                  <button onClick={() => handleRetry(file.id)}>
                    Retry
                  </button>
                </>
              )}

              {file.status !== 'uploading' && (
                <button onClick={() => handleRemove(file.id)}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

```

