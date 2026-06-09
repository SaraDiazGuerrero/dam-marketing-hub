import { useEffect, useState } from 'react'
import { formatFileSize } from '../services/assetService'

const PRESETS = [
  { label: 'Miniatura (400 px de ancho)', width: 400 },
  { label: 'Redes sociales (1080 px)', width: 1080 },
  { label: 'Web / banner (1200 px)', width: 1200 },
  { label: 'Alta resolución (1920 px)', width: 1920 },
]

export function resizeImage(file, maxWidth) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let width = img.width
      let height = img.height

      if (maxWidth && width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('No se pudo redimensionar la imagen'))
            return
          }

          const resizedFile = new File([blob], file.name, {
            type: file.type || 'image/jpeg',
            lastModified: Date.now(),
          })

          resolve({
            file: resizedFile,
            dimensiones: { ancho: width, alto: height },
          })
        },
        file.type || 'image/jpeg',
        0.92
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No se pudo cargar la imagen'))
    }

    img.src = objectUrl
  })
}

export default function ImageResizeTool({ file, onFileReady, disabled }) {
  const [previewUrl, setPreviewUrl] = useState('')
  const [originalSize, setOriginalSize] = useState(null)
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[1].width)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!file) return undefined

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setResult(null)
    setError('')

    const img = new Image()
    img.onload = () => {
      setOriginalSize({
        ancho: img.width,
        alto: img.height,
        bytes: file.size,
      })
    }
    img.src = url

    return () => URL.revokeObjectURL(url)
  }, [file])

  async function handleResize() {
    setLoading(true)
    setError('')

    try {
      const resized = await resizeImage(file, selectedPreset)
      setResult(resized)
      onFileReady?.(resized.file)
    } catch (err) {
      console.error('Error al redimensionar:', err)
      setError('No se pudo redimensionar la imagen.')
      onFileReady?.(file)
    } finally {
      setLoading(false)
    }
  }

  function handleUseOriginal() {
    setResult(null)
    setError('')
    onFileReady?.(file)
  }

  if (!file || !originalSize) return null

  const needsResize = originalSize.ancho > selectedPreset

  return (
    <div className="image-resize-tool span-full">
      <div className="image-resize-header">
        <h3>Edición básica de imagen</h3>
        <p>
          Redimensiona la imagen antes de subirla. Se mantiene la proporción original
          usando la API Canvas del navegador.
        </p>
      </div>

      <div className="image-resize-body">
        <div className="image-resize-preview">
          {previewUrl && (
            <img src={previewUrl} alt="Vista previa" className="image-resize-thumb" />
          )}
          <div className="image-resize-info">
            <p>
              <strong>Original:</strong> {originalSize.ancho} × {originalSize.alto} px
            </p>
            <p>
              <strong>Tamaño:</strong> {formatFileSize(originalSize.bytes)}
            </p>
            {result && (
              <>
                <p>
                  <strong>Resultado:</strong> {result.dimensiones.ancho} ×{' '}
                  {result.dimensiones.alto} px
                </p>
                <p>
                  <strong>Nuevo tamaño:</strong> {formatFileSize(result.file.size)}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="image-resize-controls">
          <label>
            Ancho máximo
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(Number(e.target.value))}
              disabled={disabled || loading}
            >
              {PRESETS.map((preset) => (
                <option key={preset.width} value={preset.width}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          {!needsResize && !result && (
            <p className="image-resize-hint">
              La imagen ya es más pequeña que el ancho seleccionado. Puedes subirla
              sin cambios o aplicar el tamaño igualmente.
            </p>
          )}

          {error && <p className="image-resize-error">{error}</p>}

          <div className="image-resize-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleUseOriginal}
              disabled={disabled || loading}
            >
              Usar imagen original
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleResize}
              disabled={disabled || loading}
            >
              {loading ? 'Redimensionando...' : 'Aplicar redimensionamiento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
