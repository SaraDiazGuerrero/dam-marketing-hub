import { useState } from 'react'
import { CATEGORIES } from '../constants/categories'
import { getFirestoreErrorMessage, uploadAsset } from '../services/assetService'

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  categoria: CATEGORIES[0],
  etiquetasTexto: '',
}

export default function UploadForm({ user, onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [nombre, setNombre] = useState(EMPTY_FORM.nombre)
  const [descripcion, setDescripcion] = useState(EMPTY_FORM.descripcion)
  const [categoria, setCategoria] = useState(EMPTY_FORM.categoria)
  const [etiquetasTexto, setEtiquetasTexto] = useState(EMPTY_FORM.etiquetasTexto)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  function clearNotification() {
    setNotification(null)
  }

  function resetForm() {
    setFile(null)
    setNombre(EMPTY_FORM.nombre)
    setDescripcion(EMPTY_FORM.descripcion)
    setCategoria(EMPTY_FORM.categoria)
    setEtiquetasTexto(EMPTY_FORM.etiquetasTexto)
    setFileInputKey((k) => k + 1)
  }

  function handleFileChange(event) {
    const selected = event.target.files[0]
    setFile(selected)
    clearNotification()

    if (selected && !nombre) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '')
      setNombre(nameWithoutExt)
    }
  }

  function parseEtiquetas(texto) {
    return texto
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    clearNotification()

    if (!file) {
      setNotification({
        type: 'error',
        title: 'Falta el archivo',
        message: 'Selecciona un archivo antes de subir.',
      })
      return
    }

    setLoading(true)

    try {
      const result = await uploadAsset({
        file,
        nombre,
        descripcion,
        categoria,
        etiquetas: parseEtiquetas(etiquetasTexto),
        userId: user.uid,
      })

      setNotification({
        type: 'success',
        title: '¡Activo subido correctamente!',
        message: `"${result.nombre}" se guardó en el DAM.`,
        detail: `ID: ${result.id}`,
      })
      resetForm()
      onUploadSuccess?.()
    } catch (err) {
      console.error('Error al subir:', err)
      setNotification({
        type: 'error',
        title: 'Error al subir',
        message: getFirestoreErrorMessage(err),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="upload-section">
      <div className="upload-section-header">
        <h2>Subir activo digital</h2>
        <p className="upload-subtitle">
          Carga imágenes, videos o documentos y registra sus metadatos en el DAM.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {notification && (
          <div
            className={`notification notification-${notification.type} span-full`}
            role="alert"
          >
            <div className="notification-content">
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              {notification.detail && (
                <span className="notification-detail">{notification.detail}</span>
              )}
            </div>
            <button
              type="button"
              className="notification-close"
              onClick={clearNotification}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        )}

        <div className="form-grid form-grid-2">
          <label className="span-full file-input-wrapper">
            Archivo *
            <input
              key={fileInputKey}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={loading}
              required
            />
          </label>

          <label>
            Nombre *
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Banner campaña verano"
              disabled={loading}
              required
            />
          </label>

          <label>
            Categoría *
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={loading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="span-full">
            Descripción
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el uso del activo..."
              rows={3}
              disabled={loading}
            />
          </label>

          <label className="span-full">
            Etiquetas
            <input
              type="text"
              value={etiquetasTexto}
              onChange={(e) => setEtiquetasTexto(e.target.value)}
              placeholder="instagram, verano, promo (separadas por coma)"
              disabled={loading}
            />
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Subiendo...' : 'Subir activo'}
        </button>
      </form>
    </section>
  )
}
