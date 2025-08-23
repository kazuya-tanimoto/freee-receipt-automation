/**
 * Google Vision API OCR処理ライブラリ
 */
import { readFileSync } from 'node:fs'

export interface OCRResult {
  text: string
  confidence: number
  boundingBoxes?: BoundingBox[]
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface VisionOCR {
  extractText(filePath: string): Promise<OCRResult>
  processDocument(buffer: Buffer): Promise<string>
}

/**
 * Google Vision API OCR処理クラス
 */
export class GoogleVisionOCR implements VisionOCR {
  private apiKey: string
  private baseUrl = 'https://vision.googleapis.com/v1/images:annotate'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_VISION_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('Google Vision API key is required')
    }
  }

  async extractText(filePath: string): Promise<OCRResult> {
    const buffer = readFileSync(filePath)
    return await this.processImage(buffer.toString('base64'))
  }

  async processDocument(buffer: Buffer): Promise<string> {
    const result = await this.processImage(buffer.toString('base64'))
    return result.text
  }

  private async processImage(base64Image: string): Promise<OCRResult> {
    const requestBody = {
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        },
      ],
    }

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Vision API request failed: ${response.status}`)
    }

    const data = await response.json()
    const textAnnotations = data.responses?.[0]?.textAnnotations || []

    if (textAnnotations.length === 0) {
      return { text: '', confidence: 0 }
    }

    const mainText = textAnnotations[0]
    return {
      text: mainText.description || '',
      confidence: mainText.confidence || 0,
    }
  }
}
