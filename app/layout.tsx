import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Professional Metal Weight Calculator",
  description:
    "Calculate weights for structural steel profiles, aluminum alloys, and other metals. Supports I-beams, angles, channels, pipes, and tubes with professional accuracy.",
  keywords:
    "metal weight calculator, structural steel, I-beam calculator, angle weight, channel weight, pipe weight, aluminum weight, engineering calculator",
  authors: [{ name: "Professional Metal Calculator" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#2563eb",
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
