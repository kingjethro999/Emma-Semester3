"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface QuickViewProps {
  product: {
    id: number
    name: string
    price: number
    image: string
    category: string
    description: string
    stock?: number
    discount?: number
  }
  isOpen: boolean
  onClose: () => void
}

export function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  // Calculate discount price if applicable
  const discountedPrice = product.discount ? product.price - (product.price * product.discount) / 100 : null

  const handleAddToCart = () => {
    setIsAdding(true)

    // Simulate adding to cart
    setTimeout(() => {
      setIsAdding(false)
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
      })
      onClose()
    }, 600)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product.stock || 10)) {
      setQuantity(newQuantity)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>

          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 capitalize">{product.category}</DialogDescription>
            </DialogHeader>

            {/* Price */}
            <div className="mt-3">
              {discountedPrice ? (
                <div className="flex items-center">
                  <p className="text-xl text-green-600 font-bold">₦{discountedPrice.toLocaleString()}</p>
                  <p className="text-sm text-gray-400 line-through ml-2">₦{product.price.toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-xl text-green-600 font-bold">₦{product.price.toLocaleString()}</p>
              )}
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-700 line-clamp-3">{product.description}</p>

            {/* Stock */}
            <p className="mt-3 text-sm">
              <span className={product.stock && product.stock > 10 ? "text-green-600" : "text-orange-500"}>
                {product.stock && product.stock > 10 ? "In Stock" : "Low Stock"} ({product.stock} available)
              </span>
            </p>

            {/* Quantity */}
            <div className="mt-4">
              <label htmlFor="quick-view-quantity" className="text-sm font-medium block mb-2">
                Quantity:
              </label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="rounded-r-none h-9 w-9"
                >
                  -
                </Button>
                <input
                  type="number"
                  id="quick-view-quantity"
                  min="1"
                  max={product.stock || 10}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                  className="w-12 h-9 text-center border-y"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (product.stock || 10)}
                  className="rounded-l-none h-9 w-9"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAddToCart} disabled={isAdding}>
                {isAdding ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </>
                )}
              </Button>
              <Button asChild variant="outline">
                <Link href={`/products/${product.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
