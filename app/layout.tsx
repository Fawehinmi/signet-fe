import type { Metadata } from "next"
import { Open_Sans, Roboto } from "next/font/google"
import "./globals.css"

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" })
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-roboto" })

export const metadata: Metadata = {
  title: "Signet",
}

export const instant = false

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${openSans.variable} ${roboto.variable}`}>
      <body className="bg-white font-sans text-grey-900 antialiased">{children}</body>
    </html>
  )
}


