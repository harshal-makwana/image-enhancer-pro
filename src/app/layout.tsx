import { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://https://image-editer.netlify.app'),
  title: {
    default: 'AI Image Enhancer and Upscaler | Free Online Photo Editor and Enhancer ',
    template: '%s | AI Image Editor and Upscaler'
  },
  description: 'Professional image editing tools powered by AI. Edit, enhance, crop, remove backgrounds, and apply artistic filters to your photos for free. No signup required.',
  keywords: [
    'image processor',
    'ai image processor',
    'image processor ai',
    'image editor',
    'photo editor',
    'AI image enhancement',
    'background removal',
    'photo filters',
    'image cropping',
    'image compression',
    'online photo editor',
    'free image editor',
    'AI photo effects'
  ],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name/Company',
  publisher: 'Your Company',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://image-enhancer-pro.vercel.app/',
    title: 'AI Image Processor | Free Online Photo Editor',
    description: 'Transform your photos with AI-powered enhancement tools. Free online image editor with professional features.',
    siteName: 'AI Image Processor',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'AI Image Processor Preview'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Processor | Free Online Photo Editor',
    description: 'Transform your photos with AI-powered enhancement tools',
    images: ['/og-image.jpg'],
    creator: '@yourhandle'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'pWF8-Eur1dFQKi9UEEReEBI-s0v_DXvAoFSDvkJEL6I',
    yandex: 'ed53b787034b805d'
  },

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Schema.org markup for rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "AI Image Processor",
              "applicationCategory": "Image Editor",
              "operatingSystem": "Any",
              "description": "Professional image editing tools powered by AI. Edit, enhance, crop, remove backgrounds, and apply artistic filters to your photos.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "AI Image Enhancement",
                "Background Removal",
                "Face Retouching",
                "Style Transfer",
                "Image Cropping",
                "Filters and Effects",
                "Image Compression",
                "Format Conversion"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
