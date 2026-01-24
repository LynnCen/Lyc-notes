## Function Components

These can be written as normal functions that take a props argument and return a JSX element.

```ts
// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  message: string
} /* use `interface` if exporting so that consumers can extend */

// Easiest way to declare a Function Component; return type is inferred.
const App = ({ message }: AppProps) => <div>{message}</div>

// you can choose annotate the return type so an error is raised if you accidentally return some other type
const App = ({ message }: AppProps): React.JSX.Element => <div>{message}</div>

// you can also inline the type declaration; eliminates naming the prop types, but looks repetitive
const App = ({ message }: { message: string }) => <div>{message}</div>

// Alternatively, you can use `React.FunctionComponent` (or `React.FC`), if you prefer.
// With latest React types and TypeScript 5.1. it's mostly a stylistic choice, otherwise discouraged.
const App: React.FunctionComponent<{ message: string }> = ({ message }) => <div>{message}</div>
```

## useImperativeHandle

```ts
// Countdown.tsx

// Define the handle types which will be passed to the forwardRef
export type CountdownHandle = {
  start: () => void
}

type CountdownProps = {}

const Countdown = forwardRef<CountdownHandle, CountdownProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    // start() has type inference here
    start() {
      alert('Start')
    },
  }))

  return <div>Countdown</div>
})
```

```ts
// The component uses the Countdown component

import Countdown, { CountdownHandle } from './Countdown.tsx'

function App() {
  const countdownEl = useRef<CountdownHandle>(null)

  useEffect(() => {
    if (countdownEl.current) {
      // start() has type inference here as well
      countdownEl.current.start()
    }
  }, [])

  return <Countdown ref={countdownEl} />
}
```
