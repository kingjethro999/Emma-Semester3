"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart, Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SearchDialog } from "@/components/search-dialog"
import { useCart } from "@/hooks/use-cart"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [auth, setAuth] = useState<{ id: number; name: string; email: string } | null>(null)
  const { itemCount } = useCart()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
    if (token && userJson) {
      try { setAuth(JSON.parse(userJson)) } catch {}
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    document.cookie = 'auth_token=; Max-Age=0; path=/'
    setAuth(null)
    window.location.href = '/'
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-green-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Nwigwe Loveth Ginikiwa
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center space-x-1 flex-1 max-w-md mx-4">
            <Button
              variant="ghost"
              className="w-full flex justify-start pl-3 bg-white text-black hover:bg-white hover:text-black"
              onClick={() => setSearchDialogOpen(true)}
            >
              <Search className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-500">Search products...</span>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/products" className="hover:underline">Products</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            {auth ? (
              <>
                <Link href={`/profile/${auth.id}`} className="hover:underline">My Profile</Link>
                <button className="hover:underline" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:underline">Login</Link>
                <Link href="/signup" className="hover:underline">Sign Up</Link>
              </>
            )}
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-black rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setSearchDialogOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-black rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <Link href="/" className="text-xl font-bold" onClick={() => setMobileMenuOpen(false)}>
                        Nwigwe Loveth Ginikiwa
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <nav className="flex flex-col p-4 gap-4">
                    <Link href="/" className="py-2 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>
                      Home
                    </Link>
                    <Link
                      href="/products"
                      className="py-2 hover:text-green-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Products
                    </Link>
                    <Link href="/about" className="py-2 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>
                      About
                    </Link>
                    <Link
                      href="/contact"
                      className="py-2 hover:text-green-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                    {auth ? (
                      <>
                        <Link href={`/profile/${auth.id}`} className="py-2 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>
                          My Profile
                        </Link>
                        <button className="py-2 text-left hover:text-green-600" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" className="py-2 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>
                          Login
                        </Link>
                        <Link href="/signup" className="py-2 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>
                          Sign Up
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <SearchDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
    </>
  )
}
