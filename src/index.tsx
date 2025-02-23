import usePageSize from "./hooks/usePageSize"
import { useEffect, useMemo, useRef, useState } from "react"

export type PositionType = {
  x: number
  y: number
  width: number
  height: number
  imageHeight: number
}

export type BaseInfo = {
  id: string
  width: number
  height: number
}
export type WaterFallProps<T> = {
  list: T[]
  // 设置列数
  columns?: number
  // 设置间距(px)
  gap?: number
  // 设置滚动速度
  scrollSpeedFactor?: number
  style?: React.CSSProperties
  cardClass?: string
  // 滚动到底部触发回调
  reachBottom?: () => void
  // 自定义计算卡片高度
  calcCardHeight?: (cardWidth: number, imageHeight: number, item: T) => Promise<number>
  // 自定义 卡片Item 组件
  renderItem?: (props: { item: T & { style: PositionType } }) => JSX.Element
  // 自定义 loading 组件
  renderLoading?: () => JSX.Element | null
}

export function VirtualWaterFall<T extends BaseInfo>(props: WaterFallProps<T>) {
  const {
    columns = 5,
    gap = 10,
    scrollSpeedFactor = 0.3,
    list,
  } = props

  const containerRef = useRef<HTMLDivElement>()
  const [listWithPos, setListWithPos] = useState<(T & { style: PositionType })[]>([])

  const pageSize = usePageSize()
  const [scrollState, setScrollState] = useState({
    viewWidth: 0,
    viewHeight: 0,
  })
  const [top, setTop] = useState(0)
  const columnsHeight = useRef<number[]>(Array.from({ length: columns }, () => 0))
  const renderList = useMemo(() => {
    if (listWithPos.length === 0) return []

    return listWithPos.filter((item) => {
      return item.style.y + item.style.height >= top &&
        item.style.y < top + scrollState.viewHeight
    })
  }, [listWithPos, top])

  // 计算最小列的索引和高度
  const calcMinColumns = () => {
    const minHeight = Math.min(...columnsHeight.current)
    const idx = columnsHeight.current.indexOf(minHeight)
    return [idx, minHeight]
  }

  // 计算每个项目的位置
  const calcItemsPos = async (cardWidth: number) => {
    if (!list?.length) return []

    // 初始化列高数组，每列的初始高度为0
    columnsHeight.current = Array.from({ length: columns }, () => 0)
    const result: (T & { style: PositionType })[] = []
    for (const item of list) {
      const imageHeight = item.height * cardWidth / item?.width
      const cardHeight = props.calcCardHeight
        ? await props.calcCardHeight(cardWidth, imageHeight, item)
        : imageHeight
      // 找到最小列的索引和高度
      const [minColumnIdx, minHeight] = calcMinColumns()

      // 更新最小列的高度
      columnsHeight.current[minColumnIdx] += cardHeight + gap
      const style = {
        x: (cardWidth + gap) * minColumnIdx,
        y: minHeight,
        width: cardWidth,
        height: cardHeight,
        imageHeight
      }
      result.push({ ...item, style })
    }
    
    return result
  }

  useEffect(() => {
    const containerWidth = containerRef.current?.clientWidth
    const cardWidth = (containerWidth! - gap * (columns - 1)) / columns
    calcItemsPos(cardWidth).then((res) => { setListWithPos(res) })
  },
    [list, pageSize]
  )

  useEffect(() => {
    if (top === 0) return
    if (top + scrollState.viewHeight >= Math.max(...columnsHeight.current)) {
      props.reachBottom?.()
    }
  }, [top])

  useEffect(() => {
    const handleScroll = ((ev: WheelEvent) => {
      ev.preventDefault()
      // 获取滚动距离（可以根据需要调整缩放比例）
      const scrollDelta = ev.deltaY * scrollSpeedFactor;

      // 使用 scrollBy 方法实现自定义滚动
      containerRef.current?.scrollBy({
        top: scrollDelta,
        left: 0,
      });
      const { scrollTop } = containerRef.current!

      setTop(scrollTop)
    })

    const { clientWidth, clientHeight } = containerRef.current!
    setScrollState({ ...scrollState, viewWidth: clientWidth, viewHeight: clientHeight })

    containerRef.current?.addEventListener("wheel", handleScroll, { passive: false })
    return () => {
      containerRef.current?.removeEventListener("wheel", handleScroll)
    }
  }, [])

  return (
    <div
      ref={containerRef as any}
      style={{
        position: "relative",
        width: '100%',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'scroll',
        ...props.style
      }}
    >
      <div
        style={{
          width: '100%',
          height: Math.max(...columnsHeight.current)
        }}
      >
        {
          renderList.map((item) => (
            <div
              className={`${props.cardClass}`}
              key={`${item.id}`}
              style={{
                position: "absolute",
                width: `${item.style.width}px`,
                height: `${item.style.height}px`,
                transform: `translate3d(${item.style.x}px, ${item.style.y}px, 0)`,
              }}
            >
              {props.renderItem && props.renderItem({ item })}
            </div>
          ))
        }
      </div>
      {props.renderLoading && <props.renderLoading />}
    </div>
  )
}

