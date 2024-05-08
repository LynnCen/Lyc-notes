# 笔试题

JS实现一个带并发限制的异步调度器Scheduler，保证同时运行的任务最多有两个，完善下面代码中的Scheduler类，使得一下程序能够正确输入：

```js

class  Scheduler {
  constructor(num) {
    
  }
 async add(promiseCreator){

  }
}

const timeout = (time)=>{
  return new Promise((resolve)=>{
    setTimeout(resolve, time);
  })
}

const scheduler = new Scheduler(2);

const addTask = (time,order)=>{
  const res = scheduler.add(()=>timeout(time));
  res.then(()=> console.log(order))
}
addTask(1000,'1')
addTask(500,'2')
addTask(300,'3')
addTask(400,'4')

// output 2 3 1 4

```


实现

```js

class Scheduler {
  maxConcurrency=0;
  currentlyRunning=0;
  queue=[]
  constructor(maxConcurrency = 2) {
    this.maxConcurrency = maxConcurrency; // 最大并发数
    this.currentlyRunning = 0; // 当前正在运行的任务数
    this.queue = []; // 任务队列
  }

  async add(task) {
    // 将任务推入队列
    return new Promise((resolve) => {
      this.queue.push(async () => {
        // 使用立即执行函数包装任务
        try {
          const result = await task();
          resolve(result); // 任务完成后解析结果
        } catch (error) {
          resolve(Promise.reject(error)); // 任务出错后拒绝结果
        } finally {
          this.currentlyRunning--; // 任务完成，减少运行的任务数
          this.runNext(); // 继续执行下一个任务
        }
      });
      if (this.currentlyRunning < this.maxConcurrency) {
        this.runNext(); // 开始执行任务
      }
    });
  }

  async runNext() {
    // 如果有空闲的并发量且队列不为空
    while (this.currentlyRunning < this.maxConcurrency && this.queue.length > 0) {
      const task = this.queue.shift(); // 从队列中取出下一个任务
      this.currentlyRunning++; // 增加正在运行的任务数
      task(); // 执行任务
    }
  }
}
const scheduler = new Scheduler(2);
const timeout = (time)=>{
  return new Promise((resolve)=>{
    setTimeout(resolve, time);
  })
}
const addTask = (time,order)=>{
  const res = scheduler.add(()=>timeout(time));
  res.then(()=> console.log(order))
}
addTask(1000,'1')
addTask(500,'2')
addTask(300,'3')
addTask(400,'4')
```