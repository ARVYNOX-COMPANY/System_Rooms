import { useCallback, useState } from 'react'
import {
  clearGridLayout,
  DEFAULT_GRID_LAYOUT,
  loadGridLayout,
  saveGridLayout,
  type GridLayout,
} from '../types/gridLayout'

/** Une el layout guardado con los pisos reales: agrega pisos nuevos al final, elimina los que ya no existen. */
function mergeWithFloors(layout: GridLayout, floors: number[]): GridLayout {
  const sorted = [...floors].sort((a, b) => a - b)
  if (layout.floorOrder.length === 0) {
    return { ...layout, floorOrder: sorted, hiddenFloors: layout.hiddenFloors.filter((f) => sorted.includes(f)) }
  }
  const existing = layout.floorOrder.filter((f) => sorted.includes(f))
  const missing = sorted.filter((f) => !existing.includes(f))
  return {
    ...layout,
    floorOrder: [...existing, ...missing],
    hiddenFloors: layout.hiddenFloors.filter((f) => sorted.includes(f) || existing.includes(f)),
  }
}

export function useGridLayout(allFloors: number[]) {
  const [layout, setLayout] = useState<GridLayout>(() => mergeWithFloors(loadGridLayout(), allFloors))

  const update = useCallback((patch: Partial<GridLayout>) => {
    setLayout((prev) => {
      const next = { ...prev, ...patch }
      saveGridLayout(next)
      return next
    })
  }, [])

  const syncFloors = useCallback((floors: number[]) => {
    setLayout((prev) => mergeWithFloors(prev, floors))
  }, [])

  const moveFloor = useCallback((floor: number, dir: -1 | 1) => {
    setLayout((prev) => {
      const order = [...prev.floorOrder]
      const idx = order.indexOf(floor)
      if (idx === -1) return prev
      const nextIdx = idx + dir
      if (nextIdx < 0 || nextIdx >= order.length) return prev
      ;[order[idx], order[nextIdx]] = [order[nextIdx], order[idx]]
      const next = { ...prev, floorOrder: order }
      saveGridLayout(next)
      return next
    })
  }, [])

  const toggleHide = useCallback((floor: number) => {
    setLayout((prev) => {
      const hidden = prev.hiddenFloors.includes(floor)
        ? prev.hiddenFloors.filter((f) => f !== floor)
        : [...prev.hiddenFloors, floor]
      const next = { ...prev, hiddenFloors: hidden }
      saveGridLayout(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    clearGridLayout()
    setLayout(DEFAULT_GRID_LAYOUT)
  }, [])

  return { layout, update, syncFloors, moveFloor, toggleHide, reset, setLayout }
}
