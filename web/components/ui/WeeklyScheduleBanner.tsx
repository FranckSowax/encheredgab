/**
 * Bannière de Calendrier Hebdomadaire
 * Affiche le statut actuel du cycle Lundi-Vendredi
 */

'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'

type WeeklyPhase = 'preview' | 'active' | 'closed'

interface WeeklyStatus {
  phase: WeeklyPhase
  phaseDescription: string
  nextPhase: string
  nextPhaseTime: string
  hoursRemaining: number
}

export default function WeeklyScheduleBanner() {
  const [status, setStatus] = useState<WeeklyStatus | null>(null)
  const [countdown, setCountdown] = useState<string>('')

  useEffect(() => {
    const calculateStatus = () => {
      const now = new Date()
      const dayOfWeek = now.getDay() // 0=Dimanche, 1=Lundi, ..., 5=Vendredi
      const hour = now.getHours()

      // Lundi-Mercredi (jours 1-3)
      if (dayOfWeek >= 1 && dayOfWeek <= 3) {
        const thursday = getNextThursday(now)
        const hoursRemaining = (thursday.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        setStatus({
          phase: 'preview',
          phaseDescription: 'Prévisualisation des lots',
          nextPhase: 'Ouverture des enchères',
          nextPhaseTime: thursday.toISOString(),
          hoursRemaining
        })
      }
      // Jeudi ou Vendredi avant 12h (enchères actives)
      else if (dayOfWeek === 4 || (dayOfWeek === 5 && hour < 12)) {
        const fridayNoon = getNextFridayNoon(now)
        const hoursRemaining = (fridayNoon.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        setStatus({
          phase: 'active',
          phaseDescription: 'Enchères en cours',
          nextPhase: 'Clôture',
          nextPhaseTime: fridayNoon.toISOString(),
          hoursRemaining
        })
      }
      // Vendredi après 12h - Dimanche (fermé)
      else {
        const nextMonday = getNextMonday(now)
        const hoursRemaining = (nextMonday.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        setStatus({
          phase: 'closed',
          phaseDescription: 'Enchères terminées',
          nextPhase: 'Prochaine prévisualisation',
          nextPhaseTime: nextMonday.toISOString(),
          hoursRemaining
        })
      }
    }

    calculateStatus()
    const interval = setInterval(calculateStatus, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!status) return

    const updateCountdown = () => {
      const now = new Date()
      const target = new Date(status.nextPhaseTime)
      const diff = target.getTime() - now.getTime()

      if (diff <= 0) {
        setCountdown('Maintenant')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setCountdown(`${days}j ${hours}h`)
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}min`)
      } else {
        setCountdown(`${minutes}min`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [status])

  if (!status) return null

  return (
    <>
      {/* Bannière Preview (Lundi-Mercredi) */}
      {status.phase === 'preview' && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-1">
                  📱 Mode Prévisualisation
                </h3>
                <p className="text-blue-700 font-medium">
                  Découvrez les lots de cette semaine
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-blue-600 mb-1">Enchères dans</p>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-700" />
                <span className="text-3xl font-bold text-blue-900">{countdown}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">Jeudi 00h00</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-200">
            <p className="text-blue-800 text-sm">
              ℹ️ Les enchères débuteront <strong>jeudi à minuit</strong> et se termineront <strong>vendredi à midi</strong>. 
              Ajoutez vos lots favoris pour recevoir une notification à l'ouverture !
            </p>
          </div>
        </div>
      )}

      {/* Bannière Active (Jeudi-Vendredi midi) */}
      {status.phase === 'active' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-300 rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden">
          {/* Animation pulse */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-1 flex items-center gap-2">
                  🔥 Enchères en cours !
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </h3>
                <p className="text-green-700 font-medium">
                  Faites vos offres maintenant
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-green-600 mb-1">Clôture dans</p>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-700" />
                <span className="text-3xl font-bold text-green-900">{countdown}</span>
              </div>
              <p className="text-sm text-green-600 mt-1">Vendredi 12h00</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-green-200">
            <p className="text-green-800 text-sm">
              ⚡ Les enchères se terminent <strong>vendredi à midi</strong>. 
              Enchérissez stratégiquement et surveillez vos favoris !
            </p>
          </div>
        </div>
      )}

      {/* Bannière Closed (Vendredi après-midi - Dimanche) */}
      {status.phase === 'closed' && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-400 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  ✅ Enchères terminées
                </h3>
                <p className="text-gray-700 font-medium">
                  Les gagnants ont été notifiés
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Prochaines enchères dans</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-700" />
                <span className="text-3xl font-bold text-gray-900">{countdown}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Lundi prochain</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
            <p className="text-gray-800 text-sm">
              📅 Les nouveaux lots seront dévoilés <strong>lundi prochain</strong>. 
              Revenez découvrir les prochaines opportunités !
            </p>
          </div>
        </div>
      )}
    </>
  )
}

// Helper functions
function getNextThursday(from: Date): Date {
  const result = new Date(from)
  const dayOfWeek = result.getDay()
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7
  result.setDate(result.getDate() + daysUntilThursday)
  result.setHours(0, 0, 0, 0)
  return result
}

function getNextFridayNoon(from: Date): Date {
  const result = new Date(from)
  const dayOfWeek = result.getDay()
  
  if (dayOfWeek === 5 && result.getHours() < 12) {
    // Aujourd'hui vendredi avant midi
    result.setHours(12, 0, 0, 0)
  } else if (dayOfWeek === 4) {
    // Aujourd'hui jeudi
    result.setDate(result.getDate() + 1)
    result.setHours(12, 0, 0, 0)
  } else {
    // Vendredi prochain
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7
    result.setDate(result.getDate() + daysUntilFriday)
    result.setHours(12, 0, 0, 0)
  }
  
  return result
}

function getNextMonday(from: Date): Date {
  const result = new Date(from)
  const dayOfWeek = result.getDay()
  const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7
  result.setDate(result.getDate() + daysUntilMonday)
  result.setHours(0, 0, 0, 0)
  return result
}
