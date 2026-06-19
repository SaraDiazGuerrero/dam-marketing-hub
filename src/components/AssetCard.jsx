import { formatFileSize } from '../services/assetService'

function AssetPreview({ asset }) {
  const isImage = asset.tipoArchivo?.startsWith('image/')
  const isVideo = asset.tipoArchivo?.startsWith('video/')

  if (isImage) {
    return <img src={asset.url} alt={asset.nombre} loading="lazy" />
  }
  if (isVideo) {
    return <div className="asset-card-placeholder">🎬 Video</div>
  }
  return <div className="asset-card-placeholder">📄 Documento</div>
}

export default function AssetCard({ asset, variant = 'grid', onClick }) {
  const tags = asset.etiquetas || []

  const badges = (
    <div className="asset-card-badges">
      <span className="asset-card-category">{asset.categoria}</span>
      {asset.subcategoria && (
        <span className="asset-badge asset-badge--sub">{asset.subcategoria}</span>
      )}
      {asset.tipoActivo && (
        <span className="asset-badge">{asset.tipoActivo}</span>
      )}
      {asset.estadoRevision && (
        <span className="asset-badge asset-badge--revision">
          {asset.estadoRevision}
        </span>
      )}
      {asset.prioridadCustodia != null && (
        <span className="asset-badge asset-badge--priority">
          Custodia: {asset.prioridadCustodia}
        </span>
      )}
    </div>
  )

  if (variant === 'list') {
    return (
      <article
        className="asset-card asset-card--list"
        onClick={() => onClick?.(asset)}
      >
        <div className="asset-card-preview asset-card-preview--list">
          <AssetPreview asset={asset} />
        </div>
        <div className="asset-card-body asset-card-body--list">
          <div className="asset-list-main">
            <h3>{asset.nombre}</h3>
            <p className="asset-list-meta">
              {asset.categoria} · {formatFileSize(asset.tamañoArchivo)}
              {asset.dimensiones &&
                ` · ${asset.dimensiones.ancho}×${asset.dimensiones.alto}px`}
            </p>
            {badges}
          </div>
          {tags.length > 0 && (
            <div className="asset-card-tags">
              {tags.map((tag) => (
                <span key={tag} className="asset-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className="asset-card" onClick={() => onClick?.(asset)}>
      <div className="asset-card-preview">
        <AssetPreview asset={asset} />
      </div>
      <div className="asset-card-body">
        <h3>{asset.nombre}</h3>
        {badges}
        {tags.length > 0 && (
          <div className="asset-card-tags">
            {tags.map((tag) => (
              <span key={tag} className="asset-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
