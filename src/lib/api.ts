import demo from '../data/demo.json';

const API = (import.meta.env.WP_API || process.env.WP_API || 'https://etchegarayautos.cl/admin/wp-json/etchegaray/v1').replace(/\/$/, '');
const USAR_DEMO = String(import.meta.env.USAR_DEMO_SI_VACIO ?? process.env.USAR_DEMO_SI_VACIO ?? 'true') !== 'false';
// Solo para vista previa local: muestra los vehículos reales de WordPress y, después, los de ejemplo.
const MEZCLAR_DEMO = String(import.meta.env.MEZCLAR_DEMO ?? process.env.MEZCLAR_DEMO ?? 'false') === 'true';
const DEV = !!import.meta.env.DEV;

const decode = (s: string) => (s || '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const txt = (x: any): string => (x && typeof x === 'object' ? x.nombre ?? '' : x ?? '');
const limpiar = (v: any): Vehiculo => ({ ...v, titulo: decode(v.titulo), version: decode(v.version), modelo: decode(v.modelo), carroceria: decode(txt(v.carroceria)) });

export type Foto = { url: string; large?: string; medium?: string; thumb?: string; width?: number; height?: number; alt?: string };
export type Vehiculo = {
  id: number; slug: string; titulo: string;
  marca: { nombre: string; slug: string } | null;
  modelo: string; version: string; carroceria: string; condicion: string;
  anio: number; kilometraje: number; transmision: string; combustible: string; traccion: string;
  motor: string; color: string; puertas: number; duenos: number;
  precio: number; precio_oferta: number | null; estado_venta: string; destacado: boolean;
  garantia: string; video_url: string; descripcion: string; descripcion_html?: string;
  equipamiento: string[]; extras: string[]; documentos: string[];
  portada: Foto | null; galeria: Foto[]; demo?: boolean;
  seo?: { titulo: string; descripcion: string; frase_clave: string; relacionadas: string[]; og_titulo: string; og_descripcion: string };
};
export type Ajustes = {
  nombre: string; whatsapp: string; telefono: string; direccion: string; horario: { dia?: string; horas?: string }[] | string[];
  instagram: string; facebook: string; mapa_url: string; beneficios: any[]; vendidos_total: number;
  resenas: { nombre: string; estrellas: number; texto: string }[];
  acepta_parte_pago: boolean; acepta_consignacion: boolean;
  financiamiento: { tasa_mensual: number | null; pie_minimo: number | null; plazos: number[]; texto: string };
  turnstile_site_key: string;
};

// Correo de contacto de la automotora (completar cuando el cliente lo confirme; si está vacío no se muestra).
export const CORREO = 'contacto@etchegarayautos.cl';

// Vendedores: atienden solo por WhatsApp. El primero es el número principal del sitio (botón flotante y fichas).
export const VENDEDORES = [
  { nombre: 'Diego', whatsapp: '56956073674', visible: '+56 9 5607 3674' },
  { nombre: 'Emilio', whatsapp: '56983639127', visible: '+56 9 8363 9127' },
  { nombre: 'Camila', whatsapp: '56940438991', visible: '+56 9 4043 8991' },
];

const HORARIO_BASE = [{ dia: 'Lunes a viernes', horas: '08:30 a 19:00' }, { dia: 'Sábado', horas: '09:00 a 14:00' }];

const AJUSTES_BASE: Ajustes = {
  nombre: 'Etchegaray Autos', whatsapp: '', telefono: '', direccion: "Blanco Encalada 985, esquina O'Higgins, Temuco",
  horario: HORARIO_BASE, instagram: 'https://www.instagram.com/etchegarayautos/', facebook: '', mapa_url: 'https://maps.app.goo.gl/MsQzrGjWTHZKofny6',
  beneficios: [], vendidos_total: 0, resenas: [], acepta_parte_pago: true, acepta_consignacion: true,
  financiamiento: { tasa_mensual: 1.6, pie_minimo: 20, plazos: [12, 24, 36, 48, 60], texto: '' },
  turnstile_site_key: '',
};

async function get(path: string) {
  // El parámetro evita que una caché del servidor entregue un catálogo antiguo al compilar.
  const r = await fetch(`${API}${path}${path.includes('?') ? '&' : '?'}_=${Date.now()}`, { headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' } });
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json();
}

let cacheV: Promise<{ vehiculos: Vehiculo[]; demo: boolean }> | null = null;
export function getVehiculos() {
  if (DEV) cacheV = null;
  cacheV ??= (async () => {
    try {
      const d = await get('/catalogo');
      const list: Vehiculo[] = (d.vehiculos || []).map(limpiar);
      if (list.length && MEZCLAR_DEMO) {
        const ids = new Set(list.map((v) => v.slug));
        return { vehiculos: [...list, ...(demo.vehiculos as unknown as Vehiculo[]).filter((v) => !ids.has(v.slug))], demo: true };
      }
      if (list.length || !USAR_DEMO) return { vehiculos: list, demo: false };
    } catch (e) {
      console.warn('[api] catálogo no disponible:', (e as Error).message);
      if (!USAR_DEMO) throw e;
    }
    return { vehiculos: demo.vehiculos as unknown as Vehiculo[], demo: true };
  })();
  return cacheV;
}

let cacheA: Promise<Ajustes> | null = null;
export function getAjustes() {
  if (DEV) cacheA = null;
  cacheA ??= (async () => {
    try {
      const a = await get('/ajustes');
      return { ...AJUSTES_BASE, ...a, direccion: a.direccion && a.direccion !== 'Blanco Encalada 985, Temuco' ? a.direccion : AJUSTES_BASE.direccion,
        instagram: a.instagram || AJUSTES_BASE.instagram,
        mapa_url: 'https://maps.app.goo.gl/MsQzrGjWTHZKofny6',
        whatsapp: a.whatsapp || VENDEDORES[0].whatsapp,
        horario: Array.isArray(a.horario) && a.horario.length ? a.horario : HORARIO_BASE,
        financiamiento: { ...AJUSTES_BASE.financiamiento, ...Object.fromEntries(Object.entries(a.financiamiento || {}).filter(([, v]) => v !== null && v !== '' && !(Array.isArray(v) && !v.length))) } } as Ajustes;
    } catch (e) {
      console.warn('[api] ajustes no disponibles:', (e as Error).message);
      return { ...AJUSTES_BASE, whatsapp: VENDEDORES[0].whatsapp };
    }
  })();
  return cacheA;
}

export const PUBLIC_API = (import.meta.env.PUBLIC_WP_API || 'https://etchegarayautos.cl/admin/wp-json/etchegaray/v1').replace(/\/$/, '');
