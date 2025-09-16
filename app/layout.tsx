import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ConditionalSiteHeader } from "@/components/conditional-site-header"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/hooks/use-cart"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nwigwe Loveth Ginikiwa - Grocery Store",
  description: "Your one-stop shop for all grocery needs",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <ConditionalSiteHeader />
            <main className="flex-1">{children}</main>
            <Toaster />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
