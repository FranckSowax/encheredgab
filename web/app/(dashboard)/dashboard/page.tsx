/**
 * Page Profil Utilisateur - Design Moderne
 */

'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Shield, Award, TrendingUp, Heart, Settings, Bell, LogOut, Edit } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import EditProfileModal from '@/components/modals/EditProfileModal'

// Import temporaire pour Gavel
const Gavel = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/>
    <path d="m16 16 6-6"/>
    <path d="m8 8 6-6"/>
    <path d="m9 7 8 8"/>
    <path d="m21 11-8-8"/>
  </svg>
)

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const supabase = createClient()

  // Charger les données utilisateur depuis Supabase
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Récupérer l'utilisateur authentifié
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('Erreur auth:', authError)
        // Données par défaut pour le développement
        setUser({
          id: '123',
          full_name: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          phone: '+241 06 12 34 56',
          address: 'Libreville, Gabon',
          created_at: '2025-01-15',
          kyc_status: 'approved',
          role: 'user'
        })
        setLoading(false)
        return
      }

      // Récupérer le profil complet
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Erreur profil:', profileError)
        // Utiliser les données de base de l'auth
        setUser({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || 'Utilisateur',
          phone: authUser.user_metadata?.phone || '',
          address: '',
          created_at: authUser.created_at,
          kyc_status: 'pending',
          role: 'user'
        })
      } else {
        setUser(profile)
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (data: any) => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      throw new Error('Non authentifié')
    }

    // Mettre à jour le profil dans Supabase
    const { error } = await supabase
      .from('users')
      .update({
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        updated_at: new Date().toISOString()
      })
      .eq('id', authUser.id)

    if (error) {
      throw error
    }

    // Recharger les données
    await loadUserData()
  }

  const stats = {
    totalBids: 12,
    wonAuctions: 3,
    favorites: 8,
    spent: 2450000
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-red-600">Erreur de chargement du profil</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header avec logo */}
        <header className="bg-white rounded-3xl shadow-xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo-douane.jpg" alt="Douane Gabon" className="h-16 w-auto object-contain" />
            <div className="h-12 w-px bg-gray-200" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Mon Dashboard
              </h1>
              <p className="text-gray-600 text-sm">Gérez votre profil et vos enchères</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/" className="px-6 py-3 text-gray-600 hover:text-green-600 transition font-medium">
              Retour aux enchères
            </Link>
            <button className="w-12 h-12 bg-green-50 hover:bg-green-100 rounded-full flex items-center justify-center text-green-600 transition">
              <Bell className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <User size={64} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.full_name}</h2>
                <div className="flex gap-2 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Shield size={14} />
                    Vérifié KYC
                  </div>
                </div>
                <p className="text-gray-600 text-sm text-center flex items-center gap-1">
                  <Award size={14} />
                  Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium">{user.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Adresse</p>
                    <p className="text-sm font-medium">{user.address}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Modifier le profil
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <Settings size={18} />
                  Paramètres
                </button>
                <button className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition flex items-center justify-center gap-2">
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Gavel size={28} />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-800">{stats.totalBids}</div>
                    <div className="text-gray-600 text-sm">Enchères placées</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <Award size={28} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-800">{stats.wonAuctions}</div>
                    <div className="text-gray-600 text-sm">Enchères gagnées</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                    <Heart size={28} className="text-red-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-800">{stats.favorites}</div>
                    <div className="text-gray-600 text-sm">Favoris</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                    <TrendingUp size={28} className="text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{stats.spent.toLocaleString('fr-FR')}</div>
                    <div className="text-gray-600 text-sm">FCFA dépensés</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Actions rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/my-bids" className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <Gavel size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Mes enchères</div>
                    <div className="text-sm text-gray-600">Voir toutes</div>
                  </div>
                </Link>

                <Link href="/dashboard/favorites" className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:shadow-md transition group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <Heart size={24} className="text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Mes favoris</div>
                    <div className="text-sm text-gray-600">Voir tous</div>
                  </div>
                </Link>

                <Link href="/" className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <TrendingUp size={24} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Enchères actives</div>
                    <div className="text-sm text-gray-600">Découvrir</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Activité récente</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Enchère remportée</p>
                    <p className="text-sm text-gray-600">iPhone 14 Pro Max - 520,000 FCFA</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 2 jours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gavel size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Enchère placée</p>
                    <p className="text-sm text-gray-600">MacBook Pro M2 - 920,000 FCFA</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 3 jours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Ajouté aux favoris</p>
                    <p className="text-sm text-gray-600">Rolex Submariner</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 5 jours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={{
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          address: user.address
        }}
        onSave={handleSaveProfile}
      />
    </div>
  )
}
