import 'katex/dist/katex.min.css'
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastContainer } from 'react-toastify';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ABC Classes - Leading JEE & NEET Coaching Institute",
  description:
    "Join thousands of successful students who cracked JEE Main & Advanced with our expert guidance, comprehensive study material, and cutting-edge online testing platform.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
      </body>
    </html>
  )
}
