import { useState } from 'react'
import {
  archiveAsset,
  deleteAsset,
  formatFileSize,
  updateAsset,
} from '../services/assetService'
import { generateShareInfo } from '../services/shareService'
import AssetEditor from './AssetEditor'

function formatDate(timestamp) {
  if (!timestamp?.seconds) return '—'
  return new Date(timestamp.seconds * 1000).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AssetPreview({ asset }) {
  const isImage = asset.tipoArchivo?.startsWith('image/')
  const isVideo = asset.tipoArchivo?.startsWith('video/')

  if (isImage) {
    return <img src={asset.url} alt={asset.nombre} className="asset-details-image" />
  }
  if (isVideo) {
    return (
      <video src={asset.url} controls className="asset-details-video">
        Tu navegador no soporta video.
      </video>
    )
  }
  return (
    <div className="asset-details-doc">
      <span>📄</span>
      <p>{asset.nombreOriginal || asset.nombre}</p>
      <a href={asset.url} target="_blank" rel="noreferrer" className="btn-primary">
        Abrir documento
      </a>
    </div>
  )
}

export default function AssetDetails({ asset, onBack, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [currentAsset, setCurrentAsset] = useState(asset)
  const [shareInfo, setShareInfo] = useState(null)
  const [shareLoading, setShareLoading] = useState(false)

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text)
      setNotification({ type: 'success', message: successMessage })
    } catch {
      setNotification({ type: 'error', message: 'No se pudo copiar al portapapeles.' })
    }
  }

  async function handleCopyLink() {
    await copyText(currentAsset.url, 'Enlace copiado al portapapeles.')
  }

  async function handleGenerateShare() {
    setShareLoading(true)
    setNotification(null)

    try {
      const info = await generateShareInfo(currentAsset)
      setShareInfo(info)
      setNotification({
        type: 'success',
        message: 'Información de distribución generada por Firebase Function.',
      })
    } catch (err) {
      console.error('generateShareInfo error:', err)
      const code = err?.code || ''
      let message = 'No se pudo generar la información de distribución.'

      if (code === 'functions/unauthenticated') {
        message = 'Debes iniciar sesión para usar la Cloud Function.'
      } else if (code === 'functions/internal' || code === 'internal') {
        message =
          'Error interno al llamar la Function. Vuelve a desplegar con invoker público o desactiva el bloqueador de anuncios.'
      } else if (err?.message) {
        message = err.message
      }

      setNotification({ type: 'error', message })
    } finally {
      setShareLoading(false)
    }
  }

  async function handleSave(data) {
    setLoading(true)
    setNotification(null)
    try {
      await updateAsset(currentAsset.id, data)
      const updated = { ...currentAsset, ...data }
      setCurrentAsset(updated)
      setEditing(false)
      setNotification({ type: 'success', message: 'Metadatos actualizados.' })
      onUpdated?.()
    } catch (err) {
      console.error(err)
      setNotification({ type: 'error', message: 'No se pudieron guardar los cambios.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleArchive() {
    if (!confirm(`¿Archivar "${currentAsset.nombre}"? Ya no aparecerá en la galería.`)) return

    setLoading(true)
    try {
      await archiveAsset(currentAsset.id)
      onUpdated?.()
      onBack()
    } catch (err) {
      console.error(err)
      setNotification({ type: 'error', message: 'No se pudo archivar el activo.' })
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${currentAsset.nombre}" permanentemente? Esta acción no se puede deshacer.`)) return

    setLoading(true)
    try {
      await deleteAsset(currentAsset.id, currentAsset.storagePath)
      onUpdated?.()
      onBack()
    } catch (err) {
      console.error(err)
      setNotification({ type: 'error', message: 'No se pudo eliminar el activo.' })
      setLoading(false)
    }
  }

  return (
    <section className="asset-details">
      <button type="button" className="btn-back" onClick={onBack}>
        ← Volver a la galería
      </button>

      {notification && (
        <div className={`notification notification-${notification.type}`} role="alert">
          <p>{notification.message}</p>
        </div>
      )}

      <div className="asset-details-layout">
        <div className="asset-details-preview">
          <AssetPreview asset={currentAsset} />
        </div>

        <div className="asset-details-info">
          {editing ? (
            <AssetEditor
              asset={currentAsset}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              loading={loading}
            />
          ) : (
            <>
              <h2>{currentAsset.nombre}</h2>
              <span className="asset-card-category">{currentAsset.categoria}</span>

              {currentAsset.descripcion && (
                <p className="asset-details-description">{currentAsset.descripcion}</p>
              )}

              {currentAsset.etiquetas?.length > 0 && (
                <div className="asset-card-tags">
                  {currentAsset.etiquetas.map((tag) => (
                    <span key={tag} className="asset-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <dl className="asset-meta-list">
                <div>
                  <dt>Tipo</dt>
                  <dd>{currentAsset.tipoArchivo || '—'}</dd>
                </div>
                <div>
                  <dt>Tamaño</dt>
                  <dd>{formatFileSize(currentAsset.tamañoArchivo)}</dd>
                </div>
                {currentAsset.dimensiones && (
                  <div>
                    <dt>Dimensiones</dt>
                    <dd>
                      {currentAsset.dimensiones.ancho} × {currentAsset.dimensiones.alto} px
                    </dd>
                  </div>
                )}
                <div>
                  <dt>Archivo original</dt>
                  <dd>{currentAsset.nombreOriginal || '—'}</dd>
                </div>
                <div>
                  <dt>Fecha de carga</dt>
                  <dd>{formatDate(currentAsset.fechaCarga)}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{currentAsset.estado || 'activo'}</dd>
                </div>
              </dl>

              <div className="asset-details-actions">
                <a
                  href={currentAsset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  Abrir archivo
                </a>
                <button type="button" className="btn-secondary" onClick={handleCopyLink}>
                  Copiar enlace
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleGenerateShare}
                  disabled={loading || shareLoading}
                >
                  {shareLoading ? 'Generando...' : 'Generar enlace de distribución'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(true)}
                  disabled={loading}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleArchive}
                  disabled={loading}
                >
                  Archivar
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>

              {shareInfo && (
                <div className="share-info-panel">
                  <h3>Distribución (Firebase Function)</h3>
                  <p className="share-info-text">{shareInfo.shareText}</p>

                  {shareInfo.normalizedTags?.length > 0 && (
                    <div className="asset-card-tags">
                      {shareInfo.normalizedTags.map((tag) => (
                        <span key={tag} className="asset-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="share-info-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => copyText(shareInfo.downloadUrl, 'Enlace de descarga copiado.')}
                    >
                      Copiar enlace de descarga
                    </button>
                    {shareInfo.embedHtml && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() =>
                          copyText(shareInfo.embedHtml, 'Código de inserción copiado.')
                        }
                      >
                        Copiar código de inserción
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
