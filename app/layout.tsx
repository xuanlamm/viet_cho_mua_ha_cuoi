import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans } from "next/font/google"
import "./globals.css"

const inter = Noto_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Xuân Lâm - Viết cho mùa hạ cuối",
  description: "Bức thư Viết cho mùa hạ cuối của Xuân Lâm",
  openGraph: {
    title: "Xuân Lâm - Viết cho mùa hạ cuối",
    description: "Bức thư Viết cho mùa hạ cuối của Xuân Lâm",
    images: [
      {
        url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format",
        width: 1200,
        height: 630,
        alt: "Xuân Lâm - Viết cho mùa hạ cuối",
      },
    ],
    type: "website",
  },
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
