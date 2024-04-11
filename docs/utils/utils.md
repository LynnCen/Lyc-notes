## 格式化时间

```ts
import type { Moment } from 'moment'
import moment from 'moment'
interface TimeRange {
  startTime: number
  endTime: number
}
export const DATE_TIME_FORMAT: string = 'YYYY/MM/DD HH:mm:ss'
export class TimeUtil {
  static formatTime(date: number, format: string): string {
    return moment(date).format(format)
  }

  static fromNow(date: Date): string {
    return moment(date).fromNow()
  }

  static unixToTime(unixTime: number, format: string): string {
    return moment.unix(unixTime).format(format)
  }

  static dateToRangeTimestamp(date: Moment[]): TimeRange {
    // if (!date || _.isEmpty(date)) return;
    const startTime = moment(date[0]).valueOf()
    const endTime = moment(date[1]).valueOf()
    return {
      startTime,
      endTime,
    }
    // return date ? date.valueOf() : null;
  }
}

/// 使用

{
  TimeUtil.formatTime(value, DATE_TIME_FORMAT)
}
const { startTime, endTime } = TimeUtil.dateToRangeTimestamp(time)
```

## 将 Antd 中的 UploadFile 转为本地可下载文件

```ts
import type { RcFile, UploadFile } from 'antd/lib/upload/interface'
import type { UploadProps } from 'antd'

function isFileLike(obj: any): boolean {
  return obj instanceof File || obj instanceof Blob || obj instanceof FormData
}

export const downloadLocalFile = (file: UploadFile) => {
  if (_.isEmpty(file) || !isFileLike(file.originFileObj)) return
  const reader = new FileReader()
  reader.readAsArrayBuffer(file.originFileObj)
  reader.onload = function () {
    const arrayBuffer = reader.result
    if (!arrayBuffer) return
    // 创建 URL 对象，将本地文件路径转换为可下载的地址
    const url = URL.createObjectURL(new Blob([arrayBuffer], { type: file.type }))

    // 创建下载链接
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = file.name
    document.body.appendChild(downloadLink)
    // 模拟点击下载链接
    downloadLink.click()
    // 释放 URL 对象
    URL.revokeObjectURL(url)
  }
}

// 使用

const uploadProps: UploadProps = {
  name: 'file',
  accept: TYPES.join(),
  fileList: prefileList ?? [],
  action: ossConfig ? ossConfig.host : '',
  showUploadList: {
    showDownloadIcon: true,
    downloadIcon: (file: UploadFile) => (
      <DownloadOutlined
        onClick={() => {
          downloadLocalFile(file) // 将UploadFile转为可下载文件
        }}
      />
    ),
    showRemoveIcon: true,
  },
  onChange,
  onRemove,
  data: getExtraData,
  beforeUpload,
  maxCount: 1,
  multiple: true,
}
```

## 给定一个链接生成 a 标签下载文件

```ts
export const downloadFile = (url: string, fileName?: string): boolean => {
  try {
    const dom = document.createElement('a')
    dom.href = url
    dom.setAttribute('style', 'visibility:hidden')
    document.body.appendChild(dom)
    dom.click()
    document.body.removeChild(dom)
    return true
  } catch (error) {
    console.log('downloadFile', error)
    return false
  }
  // dom.download = fileName;
}
```

## Promise.allSettled

```ts
type PromiseResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult

export const checkSettled = <T>(result: PromiseResult<T>): T | false => {
  if (result.status === 'fulfilled') return result.value
  return false
}

export function checkAllSettled<T>(promises: Promise<T>[]): Promise<T[]> {
  return Promise.allSettled(promises).then((results: PromiseResult<T>[]) => {
    const fulfilledResults = results.filter(
      (result) => result.status === 'fulfilled',
    ) as PromiseFulfilledResult<T>[]
    if (fulfilledResults.length === promises.length) {
      return fulfilledResults.map((result) => result.value)
    }
    throw new Error('Some promises were rejected')
  })
}

// 使用
const queryList = async () => {
  const [classificationListRes, shopListRes] = await Promise.allSettled([
    queryIncentiveTypeList({
      platform: Platform.TaoBao,
      tenantId: Number(tenantId),
    }),
    getShopList(),
  ])
  const classificationListVal = checkSettled(classificationListRes)
  const shopListVal = checkSettled(shopListRes)
  setState({
    classificationList: classificationListVal ? classificationListVal.value : [],
    shopList: shopListVal ? shopListVal.value : [],
  })
}
```

## 防抖

```ts
export function debounce<F extends (...args: any[]) => any>(func: F, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>

  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
```

## 节流

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

## 表格格式化

```ts
export const formateObject = <T extends Record<string, any>>(data: T, key: keyof T): string => {
  if (_.isEmpty(data)) return '-'
  if (Reflect.has(data, key)) return data[key]
  return '-'
}

export const formatString = <T>(str: T): string | T => {
  if (_.isEmpty(str)) return '-'
  return str
}
```
