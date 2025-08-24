/** OCRテキスト解析・構造化データ抽出モジュール */

export interface ParsedReceiptData {
  amount?: number
  date?: Date
  vendor?: string
  description?: string
  rawText: string
}

export interface TextParser {
  parseReceiptText(text: string): ParsedReceiptData
  extractAmount(text: string): number | null
  extractDate(text: string): Date | null
  extractVendor(text: string): string | null
}

export class ReceiptTextParser implements TextParser {
  private readonly amountPatterns = [
    /¥([\d,]+)/g,
    /￥([\d,]+)/g,
    /金額[：:\s]*([\d,]+)/g,
    /合計[：:\s]*¥?([\d,]+)/g,
    /小計[：:\s]*¥?([\d,]+)/g,
    /(\d{1,3}(?:,\d{3})+)円/g,
  ]

  private readonly datePatterns = [
    /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/g,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    /(\d{1,2})月(\d{1,2})日/g,
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/g,
  ]

  private readonly vendorPatterns = [
    /^([^\n\r]+)/,
    /店舗[：:\s]*([^\n\r]+)/,
    /([^\n\r]*(?:株式会社|有限会社|コンビニ|スーパー|ストア)[^\n\r]*)/,
  ]

  parseReceiptText(text: string): ParsedReceiptData {
    if (!text || text.trim().length === 0) return { rawText: text }
    return {
      amount: this.extractAmount(text) || undefined,
      date: this.extractDate(text) || undefined,
      vendor: this.extractVendor(text) || undefined,
      description: this.extractDescription(text) || undefined,
      rawText: text,
    }
  }

  extractAmount(text: string): number | null {
    const amounts: number[] = []
    for (const pattern of this.amountPatterns) {
      let match: RegExpExecArray | null = pattern.exec(text)
      while (match !== null) {
        const amount = Number.parseInt(match[1].replace(/,/g, ''), 10)
        if (!Number.isNaN(amount) && amount > 0) amounts.push(amount)
        match = pattern.exec(text)
      }
    }
    return amounts.length > 0 ? Math.max(...amounts) : null
  }

  extractDate(text: string): Date | null {
    let match = text.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/)
    if (match) {
      const date = new Date(
        Number.parseInt(match[1], 10),
        Number.parseInt(match[2], 10) - 1,
        Number.parseInt(match[3], 10)
      )
      if (this.isValidDate(date)) return date
    }
    match = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
    if (match) {
      const date = new Date(
        Number.parseInt(match[3], 10),
        Number.parseInt(match[1], 10) - 1,
        Number.parseInt(match[2], 10)
      )
      if (this.isValidDate(date)) return date
    }
    match = text.match(/(\d{1,2})月(\d{1,2})日/)
    if (match) {
      const date = new Date(
        new Date().getFullYear(),
        Number.parseInt(match[1], 10) - 1,
        Number.parseInt(match[2], 10)
      )
      if (this.isValidDate(date)) return date
    }
    return null
  }

  extractVendor(text: string): string | null {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
    if (lines.length > 0) {
      const firstLine = lines[0].trim()
      if (firstLine && !this.isNumericLine(firstLine)) return firstLine
    }
    for (const pattern of this.vendorPatterns) {
      const match = text.match(pattern)
      if (match?.[1] && !this.isNumericLine(match[1])) return match[1].trim()
    }
    return null
  }

  private extractDescription(text: string): string | null {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
    for (let i = 1; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].trim()
      if (line && !this.isNumericLine(line) && !line.includes('¥') && !line.includes('円'))
        return line
    }
    return null
  }

  private isValidDate(date: Date): boolean {
    return date instanceof Date && !Number.isNaN(date.getTime())
  }

  private isNumericLine(line: string): boolean {
    return /^[\d\s,¥￥円]+$/.test(line)
  }
}

export const defaultTextParser = new ReceiptTextParser()

export function parseReceiptText(text: string): ParsedReceiptData {
  return defaultTextParser.parseReceiptText(text)
}
