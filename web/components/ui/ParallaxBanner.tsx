/**
 * Bannière Parallaxe avec image Douane
 */

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Gavel, TrendingUp, Users, Award } from 'lucide-react'

export default function ParallaxBanner() {
  const [scrollY, setScrollY] = useState(0)
  // Version de l'image pour forcer le rechargement après modification
  const imageVersion = 2

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Effet parallaxe : l'image se déplace plus lentement que le scroll
  const parallaxOffset = scrollY * 0.5

  return (
    <div className="relative h-[500px] overflow-hidden rounded-3xl mb-8">
      {/* Image avec effet parallaxe */}
      <div 
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
        }}
      >
        <Image
          src={`/banner-douane.jpg?v=${imageVersion}`}
          alt="Douane Enchères Gabon"
          fill
          className="object-cover"
          priority
          quality={90}
          unoptimized
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Contenu */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-8">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">Enchères en direct</span>
            </div>

            {/* Titre principal */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Enchères Officielles
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Douane Gabonaise
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Participez aux ventes aux enchères des produits saisis par la douane. 
              Transparence, sécurité et opportunités exceptionnelles.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <Gavel className="w-5 h-5" />
                Voir les enchères
              </button>
              <Link 
                href="/how-it-works"
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-full font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300 inline-flex items-center"
              >
                Comment ça marche ?
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">2.5M+</div>
                    <div className="text-sm text-white/70">Transactions</div>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">15K+</div>
                    <div className="text-sm text-white/70">Utilisateurs</div>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-sm text-white/70">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Décorations animées */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" 
           style={{ animationDelay: '1s' }} />
      
      {/* Particules flottantes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/20 rounded-full animate-float" 
             style={{ animationDelay: '2s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/25 rounded-full animate-float" 
             style={{ animationDelay: '1s', animationDuration: '5s' }} />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
