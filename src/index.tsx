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
  columns?: number
  gap?: number
  cardClass?: string
  reachBottom?: () => void
  calcCardHeight?: (cardWidth: number, imageHeight: number, item: T) => Promise<number>
  renderItem?: (props: { item: T & { style: PositionType } }) => JSX.Element
  renderLoading?: () => JSX.Element | null
}

export function VirtualWaterFall<T extends BaseInfo>(props: WaterFallProps<T>) {
  const {
    columns = 5,
    gap = 10,
    list
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

  const calcMinColumns = () => {
    const minHeight = Math.min(...columnsHeight.current)
    const idx = columnsHeight.current.indexOf(minHeight)
    return [idx, minHeight]
  }

  const calcItemsPos = async (cardWidth: number) => {
    const result = list.map(async (item, idx) => {
      const imageHeight = item.height * cardWidth / item?.width
      const cardHeight = props.calcCardHeight
        ? await props.calcCardHeight(cardWidth, imageHeight, item)
        : imageHeight
      if (idx < columns) {
        columnsHeight.current[idx] = cardHeight + gap
        return {
          ...item,
          style: {
            x: (cardWidth + gap) * idx,
            y: 0,
            width: cardWidth,
            height: cardHeight,
            imageHeight
          }
        }
      }

      const [minColumnIdx, minHeight] = calcMinColumns()
      columnsHeight.current[minColumnIdx] += cardHeight + gap

      return {
        ...item,
        style: {
          x: (cardWidth + gap) * minColumnIdx,
          y: minHeight,
          width: cardWidth,
          height: cardHeight,
          imageHeight
        }
      }
    })
    const res = await Promise.all(result)
    return res
  }

  useEffect(() => {
    const containerWidth = containerRef.current?.clientWidth
    const cardWidth = (containerWidth! - gap * (columns - 1)) / columns
    calcItemsPos(cardWidth).then((res) => {
      setListWithPos(res)
    })
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
      const scrollSpeedFactor = 0.2; // 数值越小，滚动越慢
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
      className="w-full h-full overflow-x-hidden overflow-y-scroll"
    >
      <div
        className="w-full relative"
        style={{
          height: Math.max(...columnsHeight.current)
        }}
      >
        {
          renderList.map((item) => (
            <div
              className={`absolute ${props.cardClass}`}
              key={`${item.id}`}
              style={{
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
      { props.renderLoading && <props.renderLoading /> }
    </div>
  )
}

