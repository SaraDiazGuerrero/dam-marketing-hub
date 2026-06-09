import { useState } from 'react'
import { CATEGORIES } from '../constants/categories'

export default function AssetEditor({ asset, onSave, onCancel, loading }) {
  const [nombre, setNombre] = useState(asset.nombre || '')
  const [descripcion, setDescripcion] = useState(asset.descripcion || '')
  const [categoria, setCategoria] = useState(asset.categoria || CATEGORIES[0])
  const [etiquetasTexto, setEtiquetasTexto] = useState(
    (asset.etiquetas || []).join(', ')
  )

  function handleSubmit(event) {
    event.preventDefault()
    const etiquetas = etiquetasTexto
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    onSave({ nombre, descripcion, categoria, etiquetas })
  }

  return (
    <form onSubmit={handleSubmit} className="asset-editor">
      <h3>Editar metadatos</h3>

      <label>
        Nombre *
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          disabled={loading}
        />
      </label>

      <label>
        Descripción
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          disabled={loading}
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

      <label>
        Etiquetas
        <input
          type="text"
          value={etiquetasTexto}
          onChange={(e) => setEtiquetasTexto(e.target.value)}
          placeholder="instagram, verano, promo"
          disabled={loading}
        />
      </label>

      <div className="asset-editor-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
