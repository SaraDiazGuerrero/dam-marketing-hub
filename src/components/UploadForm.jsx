import { useState } from 'react'
import {
  ASSET_TYPES,
  CATEGORIES,
  REVISION_STATES,
  SCALE_1_5,
  calcularPrioridadCustodia,
  getSubcategories,
} from '../constants/categories'
import { getAssetErrorMessage, uploadAsset } from '../services/assetService'
import ImageResizeTool from './ImageResizeTool'

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  categoria: CATEGORIES[0],
  etiquetasTexto: '',
  subcategoria: '',
  tipoActivo: ASSET_TYPES[0],
  copyright: '',
  usoRecomendado: '',
  procedencia: '',
  importanciaLegal: 3,
  riesgoDispersionLocal: 3,
  estadoRevision: REVISION_STATES[0],
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
  const [imageFile, setImageFile] = useState(null)

  const [subcategoria, setSubcategoria] = useState(EMPTY_FORM.subcategoria)
  const [tipoActivo, setTipoActivo] = useState(EMPTY_FORM.tipoActivo)
  const [copyright, setCopyright] = useState(EMPTY_FORM.copyright)
  const [usoRecomendado, setUsoRecomendado] = useState(EMPTY_FORM.usoRecomendado)
  const [procedencia, setProcedencia] = useState(EMPTY_FORM.procedencia)
  const [importanciaLegal, setImportanciaLegal] = useState(EMPTY_FORM.importanciaLegal)
  const [riesgoDispersionLocal, setRiesgoDispersionLocal] = useState(
    EMPTY_FORM.riesgoDispersionLocal
  )
  const [estadoRevision, setEstadoRevision] = useState(EMPTY_FORM.estadoRevision)

  const subcategoriasDisponibles = getSubcategories(categoria)
  const prioridadCustodia = calcularPrioridadCustodia(
    importanciaLegal,
    riesgoDispersionLocal
  )

  function clearNotification() {
    setNotification(null)
  }

  function resetForm() {
    setFile(null)
    setImageFile(null)
    setNombre(EMPTY_FORM.nombre)
    setDescripcion(EMPTY_FORM.descripcion)
    setCategoria(EMPTY_FORM.categoria)
    setEtiquetasTexto(EMPTY_FORM.etiquetasTexto)
    setFileInputKey((k) => k + 1)
    setSubcategoria(EMPTY_FORM.subcategoria)
    setTipoActivo(EMPTY_FORM.tipoActivo)
    setCopyright(EMPTY_FORM.copyright)
    setUsoRecomendado(EMPTY_FORM.usoRecomendado)
    setProcedencia(EMPTY_FORM.procedencia)
    setImportanciaLegal(EMPTY_FORM.importanciaLegal)
    setRiesgoDispersionLocal(EMPTY_FORM.riesgoDispersionLocal)
    setEstadoRevision(EMPTY_FORM.estadoRevision)
  }

  function handleCategoriaChange(nuevaCategoria) {
    setCategoria(nuevaCategoria)
    setSubcategoria('')
  }

  function handleFileChange(event) {
    const selected = event.target.files[0]
    setFile(selected)
    setImageFile(selected?.type?.startsWith('image/') ? selected : null)
    clearNotification()

    if (selected && !nombre) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '')
      setNombre(nameWithoutExt)
    }
  }

  function handleResizedFile(resizedFile) {
    setFile(resizedFile)
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
        subcategoria,
        tipoActivo,
        copyright,
        usoRecomendado,
        procedencia,
        importanciaLegal,
        riesgoDispersionLocal,
        prioridadCustodia,
        estadoRevision,
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
        message: getAssetErrorMessage(err),
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

          {imageFile && (
            <ImageResizeTool
              file={imageFile}
              onFileReady={handleResizedFile}
              disabled={loading}
            />
          )}

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
              onChange={(e) => handleCategoriaChange(e.target.value)}
              disabled={loading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label>
            Subcategoría
            <select
              value={subcategoria}
              onChange={(e) => setSubcategoria(e.target.value)}
              disabled={loading || subcategoriasDisponibles.length === 0}
            >
              <option value="">Sin subcategoría</option>
              {subcategoriasDisponibles.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
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

          <div className="span-full form-section-divider">
            <h3>Derechos de uso y custodia</h3>
          </div>

          <label>
            Tipo de activo
            <select
              value={tipoActivo}
              onChange={(e) => setTipoActivo(e.target.value)}
              disabled={loading}
            >
              {ASSET_TYPES.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>

          <label>
            Estado de revisión
            <select
              value={estadoRevision}
              onChange={(e) => setEstadoRevision(e.target.value)}
              disabled={loading}
            >
              {REVISION_STATES.map((estadoR) => (
                <option key={estadoR} value={estadoR}>
                  {estadoR}
                </option>
              ))}
            </select>
          </label>

          <label>
            Importancia legal (1-5)
            <select
              value={importanciaLegal}
              onChange={(e) => setImportanciaLegal(Number(e.target.value))}
              disabled={loading}
            >
              {SCALE_1_5.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label>
            Riesgo de dispersión local (1-5)
            <select
              value={riesgoDispersionLocal}
              onChange={(e) => setRiesgoDispersionLocal(Number(e.target.value))}
              disabled={loading}
            >
              {SCALE_1_5.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <div className="span-full priority-display">
            <span>Prioridad de custodia (calculada):</span>
            <strong>{prioridadCustodia}</strong>
            <small>= importancia legal × 0.6 + riesgo de dispersión × 0.4</small>
          </div>

          <label>
            Copyright
            <input
              type="text"
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              placeholder="Ej: © 2026 Agencia, uso interno"
              disabled={loading}
            />
          </label>

          <label>
            Procedencia
            <input
              type="text"
              value={procedencia}
              onChange={(e) => setProcedencia(e.target.value)}
              placeholder="Ej: Banco de imágenes, autor, cliente"
              disabled={loading}
            />
          </label>

          <label className="span-full">
            Uso recomendado
            <textarea
              value={usoRecomendado}
              onChange={(e) => setUsoRecomendado(e.target.value)}
              placeholder="Ej: Redes sociales, no usar en impresión"
              rows={2}
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
