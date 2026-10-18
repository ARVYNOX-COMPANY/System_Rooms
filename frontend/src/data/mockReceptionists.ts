export type MockReceptionistStatus = 'pendiente' | 'aceptado' | 'bloqueado'

export interface MockReceptionist {
  id: string
  name: string
  email: string
  age: number
  status: MockReceptionistStatus
}

/** Mock temporal hasta que exista GET /usuarios/?role=NEW en el backend. */
export const MOCK_RECEPTIONISTS: MockReceptionist[] = [
  { id: 'mock-1', name: 'Juan Pérez', email: 'juan.perez@email.com', age: 28, status: 'pendiente' },
  { id: 'mock-2', name: 'María Gómez', email: 'maria.gomez@email.com', age: 31, status: 'pendiente' },
  { id: 'mock-3', name: 'Carlos Ruiz', email: 'carlos.ruiz@email.com', age: 25, status: 'pendiente' },
  { id: 'mock-4', name: 'Ana Torres', email: 'ana.torres@email.com', age: 29, status: 'pendiente' },
  { id: 'mock-5', name: 'Luis Fernández', email: 'luis.fernandez@email.com', age: 34, status: 'pendiente' },
  { id: 'mock-6', name: 'Sofía López', email: 'sofia.lopez@email.com', age: 27, status: 'pendiente' },
]
