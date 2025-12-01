import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/lib/AuthContext'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HireGuide Connect - Find Local Guides & Hotels',
  description: 'Connect with verified local guides and find perfect accommodations in Sikkim',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
            <AuthProvider>
        <Header />
        <main className="min-h-screen">
         
          {children}
          
        </main>
        <Footer />
        </AuthProvider>
          <ToastContainer />
      </body>
    </html>
  )
}
