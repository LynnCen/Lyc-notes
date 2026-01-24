
# 基于AWS和Node流式大文件下载

## 1 基本概念

**流式传输定义：将数据分成小块连续传输的过程，无需等待整个文件加载完成。**

优势：
1. 减少内存占用
2. 提供实时数据处理
3. 支持大文件传输

```ts
// Web Streams API示例
interface StreamExample {
  // 可读流：用于从数据源读取数据
  readable: ReadableStream;
  // 可写流：用于写入数据到目标
  writable: WritableStream;
  // 转换流：用于数据处理和转换
  transform: TransformStream;
}
```
## 2 实现架构

**架构图**
![alt text](../img/streamDownload.png)

**实现流程图**
![alt text](../img/streamflow.png)

## 3 背压控制

> node中pipe自带背压控制机制

---
**什么是背压？**

背压是在数据流传输过程中，当下游消费数据的速度慢于上游生产数据的速度时，为了防止内存溢出而采取的一种流量控制机制。

**为什么要背压控制**

1. 防止内存溢出

 - 没有背压控制时，数据会不断累积在内存中
 - 最终可能导致程序崩溃

2. 保证数据处理质量

 - 确保下游有足够时间处理数据
 - 避免数据丢失或处理错误

3. 系统稳定性

 - 合理利用系统资源
 - 防止系统过载

## 3 实现步骤

---

### 下载器S3StreamDownloader

```ts
/**
 * AWS文件流式下载管理器
 * 实现文件从S3流式下载到本地的完整流程
 * 
 * 功能:
 * 1. 从AWS S3下载文件
 * 2. 支持流式传输
 * 3. 临时文件管理
 * 4. 错误处理和清理
 */
import { S3 } from 'aws-sdk';
import { createWriteStream } from 'fs'
import { mkdir, rename,unlink } from 'fs/promises';
import { join } from 'path';
import { pipeline } from 'stream/promises';

class S3StreamDownloader extends EventEmitter {
  /** AWS S3客户端实例 */
  private readonly s3: S3;
  /** 临时文件存储目录 */
  private readonly tempDir: string;
  /** 目标文件存储目录 */
  private readonly targetDir: string;

  private downloadedBytes: number = 0;
  /**
   * 初始化下载管理器
   * @param config 配置对象
   * @param config.accessKeyId AWS访问密钥ID
   * @param config.secretAccessKey AWS秘密访问密钥
   * @param config.region AWS区域
   * @param config.tempDir 临时文件目录路径
   * @param config.targetDir 目标文件目录路径
   */
  constructor(config: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    tempDir: string;
    targetDir: string;
  }) {
    super(); // 初始化EventEmitter
    // 初始化AWS S3客户端
    this.s3 = new S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,  
      region: config.region
    });

    this.tempDir = config.tempDir;
    this.targetDir = config.targetDir;
  }

  /**
   * 流式下载文件
   * 从S3下载文件并保存到本地
   * 
   * @param bucket S3桶名
   * @param key 文件键值(S3中的文件路径)
   * @param filename 下载后的目标文件名
   * @returns 成功时返回目标文件路径,失败时抛出错误
   * 
   * 执行流程:
   * 1. 创建临时目录
   * 2. 建立S3读取流
   * 3. 创建本地写入流
   * 4. 通过管道传输数据
   * 5. 移动文件到最终位置
   */
  async downloadFile(bucket: string, key: string, filename: string): Promise<void> {
      // 确保临时目录存在
      await mkdir(this.tempDir, { recursive: true });
      
      // 生成临时文件路径
      const tempFilePath = join(this.tempDir, `${filename}.temp`);
      // 生成最终文件路径 
      const targetFilePath = join(this.targetDir, filename);
    try {
      // 重置下载计数
      this.downloadedBytes = 0;

      // 获取文件大小用于进度计算
      const { ContentLength } = await this.s3.headObject({
        Bucket: bucket,
        Key: key
      }).promise();

      // 触发开始事件
      this.emit('start', { 
        filename,
        totalBytes: ContentLength 
      });

      // 获取S3文件流
      const s3Stream = this.s3.getObject({
        Bucket: bucket,
        Key: key
      }).createReadStream();

      // 创建写入流
      const writeStream = createWriteStream(tempFilePath);

      // 使用pipeline处理流传输
      await pipeline(
        s3Stream,
        this.createTransformStream(), // 可选的转换流
        writeStream
      );

      // 文件下载完成后，移动到目标位置
      await rename(tempFilePath, targetFilePath);

      // 下载完成事件
      this.emit('complete', {
        filename,
        totalBytes: this.downloadedBytes
      });
    } catch (error) {
      // 清理临时文件
      await this.cleanup(tempFilePath);
      // 触发错误事件
      this.emit('error', error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * 创建转换流
   * 用于处理下载进度、速率限制等
   * 
   * 功能:
   * 1. 统计下载字节数
   * 2. 触发进度事件
   * 3. 可扩展实现速率限制
   * 
   * @returns Transform流实例
   */
  private createTransformStream() {
    const { Transform } = require('stream');
    const self = this; // 保存外层this引用
    return new Transform({
      transform(chunk: Buffer, encoding: string, callback: Function) {
        // 更新已下载字节数
        self.downloadedBytes += chunk.length;
        
        // 通过外层实例触发事件
        self.emit('progress', {
          downloadedBytes: self.downloadedBytes,
          chunk: chunk.length
        });

        callback(null, chunk);
      }
    });
  }

  /**
   * 清理临时文件
   * 用于错误发生时清理未完成的临时文件
   * 
   * @param tempFilePath 临时文件路径
   */
  private async cleanup(tempFilePath: string): Promise<void> {
    try {
      await unlink(tempFilePath);
    } catch (error) {
      console.error(`Cleanup failed: ${error.message}`);
    }
  }

  /**
   * 可扩展的其他方法:
   * 
   * 1. pauseDownload(): 暂停下载
   *    - 暂停流传输
   *    - 保存下载状态
   * 
   * 2. resumeDownload(): 恢复下载
   *    - 读取暂停状态
   *    - 继续流传输
   * 
   * 3. cancelDownload(): 取消下载
   *    - 终止流传输
   *    - 清理临时文件
   * 
   * 4. getProgress(): 获取下载进度
   *    - 返回下载百分比
   *    - 返回传输速率
   * 
   * 5. validateFile(): 验证文件完整性
   *    - 校验文件大小
   *    - 验证文件哈希
   */
}

/**
 * 使用示例:
 * 
 * const downloader = new S3StreamDownloader({
 *   accessKeyId: 'your-access-key',
 *   secretAccessKey: 'your-secret-key',
 *   region: 'us-east-1',
 *   tempDir: '/tmp/downloads',
 *   targetDir: '/data/files'
 * });
 * 
 * try {
 *   await downloader.downloadFile(
 *     'my-bucket',
 *     'path/to/file.zip',
 *     'downloaded-file.zip'
 *   );
 *   console.log('Download completed successfully');
 * } catch (error) {
 *   console.error('Download failed:', error);
 * }
 */


```

### 背压控制转换流createTransformStream

```ts
/**
 * 创建转换流
 * 用于处理下载进度、速率限制等
 * 
 * 功能:
 * 1. 统计下载字节数
 * 2. 触发进度事件
 * 3. 背压控制
 * 4. 速率限制
 * 
 * @returns Transform流实例
 */
private createTransformStream() {
  const { Transform } = require('stream');
  const self = this;

  // 配置参数
  const CHUNK_SIZE = 64 * 1024; // 64KB 块大小
  const HIGH_WATER_MARK = 1024 * 1024; // 1MB 高水位线
  const RATE_LIMIT = 10 * 1024 * 1024; // 10MB/s 速率限制
  
  let lastTime = Date.now();
  let bytesThisSecond = 0;

  return new Transform({
    // 设置高水位线，用于背压控制
    highWaterMark: HIGH_WATER_MARK,

    transform(chunk: Buffer, encoding: string, callback: Function) {
      try {
        // 速率限制检查
        const now = Date.now();
        const timeDiff = now - lastTime;
        
        if (timeDiff >= 1000) {
          // 重置计数器
          bytesThisSecond = 0;
          lastTime = now;
        }

        bytesThisSecond += chunk.length;
        const currentRate = bytesThisSecond * (1000 / timeDiff);

        if (currentRate > RATE_LIMIT) {
          // 如果超过速率限制，延迟处理
          const delay = Math.ceil((bytesThisSecond / RATE_LIMIT) * 1000 - timeDiff);
          setTimeout(() => {
            this.processChunk(chunk, callback);
          }, delay);
          return;
        }

        this.processChunk(chunk, callback);
      } catch (error) {
        callback(error);
      }
    },

    // 自定义方法处理数据块
    processChunk(chunk: Buffer, callback: Function) {
      // 更新下载进度
      self.downloadedBytes += chunk.length;

      // 计算下载速度
      const now = Date.now();
      const speed = self.downloadedBytes / ((now - self.startTime) / 1000);

      // 触发进度事件
      self.emit('progress', {
        downloadedBytes: self.downloadedBytes,
        chunk: chunk.length,
        speed,
        timestamp: now
      });

      // 检查写入流的背压状态
      const canContinue = this.push(chunk);

      if (!canContinue) {
        // 如果下游背压已经触发，等待 drain 事件
        this.once('drain', () => {
          callback(null);
        });
      } else {
        // 否则直接继续处理
        callback(null);
      }
    },

    // 可选: 实现 flush 方法处理剩余数据
    flush(callback: Function) {
      // 处理任何剩余的数据
      callback();
    },

    // 可选: 实现 destroy 方法清理资源
    destroy(error: Error | null, callback: Function) {
      // 清理任何资源
      callback(error);
    }
  });
}

```

### 批量下载管理器BatchDownloader

```ts
/**
 * 批量下载管理器
 * 处理多文件并行下载
 */
class BatchDownloader {
  private readonly downloader: S3StreamDownloader;
  private readonly concurrency: number;

  constructor(config: {
    s3Config: S3Config;
    concurrency: number;
  }) {
    this.downloader = new S3StreamDownloader(config.s3Config);
    this.concurrency = config.concurrency;
  }
  /**
   * 批量下载文件
   * @param files 待下载文件列表
   */
  async downloadFiles(files: Array<{
    bucket: string;
    key: string;
    filename: string;
  }>): Promise<void> {
    // 创建下载任务
    const tasks = files.map(file => async () => {
      try {
        await this.downloader.downloadFile(
          file.bucket,
          file.key,
          file.filename
        );
      } catch (error) {
        console.error(`Failed to download ${file.filename}: ${error.message}`);
        throw error;
      }
    });

    // 并行执行下载任务
    await this.runConcurrent(tasks, this.concurrency);
  }

  /**
   * 并行执行任务
   */
  private async runConcurrent(
    tasks: Array<() => Promise<void>>,
    concurrency: number
  ): Promise<void> {
    const running = new Set<Promise<void>>();
    const results: Promise<void>[] = [];

    for (const task of tasks) {
      const promise = task();
      results.push(promise);
      running.add(promise);
      
      promise.finally(() => running.delete(promise));

      if (running.size >= concurrency) {
        await Promise.race(running);
      }
    }

    await Promise.all(results);
  }
}
```

### 进度条管理

```ts

/**
 * 进度监控示例
 */
/**
 * 下载进度监控类
 * 用于实时监控和显示文件下载的进度、速度等信息
 */
class DownloadProgress {
  /** 文件总大小(字节) */
  private totalBytes: number = 0;
  
  /** 已下载字节数 */
  private downloadedBytes: number = 0;
  
  /** 下载开始时间戳 */
  private startTime: number = Date.now();

  /**
   * 处理下载进度更新
   * @param progress 进度信息对象
   * @param progress.downloadedBytes 已下载的总字节数
   * @param progress.chunk 本次新增的字节数
   */
  onProgress(progress: { downloadedBytes: number, chunk: number }) {
    // 累加已下载字节数
    this.downloadedBytes += progress.chunk;
    
    // 计算已经过的时间(秒)
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    // 计算下载速度(字节/秒)
    const speed = this.downloadedBytes / elapsed;
    
    // 计算下载进度百分比
    const percentage = (this.downloadedBytes / this.totalBytes) * 100;

    // 输出格式化的下载信息
    console.log(`
      Downloaded: ${this.formatBytes(this.downloadedBytes)}
      Speed: ${this.formatBytes(speed)}/s  
      Progress: ${percentage.toFixed(2)}%
    `);
  }

  /**
   * 将字节数转换为可读的格式
   * @param bytes 字节数
   * @returns 格式化后的字符串，如 "1.23 MB"
   */
  private formatBytes(bytes: number): string {
    // 定义单位数组
    const units = ['B', 'KB', 'MB', 'GB'];
    
    // 初始大小为输入字节数
    let size = bytes;
    
    // 当前单位索引
    let unitIndex = 0;

    // 当数字大于1024且还有更大的单位可用时，进行单位转换
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024; // 除以1024进行单位转换
      unitIndex++; // 移动到下一个单位
    }

    // 返回格式化后的字符串，保留2位小数
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

```

## 4 使用示例

1. 基本用法
```ts
// 创建下载器实例
const downloader = new S3StreamDownloader({
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_KEY',
  region: 'us-east-1',
  tempDir: '/tmp/downloads',
  targetDir: '/data/files'
});

// 下载单个文件
await downloader.downloadFile(
  'my-bucket',
  'path/to/large-file.zip',
  'large-file.zip'
);

```

2. 批量下载

```ts
// 创建批量下载器
const batchDownloader = new BatchDownloader({
  s3Config: {
    // S3配置...
  },
  concurrency: 3
});

// 批量下载文件
await batchDownloader.downloadFiles([
  {
    bucket: 'my-bucket',
    key: 'file1.pdf',
    filename: 'file1.pdf'
  },
  {
    bucket: 'my-bucket',
    key: 'file2.pdf',
    filename: 'file2.pdf'
  }
]);

```

3. 进度监控
```ts
const progress = new DownloadProgress();
const downloader = new S3StreamDownloader({
  // 配置...
});

// 监听各类事件
downloader.on('start', (info) => {
  console.log(`Starting download: ${info.filename}`);
  console.log(`Total size: ${info.totalBytes} bytes`);
});

downloader.on('progress', (progress) => {
   progress.onProgress(progress);
  console.log(`Downloaded: ${progress.downloadedBytes} bytes`);
  console.log(`Current chunk: ${progress.chunk} bytes`);
});

downloader.on('complete', (info) => {
  console.log(`Download complete: ${info.filename}`);
  console.log(`Total downloaded: ${info.totalBytes} bytes`);
});

downloader.on('error', (error) => {
  console.error('Download failed:', error);
});


```

