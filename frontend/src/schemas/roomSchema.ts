import { z } from 'zod'

export const createRoomSchema = z.object({
  numero: z.string().trim().min(1, 'El número es requerido').max(10, 'Máximo 10 caracteres'),
  tipo: z.enum(['SIMPLE', 'DOBLE', 'SUITE'], 'Tipo inválido'),
  piso: z.number().int('Debe ser entero').min(1, 'Mínimo piso 1').max(50, 'Máximo piso 50'),
  precio_base: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  estado: z.enum(['LIBRE', 'OCUPADA', 'SUCIA'], 'Estado inválido').default('LIBRE'),
})

export type CreateRoomInput = z.input<typeof createRoomSchema>
export type CreateRoomData = z.output<typeof createRoomSchema>
