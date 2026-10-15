import type { Vehiculo, Ajustes } from './api';
export const clp = (n: number | null | undefined) => (n || n === 0) ? '$' + Math.round(n).toLocaleString('es-CL') : 'Consultar';
export const km = (n: number | null | undefined) => (n || n === 0) ? Math.round(n).toLocaleString('es-CL') + ' km' : '—';
export const precioFinal = (v: Vehiculo) => v.precio_oferta && v.precio_oferta < v.precio ? v.precio_oferta : v.precio;
export const enOferta = (v: Vehiculo) => !!(v.precio_oferta && v.precio_oferta < v.precio);
export const waNumber = (a: Ajustes) => (a.whatsapp || '').replace(/\D/g, '');
export function waLink(a: Ajustes, texto: string) {
  const n = waNumber(a);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(texto)}` : '';
}
export const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const u = (p: string) => p.startsWith('/') && !p.startsWith('//') ? import.meta.env.BASE_URL.replace(/\/$/, '') + p : p;
export const foto = (f: any, tam: 'thumb' | 'medium' | 'large' | 'url' = 'medium') => u(f ? (f[tam] || f.large || f.url) : '/img/sin-foto.svg');
export function cuota(precio: number, piePct: number, meses: number, tasaMensualPct: number) {
  const monto = precio * (1 - piePct / 100);
  const i = tasaMensualPct / 100;
  if (!i) return monto / meses;
  return monto * i / (1 - Math.pow(1 + i, -meses));
}
