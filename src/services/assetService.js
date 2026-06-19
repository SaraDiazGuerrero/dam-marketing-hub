import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
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

export async function uploadAsset({
  file,
  nombre,
  descripcion,
  categoria,
  etiquetas,
  userId,
  subcategoria = '',
  tipoActivo = 'Producto final',
  copyright = '',
  usoRecomendado = '',
  procedencia = '',
  importanciaLegal = 3,
  riesgoDispersionLocal = 3,
  prioridadCustodia = 0,
  estadoRevision = 'En revisión',
}) {
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
        subcategoria,
        tipoActivo,
        copyright,
        usoRecomendado,
        procedencia,
        importanciaLegal: Number(importanciaLegal),
        riesgoDispersionLocal: Number(riesgoDispersionLocal),
        prioridadCustodia: Number(prioridadCustodia),
        estadoRevision,
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


export async function updateAsset(
  id,
  {
    nombre,
    descripcion,
    categoria,
    etiquetas,
    subcategoria,
    tipoActivo,
    copyright,
    usoRecomendado,
    procedencia,
    importanciaLegal,
    riesgoDispersionLocal,
    prioridadCustodia,
    estadoRevision,
  }
) {
  await updateDoc(doc(db, ASSETS_COLLECTION, id), {
    nombre,
    descripcion,
    categoria,
    etiquetas,
    subcategoria: subcategoria ?? '',
    tipoActivo: tipoActivo ?? 'Producto final',
    copyright: copyright ?? '',
    usoRecomendado: usoRecomendado ?? '',
    procedencia: procedencia ?? '',
    importanciaLegal: Number(importanciaLegal) || 0,
    riesgoDispersionLocal: Number(riesgoDispersionLocal) || 0,
    prioridadCustodia: Number(prioridadCustodia) || 0,
    estadoRevision: estadoRevision ?? 'En revisión',
    fechaActualizacion: serverTimestamp(),
  })
}


export async function archiveAsset(id) {
  await updateDoc(doc(db, ASSETS_COLLECTION, id), {
    estado: 'archivado',
    fechaActualizacion: serverTimestamp(),
  })
}

export async function deleteAsset(id, storagePath) {
  if (storagePath) {
    await deleteObject(ref(storage, storagePath))
  }
  await deleteDoc(doc(db, ASSETS_COLLECTION, id))
}

/** Formatea el tamaño del archivo en KB o MB */
export function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getAssetErrorMessage(error) {
  if (error?.message === 'FIRESTORE_TIMEOUT') {
    return 'No se pudo completar la operación. Intenta de nuevo.'
  }
  if (error?.archivoEnStorage) {
    return 'No se pudo completar la subida. Intenta de nuevo.'
  }
  return 'Ocurrió un error. Intenta de nuevo.'
}
