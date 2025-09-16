"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { cartAPI } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

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

interface CartContextType {
  cart: Cart | null
  loading: boolean
  error: string | null
  itemCount: number
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateItem: (productId: number, quantity: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshCart = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setCart(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await cartAPI.get(token)
      setCart(data)
    } catch (e: any) {
      console.error("Failed to load cart:", e)
      setError(e?.message || "Failed to load cart")
      setCart(null)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (productId: number, quantity: number = 1) => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast({ title: "Login required", description: "Please login to add items to cart." })
      throw new Error("Login required")
    }

    try {
      await cartAPI.add(productId, quantity, token)
      await refreshCart()
      toast({ title: "Added to cart", description: "Item has been added to your cart." })
    } catch (e: any) {
      console.error("Failed to add item:", e)
      toast({ title: "Failed to add", description: e?.message || "Could not add to cart" })
      throw e
    }
  }

  const updateItem = async (productId: number, quantity: number) => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast({ title: "Login required", description: "Please login to update cart." })
      throw new Error("Login required")
    }

    try {
      if (quantity === 0) {
        await cartAPI.remove(productId, token)
      } else {
        await cartAPI.update(productId, quantity, token)
      }
      await refreshCart()
    } catch (e: any) {
      console.error("Failed to update item:", e)
      toast({ title: "Update failed", description: e?.message || "Could not update cart" })
      throw e
    }
  }

  const removeItem = async (productId: number) => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast({ title: "Login required", description: "Please login to update cart." })
      throw new Error("Login required")
    }

    try {
      await cartAPI.remove(productId, token)
      await refreshCart()
      toast({ title: "Item removed", description: "Item has been removed from your cart" })
    } catch (e: any) {
      console.error("Failed to remove item:", e)
      toast({ title: "Remove failed", description: e?.message || "Could not remove item" })
      throw e
    }
  }

  const clearCart = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast({ title: "Login required", description: "Please login to clear cart." })
      throw new Error("Login required")
    }

    try {
      await cartAPI.clear(token)
      await refreshCart()
      toast({ title: "Cart cleared", description: "Your cart has been cleared" })
    } catch (e: any) {
      console.error("Failed to clear cart:", e)
      toast({ title: "Clear failed", description: e?.message || "Could not clear cart" })
      throw e
    }
  }

  // Load cart on mount and when auth token changes
  useEffect(() => {
    refreshCart()
  }, [])

  // Listen for auth token changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        if (e.newValue) {
          refreshCart()
        } else {
          setCart(null)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const value: CartContextType = {
    cart,
    loading,
    error,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

