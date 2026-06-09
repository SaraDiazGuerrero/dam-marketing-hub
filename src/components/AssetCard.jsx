export default function AssetCard({ asset, onClick }) {
  const isImage = asset.tipoArchivo?.startsWith('image/')
  const isVideo = asset.tipoArchivo?.startsWith('video/')

  return (
    <article className="asset-card" onClick={() => onClick?.(asset)}>
      <div className="asset-card-preview">
        {isImage ? (
          <img src={asset.url} alt={asset.nombre} loading="lazy" />
        ) : isVideo ? (
          <div className="asset-card-placeholder">🎬 Video</div>
        ) : (
          <div className="asset-card-placeholder">📄 Documento</div>
        )}
      </div>
      <div className="asset-card-body">
        <h3>{asset.nombre}</h3>
        <span className="asset-card-category">{asset.categoria}</span>
        {asset.etiquetas?.length > 0 && (
          <div className="asset-card-tags">
            {asset.etiquetas.map((tag) => (
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
