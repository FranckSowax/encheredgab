/**
 * Page Comment ça Marche
 * Guide étape par étape pour enchérir et payer
 */

'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Smartphone, CreditCard, MapPin, FileText, Gift } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  {
    id: 1,
    title: "Découvrez les lots",
    description: "Parcourez notre catalogue d'enchères chaque semaine",
    icon: Gift,
    details: [
      "📅 Lundi à mercredi : Prévisualisation des lots",
      "👀 Consultez descriptions, photos et prix de départ",
      "❤️ Ajoutez vos favoris pour être notifié",
      "📱 Recevez une alerte WhatsApp à l'ouverture"
    ],
    image: "/guide/step1.jpg",
    color: "from-blue-500 to-blue-600"
  },
  {
    id: 2,
    title: "Enchérissez en toute simplicité",
    description: "Placez vos offres dès jeudi minuit",
    icon: Smartphone,
    details: [
      "🔥 Jeudi 00h00 : Ouverture des enchères",
      "💰 Cliquez sur \"Faire une offre\"",
      "➕ Le prix augmente par paliers automatiques",
      "🔔 Recevez une notification WhatsApp si vous êtes dépassé"
    ],
    image: "/guide/step2.jpg",
    color: "from-green-500 to-emerald-600"
  },
  {
    id: 3,
    title: "Remportez l'enchère",
    description: "Soyez le dernier enchérisseur vendredi midi",
    icon: Check,
    details: [
      "⏰ Vendredi 12h00 : Clôture automatique",
      "🏆 Le dernier enchérisseur remporte le lot",
      "📱 Notification WhatsApp immédiate au gagnant",
      "✅ Confirmation par email avec détails"
    ],
    image: "/guide/step3.jpg",
    color: "from-yellow-500 to-orange-600"
  },
  {
    id: 4,
    title: "Payez avec Airtel Money",
    description: "Réglement simple et sécurisé",
    icon: CreditCard,
    details: [
      "💳 Paiement via Airtel Money",
      "📲 < 1 000 000 FCFA : Lien de paiement WhatsApp",
      "🏦 > 1 000 000 FCFA : Virement + Preuve de dépôt",
      "✅ Validation sous 24h"
    ],
    image: "/guide/step4.jpg",
    color: "from-red-500 to-pink-600"
  },
  {
    id: 5,
    title: "Récupérez votre article",
    description: "Retrait simple avec QR code",
    icon: MapPin,
    details: [
      "📦 Après paiement : Génération QR code de retrait",
      "📍 Lieu : Douane Gabon (adresse fournie)",
      "🕐 Horaires : Lundi-Vendredi 9h-16h",
      "✅ Présentez votre QR code + Pièce d'identité"
    ],
    image: "/guide/step5.jpg",
    color: "from-purple-500 to-indigo-600"
  }
]

export default function CommentCaMarchePage() {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = STEPS[currentStep]
  const StepIcon = step.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/logo-douane.jpg"
              alt="Douane Gabon"
              className="h-20 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Comment ça marche ?</h1>
              <p className="text-gray-600 text-sm">Guide complet en 5 étapes</p>
            </div>
          </div>
          <Link 
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium hover:shadow-lg transition"
          >
            Retour aux enchères
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, index) => (
              <div 
                key={s.id}
                className="flex-1 relative"
              >
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      index === currentStep
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-110 shadow-lg'
                        : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? <Check size={20} /> : s.id}
                  </button>
                  <span className={`text-xs mt-2 font-medium text-center ${
                    index === currentStep ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Content */}
            <div className="p-12 lg:p-16">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} mb-8`}>
                <StepIcon className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-5">
                Étape {step.id} : {step.title}
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                {step.description}
              </p>

              <div className="space-y-5">
                {step.details.map((detail, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>

              {/* Special Payment Info */}
              {step.id === 4 && (
                <div className="mt-10 p-8 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl">
                  <h3 className="font-bold text-orange-900 mb-6 flex items-center gap-2 text-lg">
                    <CreditCard className="w-6 h-6" />
                    Modalités de paiement
                  </h3>
                  <div className="space-y-6 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-orange-600 text-2xl">📱</span>
                      <div>
                        <strong className="text-orange-900 block mb-2">Moins de 1 000 000 FCFA</strong>
                        <p className="text-orange-700 leading-relaxed">Vous recevrez un lien Airtel Money par WhatsApp. Cliquez et payez en 30 secondes.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-orange-600 text-2xl">🏦</span>
                      <div>
                        <strong className="text-orange-900 block mb-2">Plus de 1 000 000 FCFA</strong>
                        <p className="text-orange-700 leading-relaxed">Coordonnées bancaires envoyées par WhatsApp. Effectuez le virement et envoyez la preuve de dépôt.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Pickup Info */}
              {step.id === 5 && (
                <div className="mt-10 p-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl">
                  <h3 className="font-bold text-purple-900 mb-6 flex items-center gap-2 text-lg">
                    <MapPin className="w-6 h-6" />
                    Lieu de retrait
                  </h3>
                  <div className="space-y-3 text-sm text-purple-700">
                    <p className="leading-relaxed"><strong>Adresse :</strong> Direction Générale des Douanes</p>
                    <p className="leading-relaxed">BP 106, Libreville, Gabon</p>
                    <p className="leading-relaxed"><strong>Tél :</strong> +241 01 76 XX XX</p>
                    <p className="leading-relaxed"><strong>Horaires :</strong> Lun-Ven 9h-16h</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Illustration */}
            <div className={`bg-gradient-to-br ${step.color} p-12 flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>
              <div className="relative z-10 text-center">
                <StepIcon className="w-48 h-48 text-white mx-auto mb-6 opacity-90" />
                <p className="text-white text-2xl font-bold mb-2">Étape {step.id}/{STEPS.length}</p>
                <p className="text-white/80 text-lg">{step.title}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-200 px-12 lg:px-16 py-8 flex items-center justify-between bg-gray-50">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <ChevronLeft size={20} />
              Précédent
            </button>

            <div className="flex gap-2">
              {STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition ${
                    index === currentStep ? 'bg-green-500 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep === STEPS.length - 1 ? (
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition"
              >
                Commencer à enchérir
                <Check size={20} />
              </Link>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition"
              >
                Suivant
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">📞 Besoin d'aide ?</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">Notre équipe est là pour vous</p>
            <button className="text-green-600 font-medium text-sm hover:underline">
              Contacter le support →
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">📋 Conditions générales</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">Lisez nos conditions d'utilisation</p>
            <button className="text-green-600 font-medium text-sm hover:underline">
              Voir les CGU →
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">💡 Astuces</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">Maximisez vos chances de gagner</p>
            <button className="text-green-600 font-medium text-sm hover:underline">
              Lire nos conseils →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
