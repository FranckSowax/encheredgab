/**
 * Page d'accueil - Enchères Actives
 * Design moderne inspiré d'AuctionHub
 */

'use client'

import { useEffect, useState } from 'react'
import { Heart, Search, Bell, User, Gavel, Clock, Star, Filter, ChevronDown, TrendingUp, Menu, X } from 'lucide-react'
import AuctionCard from '@/components/ui/AuctionCard'
import ParallaxBanner from '@/components/ui/ParallaxBanner'
import WeeklyScheduleBanner from '@/components/ui/WeeklyScheduleBanner'
import { useFavorites } from '@/lib/hooks/useFavorites'
// Utiliser les données mockées pour tester le frontend
import { useActiveAuctions } from '@/lib/hooks/useAuction.mock'
// import { useActiveAuctions } from '@/lib/hooks/useAuction' // Version avec Supabase

// Catégories de notre app Douane Enchères
const APP_CATEGORIES = [
  { id: 'all', label: 'Toutes catégories', icon: '📦' },
  { id: 'electronics', label: 'Électronique', icon: '📱' },
  { id: 'vehicles', label: 'Véhicules', icon: '🚗' },
  { id: 'jewelry', label: 'Bijoux & Montres', icon: '💎' },
  { id: 'fashion', label: 'Mode & Accessoires', icon: '👜' },
  { id: 'furniture', label: 'Mobilier', icon: '🛋️' },
  { id: 'art', label: 'Art & Antiquités', icon: '🎨' },
  { id: 'other', label: 'Autres', icon: '🔖' }
]

const AUCTION_TYPES = [
  { id: 'all', label: 'Toutes enchères' },
  { id: 'live', label: 'En cours' },
  { id: 'ending', label: 'Bientôt terminées' },
  { id: 'new', label: 'Nouvelles' }
]

export default function HomePage() {
  const { auctions, loading, error } = useActiveAuctions()
  const { favorites, isFavorite, toggleFavorite, loading: favoritesLoading } = useFavorites()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [auctionType, setAuctionType] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showFilters, setShowFilters] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Grouper les enchères par catégorie
  const auctionsByCategory = auctions.reduce((acc, auction) => {
    const category = auction.lot?.category_id || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(auction)
    return acc
  }, {} as Record<string, typeof auctions>)

  // Filtrer les enchères
  const filteredAuctions = auctions.filter(auction => {
    // Filtre par catégorie
    if (selectedCategory !== 'all' && auction.lot?.category_id !== selectedCategory) return false
    
    // Filtre par recherche
    if (searchQuery && !auction.lot?.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    // Filtre par prix
    if (auction.current_price < priceRange[0] || auction.current_price > priceRange[1]) return false
    
    // Filtre par type d'enchère
    if (auctionType === 'ending') {
      const timeRemaining = new Date(auction.end_date).getTime() - Date.now()
      if (timeRemaining > 3600000 * 6) return false // Plus de 6h
    }
    if (auctionType === 'new') {
      const startedAt = new Date(auction.start_date).getTime()
      if (Date.now() - startedAt > 86400000 * 2) return false // Plus de 2 jours
    }
    
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des enchères...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-red-600">❌ Erreur: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white sm:rounded-3xl shadow-2xl">
        {/* Header - Ultra Responsive */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-green-600 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo-douane.jpg"
                alt="Douane Gabon"
                className="h-12 sm:h-16 lg:h-20 w-auto object-contain"
              />
            </div>
          
            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5 z-10" />
                <input 
                  type="text" 
                  placeholder="Rechercher une enchère..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-800 font-medium shadow-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6">
              <button className="text-gray-600 hover:text-green-600 transition font-medium whitespace-nowrap">
                Mes Enchères
              </button>
              <button className="text-gray-600 hover:text-green-600 transition font-medium whitespace-nowrap">
                Favoris
              </button>
              <button className="relative text-gray-600 hover:text-green-600 transition">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0) > 99 ? '9+' : auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0)}
                </span>
              </button>
              <button className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition">
                <User className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button className="relative p-2 text-gray-600 hover:text-green-600 transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0) > 9 ? '9+' : auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0)}
                </span>
              </button>
              <button className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4 z-10" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm"
              />
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg py-2">
              <button className="w-full text-left px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition font-medium">
                Mes Enchères
              </button>
              <button className="w-full text-left px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition font-medium">
                Favoris
              </button>
              <button className="w-full text-left px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition font-medium">
                Mon Profil
              </button>
            </div>
          )}
        </header>

        {/* Bannières */}
        <div className="px-4 sm:px-6 lg:px-8">
          <ParallaxBanner />
          <WeeklyScheduleBanner />
        </div>

        {/* Categories Navigation - Horizontal Scroll */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {APP_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap font-medium transition flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }`}
              >
                <span className="text-base sm:text-lg">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                {cat.id !== 'all' && (
                  <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {auctionsByCategory[cat.id]?.length || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 pb-8">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-30 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-semibold active:scale-95 transition"
          >
            <Filter className="w-5 h-5" />
            <span>Filtres</span>
            <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
              {filteredAuctions.length}
            </span>
          </button>

          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-800">Filtres</h3>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {showFilters && (
                <>
                  {/* Auction Type Filter */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">Type d'enchère</h4>
                    <div className="space-y-2">
                      {AUCTION_TYPES.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setAuctionType(type.id)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg transition ${
                            auctionType === type.id
                              ? 'bg-green-500 text-white font-medium'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">Fourchette de prix</h4>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="5000000"
                        step="50000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-green-600"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{priceRange[0].toLocaleString('fr-FR')} FCFA</span>
                        <span>{priceRange[1].toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-white rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Enchères actives</span>
                      <span className="font-bold text-green-600">{auctions.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Offres totales</span>
                      <span className="font-bold text-green-600">
                        {auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Résultats filtrés</span>
                      <span className="font-bold text-green-600">{filteredAuctions.length}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {filteredAuctions.length} enchère{filteredAuctions.length > 1 ? 's' : ''} disponible{filteredAuctions.length > 1 ? 's' : ''}
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-xs sm:text-sm text-gray-600">Temps réel</span>
              </div>
            </div>

            {/* Products Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredAuctions.map(auction => (
                <AuctionCard
                  key={auction.id}
                  id={auction.id}
                  title={auction.lot?.title || 'Titre manquant'}
                  description={auction.lot?.description || undefined}
                  category={APP_CATEGORIES.find(c => c.id === auction.lot?.category_id)?.label}
                  imageUrl={auction.lot?.images?.[0]?.image_url || '/placeholder-lot.jpg'}
                  startPrice={auction.starting_price}
                  currentPrice={auction.current_price}
                  endDate={auction.end_date}
                  totalBids={auction.total_bids || 0}
                  views={auction.views_count || 0}
                  isLiked={isFavorite(auction.id)}
                  onLike={() => toggleFavorite(auction.id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredAuctions.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <div className="text-4xl sm:text-6xl mb-4">🔍</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Aucune enchère trouvée</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">Essayez de modifier vos filtres ou votre recherche</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setAuctionType('all')
                    setSearchQuery('')
                    setPriceRange([0, 5000000])
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium hover:shadow-lg active:scale-95 transition"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            
            {/* Drawer */}
            <div className="lg:hidden fixed inset-y-0 right-0 w-full sm:w-96 bg-white z-50 shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-xl text-gray-800">Filtres</h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 text-gray-600 hover:text-green-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Auction Type Filter */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Type d'enchère</h4>
                  <div className="space-y-2">
                    {AUCTION_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setAuctionType(type.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition active:scale-95 ${
                          auctionType === type.id
                            ? 'bg-green-500 text-white font-medium'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Fourchette de prix</h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="5000000"
                      step="50000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-green-600 h-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{priceRange[0].toLocaleString('fr-FR')} FCFA</span>
                      <span>{priceRange[1].toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Enchères actives</span>
                    <span className="font-bold text-green-600 text-lg">{auctions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Offres totales</span>
                    <span className="font-bold text-green-600 text-lg">
                      {auctions.reduce((sum, a) => sum + (a.total_bids || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Résultats filtrés</span>
                    <span className="font-bold text-green-600 text-lg">{filteredAuctions.length}</span>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold active:scale-95 transition shadow-lg"
                >
                  Appliquer les filtres ({filteredAuctions.length})
                </button>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setAuctionType('all')
                    setSearchQuery('')
                    setPriceRange([0, 5000000])
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium active:bg-gray-200 transition"
                >
                  Réinitialiser tout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
