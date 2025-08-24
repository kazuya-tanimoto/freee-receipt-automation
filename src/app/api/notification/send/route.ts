/**
 * @fileoverview メール送信APIエンドポイント
 */

import { EmailNotificationService, type NotificationData } from '@/lib/email-notification'
import { type NextRequest, NextResponse } from 'next/server'

/** POST /api/notification/send - 手動メール送信 */
export async function POST(request: NextRequest) {
  try {
    const data: NotificationData = await request.json()

    // データ検証
    if (
      typeof data.processedCount !== 'number' ||
      typeof data.successCount !== 'number' ||
      typeof data.failedCount !== 'number' ||
      !Array.isArray(data.errors) ||
      !data.processedAt
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification data' },
        { status: 400 }
      )
    }

    // 日付変換
    const notificationData: NotificationData = {
      ...data,
      processedAt: new Date(data.processedAt),
    }

    const service = new EmailNotificationService()
    const success = await service.sendProcessingReport(notificationData)

    if (success) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 })
  } catch (error) {
    console.error('Email send API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
