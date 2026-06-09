const functions = require('firebase-functions/v1')
const { initializeApp, getApps } = require('firebase-admin/app')

if (!getApps().length) {
  initializeApp()
}

/**
 * Genera información de distribución para un activo del DAM.
 * Callable de 1ª generación — mejor compatibilidad con el SDK web.
 */
exports.generateShareInfo = functions.region('us-central1').https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debes iniciar sesión para generar enlaces.'
    )
  }

  const { nombre, url, tipoArchivo, categoria, etiquetas } = data || {}

  if (!nombre || !url) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Faltan el nombre o la URL del activo.'
    )
  }

  const normalizedTags = (etiquetas || [])
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean)

  const isImage = tipoArchivo?.startsWith('image/')
  const embedHtml = isImage
    ? `<img src="${url}" alt="${nombre}" style="max-width:100%;height:auto;" />`
    : null

  return {
    nombre,
    categoria: categoria || 'Otros',
    downloadUrl: url,
    openUrl: url,
    normalizedTags,
    embedHtml,
    shareText: `${nombre} (${categoria || 'Otros'}) — ${url}`,
    generatedAt: new Date().toISOString(),
  }
})
