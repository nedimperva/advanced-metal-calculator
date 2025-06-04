import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Professional Metal Weight Calculator",
  description:
    "Calculate weights for structural steel profiles, aluminum alloys, and other metals. Supports I-beams, angles, channels, pipes, and tubes with professional accuracy.",
  keywords:
    "metal weight calculator, structural steel, I-beam calculator, angle weight, channel weight, pipe weight, aluminum weight, engineering calculator",
  authors: [{ name: "Professional Metal Calculator" }],
  manifest: "/manifest.json",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  openGraph: {
    title: 'Professional Metal Weight Calculator',
    description: 'Calculate weights for structural steel profiles and other metals with professional accuracy.',
    type: 'website',
    locale: 'en_US',
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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Metal Calc Pro" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
        
        {/* Service Worker Registration */}
        <Script id="sw-register">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
