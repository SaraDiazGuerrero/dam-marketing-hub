import { getFunctions, httpsCallable } from 'firebase/functions'
import app from './firebase'

const functions = getFunctions(app, 'us-central1')
const generateShareInfoFn = httpsCallable(functions, 'generateShareInfo')

export async function generateShareInfo(asset) {
  const result = await generateShareInfoFn({
    nombre: asset.nombre,
    url: asset.url,
    tipoArchivo: asset.tipoArchivo,
    categoria: asset.categoria,
    etiquetas: asset.etiquetas || [],
  })

  return result.data
}
