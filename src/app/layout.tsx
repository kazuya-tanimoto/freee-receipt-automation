import type { Metadata } from 'next'
import type React from 'react'

export const metadata: Metadata = {
  title: 'freee Receipt Automation',
  description: 'Automated receipt processing for freelance expense tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
