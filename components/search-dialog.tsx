"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { productsAPI } from "@/lib/api"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Update search results when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const term = searchTerm.toLowerCase().trim()
    const results = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term),
    )

    setSearchResults(results)
  }, [searchTerm, allProducts])

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("")
      setSearchResults([])
    }
  }, [open])

  // Load products lazily when dialog opens
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const items = await productsAPI.getAll("all")
        setAllProducts(items || [])
      } catch (e) {
        console.error("Failed to load products for search", e)
      } finally {
        setLoading(false)
      }
    }
    if (open && allProducts.length === 0) {
      load()
    }
  }, [open, allProducts.length])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center">Search Products</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search for products..."
              className="pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : searchTerm && searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found for "{searchTerm}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-100"
                    onClick={() => onOpenChange(false)}
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      <p className="text-sm font-semibold text-green-600">₦{product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
