"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ArrowRight, ShoppingBag, Copy, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"

interface CartItem {
  productId: number
  name: string
  unitPrice: number
  quantity: number
  image?: string
}

interface Cart {
  items: CartItem[]
  total: number
  subtotal: number
}

export default function CartPage() {
  const [updating, setUpdating] = useState<Set<number>>(new Set())
  const [copiedOpay, setCopiedOpay] = useState(false)
  const [copiedMonie, setCopiedMonie] = useState(false)
  const { cart, loading, error, updateItem, removeItem, refreshCart } = useCart()

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setUpdating(prev => new Set([...prev, productId]))
      await updateItem(productId, newQuantity)
    } catch (e: any) {
      // Error handling is done in the cart context
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (productId: number) => {
    try {
      setUpdating(prev => new Set([...prev, productId]))
      await removeItem(productId)
    } catch (e: any) {
      // Error handling is done in the cart context
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const copyToClipboard = (text: string, type: "opay" | "monie") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "opay") {
        setCopiedOpay(true)
        setTimeout(() => setCopiedOpay(false), 2000)
      } else {
        setCopiedMonie(true)
        setTimeout(() => setCopiedMonie(false), 2000)
      }

      toast({
        title: "Copied to clipboard",
        description: `Account number copied: ${text}`,
      })
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={refreshCart} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/products">Shop at Nwigwe Loveth Ginikiwa</Link>
          </Button>
        </div>
      </div>
    )
  }

  const shipping = cart.subtotal > 20000 ? 0 : 1500
  const total = cart.total + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.productId} className="py-4 flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.productId}`} className="text-lg font-medium hover:text-green-600">
                        {item.name}
                      </Link>
                      <p className="text-green-600 font-semibold mt-1">₦{item.unitPrice.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center ml-4">
                      <button
                        className="w-8 h-8 flex items-center justify-center border rounded-l-md disabled:opacity-50"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={updating.has(item.productId)}
                      >
                        -
                      </button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, Number.parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-center border-y rounded-none"
                        min="1"
                        disabled={updating.has(item.productId)}
                      />
                      <button
                        className="w-8 h-8 flex items-center justify-center border rounded-r-md disabled:opacity-50"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={updating.has(item.productId)}
                      >
                        +
                      </button>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-semibold">₦{(item.unitPrice * item.quantity).toLocaleString()}</p>
                      <button 
                        className="text-red-500 hover:text-red-700 mt-1 disabled:opacity-50" 
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={updating.has(item.productId)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₦{cart.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₦${shipping.toLocaleString()}`}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <div className="text-center mt-4">
                <Link href="/products" className="text-green-600 hover:text-green-700 text-sm">
                  Continue Shopping
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Make payment to any of these accounts after placing your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">OPay</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => copyToClipboard("6102086969", "opay")}
                  >
                    {copiedOpay ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-lg font-mono">6102086969</p>
                <p className="text-sm text-gray-500 mt-1">Account Name: Nwigwe Loveth Ginikiwa</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Moniepoint</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => copyToClipboard("5016467015", "monie")}
                  >
                    {copiedMonie ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-lg font-mono">5016467015</p>
                <p className="text-sm text-gray-500 mt-1">Account Name: Nwigwe Loveth Ginikiwa</p>
              </div>

              <div className="text-sm text-gray-500 mt-2">
                <p>After making payment, please send your payment receipt to our WhatsApp: +234 123 456 7890</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
