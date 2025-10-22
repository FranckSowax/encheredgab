/**
 * Admin - Créer un nouveau lot
 * Formulaire avec upload d'images et vidéos
 */

'use client'

import { useState, useRef } from 'react'
import { 
  Upload, 
  X,
  Image as ImageIcon,
  Video,
  Save,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface MediaFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
  isPrimary?: boolean
}

export default function NewLot() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'new',
    estimatedValue: '',
    minimumBid: '',
    keywords: '',
  })

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    'Véhicules',
    'Électronique',
    'Bijoux & Montres',
    'Mode & Accessoires',
    'Mobilier',
    'Art & Antiquités',
    'Autres'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const newMediaFiles: MediaFile[] = []
    
    for (const file of files) {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      
      if (!isImage && !isVideo) continue
      
      const preview = URL.createObjectURL(file)
      
      newMediaFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview,
        type: isImage ? 'image' : 'video',
        isPrimary: mediaFiles.length === 0 && newMediaFiles.length === 0
      })
    }
    
    setMediaFiles([...mediaFiles, ...newMediaFiles])
  }

  const removeMedia = (id: string) => {
    setMediaFiles(mediaFiles.filter(m => m.id !== id))
  }

  const setPrimaryImage = (id: string) => {
    setMediaFiles(mediaFiles.map(m => ({
      ...m,
      isPrimary: m.id === id
    })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    
    // TODO: Implémenter l'upload vers Supabase
    console.log('Form Data:', formData)
    console.log('Media Files:', mediaFiles)
    
    setTimeout(() => {
      setUploading(false)
      alert('Lot créé avec succès!')
    }, 2000)
  }

  return (
    <div className="new-lot">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <Link href="/admin/lots" className="back-btn">
            <ArrowLeft size={20} />
            Retour
          </Link>
          <h1 className="page-title">Créer un nouveau lot</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Main Form */}
          <div className="form-section">
            <div className="section-card">
              <h2 className="section-title">Informations générales</h2>
              
              <div className="form-group">
                <label className="form-label">
                  Titre du lot <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Toyota Corolla 2020"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez le lot en détail..."
                  className="form-textarea"
                  rows={5}
                  required
                />
                <div className="form-hint">
                  <AlertCircle size={14} />
                  Une description détaillée augmente les chances de vente
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Catégorie <span className="required">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    État <span className="required">*</span>
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="new">Neuf</option>
                    <option value="like_new">Comme neuf</option>
                    <option value="good">Bon état</option>
                    <option value="fair">État correct</option>
                    <option value="poor">Mauvais état</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Valeur estimée (FCFA) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="estimatedValue"
                    value={formData.estimatedValue}
                    onChange={handleInputChange}
                    placeholder="1000000"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Enchère minimum (FCFA) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="minimumBid"
                    value={formData.minimumBid}
                    onChange={handleInputChange}
                    placeholder="500000"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mots-clés</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="voiture, toyota, 2020, automatique"
                  className="form-input"
                />
                <div className="form-hint">
                  <AlertCircle size={14} />
                  Séparez les mots-clés par des virgules
                </div>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="media-section">
            <div className="section-card">
              <h2 className="section-title">Médias (Images & Vidéos)</h2>
              
              {/* Upload Zone */}
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                <Upload size={32} />
                <p className="upload-title">Cliquez pour uploader</p>
                <p className="upload-subtitle">Images (JPG, PNG) ou Vidéos (MP4, MOV)</p>
                <p className="upload-limit">Taille max: 10 MB par fichier</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="file-input"
                />
              </div>

              {/* Media Grid */}
              {mediaFiles.length > 0 && (
                <div className="media-grid">
                  {mediaFiles.map((media) => (
                    <div key={media.id} className={`media-item ${media.isPrimary ? 'primary' : ''}`}>
                      <div className="media-preview">
                        {media.type === 'image' ? (
                          <img src={media.preview} alt="Preview" />
                        ) : (
                          <video src={media.preview} />
                        )}
                        <div className="media-overlay">
                          {media.type === 'image' ? (
                            <ImageIcon size={20} />
                          ) : (
                            <Video size={20} />
                          )}
                        </div>
                      </div>
                      
                      <div className="media-actions">
                        {media.type === 'image' && !media.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(media.id)}
                            className="media-btn primary-btn"
                          >
                            Principale
                          </button>
                        )}
                        {media.isPrimary && (
                          <span className="primary-badge">Image principale</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(media.id)}
                          className="media-btn delete-btn"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {mediaFiles.length === 0 && (
                <div className="empty-media">
                  <ImageIcon size={32} />
                  <p>Aucun média ajouté</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="form-actions">
              <Link href="/admin/lots" className="cancel-btn">
                Annuler
              </Link>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={uploading}
              >
                {uploading ? (
                  <>Envoi en cours...</>
                ) : (
                  <>
                    <Save size={20} />
                    Créer le lot
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      <style jsx>{`
        .new-lot {
          max-width: 1400px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .header-top {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #F9FAFB;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        .section-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #F3F4F6;
        }

        /* Form Elements */
        .form-group {
          margin-bottom: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .required {
          color: #EF4444;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          font-size: 14px;
          color: #111827;
          background: white;
          outline: none;
          transition: all 0.2s;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .form-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 12px;
          color: #6B7280;
        }

        /* Upload Zone */
        .upload-zone {
          border: 2px dashed #D1D5DB;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #F9FAFB;
        }

        .upload-zone:hover {
          border-color: #059669;
          background: #F0FDF4;
        }

        .upload-zone svg {
          color: #9CA3AF;
          margin: 0 auto 16px;
        }

        .upload-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .upload-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 8px;
        }

        .upload-limit {
          font-size: 12px;
          color: #9CA3AF;
        }

        .file-input {
          display: none;
        }

        /* Media Grid */
        .media-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 24px;
        }

        .media-item {
          position: relative;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }

        .media-item.primary {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .media-preview {
          position: relative;
          padding-top: 100%;
          background: #F3F4F6;
        }

        .media-preview img,
        .media-preview video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-overlay {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 6px;
          border-radius: 6px;
        }

        .media-actions {
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          background: #F9FAFB;
        }

        .media-btn {
          padding: 6px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          background: white;
          transition: all 0.2s;
        }

        .media-btn.primary-btn {
          color: #059669;
          border-color: #059669;
        }

        .media-btn.primary-btn:hover {
          background: #F0FDF4;
        }

        .media-btn.delete-btn {
          color: #EF4444;
          border-color: #FECACA;
          padding: 6px;
        }

        .media-btn.delete-btn:hover {
          background: #FEE2E2;
        }

        .primary-badge {
          font-size: 11px;
          font-weight: 600;
          color: #059669;
          background: #D1FAE5;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .empty-media {
          text-align: center;
          padding: 40px 20px;
          color: #9CA3AF;
          margin-top: 24px;
        }

        .empty-media svg {
          margin: 0 auto 12px;
        }

        .empty-media p {
          font-size: 14px;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 12px;
        }

        .cancel-btn {
          flex: 1;
          padding: 14px 24px;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          background: white;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: #F9FAFB;
        }

        .submit-btn {
          flex: 1;
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
