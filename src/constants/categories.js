/** Categorías iniciales para clasificar activos digitales */
export const CATEGORIES = [
  'Redes sociales',
  'Marketing',
  'Identidad visual',
  'Documentos',
  'Videos',
  'Campañas',
  'Otros',
]

/** Estados posibles de un activo (archivado / activo) */
export const ASSET_STATES = ['activo', 'archivado']

export const SUBCATEGORIES = {
  'Redes sociales': ['Instagram', 'Facebook', 'LinkedIn'],
  Marketing: ['Publicidad', 'Promociones', 'Anuncios'],
  'Identidad visual': ['Logos', 'Colores', 'Plantillas'],
  Documentos: ['Briefs', 'Guías', 'Presentaciones', 'Derechos de uso'],
  Videos: ['Promocionales', 'Tutoriales', 'Reels'],
  Campañas: ['Lanzamientos', 'Temporada', 'Producto'],
  Otros: ['Recursos temporales', 'Referencias'],
}

/** Devuelve las subcategorías de una categoría (o lista vacía) */
export function getSubcategories(categoria) {
  return SUBCATEGORIES[categoria] || []
}

export const ASSET_TYPES = ['Producto final', 'Fichero de trabajo']

export const REVISION_STATES = ['En revisión', 'Aprobado', 'Requiere corrección']

export const SCALE_1_5 = [1, 2, 3, 4, 5]

/** Prioridad de custodia: (importanciaLegal * 0.6) + (riesgoDispersionLocal * 0.4) */
export function calcularPrioridadCustodia(importanciaLegal, riesgoDispersionLocal) {
  const legal = Number(importanciaLegal) || 0
  const riesgo = Number(riesgoDispersionLocal) || 0
  return Number((legal * 0.6 + riesgo * 0.4).toFixed(2))
}
