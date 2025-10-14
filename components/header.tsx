"use client"

import Link from "next/link"
import Image from "next/image"
import { Trophy, TestTube, LogOut, Shield, ShieldAlert, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface HeaderProps {
  siteName: string
  siteTagline: string
  logoUrl?: string
}

export default function Header({ siteName, siteTagline, logoUrl }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          // Fetch student data from Firestore
          const studentDocRef = doc(db, "students", currentUser.uid)
          const studentDoc = await getDoc(studentDocRef)
          console.log(currentUser.uid)
          if (studentDoc.exists()) {
            const studentData = studentDoc.data()
            console.log({studentData})
            setIsVerified(studentData.isVerified || false)
          } else {
            setIsVerified(false)
          }
        } catch (error) {
          console.error("Error fetching student data:", error)
          setIsVerified(false)
        }
      } else {
        setIsVerified(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setIsVerified(null)
      setIsMobileMenuOpen(false) // Close mobile menu on logout
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'JEE', href: '/jee' },
    { name: 'NEET', href: '/neet' },
    { name: 'Results', href: '/results' },
    { name: 'Contact', href: '/contact' },
    { name: 'Media', href: '/media' },
  ]

  return (
      <>
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
          <div className="container flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 text-[#1a73e8]" onClick={closeMobileMenu}>
              <div className="relative">
                {/*<p>{logoUrl}</p>*/}
                {logoUrl ? (
                    <Image src={logoUrl} alt="Logo" width={32} height={32} className="sm:w-10 sm:h-10 rounded" />
                ) : (
                    <Trophy className="h-8 w-8 sm:h-10 sm:w-10 drop-shadow-sm" />
                )}
                <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#1a73e8] to-[#4285f4] bg-clip-text text-transparent">
                {siteName}
              </span>
                <div className="text-xs text-slate-600 font-medium hidden sm:block">{siteTagline}</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navigationItems.map((item) => (
                  <Link
                      key={item.name}
                      href={item.href}
                      className="text-slate-700 hover:text-[#1a73e8] font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
              ))}

              <Link href="/test-series">
                <Button className="bg-gradient-to-r from-[#1a73e8] to-[#4285f4] hover:from-[#1557b0] hover:to-[#3367d6] shadow-lg shadow-[#1a73e8]/25 font-medium">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Series
                </Button>
              </Link>

              {/* Desktop Auth Section */}
              {user && (
                  <div className="flex items-center gap-2">
                    {/* Verification Status Indicator */}
                    {!loading && isVerified !== null && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isVerified
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {isVerified ? (
                              <>
                                <Shield className="w-3 h-3" />
                                Verified
                              </>
                          ) : (
                              <>
                                <ShieldAlert className="w-3 h-3" />
                                Unverified
                              </>
                          )}
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
              )}

              {!user && (
                  <Link href="/auth/login">
                    <Button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium">
                      Login / Register
                    </Button>
                  </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
                className="lg:hidden p-2 rounded-md hover:bg-slate-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-700" />
              ) : (
                  <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={closeMobileMenu}
            />
        )}

        {/* Mobile Menu */}
        <div className={`fixed top-0 right-0 z-50 w-full max-w-sm h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {logoUrl ? (
                      <Image src={logoUrl} alt="Logo" width={32} height={32} className="rounded" />
                  ) : (
                      <Trophy className="h-8 w-8 text-[#1a73e8] drop-shadow-sm" />
                  )}
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-[#1a73e8] to-[#4285f4] bg-clip-text text-transparent">{siteName}</h2>
                  <p className="text-xs text-slate-600 font-medium">{siteTagline}</p>
                </div>
              </div>
              <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                  aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 sm:px-6 py-6 space-y-2">
              {navigationItems.map((item) => (
                  <Link
                      key={item.name}
                      href={item.href}
                      className="block py-3 px-4 text-slate-700 hover:text-[#1a73e8] hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
                      onClick={closeMobileMenu}
                  >
                    {item.name}
                  </Link>
              ))}

              {/* Test Series Button in Mobile */}
              <Link href="/test-series" onClick={closeMobileMenu}>
                <div className="block py-3 px-4 mt-4">
                  <Button className="w-full bg-gradient-to-r from-[#1a73e8] to-[#4285f4] hover:from-[#1557b0] hover:to-[#3367d6] shadow-lg shadow-[#1a73e8]/25 font-medium justify-center">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Series
                  </Button>
                </div>
              </Link>
            </nav>

            {/* Mobile Auth Section */}
            <div className="p-4 sm:p-6 border-t border-slate-100">
              {user ? (
                  <div className="space-y-4">
                    {/* Mobile Verification Status */}
                    {!loading && isVerified !== null && (
                        <div className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium ${
                            isVerified
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {isVerified ? (
                              <>
                                <Shield className="w-4 h-4" />
                                Account Verified
                              </>
                          ) : (
                              <>
                                <ShieldAlert className="w-4 h-4" />
                                Account Unverified
                              </>
                          )}
                        </div>
                    )}

                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full text-red-500 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 py-3"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
              ) : (
                  <Link href="/auth/login" onClick={closeMobileMenu}>
                    <Button className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium py-3">
                      Login / Register
                    </Button>
                  </Link>
              )}

              {/* Quick Info */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                  Excellence in JEE & NEET Preparation
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
  )
}
