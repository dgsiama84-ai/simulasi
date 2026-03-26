import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRp(n: number) {
  return 'Rp ' + Math.abs(n).toLocaleString('id-ID')
}
