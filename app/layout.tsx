import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { I18nProvider } from "@/contexts/i18n-context"
import { ColorThemeProvider } from "@/contexts/color-theme-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Professional Metal Calculator",
  description: "Calculate weights and properties for structural profiles and materials",
  keywords: ["metal calculator", "steel calculator", "weight calculator", "structural calculator", "engineering calculator"],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
              <div className="min-h-screen bg-background text-foreground antialiased">
                <ErrorBoundary>
                  {children}
                  <Toaster />
                </ErrorBoundary>
              </div>
            </ColorThemeProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
