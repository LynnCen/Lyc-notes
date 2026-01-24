# React 实践

## 如何销毁和重建组件

业务背景： `gData`和`checkedKeys`每次变化的时候，`V2Table`每次就销毁和重建

```ts
 const UpdateTable = useMemo<ReactNode>(() => {
    const column:Columns = gData.map((item) => {
      if (checkedKeys.includes(item.code)) {
        return ({
          key: item.code,
          title: item.title
        });
      }
      return undefined;
    }).filter(Boolean) as Columns || [];

    return isNotEmptyAny(column) ? <V2Table
      rowKey='code'
      defaultColumns={column}
      hideColumnPlaceholder
      onFetch={() => {
        return { datasource: [] };
      }}
      emptyRender={true}
      pagination={false}
    /> : <div style={{ width: '100%', height: '100%' }}>
      <V2Empty centerInBlock customTip={'请选择'}/>
    </div>;
  }, [gData, checkedKeys]);
  ```

  最佳实践：
  ```ts
    const keyRef = useRef<number>(0);
   const UpdateTable = useMemo<ReactNode>(() => {
    const column:Columns = gData.map((item) => {
      if (checkedKeys.includes(item.code)) {
        return ({
          key: item.code,
          title: item.title
        });
      }
      return undefined;
    }).filter(Boolean) as Columns || [];

    // 因为defaultColumns仅作为初始值传入，defaultColumns改变之后 并不会触发tablere-rendercolumn
    // 故需 销毁和重建V2Table 在进行diff对比时，前后的key不一致，会被打上销毁的flag，然后重建V2Table
    keyRef.current++;
    return isNotEmptyAny(column) ? <V2Table
      key={keyRef.current}
      rowKey='code'
      defaultColumns={column}
      hideColumnPlaceholder
      onFetch={() => {
        return { datasource: [] };
      }}
      emptyRender={true}
      pagination={false}
    /> : <div style={{ width: '100%', height: '100%' }}>
      <V2Empty centerInBlock customTip={'请选择'}/>
    </div>;
  }, [gData, checkedKeys]);

  ```