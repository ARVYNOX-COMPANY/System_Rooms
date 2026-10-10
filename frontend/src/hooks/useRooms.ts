import { useCallback, useEffect, useState } from 'react'
import type { CreateRoomData } from '../schemas/roomSchema'
import type { Room } from '../types/room'
import { createRoom, getRooms } from '../api/rooms'

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRooms(await getRooms())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addRoom = useCallback(async (input: CreateRoomData): Promise<Room> => {
    setSaving(true)
    try {
      const created = await createRoom(input)
      await load()
      return created
    } finally {
      setSaving(false)
    }
  }, [load])

  return { rooms, loading, error, saving, reload: load, addRoom }
}
