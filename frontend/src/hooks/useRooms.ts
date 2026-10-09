import { useEffect, useState } from 'react'
import type { Room } from '../types/room'
import { getRooms } from '../api/rooms'

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { rooms, loading, error }
}