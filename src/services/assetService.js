import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from './firebase'

const ASSETS_COLLECTION = 'assets'

export async function uploadAsset({ file, nombre, descripcion, categoria, etiquetas, userId }) {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `assets/${userId}/${timestamp}_${safeName}`

  const storageRef = ref(storage, storagePath)
  await uploadBytes(storageRef, file)

  const url = await getDownloadURL(storageRef)

  const docRef = await addDoc(collection(db, ASSETS_COLLECTION), {
    nombre,
    descripcion,
    tipoArchivo: file.type || 'application/octet-stream',
    categoria,
    etiquetas,
    url,
    storagePath,
    fechaCarga: serverTimestamp(),
    usuarioPropietario: userId,
    estado: 'activo',
  })

  return { id: docRef.id, nombre, url, storagePath }
}
