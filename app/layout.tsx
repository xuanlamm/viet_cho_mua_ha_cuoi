import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lời Tri Ân Cho Thầy Cô Về Hưu",
  description: "Lời tri ân chân thành dành cho thầy cô kính yêu của chúng tôi nhân dịp về hưu",
  openGraph: {
    title: "Lời Tri Ân Cho Thầy Cô Về Hưu",
    description: "Lời tri ân chân thành dành cho thầy cô kính yêu của chúng tôi nhân dịp về hưu",
    images: [
      {
        // You can replace this with your actual image URL
        url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format",
        width: 1200,
        height: 630,
        alt: "Lời Tri Ân Cho Thầy Cô Về Hưu",
      },
    ],
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
