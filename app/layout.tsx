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
      <body className={inter.className}>
        <I18nProvider>
          <ThemeProvider>
            <ColorThemeProvider>
              <ProjectProvider>
                <TaskProvider>
                  <div className="min-h-screen bg-background text-foreground antialiased">
                    <ErrorBoundary>
                      {children}
                      <Toaster />
                    </ErrorBoundary>
                  </div>
                </TaskProvider>
              </ProjectProvider>
            </ColorThemeProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
