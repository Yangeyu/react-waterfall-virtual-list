import { useState } from "react"
import { useEffect } from "react"

const usePageSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  function onResize() {
    setSize({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight })
  }

  useEffect(() => {
    onResize()
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
    }
  })

  return size
}


export default usePageSize

