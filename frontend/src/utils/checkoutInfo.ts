// export interface CheckoutInfo {
//   guestName: string
//   documentId: string
//   checkInDate: string 
//   checkOutDate: string 
// }

// const keyFor = (roomNumber: string) => `checkout-info-${roomNumber.trim()}`

// export function saveCheckoutInfo(roomNumber: string, info: CheckoutInfo): void {
//   try {
//     localStorage.setItem(keyFor(roomNumber), JSON.stringify(info))
//   } catch {
//     // storage lleno o bloqueado: el check-in sigue funcionando igual
//   }
// }

// export function getCheckoutInfo(roomNumber: string): CheckoutInfo | null {
//   try {
//     const raw = localStorage.getItem(keyFor(roomNumber))
//     if (!raw) return null
//     const parsed = JSON.parse(raw) as Partial<CheckoutInfo>
//     if (!parsed.guestName || !parsed.checkOutDate) return null
//     return {
//       guestName: parsed.guestName,
//       documentId: parsed.documentId ?? '',
//       checkInDate: parsed.checkInDate ?? '',
//       checkOutDate: parsed.checkOutDate,
//     }
//   } catch {
//     return null
//   }
// }

// export function clearCheckoutInfo(roomNumber: string): void {
//   try {
//     localStorage.removeItem(keyFor(roomNumber))
//   } catch {
//     // ignorar
//   }
// }

// export function nightsBetween(fromISO: string, toISO: string): number {
//   if (!fromISO || !toISO) return 0
//   const diff = Math.ceil(
//     (new Date(toISO).getTime() - new Date(fromISO).getTime()) / (1000 * 60 * 60 * 24),
//   )
//   return Math.max(0, diff)
// }
