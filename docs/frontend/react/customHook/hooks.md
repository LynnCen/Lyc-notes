## usePreviouseValue

```ts
import { useRef } from 'react'

type ShouldUpdateFunc<T> = (prev: T | undefined, next: T) => boolean

const defalutShouldUpdate = <T>(prev?: T, next?: T) => prev !== next

function usePrevious<T>(
  state: T,
  shouldUpdateFun: ShouldUpdateFunc<T> = defalutShouldUpdate,
): T | undefined {
  const prev = useRef<T>()
  const cur = useRef<T>()

  if (shouldUpdateFun(cur.current, state)) {
    prev.current = cur.current
    cur.current = state
  }
  return prev.current
}

export default usePrevious
```

## useSetState

```ts
import { isFunction } from '@/utils/utils'
import { useCallback, useState, useEffect, useRef } from 'react'

type ISetState<U> = U | ((...args: any[]) => U)
type ReturnStateMethods<U> = Partial<U> | ((state: U) => Partial<U>)

type ReturnSetStateFn<T> = (state: ReturnStateMethods<T>, cb?: (...args: any[]) => void) => void

/**
 * 模拟class组件的setState方法
 * @param {ISetState<T>} initObj
 * @returns {[T, ((state: ReturnStateMethods<T>) => void)]}
 */
export default function useSetState<T extends object>(
  initObj: ISetState<T>,
): [T, ReturnSetStateFn<T>] {
  const [state, setState] = useState<T>(initObj)
  const executeCb = useRef<(...args: any[]) => void>()
  const newSetState = useCallback<ReturnSetStateFn<T>>((state, cb) => {
    let newState = state
    setState((prevState: T) => {
      executeCb.current = cb
      if (isFunction(state) && typeof state === 'function') {
        newState = state(prevState)
      }
      return { ...prevState, ...newState }
    })
  }, [])
  useEffect(() => {
    const { current: cb } = executeCb
    if (typeof cb === 'function') isFunction(cb) && cb()
  }, [executeCb.current])
  return [state, newSetState]
}
```

## useInterval

```typescript
import { useEffect, useRef } from 'react'

type Callback = () => void

const useInterval = (callback: Callback, delay: number | null) => {
  const savedCallback = useRef<Callback>(() => {})

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const tick = () => {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)

      return () => {
        console.log('id', id)

        clearInterval(id)
      }
    }
  }, [delay])
}

export default useInterval

useInterval(
  () => {
    queryRecordMsg()
  },
  isDone ? null : 500,
)
useEffect(() => {
  setTimeout(() => {
    if (data.status !== SSEMStatus.End) {
      setIsDone(true)
    }
  }, 1000 * 60)
}, [])
```

# useIsFirstRender

```ts
import { useRef, useEffect } from 'react'

function useIsFirstRender(): boolean {
  const isFirstRenderRef = useRef<boolean>(true)

  useEffect(() => {
    isFirstRenderRef.current = false
  }, [])

  return isFirstRenderRef.current
}

export default useIsFirstRender
```

# useAsync

```ts
import { useState, useEffect, useCallback } from 'react'
import useSetState from './useSetState'
import { isFunction } from '@/utils/util'

export function isFunction<T>(value: T): boolean {
  return typeof value === 'function'
}

interface AsyncState<T> {
  loading: boolean
  data?: T
  isError: boolean
  error?: Error
}
type Args = any[]
type AsyncFunction<T, A extends Args> = A['length'] extends 0
  ? () => Promise<T>
  : (...args: A) => Promise<T>
type TriggerPromiseReturn<T> = (...args: Args) => Promise<T | void>
type ExtendType<T, E extends Record<string, any>> = T & E
const initState = {
  loading: false,
  data: undefined,
  error: undefined,
  isError: false,
}
function useAsync<T, A extends Args>(
  asyncFunction: AsyncFunction<T, A> | T,
  initialState?: T,
  immediate = false,
): ExtendType<AsyncState<T>, Record<'trigger', TriggerPromiseReturn<T>>> {
  const [state, setState] = useSetState<AsyncState<T>>({
    ...initState,
    data: initialState,
  })

  const trigger = useCallback<TriggerPromiseReturn<T>>(
    async (...args: A) => {
      setState({ ...initState, loading: true })
      // 兼容数据预加载
      return (
        isFunction(asyncFunction)
          ? (asyncFunction as AsyncFunction<T, A>)(...args)
          : Promise.resolve(asyncFunction as T)
      )
        .then((response: T) => {
          setState({ data: response })
          return response
        })
        .catch((error: Error) => {
          setState({ error: error, isError: true })
        })
        .finally(() => {
          setState({
            loading: false,
          })
        })
    },
    [asyncFunction],
  )

  // 在组件加载时立即执行（如果 immediate 为 true）
  useEffect(() => {
    if (immediate) {
      ;(trigger as () => Promise<T>)()
    }
  }, [trigger, immediate])

  return { ...state, trigger }
}
export default useAsync
```
