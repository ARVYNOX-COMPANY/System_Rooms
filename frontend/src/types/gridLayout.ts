export interface GridLayout {
  floorOrder: number[]
  hiddenFloors: number[]
  hiddenRooms: string[]        // ← ids (números de habitación) ocultas
  columns: 4 | 5 | 6
}

export const DEFAULT_GRID_LAYOUT: GridLayout = {
  floorOrder: [],
  hiddenFloors: [],
  hiddenRooms: [],
  columns: 6,
}

const STORAGE_KEY = 'room-grid-layout'

export function loadGridLayout(): GridLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_GRID_LAYOUT
    const parsed = JSON.parse(raw) as Partial<GridLayout>
    return {
      floorOrder: Array.isArray(parsed.floorOrder)
        ? parsed.floorOrder.filter((n) => typeof n === 'number')
        : [],
      hiddenFloors: Array.isArray(parsed.hiddenFloors)
        ? parsed.hiddenFloors.filter((n) => typeof n === 'number')
        : [],
      hiddenRooms: Array.isArray(parsed.hiddenRooms)
        ? parsed.hiddenRooms.filter((s) => typeof s === 'string')
        : [],
      columns:
        parsed.columns === 4 || parsed.columns === 5 || parsed.columns === 6
          ? parsed.columns
          : 6,
    }
  } catch {
    return DEFAULT_GRID_LAYOUT
  }
}

export function saveGridLayout(layout: GridLayout): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
}

export function clearGridLayout(): void {
  localStorage.removeItem(STORAGE_KEY)
}