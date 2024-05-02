# 高德地图最佳实践 

## 自定义Marker content

高德地图api传入marker content是接受一个html形式的字符串。

```ts
    const marker = new window.AMap.Marker({
      position: lnglat,
      zooms: [CircleBusinessZoom.MinZomm, 20],
      anchor: 'center',
      extData: item,
      content: `<div></div>`,
    });
```

如果想要修改样式或者传入内容呢？

```ts
const closeIcon = new window.AMap.Marker({
          map: _mapIns,
          anchor: 'top-left',
          zIndex: 999,
          content: `<div class='amapRuler'>
        <div class='disTitle'>${measureInfo.mode || '-'}距离</div>
        <div class="tipsItems" >
          <div class='itemDis'><span class="count">${distance}<span class="unit">${dis >= 1000 ? 'km' : 'm'}</span></span><span class="des">距离</span>
          </div>
          <div class="itemTime"><span class="count">${time || '-'}<span class="unit">${t > 3600 ? 'h' : 'min'}</span></span><span class="des">约耗时</span>
          </div>
        </div>
        <div class="address">
          <span class="tipsLabel">起点：</span><span style="margin-bottom:14px">${measureInfo.startAddress || '-'}</span>
          <span class="tipsLabel">终点：</span><span>${measureInfo.endAddress || '-'}</span>
        </div>
      </div>`,
          offset: new window.AMap.Pixel(160, 35)
        });
```

对于代码洁癖者来说，真的很难受！

如何传递一个JSX.Element、React.Node或者React.Component？

```ts
    const Node = <div></div>
    const marker = new window.AMap.Marker({
      position: lnglat,
      zooms: [CircleBusinessZoom.MinZomm, 20],
      anchor: 'center',
      extData: item,
      content: <Node/>,
    });
```

显而易见，这种写法是错误的，高德地图并不能解析Node为html，这是JSX语法，react内部有解析JSX的方式！

以下是最佳实践


```ts
    const Node = <div></div>
    const marker = new window.AMap.Marker({
      position: lnglat,
      zooms: [CircleBusinessZoom.MinZomm, 20],
      anchor: 'center',
      extData: item,
      content:  `<div id="${item.modelClusterId}"></div>`,
    });

    map.add(marker)

    const renderSurroundMarker = (id, item:ShopItem) => {
    const Node = <IconFont
      iconHref='iconic_mendian'
      style={{
        color: item.color,
        width: 24,
        height: 26
      }}
    />;
    ReactDOM.render(Node, document.getElementById(id));
  };
```

:warning: 必须将marker加载到地图上之后，才能renderSurroundMarker，因为此时`document.getElementById(id)`才能拿到DOm！


## 对于业务地图组件如何封装

```ts
export function useHoverMarker(map) {
  const hoverMarkerRef = useRef<any>(null);

  const createHoverMarker = (info:ShopItem) => {
    const uid:any = v4();
    if (hoverMarkerRef.current && hoverMarkerRef.current._opts.extData === info.id) return;
    if (hoverMarkerRef.current && hoverMarkerRef.current._opts.extData !== info.id)removeHoverMarker();
    const marker = new window.AMap.Marker({
      zooms: [CircleBusinessZoom.MinZomm, 20],
      anchor: 'center',
      position: new window.AMap.LngLat(+info.lng, +info.lat),
      extData: info.id,
      offset: [0, 30],
      content: `<div id=${uid}></div>`
    });
    map.add(marker); // 添加到地图
    hoverMarkerRef.current = marker;
    const Node = <div className={styles.hoverMarkerWrapper}>{info.address}</div>;
    ReactDOM.render(Node, document.getElementById(uid));

  };

  const removeHoverMarker = () => {
    if (hoverMarkerRef.current) {
      map.remove(hoverMarkerRef.current);
      hoverMarkerRef.current = null;
    }

  };

  return {
    hoverMarker: hoverMarkerRef.current,
    createHoverMarker,
    removeHoverMarker
  };
}

```

使用

```ts
  const { hoverMarker,createHoverMarker, removeHoverMarker } = useHoverMarker(mapIns);

    // 监听hover marker

  const mouseMoveMarker = debounce((info) => {
    createHoverMarker(info);
  }, 0);
  const mouseOutMarker = debounce(() => {
    removeHoverMarker();
  }, 0);

  ```

:warning: 存在一个问题，访问不到hoverMarker

在`mouseMoveMarker`中访问hoverMarker为undefined