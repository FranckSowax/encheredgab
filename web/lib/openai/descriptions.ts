/**
 * Utilitaires pour la génération de descriptions de lots avec GPT-4o
 */

import OpenAI from 'openai'
// import type { AIDescriptionRequest, AIDescriptionResponse } from '@/types/lot.types'

// Initialiser le client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Générer une description de lot avec GPT-4o
 */
export async function generateLotDescription(
  request: any
): Promise<any> {
  try {
    const { title, category, images, existing_description } = request

    // Construire le prompt
    const prompt = buildDescriptionPrompt(title, category, existing_description)

    // Analyser les images avec GPT-4o Vision si disponibles
    let imageAnalysis = ''
    if (images && images.length > 0) {
      imageAnalysis = await analyzeImages(images)
    }

    // Générer la description avec GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en rédaction de descriptions de lots pour des enchères douanières au Gabon.
Tu dois créer des descriptions:
- Professionnelles et objectives
- Détaillées et informatives
- Conformes aux standards des enchères
- En français correct
- Factuelles sans exagération
- Mentionnant les défauts visibles`
        },
        {
          role: 'user',
          content: `${prompt}\n\n${imageAnalysis ? `Analyse des images:\n${imageAnalysis}` : ''}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const description = completion.choices[0]?.message?.content || ''

    // Générer des suggestions d'amélioration
    const suggestions = await generateSuggestions(title, description)

    return {
      description,
      confidence: calculateConfidence(completion),
      suggestions,
    }
  } catch (error) {
    console.error('Error generating lot description:', error)
    throw new Error('Failed to generate description')
  }
}

/**
 * Analyser des images de lot avec GPT-4o Vision
 */
async function analyzeImages(imageUrls: string[]): Promise<string> {
  try {
    // Limiter à 4 images maximum pour l'analyse
    const limitedImages = imageUrls.slice(0, 4)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyse ces images d'un lot pour enchères. Décris:
1. L'état général (neuf, bon, usagé, endommagé)
2. Les caractéristiques visibles
3. Les défauts ou dommages apparents
4. La marque/modèle si visible
5. Les particularités notables

Sois factuel et précis.`
            },
            ...limitedImages.map(url => ({
              type: 'image_url' as const,
              image_url: { url }
            }))
          ]
        }
      ],
      max_tokens: 300,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error analyzing images:', error)
    return ''
  }
}

/**
 * Construire le prompt pour la génération de description
 */
function buildDescriptionPrompt(
  title: string,
  category?: string,
  existingDescription?: string
): string {
  let prompt = `Génère une description professionnelle pour ce lot d'enchères:\n\nTitre: ${title}`

  if (category) {
    prompt += `\nCatégorie: ${category}`
  }

  if (existingDescription) {
    prompt += `\n\nDescription actuelle (à améliorer):\n${existingDescription}`
  }

  prompt += `\n\nLa description doit inclure:
- Un paragraphe introductif attractif
- Les caractéristiques techniques si applicables
- L'état du produit
- Les points importants à noter pour l'acheteur potentiel
- Utilise un ton professionnel mais accessible`

  return prompt
}

/**
 * Générer des suggestions d'amélioration
 */
async function generateSuggestions(
  title: string,
  description: string
): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modèle plus léger pour les suggestions
      messages: [
        {
          role: 'user',
          content: `Pour ce lot "${title}" avec la description suivante:

${description}

Suggère 3 points d'information qui pourraient être ajoutés pour améliorer la description.
Réponds avec une liste JSON de strings.`
        }
      ],
      temperature: 0.5,
      max_tokens: 150,
      response_format: { type: 'json_object' }
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return response.suggestions || []
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}

/**
 * Calculer le score de confiance basé sur la réponse
 */
function calculateConfidence(completion: OpenAI.Chat.Completions.ChatCompletion): number {
  // Utiliser la longueur de la réponse et la présence de finish_reason
  const hasFinishReason = completion.choices[0]?.finish_reason === 'stop'
  const contentLength = completion.choices[0]?.message?.content?.length || 0
  
  let confidence = 0.5

  if (hasFinishReason) confidence += 0.3
  if (contentLength > 100) confidence += 0.2
  
  return Math.min(confidence, 1.0)
}

/**
 * Améliorer une description existante
 */
export async function improveLotDescription(
  currentDescription: string,
  feedback?: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Tu améliores les descriptions de lots pour enchères en les rendant plus claires, précises et professionnelles.'
        },
        {
          role: 'user',
          content: `Améliore cette description:\n\n${currentDescription}\n\n${feedback ? `Feedback: ${feedback}` : ''}`
        }
      ],
      temperature: 0.6,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || currentDescription
  } catch (error) {
    console.error('Error improving description:', error)
    throw new Error('Failed to improve description')
  }
}
