# throttle

```ts
export function throttle<F extends (...args: any[]) => any>(func: F, delay: number) {
  let lastExecTime = 0
  let timeoutId: ReturnType<typeof setTimeout>

  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const currentTime = Date.now()
    const elapsed = currentTime - lastExecTime

    if (elapsed > delay) {
      lastExecTime = currentTime
      func.apply(this, args)
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        lastExecTime = currentTime
        func.apply(this, args)
      }, delay - elapsed)
    }
  }
}
```