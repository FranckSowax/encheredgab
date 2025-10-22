/**
 * Utilitaires pour la modération de contenu avec OpenAI
 */

import OpenAI from 'openai'
// import type { AIModerationRequest, AIModerationResponse } from '@/types/lot.types'

// Lazy initialization to avoid build-time errors when API key is not set
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

/**
 * Modérer le contenu (texte ou image)
 */
export async function moderateContent(
  request: any
): Promise<any> {
  try {
    // If OpenAI is not configured, return a default approval
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, skipping moderation')
      return {
        approved: true,
        score: 0.8,
        flags: [],
        labels: ['no-moderation'],
      }
    }

    const { content, type } = request

    if (type === 'text') {
      return await moderateText(content)
    } else if (type === 'image') {
      return await moderateImage(content)
    }

    throw new Error('Invalid moderation type')
  } catch (error) {
    console.error('Error moderating content:', error)
    // Return a default approval on error to not block the flow
    return {
      approved: true,
      score: 0.5,
      flags: [],
      labels: ['moderation-error'],
    }
  }
}

/**
 * Modérer du texte avec l'API Moderation d'OpenAI
 */
async function moderateText(text: string): Promise<any> {
  try {
    const moderation = await getOpenAIClient().moderations.create({
      input: text,
      model: 'text-moderation-latest',
    })

    const result = moderation.results[0]
    const flags = []

    // Analyser les catégories flaggées
    if (result.categories.hate) {
      flags.push({
        type: 'hate',
        severity: result.category_scores.hate > 0.8 ? 'high' as const : 'medium' as const,
        description: 'Contenu haineux détecté'
      })
    }

    if (result.categories.violence) {
      flags.push({
        type: 'violence',
        severity: result.category_scores.violence > 0.8 ? 'high' as const : 'medium' as const,
        description: 'Contenu violent détecté'
      })
    }

    if (result.categories.sexual) {
      flags.push({
        type: 'sexual',
        severity: result.category_scores.sexual > 0.8 ? 'high' as const : 'medium' as const,
        description: 'Contenu sexuel détecté'
      })
    }

    if (result.categories['self-harm']) {
      flags.push({
        type: 'self-harm',
        severity: 'high' as const,
        description: 'Contenu d\'automutilation détecté'
      })
    }

    // Calculer un score global
    const scores = Object.values(result.category_scores)
    const maxScore = Math.max(...scores)
    const score = 1 - maxScore // Inverser pour que 1 = safe

    return {
      approved: !result.flagged,
      score,
      flags,
      labels: Object.keys(result.categories).filter(
        key => result.categories[key as keyof typeof result.categories]
      ),
    }
  } catch (error) {
    console.error('Error moderating text:', error)
    throw error
  }
}

/**
 * Modérer une image avec GPT-4o Vision
 */
async function moderateImage(imageUrl: string): Promise<any> {
  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Tu es un modérateur de contenu pour une plateforme d'enchères.
Analyse l'image et détecte:
- Contenu inapproprié (violence, nudité, etc.)
- Qualité de l'image (floue, trop sombre, etc.)
- Pertinence pour un lot d'enchères

Réponds en JSON avec:
{
  "appropriate": boolean,
  "issues": ["liste des problèmes détectés"],
  "quality_score": number (0-1),
  "recommendations": ["suggestions d'amélioration"]
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyse cette image pour modération:'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 300,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(
      completion.choices[0]?.message?.content || '{}'
    )

    const flags = result.issues?.map((issue: string) => ({
      type: 'image_issue',
      severity: result.appropriate ? 'low' as const : 'high' as const,
      description: issue
    })) || []

    return {
      approved: result.appropriate || false,
      score: result.quality_score || 0.5,
      flags,
      labels: result.issues || [],
    }
  } catch (error) {
    console.error('Error moderating image:', error)
    throw error
  }
}

/**
 * Vérifier la qualité d'une image
 */
export async function checkImageQuality(imageUrl: string): Promise<{
  score: number
  issues: string[]
  recommendations: string[]
}> {
  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Évalue la qualité de cette image pour un lot d'enchères.
Vérifie:
- Netteté et résolution
- Éclairage
- Cadrage
- Arrière-plan

Réponds en JSON: { "score": 0-1, "issues": [], "recommendations": [] }`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 200,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return {
      score: result.score || 0.5,
      issues: result.issues || [],
      recommendations: result.recommendations || []
    }
  } catch (error) {
    console.error('Error checking image quality:', error)
    return {
      score: 0.5,
      issues: ['Impossible de vérifier la qualité'],
      recommendations: []
    }
  }
}

/**
 * Détecter les objets dans une image
 */
export async function detectObjects(imageUrl: string): Promise<string[]> {
  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Liste les objets principaux visibles dans cette image. Réponds avec un JSON: { "objects": ["liste"] }'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 150,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}')
    return result.objects || []
  } catch (error) {
    console.error('Error detecting objects:', error)
    return []
  }
}

/**
 * Batch moderation pour plusieurs textes/images
 */
export async function batchModerate(
  items: any[]
): Promise<any[]> {
  const results = await Promise.allSettled(
    items.map(item => moderateContent(item))
  )

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      // En cas d'erreur, retourner un résultat par défaut
      return {
        approved: false,
        score: 0,
        flags: [{
          type: 'error',
          severity: 'high' as const,
          description: 'Erreur lors de la modération'
        }],
        labels: ['error']
      }
    }
  })
}
