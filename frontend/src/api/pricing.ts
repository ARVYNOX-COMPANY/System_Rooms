import { apiFetch } from './client'

export type PreciosPorTipo = Record<string, number>

export async function getPreciosPorTipo(): Promise<PreciosPorTipo> {
  return apiFetch<PreciosPorTipo>('/habitaciones/precios-por-tipo/')
}