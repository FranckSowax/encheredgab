/**
 * Image Gallery Component
 * Grande image principale + thumbnails verticaux (comme Image 2)
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'

export interface ImageGalleryProps {
  images: Array<{
    url: string
    alt?: string
  }>
  title?: string
}

export default function ImageGallery({ images, title = 'Image' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') setIsZoomed(false)
  }

  return (
    <div className="image-gallery" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="gallery-container">
        {/* Thumbnails - Vertical à gauche */}
        <div className="thumbnails-container">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`thumbnail ${index === selectedIndex ? 'active' : ''}`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${title} - Photo ${index + 1}`}
                fill
                className="thumbnail-image"
                sizes="100px"
              />
            </button>
          ))}
        </div>

        {/* Image principale */}
        <div className="main-image-container">
          <div className="main-image-wrapper">
            <Image
              src={images[selectedIndex].url}
              alt={images[selectedIndex].alt || `${title} - Photo ${selectedIndex + 1}`}
              fill
              className="main-image"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="nav-button nav-button-left"
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="nav-button nav-button-right"
                  aria-label="Image suivante"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Zoom button */}
            <button
              onClick={() => setIsZoomed(true)}
              className="zoom-button"
              aria-label="Agrandir l'image"
            >
              <ZoomIn size={20} />
            </button>

            {/* Counter */}
            <div className="image-counter">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isZoomed && (
        <div className="lightbox" onClick={() => setIsZoomed(false)}>
          <button className="lightbox-close" aria-label="Fermer">
            <X size={32} />
          </button>
          <div className="lightbox-image-wrapper" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedIndex].url}
              alt={images[selectedIndex].alt || `${title} - Photo ${selectedIndex + 1}`}
              fill
              className="lightbox-image"
              sizes="100vw"
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                className="lightbox-nav lightbox-nav-left"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="lightbox-nav lightbox-nav-right"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .image-gallery {
          width: 100%;
        }

        .gallery-container {
          display: flex;
          gap: 16px;
        }

        /* Thumbnails */
        .thumbnails-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100px;
          flex-shrink: 0;
        }

        .thumbnail {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 12px;
          overflow: hidden;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          background: #F3F4F6;
        }

        .thumbnail:hover {
          border-color: #D1D5DB;
          transform: scale(1.05);
        }

        .thumbnail.active {
          border-color: #3B82F6;
        }

        .thumbnail-image {
          object-fit: cover;
        }

        /* Main Image */
        .main-image-container {
          flex: 1;
          min-width: 0;
        }

        .main-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 16px;
          overflow: hidden;
          background: #F3F4F6;
        }

        .main-image {
          object-fit: cover;
        }

        /* Navigation */
        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
          z-index: 2;
        }

        .nav-button:hover {
          background: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .nav-button-left {
          left: 16px;
        }

        .nav-button-right {
          right: 16px;
        }

        .zoom-button {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
          z-index: 2;
        }

        .zoom-button:hover {
          background: white;
          transform: scale(1.1);
        }

        .image-counter {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        /* Lightbox */
        .lightbox {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
          z-index: 10001;
        }

        .lightbox-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .lightbox-image-wrapper {
          position: relative;
          width: 90vw;
          height: 90vh;
          max-width: 1200px;
          max-height: 900px;
        }

        .lightbox-image {
          object-fit: contain;
        }

        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
          z-index: 10001;
        }

        .lightbox-nav:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-50%) scale(1.1);
        }

        .lightbox-nav-left {
          left: 40px;
        }

        .lightbox-nav-right {
          right: 40px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .gallery-container {
            flex-direction: column-reverse;
          }

          .thumbnails-container {
            flex-direction: row;
            width: 100%;
            overflow-x: auto;
          }

          .thumbnail {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
          }

          .nav-button {
            width: 40px;
            height: 40px;
          }

          .nav-button-left {
            left: 8px;
          }

          .nav-button-right {
            right: 8px;
          }

          .lightbox-nav {
            width: 48px;
            height: 48px;
          }

          .lightbox-nav-left {
            left: 20px;
          }

          .lightbox-nav-right {
            right: 20px;
          }
        }
      `}</style>
    </div>
  )
}
