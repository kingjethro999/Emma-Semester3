"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { ProductCard } from "@/components/product-card"
import { productsAPI } from "@/lib/api"

export default function HouseholdItemsPage() {
  const [sortOption, setSortOption] = useState("featured")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const items = await productsAPI.getAll("household-items")
        setProducts(items)
      } catch (e: any) {
        console.error(e)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter products to get only household items
  const householdItems = products

  // Sort products based on selected option
  const sortedProducts = [...householdItems].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "newest":
        return b.id - a.id
      default: // featured
        return 0
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex justify-start">
        <Button variant="outline" asChild className="flex items-center">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Breadcrumb
        items={[
          { label: "Home", href: "/", active: false },
          { label: "Categories", href: "/categories", active: false },
          { label: "Household Items", href: "/categories/household-items", active: true },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Household Items</h1>
        <p className="text-gray-600">
          Browse our extensive selection of over 25 quality household items including detergents, cleaning supplies, and
          everyday essentials for all your home cleaning needs.
        </p>
      </div>

      {loading && <p className="text-center text-gray-500 mb-6">Loading products...</p>}
      {error && <p className="text-center text-red-600 mb-6">{error}</p>}

      {/* Featured Product */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/3">
            <div className="relative aspect-square">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-19%20at%202.30.07%20AM-1BRhT4jEWsbsiGV6FON2alHouGuKsY.jpeg"
                alt="WAW Detergent"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
              Featured Product
            </span>
            <h2 className="text-2xl font-bold mb-2">WAW Detergent (1kg)</h2>
            <p className="text-gray-700 mb-4">
              Multi-use detergent powder that washes a lot and saves a lot. Suitable for clothes, dishes, floors, and
              more. WAW is designed to provide excellent cleaning power while being economical for everyday use.
            </p>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-green-600 mr-2">₦1,100</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">In Stock</span>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/products/19">View Product</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* All Household Items */}
      <h2 className="text-2xl font-bold mb-6">All Household Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
