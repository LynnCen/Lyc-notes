# 笔试题

## 并发调度器

### 题目说明

用 JS 实现一个**带并发限制的异步调度器** `Scheduler`，保证**同时运行的任务最多有 `num` 个**。完善下面代码中的 `Scheduler` 类，使得以下程序能够正确**输出**：

```js
class Scheduler {
  constructor(num) {
    // TODO
  }
  async add(promiseCreator) {
    // TODO
  }
}

const timeout = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const scheduler = new Scheduler(2);

const addTask = (time, order) => {
  const res = scheduler.add(() => timeout(time));
  res.then(() => console.log(order));
};
addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');

// 期望输出: 2 3 1 4
```

---

### 一、为什么输出是 2 3 1 4？

先理解「并发数为 2」的含义：**任意时刻最多只有 2 个任务在执行**。任务按 `add` 的调用顺序排队，但**完成顺序**由各自的延时决定。

时间线可以这样理解（时间单位：ms）：

| 时间点 | 正在执行的任务     | 发生的事           |
|--------|--------------------|--------------------|
| 0ms    | 任务1(1000)、任务2(500) | 1、2 同时开始（占满 2 个槽位） |
| 500ms  | 任务1(1000)、任务3(300) | 任务2 完成 → 输出 2，任务3 开始 |
| 800ms  | 任务1(1000)、任务4(400) | 任务3 完成 → 输出 3，任务4 开始 |
| 1000ms | 任务4(400)         | 任务1 完成 → 输出 1             |
| 1200ms | -                  | 任务4 完成 → 输出 4             |

所以**完成并打印的顺序**是：**2 → 3 → 1 → 4**。调度器要保证两件事：  
1）同时运行的不超过 2 个；  
2）`add` 返回的 Promise 在该任务**真正执行并完成**后才 resolve，这样 `.then(() => console.log(order))` 才会按完成顺序输出。

---

### 二、思路：队列 + 当前运行数

核心只有两点：

1. **并发上限**：用 `max` 表示允许同时运行的任务数，用 `running` 表示当前正在运行的任务数。  
   只有当 `running < max` 时，才能从队列里取下一个任务并执行。

2. **排队**：当 `running === max` 时，新来的任务不能立刻执行，要放进一个「待执行队列」`queue`。  
   每当有任务完成时，让 `running--`，并检查队列：若队列非空且 `running < max`，则取出队首任务执行。

所以：

- `add(promiseCreator)`：  
  - 返回一个 Promise（记为 `p`），`p` 的 resolve 要在「该任务执行完成」时调用。  
  - 若 `running < max`，则立刻执行 `promiseCreator()`，并在其 then 里 resolve `p`、并触发「完成后的调度」（running--，再取下一个）。  
  - 若 `running >= max`，则把「一段逻辑：执行 promiseCreator 并在完成后 resolve `p` 并做调度」包起来，push 进 `queue`，等之后被取出来执行。

实现上可以统一成：**总是先把「如何执行当前任务并 resolve」封装成一个函数**，若当前能执行就执行，否则 push 到队列；执行时 `running++`，完成时在 then 里 resolve、`running--`，再调用一个「从队列取下一个并执行」的函数。

---

### 三、完整实现（含注释）

```js
class Scheduler {
  constructor(num) {
    this.max = num;              // 最大并发数
    this.running = 0;            // 当前正在执行的任务数
    this.queue = [];             // 等待执行的任务队列（存的是「能启动该任务的函数」）
  }

  async add(promiseCreator) {
    // 返回一个 Promise，在「本任务真正执行并完成」时 resolve
    return new Promise((resolve) => {
      const run = () => {
        this.running++;
        promiseCreator()
          .then((value) => {
            resolve(value);      // 让 add 返回的 Promise 完成
            this.running--;
            this.runNext();      // 尝试从队列取下一个任务
          });
      };

      if (this.running < this.max) {
        run();                   // 有空位，直接执行
      } else {
        this.queue.push(run);   // 没空位，入队等待
      }
    });
  }

  runNext() {
    if (this.queue.length === 0 || this.running >= this.max) return;
    const next = this.queue.shift();
    next();
  }
}
```

要点小结：

- `add` 返回的 Promise 在**对应任务执行完成**后才 resolve，所以 `res.then(() => console.log(order))` 的打印顺序就是任务完成顺序。  
- 并发控制：只有 `running < max` 时才执行新任务，否则入队；每次任务完成时 `running--` 并调用 `runNext()` 从队列里补一个。  
- 队列里存的是「无参函数 `run」**，执行 `run()` 即启动一个任务并绑定好 resolve 与 `runNext`，逻辑清晰。

---

### 四、执行过程简述（帮助理解）

1. `addTask(1000,'1')`：`running=0 < 2`，任务1 立刻执行，`running=1`。  
2. `addTask(500,'2')`：`running=1 < 2`，任务2 立刻执行，`running=2`。  
3. `addTask(300,'3')`：`running=2`，已满，任务3 的 `run` 入队。  
4. `addTask(400,'4')`：`running=2`，任务4 的 `run` 入队。  
5. 500ms：任务2 完成 → 输出 2，`running=1`，`runNext()` 取出任务3 执行。  
6. 800ms：任务3 完成 → 输出 3，`running=1`，`runNext()` 取出任务4 执行。  
7. 1000ms：任务1 完成 → 输出 1，`running=1`，队列空，不执行新任务。  
8. 1200ms：任务4 完成 → 输出 4，`running=0`。

得到输出：`2 3 1 4`。

---

### 五、易错点与变形

- **不要把「添加顺序」和「完成顺序」混为一谈**：调度器只保证并发数，不保证完成顺序；完成顺序由各任务耗时决定。  
- **`add` 必须返回 Promise**：这样调用方才能 `res.then(...)` 在任务完成时做后续逻辑。  
- 若题目要求「同时运行最多 2 个」且 `add` 的接口不变，上面实现即可；若并发数改为 `n`，只需 `new Scheduler(n)`。

把上述思路和实现理解清楚，就掌握了「并发限制调度器」这一类笔试题的核心写法。


## Promise.all

### 是什么

`Promise.all(iterable)` 接收一个可迭代对象（通常是 Promise 数组），返回一个**新的 Promise**：

- **全部 fulfilled**：新 Promise 才 resolve，值为「所有结果的数组」，**顺序与传入顺序一致**。
- **有任意一个 reject**：新 Promise **立刻 reject**，值为第一个 reject 的 reason，其它 Promise 仍会执行完，但结果被忽略。

典型用法：并发发请求，等「全部成功」再继续；或同时执行多步异步，统一处理。

### 用法示例

```js
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3]).then((values) => {
  console.log(values); // [1, 2, 3]，顺序保证
});

// 有一个失败 → 整体进入 catch
Promise.all([
  Promise.resolve(1),
  Promise.reject(new Error('fail')),
  Promise.resolve(3),
]).then(console.log).catch((err) => console.log(err.message)); // "fail"
```

### 手写实现要点

- 传入的可以是「非 Promise 值」，要先用 `Promise.resolve(item)` 统一成 Promise。
- 用数组存结果，按**下标**写入，这样顺序自然与传入一致。
- 有一个 reject 就立刻 `reject`，但不要阻止其它 Promise 继续执行（它们已经启动了）。

```js
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!promises || typeof promises[Symbol.iterator] !== 'function') {
      return reject(new TypeError('Argument must be iterable'));
    }
    const list = [...promises];
    if (list.length === 0) return resolve([]);

    const results = new Array(list.length);
    let completed = 0;

    list.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          results[index] = value;
          completed++;
          if (completed === list.length) resolve(results);
        },
        (reason) => {
          reject(reason); // 第一次失败就整体失败，但其它 promise 仍会执行
        }
      );
    });
  });
}
```

### 注意点

- **全成功才成功**：适合「少一个都不行」的场景（如多接口都成功才渲染）。
- **失败即整体失败**：若需要「知道每个成功/失败」，用 `Promise.allSettled`。
- 空数组会**同步** resolve 为 `[]`。

---

## Promise.allSettled

### 是什么

`Promise.allSettled(iterable)` 会等**所有** Promise 都结束（不论 fulfilled 还是 rejected），返回一个数组，每一项是对象：

- **成功**：`{ status: 'fulfilled', value }`
- **失败**：`{ status: 'rejected', reason }`

不会整体 reject，适合「批量操作，每个结果都要处理」的场景。

### 与 Promise.all 对比

| 特性           | Promise.all        | Promise.allSettled     |
|----------------|--------------------|-------------------------|
| 全部成功时     | resolve(结果数组)  | resolve(状态对象数组)  |
| 有失败时       | 立刻 reject        | 仍 resolve，带每个状态 |
| 典型场景       | 全部成功才继续     | 每个都要知道成败       |

### 用法示例

```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(new Error('e')),
  Promise.resolve(3),
]).then((results) => {
  results.forEach((r) => {
    if (r.status === 'fulfilled') console.log('ok', r.value);
    else console.log('fail', r.reason.message);
  });
});
// ok 1
// fail e
// ok 3
```

### 手写实现要点

- 每个元素用 `Promise.resolve(item).then(...).catch(...)` 包一层，保证**不会把 reject 抛出去**，而是变成 `{ status: 'rejected', reason }`。
- 全部 settle 后统一 `resolve(results)`，不调用 `reject`。

```js
function myPromiseAllSettled(promises) {
  return new Promise((resolve) => {
    if (!promises || typeof promises[Symbol.iterator] !== 'function') {
      return resolve([]);
    }
    const list = [...promises];
    if (list.length === 0) return resolve([]);

    const results = new Array(list.length);
    let completed = 0;

    const done = () => {
      completed++;
      if (completed === list.length) resolve(results);
    };

    list.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          results[index] = { status: 'fulfilled', value };
          done();
        },
        (reason) => {
          results[index] = { status: 'rejected', reason };
          done();
        }
      );
    });
  });
}
```

### 小结

- **Promise.all**：全部成功才成功，有一个失败就整体失败；适合「并发且缺一不可」。
- **Promise.allSettled**：全部结束才返回，每个都有状态；适合「批量请求、部分成功也要处理」。
- 面试常考两者区别 + 手写，重点记「all 会 reject」「allSettled 从不 reject、只返回状态数组」。

