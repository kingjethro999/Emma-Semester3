"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Copy, Check, ShoppingBag } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { checkoutAPI } from "@/lib/api"
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

export default function CheckoutPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    paymentMethod: "bank-transfer",
  })
  const [copiedOpay, setCopiedOpay] = useState(false)
  const [copiedMonie, setCopiedMonie] = useState(false)
  const { cart, loading, error, refreshCart } = useCart()

  // Redirect if not logged in or cart is empty
  if (!loading && !error && (!cart || !cart.items || cart.items.length === 0)) {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return null
    }
    router.push("/cart")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("auth_token") || ""
      
      // Create order from cart
      const orderData = await checkoutAPI.createFromCart(token)
      
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your order. We'll process it right away!",
      })
      
      // Redirect to order confirmation or profile
      router.push(`/profile/${orderData.userId || 'me'}`)
      
    } catch (e: any) {
      console.error("Checkout failed:", e)
      toast({
        title: "Checkout failed",
        description: e?.message || "Could not place order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading checkout...</p>
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
          <div className="space-x-4">
            <Button onClick={refreshCart} className="bg-green-600 hover:bg-green-700">
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/cart">Back to Cart</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Calculate totals
  const shipping = cart.subtotal > 20000 ? 0 : 1500
  const total = cart.total + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/cart" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Enter your shipping details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={formData.paymentMethod} onValueChange={handleRadioChange} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                    <Label htmlFor="bank-transfer">Bank Transfer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pay-on-delivery" id="pay-on-delivery" />
                    <Label htmlFor="pay-on-delivery">Pay on Delivery</Label>
                  </div>
                </RadioGroup>

                {formData.paymentMethod === "bank-transfer" && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">OPay</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => copyToClipboard("6102086969", "opay")}
                          type="button"
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
                          type="button"
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
                  </div>
                )}
              </CardContent>
            </Card>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={submitting}>
              {submitting ? "Placing Order..." : "Place Order"}
            </Button>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="divide-y">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="py-2 flex justify-between">
                      <div>
                        <p className="font-medium">
                          {item.name} <span className="text-gray-500">x{item.quantity}</span>
                        </p>
                      </div>
                      <p className="font-medium">₦{(item.unitPrice * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{cart.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₦${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
