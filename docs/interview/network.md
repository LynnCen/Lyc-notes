### 常见 http 状态码

**1xx 信息性状态码**
100 Continue: 表示客户端应继续其请求。
101 Switching Protocols: 表示服务器已经理解并接受了客户端的请求，请求者应切换到另外一种协议。

**2xx 成功状态码**
200 OK: 请求成功。常用于 GET 和 POST 请求。
201 Created: 请求已经被实现，而且有一个新的资源已经依据请求的需要而创建。
204 No Content: 服务器成功处理了请求，但不需要返回任何实体内容。

**3xx 重定向状态码**
301 Moved Permanently: 永久重定向，资源被分配了新的 URL。
302 Found: 临时重定向。不推荐使用，因为有歧义，可能会被浏览器缓存。
304 Not Modified: 资源未修改，可以使用客户端缓存的副本。

**4xx 客户端错误状态码**
400 Bad Request: 服务器无法理解客户端的请求，通常因为语法错误。
401 Unauthorized: 需要身份验证。
403 Forbidden: 服务器理解请求，但拒绝执行。
404 Not Found: 请求的资源不存在。

**5xx 服务器错误状态码**
500 Internal Server Error: 服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。
503 Service Unavailable: 服务器当前无法处理请求，一般用于临时的维护或过载状态。
