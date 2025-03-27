import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./qr-scanner.css" // Import QR scanner styles
import { Toaster } from "@/components/ui/toaster"
// import { GoogleOAuthProvider } from '@react-oauth/google';
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Office Supplies Stock Monitoring",
  description: "A system for monitoring office supplies stock",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // <GoogleOAuthProvider clientId="1063926688260-4p2t92j1n1vkicc9bhrnmdpt4r280mot.apps.googleusercontent.com">
      <html lang="en">
        {/* <head>
          <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' http://localhost:8000;" />
          <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin" />
          <meta httpEquiv="Cross-Origin-Resource-Policy" content="cross-origin" />
        </head> */}
        <body className={inter.className} suppressHydrationWarning={true}>
          {children}
          <Toaster />
        </body>
      </html>
    // </GoogleOAuthProvider>
  )
}



import './globals.css'