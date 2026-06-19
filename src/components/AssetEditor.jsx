import { useState } from 'react'
import {
  ASSET_TYPES,
  CATEGORIES,
  REVISION_STATES,
  SCALE_1_5,
  calcularPrioridadCustodia,
  getSubcategories,
} from '../constants/categories'

export default function AssetEditor({ asset, onSave, onCancel, loading }) {
  const [nombre, setNombre] = useState(asset.nombre || '')
  const [descripcion, setDescripcion] = useState(asset.descripcion || '')
  const [categoria, setCategoria] = useState(asset.categoria || CATEGORIES[0])
  const [etiquetasTexto, setEtiquetasTexto] = useState(
    (asset.etiquetas || []).join(', ')
  )

  const [subcategoria, setSubcategoria] = useState(asset.subcategoria || '')
  const [tipoActivo, setTipoActivo] = useState(asset.tipoActivo || ASSET_TYPES[0])
  const [copyright, setCopyright] = useState(asset.copyright || '')
  const [usoRecomendado, setUsoRecomendado] = useState(asset.usoRecomendado || '')
  const [procedencia, setProcedencia] = useState(asset.procedencia || '')
  const [importanciaLegal, setImportanciaLegal] = useState(
    asset.importanciaLegal ?? 3
  )
  const [riesgoDispersionLocal, setRiesgoDispersionLocal] = useState(
    asset.riesgoDispersionLocal ?? 3
  )
  const [estadoRevision, setEstadoRevision] = useState(
    asset.estadoRevision || REVISION_STATES[0]
  )

  const subcategoriasDisponibles = getSubcategories(categoria)
  const prioridadCustodia = calcularPrioridadCustodia(
    importanciaLegal,
    riesgoDispersionLocal
  )

  function handleCategoriaChange(nuevaCategoria) {
    setCategoria(nuevaCategoria)
    setSubcategoria('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const etiquetas = etiquetasTexto
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    onSave({
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
    })
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

      <div className="form-section-divider">
        <h4>Derechos de uso y custodia</h4>
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

      <div className="priority-display">
        <span>Prioridad de custodia (calculada):</span>
        <strong>{prioridadCustodia}</strong>
      </div>

      <label>
        Copyright
        <input
          type="text"
          value={copyright}
          onChange={(e) => setCopyright(e.target.value)}
          disabled={loading}
        />
      </label>

      <label>
        Procedencia
        <input
          type="text"
          value={procedencia}
          onChange={(e) => setProcedencia(e.target.value)}
          disabled={loading}
        />
      </label>

      <label>
        Uso recomendado
        <textarea
          value={usoRecomendado}
          onChange={(e) => setUsoRecomendado(e.target.value)}
          rows={2}
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
