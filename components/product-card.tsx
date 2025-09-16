"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, Check } from "lucide-react"
import { QuickView } from "@/components/quick-view"
import { useCart } from "@/hooks/use-cart"

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    image: string
    category: string
    description: string
    stock?: number
    discount?: number
    isNew?: boolean
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setIsAdding(true)
      await addItem(product.id, 1)
    } catch (err: any) {
      // Error handling is done in the cart context
      if (err?.message === "Login required") {
        window.location.href = "/login"
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowQuickView(true)
  }

  // Calculate discount price if applicable
  const discountedPrice = product.discount ? product.price - (product.price * product.discount) / 100 : null

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
        <div className="relative">
          <Link href={`/products/${product.id}`}>
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Quick action buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Quick view</span>
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>}
            {product.discount && <Badge className="bg-red-500 hover:bg-red-600">{product.discount}% OFF</Badge>}
            {product.stock && product.stock < 5 && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                Low Stock
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="text-sm text-gray-500 mb-1 capitalize">{product.category}</div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-lg mb-2 hover:text-green-600 transition-colors line-clamp-2 min-h-[3.5rem]">
              {product.name}
            </h3>
          </Link>

          <div className="mt-auto flex items-center">
            {discountedPrice ? (
              <>
                <p className="text-green-600 font-bold">₦{discountedPrice.toLocaleString()}</p>
                <p className="text-gray-400 line-through ml-2 text-sm">₦{product.price.toLocaleString()}</p>
              </>
            ) : (
              <p className="text-green-600 font-bold">₦{product.price.toLocaleString()}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="mt-auto p-4 pt-0">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              className="bg-green-600 hover:bg-green-700 transition-all"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? <Check className="mr-1 h-4 w-4" /> : <ShoppingCart className="mr-1 h-4 w-4" />}
              {isAdding ? "Added" : "Add"}
            </Button>
            <Button variant="outline" onClick={handleQuickView}>
              <Eye className="mr-1 h-4 w-4" /> View
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showQuickView && <QuickView product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />}
    </>
  )
}
