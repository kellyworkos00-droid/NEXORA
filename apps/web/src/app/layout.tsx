import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NEXORA - The AI Business Operating System',
  description: 'AI-native CRM, ERP, and Business Automation Platform. Built for the future of work.',
  keywords: ['CRM', 'ERP', 'AI', 'Business Automation', 'SaaS', 'Enterprise Software'],
  authors: [{ name: 'NEXORA Team' }],
  openGraph: {
    title: 'NEXORA - The AI Business Operating System',
    description: 'AI-native business platform that predicts, automates, and optimizes your operations',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
