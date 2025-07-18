import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { I18nProvider } from "@/contexts/i18n-context"
import { ColorThemeProvider } from "@/contexts/color-theme-context"
import { ProjectProvider } from "@/contexts/project-context"
import { TaskProvider } from "@/contexts/task-context"
import { CalculationProvider } from "@/contexts/calculation-context"
import { MaterialProvider } from "@/contexts/material-context"
import { MaterialCatalogProvider } from "@/contexts/material-catalog-context"
import { OfflineIndicator } from "@/components/offline-indicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SteelForge Pro - Comprehensive Steel Fabrication Management",
  description: "Professional steel fabrication management platform with project management, workforce tracking, calculations, and timeline management for construction professionals",
  keywords: ["steel fabrication", "construction management", "project management", "workforce tracking", "metal calculator", "structural analysis", "fabrication platform"],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
        
        {/* iOS PWA specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SteelForge Pro" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        
        {/* Additional PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="SteelForge Pro" />
      </head>
      <body className={inter.className}>
        <I18nProvider>
          <ThemeProvider>
            <ColorThemeProvider>
              <CalculationProvider>
                <MaterialProvider>
                  <MaterialCatalogProvider>
                    <ProjectProvider>
                      <TaskProvider>
                      <div className="min-h-screen bg-background text-foreground antialiased">
                        <ErrorBoundary>
                          {children}
                          <Toaster />
                          <OfflineIndicator />
                        </ErrorBoundary>
                      </div>
                      </TaskProvider>
                    </ProjectProvider>
                  </MaterialCatalogProvider>
                </MaterialProvider>
              </CalculationProvider>
            </ColorThemeProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
