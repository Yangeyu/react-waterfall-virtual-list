```markdown
# VirtualWaterFall 虚拟瀑布流组件

一个高性能的虚拟化瀑布流布局组件，支持动态高度计算、滚动加载和自定义渲染，适用于图片/卡片类数据的高性能渲染场景。

## 特性
- 🚀 **虚拟滚动** - 仅渲染可视区域内的元素，超大数据量也能流畅运行
- 📐 **自适应布局** - 自动根据容器宽度计算列宽，响应式布局
- 🧮 **动态高度** - 支持同步/异步计算卡片高度
- ♾️ **无限滚动** - 滚动到底部自动触发数据加载
- 🎨 **高度定制** - 可自定义卡片样式、加载状态和渲染逻辑

## 安装
```bash
npm install @vascent/react-waterfall-virtual-list
```

## 快速开始
```tsx
import { VirtualWaterFall } from '@vascent/react-waterfall-virtual-list'

const App = () => {
  const [data, setData] = useState<BaseInfo[]>([])

  // 加载更多数据
  const loadMore = useCallback(() => {
    fetchData().then(newData => setData(prev => [...prev, ...newData]))
  }, [])

  return (
    <VirtualWaterFall
      list={data}
      columns={4}
      gap={8}
      cardClass="custom-card"
      reachBottom={loadMore}
      calcCardHeight={async (width, imgHeight, item) => {
        // 自定义高度计算逻辑
        return await calculateDynamicHeight(item)
      }}
      renderItem={({ item }) => (
        <div style={item.style}>
          <img 
            src={item.imageUrl}
            height={item.style.imageHeight}
          />
          <h3>{item.title}</h3>
        </div>
      )}
      renderLoading={() => <div>Loading...</div>}
    />
  )
}
```

## API 文档

### Props
| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|-----|
| list | `T[]` | 是 | - | 数据源数组，元素需继承 BaseInfo |
| columns | number | 否 | 5 | 瀑布流列数 |
| gap | number | 否 | 10 | 卡片间距（单位：px） |
| cardClass | string | 否 | - | 卡片容器类名 |
| reachBottom | () => void | 否 | - | 滚动到底部回调函数 |
| calcCardHeight | `(cardWidth: number, imageHeight: number, item: T) => Promise<number>` | 否 | - | 异步计算卡片高度函数 |
| renderItem | `({ item: T & { style: PositionType } }) => JSX.Element` | 否 | - | 自定义卡片渲染函数 |
| renderLoading | `() => JSX.Element \| null` | 否 | - | 自定义加载状态组件 |

### 类型定义
```ts
type BaseInfo = {
  id: string
  width: number   // 原始图片/卡片宽度
  height: number  // 原始图片/卡片高度
}

type PositionType = {
  x: number       // X轴位置
  y: number       // Y轴位置
  width: number   // 实际渲染宽度
  height: number  // 实际渲染高度
  imageHeight: number // 图片显示高度
}
```

## 注意事项
1. **数据项要求**：每个数据项必须包含 `id`, `width`, `height` 属性
2. **图片预处理**：建议预先获取图片原始尺寸，或在加载完成后触发重新布局
3. **性能优化**：大数据量时建议配合防抖使用 `reachBottom`
4. **高度计算**：当使用异步 `calcCardHeight` 时，请确保返回 Promise
5. **滚动体验**：容器需要具有明确的高度（通过外部 CSS 设置）

## 工作原理
1. **布局计算**：根据容器宽度和列数计算每列宽度
2. **位置分配**：始终将新元素添加到当前高度最小的列
3. **虚拟渲染**：通过 `IntersectionObserver` 原理仅渲染可视区域内的元素
4. **滚动优化**：自定义滚动处理实现平滑滚动体验

## 开发建议
```tsx
// 推荐的数据结构示例
interface CardData extends BaseInfo {
  imageUrl: string
  title: string
  // 其他自定义字段...
}

// 推荐的高度计算模式
const calcHeight = async (width, imgHeight, item) => {
  const textHeight = await measureTextHeight(item.description, width)
  return imgHeight + textHeight + 20 // 总高度 = 图片高度 + 文字高度 + 边距
}
```

## 许可证
MIT
```
