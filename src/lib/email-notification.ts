/**
 * @fileoverview メール通知サービス - 週次処理結果の通知
 * @module lib/email-notification
 */

import fs from 'node:fs'
import path from 'node:path'
import { Resend } from 'resend'

/** 通知データインターフェース */
export interface NotificationData {
  processedCount: number
  successCount: number
  failedCount: number
  errors: string[]
  processedAt: Date
}

/** メール通知インターフェース */
export interface EmailNotification {
  to: string
  subject: string
  html: string
  text?: string
}

/** 通知サービスインターフェース */
export interface NotificationService {
  sendProcessingReport(data: NotificationData): Promise<boolean>
  formatReport(data: NotificationData): EmailNotification
}

/** メール通知サービス実装 */
export class EmailNotificationService implements NotificationService {
  private resend: Resend | null = null
  private templatePath = path.join(process.cwd(), 'src/templates/notification-email.html')

  constructor() {
    if (process.env.EMAIL_ENABLED === 'true' && process.env.EMAIL_API_KEY) {
      this.resend = new Resend(process.env.EMAIL_API_KEY)
    }
  }

  /** 処理レポートをメール送信 */
  async sendProcessingReport(data: NotificationData): Promise<boolean> {
    if (!this.resend || !process.env.NOTIFICATION_EMAIL) {
      console.warn('Email notification is not configured')
      return false
    }

    try {
      const notification = this.formatReport(data)
      const result = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        to: notification.to,
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
      })

      console.log(`Email sent successfully: ${result.data?.id}`)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  /** レポートのフォーマット */
  formatReport(data: NotificationData): EmailNotification {
    const template = this.loadTemplate()
    const html = this.processTemplate(template, data)
    const text = this.generateTextVersion(data)

    return {
      to: process.env.NOTIFICATION_EMAIL || '',
      subject: `週次処理レポート - ${data.processedAt.toLocaleDateString('ja-JP')}`,
      html,
      text,
    }
  }

  /** テンプレート読み込み */
  private loadTemplate(): string {
    try {
      return fs.readFileSync(this.templatePath, 'utf-8')
    } catch {
      return this.getDefaultTemplate()
    }
  }

  /** テンプレート処理 */
  private processTemplate(template: string, data: NotificationData): string {
    return template
      .replace('{{processedCount}}', data.processedCount.toString())
      .replace('{{successCount}}', data.successCount.toString())
      .replace('{{failedCount}}', data.failedCount.toString())
      .replace('{{processedAt}}', data.processedAt.toLocaleString('ja-JP'))
      .replace('{{errors}}', data.errors.map((e) => `<li>${e}</li>`).join(''))
  }

  /** テキスト版生成 */
  private generateTextVersion(data: NotificationData): string {
    return `週次処理レポート
処理日時: ${data.processedAt.toLocaleString('ja-JP')}
処理件数: ${data.processedCount}件
成功: ${data.successCount}件
失敗: ${data.failedCount}件
${data.errors.length > 0 ? `エラー:\n${data.errors.join('\n')}` : ''}`
  }

  /** デフォルトテンプレート */
  private getDefaultTemplate(): string {
    return `<!DOCTYPE html>
<html><body><h2>週次処理レポート</h2>
<p>処理日時: {{processedAt}}</p>
<p>処理件数: {{processedCount}}件 (成功: {{successCount}}件, 失敗: {{failedCount}}件)</p>
<ul>{{errors}}</ul></body></html>`
  }
}
