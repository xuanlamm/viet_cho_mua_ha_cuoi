import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Xuân Lâm - Viết cho mùa hạ cuối",
  description: "Bức thư Viết cho mùa hạ cuối của Xuân Lâm",
  openGraph: {
    title: "Xuân Lâm - Viết cho mùa hạ cuối",
    description: "Bức thư Viết cho mùa hạ cuối của Xuân Lâm",
    images: [
      {
        url: "https://i.imgur.com/1pZW78k.png",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.ico" sizes="180x180" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#DB2777" />
        <meta name="description" content="Bức thư Viết cho mùa hạ cuối của Xuân Lâm" />
        <meta name="keywords" content="Viết cho mùa hạ cuối, Xuân Lâm, viết, thư, mùa hạ, thanh xuân, cấp 3" />
        <meta name="author" content="Xuân Lâm" />
        <meta name="facebook-domain-verification" content="j9bo1ne9hm2fjr0oeffvn4x160wjsa" />
        <meta property="fb:app_id" content="4015144605393292" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Xuân Lâm - Viết cho mùa hạ cuối" />   
        <meta property="og:description" content="Bức thư Viết cho mùa hạ cuối của Xuân Lâm" />
        <meta property="og:image:url" content="https://i.imgur.com/1pZW78k.png" />   
        <meta property="og:image:secure" content="https://i.imgur.com/1pZW78k.png" />
        <meta property="og:image:secure_url" content="https://i.imgur.com/1pZW78k.png" />
        <meta property="og:image" content="https://i.imgur.com/1pZW78k.png" />   
        <meta property="og:url" content="https://xuanlamvietchomuahacuoi.vercel.app/" />
        <meta property="og:site_name" content="Xuân Lâm - Viết cho mùa hạ cuối" />        
        <meta property="og:locale" content="vi_VN" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <SpeedInsights/>
        <Analytics/>
        {children}
      </body>
    </html>
  )
}
