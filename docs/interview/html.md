## script 标签的 async defer 的区别？

GUI 渲染线程在解析 html 文档时，如果遇到 script 标签会下载里面的内容，从而阻塞文档的解析
async defer 都可以避免阻塞文档解析，当遇到 script 标签带这种标识时，会将下载任务交给网络请求线程，从而继续解析文档。
但是下载完成之后，async 会停止解析文档，转而去执行 script 内的内容。defer 会等到整个文档解析完成再去执行 script 内的内容
