import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from './firebase'

const ASSETS_COLLECTION = 'assets'
const FIRESTORE_TIMEOUT_MS = 15000

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), ms)
    }),
  ])
}

/** Obtiene ancho y alto de una imagen antes de subirla */
function getImageDimensions(file) {
  return new Promise((resolve) => {
    if (!file.type?.startsWith('image/')) {
      resolve(null)
      return
    }

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }, 5000)

    img.onload = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(objectUrl)
      resolve({ ancho: img.width, alto: img.height })
    }

    img.onerror = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }

    img.src = objectUrl
  })
}

export async function uploadAsset({ file, nombre, descripcion, categoria, etiquetas, userId }) {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `assets/${userId}/${timestamp}_${safeName}`
  const dimensiones = await getImageDimensions(file)

  const storageRef = ref(storage, storagePath)
  await uploadBytes(storageRef, file)

  const url = await getDownloadURL(storageRef)
  const now = serverTimestamp()

  try {
    const docRef = await withTimeout(
      addDoc(collection(db, ASSETS_COLLECTION), {
        nombre,
        descripcion,
        tipoArchivo: file.type || 'application/octet-stream',
        categoria,
        etiquetas,
        url,
        storagePath,
        fechaCarga: now,
        fechaActualizacion: now,
        usuarioPropietario: userId,
        estado: 'activo',
        tamañoArchivo: file.size,
        nombreOriginal: file.name,
        dimensiones,
      }),
      FIRESTORE_TIMEOUT_MS
    )

    return { id: docRef.id, nombre, url, storagePath }
  } catch (error) {
    error.archivoEnStorage = true
    throw error
  }
}

/** Obtiene todos los activos desde Firestore, ordenados por fecha */
export async function getAssets() {
  const snapshot = await withTimeout(
    getDocs(collection(db, ASSETS_COLLECTION)),
    FIRESTORE_TIMEOUT_MS
  )

  const assets = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  return assets.sort((a, b) => {
    const dateA = a.fechaCarga?.seconds || 0
    const dateB = b.fechaCarga?.seconds || 0
    return dateB - dateA
  })
}

/** Formatea el tamaño del archivo en KB o MB */
export function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFirestoreErrorMessage(error) {
  if (error?.message === 'FIRESTORE_TIMEOUT') {
    return 'Firestore no respondió. Desactiva el bloqueador de anuncios en localhost y verifica que Firestore Database esté creada.'
  }
  if (error?.archivoEnStorage) {
    return 'El archivo se subió a Storage, pero los metadatos no se guardaron en Firestore. Revisa el bloqueador de anuncios.'
  }
  return 'No se pudo conectar con Firestore. Desactiva extensiones que bloqueen Google (uBlock, AdBlock).'
}
