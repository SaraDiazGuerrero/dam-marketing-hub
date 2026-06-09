import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES } from '../constants/categories'
import { getAssets, getFirestoreErrorMessage } from '../services/assetService'
import AssetCard from './AssetCard'

export default function AssetGallery({ refreshKey = 0 }) {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    async function loadAssets() {
      setLoading(true)
      setError('')

      try {
        const data = await getAssets()
        setAssets(data.filter((a) => a.estado !== 'archivado'))
      } catch (err) {
        console.error('Error al cargar activos:', err)
        setError(getFirestoreErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [refreshKey])

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase()

    return assets.filter((asset) => {
      const matchCategory = !categoria || asset.categoria === categoria

      const matchSearch =
        !term ||
        asset.nombre?.toLowerCase().includes(term) ||
        asset.descripcion?.toLowerCase().includes(term) ||
        asset.etiquetas?.some((tag) => tag.toLowerCase().includes(term))

      return matchCategory && matchSearch
    })
  }, [assets, search, categoria])

  return (
    <section className="gallery-section">
      <div className="gallery-section-header">
        <h2 className="section-title">Galería de activos</h2>
        <p className="gallery-subtitle">
          {filteredAssets.length} de {assets.length} activos
        </p>
      </div>

      <div className="filters-bar">
        <input
          type="search"
          className="form-input"
          placeholder="Buscar por nombre o etiqueta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <div className="view-toggle">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
          >
            Galería
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
          >
            Lista
          </button>
        </div>
      </div>

      {loading && <p className="gallery-message">Cargando activos...</p>}
      {error && <p className="gallery-message gallery-error">{error}</p>}

      {!loading && !error && filteredAssets.length === 0 && (
        <p className="gallery-message">
          {assets.length === 0
            ? 'No hay activos en Firestore. Si ves archivos en Storage, los metadatos no se guardaron. Desactiva el bloqueador de anuncios en localhost y vuelve a subir.'
            : 'No hay resultados para tu búsqueda.'}
        </p>
      )}

      {!loading && filteredAssets.length > 0 && viewMode === 'grid' && (
        <div className="grid-gallery">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} variant="grid" />
          ))}
        </div>
      )}

      {!loading && filteredAssets.length > 0 && viewMode === 'list' && (
        <div className="list-gallery">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} variant="list" />
          ))}
        </div>
      )}
    </section>
  )
}
