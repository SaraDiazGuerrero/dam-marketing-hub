import { useState } from 'react'
import AssetGallery from '../components/AssetGallery'
import Navbar from '../components/Navbar'
import UploadForm from '../components/UploadForm'

export default function DashboardPage({ user }) {
  const [galleryKey, setGalleryKey] = useState(0)

  function handleUploadSuccess() {
    setGalleryKey((k) => k + 1)
  }

  return (
    <div className="dashboard">
      <Navbar user={user} />
      <main className="dashboard-main page-container">
        <header className="page-header">
          <h2>Panel de control</h2>
          <p>Gestiona y organiza los activos digitales de tu agencia.</p>
        </header>

        <p className="dashboard-welcome">
          Hola, <strong>{user.email}</strong>
        </p>

        <UploadForm user={user} onUploadSuccess={handleUploadSuccess} />

        <AssetGallery refreshKey={galleryKey} />
      </main>
    </div>
  )
}
