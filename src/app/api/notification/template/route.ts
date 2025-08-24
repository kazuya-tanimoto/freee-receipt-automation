/**
 * @fileoverview メールテンプレートプレビューAPIエンドポイント
 */

import { EmailNotificationService, type NotificationData } from '@/lib/email-notification'
import { type NextRequest, NextResponse } from 'next/server'

/** GET /api/notification/template - メールテンプレートプレビュー */
export async function GET(request: NextRequest) {
  try {
    // サンプルデータ生成
    const sampleData: NotificationData = {
      processedCount: 15,
      successCount: 12,
      failedCount: 3,
      errors: [
        'ファイル形式が不正です: receipt_001.txt',
        'OCRスキャンに失敗しました: receipt_002.pdf',
        'freee API接続エラー: タイムアウト',
      ],
      processedAt: new Date(),
    }

    const service = new EmailNotificationService()
    const notification = service.formatReport(sampleData)

    return NextResponse.json({
      html: notification.html,
      text: notification.text,
    })
  } catch (error) {
    console.error('Template preview API error:', error)
    return NextResponse.json({ error: 'Failed to generate template preview' }, { status: 500 })
  }
}
